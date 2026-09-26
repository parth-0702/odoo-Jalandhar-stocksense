import { auth } from '../services/index.js';
import { ensure } from '../utils/errors.js';
export async function authenticate(req, res, next) {
  try {
    req.token = req.headers.authorization?.replace(/^Bearer /, '') || '';
    req.user = await auth.authenticate(req.token);
    ensure(req.user, 'Sign in to continue.', 401);
    next();
  } catch (error) { next(error); }
}
