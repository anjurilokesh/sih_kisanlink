'use client';

import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';

const statCards = [
  { label: 'Market Prices', value: '₹2,450 / qtl', note: 'Rice • Nashik' },
  { label: 'Verified Buyers', value: '128', note: 'Across 12 districts' },
  { label: 'Nearby Markets', value: '18', note: 'Within 35 km' },
  { label: 'Avg. Distance', value: '24 km', note: 'Buyer matching' },
];

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-[#f7f8f4] text-slate-800">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-2 md:px-6 md:py-16">
        <div className="flex flex-col justify-center">
          <span className="mb-4 inline-flex w-fit rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">
            {t('smartFarmerMarket')}
          </span>
          <h2 className="max-w-xl text-4xl font-black leading-tight text-slate-900 md:text-5xl">
            {t('connectFarmers')}
          </h2>
          <p className="mt-5 max-w-xl text-lg text-slate-600">
            {t('heroSubtitle')}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn-primary">{t('getStarted')}</Link>
            <Link href="/markets" className="btn-secondary">{t('exploreMarkets')}</Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-600">
            <div><span className="font-bold text-slate-900">₹128Cr</span> annual market value tracked</div>
            <div><span className="font-bold text-slate-900">22</span> languages supported</div>
          </div>
        </div>

        <div className="relative">
          <div className="card overflow-hidden p-5">
            <div className="rounded-2xl bg-gradient-to-br from-brand-100 via-white to-emerald-50 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{t('marketPricePreview')}</p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-900">₹2,450 / qtl</h3>
                </div>
                <div className="rounded-xl bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700">+4.2%</div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {statCards.map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/70 bg-white/80 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                    <p className="mt-2 text-xl font-bold text-slate-900">{item.value}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.note}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-emerald-200 bg-white p-4">
                <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                  <span>{t('buyerMatching')}</span>
                  <span className="text-emerald-600">Verified</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm">
                  <span>Suryodaya Foods</span>
                  <span className="font-semibold text-slate-900">₹2,650</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { title: t('priceDiscovery'), text: 'Real-time crop price comparison across markets.' },
              { title: t('verifiedBuyers'), text: 'Find trusted buyers and negotiate better terms.' },
              { title: t('logisticsSupport'), text: 'Plan transport, storage and delivery with confidence.' },
            ].map((item) => (
              <div key={item.title} className="card p-6">
                <div className="mb-4 h-12 w-12 rounded-xl bg-brand-100 text-2xl text-brand-700 flex items-center justify-center">✓</div>
                <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
