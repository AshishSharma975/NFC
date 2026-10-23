
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Download, ExternalLink } from "lucide-react";
import { downloadQR } from "../utils/downloadQR";

export default function QRCodeDisplay({ value, cardId }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setError("");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Clipboard access is unavailable in this browser.");
    }
  }

  function handleDownload(format) {
    try {
      setError("");
      downloadQR(format);
    } catch {
      setError("Could not download the QR code. Please try again.");
    }
  }

  return (
    <div className="qr-result">
      <div className="result-status">
        <span className="result-check">
          <Check size={16} />
        </span>
        QR CODE GENERATED
      </div>

      <div className="qr-preview">
        <QRCodeSVG
          id="generated-qr"
          value={value}
          size={220}
          level="H"
          bgColor="#ffffff"
          fgColor="#1d2924"
        />
      </div>

      <h3>Your QR code is ready.</h3>

      <p className="result-copy">
        Scan it with your phone to open the destination you provided.
      </p>

      <div className="result-meta">
        <span>CARD ID</span>
        <strong>{cardId}</strong>
      </div>

      <div className="destination-box">
        <span>DESTINATION</span>
        <a href={value} target="_blank" rel="noreferrer">
          {value} <ExternalLink size={13} />
        </a>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="download-actions">
        <button
          className="button button-dark"
          onClick={() => handleDownload("png")}
        >
          <Download size={16} /> Download PNG
        </button>

        <button
          className="button button-light"
          onClick={() => handleDownload("svg")}
        >
          <Download size={16} /> SVG
        </button>
      </div>

      <button className="copy-link-button" onClick={copyLink}>
        {copied ? <Check size={15} /> : <Copy size={15} />}
        {copied ? "Copied to clipboard" : "Copy destination link"}
      </button>
    </div>
  );
}
