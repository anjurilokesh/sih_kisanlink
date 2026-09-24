'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function MarketsPage() {
  const { t } = useLanguage();
  const [markets, setMarkets] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [farmerLocation, setFarmerLocation] = useState('Nashik, Maharashtra');
  const [routes, setRoutes] = useState({});

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/markets`)
      .then((res) => res.json())
      .then((data) => setMarkets(data.data || []));
  }, []);

  useEffect(() => {
    if (!markets.length || !farmerLocation) return;
    const controller = new AbortController();
    Promise.all(markets.map(async (market) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/maps/distance?origin=${encodeURIComponent(farmerLocation)}&destination=${encodeURIComponent(`${market.location}, ${market.state || ''}`)}`, { signal: controller.signal });
      const payload = await response.json();
      return [market.id, payload.data];
    })).then((entries) => setRoutes(Object.fromEntries(entries))).catch(() => {});
    return () => controller.abort();
  }, [markets, farmerLocation]);

  return (
    <main className="page-shell">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.15em] text-brand-700">Market Comparison</p>
          <h1 className="text-3xl font-black text-slate-900">{t('marketsTitle')}</h1>
        </div>
      </div>
      <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"><label className="text-sm font-semibold text-slate-700" htmlFor="market-origin">Farmer location</label><input id="market-origin" value={farmerLocation} onChange={(event) => setFarmerLocation(event.target.value)} placeholder="Village, district, state" className="min-w-0 flex-1" /></div>

      {comparison.length > 0 && <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold text-brand-900">Comparing: {comparison.map((market) => market.name).join(' vs ')}</p><button type="button" onClick={() => setComparison([])} className="btn-secondary px-3 py-1.5 text-xs">Clear comparison</button></div><div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">{comparison.map((market) => <div key={market.id} className="rounded-xl bg-white p-3"><span className="font-bold">{market.name}</span><span className="ml-2">₹{market.modalPrice} · {market.distance} km · {market.demand} demand</span></div>)}</div></div>}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {markets.map((market) => (
          <div key={market.id} className="card p-5">
            {(() => { const route = routes[market.id]; const quantityKg = 1000; const transportCost = route ? Math.round(route.distanceKm * 22 + quantityKg * 0.8) : null; const cropTotal = Math.round(market.modalPrice * quantityKg / 100); return <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{market.name}</h2>
                <p className="text-sm text-slate-500">{market.location}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">{market.demand}</span>
            </div>

            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between"><span>Crop</span><span className="font-semibold text-slate-900">{market.crop}</span></div>
              <div className="flex justify-between"><span>Modal Price</span><span className="font-semibold text-slate-900">₹{market.modalPrice}</span></div>
              <div className="flex justify-between"><span>Distance</span><span>{route ? `${route.distanceKm} km` : 'Calculating...'}</span></div>
              <div className="flex justify-between"><span>Travel Time</span><span>{route?.estimatedTravelTime || 'Calculating...'}</span></div>
              <div className="flex justify-between"><span>Estimated transport</span><span className="font-semibold text-slate-900">{transportCost === null ? 'Calculating...' : `₹${transportCost.toLocaleString('en-IN')}`}</span></div>
              <div className="flex justify-between border-t border-slate-100 pt-2"><span>Total delivered price (1,000 kg)</span><span className="font-black text-brand-700">{transportCost === null ? 'Calculating...' : `₹${(cropTotal + transportCost).toLocaleString('en-IN')}`}</span></div>
            </div>

            <div className="mt-5 flex gap-2">
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${market.name}, ${market.location}`)}`} target="_blank" rel="noreferrer" className="btn-primary flex-1">View Market</a>
              <button type="button" onClick={() => setComparison((current) => current.some((item) => item.id === market.id) ? current.filter((item) => item.id !== market.id) : [...current.slice(-1), market])} className="btn-secondary flex-1">{comparison.some((item) => item.id === market.id) ? 'Selected' : 'Compare'}</button>
            </div>
            </>; })()}
          </div>
        ))}
      </div>
    </main>
  );
}
