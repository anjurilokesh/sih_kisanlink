'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../contexts/LanguageContext';

export default function BuyersPage() {
  const { t } = useLanguage();
  const [buyers, setBuyers] = useState([]);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [query, setQuery] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [farmerLocation, setFarmerLocation] = useState('Nashik, Maharashtra');
  const [routes, setRoutes] = useState({});

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (verifiedOnly) params.set('verified', 'true');
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/buyers?${params}`)
      .then((res) => res.json())
      .then((data) => setBuyers(data.data || []));
  }, [query, verifiedOnly]);

  useEffect(() => {
    if (!buyers.length || !farmerLocation) return;
    const controller = new AbortController();
    Promise.all(buyers.map(async (buyer) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/maps/distance?origin=${encodeURIComponent(farmerLocation)}&destination=${encodeURIComponent(buyer.location)}`, { signal: controller.signal });
      const payload = await response.json();
      return [buyer.id, payload.data];
    })).then((entries) => setRoutes(Object.fromEntries(entries))).catch(() => {});
    return () => controller.abort();
  }, [buyers, farmerLocation]);

  return (
    <main className="page-shell">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.15em] text-brand-700">Buyer Matching</p>
        <h1 className="text-3xl font-black text-slate-900">{t('buyersTitle')}</h1>
      </div>
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <label className="sr-only" htmlFor="farmer-origin">Farmer location</label>
        <input id="farmer-origin" value={farmerLocation} onChange={(event) => setFarmerLocation(event.target.value)} placeholder="Your farm location" className="min-w-0 flex-1" />
        <label className="sr-only" htmlFor="buyer-search">Search buyers</label>
        <input id="buyer-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search buyer, crop, or location" className="min-w-0 flex-1" />
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} /> Verified buyers only</label>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {buyers.map((buyer) => (
          <div key={buyer.id} className="card p-5">
            {(() => { const route = routes[buyer.id]; const transportCost = route ? Math.round(route.distanceKm * 22 + (buyer.quantityRequired * 0.8)) : null; const cropTotal = Math.round(buyer.offeredPrice * buyer.quantityRequired / 100); return <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">{buyer.name}</h2>
              {buyer.verified ? (
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Verified</span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">Pending</span>
              )}
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between"><span>Crop</span><span className="font-semibold text-slate-900">{buyer.crop}</span></div>
              <div className="flex justify-between"><span>Offered Price</span><span className="font-semibold text-slate-900">₹{buyer.offeredPrice}</span></div>
              <div className="flex justify-between"><span>Distance</span><span>{route ? `${route.distanceKm} km` : 'Calculating...'}</span></div>
              <div className="flex justify-between"><span>Estimated transport</span><span className="font-semibold text-slate-900">{transportCost === null ? 'Calculating...' : `₹${transportCost.toLocaleString('en-IN')}`}</span></div>
              <div className="flex justify-between border-t border-slate-100 pt-2"><span>Total delivered price</span><span className="font-black text-brand-700">{transportCost === null ? 'Calculating...' : `₹${(cropTotal + transportCost).toLocaleString('en-IN')}`}</span></div>
              <div className="flex justify-between"><span>Rating</span><span>{buyer.rating} / 5</span></div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
              <button type="button" onClick={() => setSelectedBuyer(selectedBuyer === buyer.id ? null : buyer.id)} className="btn-secondary">{selectedBuyer === buyer.id ? 'Hide Buyer' : 'View Buyer'}</button>
              <Link href={`/offers?buyer=${encodeURIComponent(buyer.name)}`} className="btn-primary">Send Offer</Link>
              <a href={`mailto:procurement@${buyer.name.toLowerCase().replace(/\s+/g, '')}.in?subject=${encodeURIComponent(`${buyer.crop} supply offer`)}`} className="btn-success">Contact</a>
            </div>
            {selectedBuyer === buyer.id && <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600"><p className="font-semibold text-slate-900">{buyer.name} buyer profile</p><p className="mt-2">Purchases {buyer.crop} around {buyer.location} and typically requires {buyer.quantityRequired} kg per order.</p><p className="mt-1">Completed transactions: {buyer.transactionHistory}</p></div>}
            </>; })()}
          </div>
        ))}
      </div>
    </main>
  );
}
