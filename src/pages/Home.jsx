import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Search,
  Smartphone,
  Star,
  Zap,
  RotateCcw,
  X,
  Layers,
  Fingerprint,
  Link2,
  QrCode,
} from "lucide-react";
import { getCardApi } from "../utils/api";
import "../home.css";

export default function Home() {
  // Simulator State in Hero
  const [simMode, setSimMode] = useState("nfc"); // 'nfc' | 'qr'
  const [simFired, setSimFired] = useState(false);

  function triggerSim(mode) {
    setSimMode(mode);
    setSimFired(true);
  }

  // Stand Checker State (Customer Self-Service)
  const [checkCardId, setCheckCardId] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [checkError, setCheckError] = useState("");

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Handle Stand Lookup
  async function handleCheckStand(e) {
    e.preventDefault();
    if (!checkCardId.trim()) {
      setCheckError("Please enter your Card ID (e.g. TF-01100).");
      return;
    }

    setChecking(true);
    setCheckError("");
    setCheckResult(null);

    try {
      const res = await getCardApi(checkCardId.trim().toUpperCase());
      if (res && res.success && res.data) {
        setCheckResult(res.data);
      } else {
        throw new Error(res?.message || "Stand not found.");
      }
    } catch (err) {
      setCheckError(err.message || `No stand found with ID '${checkCardId}'. Please verify the ID on your product.`);
    } finally {
      setChecking(false);
    }
  }

  const faqData = [
    {
      q: "Do customers need to install any app to tap?",
      a: "No! There is zero app download required. iPhones and Android smartphones have built-in NFC and camera scanners. Tapping opens your Google Review page in 1 second.",
    },
    {
      q: "Can I change my Google review destination URL later?",
      a: "Yes, 100%! All Tapform stands use permanent dynamic QR & NFC technology. You can change your Google Review link or business URL anytime without reprinting your stand.",
    },
    {
      q: "Does the NFC stand require batteries or charging?",
      a: "Never! Tapform stands use passive NFC microchips powered by the scanning phone. They require zero batteries, zero cables, and last for 10+ years.",
    },
  ];

  return (
    <div className="page-container">
      {/* ============================================================== */}
      {/* SECTION 1: HERO SECTION                                        */}
      {/* ============================================================== */}
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            SMART NFC & DYNAMIC QR PLATFORM
          </div>

          <h1>
            Turn customer taps
            <br />
            <span>into 5-star reviews.</span>
          </h1>

          <p className="hero-description">
            Smart counter stands & cards for restaurants, clinics, retail stores, and service businesses.
            Customers tap their phone — your Google Review page opens in 1 second. Zero app needed.
          </p>

          <div className="hero-actions">
            <Link to="/activate" className="button button-dark">
              Set up your card <ArrowRight size={17} />
            </Link>
            <Link to="/qr-generator" className="text-link">
              Create a QR code <ArrowDownRight size={17} />
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="hero-trust-pills">
            <div className="trust-pill-item">
              <Zap size={13} />
              <span>1-Tap Google Reviews</span>
            </div>
            <div className="trust-pill-item">
              <Smartphone size={13} />
              <span>iPhone & Android (No App)</span>
            </div>
            <div className="trust-pill-item">
              <RotateCcw size={13} />
              <span>Edit Link Anytime</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Visual */}
        <div className="hero-visual">
          <div className="visual-topline">
            <span>TRY THE INTERACTIVE DEMO</span>
            <span>TAP OR SCAN BELOW</span>
          </div>

          <div className="demo-card">
            <div className="demo-card-top">
              <div className="demo-brand-mark"><Fingerprint size={23} /></div>
              <span className="demo-card-label">SMART TOUCHPOINT</span>
            </div>

            <div className="demo-orbit orbit-one" />
            <div className="demo-orbit orbit-two" />

            <div className="demo-card-copy">
              <span>RATE US 5 STARS ON GOOGLE</span>
              <h2>Tap your phone<br />to review.</h2>
            </div>

            <div className="demo-card-bottom">
              <span>NFC + QR DYNAMIC</span>
              <span className="demo-chip"><Link2 size={16} /></span>
            </div>
          </div>

          {/* Interactive Trigger Buttons */}
          <div className="simulator-trigger-bar">
            <button
              type="button"
              className={`sim-btn ${simMode === "nfc" ? "active" : ""}`}
              onClick={() => triggerSim("nfc")}
            >
              <Smartphone size={13} /> Simulate Phone Tap
            </button>
            <button
              type="button"
              className={`sim-btn ${simMode === "qr" ? "active" : ""}`}
              onClick={() => triggerSim("qr")}
            >
              <QrCode size={13} /> Simulate QR Scan
            </button>
          </div>

          {/* Simulated Mobile Pop-up Result */}
          <div className="sim-phone-notification">
            <div className="notif-google-icon">
              <Star size={20} fill="#f59e0b" color="#f59e0b" />
            </div>
            <div className="notif-copy">
              <strong>Google Maps Review</strong>
              <span>Rate Your Business on Google (1 Tap)</span>
              <div className="notif-stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={12} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
            </div>
            <CheckCircle2 size={18} color="#16a34a" style={{ marginLeft: "auto" }} />
          </div>

          <span className="visual-index">TESTED COMPATIBLE ON ALL SMARTPHONES</span>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 2: WHAT WE PROVIDE (3 CORE SOLUTIONS)                  */}
      {/* ============================================================== */}
      <section className="home-solutions-section" id="solutions">
        <div className="section-header-block">
          <span className="section-eyebrow">WHAT WE PROVIDE</span>
          <h2 className="section-main-title">Smart Touchpoints for Everyday Business</h2>
          <p className="section-sub-desc">
            Simple, durable, and permanent NFC stands that automate your customer reviews.
          </p>
        </div>

        <div className="solutions-grid-compact">
          {/* Solution 1: Google Reviews Stand */}
          <div className="solution-card-compact featured">
            <span className="card-top-tag">MOST POPULAR</span>
            <div className="solution-icon-wrap green">
              <Star size={22} />
            </div>
            <h3>Google Review Stands</h3>
            <p>
              Place on your counter. Diners & clients tap to leave 5-star reviews on Google Maps in 1 second.
            </p>
            <Link to="/activate" className="solution-action-link">
              Set up a stand &rarr;
            </Link>
          </div>

          {/* Solution 2: Dynamic QR Codes */}
          <div className="solution-card-compact">
            <div className="solution-icon-wrap">
              <RotateCcw size={22} />
            </div>
            <h3>Dynamic QR Codes</h3>
            <p>
              Never reprint QR codes again. Update your Google Maps, menu, or website destination anytime in 5 seconds.
            </p>
            <Link to="/qr-generator" className="solution-action-link">
              Create free QR &rarr;
            </Link>
          </div>

          {/* Solution 3: Digital NFC Cards */}
          <div className="solution-card-compact">
            <div className="solution-icon-wrap">
              <CreditCard size={22} />
            </div>
            <h3>Digital NFC Cards</h3>
            <p>
              Contactless smart cards for networking. 1 tap saves your contact, portfolio, and WhatsApp into customer phones.
            </p>
            <Link to="/activate" className="solution-action-link">
              Configure card &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 3: HOW IT WORKS (3 SIMPLE STEPS)                       */}
      {/* ============================================================== */}
      <section className="home-how-section" id="how-it-works">
        <div className="section-header-block">
          <span className="section-eyebrow">SIMPLE PROCESS</span>
          <h2 className="section-main-title">How It Works</h2>
        </div>

        <div className="how-steps-grid-compact">
          <div className="how-step-card-compact">
            <div className="step-num-badge">01</div>
            <h3>Get Your Stand</h3>
            <p>Each acrylic stand arrives with a permanent unique Card ID printed on it.</p>
          </div>

          <div className="how-step-card-compact">
            <div className="step-num-badge">02</div>
            <h3>Connect Your Link</h3>
            <p>Paste your Google Review link or business URL in 30 seconds.</p>
          </div>

          <div className="how-step-card-compact">
            <div className="step-num-badge">03</div>
            <h3>Collect Reviews</h3>
            <p>Place on your counter. Customers tap and review on autopilot.</p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 4: STAND CHECKER (Customer Self-Service Tool)          */}
      {/* ============================================================== */}
      <section className="home-lookup-section" id="check-stand">
        <div className="stand-checker-card">
          <div className="checker-header">
            <span className="section-eyebrow">SELF-SERVICE</span>
            <h3>Check Stand Status</h3>
            <p>
              Enter the Card ID printed on your stand to check live destination link, total scans, or update your destination.
            </p>
          </div>

          <form onSubmit={handleCheckStand} className="checker-form" noValidate>
            <div className="checker-input-wrapper">
              <Search size={18} className="checker-input-icon" />
              <input
                type="text"
                value={checkCardId}
                onChange={(e) => {
                  setCheckCardId(e.target.value.toUpperCase());
                  if (checkError) setCheckError("");
                }}
                placeholder="Enter Stand ID (e.g. TF-01100)"
                className="checker-input"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              {checkCardId && (
                <button
                  type="button"
                  className="checker-clear-btn"
                  onClick={() => {
                    setCheckCardId("");
                    setCheckResult(null);
                    setCheckError("");
                  }}
                  title="Clear input"
                  aria-label="Clear input"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="checker-submit-btn"
              disabled={checking}
            >
              {checking ? (
                <>
                  <Loader2 size={16} className="spin-icon" /> Checking...
                </>
              ) : (
                <>
                  <Search size={16} /> Check Stand
                </>
              )}
            </button>
          </form>

          {/* Quick Test Demo Chips */}
          <div className="checker-quick-chips">
            <span className="chips-label">Quick sample:</span>
            <button
              type="button"
              className="chip-tag"
              onClick={() => {
                setCheckCardId("TF-01100");
                setCheckError("");
              }}
            >
              TF-01100
            </button>
            <button
              type="button"
              className="chip-tag"
              onClick={() => {
                setCheckCardId("TF-01096");
                setCheckError("");
              }}
            >
              TF-01096
            </button>
          </div>

          {checkError && (
            <div className="admin-alert-banner alert-danger mt-16" style={{ maxWidth: "580px", margin: "16px auto 0" }}>
              <AlertCircle size={15} />
              <span>{checkError}</span>
            </div>
          )}

          {checkResult && (
            <div className="stand-lookup-result">
              <div className="result-meta-grid">
                <div className="meta-field">
                  <span>CARD IDENTIFIER</span>
                  <strong>{checkResult.cardId}</strong>
                </div>
                <div className="meta-field">
                  <span>STATUS</span>
                  <span className={`status-pill ${checkResult.status === "active" ? "pill-active" : "pill-inactive"}`}>
                    {checkResult.status === "active" ? "Active (Live)" : "Pending Setup"}
                  </span>
                </div>
                <div className="meta-field">
                  <span>TOTAL CUSTOMER SCANS</span>
                  <strong>{checkResult.scanCount || 0} Scans</strong>
                </div>
                <div className="meta-field" style={{ gridColumn: "1 / -1" }}>
                  <span>DESTINATION LINK</span>
                  <strong style={{ wordBreak: "break-all" }}>{checkResult.destinationUrl || "Not connected yet"}</strong>
                </div>
              </div>

              <div className="checker-actions-row">
                <Link
                  to={`/activate?cardId=${encodeURIComponent(checkResult.cardId)}`}
                  className="button button-dark"
                  style={{ fontSize: "13px", padding: "10px 18px", borderRadius: "10px" }}
                >
                  Update / Edit Link &rarr;
                </Link>
                <a
                  href={checkResult.qrUrl || `/c/${checkResult.cardId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="checker-test-link"
                >
                  <ExternalLink size={14} /> Test Live Scan
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 5: WHY TAPFORM? (COMPACT COMPARISON)                    */}
      {/* ============================================================== */}
      <section className="home-comparison-section">
        <div className="section-header-block">
          <span className="section-eyebrow">WHY TAPFORM?</span>
          <h2 className="section-main-title">Traditional Paper QR vs Tapform Smart NFC</h2>
        </div>

        <div className="comparison-table-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Old Paper QR Print</th>
                <th className="tapform-col">Tapform Smart NFC Stand</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Customer Action</strong></td>
                <td>Must unlock phone, open camera, align QR</td>
                <td className="tapform-col"><strong>1-Tap contactless touch (instant)</strong></td>
              </tr>
              <tr>
                <td><strong>Update Link Later?</strong></td>
                <td>Impossible — Must throw away & reprint</td>
                <td className="tapform-col"><strong>Edit link anytime in 5 seconds for free</strong></td>
              </tr>
              <tr>
                <td><strong>Durability & Look</strong></td>
                <td>Paper tears, fades, gets dirty quickly</td>
                <td className="tapform-col"><strong>Premium shatterproof acrylic (10+ years)</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 6: FAQ (3 ESSENTIAL QUESTIONS)                         */}
      {/* ============================================================== */}
      <section className="home-faq-section">
        <div className="section-header-block">
          <span className="section-eyebrow">HAVE QUESTIONS?</span>
          <h2 className="section-main-title">Frequently Asked Questions</h2>
        </div>

        <div className="faq-list">
          {faqData.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className={`faq-item ${isOpen ? "open" : ""}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 7: FINAL CALL TO ACTION                                */}
      {/* ============================================================== */}
      <section className="home-cta-banner">
        <div className="cta-banner-content">
          <h2>Ready to get more 5-star customer reviews?</h2>
          <p>
            Set up your smart NFC stand in 30 seconds or generate a dynamic QR code.
          </p>
          <div className="cta-banner-actions">
            <Link to="/activate" className="btn-white-cta">
              Set up your card <ArrowRight size={16} />
            </Link>
            <Link to="/qr-generator" className="btn-outline-cta">
              Create a free QR code <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
