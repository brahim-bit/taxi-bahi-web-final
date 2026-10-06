import Link from "next/link";

export default function FleetPage() {
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

        <div className="tb-subpage-breadcrumb">Fleet • Premium</div>
        <h1>أسطولنا الفاخر</h1>
        <p>نقدم مجموعة متنوعة من السيارات الفاخرة لتناسب كل نوع من الرحلات، من النقل اليومي إلى رحلات المطار والمناسبات الخاصة.</p>
      </header>

      <section className="tb-subpage-section tb-subpage-section--spotlight">
        <span className="tb-section-kicker">Fleet</span>
        <h2>اختر ما يناسبك</h2>
        <div className="tb-fleet-spotlight">
          <div className="tb-fleet-spotlight-card">
            <strong>رحلات شخصية وأعمال</strong>
            <p>سهولة في التنقل، راحة في المقعد، وخدمة مخصصة تناسب احتياجاتك اليومية أو الاحتفالية.</p>
          </div>
          <div className="tb-fleet-spotlight-card">
            <strong>استقبال فوري</strong>
            <p>نحرص على الالتزام بالوقت من خلال متابعة دقيقة ومواعيد منظمة في كل نقطة وصول.</p>
          </div>
        </div>
        <div className="tb-feature-badges">
          <span>Luxury Sedan</span>
          <span>Airport VIP</span>
          <span>Family SUV</span>
          <span>Executive Van</span>
        </div>
        <div className="tb-fleet-grid">
          <article className="tb-fleet-card">
            <h3>Executive Sedan</h3>
            <p>سيارة أنيقة ومريحة للرحلات الشخصية وتجمع بين الفخامة والتقنية.</p>
            <ul>
              <li>سائق محترف</li>
              <li>مقاعد مريحة</li>
              <li>مناسب للمهنيين</li>
            </ul>
          </article>

          <article className="tb-fleet-card">
            <h3>Airport VIP</h3>
            <p>خيار مثالي لاستقبال الركاب من المطار مع الالتزام الكاملبالمواعيد.</p>
            <ul>
              <li>استقبال فوري</li>
              <li>تزامن مع الرحلات</li>
              <li>رحلات من وإلى المطار</li>
            </ul>
          </article>

          <article className="tb-fleet-card">
            <h3>Family SUV</h3>
            <p>مساحة واسعة ومناسبة للعائلات أو الرحلات الجماعية مع راحة كبيرة.</p>
            <ul>
              <li>مساحة كافية</li>
              <li>مناسب للعائلات</li>
              <li>رحلات مريحة</li>
            </ul>
          </article>

          <article className="tb-fleet-card">
            <h3>Luxury Van</h3>
            <p>لأعمالك أو الضيوف، مع مستوى راحة عالي وواجهة عملية ممتازة.</p>
            <ul>
              <li>سعة كبيرة</li>
              <li>تنقل احترافي</li>
              <li>مناسب للاجتماعات</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="tb-subpage-section">
        <span className="tb-section-kicker">Included</span>
        <h2>كل رحلة تشمل</h2>
        <div className="tb-approach-card">
          <ul>
            <li>مستوى نظافة عالي جدًا</li>
            <li>سائق مهذب وملتزم</li>
            <li>مرافقة متجاوبة طوال الرحلة</li>
            <li>تواصل مباشر وخدمة سريعة</li>
          </ul>
        </div>
      </section>

      <div className="tb-inline-links" style={{ margin: "18px 15px 0" }}>
        <Link href="/contact" className="primary">حجز الآن</Link>
        <Link href="/" className="secondary">العودة للرئيسية</Link>
      </div>
    </main>
  );
}
