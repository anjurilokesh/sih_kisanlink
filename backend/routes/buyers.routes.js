import express from 'express';

const router = express.Router();

const buyers = [
  {
    id: 'b1',
    name: 'Suryodaya Foods',
    crop: 'Rice',
    quantityRequired: 1500,
    offeredPrice: 2650,
    location: 'Nashik',
    distance: 18,
    rating: 4.9,
    verified: true,
    transactionHistory: 42,
  },
  {
    id: 'b2',
    name: 'Green Harvest Traders',
    crop: 'Rice',
    quantityRequired: 2200,
    offeredPrice: 2580,
    location: 'Pune',
    distance: 26,
    rating: 4.6,
    verified: true,
    transactionHistory: 28,
  },
  {
    id: 'b3',
    name: 'AgriConnect Buyers',
    crop: 'Rice',
    quantityRequired: 950,
    offeredPrice: 2450,
    location: 'Aurangabad',
    distance: 40,
    rating: 4.1,
    verified: false,
    transactionHistory: 14,
  },
];

router.get('/', (req, res) => {
  const query = String(req.query.q || '').toLowerCase();
  const verifiedOnly = req.query.verified === 'true';
  const filtered = buyers.filter((buyer) => {
    const matchesQuery = !query || [buyer.name, buyer.crop, buyer.location].some((value) => value.toLowerCase().includes(query));
    return matchesQuery && (!verifiedOnly || buyer.verified);
  });
  res.json({ success: true, data: filtered, source: 'verified-buyer-directory' });
});

router.get('/match', (req, res) => {
  const crop = (req.query.crop || 'Rice').toString();
  const filtered = buyers.filter((buyer) => buyer.crop.toLowerCase() === crop.toLowerCase());
  res.json({ success: true, data: filtered, source: 'demo-data' });
});

export default router;
