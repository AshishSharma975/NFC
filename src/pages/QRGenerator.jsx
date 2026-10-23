
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, QrCode, Loader2 } from "lucide-react";
import { activateCardApi } from "../utils/api";

export default function QRGenerator() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();

    try {
      const parsed = new URL(url.trim());

      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("Invalid URL");
      }

      setError("");
      setLoading(true);

      const generatedId = "QR-" + Math.random().toString(36).slice(2, 8).toUpperCase();

      const response = await activateCardApi({
        cardId: generatedId,
        destinationUrl: parsed.href,
        title: "Quick Dynamic QR",
      });

      const cardData = response.data;

      navigate("/result", {
        state: {
          cardId: cardData.cardId,
          reviewUrl: cardData.destinationUrl,
          qrUrl: cardData.qrUrl,
          status: cardData.status,
        },
      });
    } catch (err) {
      setError(err.message || "Please enter a valid URL beginning with https://");
    } finally {
      setLoading(false);
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

          <button className="button button-dark form-submit" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> Generating dynamic QR...
              </>
            ) : (
              <>
                Create QR code <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <p className="standalone-note">
          Generates a dynamic QR code stored in MongoDB.
          The permanent link routes to your destination URL seamlessly.
        </p>
      </div>
    </section>
  );
}
