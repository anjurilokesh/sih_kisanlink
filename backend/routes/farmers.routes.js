import express from 'express';

const router = express.Router();

const farmers = [
  {
    id: 'f1',
    name: 'Ramesh Patil',
    mobile: '9876543210',
    email: 'ramesh@example.com',
    state: 'Maharashtra',
    district: 'Nashik',
    village: 'Pimpalgaon',
    preferredLanguage: 'hi',
    role: 'farmer',
  },
];

router.get('/', (req, res) => {
  res.json({ success: true, data: farmers, source: 'demo-data' });
});

router.post('/', (req, res) => {
  const farmer = { id: Date.now().toString(), ...req.body };
  farmers.push(farmer);
  res.status(201).json({ success: true, data: farmer, source: 'demo-data' });
});

export default router;
