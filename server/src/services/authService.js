import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID, randomInt } from 'node:crypto';
import { ensure } from '../utils/errors.js';
import { STAFF, ROLES, MANAGER, requireManager } from '../domain/permissions.js';
const ROUNDS = 8;
const secret = () => process.env.JWT_SECRET || 'stocksense-dev-secret';
export const publicUser = ({ passwordHash, ...user }) => user;
export const passwordError = 'Password must be more than 8 characters and contain 1 lowercase, 1 uppercase, and 1 special character.';
export function validatePassword(password) {
  ensure(typeof password === 'string' && password.length > 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[^a-zA-Z0-9\s]/.test(password), passwordError);
}
export function hashPassword(password) { return bcrypt.hashSync(password, ROUNDS); }
export function createAuthService(repo) {
  function uniquePassword(password, exceptId) {
    ensure(!repo.all('users').some(u => u.id !== exceptId && bcrypt.compareSync(password, u.passwordHash)), 'Password must be unique.');
  }
  return {
    async signup({ loginId = '', email = '', password, confirmPassword, name }) {
      loginId = loginId.trim(); email = email.trim().toLowerCase();
      ensure(loginId.length >= 6 && loginId.length <= 12, 'Login ID must be 6–12 characters.');
      ensure(!repo.all('users').some(u => u.loginId.toLowerCase() === loginId.toLowerCase()), 'Login ID already exists.');
      ensure(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Enter a valid email address.');
      ensure(!repo.all('users').some(u => u.email === email), 'Email already exists.');
      validatePassword(password); ensure(password === confirmPassword, 'Passwords do not match.'); uniquePassword(password);
      return publicUser(await repo.insert('users', { loginId, email, passwordHash: hashPassword(password), name: name?.trim() || loginId, role: STAFF }));
    },
    async login({ loginId, password }) {
      const user = repo.all('users').find(u => u.loginId.toLowerCase() === String(loginId || '').trim().toLowerCase());
      const matches = user && typeof password === 'string' && bcrypt.compareSync(password, user.passwordHash);
      ensure(matches, 'Invalid Login Id or Password', 401);
      const token = jwt.sign({ sub: user.id }, secret(), { expiresIn: '12h', jwtid: randomUUID() });
      await repo.insert('sessions', { token, userId: user.id });
      return { token, user: publicUser(user) };
    },
    async authenticate(token) {
      if (!token) return;
      try {
        const payload = jwt.verify(token, secret());
        const session = repo.all('sessions').find(s => s.token === token && s.userId === payload.sub);
        return session ? publicUser(repo.get('users', payload.sub)) : undefined;
      } catch { return; }
    },
    async logout(token) { await repo.deleteWhere('sessions', s => s.token === token); },
    async requestOtp({ email }) {
      const user = repo.all('users').find(u => u.email === String(email).trim().toLowerCase());
      ensure(user, 'No account found for this email.');
      return repo.transaction(async () => {
        await repo.deleteWhere('resets', r => r.userId === user.id);
        const otp = String(randomInt(100000, 1000000));
        await repo.insert('resets', { userId: user.id, otp, expires: Date.now() + 600000, verified: false });
        return { message: 'Demo OTP generated. Valid for 10 minutes.', demoOtp: otp };
      });
    },
    async verifyOtp({ email, otp }) {
      const user = repo.all('users').find(u => u.email === String(email).trim().toLowerCase());
      const reset = repo.all('resets').find(r => r.userId === user?.id && r.otp === otp && r.expires > Date.now());
      ensure(reset, 'Invalid or expired OTP.');
      const resetToken = randomUUID();
      await repo.update('resets', reset.id, { verified: true, resetToken });
      return { resetToken };
    },
    async resetPassword({ resetToken, password, confirmPassword }) {
      const reset = repo.all('resets').find(r => r.resetToken === resetToken && r.verified && r.expires > Date.now());
      ensure(reset, 'Invalid or expired reset session.');
      validatePassword(password); ensure(password === confirmPassword, 'Passwords do not match.'); uniquePassword(password);
      return repo.transaction(async () => {
        await repo.update('users', reset.userId, { passwordHash: hashPassword(password) });
        await repo.deleteWhere('resets', r => r.id === reset.id);
        await repo.deleteWhere('sessions', s => s.userId === reset.userId);
        return { message: 'Password updated. Sign in with your new password.' };
      });
    },
    team(user) { requireManager(user); return repo.all('users').map(publicUser); },
    async setRole(user, id, role) {
      requireManager(user);
      ensure(ROLES.includes(role), 'Select Inventory Manager or Warehouse Staff.');
      return repo.transaction(async () => {
        const account = repo.get('users', id); ensure(account, 'User not found.', 404);
        ensure(account.id !== user.id, 'Ask another manager to change your own role.');
        ensure(!(account.role === MANAGER && role !== MANAGER && repo.all('users').filter(u => u.role === MANAGER).length <= 1), 'Keep at least one Inventory Manager.');
        return publicUser(await repo.update('users', id, { role }));
      });
    },
    async profile(user, { name, email }) {
      email = String(email).trim().toLowerCase();
      ensure(name?.trim(), 'Full name is required.');
      ensure(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Enter a valid email address.');
      ensure(!repo.all('users').some(u => u.id !== user.id && u.email === email), 'Email already exists.');
      return publicUser(await repo.update('users', user.id, { name: name.trim(), email }));
    },
  };
}
