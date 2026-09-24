import express from 'express';
import { getLatestPrices, getPrices } from '../services/prices.service.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const result = await getPrices({ crop: req.query.crop, limit: req.query.limit });
  res.json({ success: true, ...result });
});

router.get('/latest', async (req, res) => {
  const result = await getLatestPrices({ location: req.query.location });
  res.json({ success: true, ...result });
});

router.get('/:crop', async (req, res) => {
  const result = await getPrices({ crop: req.params.crop });
  res.json({ success: true, ...result });
});

export default router;
