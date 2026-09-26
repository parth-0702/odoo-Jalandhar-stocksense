import { ensure } from './errors.js';
export const numeric = (value, label, zero = true) => {
  const n = Number(value);
  ensure(value !== '' && value != null && Number.isFinite(n) && (zero ? n >= 0 : n > 0), `${label} must be ${zero ? 'zero or greater' : 'greater than zero'}.`);
  return n;
};
