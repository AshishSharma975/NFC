
import { Link, NavLink } from "react-router-dom";
import { ArrowUpRight, ScanLine } from "lucide-react";

export default function Header() {
  return (
    <header className="site-header">
      <Link to="/" className="brand">
        <span className="brand-icon"><ScanLine size={19} /></span>
        <span>tapform<span className="brand-period">.</span></span>
      </Link>

      <nav className="nav-links">
        <NavLink to="/activate">Card setup</NavLink>
        <NavLink to="/qr-generator">QR generator</NavLink>
      </nav>

      <Link to="/activate" className="header-cta">
        Get started <ArrowUpRight size={15} />
      </Link>
    </header>
  );
}
