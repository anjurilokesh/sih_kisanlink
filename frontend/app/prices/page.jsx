'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const cropImages = {
  rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=85',
  wheat: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=85',
  cotton: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7f/Mature_cotton_boll_in_Raichur%2C_Karnataka.jpg/960px-Mature_cotton_boll_in_Raichur%2C_Karnataka.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=900&q=85',
  tomato: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=85',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=85',
  maize: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=900&q=85',
  sugarcane: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Cut_sugarcane.jpg/960px-Cut_sugarcane.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
};

const fallbackImage = 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=85';
const locationOptions = ['All India', 'Andhra Pradesh', 'Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Madhya Pradesh'];

export default function PricesPage() {
  const { t } = useLanguage();
  const [prices, setPrices] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState('');
  const [uploadRole, setUploadRole] = useState('farmer');
  const [uploadQuantity, setUploadQuantity] = useState('');
  const [uploadPrice, setUploadPrice] = useState('');
  const [uploadQuality, setUploadQuality] = useState('Grade A');
  const [uploadLocation, setUploadLocation] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [source, setSource] = useState('');
  const [sourceUrl, setSourceUrl] = useState('https://data.gov.in/');
  const [live, setLive] = useState(false);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('All India');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const query = location === 'All India' ? '' : `?location=${encodeURIComponent(location)}`;
    setLoading(true);
    setError('');
    fetch(`${API_URL}/prices/latest${query}`)
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load daily prices.');
        return response.json();
      })
      .then((payload) => {
        setPrices(payload.data || []);
        setSource(payload.source || 'data.gov.in');
        setSourceUrl(payload.sourceUrl || 'https://data.gov.in/');
        setLive(Boolean(payload.live));
      })
      .catch((fetchError) => setError(fetchError.message))
      .finally(() => setLoading(false));
  }, [location]);

  const visiblePrices = useMemo(() => prices.filter((item) => item.crop.toLowerCase().includes(search.toLowerCase())), [prices, search]);
  const latestDate = prices.reduce((latest, item) => (item.date > latest ? item.date : latest), '');
  const formattedDate = latestDate ? new Date(`${latestDate}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Awaiting update';

  const openUpload = (crop) => {
    setSelectedCrop(crop);
    setUploadFile(null);
    setUploadPreview('');
    setUploadMessage('');
    setUploadQuantity('');
    setUploadPrice(String(crop.price));
    setUploadQuality('Grade A');
    setUploadLocation('');
  };

  const closeUpload = () => {
    setSelectedCrop(null);
    setUploadFile(null);
    setUploadPreview('');
    setUploadMessage('');
    setUploadQuantity('');
    setUploadPrice('');
    setUploadQuality('Grade A');
    setUploadLocation('');
  };

  const chooseUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
    setUploadMessage('');
  };

  const submitUpload = async (event) => {
    event.preventDefault();
    if (!uploadFile || !uploadQuantity || !uploadPrice || !uploadLocation) {
      setUploadMessage('Add a crop image, quantity, asking price, and location before listing.');
      return;
    }
    setUploading(true);
    setUploadMessage('');
    try {
      const response = await fetch(`${API_URL}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer: uploadRole === 'buyer' ? 'Buyer listing' : 'Farmer listing',
          sellerType: uploadRole,
          crop: selectedCrop.crop,
          quantity: Number(uploadQuantity),
          offeredPrice: Number(uploadPrice),
          location: uploadLocation,
          imageName: uploadFile.name,
          imageData: uploadPreview,
          quality: uploadQuality,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Unable to list this crop.');
      setUploadMessage(`${selectedCrop.crop} is listed for sale at ₹${Number(uploadPrice).toLocaleString('en-IN')} per quintal. Listing ID: ${payload.data.id}`);
    } catch (submitError) {
      setUploadMessage(submitError.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="mb-8 overflow-hidden rounded-3xl bg-[#173d2a] px-6 py-8 text-white shadow-soft md:px-10 md:py-10">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-lime-300">Daily mandi watch</p>
          <h1 className="text-3xl font-black tracking-tight md:text-5xl">Crop prices, with the market behind them.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50">Compare the latest available modal prices across Indian markets, then ask Kisan AI what the numbers mean for your crop.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/chatbot" className="btn-primary bg-lime-300 text-[#173d2a] hover:bg-lime-200">Ask Kisan AI</Link>
            <a href={sourceUrl} target="_blank" rel="noreferrer" className="btn-secondary border-white/30 bg-transparent text-white hover:bg-white/10">Open official source</a>
          </div>
        </div>
      </section>

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-brand-700">Price board</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">{t('cropPrices')}</h2>
          <p className="mt-1 text-sm text-slate-500">Updated through {formattedDate} · INR per quintal</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${live ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            {live ? 'Live data.gov.in feed' : 'Local fallback data'}
          </span>
          <label className="sr-only" htmlFor="crop-search">Search crops</label>
          <input id="crop-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search crops" className="w-40" />
          <label className="sr-only" htmlFor="price-location">Choose location</label>
          <select id="price-location" value={location} onChange={(event) => setLocation(event.target.value)} className="w-44">
            {locationOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
      </div>

      {loading && <div className="card p-8 text-center text-slate-500">Loading today&apos;s crop prices...</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>}
      {!loading && !error && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {visiblePrices.map((item) => (
            <article key={`${item.crop}-${item.market}`} className="card overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
              <button type="button" onClick={() => openUpload(item)} className="group relative block h-44 w-full overflow-hidden text-left" aria-label={`Upload your ${item.crop} crop photo`}>
                <img src={cropImages[item.crop.toLowerCase()] || fallbackImage} alt={`${item.crop} crop`} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                <span className="absolute inset-x-3 bottom-3 rounded-xl bg-slate-950/75 px-3 py-2 text-center text-sm font-bold text-white opacity-0 transition group-hover:opacity-100 group-focus:opacity-100">Click to upload your {item.crop}</span>
              </button>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{item.crop}</h3>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{item.variety}</p>
                  </div>
                  <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">Modal</span>
                </div>
                <p className="mt-5 text-3xl font-black text-brand-700">₹{item.price.toLocaleString('en-IN')}</p>
                <p className="mt-1 text-xs text-slate-500">per quintal · {item.market}</p>
                <div className="mt-4 flex justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span>Range</span>
                  <span className="font-semibold text-slate-700">₹{item.minPrice.toLocaleString('en-IN')} - ₹{item.maxPrice.toLocaleString('en-IN')}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{item.location}</p>
              </div>
            </article>
          ))}
        </div>
      )}
      {!loading && !error && !visiblePrices.length && <div className="card p-8 text-center text-slate-500">No crop matches that search.</div>}
      <p className="mt-6 text-xs text-slate-500">Source: <a href={sourceUrl} target="_blank" rel="noreferrer" className="font-semibold text-brand-700 underline">{source}</a>. Prices are indicative modal mandi prices and may vary by market, grade, and arrival time.</p>

      {selectedCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeUpload()}>
          <section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="upload-crop-title">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-brand-700">Crop photo</p>
                <h2 id="upload-crop-title" className="mt-1 text-2xl font-black text-slate-900">Upload your {selectedCrop.crop}</h2>
                <p className="mt-1 text-sm text-slate-500">Add your crop details and list it for sale.</p>
              </div>
              <button type="button" onClick={closeUpload} className="btn-secondary px-3" aria-label="Close upload dialog">×</button>
            </div>

            <form onSubmit={submitUpload} className="mt-6 space-y-4">
              <div>
                <label className="label" htmlFor="upload-role">I am uploading as</label>
                <select id="upload-role" value={uploadRole} onChange={(event) => setUploadRole(event.target.value)} className="w-full">
                  <option value="farmer">Farmer</option>
                  <option value="buyer">Buyer</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="crop-photo">Crop image</label>
                <input id="crop-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseUpload} className="w-full cursor-pointer bg-white text-sm" />
                <p className="mt-1 text-xs text-slate-500">JPG, PNG, or WebP. Choose a clear photo of the crop.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="crop-quantity">Quantity (kg)</label>
                  <input id="crop-quantity" type="number" min="1" value={uploadQuantity} onChange={(event) => setUploadQuantity(event.target.value)} placeholder="e.g. 500" className="w-full" />
                </div>
                <div>
                  <label className="label" htmlFor="crop-price">Asking price (₹/qtl)</label>
                  <input id="crop-price" type="number" min="1" value={uploadPrice} onChange={(event) => setUploadPrice(event.target.value)} className="w-full" />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="crop-quality">Quality grade</label>
                <select id="crop-quality" value={uploadQuality} onChange={(event) => setUploadQuality(event.target.value)} className="w-full"><option>Grade A</option><option>Grade B</option><option>Organic</option><option>Standard</option></select>
              </div>
              <div>
                <label className="label" htmlFor="crop-location">Pickup location</label>
                <input id="crop-location" value={uploadLocation} onChange={(event) => setUploadLocation(event.target.value)} placeholder="Village, district, state" className="w-full" />
              </div>
              {uploadPreview && <img src={uploadPreview} alt="Selected crop preview" className="h-48 w-full rounded-xl object-cover" />}
              {uploadMessage && <p className={`rounded-xl px-3 py-2 text-sm ${uploadMessage.includes('listed') ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`} aria-live="polite">{uploadMessage}</p>}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeUpload} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={uploading}>{uploading ? 'Listing crop...' : 'List crop for sale'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
