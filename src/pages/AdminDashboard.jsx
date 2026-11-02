import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  LogOut,
  QrCode,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Search,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Edit3,
  Power,
  Download,
  Plus,
  ArrowRight,
  X,
  Loader2,
  Sparkles,
  Layers,
  Activity,
  Trash2,
  Hash,
  ArrowLeft,
  Sliders,
  MapPin,
  Share2,
  Smartphone,
} from "lucide-react";
import {
  adminLoginApi,
  adminVerifyApi,
  getAdminStatsApi,
  getAllCardsApi,
  updateCardApi,
  activateCardApi,
  deleteCardApi,
  getAdminToken,
  setAdminToken,
  clearAdminToken,
} from "../utils/api";
import BulkExportSection from "../components/BulkExportSection";
import "../admin.css";

export default function AdminDashboard() {
  // Authorization State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [passcode, setPasscode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Active Tab: 'overview' | 'all-in-one' | 'bulk' | 'directory'
  const [activeTab, setActiveTab] = useState("overview");

  // All-in-One Stand & Social Studio State
  const [studioCardId, setStudioCardId] = useState("");
  const [studioCardNumber, setStudioCardNumber] = useState(null);
  const [studioTitle, setStudioTitle] = useState("");
  const [studioReviewUrl, setStudioReviewUrl] = useState("");
  const [studioCardType, setStudioCardType] = useState("connect");
  const [studioInstagram, setStudioInstagram] = useState("");
  const [studioWhatsapp, setStudioWhatsapp] = useState("");
  const [studioFacebook, setStudioFacebook] = useState("");
  const [studioStatus, setStudioStatus] = useState("active");
  const [studioSaving, setStudioSaving] = useState(false);
  const [studioSuccess, setStudioSuccess] = useState("");
  const [studioError, setStudioError] = useState("");

  // Dashboard Data State
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalScans: 0,
    activationRate: 0,
  });
  const [recentCards, setRecentCards] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Directory Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals & Action States
  const [toastMessage, setToastMessage] = useState("");
  const [copiedMap, setCopiedMap] = useState({});

  // Edit Modal State
  const [editingCard, setEditingCard] = useState(null);
  const [editUrl, setEditUrl] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [editCardType, setEditCardType] = useState("review");
  const [editInstagram, setEditInstagram] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editFacebook, setEditFacebook] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // QR Viewer Modal State
  const [qrModalCard, setQrModalCard] = useState(null);

  // Quick Add Stand Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCardId, setNewCardId] = useState("");
  const [newDestination, setNewDestination] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [addingCard, setAddingCard] = useState(false);
  const [addError, setAddError] = useState("");

  // Delete Confirm State
  const [deletingId, setDeletingId] = useState(null);
  const [deletingInProgress, setDeletingInProgress] = useState(false);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  }

  // Check initial authentication
  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      setAuthChecking(false);
      setIsAuthenticated(false);
      return;
    }

    adminVerifyApi()
      .then(() => {
        setIsAuthenticated(true);
      })
      .catch(() => {
        clearAdminToken();
        setIsAuthenticated(false);
      })
      .finally(() => {
        setAuthChecking(false);
      });
  }, []);

  // Fetch Dashboard Stats & Cards
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoadingCards(true);
    }
    setError("");

    try {
      const [statsRes, cardsRes] = await Promise.all([
        getAdminStatsApi().catch(() => null),
        getAllCardsApi({
          status: statusFilter,
          search: search.trim(),
          limit: 200,
        }).catch((err) => {
          throw err;
        }),
      ]);

      if (statsRes && statsRes.success) {
        setStats(statsRes.stats || {});
        setRecentCards(statsRes.recentCards || []);
        setRecentScans(statsRes.recentScans || []);
      }

      if (cardsRes && cardsRes.success) {
        const fetchedCards = cardsRes.data || [];
        setCards(fetchedCards);
        if (!statsRes && cardsRes.stats) {
          setStats(cardsRes.stats);
        }
        // Initialize Studio with first card if not set yet
        setStudioCardId((prev) => {
          if (!prev && fetchedCards.length > 0) {
            const first = fetchedCards[0];
            setStudioCardNumber(first.cardNumber ?? null);
            setStudioTitle(first.title || "");
            setStudioReviewUrl(first.destinationUrl || "");
            setStudioCardType(first.cardType || "connect");
            setStudioInstagram(first.socialLinks?.instagram || "");
            setStudioWhatsapp(first.socialLinks?.whatsapp || "");
            setStudioFacebook(first.socialLinks?.facebook || "");
            setStudioStatus(first.status || "active");
            return first.cardId;
          }
          return prev;
        });
      }
    } catch (err) {
      setError(err.message || "Failed to load admin data.");
    } finally {
      setLoadingCards(false);
      setRefreshing(false);
    }
  }, [statusFilter, search]);

  // Select card to edit/preview in All-in-One Studio
  const selectCardForStudio = useCallback((card) => {
    if (!card) return;
    setStudioCardId(card.cardId || "");
    setStudioCardNumber(card.cardNumber ?? null);
    setStudioTitle(card.title || "");
    setStudioReviewUrl(card.destinationUrl || "");
    setStudioCardType(card.cardType || "connect");
    setStudioInstagram(card.socialLinks?.instagram || "");
    setStudioWhatsapp(card.socialLinks?.whatsapp || "");
    setStudioFacebook(card.socialLinks?.facebook || "");
    setStudioStatus(card.status || "active");
    setStudioError("");
    setStudioSuccess("");
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, fetchDashboardData]);

  // Handle Admin Login
  async function handleLogin(e) {
    e.preventDefault();
    if (!passcode.trim()) {
      setAuthError("Please enter your admin passcode.");
      return;
    }

    setLoggingIn(true);
    setAuthError("");

    try {
      const response = await adminLoginApi(passcode.trim());
      if (response && response.success) {
        setAdminToken(response.token || passcode.trim(), rememberMe);
        setIsAuthenticated(true);
        setPasscode("");
      } else {
        throw new Error(response.message || "Authentication failed.");
      }
    } catch (err) {
      setAuthError(err.message || "Invalid admin passcode.");
    } finally {
      setLoggingIn(false);
    }
  }

  // Handle Logout
  function handleLogout() {
    clearAdminToken();
    setIsAuthenticated(false);
    showToast("Admin session locked. Passcode required to re-enter.");
  }

  // Copy helper
  async function copyToClipboard(text, key) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMap((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => setCopiedMap((prev) => ({ ...prev, [key]: false })), 2000);
      showToast("Copied to clipboard!");
    } catch {
      showToast("Unable to copy to clipboard.");
    }
  }

  // Status Toggle
  async function handleToggleStatus(card) {
    const nextStatus = card.status === "active" ? "inactive" : "active";
    try {
      await updateCardApi(card.cardId, { status: nextStatus });
      setCards((prev) =>
        prev.map((c) => (c.cardId === card.cardId ? { ...c, status: nextStatus } : c))
      );
      setStats((prev) => ({
        ...prev,
        active: nextStatus === "active" ? prev.active + 1 : Math.max(0, prev.active - 1),
        inactive: nextStatus === "inactive" ? prev.inactive + 1 : Math.max(0, prev.inactive - 1),
      }));
      showToast(`Card '${card.cardId}' status set to ${nextStatus.toUpperCase()}`);
    } catch (err) {
      showToast(err.message || "Failed to update status.");
    }
  }

  // Handle Card Edit Submit
  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingCard) return;

    setSavingEdit(true);
    setEditError("");

    try {
      const updates = {
        destinationUrl: editUrl.trim(),
        title: editTitle.trim(),
        status: editStatus,
        cardType: editCardType,
        socialLinks: {
          instagram: editInstagram.trim(),
          whatsapp: editWhatsapp.trim(),
          facebook: editFacebook.trim(),
        },
      };

      const res = await updateCardApi(editingCard.cardId, updates);
      if (res && res.success) {
        setCards((prev) =>
          prev.map((c) => (c.cardId === editingCard.cardId ? { ...c, ...res.data } : c))
        );
        setEditingCard(null);
        showToast(`Card '${editingCard.cardId}' updated successfully!`);
      }
    } catch (err) {
      setEditError(err.message || "Failed to save card changes.");
    } finally {
      setSavingEdit(false);
    }
  }

  // Handle Quick Add Stand
  async function handleCreateSingleCard(e) {
    e.preventDefault();
    if (!newCardId.trim()) {
      setAddError("Card ID is required.");
      return;
    }

    setAddingCard(true);
    setAddError("");

    try {
      const res = await activateCardApi({
        cardId: newCardId.trim().toUpperCase(),
        destinationUrl: newDestination.trim() || `${window.location.origin}/activate?cardId=${newCardId.trim().toUpperCase()}`,
        title: newTitle.trim(),
      });

      if (res && res.success) {
        showToast(`Card '${newCardId}' registered!`);
        setShowAddModal(false);
        setNewCardId("");
        setNewDestination("");
        setNewTitle("");
        fetchDashboardData(true);
      }
    } catch (err) {
      setAddError(err.message || "Failed to create card.");
    } finally {
      setAddingCard(false);
    }
  }

  // Handle Save in All-in-One Studio
  async function handleSaveStudioStand(e) {
    e.preventDefault();
    const cleanId = studioCardId.trim().toUpperCase();
    const cleanUrl = studioReviewUrl.trim();

    if (!cleanId) {
      setStudioError("Stand Card ID is required.");
      return;
    }
    if (!cleanUrl) {
      setStudioError("Shop Location / Google Review link is mandatory.");
      return;
    }

    try {
      const url = new URL(cleanUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      setStudioError("Please enter a valid URL starting with https://");
      return;
    }

    setStudioSaving(true);
    setStudioError("");
    setStudioSuccess("");

    try {
      const payload = {
        cardId: cleanId,
        destinationUrl: cleanUrl,
        title: studioTitle.trim(),
        cardType: studioCardType,
        status: studioStatus,
        socialLinks: {
          instagram: studioInstagram.trim(),
          whatsapp: studioWhatsapp.trim(),
          facebook: studioFacebook.trim(),
        },
      };

      const existing = cards.find(
        (c) => c.cardId.toUpperCase() === cleanId
      );

      let response;
      if (existing) {
        response = await updateCardApi(existing.cardId, payload);
      } else {
        response = await activateCardApi(payload);
      }

      if (response && response.success) {
        setStudioSuccess(`Stand '${cleanId}' successfully saved and updated!`);
        showToast(`Stand '${cleanId}' All-in-One configuration saved!`);
        fetchDashboardData(true);
      } else {
        throw new Error(response?.message || "Failed to save stand.");
      }
    } catch (err) {
      setStudioError(err.message || "Failed to save All-in-One Stand.");
    } finally {
      setStudioSaving(false);
    }
  }

  // Handle Delete Card
  async function confirmDeleteCard() {
    if (!deletingId) return;
    setDeletingInProgress(true);

    try {
      await deleteCardApi(deletingId);
      setCards((prev) => prev.filter((c) => c.cardId !== deletingId));
      setStats((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
      showToast(`Deleted card '${deletingId}'`);
      setDeletingId(null);
    } catch (err) {
      showToast(err.message || "Failed to delete card.");
    } finally {
      setDeletingInProgress(false);
    }
  }

  // General helper to download any QR SVG element as PNG (1024px), SVG, or CorelDRAW
  function downloadSvgAs(elementId, filename = "stand-qr", format = "png") {
    const svgEl = document.getElementById(elementId);
    if (!svgEl) return;

    const source = new XMLSerializer().serializeToString(svgEl);

    if (format === "cdr") {
      const corelSvg = `<!-- CorelDRAW Print Ready Vector: In CorelDRAW, press Ctrl+I (File > Import) to open as 100% Vector Curves -->\n` + source;
      const blob = new Blob([corelSvg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}_CorelDRAW_Vector.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast(`Downloaded CorelDRAW Vector for ${filename}! (CorelDRAW me Ctrl+I karein)`);
      return;
    }

    if (format === "svg") {
      const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast(`Downloaded ${filename}.svg`);
      return;
    }

    const img = new Image();
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.drawImage(img, 0, 0, 1024, 1024);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `${filename}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(pngUrl), 1000);
        showToast(`Downloaded ${filename}.png (1024x1024)`);
      }, "image/png");
    };
    img.src = url;
  }


  // When a bulk batch is created, refresh list and navigate to directory
  function handleBatchCreated(res) {
    showToast(`Created batch '${res.batchId}' with ${res.count} cards!`);
    fetchDashboardData(true);
  }

  // Loading Splash
  if (authChecking) {
    return (
      <div className="admin-auth-gate-wrapper">
        <div className="auth-gate-box">
          <Loader2 size={36} className="spin-icon text-accent" />
          <p className="mt-16">Verifying Admin Authorization...</p>
        </div>
      </div>
    );
  }

  // AUTHENTICATION GATEKEEPER SCREEN (If not authorized)
  if (!isAuthenticated) {
    return (
      <div className="admin-auth-gate-wrapper">
        <div className="auth-gate-box">
          <div className="auth-shield-mark">
            <Lock size={26} />
          </div>

          <span className="auth-badge-tag">TAPFORM SECURITY GATEWAY</span>
          <h1 className="auth-main-title">Admin Console Access</h1>
          <p className="auth-sub-desc">
            This dashboard is private and strictly protected. Enter your administrator passcode to proceed.
          </p>

          <form onSubmit={handleLogin} className="auth-gate-form">
            <div className="auth-input-container">
              <Key size={17} className="auth-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Admin Passcode"
                className="auth-input-field"
                autoFocus
                required
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide passcode" : "Show passcode"}
              >
                {showPassword ? <Unlock size={15} /> : <Lock size={15} />}
              </button>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#64748b", margin: "10px 0 14px", cursor: "pointer", userSelect: "none" }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: "#16a34a", cursor: "pointer" }}
              />
              <span>Remember authorization on this device</span>
            </label>

            {authError && (
              <div className="admin-alert-banner alert-danger mt-12" style={{ marginBottom: "12px" }}>
                <AlertCircle size={15} />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loggingIn}
            >
              {loggingIn ? (
                <>
                  <Loader2 size={16} className="spin-icon" /> Authorizing Access...
                </>
              ) : (
                <>
                  Authorize & Enter Console <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-help">
            <Link to="/" className="auth-back-link">
              <ArrowLeft size={13} /> Back to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // MAIN AUTHORIZED ADMIN PORTAL
  return (
    <div className="admin-portal-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="admin-toast-banner">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ADMIN NAVIGATION BAR */}
      <header className="admin-top-nav">
        <div className="admin-nav-left">
          <Link to="/" className="admin-brand-link">
            <span className="brand-dot" />
            <span className="brand-text">tapform</span>
            <span className="admin-tag-pill">ADMIN CONSOLE</span>
          </Link>

          <div className="db-status-chip">
            <span className="db-live-indicator" />
            <span>MongoDB Connected</span>
          </div>
        </div>

        {/* TABS SWITCHER */}
        <nav className="admin-nav-tabs">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <BarChart3 size={15} />
            <span>Overview</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "all-in-one" ? "active" : ""}`}
            onClick={() => setActiveTab("all-in-one")}
          >
            <Sparkles size={15} />
            <span>All-in-One Studio</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "bulk" ? "active" : ""}`}
            onClick={() => setActiveTab("bulk")}
          >
            <Layers size={15} />
            <span>Bulk Generator</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "directory" ? "active" : ""}`}
            onClick={() => setActiveTab("directory")}
          >
            <QrCode size={15} />
            <span>Stands ({stats.total || cards.length})</span>
          </button>
        </nav>

        {/* RIGHT QUICK ACTIONS */}
        <div className="admin-nav-right">
          <button
            type="button"
            className="admin-action-btn secondary"
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            title="Refresh database"
          >
            <RefreshCw size={14} className={refreshing ? "spin-icon" : ""} />
            <span>{refreshing ? "Refreshing..." : "Sync"}</span>
          </button>

          <button
            type="button"
            className="admin-action-btn primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={14} />
            <span>New Stand</span>
          </button>

          <button
            type="button"
            className="admin-action-btn danger"
            onClick={handleLogout}
            title="Lock and Log out of admin console"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "0 10px" }}
          >
            <LogOut size={14} />
            <span style={{ fontSize: "12px", fontWeight: "600" }}>Logout</span>
          </button>
        </div>
      </header>

      {/* MAIN ADMIN WORKSPACE */}
      <main className="admin-workspace-body">
        {/* ============================================================== */}
        {/* TAB 1: OVERVIEW & ANALYTICS                                    */}
        {/* ============================================================== */}
        {activeTab === "overview" && (
          <div className="admin-tab-content overview-tab-layout">
            {/* Top Metric Cards */}
            <div className="admin-kpi-grid">
              <div className="kpi-card total-card">
                <div className="kpi-card-top">
                  <span className="kpi-title">TOTAL DYNAMIC QRS</span>
                  <div className="kpi-icon-wrap"><Hash size={18} /></div>
                </div>
                <div className="kpi-main-num">{stats.total || 0}</div>
                <div className="kpi-card-foot">
                  <span>Registered in database</span>
                </div>
              </div>

              <div className="kpi-card active-card">
                <div className="kpi-card-top">
                  <span className="kpi-title">ACTIVE LIVE STANDS</span>
                  <div className="kpi-icon-wrap green"><CheckCircle2 size={18} /></div>
                </div>
                <div className="kpi-main-num text-green">{stats.active || 0}</div>
                <div className="kpi-card-foot">
                  <span>
                    {stats.total > 0
                      ? `${Math.round((stats.active / stats.total) * 100)}% active rate`
                      : "0% active"}
                  </span>
                </div>
              </div>

              <div className="kpi-card inactive-card">
                <div className="kpi-card-top">
                  <span className="kpi-title">INACTIVE / READY TO SETUP</span>
                  <div className="kpi-icon-wrap orange"><AlertCircle size={18} /></div>
                </div>
                <div className="kpi-main-num text-orange">{stats.inactive || 0}</div>
                <div className="kpi-card-foot">
                  <span>Show activation landing page</span>
                </div>
              </div>

              <div className="kpi-card scans-card">
                <div className="kpi-card-top">
                  <span className="kpi-title">TOTAL CUSTOMER SCANS</span>
                  <div className="kpi-icon-wrap purple"><Activity size={18} /></div>
                </div>
                <div className="kpi-main-num text-purple">{stats.totalScans || 0}</div>
                <div className="kpi-card-foot">
                  <span>NFC taps & QR scans aggregated</span>
                </div>
              </div>
            </div>

            {/* Quick Action Banners */}
            <div className="admin-banner-grid">
              <div className="action-banner-card banner-all-in-one" onClick={() => setActiveTab("all-in-one")}>
                <div className="banner-icon-badge amber"><Sparkles size={22} /></div>
                <div className="banner-card-content">
                  <h3>All-in-One Multi-Link Studio</h3>
                  <p>Configure Google Review, Instagram, WhatsApp, and Facebook links with live vector print exports.</p>
                </div>
                <button type="button" className="banner-arrow-btn">
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="action-banner-card" onClick={() => setActiveTab("bulk")}>
                <div className="banner-icon-badge"><Layers size={22} /></div>
                <div className="banner-card-content">
                  <h3>Generate Bulk Dynamic QRs (100 - 500)</h3>
                  <p>Create batch print files, sequential card numbers, and automatic permanent redirect URLs.</p>
                </div>
                <button type="button" className="banner-arrow-btn">
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="action-banner-card" onClick={() => setActiveTab("directory")}>
                <div className="banner-icon-badge green"><QrCode size={22} /></div>
                <div className="banner-card-content">
                  <h3>Manage Live Stands Directory</h3>
                  <p>Update Google Review destination links, toggle stands active/inactive, or download QR print files.</p>
                </div>
                <button type="button" className="banner-arrow-btn">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Recent Scans & Activity Grid */}
            <div className="recent-activity-grid">
              <div className="activity-panel">
                <div className="panel-sub-header">
                  <Activity size={16} />
                  <h3>Recent Customer Scans</h3>
                </div>
                {recentScans.length === 0 ? (
                  <div className="empty-state-box">
                    <p>No scans recorded yet. When customers tap or scan stands, they appear here live.</p>
                  </div>
                ) : (
                  <div className="activity-list">
                    {recentScans.map((sc) => (
                      <div key={sc.cardId} className="activity-row">
                        <div className="act-left">
                          <code>{sc.cardId}</code>
                          <span className="act-title">{sc.title || "NFC Stand"}</span>
                        </div>
                        <div className="act-right">
                          <span className="scan-pill">{sc.scanCount} scans</span>
                          <small className="scan-time">
                            {sc.lastScannedAt ? new Date(sc.lastScannedAt).toLocaleTimeString() : ""}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="activity-panel">
                <div className="panel-sub-header">
                  <Sparkles size={16} />
                  <h3>Recently Created Stands</h3>
                </div>
                {recentCards.length === 0 ? (
                  <div className="empty-state-box">
                    <p>No cards created yet. Use the Bulk Generator to create your first batch!</p>
                  </div>
                ) : (
                  <div className="activity-list">
                    {recentCards.map((rc) => (
                      <div key={rc.cardId} className="activity-row">
                        <div className="act-left">
                          <code>{rc.cardId}</code>
                          <span className="act-title">{rc.title || "Unassigned Stand"}</span>
                        </div>
                        <div className="act-right">
                          <span className={`status-pill ${rc.status === "active" ? "pill-active" : "pill-inactive"}`}>
                            {rc.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: ALL-IN-ONE STAND & PRINT STUDIO (ADMIN-EXCLUSIVE)      */}
        {/* ============================================================== */}
        {activeTab === "all-in-one" && (
          <div className="admin-tab-content all-in-one-tab-layout">
            {/* Header Banner */}
            <div className="studio-top-banner">
              <div className="studio-banner-text">
                <div className="studio-badge-pill">
                  <Sparkles size={13} />
                  <span>ALL-IN-ONE STAND MANAGER &amp; PRINT STUDIO</span>
                </div>
                <h2>Standard All-in-One Multi-Link &amp; Print Studio</h2>
                <p>
                  Configure multi-channel stands (Google Location + Instagram, WhatsApp &amp; Facebook) exclusively from this private admin panel. Preview print designs in real-time and export vector files.
                </p>
              </div>

              <div className="studio-banner-actions">
                {studioCardId && (
                  <a
                    href={`/c/${studioCardId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-btn-secondary"
                    title="Open customer redirect page in new tab"
                  >
                    <Smartphone size={14} /> <span>Test Scan (/c/{studioCardId})</span> <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>

            {/* Stand Quick-Selector Strip */}
            <div className="studio-selector-strip">
              <div className="selector-field-wrap">
                <label className="strip-label">Select Existing Stand:</label>
                <select
                  value={studioCardId}
                  onChange={(e) => {
                    const found = cards.find((c) => c.cardId === e.target.value);
                    if (found) {
                      selectCardForStudio(found);
                    } else {
                      setStudioCardId(e.target.value);
                    }
                  }}
                  className="admin-select-styled strip-select"
                >
                  <option value="">-- Choose from {cards.length} database stands --</option>
                  {cards.map((c) => (
                    <option key={c.cardId} value={c.cardId}>
                      {c.cardId} — {c.title || "Untitled"} ({c.cardType === "connect" ? "🌐 Social All-in-One" : "📍 Google Review"})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="admin-btn-secondary strip-new-btn"
                onClick={() => {
                  setStudioCardId(`TF-${String(Math.floor(Math.random() * 9000) + 1000)}`);
                  setStudioCardNumber(null);
                  setStudioTitle("");
                  setStudioReviewUrl("");
                  setStudioCardType("connect");
                  setStudioInstagram("");
                  setStudioWhatsapp("");
                  setStudioFacebook("");
                  setStudioStatus("active");
                  setStudioSuccess("");
                  setStudioError("");
                }}
              >
                <Plus size={14} /> <span>New Stand ID</span>
              </button>
            </div>

            {/* 2-Column Responsive Workspace Grid */}
            <div className="all-in-one-workspace-grid">
              {/* Left Column: Configuration Form */}
              <div className="studio-config-card">
                <div className="card-header-styled">
                  <div className="header-title-group">
                    <Sliders size={18} color="#16a34a" />
                    <div>
                      <h3>Stand Configuration</h3>
                      <span className="card-sub-hint">Set destination links &amp; social profiles</span>
                    </div>
                  </div>
                  {studioCardId && (
                    <span className="mono-card-pill"><code>{studioCardId}</code></span>
                  )}
                </div>

                <form onSubmit={handleSaveStudioStand} className="studio-form-body">
                  {/* Stand ID */}
                  <div className="form-group-item">
                    <label className="form-item-label">
                      Stand Card ID <span className="req-star">*</span>
                    </label>
                    <input
                      type="text"
                      value={studioCardId}
                      onChange={(e) => setStudioCardId(e.target.value.toUpperCase())}
                      className="admin-input-styled mono-font"
                      placeholder="e.g. TF-01100"
                      required
                    />
                    <span className="field-hint">Unique identifier on the physical acrylic stand or NFC chip.</span>
                  </div>

                  {/* Stand Title / Business Name */}
                  <div className="form-group-item mt-14">
                    <label className="form-item-label">
                      Business / Stand Name
                    </label>
                    <input
                      type="text"
                      value={studioTitle}
                      onChange={(e) => setStudioTitle(e.target.value)}
                      className="admin-input-styled"
                      placeholder="e.g. Royal Cafe &amp; Bakery"
                    />
                    <span className="field-hint">Rendered on the print preview and customer landing page.</span>
                  </div>

                  {/* Card Functionality Selector */}
                  <div className="form-group-item mt-14">
                    <label className="form-item-label">
                      Card Functionality <span className="req-star">*</span>
                    </label>
                    <div className="studio-type-toggle-row">
                      <button
                        type="button"
                        className={`studio-type-pill ${studioCardType === "connect" ? "active" : ""}`}
                        onClick={() => setStudioCardType("connect")}
                      >
                        <div className="type-pill-icon">🌐</div>
                        <div className="type-pill-text">
                          <strong>Social Connect (All-in-One)</strong>
                          <small>Location + Instagram, WhatsApp &amp; Facebook</small>
                        </div>
                      </button>

                      <button
                        type="button"
                        className={`studio-type-pill ${studioCardType === "review" ? "active" : ""}`}
                        onClick={() => setStudioCardType("review")}
                      >
                        <div className="type-pill-icon">📍</div>
                        <div className="type-pill-text">
                          <strong>Direct Google Review</strong>
                          <small>1-tap redirect to Google Maps</small>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Google Review URL (Mandatory) */}
                  <div className="form-group-item mt-14">
                    <label className="form-item-label">
                      Shop Location / Google Review URL <span className="req-star">* (Mandatory)</span>
                    </label>
                    <div className="input-with-icon-wrap">
                      <MapPin size={15} className="input-icon-left" />
                      <input
                        type="url"
                        value={studioReviewUrl}
                        onChange={(e) => setStudioReviewUrl(e.target.value)}
                        className="admin-input-styled with-left-icon"
                        placeholder="https://g.page/r/... or https://maps.app.goo.gl/..."
                        required
                      />
                    </div>
                    <span className="field-hint">Primary shop location or Google Review link.</span>
                  </div>

                  {/* Social & Business Channels (Shown for All-in-One) */}
                  {studioCardType === "connect" && (
                    <div className="admin-social-block mt-14">
                      <div className="social-block-header">
                        <Share2 size={14} />
                        <span>Social &amp; Business Channels (All-in-One)</span>
                      </div>

                      <div className="social-inputs-stack">
                        <div className="social-input-row-admin">
                          <span className="social-admin-prefix insta">Instagram</span>
                          <input
                            type="text"
                            value={studioInstagram}
                            onChange={(e) => setStudioInstagram(e.target.value)}
                            className="admin-social-input"
                            placeholder="Handle (@myshop) or URL"
                          />
                        </div>

                        <div className="social-input-row-admin">
                          <span className="social-admin-prefix wa">WhatsApp</span>
                          <input
                            type="text"
                            value={studioWhatsapp}
                            onChange={(e) => setStudioWhatsapp(e.target.value)}
                            className="admin-social-input"
                            placeholder="Business number (+91 9876543210)"
                          />
                        </div>

                        <div className="social-input-row-admin">
                          <span className="social-admin-prefix fb">Facebook</span>
                          <input
                            type="text"
                            value={studioFacebook}
                            onChange={(e) => setStudioFacebook(e.target.value)}
                            className="admin-social-input"
                            placeholder="Facebook page link"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stand Status */}
                  <div className="form-group-item mt-14">
                    <label className="form-item-label">Stand Status</label>
                    <select
                      value={studioStatus}
                      onChange={(e) => setStudioStatus(e.target.value)}
                      className="admin-select-styled"
                    >
                      <option value="active">Active (Redirects live on tap/scan)</option>
                      <option value="inactive">Inactive (Shows setup page)</option>
                    </select>
                  </div>

                  {/* Alert Messages */}
                  {studioError && (
                    <div className="admin-alert-banner alert-danger mt-14">
                      <AlertCircle size={15} />
                      <span>{studioError}</span>
                    </div>
                  )}

                  {studioSuccess && (
                    <div className="admin-alert-banner alert-success mt-14">
                      <CheckCircle2 size={15} />
                      <span>{studioSuccess}</span>
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="studio-form-actions mt-18">
                    <button
                      type="submit"
                      className="admin-btn-primary studio-submit-btn"
                      disabled={studioSaving}
                    >
                      {studioSaving ? (
                        <>
                          <Loader2 size={16} className="spin-icon" /> Saving Stand...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} /> Save Stand &amp; Update Links
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Live Dynamic QR Code & Direct Print/Vector Export */}
              <div className="studio-preview-card qr-code-panel-card">
                <div className="card-header-styled">
                  <div className="header-title-group">
                    <QrCode size={18} color="#16a34a" />
                    <div>
                      <h3>Dynamic QR Code</h3>
                      <span className="card-sub-hint">Permanent NFC &amp; QR scan destination</span>
                    </div>
                  </div>
                  <span className={`status-pill ${studioStatus === "active" ? "pill-active" : "pill-inactive"}`}>
                    {studioStatus === "active" ? "🟢 LIVE" : "⚠️ INACTIVE"}
                  </span>
                </div>

                <div className="qr-panel-content text-center">
                  <div className="qr-display-box" style={{ display: "inline-block", padding: "18px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
                    <QRCodeSVG
                      id="studio-live-qr-svg"
                      value={studioCardId ? `${window.location.origin}/c/${studioCardId}` : "https://tapform.me"}
                      size={220}
                      level="H"
                      marginSize={2}
                      bgColor="#ffffff"
                      fgColor="#0f172a"
                    />
                  </div>

                  <div className="qr-meta-box mt-16" style={{ textAlign: "left", background: "#f8fafc", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <div className="qr-meta-line" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>STAND IDENTIFIER</span>
                      <strong className="mono-font" style={{ fontSize: "15px", color: "#0f172a" }}>{studioCardId || "TF-01100"}</strong>
                    </div>

                    <div className="qr-meta-line mt-8" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>FUNCTIONALITY</span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#16a34a" }}>
                        {studioCardType === "connect" ? "🌐 Social All-in-One (Multi-Link)" : "📍 Google Review (Direct)"}
                      </span>
                    </div>

                    <div className="qr-meta-line mt-10">
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>PERMANENT SCAN LINK</span>
                      <div className="url-copy-box" style={{ marginTop: "4px" }}>
                        <code>{studioCardId ? `${window.location.origin}/c/${studioCardId}` : "https://tapform.me"}</code>
                        <button
                          type="button"
                          className="cell-copy-btn"
                          onClick={() =>
                            copyToClipboard(
                              studioCardId ? `${window.location.origin}/c/${studioCardId}` : "https://tapform.me",
                              "studio-qr"
                            )
                          }
                          title="Copy Permanent Scan URL"
                        >
                          {copiedMap["studio-qr"] ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* QR Download Options & Test Button */}
                  <div className="qr-action-buttons-grid mt-18" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={() => downloadSvgAs("studio-live-qr-svg", studioCardId || "stand-qr", "png")}
                      title="Download 1024x1024 High-Res PNG"
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      <Download size={14} /> <span>1024px PNG</span>
                    </button>

                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={() => downloadSvgAs("studio-live-qr-svg", studioCardId || "stand-qr", "svg")}
                      title="Download Vector SVG"
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      <Download size={14} /> <span>Vector SVG</span>
                    </button>

                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={() => downloadSvgAs("studio-live-qr-svg", studioCardId || "stand-qr", "cdr")}
                      title="Download CorelDRAW Vector (Import via Ctrl+I in CorelDRAW)"
                      style={{ width: "100%", justifyContent: "center", background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" }}
                    >
                      <Download size={14} /> <span>CorelDRAW (.cdr)</span>
                    </button>

                    <a
                      href={studioCardId ? `/c/${studioCardId}` : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-btn-primary"
                      title="Test Live Redirection in new tab"
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      <ExternalLink size={14} /> <span>Test Scan</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: BULK GENERATOR & BULK EXPORT (Screenshot 3 Matching UI)  */}
        {/* ============================================================== */}
        {activeTab === "bulk" && (
          <div className="admin-tab-content">
            <BulkExportSection
              totalCardsCount={stats.total}
              onBatchCreated={handleBatchCreated}
            />
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: STANDS DIRECTORY TABLE                                  */}
        {/* ============================================================== */}
        {activeTab === "directory" && (
          <div className="admin-tab-content">
            <div className="directory-header-row">
              <div>
                <h2 className="directory-main-title">Live Stands & Dynamic QRs Directory</h2>
                <p className="directory-sub-desc">
                  Manage all registered cards, toggle live status, edit Google review destinations, or export single stand QRs.
                </p>
              </div>

              <button
                type="button"
                className="admin-btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={15} /> Add Stand
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="directory-controls-bar">
              <div className="search-box-wrap">
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by Card # (#01, #42, 5), Card ID, or Business Title..."
                  className="search-input"
                />
                {search && (
                  <button type="button" className="clear-search-btn" onClick={() => setSearch("")}>
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="filter-chips-row">
                <button
                  type="button"
                  className={`filter-chip ${statusFilter === "all" ? "active" : ""}`}
                  onClick={() => setStatusFilter("all")}
                >
                  All ({stats.total || cards.length})
                </button>
                <button
                  type="button"
                  className={`filter-chip ${statusFilter === "active" ? "active" : ""}`}
                  onClick={() => setStatusFilter("active")}
                >
                  Active ({stats.active || 0})
                </button>
                <button
                  type="button"
                  className={`filter-chip ${statusFilter === "inactive" ? "active" : ""}`}
                  onClick={() => setStatusFilter("inactive")}
                >
                  Inactive ({stats.inactive || 0})
                </button>
              </div>
            </div>

            {/* Table or Empty State */}
            {loadingCards ? (
              <div className="table-loading-box">
                <Loader2 size={32} className="spin-icon" />
                <p>Loading stands from MongoDB...</p>
              </div>
            ) : error ? (
              <div className="admin-alert-banner alert-danger">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            ) : cards.length === 0 ? (
              <div className="directory-empty-state">
                <QrCode size={48} className="empty-qr-icon" />
                <h3>No dynamic stands found</h3>
                <p>
                  {search
                    ? `No cards matching "${search}". Try clearing your search.`
                    : "You haven't generated any dynamic QR stands yet. Use the Bulk Generator to create 100-500 stands in one click!"}
                </p>
                <button
                  type="button"
                  className="admin-btn-primary mt-16"
                  onClick={() => setActiveTab("bulk")}
                >
                  <Layers size={15} /> Open Bulk Generator
                </button>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Card # &amp; ID</th>
                      <th>Stand Name / Title</th>
                      <th>Destination Link</th>
                      <th>Scans</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards.map((card) => {
                      const permanentUrl = card.qrUrl || `/c/${card.cardId}`;
                      const isUnassigned = !card.destinationUrl || card.destinationUrl.trim() === "";
                      const displayNum = card.cardNumber != null
                        ? String(card.cardNumber).padStart(2, "0")
                        : (card.cardId.match(/\d+$/)?.[0] || "01");

                      return (
                        <tr key={card.cardId}>
                          {/* Card Serial Number & ID */}
                          <td>
                            <div className="card-serial-id-group">
                              <span className="card-serial-pill-badge" title="Unique Card Number on physical card">
                                #{displayNum}
                              </span>
                              <div className="card-id-cell">
                                <code>{card.cardId}</code>
                                <button
                                  type="button"
                                  className="cell-copy-btn"
                                  onClick={() => copyToClipboard(card.cardId, `id-${card.cardId}`)}
                                  title="Copy Card ID"
                                >
                                  {copiedMap[`id-${card.cardId}`] ? <Check size={12} /> : <Copy size={12} />}
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Title & Timestamps */}
                          <td>
                            <strong className="cell-title-text">{card.title || "NFC Stand"}</strong>
                            {card.batchId && (
                              <div className="batch-tag-sm">{card.batchId}</div>
                            )}
                            <div className="card-timestamp-meta">
                              {card.activatedAt ? (
                                <span title={`First activated: ${new Date(card.activatedAt).toLocaleString()}`}>
                                  ⚡ Active: {new Date(card.activatedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                                </span>
                              ) : card.createdAt ? (
                                <span title={`Created: ${new Date(card.createdAt).toLocaleString()}`}>
                                  🕒 Added: {new Date(card.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                                </span>
                              ) : null}
                              {card.updatedAt && card.updatedAt !== card.createdAt && (
                                <span className="updated-dot" title={`Last updated: ${new Date(card.updatedAt).toLocaleString()}`}>
                                  • Edited
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Destination */}
                          <td>
                            {isUnassigned ? (
                              <button
                                type="button"
                                className="quick-activate-action-btn"
                                onClick={() => {
                                  setEditingCard(card);
                                  setEditUrl(card.destinationUrl || "");
                                  setEditTitle(card.title || "");
                                  setEditStatus("active");
                                  setEditCardType(card.cardType || "review");
                                  setEditInstagram(card.socialLinks?.instagram || "");
                                  setEditWhatsapp(card.socialLinks?.whatsapp || "");
                                  setEditFacebook(card.socialLinks?.facebook || "");
                                }}
                                title="Click to activate and set Google / Social links"
                              >
                                ⚡ Activate &amp; Set Link
                              </button>
                            ) : (
                              <div className="destination-cell">
                                <a
                                  href={card.destinationUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="dest-url-link"
                                  title={card.destinationUrl}
                                >
                                  <span>{card.destinationUrl}</span>
                                  <ExternalLink size={12} />
                                </a>
                              </div>
                            )}
                            <div className="perm-url-sub">
                              <span>Scan Link:</span>
                              <a href={permanentUrl} target="_blank" rel="noopener noreferrer">
                                {permanentUrl}
                              </a>
                            </div>
                          </td>

                          {/* Scans with Last Scan Timestamp */}
                          <td>
                            <span className="scan-count-badge">
                              {card.scanCount || 0} scans
                            </span>
                            <div className="last-scan-meta">
                              {card.lastScannedAt ? (
                                <small className="last-scan-pill" title={`Last customer scan: ${new Date(card.lastScannedAt).toLocaleString()}`}>
                                  Last: {new Date(card.lastScannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </small>
                              ) : (
                                <small className="last-scan-pill muted">No scans yet</small>
                              )}
                            </div>
                          </td>

                          {/* Status Toggle Switch */}
                          <td>
                            <button
                              type="button"
                              className={`status-toggle-pill ${card.status === "active" ? "active" : "inactive"}`}
                              onClick={() => handleToggleStatus(card)}
                              title="Click to toggle status"
                            >
                              <Power size={12} />
                              <span>{card.status === "active" ? "Active" : "Inactive"}</span>
                            </button>
                          </td>

                          {/* Action Buttons */}
                          <td className="text-right">
                            <div className="action-buttons-cell">
                              {/* Open in All-in-One Studio */}
                              <button
                                type="button"
                                className="row-action-btn studio-btn-row"
                                onClick={() => {
                                  selectCardForStudio(card);
                                  setActiveTab("all-in-one");
                                }}
                                title="Open in All-in-One Studio"
                              >
                                <Sparkles size={14} />
                              </button>

                              {/* View / Download QR */}
                              <button
                                type="button"
                                className="row-action-btn"
                                onClick={() => setQrModalCard(card)}
                                title="View & Download QR"
                              >
                                <QrCode size={14} />
                              </button>

                              {/* Edit Destination */}
                              <button
                                type="button"
                                className="row-action-btn"
                                onClick={() => {
                                  setEditingCard(card);
                                  setEditUrl(card.destinationUrl || "");
                                  setEditTitle(card.title || "");
                                  setEditStatus(card.status || "active");
                                  setEditCardType(card.cardType || "review");
                                  setEditInstagram(card.socialLinks?.instagram || "");
                                  setEditWhatsapp(card.socialLinks?.whatsapp || "");
                                  setEditFacebook(card.socialLinks?.facebook || "");
                                }}
                                title="Edit Destination"
                              >
                                <Edit3 size={14} />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                className="row-action-btn danger"
                                onClick={() => setDeletingId(card.cardId)}
                                title="Delete Stand"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL 1: VIEW & DOWNLOAD STAND QR                             */}
      {/* ============================================================== */}
      {qrModalCard && (
        <div className="admin-modal-overlay" onClick={() => setQrModalCard(null)}>
          <div className="admin-modal-container qr-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <QrCode size={18} />
                <h3>{qrModalCard.title || `Stand ${qrModalCard.cardId}`}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setQrModalCard(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body text-center">
              <div className="qr-preview-card" style={{ display: "inline-block", padding: "18px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.04)" }}>
                <QRCodeSVG
                  id="modal-qr-svg"
                  value={qrModalCard.qrUrl || `${window.location.origin}/c/${qrModalCard.cardId}`}
                  size={240}
                  level="H"
                  marginSize={2}
                />
              </div>

              <div className="qr-modal-meta mt-16" style={{ textAlign: "left", background: "#f8fafc", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div className="meta-line" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>CARD IDENTIFIER</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <strong style={{ fontSize: "15px", color: "#0f172a" }}>{qrModalCard.cardId}</strong>
                    <span className={`status-pill ${qrModalCard.status === "active" ? "pill-active" : "pill-inactive"}`}>
                      {qrModalCard.status === "active" ? "LIVE & REDIRECTING" : "PENDING SETUP"}
                    </span>
                  </div>
                </div>

                <div className="meta-line mt-8" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>CARD FUNCTIONALITY</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#16a34a" }}>
                    {qrModalCard.cardType === "connect" ? "🌐 Social All-in-One Stand" : "📍 Google Review Stand"}
                  </span>
                </div>

                <div className="meta-line mt-10">
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>PERMANENT SCAN LINK</span>
                  <div className="url-copy-box" style={{ marginTop: "4px" }}>
                    <code>{qrModalCard.qrUrl || `${window.location.origin}/c/${qrModalCard.cardId}`}</code>
                    <button
                      type="button"
                      className="cell-copy-btn"
                      onClick={() =>
                        copyToClipboard(
                          qrModalCard.qrUrl || `${window.location.origin}/c/${qrModalCard.cardId}`,
                          "modal-qr"
                        )
                      }
                      title="Copy URL"
                    >
                      {copiedMap["modal-qr"] ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ flexWrap: "wrap", justifyContent: "space-between", gap: "10px" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => downloadSvgAs("modal-qr-svg", qrModalCard.cardId, "png")}
                >
                  <Download size={14} /> PNG (1024px)
                </button>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => downloadSvgAs("modal-qr-svg", qrModalCard.cardId, "svg")}
                >
                  <Download size={14} /> Vector SVG
                </button>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => downloadSvgAs("modal-qr-svg", qrModalCard.cardId, "cdr")}
                  style={{ background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" }}
                >
                  <Download size={14} /> CorelDRAW (.cdr)
                </button>
              </div>
              <a
                href={qrModalCard.qrUrl || `/c/${qrModalCard.cardId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn-primary"
              >
                <ExternalLink size={14} /> Test Live Redirection
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: EDIT CARD DESTINATION                                */}
      {/* ============================================================== */}
      {editingCard && (
        <div className="admin-modal-overlay" onClick={() => setEditingCard(null)}>
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Edit3 size={18} />
                <h3>Edit Stand: {editingCard.cardId}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEditingCard(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="form-group-item">
                  <label className="form-item-label">Stand Title / Business Name</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="admin-input-styled"
                    placeholder="e.g. Reception Stand / Central Cafe"
                  />
                </div>

                <div className="form-group-item mt-16">
                  <label className="form-item-label">
                    Shop Location / Google Review URL <span className="req-star">* (Mandatory)</span>
                  </label>
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="admin-input-styled"
                    placeholder="https://g.page/r/... or https://maps.app.goo.gl/..."
                    required
                  />
                  <span className="field-hint">
                    Mandatory shop location / Google review link for this stand.
                  </span>
                </div>

                <div className="form-group-item mt-16">
                  <label className="form-item-label">Card Functionality</label>
                  <select
                    value={editCardType}
                    onChange={(e) => setEditCardType(e.target.value)}
                    className="admin-select-styled"
                  >
                    <option value="review">Google Review Card (Direct redirect to review link)</option>
                    <option value="connect">Social Connect Card (Location + Social Links)</option>
                  </select>
                </div>

                {editCardType === "connect" && (
                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", marginTop: "14px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "8px" }}>
                      Optional Social Channels
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <input
                        type="text"
                        value={editInstagram}
                        onChange={(e) => setEditInstagram(e.target.value)}
                        className="admin-input-styled"
                        placeholder="Instagram handle (@myshop) or URL"
                        style={{ fontSize: "12px" }}
                      />
                      <input
                        type="text"
                        value={editWhatsapp}
                        onChange={(e) => setEditWhatsapp(e.target.value)}
                        className="admin-input-styled"
                        placeholder="WhatsApp Business (+91 9876543210)"
                        style={{ fontSize: "12px" }}
                      />
                      <input
                        type="text"
                        value={editFacebook}
                        onChange={(e) => setEditFacebook(e.target.value)}
                        className="admin-input-styled"
                        placeholder="Facebook page URL"
                        style={{ fontSize: "12px" }}
                      />
                    </div>
                  </div>
                )}

                <div className="form-group-item mt-16">
                  <label className="form-item-label">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="admin-select-styled"
                  >
                    <option value="active">Active (Redirects live)</option>
                    <option value="inactive">Inactive (Paused / Setup page)</option>
                  </select>
                </div>

                {editError && (
                  <div className="admin-alert-banner alert-danger mt-12">
                    <AlertCircle size={15} />
                    <span>{editError}</span>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setEditingCard(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={savingEdit}
                >
                  {savingEdit ? (
                    <>
                      <Loader2 size={15} className="spin-icon" /> Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: QUICK ADD SINGLE STAND                               */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Plus size={18} />
                <h3>Add New Dynamic Stand</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSingleCard}>
              <div className="modal-body">
                <div className="form-group-item">
                  <label className="form-item-label">
                    Card ID <span className="req-star">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCardId}
                    onChange={(e) => setNewCardId(e.target.value)}
                    className="admin-input-styled"
                    placeholder="e.g. TF-STAND-99"
                    required
                  />
                  <span className="field-hint">Unique identifier for physical stand/card</span>
                </div>

                <div className="form-group-item mt-16">
                  <label className="form-item-label">Stand Title (Optional)</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="admin-input-styled"
                    placeholder="e.g. Downtown Branch #1"
                  />
                </div>

                <div className="form-group-item mt-16">
                  <label className="form-item-label">Google Review URL</label>
                  <input
                    type="url"
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    className="admin-input-styled"
                    placeholder="https://g.page/r/... (optional at registration)"
                  />
                  <span className="field-hint">
                    Leave blank if the customer will configure this card themselves later via the scan landing page.
                  </span>
                </div>

                {addError && (
                  <div className="admin-alert-banner alert-danger mt-12">
                    <AlertCircle size={15} />
                    <span>{addError}</span>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={addingCard}
                >
                  {addingCard ? (
                    <>
                      <Loader2 size={15} className="spin-icon" /> Creating...
                    </>
                  ) : (
                    "Create Stand"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: DELETE CONFIRMATION                                  */}
      {/* ============================================================== */}
      {deletingId && (
        <div className="admin-modal-overlay" onClick={() => setDeletingId(null)}>
          <div className="admin-modal-container delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap text-danger">
                <Trash2 size={18} />
                <h3>Delete Dynamic Stand</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDeletingId(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p>
                Are you sure you want to permanently delete stand <code>{deletingId}</code>?
              </p>
              <p className="field-hint mt-8">
                Any customer scanning this NFC card or QR code in the future will no longer be redirected.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setDeletingId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn-danger"
                onClick={confirmDeleteCard}
                disabled={deletingInProgress}
              >
                {deletingInProgress ? (
                  <>
                    <Loader2 size={15} className="spin-icon" /> Deleting...
                  </>
                ) : (
                  "Yes, Delete Stand"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
