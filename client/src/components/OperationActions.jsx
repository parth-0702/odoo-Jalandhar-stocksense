import { Link } from 'react-router-dom';
import { Check, Printer, PackageCheck, PackageOpen, ArrowRight } from 'lucide-react';
import { canManageOperation } from '../config/permissions';
export function OperationActions({ module, form, isNew, dirty, busy, user, transition }) {
  const manage = canManageOperation(user, module), ready = form.status === 'Ready';
  return <div className="document-actions">
    {!isNew && manage && form.status === 'Draft' && <button disabled={busy || dirty} className="button primary" onClick={() => transition('todo')}>TODO · Mark Ready</button>}
    {form.status === 'Waiting' && <button disabled={busy} className="button primary" onClick={() => transition('check')}>Check Availability</button>}
    {module === 'deliveries' && ready && !form.pickedAt && <button className="button primary" disabled={busy} onClick={() => transition('pick')}><PackageOpen size={16}/>Mark Picked</button>}
    {module === 'deliveries' && ready && form.pickedAt && !form.packedAt && <button className="button primary" disabled={busy} onClick={() => transition('pack')}><PackageCheck size={16}/>Mark Packed</button>}
    {ready && manage && <button disabled={busy || module === 'deliveries' && !form.packedAt} className="button primary" onClick={() => transition('validate')}><Check size={16}/>Validate</button>}
    <button className="button" disabled={form.status !== 'Done'} onClick={() => window.print()}><Printer size={15}/>Print</button>
    {module === 'receipts' && form.status === 'Done' && <Link className="button primary" to={`/transfers/new?receipt=${form.id}`}>Put Away Stock<ArrowRight size={15}/></Link>}
    {!isNew && manage && !['Done', 'Canceled'].includes(form.status) && <button className="button danger-quiet" disabled={busy} onClick={() => transition('cancel')}>Cancel</button>}
  </div>;
}
export function OperationGuide({ module, form, user }) {
  const manage = canManageOperation(user, module);
  let text = form.status === 'Draft' ? 'Add your details, save the draft, then use TODO to mark it ready. Stock changes only when you validate.' : form.status === 'Waiting' ? 'Waiting for stock at the selected source location. Receive or transfer stock there, then check availability.' : form.status === 'Done' ? 'Completed. Stock and Move History are updated.' : form.status === 'Canceled' ? 'Canceled. This document cannot change stock.' : 'Review the quantities, then validate when the physical work is complete.';
  if (module === 'deliveries' && form.status === 'Ready') text = !form.pickedAt ? 'Collect every product and quantity listed below from the source location, then mark the order Picked.' : !form.packedAt ? 'Items are picked. Pack and label the goods, then mark the order Packed.' : manage ? 'Picking and packing are complete. Validate when the goods leave your warehouse.' : 'Picking and packing are complete. An Inventory Manager can now validate the delivery.';
  if (module === 'receipts' && form.status === 'Done') text += ' Use Put Away Stock to move received goods to a shelf or rack.';
  if (module === 'adjustments' && form.status === 'Draft') text = 'Enter the quantity you actually counted—not the difference. Save, mark ready, then validate to record the correction.';
  return <div className="flow-hint"><p>{text}</p>{module === 'deliveries' && <div className="fulfillment-steps">{[['Pick items', form.pickedAt], ['Pack items', form.packedAt], ['Deliver', form.status === 'Done']].map(([label, done], i) => <span key={label} className={done ? 'complete' : ''}><i>{done ? <Check size={12}/> : i + 1}</i>{label}</span>)}</div>}</div>;
}
