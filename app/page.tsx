"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useRouteQuote } from "./hooks/useRouteQuote";

const WHATSAPP_URL = "https://wa.me/213799409002?s=t";
const FACEBOOK_URL = "https://www.facebook.com/share/1LJaxWASJQ/";
const MAPS_URL = "https://maps.app.goo.gl/TKRJyGUYp62VZ3mN8?g_st=ac";
const PHONE_URL = "tel:+213799409002";

type BookingFormState = {
  pickup: string;
  destination: string;
  tripType: string;
  serviceOption: string;
  date: string;
  time: string;
  notes: string;
};

const defaultBookingForm: BookingFormState = {
  pickup: "",
  destination: "",
  tripType: "مطار",
  serviceOption: "حجز فوري",
  date: "",
  time: "09:30",
  notes: "حجز لخطوات الاستقبال"
};

function WhatsAppIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.5 3.5A11.7 11.7 0 0 0 12.2 0C5.7 0 .4 5.3.4 11.8c0 2.1.5 4.1 1.6 5.9L.3 24l6.5-1.7c1.7.9 3.5 1.3 5.4 1.3h.1c6.5 0 11.7-5.3 11.7-11.8 0-3.1-1.2-6.1-3.5-8.3ZM12.2 21.5c-1.7 0-3.4-.5-4.9-1.3l-.4-.2-3.8 1 1-3.7-.2-.4a9.6 9.6 0 0 1-1.5-5.1c0-5.3 4.4-9.6 9.7-9.6 2.6 0 5 1 6.8 2.8a9.5 9.5 0 0 1 2.8 6.8c0 5.3-4.3 9.7-9.6 9.7Zm5.3-7.2c-.3-.1-1.9-.9-2.2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-1.6-.8-2.7-1.5-3.8-3.4-.3-.5.3-.5.8-1.6.1-.2.1-.4 0-.6-.1-.1-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1-1.1 2.5s1.1 2.9 1.3 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.9-.8 2.1-1.6.3-.8.3-1.5.2-1.6-.1-.1-.3-.2-.6-.3Z"/></svg>;
}

function FacebookIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.7 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.1V10H8v3h2.6v8h3.1Z"/></svg>;
}

function MapsIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#34A853" d="m12 2 3.7 5.3-2.5 2.2L12 7.2 10.8 9.5 8.3 7.3 12 2Z"/><path fill="#4285F4" d="m8.3 7.3 2.5 2.2-1.9 3.2-2.8-1.4 2.2-4Z"/><path fill="#FBBC04" d="m10.8 9.5 2.4 2.1-1.2 5.1-3.1-4 1.9-3.2Z"/><path fill="#EA4335" d="m13.2 11.6 2.5-2.2 3.1 3.2-4.5 4.1-1.1-5.1Z"/><circle cx="12" cy="7" r="2" fill="#4285F4"/></svg>;
}

function PhoneIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 2.5 9 2c.7-.1 1.3.3 1.5 1l1 3.2c.2.6 0 1.2-.5 1.5L9.4 9a15.8 15.8 0 0 0 5.6 5.6l1.3-1.6c.4-.5 1-.7 1.5-.5l3.2 1c.7.2 1.1.8 1 1.5l-.5 2.4c-.2 1-1.1 1.7-2.1 1.6C10.5 18 6 13.5 4.9 7.1c-.1-1 .6-1.9 1.7-2.1Z"/></svg>;
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7"/></svg>;
}

function CheckBadge() {
  return <span className="tb-check">✓</span>;
}

export default function Home() {
  const [pageUrl, setPageUrl] = useState("");
  const [booking, setBooking] = useState<BookingFormState>(defaultBookingForm);
  const [bookingStatus, setBookingStatus] = useState("");
  const [bookingWhatsappUrl, setBookingWhatsappUrl] = useState("");
  const [minimumBookingDate, setMinimumBookingDate] = useState("");
  const { quote, isCalculating, error: routeError, calculateRoute, clearQuote } = useRouteQuote();

  useEffect(() => {
    setPageUrl(window.location.href);
    const today = new Date();
    setMinimumBookingDate(
      [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-")
    );
  }, []);

  const updateBooking = (field: keyof BookingFormState, value: string) => {
    setBooking((current) => ({ ...current, [field]: value }));
    setBookingStatus("");
    setBookingWhatsappUrl("");
    if (field === "pickup" || field === "destination" || field === "time") {
      clearQuote();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!quote) {
      setBookingStatus("احسب المسافة والتكلفة أولًا قبل تأكيد الحجز.");
      return;
    }

    const message = [
      "مرحبًا Taxi Bahi، أود حجز رحلة فاخرة.",
      `نقطة الانطلاق: ${booking.pickup}`,
      `الوجهة: ${booking.destination}`,
      `نوع الرحلة: ${booking.tripType}`,
      `التجهيز: ${booking.serviceOption}`,
      `مسافة القيادة: ${quote.distanceKm.toFixed(1)} كم`,
      `التعرفة ${quote.tariffPeriod}: ${quote.rateDZDPerKm} دج/كم`,
      `التكلفة التقديرية: ${quote.fareDZD} دج`,
      `التاريخ: ${booking.date}`,
      `الوقت: ${booking.time}`,
      `ملاحظات: ${booking.notes || "لا توجد"}`,
      "يرجى تأكيد الحجز والمتابعة."
    ].join("\n");

    const whatsappUrl = `${WHATSAPP_URL}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setBookingWhatsappUrl(whatsappUrl);
    setBookingStatus("تم إعداد تفاصيل الرحلة. أرسل الطلب عبر واتساب لإتمام الحجز.");
  };

  return (
    <main className="tb-page luxury-version">
      <header className="tb-main-header">
        <div className="tb-brand-lockup compact">
          <div className="tb-mini-logo">
            <Image src="/taxi-bahi-logo.png" alt="Taxi Bahi logo" width={38} height={38} priority />
          </div>
        </div>

        <nav className="tb-main-nav" aria-label="Main navigation">
          <a href="/">الرئيسية</a>
          <a href="/about">About</a>
          <a href="/fleet">Fleet</a>
          <a href="/booking">Booking</a>
          <a href="/contact">Contact</a>
        </nav>
      </header>

      <section className="tb-hero" aria-label="Luxury Taxi Bahi">
        <Image src="/taxi-bahi-hero-clean.jpg" alt="Luxury taxi" fill priority sizes="(max-width: 600px) 100vw, 460px" />
        <div className="tb-hero-shade" />
        <div className="tb-hero-ornament tb-ornament-one" aria-hidden="true" />
        <div className="tb-hero-ornament tb-ornament-two" aria-hidden="true" />

        <div className="tb-hero-content">
          <div className="tb-hero-badge">Premium Chauffeur Service</div>
          <h1>Ride beyond the ordinary.</h1>
          <p>خدمة نقل فاخرة تجمع بين الأناقة، الدقة، والراحة، مع سيارات أنيقة وسائقين محترفين لتجربة لا تشبه أي رحلة أخرى.</p>

          <div className="tb-hero-actions">
            <a href="/booking" className="tb-primary-btn">احجز الآن</a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="tb-secondary-btn">واتساب VIP</a>
          </div>

          <div className="tb-stats luxury-stats">
            <div>
              <strong>24/7</strong>
              <span>تواصل دائم</span>
            </div>
            <div>
              <strong>15+</strong>
              <span>سيارات فاخرة</span>
            </div>
            <div>
              <strong>4.9</strong>
              <span>تقييم العملاء</span>
            </div>
          </div>
        </div>

        <div className="tb-floating-card tb-floating-top">
          <span>Executive</span>
          <strong>Airport VIP</strong>
        </div>
        <div className="tb-floating-card tb-floating-bottom">
          <span>Luxury Transfer</span>
          <strong>7–10 min</strong>
        </div>
      </section>

      <section className="tb-showcase" aria-label="Luxury highlights">
        <article className="tb-showcase-card">
          <span>🚘</span>
          <h3>Fleet Premium</h3>
          <p>سيارات فاخرة ومجهزة للاستقبال المريح.</p>
        </article>
        <article className="tb-showcase-card">
          <span>✈️</span>
          <h3>Airport Ride</h3>
          <p>استقبال دقيق في المطار ومتابعة زمنية ممتازة.</p>
        </article>
        <article className="tb-showcase-card">
          <span>💎</span>
          <h3>Luxury Care</h3>
          <p>خدمة شخصية ومهنية بالكامل مع تفاصيل فاخرة.</p>
        </article>
      </section>

      <section className="tb-gallery luxury-panel" aria-label="Luxury gallery">
        <div className="tb-section-head center">
          <span className="tb-kicker">Gallery</span>
          <h2>رحلات بأسلوب فاخر</h2>
        </div>

        <div className="tb-gallery-grid">
          <div className="tb-gallery-card tb-gallery-large" style={{ backgroundImage: "url('/taxi-bahi-hero-clean.jpg')" }}>
            <div className="tb-gallery-overlay">
              <span>VIP Arrival</span>
              <strong>استقبال فاخر</strong>
            </div>
          </div>
          <div className="tb-gallery-card" style={{ backgroundImage: "linear-gradient(180deg, rgba(8,10,13,0.2), rgba(8,10,13,0.7)), url('/taxi-bahi-hero-clean.jpg')" }}>
            <div className="tb-gallery-overlay">
              <span>Executive</span>
              <strong>رحلات يومية</strong>
            </div>
          </div>
          <div className="tb-gallery-card" style={{ backgroundImage: "linear-gradient(180deg, rgba(8,10,13,0.18), rgba(8,10,13,0.72)), url('/taxi-bahi-hero-clean.jpg')" }}>
            <div className="tb-gallery-overlay">
              <span>Signature</span>
              <strong>تجربة خاصة</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="tb-card luxury-card" aria-label="Taxi Bahi services">
        <div className="tb-profile">
          <div className="tb-profile-logo">
            <Image src="/taxi-bahi-logo.png" alt="Taxi Bahi logo" width={82} height={82} priority />
          </div>
          <div className="tb-profile-info">
            <h1>Taxi <span>Bahi</span> <CheckBadge /></h1>
            <p>Luxury Transfers <i>|</i> تاكسي باهي</p>
          </div>
        </div>

        <div className="tb-title-row">
          <span />
          <p>خدمات فاخرة في مكان واحد</p>
          <span />
        </div>

        <section className="tb-actions">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="tb-action whatsapp">
            <div className="tb-icon"><WhatsAppIcon /></div>
            <div className="tb-action-text"><strong>WhatsApp</strong><small>تواصل فوري</small></div>
            <div className="tb-arrow"><ArrowIcon /></div>
          </a>

          <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="tb-action facebook">
            <div className="tb-icon"><FacebookIcon /></div>
            <div className="tb-action-text"><strong>Facebook</strong><small>تابعنا</small></div>
            <div className="tb-arrow"><ArrowIcon /></div>
          </a>

          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="tb-action maps">
            <div className="tb-icon"><MapsIcon /></div>
            <div className="tb-action-text"><strong>Google Maps</strong><small>موقعنا</small></div>
            <div className="tb-arrow"><ArrowIcon /></div>
          </a>
        </section>

        <section className="tb-bottom-row">
          <a href={PHONE_URL} className="tb-phone-card">
            <div className="tb-phone-icon"><PhoneIcon /></div>
            <div><small>اتصل بنا مباشرة</small><strong>+213 799 409 002</strong></div>
          </a>

          <div className="tb-qr-wrap">
            <div className="tb-qr-box">
              {pageUrl ? <QRCodeSVG value={pageUrl} size={128} bgColor="#fff" fgColor="#090909" level="H" includeMargin /> : <div className="tb-qr-placeholder" aria-hidden="true" />}
            </div>
            <p>امسح رمز <b>QR</b><br />للحجز السريع</p>
          </div>
        </section>
      </section>

      <section className="tb-booking luxury-panel tb-booking-luxury" aria-label="Booking form">
        <div className="tb-booking-header">
          <div>
            <span className="tb-kicker">Private Booking</span>
            <h2>احجز رحلتك الفاخرة</h2>
          </div>

          <div className="tb-booking-badge">
            <span>VIP</span>
            <strong>24/7</strong>
          </div>
        </div>

        <div className="tb-booking-layout">
          <form className="tb-booking-form" onSubmit={handleSubmit}>
            <label>
              نقطة الانطلاق
              <input type="text" maxLength={200} placeholder="مثال: ساحة الشهداء، الجزائر" value={booking.pickup} onChange={(event) => updateBooking("pickup", event.target.value)} required disabled={isCalculating} />
            </label>
            <label>
              الوجهة
              <input type="text" maxLength={200} placeholder="مثال: مطار هواري بومدين، الجزائر" value={booking.destination} onChange={(event) => updateBooking("destination", event.target.value)} required disabled={isCalculating} />
            </label>
            <div className="tb-inline-fields">
              <label>
                نوع الرحلة
                <select value={booking.tripType} onChange={(event) => updateBooking("tripType", event.target.value)}>
                  <option value="مطار">مطار</option>
                  <option value="مدينة">مدينة</option>
                  <option value="VIP">VIP</option>
                  <option value="عائلي">عائلي</option>
                </select>
              </label>
              <label>
                التاريخ
                <input type="date" value={booking.date} min={minimumBookingDate} onChange={(event) => updateBooking("date", event.target.value)} required />
              </label>
            </div>
            <div className="tb-inline-fields">
              <label>
                الوقت
                <input type="time" lang="fr-DZ" dir="ltr" step={60} value={booking.time} onChange={(event) => updateBooking("time", event.target.value)} required />
              </label>
              <label>
                التجهيز
                <select value={booking.serviceOption} onChange={(event) => updateBooking("serviceOption", event.target.value)}>
                  <option value="حجز فوري">حجز فوري</option>
                  <option value="استقبال المطار">استقبال المطار</option>
                  <option value="رحلة خاصة">رحلة خاصة</option>
                </select>
              </label>
            </div>
            <label>
              ملاحظات خاصة
              <input type="text" value={booking.notes} onChange={(event) => updateBooking("notes", event.target.value)} />
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
            {bookingStatus ? (
              <div className="tb-booking-confirmation" role="status" aria-live="polite">
                <p className="tb-booking-status">{bookingStatus}</p>
                <a className="tb-booking-whatsapp-link" href={bookingWhatsappUrl} target="_blank" rel="noopener noreferrer">
                  فتح رسالة الحجز في واتساب
                </a>
              </div>
            ) : null}
          </form>

          <aside className="tb-booking-summary" aria-label="Booking summary">
            <div className="tb-summary-row">
              <span>نوع الخدمة</span>
              <strong>{booking.tripType} Service</strong>
            </div>
            <div className="tb-summary-row">
              <span>المسافة</span>
              <strong>{quote ? `${quote.distanceKm.toFixed(1)} كم` : "—"}</strong>
            </div>
            <div className="tb-summary-row">
              <span>المدة</span>
              <strong>{quote ? `${quote.durationMinutes} دقيقة تقريبًا` : "—"}</strong>
            </div>
            <div className="tb-summary-total">
              <span>السعر التقديري</span>
              <strong>{quote ? `${quote.fareDZD.toLocaleString("ar-DZ")} دج` : "احسب المسافة أولًا"}</strong>
            </div>
          </aside>
        </div>
      </section>

      <section className="tb-pricing luxury-panel" aria-label="Pricing plans">
        <div className="tb-section-head center">
          <span className="tb-kicker">Luxury Rates</span>
          <h2>أسعار تناسب أسلوبك</h2>
        </div>

        <div className="tb-price-grid">
          <article className="tb-price-card">
            <span>City</span>
            <h3>رحلات المدينة</h3>
            <div className="tb-price">500 <small>دج</small></div>
            <ul>
              <li>سائق محترف</li>
              <li>رحلة مريحة</li>
              <li>دعم فوري</li>
            </ul>
          </article>

          <article className="tb-price-card featured">
            <span>Most Popular</span>
            <h3>مطار VIP</h3>
            <div className="tb-price">400 <small>دج / 100 كم نهارًا</small></div>
            <p className="tb-price-night">ليلًا (21:00–05:00): 150 دج / 30 كم</p>
            <ul>
              <li>استقبال مميز</li>
              <li>مراقبة دقيقة للوقت</li>
              <li>خدمة فاخرة</li>
            </ul>
          </article>

          <article className="tb-price-card">
            <span>Signature</span>
            <h3>رحلة خاصة</h3>
            <div className="tb-price">حسب المسافة</div>
            <ul>
              <li>استقلالية كاملة</li>
              <li>رحلات طويلة</li>
              <li>خدمة شخصية</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="tb-services luxury-panel" aria-label="Luxury fleet and services">
        <div className="tb-section-head center">
          <span className="tb-kicker">Our Fleet</span>
          <h2>أسطول فاخر يلبي كل احتياج</h2>
        </div>

        <div className="tb-services-grid">
          <article className="tb-service-box">
            <span>🚕</span>
            <h3>Executive Ride</h3>
            <p>رحلات مريحة لرحلاتك اليومية واحتياجاتك المهنية.</p>
          </article>

          <article className="tb-service-box">
            <span>✈️</span>
            <h3>Airport Transfer</h3>
            <p>استقبال من المطار مع استلام دقيق والتزام زمني.</p>
          </article>

          <article className="tb-service-box">
            <span>💼</span>
            <h3>Business Travel</h3>
            <p>خدمة مميزة للشركات والضيوف والرحلات الخاصة.</p>
          </article>
        </div>
      </section>

      <section className="tb-why luxury-panel" aria-label="Why choose us">
        <div className="tb-why-copy">
          <span className="tb-kicker">Why Us</span>
          <h2>خبرة لا تضاهى في النقل الفاخر</h2>
          <ul>
            <li>سائقون محترفون ومهذبون بشكل استثنائي.</li>
            <li>أسطول أنيق ونظيف ومجهز لراحتك.</li>
            <li>أسعار واضحة وشفافة مع خدمة ممتازة.</li>
            <li>تجربة سلسة ومميزة طوال اليوم.</li>
          </ul>
        </div>

        <div className="tb-why-panel">
          <div className="tb-why-box">
            <strong>Luxury</strong>
            <span>رحلات أنيقة</span>
          </div>
          <div className="tb-why-box">
            <strong>Safety</strong>
            <span>أمان وراحة</span>
          </div>
          <div className="tb-why-box">
            <strong>Precision</strong>
            <span>التزام بالوقت</span>
          </div>
        </div>
      </section>

      <section className="tb-testimonials luxury-panel" aria-label="Customer reviews">
        <div className="tb-section-head center">
          <span className="tb-kicker">Reviews</span>
          <h2>رأي عملائنا</h2>
        </div>

        <div className="tb-testimonials-grid">
          <article className="tb-review">
            <div className="tb-stars">★★★★★</div>
            <p>“خدمة فاخرة جدًا، والقيادة محترفة، والراحة كانت مميزة من أول لحظة.”</p>
            <strong>سارة م.</strong>
          </article>

          <article className="tb-review">
            <div className="tb-stars">★★★★★</div>
            <p>“أفضل خدمة لنقل المطار، احترافية عالية وجودة ممتازة في كل نقطة.”</p>
            <strong>أكرم د.</strong>
          </article>
        </div>
      </section>

      <section className="tb-features">
        <div className="tb-feature"><span>🛡</span><strong>Premium</strong></div>
        <div className="tb-feature"><span>◷</span><strong>Fast</strong></div>
        <div className="tb-feature"><span>🚕</span><strong>Fleet</strong></div>
        <div className="tb-feature"><span>☺</span><strong>VIP</strong></div>
      </section>

      <footer className="tb-footer">
        <span />
        <strong>♥ <em>Taxi Bahi</em></strong>
        <span />
      </footer>
    </main>
  );
}
