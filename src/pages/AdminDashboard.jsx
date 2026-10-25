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
  Eye,
  X,
  Loader2,
  Sparkles,
  Layers,
  Activity,
  FileSpreadsheet,
  Trash2,
  Radio,
  SlidersHorizontal,
  TrendingUp,
  Hash,
  Database,
  ArrowLeft,
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

  // Active Tab: 'overview' | 'bulk' | 'directory'
  const [activeTab, setActiveTab] = useState("overview");

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
        setCards(cardsRes.data || []);
        if (!statsRes && cardsRes.stats) {
          setStats(cardsRes.stats);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load admin data.");
    } finally {
      setLoadingCards(false);
      setRefreshing(false);
    }
  }, [statusFilter, search]);

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

  // Download QR code from modal as PNG (1024x1024) or SVG
  function downloadModalQr(format = "png") {
    if (!qrModalCard) return;
    const svgEl = document.getElementById("modal-qr-svg");
    if (!svgEl) return;

    const cardId = qrModalCard.cardId || "stand-qr";
    const source = new XMLSerializer().serializeToString(svgEl);

    if (format === "svg") {
      const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cardId}.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast(`Downloaded ${cardId}.svg`);
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
        a.download = `${cardId}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(pngUrl), 1000);
        showToast(`Downloaded ${cardId}.png (1024x1024)`);
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
            className={`admin-tab-btn ${activeTab === "bulk" ? "active" : ""}`}
            onClick={() => setActiveTab("bulk")}
          >
            <Layers size={15} />
            <span>Bulk Generator & Export</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "directory" ? "active" : ""}`}
            onClick={() => setActiveTab("directory")}
          >
            <QrCode size={15} />
            <span>Live Stands Directory ({stats.total || cards.length})</span>
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
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "0 12px" }}
          >
            <LogOut size={14} />
            <span style={{ fontSize: "12px", fontWeight: "600" }}>Lock / Logout</span>
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

            {/* Quick Action Banner */}
            <div className="admin-banner-grid">
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
                  placeholder="Search by Card ID, Stand Title, or Destination URL..."
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
                      <th>Card ID</th>
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

                      return (
                        <tr key={card.cardId}>
                          {/* Card ID */}
                          <td>
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
                            {card.cardNumber && (
                              <span className="card-sub-num">#{card.cardNumber}</span>
                            )}
                          </td>

                          {/* Title */}
                          <td>
                            <strong className="cell-title-text">{card.title || "NFC Stand"}</strong>
                            {card.batchId && (
                              <div className="batch-tag-sm">{card.batchId}</div>
                            )}
                          </td>

                          {/* Destination */}
                          <td>
                            {isUnassigned ? (
                              <span className="unassigned-badge">
                                Pending Customer Activation
                              </span>
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

                          {/* Scans */}
                          <td>
                            <span className="scan-count-badge">
                              {card.scanCount || 0}
                            </span>
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
              <div className="qr-preview-card">
                <QRCodeSVG
                  id="modal-qr-svg"
                  value={qrModalCard.qrUrl || `${window.location.origin}/c/${qrModalCard.cardId}`}
                  size={240}
                  level="M"
                  marginSize={4}
                />
              </div>

              <div className="qr-modal-meta">
                <div className="meta-line">
                  <span>CARD IDENTIFIER</span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <strong>{qrModalCard.cardId}</strong>
                    <span className={`status-pill ${qrModalCard.status === "active" ? "pill-active" : "pill-inactive"}`}>
                      {qrModalCard.status === "active" ? "LIVE & REDIRECTING" : "PENDING SETUP"}
                    </span>
                  </div>
                </div>

                <div className="meta-line">
                  <span>PERMANENT SCAN LINK (PRINT & NFC URL)</span>
                  <div className="url-copy-box">
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

                {qrModalCard.destinationUrl && (
                  <div className="meta-line">
                    <span>CONNECTED DESTINATION (GOOGLE REVIEWS / MAPS)</span>
                    <a
                      href={qrModalCard.destinationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dest-url-link"
                      style={{ marginTop: "4px" }}
                    >
                      <span>{qrModalCard.destinationUrl}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer" style={{ flexWrap: "wrap" }}>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setQrModalCard(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => downloadModalQr("png")}
                title="Download 1024x1024 Print Ready PNG"
              >
                <Download size={14} /> PNG (1024px)
              </button>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => downloadModalQr("svg")}
                title="Download Vector SVG"
              >
                <Download size={14} /> SVG
              </button>
              <a
                href={qrModalCard.qrUrl || `/c/${qrModalCard.cardId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn-primary"
              >
                <ExternalLink size={14} /> Test Redirection
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
                    Google Review / Destination URL <span className="req-star">*</span>
                  </label>
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="admin-input-styled"
                    placeholder="https://g.page/r/..."
                    required
                  />
                  <span className="field-hint">
                    This is where customers land when they tap the NFC card or scan the QR.
                  </span>
                </div>

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
