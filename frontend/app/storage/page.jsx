'use client';

import { useLanguage } from '../../contexts/LanguageContext';

const storageOptions = [
  { name: 'Cold Store Nashik', distance: '12 km', capacity: '180 tonnes', type: 'Cold Storage', space: '42% free', contact: '9876501234' },
  { name: 'Agri Warehouse Hub', distance: '24 km', capacity: '250 tonnes', type: 'Warehouse', space: '64% free', contact: '9876504321' },
];

export default function StoragePage() {
  const { t } = useLanguage();
  return (
    <main className="page-shell">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.15em] text-brand-700">{t('storage')}</p>
        <h1 className="text-3xl font-black text-slate-900">Nearby Storage Facilities</h1>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {storageOptions.map((item) => (
          <div key={item.name} className="card p-5">
            <h2 className="text-xl font-bold text-slate-900">{item.name}</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between"><span>Distance</span><span>{item.distance}</span></div>
              <div className="flex justify-between"><span>Capacity</span><span>{item.capacity}</span></div>
              <div className="flex justify-between"><span>Available space</span><span>{item.space}</span></div>
              <div className="flex justify-between"><span>Storage type</span><span>{item.type}</span></div>
              <div className="flex justify-between"><span>Contact</span><span>{item.contact}</span></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
