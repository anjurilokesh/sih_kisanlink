import express from 'express';

const router = express.Router();

const markets = [
  {
    id: 'm1',
    name: 'APMC Mandis',
    location: 'Nashik',
    state: 'Maharashtra',
    crop: 'Rice',
    minPrice: 2200,
    maxPrice: 2600,
    modalPrice: 2450,
    demand: 'High',
    distance: 18,
    travelTime: '35 min',
    rating: 4.8,
    date: '2026-09-23',
  },
  {
    id: 'm2',
    name: 'Hapur Market',
    location: 'Hapur',
    state: 'Uttar Pradesh',
    crop: 'Rice',
    minPrice: 2100,
    maxPrice: 2550,
    modalPrice: 2380,
    demand: 'Medium',
    distance: 28,
    travelTime: '55 min',
    rating: 4.5,
    date: '2026-09-23',
  },
  {
    id: 'm3',
    name: 'Vijayawada APMC',
    location: 'Vijayawada',
    state: 'Andhra Pradesh',
    crop: 'Rice',
    minPrice: 2300,
    maxPrice: 2700,
    modalPrice: 2520,
    demand: 'High',
    distance: 32,
    travelTime: '1 hr 10 min',
    rating: 4.7,
    date: '2026-09-23',
  },
];

router.get('/', (req, res) => {
  res.json({ success: true, data: markets, source: 'demo-data' });
});

router.get('/nearby', (req, res) => {
  res.json({
    success: true,
    data: markets.map((market) => ({
      ...market,
      nearby: true,
    })),
    source: 'demo-data',
  });
});

export default router;
