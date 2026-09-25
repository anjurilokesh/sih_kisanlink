import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import marketsRoutes from './routes/markets.routes.js';
import pricesRoutes from './routes/prices.routes.js';
import buyersRoutes from './routes/buyers.routes.js';
import offersRoutes from './routes/offers.routes.js';
import transactionsRoutes from './routes/transactions.routes.js';
import mapsRoutes from './routes/maps.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js';
import alertsRoutes from './routes/alerts.routes.js';
import farmersRoutes from './routes/farmers.routes.js';
import verificationRoutes from './routes/verification.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'KisanLink backend is running' });
});

app.use('/api/markets', marketsRoutes);
app.use('/api/prices', pricesRoutes);
app.use('/api/buyers', buyersRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/chat', chatbotRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/farmers', farmersRoutes);
app.use('/api/verification', verificationRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`KisanLink API listening on http://localhost:${PORT}`);
});

export default app;
