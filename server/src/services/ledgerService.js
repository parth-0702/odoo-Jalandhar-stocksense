import { findRecord } from '../utils/records.js';
export function createLedgerService(repo) {
  return {
    ledger() {
      return repo.all('ledger').map(l => {
        const doc = findRecord(repo, 'documents', l.relatedDocument);
        return { ...l, reference: doc.reference, contact: doc.contact, status: doc.status, scheduleDate: doc.scheduleDate, productName: findRecord(repo, 'products', l.product).name };
      }).reverse();
    },
  };
}
