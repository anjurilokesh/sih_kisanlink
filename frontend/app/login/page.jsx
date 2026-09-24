'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ identifier: '', password: '', otp: '' });
  const [challenge, setChallenge] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submitCredentials = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/verification/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: form.identifier, password: form.password }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Unable to login.');
      setChallenge(payload);
      setMessage(payload.demoMode ? `Local demo OTP: ${payload.demoOtp}` : payload.message);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/verification/login/${challenge.verificationId}/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ otp: form.otp }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Login verification failed.');
      localStorage.setItem('kisanlink-token', payload.token);
      setUser({ ...payload.user, loggedIn: true });
      router.push('/dashboard');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6 text-center"><p className="text-sm font-bold uppercase tracking-[0.15em] text-brand-700">Secure access</p><h1 className="mt-2 text-3xl font-black text-slate-900">Login</h1><p className="mt-2 text-sm text-slate-600">Credentials and a one-time verification code are required.</p></div>
        {!challenge ? <form onSubmit={submitCredentials} className="space-y-4"><div><label className="label" htmlFor="identifier">Mobile or email</label><input id="identifier" required value={form.identifier} onChange={(event) => update('identifier', event.target.value)} placeholder="name@example.com or mobile" className="w-full" /></div><div><label className="label" htmlFor="password">Password</label><input id="password" required type="password" value={form.password} onChange={(event) => update('password', event.target.value)} className="w-full" /></div><button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Checking...' : 'Continue securely'}</button></form> : <form onSubmit={verifyLogin} className="space-y-4"><div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{message}</div><div><label className="label" htmlFor="login-otp">Login OTP</label><input id="login-otp" required inputMode="numeric" maxLength="6" value={form.otp} onChange={(event) => update('otp', event.target.value)} placeholder="6-digit OTP" className="w-full" /></div><button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Verifying...' : 'Verify and login'}</button></form>}
        {message && !challenge && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700" aria-live="polite">{message}</p>}
        <div className="mt-6 text-center text-sm text-slate-600">New here? <Link href="/register" className="font-semibold text-brand-600">Create a verified account</Link></div>
      </div>
    </main>
  );
}
