import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { api, errorMessage } from '../api/client';
import { signedIn } from '../store';
import { Alert, Field, PageHeader } from '../components/ui';
export default function ProfilePage() {
  const user = useSelector(s => s.auth.user), dispatch = useDispatch();
  const [form, setForm] = useState({ name: user.name, email: user.email }), [error, setError] = useState(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  async function save(e) { e.preventDefault(); setBusy(true); setError(''); setMessage(''); try { const { data } = await api.put('/auth/me', form); dispatch(signedIn(data)); setMessage('Your profile has been updated.'); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } }
  return <><PageHeader title="My Profile" subtitle="Manage your account details and how your team sees you."/><section className="panel profile-panel"><div className="profile-hero"><span className="avatar large">A</span><div><h2>{user.name}</h2><p>{user.role}</p><small>{user.email}</small></div></div><form onSubmit={save}><Alert>{error}</Alert><Alert success>{message}</Alert><div className="form-grid"><Field label="Full Name" required><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></Field><Field label="Role"><input disabled value={user.role}/></Field><Field label="Email" required><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/></Field><Field label="Login ID"><input disabled value={user.loginId}/></Field></div><footer className="form-footer"><button disabled={busy} className="button primary">{busy ? 'Saving…' : 'Save Changes'}</button></footer></form></section></>;
}
