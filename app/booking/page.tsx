"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouteQuote } from "../hooks/useRouteQuote";

type BookingFormState = {
  pickup: string;
  destination: string;
  tripType: string;
  passengers: string;
  date: string;
  time: string;
  notes: string;
};

const defaultBookingForm: BookingFormState = {
  pickup: "",
  destination: "",
  tripType: "VIP Airport",
  passengers: "2",
  date: "",
  time: "09:30",
  notes: "استقبال عند الوصول مع حقيبة واحدة"
};

export default function BookingPage() {
  const [booking, setBooking] = useState<BookingFormState>(defaultBookingForm);
  const [status, setStatus] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [minimumBookingDate, setMinimumBookingDate] = useState("");
  const { quote, isCalculating, error: routeError, calculateRoute, clearQuote } = useRouteQuote();

  useEffect(() => {
    const today = new Date();
    setMinimumBookingDate(
      [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-")
    );
  }, []);

  const updateBooking = (field: keyof BookingFormState, value: string) => {
    setBooking((current) => ({ ...current, [field]: value }));
    setStatus("");
    setWhatsappUrl("");
    if (field === "pickup" || field === "destination" || field === "time") {
      clearQuote();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!quote) {
      setStatus("احسب المسافة والتكلفة أولًا قبل تأكيد الحجز.");
      return;
    }

    const message = [
      "مرحبًا Taxi Bahi، أود حجز رحلة فاخرة.",
      `نقطة الانطلاق: ${booking.pickup}`,
      `الوجهة: ${booking.destination}`,
      `نوع الرحلة: ${booking.tripType}`,
      `عدد الركاب: ${booking.passengers}`,
      `مسافة القيادة: ${quote.distanceKm.toFixed(1)} كم`,
      `التعرفة ${quote.tariffPeriod}: ${quote.rateDZDPerKm} دج/كم`,
      `التكلفة التقديرية: ${quote.fareDZD} دج`,
      `التاريخ: ${booking.date}`,
      `الوقت: ${booking.time}`,
      `ملاحظات: ${booking.notes || "لا توجد"}`,
      "يرجى تأكيد الحجز والمتابعة."
    ].join("\n");

    const requestUrl = `https://wa.me/213799409002?s=t&text=${encodeURIComponent(message)}`;
    window.open(requestUrl, "_blank", "noopener,noreferrer");
    setWhatsappUrl(requestUrl);
    setStatus("تم إعداد تفاصيل الرحلة. أرسل الطلب عبر واتساب لإتمام الحجز.");
  };

  return (
    <main className="tb-subpage tb-booking-page">
      <header className="tb-subpage-hero tb-booking-hero">
        <div className="tb-main-header">
          <div className="tb-brand-lockup compact">
            <div className="tb-mini-logo">
              <img src="/taxi-bahi-logo.png" alt="Taxi Bahi logo" width={38} height={38} />
            </div>
          </div>

          <nav className="tb-main-nav" aria-label="Main navigation">
            <Link href="/">الرئيسية</Link>
            <Link href="/about">About</Link>
            <Link href="/fleet">Fleet</Link>
            <Link href="/booking">Booking</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>

        <div className="tb-subpage-breadcrumb">Booking • Private</div>
        <h1>احجز رحلتك الخاصة</h1>
        <p>رحلات فاخرة مخصصة، خدمة احترافية، وتجربة ذوق أنيقة تخصك منذ الوصول وحتى الوصول.</p>
      </header>

      <section className="tb-subpage-section tb-subpage-section--spotlight" style={{ marginTop: "18px" }}>
        <span className="tb-section-kicker">Premium service</span>
        <h2>رحلات مخصصة لتناسب جدولك</h2>
        <div className="tb-feature-badges">
          <span>VIP Airport</span>
          <span>Business Travel</span>
          <span>Family Ride</span>
        </div>
      </section>

      <section className="tb-booking-steps">
        <div className="tb-step-box">
          <span>01</span>
          <strong>اختر الخدمة</strong>
          <small>VIP، Airport، Executive</small>
        </div>
        <div className="tb-step-box">
          <span>02</span>
          <strong>حدد الوقت</strong>
          <small>مواعيد دقيقة ومراقبة مستمرة</small>
        </div>
        <div className="tb-step-box">
          <span>03</span>
          <strong>تأكيد الحجز</strong>
          <small>تواصل مباشر عبر واتساب</small>
        </div>
      </section>

      <section className="tb-booking-layout-detail">
        <form className="tb-booking-form-detail" onSubmit={handleSubmit}>
          <div className="tb-form-header">
            <span className="tb-kicker">Reservation</span>
            <h2>بيانات الرحلة</h2>
          </div>

          <label>
            نقطة الانطلاق
            <input type="text" maxLength={200} placeholder="مثال: ساحة الشهداء، الجزائر" value={booking.pickup} onChange={(event) => updateBooking("pickup", event.target.value)} required disabled={isCalculating} />
          </label>

          <label>
            الوجهة
            <input type="text" maxLength={200} placeholder="مثال: مطار هواري بومدين، الجزائر" value={booking.destination} onChange={(event) => updateBooking("destination", event.target.value)} required disabled={isCalculating} />
          </label>

          <div className="tb-inline-fields booking-inline">
            <label>
              نوع الرحلة
              <select value={booking.tripType} onChange={(event) => updateBooking("tripType", event.target.value)}>
                <option value="VIP Airport">VIP Airport</option>
                <option value="City Transfer">City Transfer</option>
                <option value="Executive Ride">Executive Ride</option>
                <option value="Family SUV">Family SUV</option>
              </select>
            </label>

            <label>
              عدد الركاب
              <select value={booking.passengers} onChange={(event) => updateBooking("passengers", event.target.value)}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5+">5+</option>
              </select>
            </label>
          </div>

          <div className="tb-inline-fields booking-inline">
            <label>
              التاريخ
              <input type="date" value={booking.date} min={minimumBookingDate} onChange={(event) => updateBooking("date", event.target.value)} required />
            </label>

            <label>
              الوقت
              <input type="time" value={booking.time} onChange={(event) => updateBooking("time", event.target.value)} required />
            </label>
          </div>

          <label>
            ملاحظات خاصة
            <textarea value={booking.notes} onChange={(event) => updateBooking("notes", event.target.value)} rows={4} />
          </label>

          <p className="tb-route-rate-note">نهارًا: 400 دج لكل 100 كم. ليلًا (21:00–05:00): 150 دج لكل 30 كم. تُحدد التعرفة بحسب وقت الانطلاق.</p>
          <button
            type="button"
            className="tb-submit-btn tb-route-quote-button"
            onClick={() => void calculateRoute(booking.pickup, booking.destination, booking.time)}
            disabled={isCalculating || !booking.pickup.trim() || !booking.destination.trim()}
          >
            {isCalculating ? "جارٍ حساب مسار القيادة..." : "احسب المسافة والتكلفة"}
          </button>
          {routeError ? <p className="tb-route-error" role="alert">{routeError}</p> : null}
          {quote ? (
            <div className="tb-route-result" role="status" aria-live="polite">
              <span>تعرفة {quote.tariffPeriod}: {quote.rateDZDPerKm} دج لكل كم، حسب وقت الانطلاق.</span>
              <a href={quote.mapUrl} target="_blank" rel="noopener noreferrer">عرض المسار على الخريطة</a>
            </div>
          ) : null}
          <button type="submit" className="tb-submit-btn">تأكيد الحجز</button>
          {status ? (
            <div className="tb-booking-confirmation" role="status" aria-live="polite">
              <p className="tb-booking-status">{status}</p>
              <a className="tb-booking-whatsapp-link" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                فتح رسالة الحجز في واتساب
              </a>
            </div>
          ) : null}
        </form>

        <aside className="tb-booking-summary-detail" aria-label="Reservation summary">
          <div className="tb-summary-hero">
            <span>Luxury Service</span>
            <strong>VIP Chauffeur</strong>
          </div>

          <div className="tb-summary-list">
            <div className="tb-summary-row">
              <span>الخدمة</span>
              <strong>{booking.tripType}</strong>
            </div>
            <div className="tb-summary-row">
              <span>المسافة</span>
              <strong>{quote ? `${quote.distanceKm.toFixed(1)} كم` : "—"}</strong>
            </div>
            <div className="tb-summary-row">
              <span>المدة</span>
              <strong>{quote ? `${quote.durationMinutes} دقيقة تقريبًا` : "—"}</strong>
            </div>
            <div className="tb-summary-row">
              <span>نوع السيارة</span>
              <strong>Executive Sedan</strong>
            </div>
          </div>

          <div className="tb-summary-total-detail">
            <span>السعر التقديري</span>
            <strong>{quote ? `${quote.fareDZD.toLocaleString("ar-DZ")} دج` : "احسب المسافة أولًا"}</strong>
          </div>

          <div className="tb-summary-meta">
            <p>خدمة مخصصة بانتظارك، مع متابعة دقيقة للتجهيز والاستقبال.</p>
          </div>
        </aside>
      </section>

      <div className="tb-cta-row booking-page-cta">
        <Link href="/contact" className="primary">تواصل مباشر</Link>
        <Link href="/" className="secondary">العودة للرئيسية</Link>
      </div>
    </main>
  );
}
