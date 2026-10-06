"use client";

import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="tb-subpage">
      <header className="tb-subpage-hero">
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

        <div className="tb-subpage-breadcrumb">Contact • 24/7</div>
        <h1>تواصل معنا</h1>
        <p>نحن جاهزون لخدمة رحلاتك في أي وقت، سواء كنت تحتاج إلى نقل سريع أو رحلة فاخرة خاصة.</p>
      </header>

      <section className="tb-subpage-section tb-subpage-section--spotlight">
        <span className="tb-section-kicker">Reach us</span>
        <h2>معلومات التواصل</h2>
        <div className="tb-contact-stack">
          <div className="tb-contact-grid">
            <div className="tb-contact-card">
              <strong>الهاتف</strong>
              <a href="tel:+213799409002">+213 799 409 002</a>
            </div>
            <div className="tb-contact-card">
              <strong>واتساب</strong>
              <a href="https://wa.me/213799409002?s=t" target="_blank" rel="noreferrer">تواصل مباشرة</a>
            </div>
            <div className="tb-contact-card">
              <strong>الفيسبوك</strong>
              <a href="https://www.facebook.com/share/1LJaxWASJQ/" target="_blank" rel="noreferrer">صفحتنا</a>
            </div>
            <div className="tb-contact-card">
              <strong>الموقع</strong>
              <a href="https://maps.app.goo.gl/TKRJyGUYp62VZ3mN8?g_st=ac" target="_blank" rel="noreferrer">Google Maps</a>
            </div>
          </div>

          <div className="tb-contact-form-shell">
            <div className="tb-feature-badges">
              <span>VIP Service</span>
              <span>24/7 Support</span>
            </div>
            <ul className="tb-contact-list">
              <li>استقبال فوري عبر الهاتف والواتساب</li>
              <li>حجز مستفسرات خاصة للرحلات الطويلة</li>
              <li>خدمة موثوقة للرحلات الشخصية والأعمال</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="tb-subpage-section">
        <span className="tb-section-kicker">Request</span>
        <h2>أرسل طلبك</h2>
        <div className="tb-contact-form-shell">
          <p>ضع تفاصيل رحلتك وسنقوم بالتواصل معك في أقرب وقت.</p>
          <form onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="الاسم" aria-label="Name" />
            <input type="tel" placeholder="رقم الهاتف" aria-label="Phone" />
            <input type="text" placeholder="نوع الرحلة" aria-label="Trip type" />
            <textarea placeholder="ملاحظات الرحلة" aria-label="Notes" />
            <button type="submit" className="tb-submit-btn">إرسال الطلب</button>
          </form>
        </div>
      </section>

      <div className="tb-inline-links" style={{ margin: "18px 15px 0" }}>
        <Link href="/" className="primary">العودة إلى الصفحة الرئيسية</Link>
      </div>
    </main>
  );
}
