import { NextRequest, NextResponse } from "next/server";

const NOMINATIM_USER_AGENT = "TaxiBahi/1.0 (https://github.com/brahim-bit/taxi-bahi-web-final)";
const GEOCODING_INTERVAL_MS = 1100;
const NIGHT_TARIFF_START = "21:00";
const NIGHT_TARIFF_END = "05:00";

type GeocodingResult = {
  lat: string;
  lon: string;
};

type OsrmRouteResponse = {
  code: string;
  routes: Array<{
    distance: number;
    duration: number;
  }>;
};

function isGeocodingResult(value: unknown): value is GeocodingResult {
  if (typeof value !== "object" || value === null || !("lat" in value) || !("lon" in value)) {
    return false;
  }

  return (
    typeof value.lat === "string" &&
    typeof value.lon === "string" &&
    Number.isFinite(Number(value.lat)) &&
    Number.isFinite(Number(value.lon))
  );
}

function isOsrmRouteResponse(value: unknown): value is OsrmRouteResponse {
  if (typeof value !== "object" || value === null || !("code" in value) || !("routes" in value)) {
    return false;
  }
  if (typeof value.code !== "string" || !Array.isArray(value.routes)) {
    return false;
  }

  return value.routes.every(
    (route) =>
      typeof route === "object" &&
      route !== null &&
      "distance" in route &&
      "duration" in route &&
      typeof route.distance === "number" &&
      Number.isFinite(route.distance) &&
      typeof route.duration === "number" &&
      Number.isFinite(route.duration)
  );
}

class RouteLookupError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "RouteLookupError";
  }
}

let nextGeocodingRequestAt = 0;

async function geocode(address: string, label: string): Promise<GeocodingResult> {
  const waitMs = Math.max(0, nextGeocodingRequestAt - Date.now());
  nextGeocodingRequestAt = Math.max(Date.now(), nextGeocodingRequestAt) + GEOCODING_INTERVAL_MS;

  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", address);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "dz");

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "Accept-Language": "ar",
        "User-Agent": NOMINATIM_USER_AGENT
      },
      signal: AbortSignal.timeout(12000),
      cache: "no-store"
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new RouteLookupError("انتهت مهلة البحث عن المواقع. حاول مجددًا.", 504);
    }
    throw new RouteLookupError("تعذر الاتصال بخدمة البحث عن المواقع. حاول مجددًا.", 502);
  }

  if (response.status === 429) {
    throw new RouteLookupError("خدمة الخرائط مشغولة حاليًا. انتظر قليلًا ثم حاول مجددًا.", 503);
  }
  if (!response.ok) {
    throw new RouteLookupError("تعذر البحث عن الموقع على الخريطة. حاول مجددًا.", 502);
  }

  let locations: unknown;
  try {
    locations = await response.json();
  } catch {
    throw new RouteLookupError("تعذر قراءة نتيجة البحث عن الموقع. حاول مجددًا.", 502);
  }

  if (!Array.isArray(locations)) {
    throw new RouteLookupError("استلمنا نتيجة غير صالحة للبحث عن الموقع. حاول مجددًا.", 502);
  }

  const location = locations[0];
  if (!isGeocodingResult(location)) {
    throw new RouteLookupError(`لم نعثر على ${label}. أضف اسم الحي والمدينة ثم حاول مجددًا.`, 422);
  }

  return location;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "بيانات الطلب غير صالحة." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || !("origin" in body) || !("destination" in body)) {
    return NextResponse.json({ error: "أدخل موقعي الانطلاق والوجهة." }, { status: 400 });
  }

  if (!("startTime" in body)) {
    return NextResponse.json({ error: "أدخل وقت الانطلاق لحساب التعرفة المناسبة." }, { status: 400 });
  }

  const { origin, destination, startTime } = body;
  if (
    typeof origin !== "string" ||
    typeof destination !== "string" ||
    typeof startTime !== "string" ||
    !origin.trim() ||
    !destination.trim() ||
    origin.length > 200 ||
    destination.length > 200 ||
    !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(startTime)
  ) {
    return NextResponse.json(
      { error: "تحقق من موقعي الانطلاق والوجهة ووقت الانطلاق، ويجب ألا يتجاوز كل عنوان 200 حرف." },
      { status: 400 }
    );
  }

  try {
    const originLocation = await geocode(origin.trim(), "نقطة الانطلاق");
    const destinationLocation = await geocode(destination.trim(), "الوجهة");

    const coordinates = [
      `${originLocation.lon},${originLocation.lat}`,
      `${destinationLocation.lon},${destinationLocation.lat}`
    ].join(";");
    let routeResponse: Response;
    try {
      routeResponse = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=false`,
        { signal: AbortSignal.timeout(15000), cache: "no-store" }
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "TimeoutError") {
        throw new RouteLookupError("انتهت مهلة حساب المسار. حاول مجددًا.", 504);
      }
      throw new RouteLookupError("تعذر الاتصال بخدمة حساب مسار القيادة. حاول مجددًا.", 502);
    }

    if (routeResponse.status === 429) {
      throw new RouteLookupError("خدمة حساب المسار مشغولة حاليًا. انتظر قليلًا ثم حاول مجددًا.", 503);
    }
    if (!routeResponse.ok) {
      throw new RouteLookupError("تعذر حساب مسار القيادة. حاول مجددًا.", 502);
    }

    let routeData: unknown;
    try {
      routeData = await routeResponse.json();
    } catch {
      throw new RouteLookupError("تعذر قراءة نتيجة حساب المسار. حاول مجددًا.", 502);
    }

    if (!isOsrmRouteResponse(routeData)) {
      throw new RouteLookupError("استلمنا نتيجة غير صالحة لحساب المسار. حاول مجددًا.", 502);
    }

    const route = routeData.routes[0];
    if (routeData.code !== "Ok" || !route) {
      throw new RouteLookupError("لم نعثر على مسار قيادة بين الموقعين. تحقق من العنوانين وحاول مجددًا.", 422);
    }

    const tariffPeriod =
      startTime >= NIGHT_TARIFF_START || startTime < NIGHT_TARIFF_END ? "ليلية" : "نهارية";
    const rateDZDPerKm = tariffPeriod === "ليلية" ? 5 : 4;
    const mapUrl = new URL("https://www.openstreetmap.org/directions");
    mapUrl.searchParams.set("engine", "fossgis_osrm_car");
    mapUrl.searchParams.set(
      "route",
      `${originLocation.lat},${originLocation.lon};${destinationLocation.lat},${destinationLocation.lon}`
    );

    return NextResponse.json({
      distanceKm: Math.round((route.distance / 1000) * 10) / 10,
      durationMinutes: Math.round(route.duration / 60),
      fareDZD: Math.round((route.distance / 1000) * rateDZDPerKm),
      rateDZDPerKm,
      tariffPeriod,
      mapUrl: mapUrl.toString()
    });
  } catch (error) {
    if (error instanceof RouteLookupError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Unexpected route distance lookup failure:", error);
    return NextResponse.json({ error: "حدث خطأ غير متوقع أثناء حساب المسافة. حاول مجددًا." }, { status: 500 });
  }
}
