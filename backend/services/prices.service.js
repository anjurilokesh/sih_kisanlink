const DATA_GOV_RESOURCE_ID = process.env.DATA_GOV_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070';
const DATA_GOV_BASE_URL = `https://api.data.gov.in/resource/${DATA_GOV_RESOURCE_ID}`;

const fallbackPrices = [
  { crop: 'Rice', variety: 'Common', market: 'APMC Mandis', location: 'India', price: 2600, minPrice: 2400, maxPrice: 2800, unit: 'INR/quintal', date: '2026-09-23' },
  { crop: 'Wheat', variety: 'FAQ', market: 'Vijayawada', location: 'Andhra Pradesh', price: 2180, minPrice: 2050, maxPrice: 2300, unit: 'INR/quintal', date: '2026-09-23' },
  { crop: 'Cotton', variety: 'Kapas', market: 'Hapur', location: 'Uttar Pradesh', price: 6540, minPrice: 6200, maxPrice: 6800, unit: 'INR/quintal', date: '2026-09-23' },
  { crop: 'Onion', variety: 'Local', market: 'Lasalgaon', location: 'Maharashtra', price: 1900, minPrice: 1600, maxPrice: 2200, unit: 'INR/quintal', date: '2026-09-23' },
  { crop: 'Tomato', variety: 'Local', market: 'Kolar', location: 'Karnataka', price: 2800, minPrice: 2400, maxPrice: 3200, unit: 'INR/quintal', date: '2026-09-23' },
  { crop: 'Potato', variety: 'Local', market: 'Agra', location: 'Uttar Pradesh', price: 1450, minPrice: 1200, maxPrice: 1700, unit: 'INR/quintal', date: '2026-09-23' },
  { crop: 'Maize', variety: 'Local', market: 'Davanagere', location: 'Karnataka', price: 2250, minPrice: 2100, maxPrice: 2400, unit: 'INR/quintal', date: '2026-09-23' },
  { crop: 'Sugarcane', variety: 'General', market: 'Muzaffarnagar', location: 'Uttar Pradesh', price: 355, minPrice: 340, maxPrice: 370, unit: 'INR/quintal', date: '2026-09-23' },
];

const firstValue = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const parseDate = (value) => {
  if (!value) return new Date().toISOString().slice(0, 10);
  const text = String(value).trim();
  const parts = text.split(/[/-]/);
  if (parts.length === 3 && parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  return text.slice(0, 10);
};

const normalizeRecord = (record) => ({
  crop: firstValue(record.Commodity, record.commodity, record.Crop, record.crop, 'Unknown crop'),
  variety: firstValue(record.Variety, record.variety, 'General'),
  market: firstValue(record.Market, record.market, 'Government mandi'),
  location: [record.District, record.State].filter(Boolean).join(', ') || 'India',
  price: Number(firstValue(record.Modal_Price, record.modal_price, record.ModalPrice, record.price, 0)),
  minPrice: Number(firstValue(record.Min_Price, record.min_price, record.minPrice, 0)),
  maxPrice: Number(firstValue(record.Max_Price, record.max_price, record.maxPrice, 0)),
  unit: 'INR/quintal',
  date: parseDate(firstValue(record.Arrival_Date, record.arrival_date, record.date)),
});

export const getPrices = async ({ crop, location, limit = 100 } = {}) => {
  const apiKey = process.env.DATA_GOV_IN_API_KEY;
  if (!apiKey) {
    const data = fallbackPrices.filter((item) => {
      const matchesCrop = !crop || item.crop.toLowerCase() === crop.toLowerCase();
      const matchesLocation = !location || item.location.toLowerCase().includes(location.toLowerCase());
      return matchesCrop && matchesLocation;
    });
    return { data: data.slice(0, limit), source: 'local-fallback', sourceUrl: 'https://data.gov.in/', live: false };
  }

  try {
    const params = new URLSearchParams({ 'api-key': apiKey, format: 'json', limit: String(Math.min(Number(limit) || 100, 1000)), offset: '0' });
    if (crop) params.set('filters[Commodity]', crop);
    if (location) params.set('filters[State]', location);
    const response = await fetch(`${DATA_GOV_BASE_URL}?${params}`);
    if (!response.ok) throw new Error(`Data.gov.in returned ${response.status}`);
    const payload = await response.json();
    const data = (payload.records || []).map(normalizeRecord).filter((item) => item.price > 0);
    return { data, source: 'data.gov.in', sourceUrl: `https://data.gov.in/catalog/all-india-daily-market-price-commodity`, live: true };
  } catch (error) {
    console.error('Unable to fetch daily crop prices:', error.message);
    const data = fallbackPrices.filter((item) => {
      const matchesCrop = !crop || item.crop.toLowerCase() === crop.toLowerCase();
      const matchesLocation = !location || item.location.toLowerCase().includes(location.toLowerCase());
      return matchesCrop && matchesLocation;
    });
    return { data: data.slice(0, limit), source: 'local-fallback', sourceUrl: 'https://data.gov.in/', live: false, error: 'Live source unavailable' };
  }
};

export const getLatestPrices = async ({ location } = {}) => {
  const result = await getPrices({ location, limit: 1000 });
  const latestByCrop = new Map();
  result.data.forEach((item) => {
    const key = item.crop.toLowerCase();
    if (!latestByCrop.has(key) || item.date > latestByCrop.get(key).date) latestByCrop.set(key, item);
  });
  return { ...result, data: [...latestByCrop.values()] };
};
