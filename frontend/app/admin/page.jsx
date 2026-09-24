'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const marketRows = [
  { name: 'APMC Mandis', crop: 'Rice', price: '₹2,450', status: 'Active' },
  { name: 'Hapur Market', crop: 'Cotton', price: '₹6,540', status: 'Active' },
];

export default function AdminPage() {
  const { t } = useLanguage();
  const [marketRowsState, setMarketRowsState] = useState(marketRows);
  const [activeAction, setActiveAction] = useState('');
  const [entry, setEntry] = useState({ name: '', crop: '', price: '' });
  const [message, setMessage] = useState('');
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [adminKey, setAdminKey] = useState('');
  const [authorized, setAuthorized] = useState(false);

  const loadRequests = (key) => fetch(`${API_URL}/verification`, { headers: { 'x-admin-key': key } })
      .then((response) => response.json())
      .then((payload) => {
        if (!payload.success) throw new Error(payload.message);
        setVerificationRequests(payload.data || []);
        setAuthorized(true);
        sessionStorage.setItem('kisanlink-admin-key', key);
      })
      .catch((error) => setMessage(error.message || 'Unable to load verification requests.'));

  useEffect(() => {
    const savedKey = sessionStorage.getItem('kisanlink-admin-key');
    if (savedKey) { setAdminKey(savedKey); loadRequests(savedKey); }
  }, []);

  const updateVerification = async (request, status) => {
    const response = await fetch(`${API_URL}/verification/${request.id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey }, body: JSON.stringify({ status, note: `Admin selected ${status}` }) });
    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.message || 'Unable to update verification status.');
      return;
    }
    setVerificationRequests((current) => current.map((item) => item.id === request.id ? payload.data : item));
    setMessage(payload.message);
  };

  const submitAction = (event) => {
    event.preventDefault();
    if (activeAction === 'Add Market') {
      setMarketRowsState((current) => [...current, { name: entry.name || 'New Market', crop: entry.crop || 'Rice', price: `₹${entry.price || '0'}`, status: 'Pending review' }]);
      setMessage('Market added to the administration list.');
    } else if (activeAction === 'Verify Buyers') {
      setMessage('Buyer verification queue marked as reviewed.');
    } else {
      setMessage(`${activeAction} entry saved successfully.`);
    }
    setActiveAction('');
    setEntry({ name: '', crop: '', price: '' });
  };

  if (!authorized) return (
    <main className="page-shell">
      <div className="card max-w-xl border-amber-200 bg-amber-50 p-6">
        <p className="text-sm font-bold uppercase tracking-[0.15em] text-brand-700">Authorized access</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Admin verification dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Enter the admin key configured on the backend. It is kept only in this browser session.</p>
        <form onSubmit={(event) => { event.preventDefault(); loadRequests(adminKey); }} className="mt-5 flex gap-2">
          <input required type="password" value={adminKey} onChange={(event) => setAdminKey(event.target.value)} placeholder="Admin key" className="min-w-0 flex-1 bg-white" />
          <button type="submit" className="btn-primary">Open queue</button>
        </form>
        {message && <p className="mt-3 text-sm font-semibold text-red-700" aria-live="polite">{message}</p>}
      </div>
    </main>
  );

  return (
    <main className="page-shell">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.15em] text-brand-700">Admin Dashboard</p>
        <h1 className="text-3xl font-black text-slate-900">{t('admin')}</h1>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          'Add Market',
          'Add Buyers',
          'Verify Buyers',
          'Add Crops',
        ].map((label) => (
          <button key={label} type="button" onClick={() => { setActiveAction(label); setMessage(''); }} className={`card p-5 text-left text-lg font-bold text-slate-900 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg ${activeAction === label ? 'border-brand-400 bg-brand-50' : ''}`}>{label}</button>
        ))}
      </div>

      {activeAction && <form onSubmit={submitAction} className="mt-6 card border-brand-200 bg-brand-50 p-6"><div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900">{activeAction}</h2><p className="mt-1 text-sm text-slate-600">Record this administration action for the local prototype.</p></div><button type="button" onClick={() => setActiveAction('')} className="btn-secondary px-3" aria-label="Close admin form">×</button></div>{activeAction !== 'Verify Buyers' && <div className="mt-4 grid gap-4 md:grid-cols-3"><input value={entry.name} onChange={(event) => setEntry((current) => ({ ...current, name: event.target.value }))} placeholder={activeAction === 'Add Crops' ? 'Crop name' : 'Name'} required /><input value={entry.crop} onChange={(event) => setEntry((current) => ({ ...current, crop: event.target.value }))} placeholder="Crop or category" required /><input type="number" min="0" value={entry.price} onChange={(event) => setEntry((current) => ({ ...current, price: event.target.value }))} placeholder="Price (₹/qtl)" /></div>}<button type="submit" className="btn-primary mt-4">{activeAction === 'Verify Buyers' ? 'Mark Queue Reviewed' : 'Save Entry'}</button></form>}
      {message && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</p>}

      <section className="mt-8 card p-6">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-bold uppercase tracking-[0.15em] text-brand-700">Identity review</p><h2 className="mt-1 text-xl font-bold text-slate-900">Pending verification requests</h2></div><span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">{verificationRequests.filter((item) => item.status === 'UNDER REVIEW').length} under review</span></div>
        <div className="mt-5 space-y-4">
          {verificationRequests.map((request) => <article key={request.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-col justify-between gap-3 md:flex-row md:items-start"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-900">{request.fullName}</h3><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold uppercase text-slate-600">{request.role}</span><span className={`rounded-full px-2 py-1 text-xs font-bold ${request.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : request.status === 'NOT VERIFIED' || request.status === 'SUSPICIOUS' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{request.status}</span></div><p className="mt-1 text-sm text-slate-500">{request.mobile} · {request.email} · {request.district}, {request.state}</p></div><div className="text-left md:text-right"><p className="text-xs uppercase tracking-wide text-slate-500">Verification indicator</p><p className="text-xl font-black text-slate-900">{request.score}/100</p></div></div><div className="mt-4 grid gap-2 text-xs text-slate-600 sm:grid-cols-3"><span>Government ID: {request.documentChecks?.governmentId}</span><span>Role proof: {request.documentChecks?.roleProof}</span><span>Face/photo: {request.documentChecks?.face}</span></div><p className="mt-3 text-xs text-amber-800">Flags: {request.flags?.join(', ') || 'None recorded'}</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => updateVerification(request, 'VERIFIED')} className="btn-success">Approve</button><button type="button" onClick={() => updateVerification(request, 'NOT VERIFIED')} className="btn-danger">Reject</button><button type="button" onClick={() => updateVerification(request, 'UNDER REVIEW')} className="btn-secondary">Request re-verification</button><button type="button" onClick={() => updateVerification(request, 'SUSPICIOUS')} className="btn-danger">Flag suspicious</button></div><details className="mt-4 text-xs text-slate-600"><summary className="cursor-pointer font-semibold">Verification history</summary><div className="mt-2 space-y-1">{request.history?.map((item, index) => <p key={`${request.id}-${index}`}>{item.status} · {new Date(item.at).toLocaleString()} · {item.note}</p>)}</div></details></article>)}
          {!verificationRequests.length && <p className="text-sm text-slate-500">No verification requests are waiting.</p>}
        </div>
      </section>

      <div className="mt-8 card p-6">
        <h2 className="text-xl font-bold text-slate-900">Market Price List</h2>
        <div className="mt-5 space-y-3">
          {marketRowsState.map((market) => (
            <div key={market.name} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <p className="font-semibold text-slate-900">{market.name}</p>
                <p className="text-xs text-slate-500">{market.crop}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">{market.price}</p>
                <p className="text-xs text-emerald-700">{market.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
