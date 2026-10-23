import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Download, ExternalLink, Edit3, Save, X, Loader2 } from "lucide-react";
import { downloadQR } from "../utils/downloadQR";
import { updateCardApi } from "../utils/api";

export default function QRCodeDisplay({ qrUrl, destinationUrl, value, cardId }) {
  const permanentQrValue = qrUrl || value;
  const [currentDestination, setCurrentDestination] = useState(destinationUrl || value);
  const [isEditing, setIsEditing] = useState(false);
  const [editUrl, setEditUrl] = useState(destinationUrl || value);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [copiedPermanent, setCopiedPermanent] = useState(false);
  const [error, setError] = useState("");

  async function copyPermanentLink() {
    try {
      await navigator.clipboard.writeText(permanentQrValue);
      setCopiedPermanent(true);
      setError("");
      setTimeout(() => setCopiedPermanent(false), 2000);
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

  async function handleSaveDestination(event) {
    event.preventDefault();

    if (!editUrl.trim()) {
      setError("Destination URL cannot be empty.");
      return;
    }

    try {
      const parsed = new URL(editUrl.trim());
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      setError("Enter a valid URL starting with https:// or http://");
      return;
    }

    setError("");
    setUpdating(true);

    try {
      const response = await updateCardApi(cardId, {
        destinationUrl: editUrl.trim(),
      });

      setCurrentDestination(response.data.destinationUrl);
      setIsEditing(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3500);
    } catch (err) {
      setError(err.message || "Failed to update destination in database.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="qr-result">
      <div className="result-status">
        <span className="result-check">
          <Check size={16} />
        </span>
        DYNAMIC QR &bull; MONGODB CONNECTED
      </div>

      <div className="qr-preview">
        <QRCodeSVG
          id="generated-qr"
          value={permanentQrValue}
          size={220}
          level="H"
          bgColor="#ffffff"
          fgColor="#1d2924"
        />
      </div>

      <h3>Your QR code is ready.</h3>

      <p className="result-copy">
        The QR code encodes your permanent NFC redirect link. The destination can be changed anytime below.
      </p>

      <div className="result-meta">
        <span>CARD ID</span>
        <strong>{cardId}</strong>
      </div>

      <div className="destination-box" style={{ marginTop: "10px" }}>
        <span>PERMANENT REDIRECT LINK (ENCODED IN QR)</span>
        <a href={permanentQrValue} target="_blank" rel="noreferrer">
          {permanentQrValue} <ExternalLink size={13} />
        </a>
      </div>

      <div className="destination-box" style={{ marginTop: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <span style={{ margin: 0 }}>TARGET DESTINATION</span>
          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                setEditUrl(currentDestination);
                setIsEditing(true);
                setError("");
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#526a4e",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 6px",
              }}
            >
              <Edit3 size={12} /> Edit link
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveDestination} style={{ marginTop: "8px" }}>
            <input
              type="url"
              className="form-input"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              placeholder="https://g.page/r/..."
              style={{ padding: "8px 10px", fontSize: "12px", marginBottom: "8px" }}
              autoFocus
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="submit"
                className="button button-dark"
                disabled={updating}
                style={{ padding: "6px 12px", fontSize: "11px" }}
              >
                {updating ? (
                  <>
                    <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={13} /> Save new link
                  </>
                )}
              </button>
              <button
                type="button"
                className="button button-light"
                onClick={() => {
                  setIsEditing(false);
                  setError("");
                }}
                disabled={updating}
                style={{ padding: "6px 12px", fontSize: "11px" }}
              >
                <X size={13} /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <a href={currentDestination} target="_blank" rel="noreferrer">
            {currentDestination} <ExternalLink size={13} />
          </a>
        )}
      </div>

      {updateSuccess && (
        <div
          role="status"
          style={{
            marginTop: "12px",
            padding: "8px 12px",
            background: "#edf1e8",
            color: "#3e563a",
            borderRadius: "6px",
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            width: "100%",
            textAlign: "left",
          }}
        >
          <Check size={14} /> Destination updated in database! QR code remains identical.
        </div>
      )}

      {error && <p className="form-error" role="alert" style={{ marginTop: "10px" }}>{error}</p>}

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

      <button className="copy-link-button" onClick={copyPermanentLink}>
        {copiedPermanent ? <Check size={15} /> : <Copy size={15} />}
        {copiedPermanent ? "Copied permanent redirect link" : "Copy permanent QR / NFC link"}
      </button>
    </div>
  );
}
