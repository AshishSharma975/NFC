
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  Fingerprint,
  Link2,
  QrCode,
} from "lucide-react";
import DynamicQRSection from "../components/DynamicQRSection";

export default function Home() {
  return (
    <div className="page-container">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            DIGITAL CONNECTIONS, SIMPLIFIED
          </div>

          <h1>
            One tap.
            <br />
            <span>More meaningful</span>
            <br />
            connections.
          </h1>

          <p className="hero-description">
            Bring your business and customers closer with a
            simple NFC experience and shareable QR codes.
          </p>

          <div className="hero-actions">
            <Link to="/activate" className="button button-dark">
              Set up your card <ArrowRight size={17} />
            </Link>
            <Link to="/qr-generator" className="text-link">
              Create a QR code <ArrowDownRight size={17} />
            </Link>
          </div>

          <div className="hero-caption">
            <span className="caption-line" />
            A simpler way to get connected.
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-topline">
            <span>YOUR DIGITAL TOUCHPOINT</span>
            <span>01 / 03</span>
          </div>

          <div className="demo-card">
            <div className="demo-card-top">
              <div className="demo-brand-mark"><Fingerprint size={23} /></div>
              <span className="demo-card-label">DIGITAL IDENTITY</span>
            </div>

            <div className="demo-orbit orbit-one" />
            <div className="demo-orbit orbit-two" />

            <div className="demo-card-copy">
              <span>GOOD BUSINESS.</span>
              <h2>Better<br />connections.</h2>
            </div>

            <div className="demo-card-bottom">
              <span>NFC ENABLED</span>
              <span className="demo-chip"><Link2 size={16} /></span>
            </div>
          </div>

          <div className="visual-note">
            <div className="note-icon"><QrCode size={19} /></div>
            <div>
              <strong>Tap or scan</strong>
              <p>One link. Your business.</p>
            </div>
            <Check size={18} className="note-check" />
          </div>

          <span className="visual-index">DESIGNED FOR EVERYDAY BUSINESS</span>
        </div>
      </section>

      <section className="benefits">
        <div className="benefit">
          <span className="benefit-number">01</span>
          <h3>Tap to connect</h3>
          <p>Make your NFC experience simple and intuitive.</p>
        </div>
        <div className="benefit">
          <span className="benefit-number">02</span>
          <h3>Share one link</h3>
          <p>Give customers one clear destination to visit.</p>
        </div>
        <div className="benefit">
          <span className="benefit-number">03</span>
          <h3>Scan and go</h3>
          <p>Create QR codes for print and digital sharing.</p>
        </div>
      </section>

      {/* Dynamic QR Live Dashboard Section */}
      <DynamicQRSection />
    </div>
  );
}
