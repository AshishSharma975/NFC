
import { Link, useLocation, Navigate } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import QRCodeDisplay from "../components/QRCodeDisplay";
import StepIndicator from "../components/StepIndicator";

export default function Result() {
  const { state } = useLocation();

  if (!state?.reviewUrl || !state?.cardId) {
    return <Navigate to="/activate" replace />;
  }

  return (
    <section className="workflow-page result-page">
      <Link to="/activate" className="back-link">
        <ArrowLeft size={16} /> Edit details
      </Link>

      <div className="result-layout">
        <div className="workflow-intro">
          <span className="eyebrow">YOUR QR CODE</span>
          <h1>Ready to share.</h1>
          <p>
            Your QR code contains the destination you entered.
            Download it for print or digital sharing.
          </p>
          <Link to="/activate" className="text-link">
            <RotateCcw size={15} /> Create another
          </Link>
        </div>

        <div className="form-panel result-panel">
          <StepIndicator
            current={3}
            labels={["Card details", "Review link", "QR result"]}
          />
          <QRCodeDisplay
            qrUrl={state.qrUrl || state.reviewUrl}
            destinationUrl={state.reviewUrl}
            cardId={state.cardId}
          />
        </div>
      </div>
    </section>
  );
}
