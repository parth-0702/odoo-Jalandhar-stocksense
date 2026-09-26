export function createLedgerService(repo) {
  return {
    ledger() {
      return (repo.all('ledger') || []).map(l => {
        const doc = repo.get('documents', l.relatedDocument) || {};
        const prod = repo.get('products', l.product);
        return {
          ...l,
          reference: doc.reference || l.reference || 'REF-LOG',
          contact: doc.contact || 'Direct Adjustment',
          status: doc.status || 'Done',
          scheduleDate: doc.scheduleDate || (l.timestamp ? l.timestamp.slice(0, 10) : ''),
          productName: prod ? prod.name : (l.productName || 'General Product'),
        };
      }).reverse();
    },
  };
}
