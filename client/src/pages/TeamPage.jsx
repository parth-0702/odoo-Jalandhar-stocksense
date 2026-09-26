import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useApi } from '../hooks/useApi';
import { api, errorMessage } from '../api/client';
import { Alert, Loading, PageHeader, Table } from '../components/ui';
export default function TeamPage() {
  const { data, loading, error, refresh } = useApi('/auth/team');
  const user = useSelector(s => s.auth.user);
  const [busy, setBusy] = useState(''), [message, setMessage] = useState(''), [failure, setFailure] = useState('');
  async function updateRole(account, role) { setBusy(account.id); setMessage(''); setFailure(''); try { await api.put(`/auth/team/${account.id}/role`, { role }); setMessage(`${account.name} is now ${role}.`); refresh(); } catch (e) { setFailure(errorMessage(e)); } finally { setBusy(''); } }
  return <><PageHeader title="Team" subtitle="One login page. The right access for each person."/><div className="flow-hint"><strong>Adding a teammate</strong><p>Ask them to sign up. They start as Warehouse Staff. Change their role here if they also manage receipts, deliveries, products, or settings.</p></div><Alert>{error || failure}</Alert><Alert success>{message}</Alert>{loading ? <Loading/> : <section className="panel"><Table columns={['Name', 'Login ID', 'Email', 'Role']} rows={data || []} renderRow={account => <tr key={account.id}><td><strong>{account.name}</strong>{account.id === user.id && <small> (you)</small>}</td><td>{account.loginId}</td><td>{account.email}</td><td><select aria-label={`Role for ${account.name}`} disabled={account.id === user.id || Boolean(busy)} value={account.role} onChange={e => updateRole(account, e.target.value)}><option>Warehouse Staff</option><option>Inventory Manager</option></select></td></tr>}/></section>}<div className="role-explainer"><div><h2>Inventory Manager</h2><p>Manage products, warehouses, receipts and deliveries. Can also do all warehouse tasks.</p></div><div><h2>Warehouse Staff</h2><p>View inventory, pick and pack deliveries, transfer and shelve goods, and count or adjust stock.</p></div></div></>;
}
