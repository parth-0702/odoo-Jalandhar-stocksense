import { auth } from '../services/index.js';
import { ensure } from '../utils/errors.js';
export function authenticate(req, res, next) {
  req.token = req.headers.authorization?.replace(/^Bearer /, '');
  req.user = auth.authenticate(req.token); ensure(req.user, 'Sign in to continue.', 401); next();
}
