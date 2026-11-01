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
}) {
  // Format: 'nfc-card' | 'table-stand'
  const [format, setFormat] = useState(initialFormat);

  // Theme: 'matte-black' | 'minimal-white' | 'sunset-split'
  const [theme, setTheme] = useState(initialTheme);

  // Zoom: 1 | 1.25 | 0.85
  const [zoom, setZoom] = useState(1);

  // Download states
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState("");

  const effectiveQrValue = qrUrl || (cardId ? `${window.location.origin}/c/${cardId}` : "https://tapform.me");

  // Generate SVG string dynamically (Single-Sided Complete Layout)
  const svgString = useMemo(() => {
    return generateCardSvgString({
      format,
      theme,
      cardType,
      title: title || "Your Business Name",
      cardId,
      cardNumber,
      qrValue: effectiveQrValue,
      socialLinks,
    });
  }, [format, theme, cardType, title, cardId, cardNumber, effectiveQrValue, socialLinks]);

  // Handle SVG download (Infinite resolution vector)
  function handleDownloadSvg() {
    try {
      const filename = `${cardId || "card"}_${format}_${theme}_vector`;
      downloadCardSvg(
        {
          format,
          theme,
          cardType,
          title,
          cardId,
          cardNumber,
          qrValue: effectiveQrValue,
          socialLinks,
        },
        filename
      );
      setDownloadSuccess("Vector SVG Downloaded! (Infinite Scale & Crisp Details)");
      setTimeout(() => setDownloadSuccess(""), 4000);
    } catch (err) {
      alert("Download failed: " + err.message);
    }
  }

  // Handle High-Res PNG download (300 DPI Ultra High-Res)
  async function handleDownloadPng() {
    setDownloading(true);
    try {
      const filename = `${cardId || "card"}_${format}_${theme}_300dpi`;
      await downloadCardPng(
        {
          format,
          theme,
          cardType,
          title,
          cardId,
          cardNumber,
          qrValue: effectiveQrValue,
          socialLinks,
        },
        filename,
        3.5
      );
      setDownloadSuccess("300 DPI Ultra High-Res PNG Downloaded!");
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
      const filename = `${cardId || "card"}_${format}_${theme}_CorelDRAW`;
      downloadCardCorelDraw(
        {
          format,
          theme,
          cardType,
          title,
          cardId,
          cardNumber,
          qrValue: effectiveQrValue,
          socialLinks,
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

      {/* Main Preview Stage */}
      <div className="studio-canvas-stage">
        {/* Dimension & Scale badge */}
        <div className="stage-spec-badge">
          <span className="spec-title-text">
            {format === "nfc-card"
              ? "CR80 Pocket Card • 85.6 × 54mm"
              : "Countertop Stand • 100 × 100mm"}
          </span>
          <span className="spec-vector-pill">100% Vector Print</span>
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
          <strong>Single-Sided Print Ready:</strong> High-res vector graphics with integrated QR code.
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
            <Download size={14} /> <span>Vector SVG</span>
          </button>

          <button
            type="button"
            className="studio-btn btn-png"
            onClick={handleDownloadPng}
            disabled={downloading}
            style={{ minWidth: 0, width: "100%", boxSizing: "border-box" }}
            title="Download 300 DPI high-resolution PNG for thermal card printers"
          >
            <Download size={14} /> <span>{downloading ? "Exporting..." : "300 DPI PNG"}</span>
          </button>

          <button
            type="button"
            className="studio-btn btn-cdr"
            onClick={handleDownloadCdr}
            style={{ minWidth: 0, width: "100%", boxSizing: "border-box" }}
            title="Download CorelDRAW vector file (Import via Ctrl+I in CorelDRAW)"
          >
            <FileCode size={14} /> <span>CorelDRAW (.cdr)</span>
          </button>

          <button
            type="button"
            className="studio-btn btn-print"
            onClick={handlePrint}
            style={{ minWidth: 0, width: "100%", boxSizing: "border-box" }}
            title="Open calibrated browser print dialog with standard mm dimensions"
          >
            <Printer size={14} /> <span>Direct Print</span>
          </button>
        </div>
      </div>
    </div>
  );
}
