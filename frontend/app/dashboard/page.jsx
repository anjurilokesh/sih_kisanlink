'use client';

import Link from 'next/link';
import { useLanguage } from '../../contexts/LanguageContext';

const quickStats = [
  { label: 'Current Best Price', value: '₹2,650 / qtl', accent: 'bg-emerald-100 text-emerald-700' },
  { label: 'Nearby Buyers', value: '12', accent: 'bg-blue-100 text-blue-700' },
  { label: 'Nearby Markets', value: '18', accent: 'bg-yellow-100 text-yellow-700' },
  { label: 'Active Offers', value: '05', accent: 'bg-purple-100 text-purple-700' },
  { label: 'Pending Transactions', value: '03', accent: 'bg-rose-100 text-rose-700' },
];

export default function DashboardPage() {
  const { t } = useLanguage();

  return (
    <main className="page-shell">
      <header className="mb-6 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 p-6 text-white md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.15em] text-brand-100">KisanLink</p>
          <h1 className="mt-2 text-3xl font-black">{t('welcomeFarmer')}</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/markets" className="btn-secondary bg-white/10 text-white border-white/30 hover:bg-white/20">{t('marketPrices')}</Link>
          <Link href="/chatbot" className="btn-primary bg-white text-brand-700 hover:bg-slate-100">{t('chatbot')}</Link>
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {quickStats.map((item) => (
          <div key={item.label} className="card p-5">
            <div className={`inline-flex rounded-lg px-3 py-2 text-xs font-bold ${item.accent}`}>{item.label}</div>
            <p className="mt-4 text-2xl font-black text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Market Prices</h2>
            <Link href="/prices" className="btn-secondary text-xs">View All</Link>
          </div>
          <div className="space-y-3">
            {[
              { crop: 'Rice', market: 'APMC Mandis', price: '₹2,450', demand: 'High' },
              { crop: 'Wheat', market: 'Vijayawada', price: '₹2,180', demand: 'Medium' },
              { crop: 'Cotton', market: 'Hapur', price: '₹6,540', demand: 'High' },
            ].map((row) => (
              <div key={row.crop} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div>
                  <p className="font-semibold text-slate-900">{row.crop}</p>
                  <p className="text-xs text-slate-500">{row.market}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{row.price}</p>
                  <p className="text-xs text-emerald-700">{row.demand}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-slate-900">Recommended Buyers</h2>
          <div className="mt-5 space-y-3">
            {[
              { name: 'Suryodaya Foods', price: '₹2,650', distance: '18 km', rating: '4.9' },
              { name: 'Green Harvest Traders', price: '₹2,580', distance: '26 km', rating: '4.7' },
            ].map((buyer) => (
              <div key={buyer.name} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{buyer.name}</p>
                    <p className="text-xs text-slate-500">Verified buyer</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">{buyer.rating}</span>
                </div>
                <div className="mt-3 flex justify-between text-sm text-slate-600">
                  <span>Offer</span>
                  <span className="font-semibold text-slate-900">{buyer.price}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Distance</span>
                  <span>{buyer.distance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
