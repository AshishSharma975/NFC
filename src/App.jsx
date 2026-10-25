
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Activate from "./pages/Activate";
import QRGenerator from "./pages/QRGenerator";
import Result from "./pages/Result";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className={`app-shell ${isAdmin ? "admin-shell" : ""}`}>
      {!isAdmin && <Header />}

      <main className={`main-content ${isAdmin ? "admin-main-content" : ""}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/activate" element={<Activate />} />
          <Route path="/qr-generator" element={<QRGenerator />} />
          <Route path="/result" element={<Result />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAdmin && <Footer />}
    </div>
  );
}
