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
  Smartphone,
  MapPin,
} from "lucide-react";
import { activateCardApi, getCardApi } from "../utils/api";
import "../home.css";

export default function Activate() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Form inputs
  const [cardId, setCardId] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");
  const [businessTitle, setBusinessTitle] = useState("");

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
        cardType: existingCard?.cardType || "review",
        socialLinks: existingCard?.socialLinks || {},
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
              ? "Change your Google Review or business location link anytime for free. Changes take effect immediately on all customer taps."
              : "Connect your Google Review or Google Maps link to your physical stand or card. Once activated, every customer tap or scan opens your review page."}
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
                    <strong>{existingCard.cardType === "connect" ? "🌐 Social Connect Stand" : "📍 Google Review Stand"}</strong>
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
              <small>You can update, pause, or switch your link anytime without replacing your physical stand or card.</small>
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
                <h2>{isAlreadyActive ? "Change Your Review Link" : "Connect Your Stand"}</h2>
                <p>
                  {isAlreadyActive
                    ? "Paste your updated Google Maps or Google Review link below to redirect customers instantly."
                    : "Enter your Card ID and paste your Google Review link below."}
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

                {/* 2. Shop Location / Google Review URL Input (MANDATORY) */}
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
                    <MapPin size={12} /> Google Review link or Google Maps shop location.
                  </p>
                </div>

                {/* 3. Business / Location Name (Optional / Recommended) */}
                <div className="form-group-block mt-16">
                  <label className="form-label" htmlFor="businessTitle">
                    Business / Shop Name <span className="optional-tag">(Optional)</span>
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
                  <p className="input-help">Your business name for display.</p>
                </div>

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
                      Update Stand Link <ArrowRight size={17} />
                    </>
                  ) : (
                    <>
                      Activate My Stand Now <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              <div className="form-disclaimer mt-20">
                🔒 Protected by permanent dynamic QR routing. You can return to this page anytime to update your link.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
