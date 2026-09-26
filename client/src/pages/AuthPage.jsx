import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowRight, Eye, EyeOff, ShieldCheck, Package, Boxes, Truck, MailOpen } from 'lucide-react';
import { api, errorMessage } from '../api/client';
import { signedIn } from '../store';
import { Alert, Field, Logo } from '../components/ui';
export default function AuthPage({ mode }) {
  const navigate = useNavigate(), dispatch = useDispatch();
  const [form, setForm] = useState(mode === 'login' ? { loginId: 'admin01', password: 'StockSense@123' } : {});
  const [step, setStep] = useState(0), [error, setError] = useState(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [show, setShow] = useState(false), [otp, setOtp] = useState('');
  const set = key => e => setForm({ ...form, [key]: e.target.value });
  const input = (key, label, type = 'text', extra = {}) => <Field label={label} required>{key === 'otp' ? <div className="otp-control"><div className="otp-boxes" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <span key={i}>{(form.otp || '')[i] || ''}</span>)}</div><input required type={type} value={form[key] || ''} onChange={set(key)} {...extra}/></div> : <input required type={type} value={form[key] || ''} onChange={set(key)} {...extra}/>}</Field>;
  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      if (mode === 'login') { const { data } = await api.post('/auth/login', form); sessionStorage.setItem('stocksense-token', data.token); dispatch(signedIn(data.user)); navigate('/'); }
      if (mode === 'signup') { await api.post('/auth/signup', form); navigate('/login?created=1'); }
      if (mode === 'forgot') {
        if (step === 0) { const { data } = await api.post('/auth/forgot-password', form); setOtp(data.demoOtp); setStep(1); setMessage(data.message); }
        if (step === 1) { const { data } = await api.post('/auth/verify-otp', form); setForm({ ...form, resetToken: data.resetToken }); setStep(2); setMessage('Email verified. Choose your new password.'); }
        if (step === 2) { const { data } = await api.post('/auth/reset-password', form); setMessage(data.message); setStep(3); }
      }
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  const title = mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Your Account' : ['Forgot your password?', 'Reset Your Password', 'A fresh start.', 'You’re all set.'][step];
  return <div className={`auth-shell ${mode === 'forgot' ? 'auth-reset' : ''}`}><div className="auth-left"><Logo/><div className="auth-form-wrap">{mode === 'forgot' && <div className="reset-envelope"><MailOpen size={47}/></div>}<h1>{title}</h1><p className="auth-subtitle">{mode === 'login' ? 'Sign in to your account to continue.' : mode === 'signup' ? 'Start managing your inventory with confidence.' : 'Get back to your StockSense workspace.'}</p><Alert>{error}</Alert><Alert success>{message || (location.search.includes('created') ? 'Account created. Sign in to continue.' : '')}</Alert><form onSubmit={submit}>
      {mode === 'signup' && input('name', 'Full Name', 'text', { autoComplete: 'name' })}
      {mode !== 'forgot' && input('loginId', 'Login ID', 'text', { autoComplete: 'username', placeholder: '6–12 characters', ...(mode === 'signup' ? { minLength: 6, maxLength: 12 } : {}) })}
      {(mode === 'signup' || (mode === 'forgot' && step === 0)) && input('email', 'Email address', 'email', { autoComplete: 'email', placeholder: 'you@company.com' })}
      {(mode !== 'forgot' || step === 2) && <Field label="Password" required hint={mode !== 'login' ? 'More than 8 characters, with lowercase, uppercase, and a special character.' : ''}><div className="password-input"><input required type={show ? 'text' : 'password'} value={form.password || ''} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'}/><button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}>{show ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></Field>}
      {(mode === 'signup' || (mode === 'forgot' && step === 2)) && input('confirmPassword', 'Re-Enter Password', 'password', { autoComplete: 'new-password' })}
      {mode === 'forgot' && step === 1 && <><div className="demo-note">Demo inbox · Your OTP is <strong>{otp}</strong></div>{input('otp', '6-digit OTP', 'text', { inputMode: 'numeric', pattern: '[0-9]{6}', maxLength: 6, autoComplete: 'one-time-code', className: 'otp-input', placeholder: '000000' })}<button className="text-button" type="button" disabled={busy} onClick={async () => { setBusy(true); try { const { data } = await api.post('/auth/forgot-password', { email: form.email }); setOtp(data.demoOtp); setMessage('A new OTP has been generated.'); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } }}>Resend OTP</button></>}
      {mode === 'login' && <div className="forgot-link"><Link to="/forgot-password">Forgot password?</Link></div>}
      {step !== 3 && <button className="button primary auth-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : ['Send OTP', 'Verify OTP', 'Reset Password'][step]}<ArrowRight size={17}/></button>}
    </form><p className="auth-switch">{mode === 'login' ? <>Don’t have an account? <Link to="/signup">Sign Up</Link></> : <>Already have an account? <Link to="/login">Sign In</Link></>}</p>{mode === 'login' && <div className="demo-note"><ShieldCheck size={17}/><span>Demo workspace ready to explore.<br/><strong>admin01</strong> / <strong>StockSense@123</strong></span></div>}</div><small className="auth-copyright">© {new Date().getFullYear()} StockSense. Keep business moving.</small></div><aside className="auth-visual"><div className="auth-photo-overlay"/><div className="auth-visual-copy"><h2>Smarter<br/>Inventory<br/>for Growing<br/>Businesses.</h2><p>Everything in its place.<br/>Every movement in control.</p><div className="auth-slide-dots"><i/><i className="active"/><i/></div></div></aside></div>;
}
