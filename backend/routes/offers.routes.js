import express from 'express';

const router = express.Router();

const offers = [
  {
    id: 'o1',
    buyer: 'Suryodaya Foods',
    crop: 'Rice',
    quantity: 1200,
    offeredPrice: 2650,
    location: 'Nashik',
    status: 'Pending',
    date: '2026-09-23',
  },
  {
    id: 'o2',
    buyer: 'Green Harvest Traders',
    crop: 'Rice',
    quantity: 900,
    offeredPrice: 2580,
    location: 'Pune',
    status: 'Accepted',
    date: '2026-09-22',
  },
];

router.get('/', (req, res) => {
  const { crop, location, minPrice, maxPrice } = req.query;
  const filtered = offers.filter((offer) => {
    const cropMatches = !crop || offer.crop.toLowerCase().includes(String(crop).toLowerCase());
    const locationMatches = !location || offer.location.toLowerCase().includes(String(location).toLowerCase());
    const minMatches = !minPrice || offer.offeredPrice >= Number(minPrice);
    const maxMatches = !maxPrice || offer.offeredPrice <= Number(maxPrice);
    return cropMatches && locationMatches && minMatches && maxMatches;
  });
  res.json({ success: true, data: filtered, source: 'marketplace-listings' });
});

router.post('/', (req, res) => {
  const { crop, quantity, offeredPrice, quality, location, imageData, imageName, sellerType, sellerId } = req.body;
  if (!crop || !Number(quantity) || !Number(offeredPrice) || !quality || !location) {
    return res.status(400).json({ success: false, message: 'Crop, quantity, price, quality, and location are required.' });
  }
  if (imageData && !String(imageData).startsWith('data:image/')) {
    return res.status(400).json({ success: false, message: 'Crop image must be a valid image upload.' });
  }
  const newOffer = {
    id: Date.now().toString(),
    buyer: req.body.buyer || 'Open marketplace listing',
    crop: String(crop).trim(),
    quantity: Number(quantity),
    offeredPrice: Number(offeredPrice),
    quality: String(quality).trim(),
    location: String(location).trim(),
    imageData: imageData || '',
    imageName: imageName || '',
    sellerType: sellerType || 'farmer',
    sellerId: sellerId || null,
    status: 'Pending',
    date: new Date().toISOString().split('T')[0],
  };
  offers.push(newOffer);
  res.status(201).json({ success: true, data: newOffer, source: 'demo-data' });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const index = offers.findIndex((offer) => offer.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Offer not found' });
  }

  offers[index] = { ...offers[index], ...req.body };
  res.json({ success: true, data: offers[index] });
});

export default router;
