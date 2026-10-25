import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  ScanLine,
  ArrowRight,
  Star,
  QrCode,
  Smartphone,
  Search,
  RotateCcw,
  Lock,
  Layers,
} from "lucide-react";
import { getAdminToken } from "../utils/api";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isAdmin = Boolean(getAdminToken());

  // Close mobile menu whenever navigation occurs
  useEffect(() => {
    setMobileMenuOpen(false);
    document.body.style.overflow = "unset";
  }, [location.pathname, location.hash]);

  // Toggle mobile menu and lock background body scroll
  function toggleMobileMenu() {
    setMobileMenuOpen((prev) => {
      const next = !prev;
      document.body.style.overflow = next ? "hidden" : "unset";
      return next;
    });
  }

  function closeMenu() {
    setMobileMenuOpen(false);
    document.body.style.overflow = "unset";
  }

  return (
    <>
      <header className="site-header">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-icon"><ScanLine size={19} /></span>
          <span>tapform<span className="brand-period">.</span></span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-links desktop-only">
          <a href="/#solutions">Solutions</a>
          <a href="/#how-it-works">How it works</a>
          <NavLink to="/activate">Card setup</NavLink>
          <NavLink to="/qr-generator">QR generator</NavLink>
          <a href="/#check-stand">Check stand</a>
        </nav>

        {/* Desktop CTA */}
        <Link to="/activate" className="header-cta desktop-only">
          Get started <ArrowUpRight size={15} />
        </Link>

        {/* Mobile Hamburger Button with Smooth Animation */}
        <button
          type="button"
          className={`mobile-hamburger-btn ${mobileMenuOpen ? "active" : ""}`}
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
        >
          <span className="ham-line ham-top" />
          <span className="ham-line ham-mid" />
          <span className="ham-line ham-bot" />
        </button>
      </header>

      {/* Mobile Animated Overlay Backdrop */}
      <div
        className={`mobile-menu-backdrop ${mobileMenuOpen ? "visible" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobile Drawer Menu */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-drawer-inner">
          <div className="mobile-drawer-section-label">NAVIGATION</div>

          <div className="mobile-nav-items">
            <a href="/#solutions" className="mobile-nav-link" onClick={closeMenu}>
              <div className="nav-icon-badge"><Star size={17} /></div>
              <div className="nav-link-texts">
                <strong>Solutions</strong>
                <span>Google review stands & NFC cards</span>
              </div>
              <ArrowRight size={15} className="nav-arrow-icon" />
            </a>

            <a href="/#how-it-works" className="mobile-nav-link" onClick={closeMenu}>
              <div className="nav-icon-badge"><RotateCcw size={17} /></div>
              <div className="nav-link-texts">
                <strong>How it works</strong>
                <span>Simple 3-step setup guide</span>
              </div>
              <ArrowRight size={15} className="nav-arrow-icon" />
            </a>

            <NavLink to="/activate" className="mobile-nav-link" onClick={closeMenu}>
              <div className="nav-icon-badge green"><Smartphone size={17} /></div>
              <div className="nav-link-texts">
                <strong>Card setup</strong>
                <span>Connect your Google Review destination</span>
              </div>
              <ArrowRight size={15} className="nav-arrow-icon" />
            </NavLink>

            <NavLink to="/qr-generator" className="mobile-nav-link" onClick={closeMenu}>
              <div className="nav-icon-badge"><QrCode size={17} /></div>
              <div className="nav-link-texts">
                <strong>QR generator</strong>
                <span>Create free high-res dynamic QR</span>
              </div>
              <ArrowRight size={15} className="nav-arrow-icon" />
            </NavLink>

            <a href="/#check-stand" className="mobile-nav-link" onClick={closeMenu}>
              <div className="nav-icon-badge"><Search size={17} /></div>
              <div className="nav-link-texts">
                <strong>Check stand</strong>
                <span>View scan count & edit your link</span>
              </div>
              <ArrowRight size={15} className="nav-arrow-icon" />
            </a>
          </div>

          {/* Mobile Bottom Actions */}
          <div className="mobile-drawer-footer">
            <Link to="/activate" className="mobile-primary-cta" onClick={closeMenu}>
              Set up your card <ArrowRight size={16} />
            </Link>

            <div className="mobile-extra-links">
              <span>© {new Date().getFullYear()} tapform.</span>
              {isAdmin && (
                <Link to="/admin" className="mobile-admin-link" onClick={closeMenu}>
                  <Lock size={12} /> Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
