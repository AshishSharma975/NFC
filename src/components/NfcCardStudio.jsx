import { useState, useMemo } from "react";
import {
  Download,
  Printer,
  CreditCard,
  ZoomIn,
  ZoomOut,
  Check,
  Smartphone,
  FileCode,
  Layers,
} from "lucide-react";
import {
  generateCardSvgString,
  downloadCardSvg,
  downloadCardPng,
  downloadCardCorelDraw,
  printCardElement,
} from "../utils/cardDesignSvgs";

export default function NfcCardStudio({
  cardId = "TF-01",
  cardNumber = null,
  title = "Our Business",
  destinationUrl = "",
  qrUrl = "",
  cardType = "review",
  socialLinks = {},
  initialTheme = "matte-black",
  initialFormat = "nfc-card",
  initialSide = "front",
  brandName = "tapform",
  phone = "8827718774",
  email = "ashish8389sharma@gmail.com",
}) {
  // Format: 'nfc-card' | 'table-stand'
  const [format, setFormat] = useState(initialFormat);

  // Side: 'front' | 'back' (relevant for nfc-card)
  const [side, setSide] = useState(initialSide);

  // Theme: 'matte-black' | 'minimal-white' | 'sunset-split'
  const [theme, setTheme] = useState(initialTheme);

  // Custom Brand info state
  const [activeBrandName, setActiveBrandName] = useState(brandName);
  const [activePhone, setActivePhone] = useState(phone);
  const [activeEmail, setActiveEmail] = useState(email);

  // Zoom: 1 | 1.25 | 0.85
  const [zoom, setZoom] = useState(1);

  // Download states
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState("");

  const effectiveQrValue = qrUrl || (cardId ? `${window.location.origin}/c/${cardId}` : "https://tapform.me");

  // Generate SVG string dynamically (Front or Back Side)
  const svgString = useMemo(() => {
    return generateCardSvgString({
      format,
      theme,
      cardType,
      side,
      title: title || "Your Business Name",
      cardId,
      cardNumber,
      qrValue: effectiveQrValue,
      socialLinks,
      brandName: activeBrandName,
      phone: activePhone,
      email: activeEmail,
    });
  }, [
    format,
    theme,
    cardType,
    side,
    title,
    cardId,
    cardNumber,
    effectiveQrValue,
    socialLinks,
    activeBrandName,
    activePhone,
    activeEmail,
  ]);

  // Handle SVG download (Infinite resolution vector)
  function handleDownloadSvg() {
    try {
      const sideSuffix = format === "nfc-card" ? `_${side}` : "";
      const filename = `${cardId || "card"}_${format}_${theme}${sideSuffix}_vector`;
      downloadCardSvg(
        {
          format,
          theme,
          cardType,
          side,
          title,
          cardId,
          cardNumber,
          qrValue: effectiveQrValue,
          socialLinks,
          brandName: activeBrandName,
          phone: activePhone,
          email: activeEmail,
        },
        filename
      );
      setDownloadSuccess(`Vector SVG (${side.toUpperCase()}) Downloaded!`);
      setTimeout(() => setDownloadSuccess(""), 4000);
    } catch (err) {
      alert("Download failed: " + err.message);
    }
  }

  // Handle High-Res PNG download (300 DPI Ultra High-Res)
  async function handleDownloadPng() {
    setDownloading(true);
    try {
      const sideSuffix = format === "nfc-card" ? `_${side}` : "";
      const filename = `${cardId || "card"}_${format}_${theme}${sideSuffix}_300dpi`;
      await downloadCardPng(
        {
          format,
          theme,
          cardType,
          side,
          title,
          cardId,
          cardNumber,
          qrValue: effectiveQrValue,
          socialLinks,
          brandName: activeBrandName,
          phone: activePhone,
          email: activeEmail,
        },
        filename,
        3.5
      );
      setDownloadSuccess(`300 DPI Ultra High-Res PNG (${side.toUpperCase()}) Downloaded!`);
      setTimeout(() => setDownloadSuccess(""), 4000);
    } catch (err) {
      alert("PNG generation error: " + err.message);
    } finally {
      setDownloading(false);
    }
  }

  // Handle CorelDRAW Vector download
  function handleDownloadCdr() {
    try {
      const sideSuffix = format === "nfc-card" ? `_${side}` : "";
      const filename = `${cardId || "card"}_${format}_${theme}${sideSuffix}_CorelDRAW`;
      downloadCardCorelDraw(
        {
          format,
          theme,
          cardType,
          side,
          title,
          cardId,
          cardNumber,
          qrValue: effectiveQrValue,
          socialLinks,
          brandName: activeBrandName,
          phone: activePhone,
          email: activeEmail,
        },
        filename
      );
      setDownloadSuccess("CorelDRAW Print Vector File Downloaded! (Import via Ctrl+I in Corel)");
      setTimeout(() => setDownloadSuccess(""), 5000);
    } catch (err) {
      alert("Download failed: " + err.message);
    }
  }

  // Handle Direct Browser Print
  function handlePrint() {
    const container = document.getElementById("nfc-studio-svg-container");
    const svgEl = container?.querySelector("svg");
    if (!svgEl) return;
    svgEl.id = "print-card-svg";
    printCardElement("print-card-svg", format);
  }

  return (
    <div className="card-studio-wrapper">
      {/* Studio Controls Header */}
      <div className="studio-toolbar">
        {/* Format Selector: Pocket Card vs Counter Stand */}
        <div className="toolbar-group">
          <span className="toolbar-label">FORMAT</span>
          <div className="pill-toggle-group format-toggle">
            <button
              type="button"
              className={`pill-btn ${format === "nfc-card" ? "active" : ""}`}
              onClick={() => setFormat("nfc-card")}
            >
              <CreditCard size={14} />
              <span className="btn-label-text">Pocket Card</span>
              <span className="pill-sub-dim">85×54mm</span>
            </button>
            <button
              type="button"
              className={`pill-btn ${format === "table-stand" ? "active" : ""}`}
              onClick={() => setFormat("table-stand")}
            >
              <Smartphone size={14} />
              <span className="btn-label-text">Stand Plaque</span>
              <span className="pill-sub-dim">100mm</span>
            </button>
          </div>
        </div>

        {/* Side Selector (Only for Pocket Card) */}
        {format === "nfc-card" && (
          <div className="toolbar-group">
            <span className="toolbar-label">CARD SIDE</span>
            <div className="pill-toggle-group side-toggle">
              <button
                type="button"
                className={`pill-btn ${side === "front" ? "active" : ""}`}
                onClick={() => setSide("front")}
                title="Front Side: QR Code, NFC Tap & Large Text"
              >
                <Layers size={14} />
                <span className="btn-label-text">Front Side (QR)</span>
              </button>
              <button
                type="button"
                className={`pill-btn ${side === "back" ? "active" : ""}`}
                onClick={() => setSide("back")}
                title="Back Side: Brand Name, Phone & Email Support"
              >
                <Layers size={14} />
                <span className="btn-label-text">Back Side (Brand & Contact)</span>
              </button>
            </div>
          </div>
        )}

        {/* Theme Selector for both Pocket Card and Counter Stand */}
        <div className="toolbar-group">
          <span className="toolbar-label">MINIMAL THEME</span>
          <div className="pill-toggle-group theme-toggle">
            <button
              type="button"
              className={`pill-btn ${theme === "matte-black" ? "active" : ""}`}
              onClick={() => setTheme("matte-black")}
              title="Pinterest Luxury Matte Black Aesthetic"
            >
              <span>{"\uD83D\uDDA4"}</span>
              <span className="btn-label-text">
                <span className="name-desktop">Matte Obsidian Luxury</span>
                <span className="name-mobile">Obsidian</span>
              </span>
            </button>
            <button
              type="button"
              className={`pill-btn ${theme === "minimal-white" ? "active" : ""}`}
              onClick={() => setTheme("minimal-white")}
              title="Scandinavian Minimalist Studio White"
            >
              <span>{"\uD83E\uDD0D"}</span>
              <span className="btn-label-text">
                <span className="name-desktop">Studio Porcelain Pearl</span>
                <span className="name-mobile">Porcelain</span>
              </span>
            </button>
            <button
              type="button"
              className={`pill-btn ${theme === "sunset-split" ? "active" : ""}`}
              onClick={() => setTheme("sunset-split")}
              title="Modern Asymmetric Amber Split (Reference Design 1)"
            >
              <span>{"\u2728"}</span>
              <span className="btn-label-text">
                <span className="name-desktop">Modern Split (Amber)</span>
                <span className="name-mobile">Amber Split</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Back Side Details Quick Customization Bar */}
      {format === "nfc-card" && side === "back" && (
        <div
          className="studio-back-details-bar"
          style={{
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "12px",
            padding: "12px 16px",
            margin: "10px 0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <div>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
              BRAND NAME
            </label>
            <input
              type="text"
              value={activeBrandName}
              onChange={(e) => setActiveBrandName(e.target.value)}
              placeholder="e.g. tapform"
              style={{
                width: "100%",
                background: "#090d16",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "6px 10px",
                color: "#ffffff",
                fontSize: "13px",
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
              CONTACT NUMBER
            </label>
            <input
              type="text"
              value={activePhone}
              onChange={(e) => setActivePhone(e.target.value)}
              placeholder="8827718774"
              style={{
                width: "100%",
                background: "#090d16",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "6px 10px",
                color: "#ffffff",
                fontSize: "13px",
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
              CONTACT GMAIL
            </label>
            <input
              type="email"
              value={activeEmail}
              onChange={(e) => setActiveEmail(e.target.value)}
              placeholder="ashish8389sharma@gmail.com"
              style={{
                width: "100%",
                background: "#090d16",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "6px 10px",
                color: "#ffffff",
                fontSize: "13px",
              }}
            />
          </div>
        </div>
      )}

      {/* Main Preview Stage */}
      <div className="studio-canvas-stage">
        {/* Dimension & Scale badge */}
        <div className="stage-spec-badge">
          <span className="spec-title-text">
            {format === "nfc-card"
              ? `CR80 Pocket Card (${side === "back" ? "Back Side - Brand & Contact" : "Front Side - QR & Tap"}) • 85.6 × 54mm`
              : "Countertop Stand • 100 × 100mm"}
          </span>
          <span className="spec-vector-pill">High Visibility &bull; 100% Vector Print</span>
        </div>

        {/* SVG Render Container */}
        <div
          id="nfc-studio-svg-container"
          className={`card-svg-container ${format === "table-stand" ? "stand-aspect" : "card-aspect"}`}
          style={{ transform: `scale(${zoom})`, transition: "transform 0.2s ease" }}
          dangerouslySetInnerHTML={{ __html: svgString }}
        />

        {/* Zoom Controls */}
        <div className="stage-zoom-controls">
          <button
            type="button"
            className="zoom-btn"
            onClick={() => setZoom(Math.max(0.7, zoom - 0.15))}
            title="Zoom out"
          >
            <ZoomOut size={13} />
          </button>
          <span className="zoom-label">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            className="zoom-btn"
            onClick={() => setZoom(Math.min(1.4, zoom + 0.15))}
            title="Zoom in"
          >
            <ZoomIn size={13} />
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {downloadSuccess && (
        <div className="studio-success-toast">
          <Check size={16} /> {downloadSuccess}
        </div>
      )}

      {/* Download & Export Action Strip */}
      <div className="studio-export-footer">
        <div className="export-hint">
          <strong>{side === "back" ? "Back Side Print Ready:" : "Front Side Print Ready:"}</strong> High-res vector graphics calibrated for sharp, readable physical card printing.
        </div>

        <div
          className="export-buttons-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <button
            type="button"
            className="studio-btn btn-svg"
            onClick={handleDownloadSvg}
            style={{ minWidth: 0, width: "100%", boxSizing: "border-box" }}
            title="Download true SVG vector file - scales to any size infinitely"
          >
            <Download size={14} /> <span>Vector SVG ({side === "back" ? "Back" : "Front"})</span>
          </button>

          <button
            type="button"
            className="studio-btn btn-png"
            onClick={handleDownloadPng}
            disabled={downloading}
            style={{ minWidth: 0, width: "100%", boxSizing: "border-box" }}
            title="Download 300 DPI high-resolution PNG for thermal card printers"
          >
            <Download size={14} /> <span>{downloading ? "Exporting..." : `300 DPI PNG (${side === "back" ? "Back" : "Front"})`}</span>
          </button>

          <button
            type="button"
            className="studio-btn btn-cdr"
            onClick={handleDownloadCdr}
            style={{ minWidth: 0, width: "100%", boxSizing: "border-box" }}
            title="Download CorelDRAW vector file (Import via Ctrl+I in CorelDRAW)"
          >
            <FileCode size={14} /> <span>CorelDRAW ({side === "back" ? "Back" : "Front"})</span>
          </button>

          <button
            type="button"
            className="studio-btn btn-print"
            onClick={handlePrint}
            style={{ minWidth: 0, width: "100%", boxSizing: "border-box" }}
            title="Open calibrated browser print dialog with standard mm dimensions"
          >
            <Printer size={14} /> <span>Direct Print ({side === "back" ? "Back" : "Front"})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
