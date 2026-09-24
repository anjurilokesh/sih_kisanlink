'use client';

import Link from 'next/link';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const initialForm = { role: 'farmer', fullName: '', mobile: '', email: '', password: '', address: '', state: '', district: '', governmentId: '', businessName: '', mobileOtp: '', emailOtp: '' };

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState({ profilePhotoName: '', roleDocumentName: '', businessIdName: '' });
  const [request, setRequest] = useState(null);
  const [demoOtps, setDemoOtps] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const uploadName = (field, event) => setFiles((current) => ({ ...current, [field]: event.target.files?.[0]?.name || '' }));

  const submitRegistration = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/verification/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, ...files, roleDocumentName: form.role === 'farmer' ? files.roleDocumentName : '', businessIdName: form.role === 'buyer' ? files.businessIdName : '' }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Unable to submit verification.');
      setRequest(payload.data);
      setDemoOtps(payload.demoOtps || null);
      setMessage(payload.message);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const verify = async (channel) => {
    try {
      const response = await fetch(`${API_URL}/verification/${request.id}/verify/${channel}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ otp: form[`${channel}Otp`] }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'OTP verification failed.');
      setRequest(payload.data);
      setMessage(payload.message);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="card p-6 md:p-8">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-brand-700">Secure onboarding</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Create a verified marketplace account</h1>
          <p className="mt-2 text-sm text-slate-600">Identity checks protect farmers and buyers. Your government ID number is never shown publicly.</p>
        </div>

        {!request ? <form onSubmit={submitRegistration} className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {['farmer', 'buyer'].map((role) => <button type="button" key={role} onClick={() => update('role', role)} className={`rounded-xl border p-4 text-left ${form.role === role ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}><span className="block text-lg font-black text-slate-900">{role === 'farmer' ? 'Farmer' : 'Buyer'}</span><span className="mt-1 block text-sm text-slate-500">{role === 'farmer' ? 'Sell crops and receive verified offers.' : 'Buy crops from verified farmers.'}</span></button>)}
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div><label className="label" htmlFor="fullName">Full name</label><input id="fullName" required value={form.fullName} onChange={(event) => update('fullName', event.target.value)} placeholder="Ramesh Patil" className="w-full" /></div>
            <div><label className="label" htmlFor="mobile">Mobile number</label><input id="mobile" required inputMode="tel" value={form.mobile} onChange={(event) => update('mobile', event.target.value)} placeholder="9876543210" className="w-full" /></div>
            <div><label className="label" htmlFor="email">Email <span className="font-normal text-slate-400">(optional)</span></label><input id="email" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="name@example.com" className="w-full" /></div>
            <div><label className="label" htmlFor="password">Password</label><div className="flex gap-2"><input id="password" required type={showPassword ? 'text' : 'password'} minLength="8" value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="At least 8 characters" className="min-w-0 flex-1" /><button type="button" onClick={() => setShowPassword((current) => !current)} className="btn-secondary shrink-0 px-3" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button></div></div>
            <div className="md:col-span-2"><label className="label" htmlFor="address">Full address</label><textarea id="address" required value={form.address} onChange={(event) => update('address', event.target.value)} placeholder="House, village, street" className="min-h-24 w-full" /></div>
            <div><label className="label" htmlFor="state">State</label><input id="state" required value={form.state} onChange={(event) => update('state', event.target.value)} placeholder="Maharashtra" className="w-full" /></div>
            <div><label className="label" htmlFor="district">District</label><input id="district" required value={form.district} onChange={(event) => update('district', event.target.value)} placeholder="Nashik" className="w-full" /></div>
            <div><label className="label" htmlFor="governmentId">Government ID number</label><input id="governmentId" required type="password" value={form.governmentId} onChange={(event) => update('governmentId', event.target.value)} placeholder="Stored securely, never public" className="w-full" /><p className="mt-1 text-xs text-slate-500">Only a secure hash and last four digits are retained in this prototype.</p></div>
            <div><label className="label" htmlFor="profilePhoto">Profile photo / face verification</label><input id="profilePhoto" required type="file" accept="image/*" onChange={(event) => uploadName('profilePhotoName', event)} className="w-full text-sm" /></div>
            {form.role === 'farmer' ? <div className="md:col-span-2"><label className="label" htmlFor="roleDocument">Farmer ID, land record, or agriculture proof</label><input id="roleDocument" required type="file" accept="image/*,.pdf" onChange={(event) => uploadName('roleDocumentName', event)} className="w-full text-sm" /></div> : <><div><label className="label" htmlFor="businessName">Business / organization name</label><input id="businessName" required value={form.businessName} onChange={(event) => update('businessName', event.target.value)} placeholder="Suryodaya Foods" className="w-full" /></div><div><label className="label" htmlFor="businessId">Business or valid ID document</label><input id="businessId" required type="file" accept="image/*,.pdf" onChange={(event) => uploadName('businessIdName', event)} className="w-full text-sm" /></div></>}
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>Review policy:</strong> automated checks only flag inconsistencies. An authorized human reviewer decides whether an account is Verified, Under Review, Not Verified, or Suspicious.</div>
          {message && <p className="rounded-xl bg-slate-100 p-3 text-sm font-semibold text-slate-700" aria-live="polite">{message}</p>}
          <div className="flex flex-wrap justify-between gap-3"><Link href="/login" className="btn-secondary">Back to login</Link><button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Submitting verification...' : 'Submit for verification'}</button></div>
        </form> : <div className="space-y-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-sm font-bold uppercase tracking-wide text-amber-800">{request.status}</p><h2 className="mt-1 text-2xl font-black text-slate-900">Verification request submitted</h2><p className="mt-2 text-sm text-slate-700">Your verification score is {request.score}/100. This is a risk indicator, not proof of trustworthiness. Human review is still required.</p></div>
          {demoOtps && <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"><strong>Local demo only:</strong> SMS OTP {demoOtps.mobile} · Email OTP {demoOtps.email}. Production systems must send these through verified providers.</div>}
          <div className="grid gap-4 md:grid-cols-2"><div><label className="label" htmlFor="mobileOtp">Mobile OTP</label><div className="flex gap-2"><input id="mobileOtp" value={form.mobileOtp} onChange={(event) => update('mobileOtp', event.target.value)} placeholder="6 digits" className="min-w-0 flex-1" /><button type="button" onClick={() => verify('mobile')} className="btn-primary">Verify</button></div><p className="mt-2 text-xs text-slate-500">Status: {request.mobileVerified ? 'Verified' : 'Pending'}</p></div>{request.email !== 'Not provided' && <div><label className="label" htmlFor="emailOtp">Email OTP</label><div className="flex gap-2"><input id="emailOtp" value={form.emailOtp} onChange={(event) => update('emailOtp', event.target.value)} placeholder="6 digits" className="min-w-0 flex-1" /><button type="button" onClick={() => verify('email')} className="btn-primary">Verify</button></div><p className="mt-2 text-xs text-slate-500">Status: {request.emailVerified ? 'Verified' : 'Pending'}</p></div>}</div>
          {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800" aria-live="polite">{message}</p>}
          <Link href="/login" className="btn-secondary">Continue to login</Link>
        </div>}
      </div>
    </main>
  );
}
