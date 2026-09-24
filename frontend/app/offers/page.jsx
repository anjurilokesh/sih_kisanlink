'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function OffersPage() {
  const { t } = useLanguage();
  const [offers, setOffers] = useState([]);
  const [expandedOffer, setExpandedOffer] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/offers`)
      .then((response) => response.json())
      .then((payload) => setOffers(payload.data || []))
      .catch(() => setMessage('Unable to load current offers.'));
  }, []);

  const updateOffer = async (offer, status) => {
    const response = await fetch(`${API_URL}/offers/${offer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.message || 'Unable to update this offer.');
      return;
    }
    setOffers((current) => current.map((item) => item.id === offer.id ? payload.data : item));
    setMessage(`${offer.buyer} offer marked ${status.toLowerCase()}.`);
  };

  return (
    <main className="page-shell">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.15em] text-brand-700">Offers</p>
        <h1 className="text-3xl font-black text-slate-900">{t('offersTitle')}</h1>
      </div>

      <div className="space-y-4">
        {message && <div className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</div>}
        {offers.map((offer) => (
          <div key={offer.id} className="card p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{offer.buyer}</h2>
                <p className="text-sm text-slate-500">{offer.crop} • {offer.quantity} kg • {offer.location}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-slate-900">{offer.price}</p>
                <p className="text-xs text-slate-500">{offer.date}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{offer.status}</span>
              <div className="flex gap-2">
                {offer.status === 'Pending' && <>
                  <button type="button" onClick={() => updateOffer(offer, 'Accepted')} className="btn-success">Accept</button>
                  <button type="button" onClick={() => updateOffer(offer, 'Rejected')} className="btn-danger">Reject</button>
                </>}
                <button type="button" onClick={() => setExpandedOffer(expandedOffer === offer.id ? null : offer.id)} className="btn-secondary">{expandedOffer === offer.id ? 'Hide Details' : 'View Details'}</button>
              </div>
            </div>
            {expandedOffer === offer.id && <div className="mt-4 grid gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2"><span>Offer ID: <strong className="text-slate-900">{offer.id}</strong></span><span>Buyer: <strong className="text-slate-900">{offer.buyer}</strong></span><span>Price per quintal: <strong className="text-slate-900">₹{Number(offer.offeredPrice || 0).toLocaleString('en-IN')}</strong></span><span>Listed: <strong className="text-slate-900">{offer.date}</strong></span></div>}
          </div>
        ))}
      </div>
    </main>
  );
}
