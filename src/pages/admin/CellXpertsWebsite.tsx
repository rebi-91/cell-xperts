import React, { useEffect, useRef, useState } from 'react';
import './CellXpertsWebsite.css';

const WHATSAPP_NUMBER = '447593590719';
const WHATSAPP_QUOTE_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Cell%20Xperts%2C%20I%27d%20like%20a%20quote%20for%20a%20repair`;
const MAPS_LINK = 'https://www.google.com/maps/search/?api=1&query=41-43+Great+Hampton+Street+Birmingham+B18+6EL';

interface RepairTicket {
  jobNo: string;
  name: string;
  price: string;
  priceNote: string;
  eta: string;
  fineprint: string;
  stamp?: string;
}

const TICKETS: RepairTicket[] = [
  { jobNo: 'JOB #001', name: 'Screen Replacement', price: '£49', priceNote: 'from', eta: '~40 min', fineprint: 'Genuine & OEM-grade glass · all major brands', stamp: 'POPULAR' },
  { jobNo: 'JOB #002', name: 'Battery Replacement', price: '£35', priceNote: 'from', eta: '~25 min', fineprint: 'Free battery health check included' },
  { jobNo: 'JOB #003', name: 'Charging Port Repair', price: '£39', priceNote: 'from', eta: '~35 min', fineprint: 'Includes full port clean & test' },
  { jobNo: 'JOB #004', name: 'Back Glass Replacement', price: '£59', priceNote: 'from', eta: '~50 min', fineprint: 'Colour-matched to your device' },
  { jobNo: 'JOB #005', name: 'Camera Repair', price: '£45', priceNote: 'from', eta: '~30 min', fineprint: 'Front or rear, single or multi-lens' },
  { jobNo: 'JOB #006', name: 'Water Damage Treatment', price: '£25', priceNote: 'diagnostic', eta: 'Same day', fineprint: 'Diagnostic fee waived if you proceed with repair' },
  { jobNo: 'JOB #007', name: 'Speaker & Mic Repair', price: '£35', priceNote: 'from', eta: '~30 min', fineprint: 'Covers earpiece, loudspeaker & mic faults' },
  { jobNo: 'JOB #008', name: 'Software & Data Recovery', price: '£30', priceNote: 'from', eta: 'Varies', fineprint: 'Boot loops, update failures, data pull' },
  { jobNo: 'JOB #009', name: 'Tempered Glass Fitting', price: '£10', priceNote: 'from', eta: '5 min', fineprint: 'Walk in, no appointment needed' },
];

const STEPS = [
  { no: '01 · BOOK', title: 'Message us your issue', body: "Tell us the device and what's wrong on WhatsApp or by phone, and we'll give you a starting quote." },
  { no: '02 · DIAGNOSE', title: 'Free assessment in-store', body: 'Drop by Great Hampton Street — our technician confirms the issue and final price before touching anything.' },
  { no: '03 · REPAIR', title: 'Most fixes done same day', body: 'Grab a coffee nearby or wait in-store — the majority of jobs are finished within the hour.' },
  { no: '04 · COLLECT', title: "We message you when it's ready", body: "You'll get a WhatsApp the moment your device is fixed and ready for collection." },
];

const CellXpertsWebsite: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const stampRefs = useRef<Array<HTMLSpanElement | null>>([]);

  // Reveal the ticket "stamp" once it scrolls into view
  useEffect(() => {
    const targets = stampRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (targets.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('cx-show'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('cx-show');
        });
      },
      { threshold: 0.4 }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="cx-page" id="top">
      <header className="cx-nav">
        <div className="cx-nav-inner">
          <a href="#top" className="cx-logo">
            <svg width="24" height="21" viewBox="0 0 26 24" fill="none" stroke="#5b8def" strokeWidth={2.5} strokeLinecap="round">
              <path d="M9 4H5v16h4" stroke="#f2f2f0" />
              <line x1="14" y1="4" x2="22" y2="20" />
              <line x1="22" y1="4" x2="14" y2="20" />
            </svg>
            Cell <span className="cx-x">Xperts</span>
          </a>

          <nav className={`cx-nav-links ${menuOpen ? 'cx-open' : ''}`}>
            <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
            <a href="#how" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          </nav>

          <a className="cx-btn cx-btn-primary" href={WHATSAPP_QUOTE_LINK} target="_blank" rel="noopener noreferrer">
            Chat on WhatsApp
          </a>

          <button className="cx-menu-toggle" aria-label="Menu" onClick={() => setMenuOpen((v) => !v)}>
            ☰
          </button>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="cx-hero">
          <div className="wrap">
            <div className="cx-eyebrow">Great Hampton Street, Birmingham B18</div>
            <h1>
              Cracked it? We'll have you <span className="cx-accent">fixed</span> before your coffee gets cold.
            </h1>
            <p className="cx-lede">
              Screens, batteries, charging ports and more — genuine parts, honest prices, and most repairs finished
              the same day at our Jewellery Quarter workshop.
            </p>
            <div className="cx-hero-ctas">
              <a className="cx-btn cx-btn-primary" href={WHATSAPP_QUOTE_LINK} target="_blank" rel="noopener noreferrer">
                Get a free quote on WhatsApp
              </a>
              <a className="cx-btn cx-btn-ghost" href="#pricing">See prices</a>
            </div>

            <div className="cx-pipeline">
              <div className="cx-stage cx-diag">
                <div className="cx-dot">01</div>
                <h4>Diagnosing</h4>
                <p>Free 10-minute check while you wait</p>
              </div>
              <div className="cx-stage cx-repair">
                <div className="cx-dot">02</div>
                <h4>Repairing</h4>
                <p>Most fixes done in under an hour</p>
              </div>
              <div className="cx-stage cx-ready">
                <div className="cx-dot">03</div>
                <h4>Ready</h4>
                <p>We'll message you the second it's done</p>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BAR */}
        <div className="cx-trust">
          <div className="wrap">
            <div className="cx-trust-item"><div className="cx-num">2,000+</div><div className="cx-lbl">Repairs completed</div></div>
            <div className="cx-trust-item"><div className="cx-num">90-day</div><div className="cx-lbl">Warranty on all work</div></div>
            <div className="cx-trust-item"><div className="cx-num">45 min</div><div className="cx-lbl">Average repair time</div></div>
            <div className="cx-trust-item"><div className="cx-num">4.9★</div><div className="cx-lbl">Average customer rating</div></div>
          </div>
        </div>

        {/* SERVICES / PRICING */}
        <section id="services">
          <div className="wrap">
            <div className="cx-sec-head" id="pricing">
              <h2>What we fix</h2>
              <p>Starting prices for the most common jobs. Exact cost depends on your device and model — message us the make and model for an instant quote.</p>
            </div>

            <div className="cx-tickets">
              {TICKETS.map((t, i) => (
                <div className="cx-ticket" key={t.jobNo}>
                  {t.stamp && (
                    <span
                      className="cx-stamp"
                      ref={(el) => { stampRefs.current[i] = el; }}
                    >
                      {t.stamp}
                    </span>
                  )}
                  <div className="cx-ticket-inner">
                    <div className="cx-job-no">{t.jobNo}</div>
                    <h3>{t.name}</h3>
                    <div className="cx-perf" />
                    <div className="cx-price-row">
                      <div className="cx-price">{t.price}<small> {t.priceNote}</small></div>
                      <div className="cx-eta">{t.eta}</div>
                    </div>
                    <div className="cx-fineprint">{t.fineprint}</div>
                  </div>
                </div>
              ))}
            </div>

            <p className="cx-pricing-note">
              Don't see your device or issue listed?{' '}
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
                Send us a WhatsApp message
              </a>{' '}
              with your make and model and we'll quote you within minutes.
            </p>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how">
          <div className="wrap">
            <div className="cx-sec-head">
              <h2>How a repair works</h2>
              <p>The same process, every time — no surprises.</p>
            </div>
            <div className="cx-steps">
              {STEPS.map((s) => (
                <div className="cx-step" key={s.no}>
                  <div className="cx-step-no mono">{s.no}</div>
                  <h4>{s.title}</h4>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY US */}
        <section>
          <div className="wrap">
            <div className="cx-sec-head">
              <h2>Why people choose Cell Xperts</h2>
            </div>
            <div className="cx-why-grid">
              <div className="cx-why-card">
                <div className="cx-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
                </div>
                <h4>Genuine parts, 90-day warranty</h4>
                <p>Every repair is backed by a 90-day warranty on parts and workmanship — no fine print.</p>
              </div>
              <div className="cx-why-card">
                <div className="cx-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
                </div>
                <h4>Most repairs while you wait</h4>
                <p>No drop-off-and-hope. The majority of jobs are diagnosed and fixed in under an hour.</p>
              </div>
              <div className="cx-why-card">
                <div className="cx-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                </div>
                <h4>Fair, upfront pricing</h4>
                <p>You'll always know the price before we start. No hidden fees, no surprise add-ons.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact">
          <div className="wrap">
            <div className="cx-sec-head">
              <h2>Visit or message us</h2>
              <p>Based in Birmingham's Jewellery Quarter — walk-ins welcome.</p>
            </div>

            <div className="cx-contact-grid">
              <div className="cx-biz-card">
                <div className="cx-tag">Operations</div>
                <h3>Imran Nawaz</h3>
                <div className="cx-role">Cell Xperts · Phone Screen Specialists</div>

                <div className="cx-divider" />

                <div className="cx-biz-row"><span className="cx-k">☎</span><span>07593 590 719</span></div>
                <div className="cx-biz-row"><span className="cx-k">⚲</span><span>41–43 Great Hampton Street,<br />Birmingham B18 6EL</span></div>

                <div className="cx-divider" />

                <table className="cx-hours-table">
                  <tbody>
                    <tr><td>Mon – Fri</td><td>09:30 – 18:00</td></tr>
                    <tr><td>Saturday</td><td>10:00 – 17:00</td></tr>
                    <tr><td>Sunday</td><td>Closed</td></tr>
                  </tbody>
                </table>

                <div className="cx-contact-actions">
                  <a className="cx-btn cx-btn-primary" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">WhatsApp us</a>
                  <a className="cx-btn cx-btn-ghost" href="tel:07593590719">Call now</a>
                </div>
              </div>

              <div className="cx-contact-panel">
                <h4>Getting here</h4>
                <p style={{ fontSize: 13.5, color: 'var(--text-dim)', marginBottom: 18 }}>
                  We're on Great Hampton Street in the Jewellery Quarter — a few minutes' walk from St Paul's tram stop, with pay-and-display parking nearby.
                </p>
                <a className="cx-btn cx-btn-blue" href={MAPS_LINK} target="_blank" rel="noopener noreferrer" style={{ width: '100%' }}>
                  Get directions
                </a>

                <div className="cx-divider" style={{ margin: '24px 0' }} />

                <h4>Bulk or business repairs?</h4>
                <p style={{ fontSize: 13.5, color: 'var(--text-dim)' }}>
                  Fleet phones, staff devices or a bulk order — message Imran directly on WhatsApp for a business rate.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="cx-footer">
        <div className="wrap cx-footer-inner">
          <a href="#top" className="cx-logo">
            <svg width="20" height="18" viewBox="0 0 26 24" fill="none" stroke="#5b8def" strokeWidth={2.5} strokeLinecap="round">
              <path d="M9 4H5v16h4" stroke="#f2f2f0" />
              <line x1="14" y1="4" x2="22" y2="20" />
              <line x1="22" y1="4" x2="14" y2="20" />
            </svg>
            Cell <span className="cx-x">Xperts</span>
          </a>
          <p>© 2026 Cell Xperts, Birmingham. Genuine and OEM-grade parts used as specified per repair.</p>
        </div>
      </footer>
    </div>
  );
};

export default CellXpertsWebsite;
