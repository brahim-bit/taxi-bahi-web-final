import { NextRequest, NextResponse } from "next/server";

const NIGHT_TARIFF_START = "21:00";
const NIGHT_TARIFF_END = "05:00";

type GoogleGeocodingResult = {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  countryCode: string;
  administrativeArea: string;
};

type GoogleRoute = {
  distanceMeters: number;
  durationSeconds: number;
};

class RouteLookupError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "RouteLookupError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getGoogleErrorMessage(value: unknown): string | undefined {
  if (!isRecord(value) || !isRecord(value.error) || typeof value.error.message !== "string") {
    return undefined;
  }
  return value.error.message;
}

function parseGoogleGeocodingResult(value: unknown): GoogleGeocodingResult | null {
  if (!isRecord(value) || !isRecord(value.geometry) || !isRecord(value.geometry.location)) {
    return null;
  }
  if (
    typeof value.formatted_address !== "string" ||
    typeof value.geometry.location.lat !== "number" ||
    !Number.isFinite(value.geometry.location.lat) ||
    typeof value.geometry.location.lng !== "number" ||
    !Number.isFinite(value.geometry.location.lng) ||
    !Array.isArray(value.address_components)
  ) {
    return null;
  }

  let countryCode = "";
  let administrativeArea = "";
  for (const component of value.address_components) {
    if (
      !isRecord(component) ||
      !Array.isArray(component.types) ||
      typeof component.long_name !== "string" ||
      typeof component.short_name !== "string"
    ) {
      continue;
    }

    if (component.types.includes("country")) {
      countryCode = component.short_name.toUpperCase();
    }
    if (component.types.includes("administrative_area_level_1")) {
      administrativeArea = component.long_name;
    }
  }

  return {
    formattedAddress: value.formatted_address,
    latitude: value.geometry.location.lat,
    longitude: value.geometry.location.lng,
    countryCode,
    administrativeArea
  };
}

function isAllowedLocation(location: GoogleGeocodingResult): boolean {
  if (location.countryCode === "DZ") {
    return true;
  }

  return location.countryCode === "TN" && /tunis|تونس/i.test(location.administrativeArea);
}

async function fetchGoogleJson(url: URL, init: RequestInit, timeoutMessage: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, { ...init, signal: AbortSignal.timeout(15000), cache: "no-store" });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new RouteLookupError(timeoutMessage, 504);
    }
    throw new RouteLookupError("تعذر الاتصال بخدمة Google Maps. تحقق من الإعدادات وحاول مجددًا.", 502);
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new RouteLookupError("تعذر قراءة استجابة Google Maps. حاول مجددًا.", 502);
  }

  if (!response.ok) {
    const detail = getGoogleErrorMessage(result);
    if (response.status === 429) {
      throw new RouteLookupError("تجاوزت خدمة الخرائط حد الطلبات مؤقتًا. حاول لاحقًا.", 503);
    }
    if (response.status === 403) {
      throw new RouteLookupError(
        "رفضت Google Maps الطلب. تحقق من تفعيل Geocoding API وRoutes API والفوترة وقيود المفتاح.",
        503
      );
    }
    throw new RouteLookupError(detail ? `تعذر إكمال طلب Google Maps: ${detail}` : "تعذر حساب المسار. حاول مجددًا.", 502);
  }

  return result;
}

async function geocodeAddress(address: string, label: string, apiKey: string): Promise<GoogleGeocodingResult> {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("language", "ar");
  url.searchParams.set("key", apiKey);

  const response = await fetchGoogleJson(url, {}, "انتهت مهلة البحث عن الموقع. حاول مجددًا.");
  if (!isRecord(response) || typeof response.status !== "string" || !Array.isArray(response.results)) {
    throw new RouteLookupError("استلمنا نتيجة غير صالحة من خدمة تحديد المواقع.", 502);
  }
  if (response.status === "ZERO_RESULTS") {
    throw new RouteLookupError(`لم نعثر على ${label}. تحقق من العنوان ثم حاول مجددًا.`, 422);
  }
  if (response.status !== "OK") {
    if (response.status === "OVER_QUERY_LIMIT") {
      throw new RouteLookupError("تجاوزت حصة Google Maps المتاحة. تحقق من إعدادات الفوترة والحصة.", 503);
    }
    if (response.status === "REQUEST_DENIED") {
      throw new RouteLookupError("رفضت Google Maps البحث. تحقق من تفعيل Geocoding API وصلاحية المفتاح.", 503);
    }
    throw new RouteLookupError("تعذر البحث عن الموقع في Google Maps. حاول مجددًا.", 502);
  }

  const results = response.results
    .map(parseGoogleGeocodingResult)
    .filter((result): result is GoogleGeocodingResult => result !== null);
  const location = results.find(isAllowedLocation);

  if (!location) {
    throw new RouteLookupError(
      `${label} خارج نطاق الخدمة. نقبل العناوين في الجزائر أو في ولاية تونس فقط.`,
      422
    );
  }

  return location;
}

function parseGoogleRoute(value: unknown): GoogleRoute | null {
  if (!isRecord(value) || !Array.isArray(value.routes)) {
    return null;
  }
  const route = value.routes[0];
  if (!isRecord(route) || typeof route.distanceMeters !== "number" || !Number.isFinite(route.distanceMeters)) {
    return null;
  }
  if (typeof route.duration !== "string" || !route.duration.endsWith("s")) {
    return null;
  }

  const durationSeconds = Number(route.duration.slice(0, -1));
  if (!Number.isFinite(durationSeconds)) {
    return null;
  }

  return { distanceMeters: route.distanceMeters, durationSeconds };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "بيانات الطلب غير صالحة." }, { status: 400 });
  }

  if (
    !isRecord(body) ||
    typeof body.origin !== "string" ||
    typeof body.destination !== "string" ||
    typeof body.startTime !== "string" ||
    !body.origin.trim() ||
    !body.destination.trim() ||
    body.origin.length > 200 ||
    body.destination.length > 200 ||
    !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(body.startTime)
  ) {
    return NextResponse.json(
      { error: "تحقق من موقعي الانطلاق والوجهة ووقت الانطلاق، ويجب ألا يتجاوز كل عنوان 200 حرف." },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "أضف GOOGLE_MAPS_API_KEY إلى ملف .env.local لتفعيل حساب المسار." },
      { status: 503 }
    );
  }

  try {
    const origin = await geocodeAddress(body.origin.trim(), "نقطة الانطلاق", apiKey);
    const destination = await geocodeAddress(body.destination.trim(), "الوجهة", apiKey);
    const routeResponse = await fetchGoogleJson(
      new URL("https://routes.googleapis.com/directions/v2:computeRoutes"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "routes.distanceMeters,routes.duration"
        },
        body: JSON.stringify({
          origin: { location: { latLng: { latitude: origin.latitude, longitude: origin.longitude } } },
          destination: { location: { latLng: { latitude: destination.latitude, longitude: destination.longitude } } },
          travelMode: "DRIVE",
          routingPreference: "TRAFFIC_UNAWARE",
          languageCode: "ar",
          units: "METRIC"
        })
      },
      "انتهت مهلة حساب مسار القيادة. حاول مجددًا."
    );
    const route = parseGoogleRoute(routeResponse);

    if (!route) {
      throw new RouteLookupError("لم نعثر على مسار قيادة صالح بين الموقعين.", 422);
    }

    const tariffPeriod =
      body.startTime >= NIGHT_TARIFF_START || body.startTime < NIGHT_TARIFF_END ? "ليلية" : "نهارية";
    const rateDZDPerKm = tariffPeriod === "ليلية" ? 5 : 4;
    const mapUrl = new URL("https://www.google.com/maps/dir/");
    mapUrl.searchParams.set("api", "1");
    mapUrl.searchParams.set("origin", origin.formattedAddress);
    mapUrl.searchParams.set("destination", destination.formattedAddress);
    mapUrl.searchParams.set("travelmode", "driving");

    return NextResponse.json({
      distanceKm: Math.round((route.distanceMeters / 1000) * 10) / 10,
      durationMinutes: Math.round(route.durationSeconds / 60),
      fareDZD: Math.round((route.distanceMeters / 1000) * rateDZDPerKm),
      rateDZDPerKm,
      tariffPeriod,
      originName: origin.formattedAddress,
      destinationName: destination.formattedAddress,
      mapUrl: mapUrl.toString()
    });
  } catch (error) {
    if (error instanceof RouteLookupError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Unexpected Google Maps route lookup failure:", error);
    return NextResponse.json({ error: "حدث خطأ غير متوقع أثناء حساب المسافة. حاول مجددًا." }, { status: 500 });
  }
}
