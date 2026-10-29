import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, ScanLine, Star } from "lucide-react";
import { getAdminToken } from "../utils/api";

export default function Footer() {
  const isAdminLoggedIn = Boolean(getAdminToken());
  const [tapCount, setTapCount] = useState(0);
  const navigate = useNavigate();

  const handleSecretTripleTap = () => {
    const next = tapCount + 1;
    if (next >= 3) {
      setTapCount(0);
      navigate("/admin");
    } else {
      setTapCount(next);
      setTimeout(() => setTapCount(0), 1800);
    }
  };

  return (
    <footer className="main-site-footer">
      <div className="footer-top-grid">
        {/* Brand Col */}
        <div className="footer-brand-col">
          <Link to="/" className="brand" style={{ marginBottom: "14px", display: "inline-flex" }}>
            <span className="brand-icon"><ScanLine size={19} /></span>
            <span>tapform<span className="brand-period">.</span></span>
          </Link>
          <p className="footer-brand-desc">
            Smart NFC counter stands & dynamic QR touchpoints.
            Turning in-store customer visits into 5-star Google reviews and automated business growth.
          </p>
          <div className="footer-rating-pill">
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            <span>4.9 / 5 Rating from 1,200+ Businesses</span>
          </div>
        </div>

        {/* Col 1: Solutions */}
        <div className="footer-links-col">
          <h4>Solutions</h4>
          <ul>
            <li><a href="/#solutions">Google Review Stands</a></li>
            <li><Link to="/qr-generator">Dynamic QR Codes</Link></li>
            <li><a href="/#solutions">Digital NFC Business Cards</a></li>
            <li><a href="/#solutions">Touchless Restaurant Menus</a></li>
            <li><a href="/#solutions">1-Tap Wi-Fi & Payments</a></li>
          </ul>
        </div>

        {/* Col 2: Customer Tools */}
        <div className="footer-links-col">
          <h4>Customer Tools</h4>
          <ul>
            <li><Link to="/activate">Set Up Your Stand</Link></li>
            <li><Link to="/qr-generator">Generate Free QR Code</Link></li>
            <li><a href="/#check-stand">Check Stand Status</a></li>
            <li><a href="/#how-it-works">How It Works</a></li>
          </ul>
        </div>

        {/* Col 3: Why Tapform */}
        <div className="footer-links-col">
          <h4>Product Features</h4>
          <ul>
            <li><span>✓ iPhone & Android Compatible</span></li>
            <li><span>✓ No App Download Needed</span></li>
            <li><span>✓ Update Links Anytime</span></li>
            <li><span>✓ 1024px Print Vector Exports</span></li>
            <li><span>✓ 10+ Year Chip Lifetime</span></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <span
          onClick={handleSecretTripleTap}
          style={{ cursor: "default", userSelect: "none" }}
          title={tapCount > 0 ? `Triple-click to open Admin (${tapCount}/3)` : undefined}
        >
          © {new Date().getFullYear()} tapform. All rights reserved. Designed for everyday business.
        </span>
        <div className="footer-bottom-actions">
          <a href="/#solutions">Privacy & Terms</a>
          {/* Admin link only visible to authenticated admin on their device */}
          {isAdminLoggedIn && (
            <Link to="/admin" className="footer-admin-link" title="Admin Portal (You are authorized)">
              <Lock size={12} /> Admin Console
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
