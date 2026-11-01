import { useState, useMemo } from "react";
import {
  Download,
  RotateCw,
  Printer,
  Sparkles,
  CreditCard,
  Layers,
  ZoomIn,
  ZoomOut,
  Check,
  Smartphone,
  Eye,
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
  cardId = "TF-01100",
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

  // Theme: 'matte-black' | 'minimal-white'
  const [theme, setTheme] = useState(initialTheme);

  // Side: 'front' | 'back' (applicable for 'nfc-card')
  const [side, setSide] = useState("front");

  // Zoom: 1 | 1.25 | 0.85
  const [zoom, setZoom] = useState(1);

  // Download states
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState("");

  const effectiveQrValue = qrUrl || (cardId ? `${window.location.origin}/c/${cardId}` : "https://tapform.me");

  // Generate SVG string dynamically
  const svgString = useMemo(() => {
    return generateCardSvgString({
      format,
      theme,
      side: format === "table-stand" ? "stand" : side,
      cardType,
      title: title || "Your Business Name",
      cardId,
      qrValue: effectiveQrValue,
      socialLinks,
    });
  }, [format, theme, side, cardType, title, cardId, effectiveQrValue, socialLinks]);

  // Handle SVG download
  function handleDownloadSvg() {
    try {
      const filename = `${cardId || "stand"}_${format}_${theme}_${format === "table-stand" ? "stand" : side}_vector`;
      downloadCardSvg(
        {
          format,
          theme,
          side: format === "table-stand" ? "stand" : side,
          cardType,
          title,
          cardId,
          qrValue: effectiveQrValue,
          socialLinks,
        },
        filename
      );
      setDownloadSuccess("Vector SVG Downloaded! (Infinite Scale)");
      setTimeout(() => setDownloadSuccess(""), 4000);
    } catch (err) {
      alert("Download failed: " + err.message);
    }
  }

  // Handle High-Res PNG download (300 DPI)
  async function handleDownloadPng() {
    setDownloading(true);
    try {
      const filename = `${cardId || "stand"}_${format}_${theme}_${format === "table-stand" ? "stand" : side}_300dpi`;
      await downloadCardPng(
        {
          format,
          theme,
          side: format === "table-stand" ? "stand" : side,
          cardType,
          title,
          cardId,
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
      const filename = `${cardId || "stand"}_${format}_${theme}_CorelDRAW`;
      downloadCardCorelDraw(
        {
          format,
          theme,
          side: format === "table-stand" ? "stand" : side,
          cardType,
          title,
          cardId,
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
          <span className="toolbar-label">FORMAT:</span>
          <div className="pill-toggle-group">
            <button
              type="button"
              className={`pill-btn ${format === "nfc-card" ? "active" : ""}`}
              onClick={() => {
                setFormat("nfc-card");
                setSide("front");
              }}
            >
              <CreditCard size={14} /> NFC Pocket Card (CR80)
            </button>
            <button
              type="button"
              className={`pill-btn ${format === "table-stand" ? "active" : ""}`}
              onClick={() => setFormat("table-stand")}
            >
              <Smartphone size={14} /> Countertop Stand (100mm)
            </button>
          </div>
        </div>

        {/* Theme Selector */}
        {format === "nfc-card" && (
          <div className="toolbar-group">
            <span className="toolbar-label">THEME:</span>
            <div className="pill-toggle-group">
              <button
                type="button"
                className={`pill-btn ${theme === "matte-black" ? "active" : ""}`}
                onClick={() => setTheme("matte-black")}
              >
                🖤 Matte Black Luxury
              </button>
              <button
                type="button"
                className={`pill-btn ${theme === "minimal-white" ? "active" : ""}`}
                onClick={() => setTheme("minimal-white")}
              >
                🤍 Porcelain White
              </button>
            </div>
          </div>
        )}

        {/* Front / Back Side Flip (for Pocket Card) */}
        {format === "nfc-card" && (
          <div className="toolbar-group">
            <button
              type="button"
              className="flip-side-btn"
              onClick={() => setSide(side === "front" ? "back" : "front")}
              title="Flip to opposite side"
            >
              <RotateCw size={14} /> View {side === "front" ? "Back Side" : "Front Side"}
            </button>
          </div>
        )}
      </div>

      {/* Main Preview Stage */}
      <div className="studio-canvas-stage">
        {/* Dimension & Scale badge */}
        <div className="stage-spec-badge">
          <span>
            {format === "nfc-card"
              ? `Standard CR80 Size: 85.6mm × 54mm • ${side.toUpperCase()} VIEW`
              : "Countertop Acrylic Plaque: 100mm × 100mm • STAND VIEW"}
          </span>
          <span className="spec-vector-pill">100% Vector Scalable</span>
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
            <ZoomOut size={14} />
          </button>
          <span className="zoom-label">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            className="zoom-btn"
            onClick={() => setZoom(Math.min(1.4, zoom + 0.15))}
            title="Zoom in"
          >
            <ZoomIn size={14} />
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {downloadSuccess && (
        <div className="studio-success-toast">
          <Check size={16} /> {downloadSuccess}
        </div>
      )}

      {/* Download & Export Action Strip ("Bada Chota Dono me") */}
      <div className="studio-export-footer">
        <div className="export-hint">
          <strong>Print-Ready Vector Files:</strong> Scalable for both small cards (8.5cm) and large shop signs (100cm+) with zero blur.
        </div>

        <div className="export-buttons-row">
          <button
            type="button"
            className="studio-btn btn-svg"
            onClick={handleDownloadSvg}
            title="Download true SVG vector file - scales to any size"
          >
            <Download size={14} /> Vector SVG (Infinite Scale)
          </button>

          <button
            type="button"
            className="studio-btn btn-png"
            onClick={handleDownloadPng}
            disabled={downloading}
            title="Download 300 DPI high-resolution PNG for thermal card printers"
          >
            <Download size={14} /> {downloading ? "Generating PNG..." : "300 DPI High-Res PNG"}
          </button>

          <button
            type="button"
            className="studio-btn btn-cdr"
            onClick={handleDownloadCdr}
            title="Download CorelDRAW vector file (Import via Ctrl+I in CorelDRAW)"
          >
            <FileCode size={14} /> CorelDRAW (.cdr)
          </button>

          <button
            type="button"
            className="studio-btn btn-print"
            onClick={handlePrint}
            title="Open calibrated browser print dialog with standard mm dimensions"
          >
            <Printer size={14} /> Direct Print
          </button>
        </div>
      </div>
    </div>
  );
}
