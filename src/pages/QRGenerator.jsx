
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, QrCode } from "lucide-react";

export default function QRGenerator() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();

    try {
      const parsed = new URL(url.trim());

      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("Invalid URL");
      }

      navigate("/result", {
        state: {
          cardId: "QR-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
          reviewUrl: parsed.href,
        },
      });
    } catch {
      setError("Please enter a valid URL beginning with https://");
    }
  }

  return (
    <section className="workflow-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back home
      </Link>

      <div className="standalone-qr-layout">
        <div className="standalone-qr-icon">
          <QrCode size={27} />
        </div>

        <span className="eyebrow">QUICK QR TOOL</span>
        <h1>One link. One QR.</h1>
        <p className="standalone-description">
          Turn any website URL into a downloadable QR code.
          No account is needed for this demo.
        </p>

        <form className="standalone-form" onSubmit={submit} noValidate>
          <label className="form-label" htmlFor="qrUrl">
            Destination URL
          </label>
          <input
            id="qrUrl"
            className="form-input"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://yourwebsite.com"
          />

          {error && <p className="form-error" role="alert">{error}</p>}

          <button className="button button-dark form-submit" type="submit">
            Create QR code <ArrowRight size={17} />
          </button>
        </form>

        <p className="standalone-note">
          This generates a QR code for the URL you provide.
          Changing its destination later requires a redirect service.
        </p>
      </div>
    </section>
  );
}
