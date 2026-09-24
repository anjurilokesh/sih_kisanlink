import express from 'express';
import { randomInt } from 'node:crypto';

const router = express.Router();

const transactions = [
  {
    id: 't1',
    farmer: 'Ramesh Patil',
    buyer: 'Suryodaya Foods',
    crop: 'Rice',
    quantity: 1200,
    amount: 120000,
    status: 'Offer Accepted',
    verified: false,
    paymentStatus: 'Not started',
    verificationCode: '482917',
    lastUpdated: '2026-09-23',
  },
  {
    id: 't2',
    farmer: 'Ramesh Patil',
    buyer: 'Green Harvest Traders',
    crop: 'Rice',
    quantity: 900,
    amount: 98000,
    status: 'Payment Completed',
    verified: true,
    paymentStatus: 'Completed',
    lastUpdated: '2026-09-22',
  },
];

const serializeTransaction = (transaction, role) => {
  if (role === 'buyer') {
    const { verificationCode, ...buyerView } = transaction;
    return buyerView;
  }
  return transaction;
};

router.get('/', (req, res) => {
  const role = req.query.role;
  const data = transactions
    .filter((transaction) => role !== 'farmer' || transaction.farmer === 'Ramesh Patil')
    .filter((transaction) => role !== 'buyer' || transaction.buyer === 'Suryodaya Foods')
    .map((transaction) => serializeTransaction(transaction, role));
  res.json({ success: true, data, source: 'demo-data' });
});

router.post('/', (req, res) => {
  const item = {
    id: Date.now().toString(),
    farmer: req.body.farmer || 'Ramesh Patil',
    buyer: req.body.buyer || 'Suryodaya Foods',
    crop: req.body.crop || 'Rice',
    quantity: Number(req.body.quantity) || 0,
    amount: Number(req.body.amount) || 0,
    status: 'Awaiting Buyer OTP',
    verified: false,
    verificationCode: String(randomInt(100000, 1000000)),
    lastUpdated: new Date().toISOString().split('T')[0],
  };
  transactions.push(item);
  res.status(201).json({ success: true, data: item, source: 'demo-data' });
});

router.post('/:id/verify', (req, res) => {
  const transaction = transactions.find((item) => item.id === req.params.id);
  if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
  if (transaction.verified) return res.json({ success: true, data: transaction, message: 'Transaction is already verified.' });
  if (String(req.body.otp || '') !== transaction.verificationCode) {
    return res.status(400).json({ success: false, message: 'Incorrect OTP. Ask the farmer for the six-digit code.' });
  }

  transaction.verified = true;
  transaction.status = 'Payment Completed';
  transaction.lastUpdated = new Date().toISOString().split('T')[0];
  res.json({ success: true, data: serializeTransaction(transaction, 'buyer'), message: 'Purchase verified successfully.' });
});

router.post('/:id/payment', (req, res) => {
  const transaction = transactions.find((item) => item.id === req.params.id);
  const upiId = String(req.body.upiId || '').trim();
  if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
  if (!transaction.verified) return res.status(400).json({ success: false, message: 'Verify the farmer OTP before starting payment.' });
  if (!/^[\w.-]+@[\w.-]+$/.test(upiId)) return res.status(400).json({ success: false, message: 'Enter a valid UPI ID, for example farmer@upi.' });

  transaction.upiId = upiId;
  transaction.paymentStatus = 'UPI initiated';
  transaction.status = 'UPI Payment Initiated';
  transaction.lastUpdated = new Date().toISOString().split('T')[0];
  res.json({ success: true, data: serializeTransaction(transaction, 'buyer'), message: 'UPI payment linked to this transaction.' });
});

export default router;
