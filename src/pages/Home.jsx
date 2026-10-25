import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Fingerprint,
  Link2,
  QrCode,
  Smartphone,
  Star,
  Sparkles,
  Zap,
  TrendingUp,
  MapPin,
  Utensils,
  CreditCard,
  Wifi,
  RotateCcw,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Clock,
  Layers,
  X,
} from "lucide-react";
import { getCardApi } from "../utils/api";
import "../home.css";

export default function Home() {
  // Simulator State in Hero
  const [simMode, setSimMode] = useState("nfc"); // 'nfc' | 'qr'
  const [simFired, setSimFired] = useState(false);

  // Stand Checker State (Customer Self-Service)
  const [checkCardId, setCheckCardId] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [checkError, setCheckError] = useState("");

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  function triggerSim(mode) {
    setSimMode(mode);
    setSimFired(true);
    setTimeout(() => {
      // Keep it visible for inspection
    }, 500);
  }

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
      q: "Do my customers need to install any app to tap or scan?",
      a: "No! There is zero app download required. iPhones and Android smartphones have built-in NFC readers and camera QR scanners. When a customer taps or points their camera, the Google Review screen opens instantly in under 1 second.",
    },
    {
      q: "Can I change my Google review destination URL after printing or ordering?",
      a: "Yes, 100%! All Tapform stands and cards use permanent Dynamic QR & NFC technology. You can change your Google Review link, website URL, or digital menu anytime from our Card Setup page without throwing away your physical stand.",
    },
    {
      q: "How does Tapform help skyrocket my business on Google Maps?",
      a: "Google's local search algorithm prioritizes businesses with frequent, recent, 5-star verified reviews. By placing an interactive tap stand right on your billing counter or table, asking customers for a review becomes effortless, increasing your review volume by up to 5x.",
    },
    {
      q: "Does the NFC stand require batteries or charging?",
      a: "Never! Tapform stands use passive NFC microchips powered by the electromagnetic field of the scanning phone. They require zero batteries, zero cables, and last for 10+ years.",
    },
    {
      q: "What types of businesses can use Tapform?",
      a: "Restaurants, cafes, dental & medical clinics, hair salons, car dealerships, retail stores, gyms, hotels, and professional freelancers. Any business that benefits from customer trust and online reputation.",
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
            <span>into 5-star reviews</span>
            <br />
            & repeat sales.
          </h1>

          <p className="hero-description">
            Smart counter stands & cards for restaurants, clinics, retail stores, and service businesses.
            Customers tap their phone or scan — your Google Review page opens in 1 second.
            Update your destination link anytime without reprinting.
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
              <span>Dynamic Links (Edit Anytime)</span>
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
      {/* SECTION 2: WHAT WE PROVIDE (OUR CORE SOLUTIONS)                */}
      {/* ============================================================== */}
      <section className="home-solutions-section" id="solutions">
        <div className="section-header-block">
          <span className="section-eyebrow">WHAT WE PROVIDE</span>
          <h2 className="section-main-title">Complete Digital Touchpoints for Everyday Business</h2>
          <p className="section-sub-desc">
            Everything you need to collect customer reviews, share digital business profiles, and grow your local presence.
          </p>
        </div>

        <div className="solutions-grid">
          {/* Solution 1: Google Reviews Stand */}
          <div className="solution-card featured">
            <span className="card-top-tag">MOST POPULAR</span>
            <div className="solution-icon-wrap green">
              <Star size={24} />
            </div>
            <h3>Google Review Stands</h3>
            <p>
              Place premium NFC acrylic stands on your counter. Customers tap or scan, and your Google 5-star review page pops up immediately.
            </p>
            <ul className="solution-features-list">
              <li><Check size={14} /> Increases reviews by up to 5x on autopilot</li>
              <li><Check size={14} /> Zero typing needed — opens review box directly</li>
              <li><Check size={14} /> Boosts your Google Maps ranking in local search</li>
            </ul>
            <Link to="/activate" className="solution-action-link">
              Set up a review stand <ArrowRight size={14} />
            </Link>
          </div>

          {/* Solution 2: Dynamic QR Codes */}
          <div className="solution-card">
            <div className="solution-icon-wrap">
              <RotateCcw size={24} />
            </div>
            <h3>Dynamic QR Codes</h3>
            <p>
              Never reprint your QR codes again. Update your destination link in 5 seconds from anywhere in the world.
            </p>
            <ul className="solution-features-list">
              <li><Check size={14} /> Change website or Google link without reprinting</li>
              <li><Check size={14} /> Vector SVG & 1024px print-ready PNG downloads</li>
              <li><Check size={14} /> Real-time customer scan analytics & tracking</li>
            </ul>
            <Link to="/qr-generator" className="solution-action-link">
              Create a free dynamic QR <ArrowRight size={14} />
            </Link>
          </div>

          {/* Solution 3: Digital Business Cards */}
          <div className="solution-card">
            <div className="solution-icon-wrap">
              <CreditCard size={24} />
            </div>
            <h3>Digital NFC Business Cards</h3>
            <p>
              Share your contact details, portfolio, WhatsApp, and social profiles with one contactless tap on any phone.
            </p>
            <ul className="solution-features-list">
              <li><Check size={14} /> Saves your contact directly to their phonebook</li>
              <li><Check size={14} /> Eco-friendly alternative to paper visiting cards</li>
              <li><Check size={14} /> Keep details updated without reprinting cards</li>
            </ul>
            <Link to="/activate" className="solution-action-link">
              Configure a business card <ArrowRight size={14} />
            </Link>
          </div>

          {/* Solution 4: Smart Restaurant Menus */}
          <div className="solution-card">
            <div className="solution-icon-wrap">
              <Utensils size={24} />
            </div>
            <h3>Touchless Digital Menus</h3>
            <p>
              Fast, hygiene-friendly table dining experience. Diners tap to view your updated food menu or place WhatsApp orders.
            </p>
            <ul className="solution-features-list">
              <li><Check size={14} /> Update prices and seasonal dishes in real time</li>
              <li><Check size={14} /> High-resolution photos with instant WhatsApp ordering</li>
              <li><Check size={14} /> Wipe-clean, waterproof acrylic table stands</li>
            </ul>
            <Link to="/activate" className="solution-action-link">
              Get started with menus <ArrowRight size={14} />
            </Link>
          </div>

          {/* Solution 5: Wi-Fi & Payment Hub */}
          <div className="solution-card">
            <div className="solution-icon-wrap">
              <Wifi size={24} />
            </div>
            <h3>1-Tap Wi-Fi & Payments</h3>
            <p>
              Let guests connect to your guest Wi-Fi or view UPI payment links without asking your staff for passwords.
            </p>
            <ul className="solution-features-list">
              <li><Check size={14} /> No need to spell out long Wi-Fi passwords</li>
              <li><Check size={14} /> Instant UPI & payment redirection</li>
              <li><Check size={14} /> Saves staff time and reduces customer wait times</li>
            </ul>
            <Link to="/activate" className="solution-action-link">
              Connect a Wi-Fi stand <ArrowRight size={14} />
            </Link>
          </div>

          {/* Solution 6: Bulk Factory Production */}
          <div className="solution-card">
            <div className="solution-icon-wrap">
              <Layers size={24} />
            </div>
            <h3>Bulk Factory Orders</h3>
            <p>
              Need 100 to 500+ pre-numbered stands for a franchise or event? We generate bulk unique dynamic QRs with export manifests.
            </p>
            <ul className="solution-features-list">
              <li><Check size={14} /> Auto-sequential numbered IDs (e.g. TF-01001 to TF-01500)</li>
              <li><Check size={14} /> High-res 1024×1024 PNGs + SVGs + CSV manifest in 1 ZIP</li>
              <li><Check size={14} /> Unclaimed landing pages ready for end-user activation</li>
            </ul>
            <Link to="/activate" className="solution-action-link">
              Explore batch setups <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 3: HOW IT WORKS                                        */}
      {/* ============================================================== */}
      <section className="home-how-section" id="how-it-works">
        <div className="section-header-block">
          <span className="section-eyebrow">SIMPLE 3-STEP PROCESS</span>
          <h2 className="section-main-title">How It Works in 3 Simple Steps</h2>
          <p className="section-sub-desc">
            No technical knowledge or coding needed. From setup to customer reviews in under 2 minutes.
          </p>
        </div>

        <div className="how-steps-grid">
          <div className="how-step-card">
            <div className="step-num-badge">01</div>
            <h3>Get Your Stand or Card</h3>
            <p>
              Receive your premium NFC acrylic counter stand or pocket card. Each product comes with a unique permanent Card ID printed on it.
            </p>
          </div>

          <div className="how-step-card">
            <div className="step-num-badge">02</div>
            <h3>Connect Your Link in 30 Seconds</h3>
            <p>
              Go to our Card Setup page, enter your Card ID, and paste your Google Review link or business URL. Click generate — that's it!
            </p>
          </div>

          <div className="how-step-card">
            <div className="step-num-badge">03</div>
            <h3>Customers Tap & Review Autopilot</h3>
            <p>
              Place the stand on your counter. When customers tap their iPhone or Android, your review page opens instantly. Watch your 5-star ratings grow!
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 4: LIVE STAND CHECKER (Customer Self-Service Tool)     */}
      {/* ============================================================== */}
      <section className="home-lookup-section" id="check-stand">
        <div className="stand-checker-card">
          <div className="checker-header">
            <span className="section-eyebrow">SELF-SERVICE PORTAL</span>
            <h3>Already Have a Tapform Stand?</h3>
            <p>
              Enter the Card ID printed on your stand to check your live destination link, total scans, or update your destination.
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
                setCheckCardId("TF-01101");
                setCheckError("");
              }}
            >
              TF-01101
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
      {/* SECTION 5: COMPARISON (TRADITIONAL VS TAPFORM DYNAMIC)          */}
      {/* ============================================================== */}
      <section className="home-comparison-section">
        <div className="section-header-block">
          <span className="section-eyebrow">WHY TAPFORM?</span>
          <h2 className="section-main-title">Traditional Paper QR vs Tapform Smart NFC</h2>
          <p className="section-sub-desc">
            See why leading modern businesses are switching from static paper flyers to permanent dynamic touchpoints.
          </p>
        </div>

        <div className="comparison-table-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Old Paper QR Print</th>
                <th className="tapform-col">Tapform Smart NFC & Dynamic QR</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Customer Action</strong></td>
                <td>Must unlock phone, open camera, align QR</td>
                <td className="tapform-col"><strong>1-Tap contactless tap OR instant camera scan</strong></td>
              </tr>
              <tr>
                <td><strong>Update Link Later?</strong></td>
                <td>Impossible — Must throw away & reprint</td>
                <td className="tapform-col"><strong>Update link anytime in 5 seconds for free</strong></td>
              </tr>
              <tr>
                <td><strong>Durability & Look</strong></td>
                <td>Paper tears, fades, gets dirty quickly</td>
                <td className="tapform-col"><strong>Premium shatterproof acrylic & 10+ year chip</strong></td>
              </tr>
              <tr>
                <td><strong>Analytics & Scan Tracking</strong></td>
                <td>Zero data on how many customers scanned</td>
                <td className="tapform-col"><strong>Real-time scan counter & live activity logs</strong></td>
              </tr>
              <tr>
                <td><strong>Google Review Conversion</strong></td>
                <td>Low (customer must type business name)</td>
                <td className="tapform-col"><strong>Highest (direct 5-star pop-up in 1 second)</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 6: FREQUENTLY ASKED QUESTIONS (FAQ)                     */}
      {/* ============================================================== */}
      <section className="home-faq-section">
        <div className="section-header-block">
          <span className="section-eyebrow">HAVE QUESTIONS?</span>
          <h2 className="section-main-title">Frequently Asked Questions</h2>
          <p className="section-sub-desc">
            Everything you need to know about setting up and using your Tapform stands.
          </p>
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
      {/* SECTION 7: FINAL HIGH CONVERSION CALL TO ACTION                */}
      {/* ============================================================== */}
      <section className="home-cta-banner">
        <div className="cta-banner-content">
          <h2>Ready to turn every visitor into a 5-star customer review?</h2>
          <p>
            Get your business connected with Tapform today. Set up your card in 30 seconds or generate a high-resolution dynamic QR code for print.
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
