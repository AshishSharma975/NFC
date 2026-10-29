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
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { activateCardApi, getCardApi } from "../utils/api";
import { downloadQR } from "../utils/downloadQR";
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
  const [showQrModal, setShowQrModal] = useState(false);

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

  // 1. On page load, read ?cardId= from URL (e.g. from physical QR scan or homepage checker)
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
      setError("Please enter your Google Review or business destination link.");
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

  const [downloadMsg, setDownloadMsg] = useState("");

  // Download QR code in 3 formats: PNG (1024px), SVG, or CDR (CorelDRAW Vector)
  function handleDownloadActiveQr(format) {
    try {
      downloadQR(format, `tapform-${cardId || "stand"}-qr`, "active-qr-svg");
      if (format === "cdr") {
        setDownloadMsg("CorelDRAW print file downloaded! Shop wale ko bole: CorelDRAW me 'Ctrl + I' (Import) karein, direct vector open hoga.");
        setTimeout(() => setDownloadMsg(""), 6000);
      }
    } catch {
      setError("Failed to download QR file.");
    }
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
              : "Connect your Google Review link to your physical stand or card. Once activated, every customer tap or scan opens your review page in 1 second."}
          </p>

          {/* Real-time Card Status Card (if card identified) */}
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
                  <p>Copy the review link (e.g. <code>https://g.page/r/...</code> or <code>https://maps.app.goo.gl/...</code>) and paste it on this page!</p>
                </div>
              </div>
            )}
          </div>

          <div className="workflow-assurance">
            <ShieldCheck size={20} />
            <span>
              <strong>100% Dynamic Link Technology</strong>
              <small>You can update, pause, or switch your link anytime without replacing your physical acrylic stand.</small>
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: ACTION FORM OR SUCCESS RESULT                    */}
        {/* ============================================================== */}
        <div className="form-panel shop-owner-panel">
          {savedResult ? (
            /* ============================================================ */
            /* SUCCESS CONFIRMATION SCREEN (IN-PAGE DELIGHT)               */
            /* ============================================================ */
            <div className="owner-success-view">
              <div className="success-icon-badge">
                <CheckCircle2 size={42} color="#16a34a" />
              </div>

              <h2>Your Stand is LIVE!</h2>
              <p className="success-subtitle">
                Stand <strong>{savedResult.cardId}</strong> has been successfully updated.
                When customers tap or scan this stand, they will immediately open your link:
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
                  <Smartphone size={16} /> Test Live Scan Redirect <ExternalLink size={14} />
                </a>

                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setShowQrModal(!showQrModal)}
                >
                  <QrCode size={16} /> {showQrModal ? "Hide QR Code" : "View / Download QR Code"}
                </button>
              </div>

              {/* Expandable QR Code Preview & Download */}
              {showQrModal && (
                <div className="success-qr-wrap">
                  <div className="qr-preview-box">
                    <QRCodeSVG
                      id="active-qr-svg"
                      value={savedResult.qrUrl || `${window.location.origin}/c/${savedResult.cardId}`}
                      size={180}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <div className="qr-info-row" style={{ flexWrap: "wrap", gap: "8px" }}>
                    <span style={{ width: "100%", marginBottom: "4px" }}>Scan URL: <code>{savedResult.qrUrl || `/c/${savedResult.cardId}`}</code></span>
                    <button type="button" className="btn-link-action" onClick={copyRedirectUrl}>
                      {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy Link"}
                    </button>
                    <button type="button" className="btn-link-action" onClick={() => handleDownloadActiveQr("png")} title="Download 1024x1024 High-Res PNG">
                      <Download size={14} /> PNG (1024px)
                    </button>
                    <button type="button" className="btn-link-action" onClick={() => handleDownloadActiveQr("svg")} title="Download Vector SVG">
                      <Download size={14} /> SVG (Vector)
                    </button>
                    <button type="button" className="btn-link-action" onClick={() => handleDownloadActiveQr("cdr")} title="Download CorelDRAW Print Ready Vector (Import via Ctrl+I in CorelDRAW)" style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
                      <Download size={14} /> CDR (Corel)
                    </button>
                  </div>

                  {downloadMsg && (
                    <div style={{ marginTop: "10px", padding: "8px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: "8px", fontSize: "12px", textAlign: "left" }}>
                      💡 {downloadMsg}
                    </div>
                  )}
                </div>
              )}

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
                    ? "Enter your new Google Review URL below to update where customers are redirected."
                    : "Enter your Card ID and paste your Google Review link to activate your stand."}
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
                    {/* Quick Sample IDs */}
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

                {/* 2. Destination URL Input */}
                <div className="form-group-block mt-16">
                  <label className="form-label" htmlFor="reviewUrl">
                    {isAlreadyActive ? "New Google Review or Business URL" : "Google Review URL"}{" "}
                    <span className="required">*</span>
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
                    <ExternalLink size={12} /> Paste your Google Review link, Google Maps link, or website.
                  </p>
                </div>

                {/* 3. Optional Business Name */}
                <div className="form-group-block mt-16">
                  <label className="form-label" htmlFor="businessTitle">
                    Business / Location Name <span className="optional-tag">(Optional)</span>
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
                  <p className="input-help">Helps you identify this stand in your records.</p>
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
                      Update Destination Link <ArrowRight size={17} />
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
