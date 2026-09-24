import express from 'express';

const router = express.Router();

const alerts = [
  { id: 'a1', crop: 'Rice', targetPrice: 2600, status: 'Active', message: 'Rice price reached target.' },
  { id: 'a2', crop: 'Wheat', targetPrice: 2400, status: 'Active', message: 'Wheat target is in progress.' },
];

router.get('/', (req, res) => {
  res.json({ success: true, data: alerts, source: 'demo-data' });
});

router.post('/', (req, res) => {
  const alert = { id: Date.now().toString(), ...req.body, status: 'Active' };
  alerts.push(alert);
  res.status(201).json({ success: true, data: alert, source: 'demo-data' });
});

export default router;
