# taxi-bahi-web-final

Taxi Bahi is a Next.js booking website.

## Run locally

```bash
npm install
npm run dev
```

## Distance-based booking estimate

Enter an origin and destination in Algeria, then select **احسب المسافة والتكلفة** to estimate the driving distance and duration. The estimate uses OpenStreetMap's public Nominatim geocoder and OSRM routing service. Addresses entered in the form are sent to those services for lookup. Their public endpoints are rate-limited and have no availability guarantee, so this setup is suitable for a small demonstration; a production service with higher traffic should use a dedicated provider.

When a search returns a province or region before a matching city, the app prefers the more specific result. The selected origin and destination names are shown with the route estimate so they can be checked against the map link.

The estimate is based on the selected departure time and suggested driving route:

- Daytime (06:00–21:59): **400 DZD per 100 km (4 DZD/km)**.
- Night (21:00–04:59): **150 DZD per 30 km (5 DZD/km)**.

The estimate is rounded to the nearest dinar and is not a confirmed fare. Changing the departure time requires recalculating the quote. The booking request opens WhatsApp with the route distance, applicable rate, and estimated price for confirmation.
