'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const logistics = [
  { provider: 'FarmRide Transport', vehicle: 'Mini Truck', distance: '42 km', cost: '₹2,400', availability: 'Available' },
  { provider: 'AgriMove', vehicle: 'Tempo', distance: '28 km', cost: '₹1,800', availability: 'Available' },
];

export default function LogisticsPage() {
  const { t } = useLanguage();
  const [farmerLocation, setFarmerLocation] = useState('Nashik, Maharashtra');
  const [buyerLocation, setBuyerLocation] = useState('Pune, Maharashtra');
  const [direction, setDirection] = useState('farmer-to-buyer');
  const [requestedProvider, setRequestedProvider] = useState('');
  const [quantity, setQuantity] = useState('1000');
  const [route, setRoute] = useState(null);
  const [routeError, setRouteError] = useState('');
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const origin = direction === 'farmer-to-buyer' ? farmerLocation : buyerLocation;
  const destination = direction === 'farmer-to-buyer' ? buyerLocation : farmerLocation;
  useEffect(() => {
    if (!origin || !destination) return;
    const controller = new AbortController();
    setRouteError('');
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/maps/distance?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((payload) => setRoute(payload.data))
      .catch((error) => { if (error.name !== 'AbortError') setRouteError('Unable to calculate this route.'); });
    return () => controller.abort();
  }, [origin, destination]);
  const transportCost = route ? Math.round((route.distanceKm * 22) + (Number(quantity || 0) * 0.8)) : 0;
  const routeUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
  const embedUrl = useMemo(() => {
    if (!mapsKey || !origin || !destination) return '';
    return `https://www.google.com/maps/embed/v1/directions?key=${mapsKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=driving`;
  }, [mapsKey, origin, destination]);

  const swapLocations = () => {
    setFarmerLocation(buyerLocation);
    setBuyerLocation(farmerLocation);
    setDirection((current) => current === 'farmer-to-buyer' ? 'buyer-to-farmer' : 'farmer-to-buyer');
  };

  return (
    <main className="page-shell">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.15em] text-brand-700">{t('logistics')}</p>
        <h1 className="text-3xl font-black text-slate-900">Transport Providers</h1>
      </div>

      <section className="card mb-8 overflow-hidden">
        <div className="border-b border-slate-100 p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-brand-700">{t('routePlanner')}</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Plan the crop journey</h2>
              <p className="mt-2 text-sm text-slate-500">View the driving route from the farmer to the buyer, or reverse it for the return journey.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">{direction === 'farmer-to-buyer' ? 'Farmer → Buyer' : 'Buyer → Farmer'}</span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
            <div>
              <label className="label" htmlFor="farmer-location">Farmer location</label>
              <input id="farmer-location" value={farmerLocation} onChange={(event) => setFarmerLocation(event.target.value)} placeholder="Village, district, state" className="w-full" />
            </div>
            <button type="button" onClick={swapLocations} className="btn-secondary h-11" aria-label="Swap farmer and buyer locations" title="Swap route direction">⇄ <span className="ml-2 hidden md:inline">Swap</span></button>
            <div>
              <label className="label" htmlFor="buyer-location">Buyer location</label>
              <input id="buyer-location" value={buyerLocation} onChange={(event) => setBuyerLocation(event.target.value)} placeholder="Market, district, state" className="w-full" />
            </div>
          </div>
        </div>
        <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="min-h-[360px] bg-slate-100">
            {embedUrl ? (
              <iframe title={`Driving route from ${origin} to ${destination}`} src={embedUrl} className="h-[360px] w-full border-0" loading="lazy" allowFullScreen />
            ) : (
              <div className="flex h-[360px] items-center justify-center p-8 text-center">
                <div>
                  <p className="font-bold text-slate-800">Google Maps preview is not configured</p>
                  <p className="mt-2 text-sm text-slate-500">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to the frontend environment to show the embedded route.</p>
                  <a href={routeUrl} target="_blank" rel="noreferrer" className="btn-primary mt-4">Open route in Google Maps</a>
                </div>
              </div>
            )}
          </div>
          <div className="p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Current route</p>
            <p className="mt-3 text-lg font-black text-slate-900">{origin}</p>
            <div className="my-3 flex items-center gap-2 text-brand-600"><span className="h-2 w-2 rounded-full bg-brand-600" /><span className="h-px flex-1 bg-brand-200" /><span className="text-xl">→</span></div>
            <p className="text-lg font-black text-slate-900">{destination}</p>
            {route && <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-emerald-50 p-4 text-sm"><div><p className="text-xs text-slate-500">Distance</p><p className="font-black text-emerald-800">{route.distanceKm} km</p></div><div><p className="text-xs text-slate-500">Travel time</p><p className="font-black text-emerald-800">{route.estimatedTravelTime}</p></div><div className="col-span-2 border-t border-emerald-100 pt-3"><label className="text-xs text-slate-500" htmlFor="transport-quantity">Quantity (kg)</label><input id="transport-quantity" type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="mt-1 w-full bg-white" /><p className="mt-2 font-black text-emerald-800">Estimated transport: ₹{transportCost.toLocaleString('en-IN')}</p></div></div>}
            {routeError && <p className="mt-4 text-sm font-semibold text-red-700">{routeError}</p>}
            <a href={routeUrl} target="_blank" rel="noreferrer" className="btn-secondary mt-6 w-full">Open full route</a>
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        {logistics.map((item) => (
          <div key={item.provider} className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">{item.provider}</h2>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">{item.availability}</span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between"><span>Vehicle type</span><span className="font-semibold text-slate-900">{item.vehicle}</span></div>
              <div className="flex justify-between"><span>Distance</span><span>{item.distance}</span></div>
              <div className="flex justify-between"><span>Transport cost</span><span>{item.cost}</span></div>
            </div>
            <button type="button" onClick={() => setRequestedProvider(item.provider)} className="btn-primary mt-5 w-full">{requestedProvider === item.provider ? 'Request Sent' : 'Request Transport'}</button>
            {requestedProvider === item.provider && <p className="mt-2 text-center text-sm font-semibold text-emerald-700">{item.provider} will contact you about this route.</p>}
          </div>
        ))}
      </div>
    </main>
  );
}
