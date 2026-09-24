'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const steps = [
  'Offer Received',
  'Offer Accepted',
  'Transport Arranged',
  'Crop Dispatched',
  'Crop Delivered',
  'Payment Completed',
];

export default function TransactionsPage() {
  const { t } = useLanguage();
  const [role, setRole] = useState('farmer');
  const [transactions, setTransactions] = useState([]);
  const [otpValues, setOtpValues] = useState({});
  const [upiValues, setUpiValues] = useState({});
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);

  const buildUpiLink = (transaction, upiId) => `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(transaction.farmer)}&am=${encodeURIComponent(transaction.amount)}&cu=INR&tn=${encodeURIComponent(`${transaction.crop} purchase ${transaction.id}`)}`;

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/transactions?role=${role}`)
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load purchase history.');
        return response.json();
      })
      .then((payload) => setTransactions(payload.data || []))
      .catch((error) => setMessages({ page: error.message }))
      .finally(() => setLoading(false));
  }, [role]);

  const verifyPurchase = async (transactionId) => {
    setMessages((current) => ({ ...current, [transactionId]: '' }));
    try {
      const response = await fetch(`${API_URL}/transactions/${transactionId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpValues[transactionId] || '' }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Unable to verify this purchase.');
      setTransactions((current) => current.map((item) => item.id === transactionId ? payload.data : item));
      setMessages((current) => ({ ...current, [transactionId]: payload.message }));
    } catch (error) {
      setMessages((current) => ({ ...current, [transactionId]: error.message }));
    }
  };

  const startUpiPayment = async (transaction) => {
    const upiId = (upiValues[transaction.id] || '').trim();
    setMessages((current) => ({ ...current, [transaction.id]: '' }));
    try {
      const response = await fetch(`${API_URL}/transactions/${transaction.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upiId }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Unable to link UPI payment.');
      setTransactions((current) => current.map((item) => item.id === transaction.id ? payload.data : item));
      setMessages((current) => ({ ...current, [transaction.id]: payload.message }));
      window.location.href = buildUpiLink(transaction, upiId);
    } catch (error) {
      setMessages((current) => ({ ...current, [transaction.id]: error.message }));
    }
  };

  return (
    <main className="page-shell">
      <section className="mb-8 rounded-3xl bg-[#173d2a] px-6 py-8 text-white shadow-soft md:px-10">
        <p className="text-sm font-bold uppercase tracking-[0.15em] text-lime-300">Trade records</p>
        <h1 className="mt-2 text-3xl font-black md:text-4xl">{t('transactions')}</h1>
        <p className="mt-3 max-w-2xl text-emerald-50">Farmers share a delivery OTP. Buyers enter it after receiving the goods to confirm the purchase and complete payment.</p>
        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Transaction history view">
          <button type="button" onClick={() => setRole('farmer')} className={`rounded-xl px-4 py-2 text-sm font-bold ${role === 'farmer' ? 'bg-lime-300 text-[#173d2a]' : 'border border-white/30 text-white'}`} role="tab" aria-selected={role === 'farmer'}>Farmer: Sold goods</button>
          <button type="button" onClick={() => setRole('buyer')} className={`rounded-xl px-4 py-2 text-sm font-bold ${role === 'buyer' ? 'bg-lime-300 text-[#173d2a]' : 'border border-white/30 text-white'}`} role="tab" aria-selected={role === 'buyer'}>Buyer: Purchased history</button>
        </div>
      </section>

      {messages.page && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{messages.page}</div>}
      {loading && <div className="card p-8 text-center text-slate-500">Loading {role === 'farmer' ? 'sold goods' : 'purchased goods'}...</div>}
      {!loading && !transactions.length && <div className="card p-8 text-center text-slate-500">No transaction history found.</div>}

      {!loading && transactions.length > 0 && (
        <section aria-labelledby="history-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-brand-700">{role === 'farmer' ? 'Farmer ledger' : 'Buyer ledger'}</p>
              <h2 id="history-heading" className="mt-1 text-2xl font-black text-slate-900">{role === 'farmer' ? t('soldGoods') : t('purchasedHistory')}</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{transactions.length} record{transactions.length === 1 ? '' : 's'}</span>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {transactions.map((transaction) => (
              <article key={transaction.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{transaction.crop}</h3>
                    <p className="mt-1 text-sm text-slate-500">{role === 'farmer' ? `Buyer: ${transaction.buyer}` : `Farmer: ${transaction.farmer}`}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${transaction.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {transaction.verified ? 'Verified' : 'Awaiting OTP'}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-500">Quantity</p><p className="mt-1 font-bold text-slate-900">{transaction.quantity || 0} kg</p></div>
                  <div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-500">Amount</p><p className="mt-1 font-bold text-slate-900">₹{Number(transaction.amount || 0).toLocaleString('en-IN')}</p></div>
                </div>
                <div className="mt-4 flex justify-between border-t border-slate-100 pt-3 text-xs text-slate-500"><span>{transaction.status}</span><span>{transaction.lastUpdated}</span></div>

                {role === 'farmer' && !transaction.verified && (
                  <div className="mt-4 rounded-xl border border-lime-200 bg-lime-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-lime-800">Share this delivery OTP with the buyer</p>
                    <p className="mt-1 text-2xl font-black tracking-[0.25em] text-lime-900">{transaction.verificationCode}</p>
                  </div>
                )}

                {role === 'buyer' && !transaction.verified && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <label className="label" htmlFor={`otp-${transaction.id}`}>Enter OTP from farmer</label>
                    <div className="mt-2 flex gap-2">
                      <input id={`otp-${transaction.id}`} inputMode="numeric" maxLength="6" value={otpValues[transaction.id] || ''} onChange={(event) => setOtpValues((current) => ({ ...current, [transaction.id]: event.target.value.replace(/\D/g, '') }))} placeholder="6-digit OTP" className="min-w-0 flex-1" />
                      <button type="button" onClick={() => verifyPurchase(transaction.id)} className="btn-primary">Verify</button>
                    </div>
                    {messages[transaction.id] && <p className="mt-2 text-sm text-amber-800" aria-live="polite">{messages[transaction.id]}</p>}
                  </div>
                )}
                {role === 'buyer' && transaction.verified && transaction.paymentStatus !== 'Completed' && transaction.paymentStatus !== 'UPI initiated' && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4"><label className="label" htmlFor={`upi-${transaction.id}`}>Farmer UPI ID</label><div className="mt-2 flex gap-2"><input id={`upi-${transaction.id}`} value={upiValues[transaction.id] || ''} onChange={(event) => setUpiValues((current) => ({ ...current, [transaction.id]: event.target.value }))} placeholder="farmer@upi" className="min-w-0 flex-1" /><button type="button" onClick={() => startUpiPayment(transaction)} className="btn-primary">Pay via UPI</button></div>{messages[transaction.id] && <p className="mt-2 text-sm text-blue-800" aria-live="polite">{messages[transaction.id]}</p>}</div>}
                {role === 'buyer' && transaction.verified && transaction.paymentStatus === 'UPI initiated' && <p className="mt-4 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-800">UPI payment linked. Complete the payment in your UPI app.</p>}
                {role === 'buyer' && transaction.verified && transaction.paymentStatus === 'Completed' && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">Purchase verified. Payment is completed.</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="card mt-8 p-6">
        <h2 className="text-xl font-black text-slate-900">Transaction tracking</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-6">
          {steps.map((step, index) => <div key={step} className={`rounded-2xl border p-4 ${index <= 4 ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}><div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-white font-bold text-brand-700 shadow-sm">{index + 1}</div><p className="text-sm font-semibold text-slate-800">{step}</p></div>)}
        </div>
      </section>
    </main>
  );
}
