import { ensure } from './errors.js';
export const findRecord = (repo, collection, id) => {
  const item = repo.get(collection, id);
  ensure(item, `${collection} record not found.`, 404);
  return item;
};
