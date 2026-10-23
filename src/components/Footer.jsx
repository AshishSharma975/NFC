
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <Link to="/" className="footer-brand">tapform.</Link>
      <span>Simple tools for better connections.</span>
      <span>© {new Date().getFullYear()}</span>
    </footer>
  );
}
