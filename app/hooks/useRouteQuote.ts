"use client";

import { useState } from "react";
import { useEffect } from "react";

export type RouteQuote = {
  distanceKm: number;
  durationMinutes: number;
  fareDZD: number;
  rateDZDPerKm: number;
  tariffPeriod: "نهارية" | "ليلية";
  originName: string;
  destinationName: string;
  mapUrl: string;
};

type UseRouteQuoteResult = {
  quote: RouteQuote | null;
  isCalculating: boolean;
  error: string;
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
    typeof result.originName === "string" &&
    typeof result.destinationName === "string" &&
    typeof result.mapUrl === "string"
  );
}

export function useRouteQuote(origin: string, destination: string, startTime: string): UseRouteQuoteResult {
  const [quote, setQuote] = useState<RouteQuote | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState("");

  const clearQuote = () => {
    setQuote(null);
    setError("");
  };

  useEffect(() => {
    const trimmedOrigin = origin.trim();
    const trimmedDestination = destination.trim();
    const controller = new AbortController();
    let requestTimeout: ReturnType<typeof setTimeout> | undefined;
    let didTimeout = false;
    let isCurrentRequest = true;

    setQuote(null);
    setError("");
    setIsCalculating(false);

    if (!trimmedOrigin || !trimmedDestination || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(startTime)) {
      return () => controller.abort();
    }

    const debounce = setTimeout(() => {
      setIsCalculating(true);
      requestTimeout = setTimeout(() => {
        didTimeout = true;
        controller.abort();
      }, 45000);

      void (async () => {
        try {
          const response = await fetch("/api/route-distance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ origin: trimmedOrigin, destination: trimmedDestination, startTime }),
            signal: controller.signal
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
          if (isCurrentRequest && !controller.signal.aborted) {
            setError(cause instanceof Error ? cause.message : "تعذر حساب المسافة. حاول مجددًا.");
          } else if (isCurrentRequest && didTimeout) {
            setError("استغرق حساب المسافة وقتًا طويلًا. تحقق من الاتصال وحاول مجددًا.");
          }
        } finally {
          if (isCurrentRequest) {
            setIsCalculating(false);
          }
        }
      })();
    }, 2000);

    return () => {
      isCurrentRequest = false;
      clearTimeout(debounce);
      if (requestTimeout) {
        clearTimeout(requestTimeout);
      }
      controller.abort();
    };
  }, [origin, destination, startTime]);

  return { quote, isCalculating, error, clearQuote };
}
