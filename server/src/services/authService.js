import { randomUUID, randomInt } from 'node:crypto';
import { ensure } from '../utils/errors.js';
export const publicUser = ({ passwordHash, ...user }) => user;
export const passwordError = 'Password must be more than 8 characters and contain 1 lowercase, 1 uppercase, and 1 special character.';
export function validatePassword(password) {
  ensure(typeof password === 'string' && password.length > 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[^a-zA-Z0-9\s]/.test(password), passwordError);
}
export function createAuthService(repo) {
  function uniquePassword(password, exceptId) { ensure(!repo.all('users').some(u => u.id !== exceptId && u.passwordHash === `mock:${password}`), 'Password must be unique.'); }
  return {
    signup({ loginId = '', email = '', password, confirmPassword, name }) {
      loginId = loginId.trim(); email = email.trim().toLowerCase();
      ensure(loginId.length >= 6 && loginId.length <= 12, 'Login ID must be 6–12 characters.');
      ensure(!repo.all('users').some(u => u.loginId.toLowerCase() === loginId.toLowerCase()), 'Login ID already exists.');
      ensure(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Enter a valid email address.');
      ensure(!repo.all('users').some(u => u.email === email), 'Email already exists.');
      validatePassword(password); ensure(password === confirmPassword, 'Passwords do not match.'); uniquePassword(password);
      return publicUser(repo.insert('users', { loginId, email, passwordHash: `mock:${password}`, name: name?.trim() || loginId, role: 'Inventory Manager' }));
    },
    login({ loginId, password }) {
      const user = repo.all('users').find(u => u.loginId.toLowerCase() === String(loginId).trim().toLowerCase() && u.passwordHash === `mock:${password}`);
      ensure(user, 'Invalid Login Id or Password', 401);
      const token = randomUUID(); repo.insert('sessions', { token, userId: user.id });
      return { token, user: publicUser(user) };
    },
    authenticate(token) { const session = repo.all('sessions').find(s => s.token === token); return session && repo.get('users', session.userId); },
    logout(token) { repo.data.sessions = repo.all('sessions').filter(s => s.token !== token); },
    requestOtp({ email }) {
      const user = repo.all('users').find(u => u.email === String(email).trim().toLowerCase()); ensure(user, 'No account found for this email.');
      repo.data.resets = repo.all('resets').filter(r => r.userId !== user.id);
      const otp = String(randomInt(100000, 1000000)); repo.insert('resets', { userId: user.id, otp, expires: Date.now() + 600000, verified: false });
      return { message: 'Demo OTP generated. Valid for 10 minutes.', demoOtp: otp };
    },
    verifyOtp({ email, otp }) {
      const user = repo.all('users').find(u => u.email === String(email).trim().toLowerCase());
      const reset = repo.all('resets').find(r => r.userId === user?.id && r.otp === otp && r.expires > Date.now());
      ensure(reset, 'Invalid or expired OTP.'); reset.verified = true; reset.resetToken = randomUUID(); return { resetToken: reset.resetToken };
    },
    resetPassword({ resetToken, password, confirmPassword }) {
      const reset = repo.all('resets').find(r => r.resetToken === resetToken && r.verified && r.expires > Date.now()); ensure(reset, 'Invalid or expired reset session.');
      validatePassword(password); ensure(password === confirmPassword, 'Passwords do not match.'); uniquePassword(password);
      repo.update('users', reset.userId, { passwordHash: `mock:${password}` });
      repo.data.resets = repo.all('resets').filter(r => r.id !== reset.id);
      repo.data.sessions = repo.all('sessions').filter(s => s.userId !== reset.userId);
      return { message: 'Password updated. Sign in with your new password.' };
    },
    profile(user, { name, email }) {
      email = String(email).trim().toLowerCase(); ensure(name?.trim(), 'Full name is required.');
      ensure(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Enter a valid email address.');
      ensure(!repo.all('users').some(u => u.id !== user.id && u.email === email), 'Email already exists.');
      return publicUser(repo.update('users', user.id, { name: name.trim(), email }));
    },
  };
}
