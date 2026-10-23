
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ExternalLink, ShieldCheck, Loader2 } from "lucide-react";
import StepIndicator from "../components/StepIndicator";
import { activateCardApi } from "../utils/api";

export default function Activate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cardId, setCardId] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const paramId = searchParams.get("cardId");
    if (paramId) {
      setCardId(paramId.trim());
    }
  }, [searchParams]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!cardId.trim()) {
      setError("Enter the card ID printed on your product.");
      return;
    }

    try {
      const url = new URL(reviewUrl.trim());

      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      setError("Enter a valid Google review URL starting with https://");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await activateCardApi({
        cardId: cardId.trim(),
        destinationUrl: reviewUrl.trim(),
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
      setError(err.message || "Failed to activate card. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="workflow-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back home
      </Link>

      <div className="workflow-grid">
        <div className="workflow-intro">
          <span className="eyebrow">CARD CONFIGURATION</span>
          <h1>Let's get your card ready.</h1>
          <p>
            Add your card details and choose the destination
            customers should reach when they scan.
          </p>

          <div className="workflow-assurance">
            <ShieldCheck size={19} />
            <span>
              <strong>Your setup, your destination.</strong>
              <small>Review your link before generating the code.</small>
            </span>
          </div>
        </div>

        <div className="form-panel">
          <StepIndicator
            current={1}
            labels={["Card details", "Review link", "QR result"]}
          />

          <div className="form-heading">
            <span className="eyebrow">STEP 01</span>
            <h2>Connect your destination</h2>
            <p>Enter the details for this setup.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label className="form-label" htmlFor="cardId">
              Card ID <span className="required">*</span>
            </label>
            <input
              className="form-input"
              id="cardId"
              value={cardId}
              onChange={(event) => setCardId(event.target.value)}
              placeholder="e.g. TD-00123"
              autoComplete="off"
            />
            <p className="input-help">
              Use the ID printed on the card or its packaging.
            </p>

            <label className="form-label" htmlFor="reviewUrl">
              Google review URL <span className="required">*</span>
            </label>
            <input
              className="form-input"
              id="reviewUrl"
              type="url"
              value={reviewUrl}
              onChange={(event) => setReviewUrl(event.target.value)}
              placeholder="https://g.page/r/..."
              autoComplete="url"
            />
            <p className="input-help">
              <ExternalLink size={12} />
              Paste your existing Google review link.
            </p>

            {error && <p className="form-error" role="alert">{error}</p>}

            <button className="button button-dark form-submit" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> Activating card...
                </>
              ) : (
                <>
                  Generate QR code <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="form-disclaimer">
            Card details are securely saved in MongoDB. The permanent dynamic QR code
            allows you to update your Google Review destination link at any time.
          </div>
        </div>
      </div>
    </section>
  );
}
