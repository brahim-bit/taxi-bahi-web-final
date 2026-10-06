# taxi-bahi-web-final

Taxi Bahi is a Next.js booking website.

## Run locally

```bash
npm install
npm run dev
```

## Google Maps distance-based booking estimate

Route estimates use Google Maps Geocoding API and Routes API on the server. Addresses are limited to Algeria and Tunis Governorate in Tunisia. Addresses entered in the booking form are sent to Google Maps for lookup.

To configure the server-side Google Maps key:

1. Enable billing and the **Geocoding API** and **Routes API** in Google Cloud.
2. Create an API key and restrict it to only those two APIs. Do not expose it in client-side code or commit it to Git.
3. Copy `.env.example` to `.env.local` and set `GOOGLE_MAPS_API_KEY` to your key.
4. Restart the development server after editing `.env.local`.

The estimate is based on the selected departure time and Google driving route:

- Daytime (06:00–21:59): **400 DZD per 100 km (4 DZD/km)**.
- Night (21:00–04:59): **150 DZD per 30 km (5 DZD/km)**.

The estimate is rounded to the nearest dinar and is not a confirmed fare. Changing the departure time recalculates the quote. The booking request opens WhatsApp with the route distance, applicable rate, and estimated price for confirmation.
