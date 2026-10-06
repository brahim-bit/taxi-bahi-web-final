"use client";

import { useState } from "react";

export type RouteQuote = {
  distanceKm: number;
  durationMinutes: number;
  fareDZD: number;
  rateDZDPerKm: number;
  tariffPeriod: "نهارية" | "ليلية";
  mapUrl: string;
};

type UseRouteQuoteResult = {
  quote: RouteQuote | null;
  isCalculating: boolean;
  error: string;
  calculateRoute: (origin: string, destination: string, startTime: string) => Promise<void>;
  clearQuote: () => void;
};

function isRouteQuote(value: unknown): value is RouteQuote {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const result = value as Record<string, unknown>;
  return (
    typeof result.distanceKm === "number" &&
    Number.isFinite(result.distanceKm) &&
    typeof result.durationMinutes === "number" &&
    Number.isFinite(result.durationMinutes) &&
    typeof result.fareDZD === "number" &&
    Number.isFinite(result.fareDZD) &&
    typeof result.rateDZDPerKm === "number" &&
    Number.isFinite(result.rateDZDPerKm) &&
    (result.tariffPeriod === "نهارية" || result.tariffPeriod === "ليلية") &&
    typeof result.mapUrl === "string"
  );
}

export function useRouteQuote(): UseRouteQuoteResult {
  const [quote, setQuote] = useState<RouteQuote | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState("");

  const clearQuote = () => {
    setQuote(null);
    setError("");
  };

  const calculateRoute = async (origin: string, destination: string, startTime: string) => {
    setIsCalculating(true);
    setQuote(null);
    setError("");

    try {
      const response = await fetch("/api/route-distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination, startTime }),
        signal: AbortSignal.timeout(45000)
      });

      let result: unknown;
      try {
        result = await response.json();
      } catch {
        throw new Error("تعذر قراءة استجابة خدمة حساب المسار. حاول مجددًا.");
      }

      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "تعذر حساب المسافة. حاول مجددًا.";
        throw new Error(message);
      }

      if (!isRouteQuote(result)) {
        throw new Error("استلمنا نتيجة غير صالحة للمسار. حاول مجددًا.");
      }

      setQuote(result);
    } catch (cause) {
      const message =
        cause instanceof Error && cause.name === "TimeoutError"
          ? "استغرق حساب المسافة وقتًا طويلًا. تحقق من الاتصال وحاول مجددًا."
          : cause instanceof Error
            ? cause.message
            : "تعذر حساب المسافة. حاول مجددًا.";
      setError(message);
    } finally {
      setIsCalculating(false);
    }
  };

  return { quote, isCalculating, error, calculateRoute, clearQuote };
}
