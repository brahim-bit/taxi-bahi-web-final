import Link from "next/link";

export default function AboutPage() {
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

        <div className="tb-subpage-breadcrumb">About • Luxury</div>
        <h1>من نكون؟</h1>
        <p>نحن شركة نقل فاخرة تقدم خدماتها بأعلى مستويات الاحترافية والراحة، مع اهتمام بالغ بالتوقيت، النظافة، وسلوك الخدمة تجاه الضيوف والعملاء.</p>
      </header>

      <section className="tb-subpage-section tb-subpage-section--spotlight">
        <span className="tb-section-kicker">Our Story</span>
        <h2>رحلات مصممة للتفاصيل</h2>
        <div className="tb-story-grid">
          <div className="tb-story-panel">
            <strong>نهج فخم ومهني</strong>
            <p>من استقبال الضيوف إلى تنسيق الرحلة كاملة، نركز على التميز السريع، الهدوء، والاهتمام بكل التفاصيل الصغيرة التي تجعل التجربة مميزة.</p>
          </div>
          <div className="tb-story-panel">
            <strong>خدمة مخصصة</strong>
            <p>نصمم كل رحلة وفق احتياج العميل، سواء كان سفرًا فرديًا، رحلات عائلية، أو خدمة عمل أرقى.</p>
          </div>
        </div>

        <div className="tb-subpage-metrics">
          <div className="tb-mini-stat">
            <strong>+15 سنة</strong>
            <span>خبرة في النقل الاحترافي.</span>
          </div>
          <div className="tb-mini-stat">
            <strong>+5000</strong>
            <span>رحلات تم تنفيذها بنجاح.</span>
          </div>
          <div className="tb-mini-stat">
            <strong>24/7</strong>
            <span>تواصل دائم ومتابعة كاملة.</span>
          </div>
        </div>
      </section>

      <section className="tb-subpage-section">
        <span className="tb-section-kicker">Why us</span>
        <h2>ما يميز خدماتنا</h2>
        <div className="tb-approach-grid">
          <div className="tb-approach-card">
            <strong>الالتزام</strong>
            <p>نلتزم بالمواعيد بدقة وتحديد الوقت מראש مع متابعة الرحلة.</p>
          </div>
          <div className="tb-approach-card">
            <strong>الراحة</strong>
            <p>سيارات أنيقة ونظيفة، مع خدمة مريحة وملائمة للرحلات الطويلة أو القصيرة.</p>
          </div>
          <div className="tb-approach-card">
            <strong>الاحتراف</strong>
            <p>سائقون مدربون على التعامل بذكاء، ضبط النفس، واللباقة في السفر.</p>
          </div>
        </div>
      </section>

      <section className="tb-subpage-section">
        <span className="tb-section-kicker">Our Promise</span>
        <h2>خدمة تليق بأسلوبك</h2>
        <div className="tb-approach-card">
          <ul>
            <li>استقبال سريع ومنظم في المطار.</li>
            <li>رحلات شخصية وعائلية واحترافية.</li>
            <li>أسعار شفافة وخدمة مميزة.</li>
            <li>تواصل مباشر على الواتساب والهاتف.</li>
          </ul>
        </div>
      </section>

      <div className="tb-inline-links" style={{ margin: "18px 15px 0" }}>
        <Link href="/contact" className="primary">تواصل معنا</Link>
        <Link href="/" className="secondary">العودة للرئيسية</Link>
      </div>
    </main>
  );
}
