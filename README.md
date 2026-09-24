# KisanLink — Smart Farmer Market & Price Discovery Platform

KisanLink is a Smart India Hackathon 2026 prototype for improving market linkages and price discovery for Indian farmers. The platform connects farmers and FPOs with verified buyers, market price comparisons, logistics, storage, voice assistance, and multilingual AI guidance.

## Features

- Farmer registration and login with Firebase Authentication
- Multilingual interface covering 22 Indian languages plus English
- Voice-based crop input and multilingual chatbot
- Market price discovery and 7-day / 30-day price trends
- Buyer matching and verified buyer badges
- Google Maps-ready location, route, and distance calculations
- Daily mandi price feed from the Government Open Data API with local fallback
- Logistics and storage discovery
- Offer comparison and transaction tracking
- Price alerts and notifications
- Admin demo dashboard for market and buyer management

## Architecture

- Frontend: Next.js + Tailwind CSS + React
- Backend: Node.js + Express.js
- Database/Auth: Firebase Firestore + Firebase Authentication
- Maps: Google Maps API-ready integration
- AI: Secure backend API layer with pluggable LLM integration

## Folder structure

- backend/
- frontend/

## Installation

### 1. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

### 2. Backend setup

```bash
cd backend
npm install
npm run dev
```

### 3. Environment variables

Copy the example files and fill in your Firebase and API credentials:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

## Environment variables

Frontend `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Backend `.env`:

```env
PORT=5000
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
GOOGLE_MAPS_API_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.6-flash
DATA_GOV_IN_API_KEY=
```

`DATA_GOV_IN_API_KEY` enables live records from the [Government Open Data API](https://data.gov.in/). Without it, the backend uses clearly labelled local fallback data so the price board and chatbot remain usable during development. The latest normalized prices are available at `/api/prices/latest` and are included automatically in `/api/chat` context.

## Firebase setup

1. Create a Firebase project.
2. Enable Firebase Authentication and Firestore.
3. Add a web app and copy the config values.
4. Set up Firestore collections: farmers, buyers, markets, crops, marketPrices, offers, transactions, transportProviders, storageFacilities, notifications, priceAlerts, chatHistory.

## Google Maps setup

1. Enable Maps JavaScript API and Distance Matrix API.
2. Add your API key to the environment file.
3. Use the Maps component for route distance and travel time calculations.

## AI API setup

The app uses the secure backend endpoint `/api/chat`, which sends requests to Google Gemini. Add your Gemini API key to `backend/.env`; it is never exposed to the frontend. `GEMINI_MODEL` is optional and defaults to `gemini-3.6-flash`.

## Deployment

- Frontend: Vercel
- Backend: Render or Railway
- Database: Firebase Firestore

## Future improvements

- Real buyer verification workflows
- Admin approval dashboard with Firebase security rules
- Multi-language TTS and STT expansions
- Advanced negotiation and order management

## License

Project is for demonstration and prototype development.
