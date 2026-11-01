import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Link2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  QrCode,
  Smartphone,
  Download,
  Share2,
  MapPin,
  MessageCircle,
  Eye,
  Sliders,
  Palette,
  Store,
} from "lucide-react";
import { activateCardApi, getCardApi } from "../utils/api";
import NfcCardStudio from "../components/NfcCardStudio";
import "../home.css";

function InstagramIcon({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default function Activate() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Form inputs
  const [cardId, setCardId] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");
  const [businessTitle, setBusinessTitle] = useState("");

  // Card Mode / Type: 'review' | 'connect'
  const [cardType, setCardType] = useState("review");

  // Optional Social Links
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [facebook, setFacebook] = useState("");

  // Live Studio Preview toggle
  const [showLiveStudio, setShowLiveStudio] = useState(true);

  // Existing card metadata from DB
  const [existingCard, setExistingCard] = useState(null);
  const [fetchingCard, setFetchingCard] = useState(false);

  // Submit / Save state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedResult, setSavedResult] = useState(null);

  // UI state
  const [showGuide, setShowGuide] = useState(false);
  const [copied, setCopied] = useState(false);

  // Lookup Card ID in MongoDB
  const lookupCard = useCallback(async (idToLookup) => {
    const clean = (idToLookup || cardId).trim().toUpperCase();
    if (!clean || clean.length < 3) return;

    setFetchingCard(true);

    try {
      const res = await getCardApi(clean);
      if (res && res.success && res.data) {
        setExistingCard(res.data);
        // Pre-fill fields if available
        if (res.data.destinationUrl && !reviewUrl) {
          setReviewUrl(res.data.destinationUrl);
        }
        if (res.data.title && !businessTitle) {
          setBusinessTitle(res.data.title);
        }
        if (res.data.cardType) {
          setCardType(res.data.cardType);
        }
        if (res.data.socialLinks) {
          if (res.data.socialLinks.instagram) setInstagram(res.data.socialLinks.instagram);
          if (res.data.socialLinks.whatsapp) setWhatsapp(res.data.socialLinks.whatsapp);
          if (res.data.socialLinks.facebook) setFacebook(res.data.socialLinks.facebook);
          if (res.data.socialLinks.instagram || res.data.socialLinks.whatsapp || res.data.socialLinks.facebook) {
            setCardType("connect");
          }
        }
      } else {
        setExistingCard(null);
      }
    } catch {
      // If card not found in DB, it's a new card ready to be created
      setExistingCard(null);
    } finally {
      setFetchingCard(false);
    }
  }, [cardId, reviewUrl, businessTitle]);

  // On page load, read ?cardId= from URL
  useEffect(() => {
    const paramId = searchParams.get("cardId");
    if (paramId && paramId.trim()) {
      const cleanId = paramId.trim().toUpperCase();
      setCardId(cleanId);
      lookupCard(cleanId);
    }
  }, [searchParams, lookupCard]);

  // Handle Card ID change with auto-debounce
  function handleCardIdChange(e) {
    const val = e.target.value.toUpperCase();
    setCardId(val);
    setError("");
    setSavedResult(null);

    // Keep URL in sync
    if (val) {
      setSearchParams({ cardId: val }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
      setExistingCard(null);
    }
  }

  // Handle Form Submission (Activate or Update)
  async function handleSubmit(event) {
    event.preventDefault();

    const cleanCardId = cardId.trim().toUpperCase();
    const cleanUrl = reviewUrl.trim();

    if (!cleanCardId) {
      setError("Please enter the Card ID printed on your stand (e.g. TF-01100).");
      return;
    }

    if (!cleanUrl) {
      setError("Shop Location / Google Review link is mandatory. Please enter your shop location link.");
      return;
    }

    try {
      const url = new URL(cleanUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      setError("Please enter a valid URL starting with https:// (e.g. https://g.page/r/... or https://maps.app.goo.gl/...)");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await activateCardApi({
        cardId: cleanCardId,
        destinationUrl: cleanUrl,
        title: businessTitle.trim(),
        cardType,
        socialLinks: {
          instagram: instagram.trim(),
          whatsapp: whatsapp.trim(),
          facebook: facebook.trim(),
        },
      });

      if (response && response.success && response.data) {
        setSavedResult(response.data);
        setExistingCard(response.data);
      } else {
        throw new Error(response?.message || "Failed to save card destination.");
      }
    } catch (err) {
      setError(err.message || "Failed to update link. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  // Copy live redirect link
  function copyRedirectUrl() {
    if (!savedResult?.qrUrl) return;
    navigator.clipboard.writeText(savedResult.qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isAlreadyActive = existingCard && existingCard.destinationUrl && existingCard.status === "active";

  return (
    <section className="workflow-page shop-owner-workflow">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="workflow-grid shop-owner-grid">
        {/* ============================================================== */}
        {/* LEFT COLUMN: GUIDANCE, STATUS & INSTRUCTIONS                   */}
        {/* ============================================================== */}
        <div className="workflow-intro">
          <span className="eyebrow">
            <Sparkles size={12} /> SHOP OWNER SELF-SERVICE PORTAL
          </span>

          <h1>
            {isAlreadyActive ? "Manage Your Stand Destination." : "Activate Your Tapform Stand."}
          </h1>

          <p>
            {isAlreadyActive
              ? "Change your Google Review or business link anytime for free. No reprinting needed — changes take effect immediately on all customer taps."
              : "Connect your Google Review link to your physical stand or card. Once activated, every customer tap or scan opens your review page or connect profile."}
          </p>

          {/* Real-time Card Status Card */}
          {cardId.trim() && (
            <div className="owner-card-status-box">
              <div className="status-box-header">
                <span className="status-box-label">STAND IDENTIFIER</span>
                <span className={`status-pill ${isAlreadyActive ? "pill-active" : "pill-inactive"}`}>
                  {fetchingCard ? (
                    <>
                      <Loader2 size={11} className="spin-icon" /> Checking...
                    </>
                  ) : isAlreadyActive ? (
                    "🟢 Live & Active"
                  ) : (
                    "✨ Ready for Setup"
                  )}
                </span>
              </div>

              <div className="status-box-id">{cardId}</div>

              {isAlreadyActive && (
                <div className="status-box-details">
                  <div className="meta-row">
                    <span>Card Mode:</span>
                    <strong>{existingCard.cardType === "connect" ? "🌐 Social Connect Card" : "📍 Google Review Card"}</strong>
                  </div>
                  <div className="meta-row">
                    <span>Total Customer Scans:</span>
                    <strong>{existingCard.scanCount || 0} Scans</strong>
                  </div>
                  <div className="meta-row">
                    <span>Current Live Link:</span>
                    <a
                      href={existingCard.destinationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="current-link-text"
                      title="Test current destination in new tab"
                    >
                      {existingCard.destinationUrl} <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Expandable Google Review Link Guide */}
          <div className="owner-guide-card">
            <button
              type="button"
              className="guide-toggle-btn"
              onClick={() => setShowGuide(!showGuide)}
            >
              <div className="guide-btn-left">
                <HelpCircle size={16} />
                <span>How to find your Google Review link</span>
              </div>
              {showGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showGuide && (
              <div className="guide-content-body">
                <div className="guide-step-item">
                  <span className="guide-step-badge">1</span>
                  <p>Open <strong>Google Maps</strong> on your phone or computer and search for your business name.</p>
                </div>
                <div className="guide-step-item">
                  <span className="guide-step-badge">2</span>
                  <p>Click on your business profile, then click <strong>"Ask for reviews"</strong> or <strong>"Get more reviews"</strong>.</p>
                </div>
                <div className="guide-step-item">
                  <span className="guide-step-badge">3</span>
                  <p>Copy the review link (e.g. <code>https://g.page/r/...</code> or <code>https://maps.app.goo.gl/...</code>) and paste it below!</p>
                </div>
              </div>
            )}
          </div>

          <div className="workflow-assurance">
            <ShieldCheck size={20} />
            <span>
              <strong>100% Dynamic Link Technology</strong>
              <small>You can update, pause, or switch your links anytime without replacing your physical acrylic stand or card.</small>
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: ACTION FORM OR SUCCESS RESULT                    */}
        {/* ============================================================== */}
        <div className="form-panel shop-owner-panel">
          {savedResult ? (
            /* ============================================================ */
            /* SUCCESS CONFIRMATION SCREEN                                  */
            /* ============================================================ */
            <div className="owner-success-view">
              <div className="success-icon-badge">
                <CheckCircle2 size={42} color="#16a34a" />
              </div>

              <h2>Your Stand is LIVE!</h2>
              <p className="success-subtitle">
                Stand <strong>{savedResult.cardId}</strong> has been successfully configured.
                When customers tap or scan this stand, they will immediately open your {savedResult.cardType === "connect" ? "Shop Connect Profile" : "Google Review Page"}:
              </p>

              <div className="success-destination-card">
                <div className="dest-url-pill">
                  <Link2 size={15} />
                  <span className="dest-url-text">{savedResult.destinationUrl}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="success-actions-grid">
                <a
                  href={`/c/${savedResult.cardId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button-dark test-scan-cta"
                >
                  <Smartphone size={16} /> Test Live Scan ({savedResult.cardType === "connect" ? "Connect Profile" : "Google Review"}) <ExternalLink size={14} />
                </a>

                <button
                  type="button"
                  className="button button-outline"
                  onClick={copyRedirectUrl}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Link Copied!" : "Copy Redirect Link"}
                </button>
              </div>

              {/* Embedded NfcCardStudio with Live Vector Card/Stand Download */}
              <div className="mt-24">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span className="form-label" style={{ margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                    <Sparkles size={15} color="#f59e0b" /> Print-Ready Card & Counter Stand Studio
                  </span>
                </div>
                <NfcCardStudio
                  cardId={savedResult.cardId}
                  title={savedResult.title || businessTitle}
                  destinationUrl={savedResult.destinationUrl}
                  qrUrl={savedResult.qrUrl}
                  cardNumber={savedResult.cardNumber}
                  cardType={savedResult.cardType || cardType}
                  socialLinks={savedResult.socialLinks || { instagram, whatsapp, facebook }}
                />
              </div>

              {/* Option to Edit Again */}
              <div className="success-footer-actions">
                <button
                  type="button"
                  className="text-link reset-edit-link"
                  onClick={() => {
                    setSavedResult(null);
                  }}
                >
                  <RotateCcw size={14} /> Change Link or Setup Another Stand
                </button>
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* THE SETUP / LINK CHANGE FORM                                 */
            /* ============================================================ */
            <div className="owner-form-view">
              <div className="form-heading">
                <span className="eyebrow">
                  {isAlreadyActive ? "UPDATE DESTINATION" : "STEP 01 — EASY SETUP"}
                </span>
                <h2>{isAlreadyActive ? "Change Your Link & Stand" : "Connect Your Stand"}</h2>
                <p>
                  {isAlreadyActive
                    ? "Choose your card functionality, update your destination links, and preview your print-ready card design below."
                    : "Enter your Card ID, choose your card type, paste your shop location, and add optional social links."}
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                {/* 1. Card ID Input */}
                <div className="form-group-block">
                  <label className="form-label" htmlFor="cardId">
                    Stand Card ID <span className="required">*</span>
                  </label>
                  <div className="input-with-action">
                    <input
                      className="form-input mono-font"
                      id="cardId"
                      value={cardId}
                      onChange={handleCardIdChange}
                      onBlur={() => lookupCard(cardId)}
                      placeholder="e.g. TF-01100"
                      autoComplete="off"
                      maxLength={32}
                    />
                    {fetchingCard && <Loader2 size={16} className="spin-icon input-inner-icon" />}
                  </div>
                  <div className="input-helper-row">
                    <span className="input-help">Printed on your acrylic stand or QR card.</span>
                    {!cardId && (
                      <div className="sample-chips">
                        <span>Try:</span>
                        <button
                          type="button"
                          className="chip-tag"
                          onClick={() => {
                            setCardId("TF-01100");
                            lookupCard("TF-01100");
                          }}
                        >
                          TF-01100
                        </button>
                        <button
                          type="button"
                          className="chip-tag"
                          onClick={() => {
                            setCardId("TF-01096");
                            lookupCard("TF-01096");
                          }}
                        >
                          TF-01096
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Card Functionality / Type Selection (Review vs Social Connect) */}
                <div className="form-group-block mt-16">
                  <label className="form-label">
                    Card Functionality <span className="required">*</span>
                  </label>
                  <div className="card-type-selector">
                    {/* Option 1: Direct Google Review Card */}
                    <div
                      className={`card-type-card ${cardType === "review" ? "selected" : ""}`}
                      onClick={() => setCardType("review")}
                    >
                      <div className="type-radio-dot" />
                      <div className="type-content">
                        <span className="type-title">Google Review Card</span>
                        <span className="type-sub">
                          Direct 1-tap redirect to Google Maps / Reviews. Ideal for pure review collection.
                        </span>
                      </div>
                    </div>

                    {/* Option 2: Social Connect Card (Multi-Link) */}
                    <div
                      className={`card-type-card ${cardType === "connect" ? "selected" : ""}`}
                      onClick={() => setCardType("connect")}
                    >
                      <div className="type-radio-dot" />
                      <div className="type-content">
                        <span className="type-title">Social Connect Card</span>
                        <span className="type-sub">
                          Multi-channel card: Shop location is mandatory + optional Instagram, WhatsApp & Facebook.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Shop Location / Google Review URL Input (MANDATORY) */}
                <div className="form-group-block mt-16">
                  <label className="form-label" htmlFor="reviewUrl">
                    Shop Location / Google Review URL <span className="required">* (Mandatory)</span>
                  </label>
                  <input
                    className="form-input"
                    id="reviewUrl"
                    type="url"
                    value={reviewUrl}
                    onChange={(e) => {
                      setReviewUrl(e.target.value);
                      setError("");
                    }}
                    placeholder="https://g.page/r/... or https://maps.app.goo.gl/..."
                    autoComplete="url"
                  />
                  <p className="input-help">
                    <MapPin size={12} /> Google Review link or Google Maps shop location. This is required for all cards.
                  </p>
                </div>

                {/* 4. Business / Location Name (Optional / Recommended) */}
                <div className="form-group-block mt-16">
                  <label className="form-label" htmlFor="businessTitle">
                    Business / Shop Name <span className="optional-tag">(Recommended for Card Print)</span>
                  </label>
                  <input
                    className="form-input"
                    id="businessTitle"
                    type="text"
                    value={businessTitle}
                    onChange={(e) => setBusinessTitle(e.target.value)}
                    placeholder="e.g. Royal Cafe & Bakery"
                    maxLength={100}
                  />
                  <p className="input-help">Printed on your physical card & countertop stand preview.</p>
                </div>

                {/* 5. Optional Social Links (Shown when Social Connect Card is selected) */}
                {cardType === "connect" && (
                  <div className="social-inputs-panel">
                    <div className="social-panel-header">
                      <span className="social-panel-title">
                        <Share2 size={15} /> Social & Business Channels
                      </span>
                      <span className="optional-badge">Optional (Add any you have)</span>
                    </div>

                    <div className="social-fields-grid">
                      {/* Instagram */}
                      <div className="social-field-item">
                        <div className="social-input-row">
                          <div className="social-prefix-icon insta" title="Instagram">
                            <InstagramIcon size={17} />
                          </div>
                          <input
                            className="social-input-inner"
                            type="text"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder="Instagram handle (@myshop) or profile link"
                          />
                        </div>
                      </div>

                      {/* WhatsApp Business */}
                      <div className="social-field-item">
                        <div className="social-input-row">
                          <div className="social-prefix-icon wa" title="WhatsApp Business">
                            <MessageCircle size={17} />
                          </div>
                          <input
                            className="social-input-inner"
                            type="text"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            placeholder="WhatsApp Business number (+91 9876543210) or wa.me"
                          />
                        </div>
                      </div>

                      {/* Facebook */}
                      <div className="social-field-item">
                        <div className="social-input-row">
                          <div className="social-prefix-icon fb" title="Facebook Page">
                            <FacebookIcon size={17} />
                          </div>
                          <input
                            className="social-input-inner"
                            type="text"
                            value={facebook}
                            onChange={(e) => setFacebook(e.target.value)}
                            placeholder="Facebook page URL (https://facebook.com/...)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="admin-alert-banner alert-danger mt-16">
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  className="button button-dark form-submit mt-24"
                  type="submit"
                  disabled={loading || fetchingCard}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="spin-icon" /> Saving destination...
                    </>
                  ) : isAlreadyActive ? (
                    <>
                      Update Stand & Links <ArrowRight size={17} />
                    </>
                  ) : (
                    <>
                      Activate My Stand Now <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              {/* LIVE CARD & STAND PREVIEW STUDIO (Instant Feedback) */}
              <div className="live-preview-studio-section">
                <div className="live-studio-header-row">
                  <span className="live-studio-title-badge">
                    <Sparkles size={15} color="#f59e0b" />
                    <span className="name-desktop">Live Card & Counter Stand Preview Studio</span>
                    <span className="name-mobile">Live Card Preview</span>
                  </span>
                  <button
                    type="button"
                    className="btn-link-action studio-toggle-btn"
                    onClick={() => setShowLiveStudio(!showLiveStudio)}
                  >
                    {showLiveStudio ? "Hide Preview" : "Show Preview"}
                  </button>
                </div>

                {showLiveStudio && (
                  <NfcCardStudio
                    cardId={cardId || "TF-01100"}
                    title={businessTitle || "Your Business Name"}
                    destinationUrl={reviewUrl}
                    cardNumber={existingCard?.cardNumber}
                    cardType={cardType}
                    socialLinks={{ instagram, whatsapp, facebook }}
                  />
                )}
              </div>

              <div className="form-disclaimer mt-20">
                🔒 Protected by permanent dynamic QR routing. You can return to this page anytime to update your links.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
