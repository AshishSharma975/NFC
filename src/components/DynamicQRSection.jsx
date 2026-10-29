import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
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
  Store,
  Calendar,
  Globe,
  Radio,
  SlidersHorizontal,
} from "lucide-react";
import { getAllCardsApi, updateCardApi, activateCardApi, deleteCardApi } from "../utils/api";

export default function DynamicQRSection() {
  const [cards, setCards] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalScans: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive'

  // Clipboard copy state { [key: string]: boolean }
  const [copiedMap, setCopiedMap] = useState({});

  // Active modal for Editing Card
  const [editingCard, setEditingCard] = useState(null);
  const [editDestinationUrl, setEditDestinationUrl] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Modal for Viewing/Downloading Stand QR
  const [qrModalCard, setQrModalCard] = useState(null);

  // Modal for Quick Registering a new Dynamic QR Stand
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCardId, setNewCardId] = useState("");
  const [newDestinationUrl, setNewDestinationUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [addingCard, setAddingCard] = useState(false);
  const [addError, setAddError] = useState("");

  // Action status banner
  const [toastMessage, setToastMessage] = useState("");

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  }

  const fetchCards = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const response = await getAllCardsApi({
        status: statusFilter,
        search: search.trim(),
      });

      if (response && response.success) {
        setCards(response.data || []);
        if (response.stats) {
          setStats(response.stats);
        }
      } else {
        throw new Error(response.message || "Failed to load dynamic QRs.");
      }
    } catch (err) {
      setError(err.message || "Unable to reach server. Please ensure backend is running.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Copy to clipboard helper
  async function copyToClipboard(text, key) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMap((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedMap((prev) => ({ ...prev, [key]: false }));
      }, 2000);
      showToast("Copied to clipboard!");
    } catch {
      showToast("Unable to copy to clipboard.");
    }
  }

  // Toggle active/inactive status quickly
  async function handleToggleStatus(card) {
    const nextStatus = card.status === "active" ? "inactive" : "active";
    try {
      await updateCardApi(card.cardId, { status: nextStatus });
      showToast(`Card ${card.cardId} is now ${nextStatus.toUpperCase()}`);
      fetchCards(true);
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  }

  // Open Edit Modal
  function handleOpenEdit(card) {
    setEditingCard(card);
    setEditDestinationUrl(card.destinationUrl || "");
    setEditTitle(card.title || "");
    setEditStatus(card.status || "active");
    setEditError("");
  }

  // Save Card Edits
  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editDestinationUrl.trim()) {
      setEditError("Destination URL cannot be empty.");
      return;
    }

    try {
      const url = new URL(editDestinationUrl.trim());
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      setEditError("Enter a valid URL starting with http:// or https://");
      return;
    }

    setSavingEdit(true);
    setEditError("");

    try {
      await updateCardApi(editingCard.cardId, {
        destinationUrl: editDestinationUrl.trim(),
        title: editTitle.trim(),
        status: editStatus,
      });

      showToast(`Successfully updated destination for ${editingCard.cardId}!`);
      setEditingCard(null);
      fetchCards(true);
    } catch (err) {
      setEditError(err.message || "Failed to update card destination.");
    } finally {
      setSavingEdit(false);
    }
  }

  // Add new Card
  async function handleCreateCard(e) {
    e.preventDefault();
    if (!newCardId.trim()) {
      setAddError("Card ID is required (e.g. TD-SHOP-02).");
      return;
    }
    if (!newDestinationUrl.trim()) {
      setAddError("Destination URL (Google review/maps link) is required.");
      return;
    }

    try {
      const url = new URL(newDestinationUrl.trim());
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      setAddError("Enter a valid URL starting with https://");
      return;
    }

    setAddingCard(true);
    setAddError("");

    try {
      await activateCardApi({
        cardId: newCardId.trim(),
        destinationUrl: newDestinationUrl.trim(),
        title: newTitle.trim(),
      });

      showToast(`Dynamic QR ${newCardId.toUpperCase()} registered successfully!`);
      setShowAddModal(false);
      setNewCardId("");
      setNewDestinationUrl("");
      setNewTitle("");
      fetchCards(true);
    } catch (err) {
      setAddError(err.message || "Failed to register card.");
    } finally {
      setAddingCard(false);
    }
  }

  // Delete Card
  async function handleDeleteCard(cardId) {
    if (!window.confirm(`Are you sure you want to delete card '${cardId}'? Customers scanning this QR will see 'Card Not Activated'.`)) {
      return;
    }

    try {
      await deleteCardApi(cardId);
      showToast(`Card ${cardId} deleted.`);
      fetchCards(true);
    } catch (err) {
      alert("Failed to delete card: " + err.message);
    }
  }

  // Download Stand QR PNG
  function handleDownloadModalQR(format = "png") {
    const svg = document.getElementById("stand-modal-qr");
    if (!svg) return;

    const source = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const objectUrl = URL.createObjectURL(svgBlob);

    if (format === "svg") {
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `${qrModalCard.cardId}-dynamic-qr.svg`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      return;
    }

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(objectUrl);
        const anchor = document.createElement("a");
        anchor.href = URL.createObjectURL(blob);
        anchor.download = `${qrModalCard.cardId}-dynamic-qr.png`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      }, "image/png");
    };
    image.src = objectUrl;
  }

  return (
    <section className="dashboard-section" id="dashboard">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="dashboard-toast">
          <Sparkles size={16} /> {toastMessage}
        </div>
      )}

      {/* Header & Title */}
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            LIVE CARD MONITORING & ANALYTICS
          </div>
          <h2 className="dashboard-title">Dynamic QR Stands & Connected Links</h2>
          <p className="dashboard-subtitle">
            Track all your dynamic QR stands in real time — monitor total and active stands,
            manage linked Google Reviews and Google Maps URLs, and update destinations instantly
            from one dashboard.
          </p>
        </div>

        <div className="dashboard-top-actions">
          <button
            className="button button-outline refresh-btn"
            onClick={() => fetchCards(true)}
            disabled={refreshing}
            title="Refresh list from database"
          >
            <RefreshCw size={15} className={refreshing ? "spin-icon" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            className="button button-dark add-card-btn"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} /> Register New Stand
          </button>
        </div>
      </div>

      {/* Metric Cards (Addressing: kitna dynamic QR hai, kitne active hai, kitne non-active hai) */}
      <div className="metrics-grid">
        {/* Total Dynamic QRs */}
        <div className="metric-card metric-total">
          <div className="metric-header">
            <div className="metric-icon-wrap icon-blue">
              <QrCode size={22} />
            </div>
            <span className="metric-tag tag-total">TOTAL DYNAMIC QRs</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-number">{stats.total}</span>
            <span className="metric-unit">Stands</span>
          </div>
          <p className="metric-desc">Total permanent dynamic QR stands registered in database</p>
        </div>

        {/* Active QRs */}
        <div className="metric-card metric-active">
          <div className="metric-header">
            <div className="metric-icon-wrap icon-green">
              <CheckCircle2 size={22} />
            </div>
            <div className="metric-status-live">
              <span className="live-pulse" />
              <span className="metric-tag tag-active">ACTIVE & LIVE</span>
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-number text-green">{stats.active}</span>
            <span className="metric-unit">
              {stats.total > 0 ? `(${Math.round((stats.active / stats.total) * 100)}%)` : "0%"}
            </span>
          </div>
          <p className="metric-desc">Currently working & actively redirecting customers to Google</p>
        </div>

        {/* Inactive QRs */}
        <div className="metric-card metric-inactive">
          <div className="metric-header">
            <div className="metric-icon-wrap icon-amber">
              <AlertCircle size={22} />
            </div>
            <span className="metric-tag tag-inactive">NON-ACTIVE / PAUSED</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-number text-amber">{stats.inactive}</span>
            <span className="metric-unit">Disabled</span>
          </div>
          <p className="metric-desc">Temporarily disabled stands (redirects to 'Card Disabled')</p>
        </div>

        {/* Total Scans Logged */}
        <div className="metric-card metric-scans">
          <div className="metric-header">
            <div className="metric-icon-wrap icon-purple">
              <BarChart3 size={22} />
            </div>
            <span className="metric-tag tag-scans">ENGAGEMENT</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-number text-purple">{stats.totalScans}</span>
            <span className="metric-unit">Scans / Taps</span>
          </div>
          <p className="metric-desc">Total customer scans captured across all stands</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="dashboard-filter-bar">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All Stands <span className="tab-count">{stats.total}</span>
          </button>
          <button
            className={`filter-tab ${statusFilter === "active" ? "active" : ""}`}
            onClick={() => setStatusFilter("active")}
          >
            <span className="filter-dot dot-green" /> Active Only <span className="tab-count">{stats.active}</span>
          </button>
          <button
            className={`filter-tab ${statusFilter === "inactive" ? "active" : ""}`}
            onClick={() => setStatusFilter("inactive")}
          >
            <span className="filter-dot dot-amber" /> Non-Active <span className="tab-count">{stats.inactive}</span>
          </button>
        </div>

        <div className="filter-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="filter-search-input"
            placeholder="Search by Card ID (e.g. TD-SHOP-01) or URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch("")}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="dashboard-alert error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button className="button button-outline" onClick={() => fetchCards(true)}>
            Try Again
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !refreshing && (
        <div className="dashboard-loading">
          <Loader2 size={32} className="spin-icon" />
          <p>Loading Dynamic QR stands from MongoDB...</p>
        </div>
      )}

      {/* Stand Cards Grid / Table (Addressing: jo Active user hai wo kon se link se connected hai) */}
      {!loading && cards.length === 0 && (
        <div className="dashboard-empty">
          <div className="empty-icon-wrap">
            <QrCode size={36} />
          </div>
          <h3>No Dynamic QR stands found</h3>
          <p>
            {search || statusFilter !== "all"
              ? "No stands match your current filter or search criteria."
              : "Abhi koi card create nahi hua hai. Pehla dynamic QR stand register karein!"}
          </p>
          <button
            className="button button-dark"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setShowAddModal(true);
            }}
          >
            <Plus size={16} /> Register First Stand
          </button>
        </div>
      )}

      {!loading && cards.length > 0 && (
        <div className="stands-grid">
          {cards.map((card) => {
            const isActive = card.status === "active";
            const isCopied = copiedMap[`url_${card.cardId}`];
            const isQrCopied = copiedMap[`qr_${card.cardId}`];

            return (
              <div
                key={card.cardId}
                className={`stand-card ${isActive ? "stand-active" : "stand-inactive"}`}
              >
                {/* Stand Card Top Header */}
                <div className="stand-card-top">
                  <div className="stand-id-badge">
                    <span className="stand-id-prefix">STAND ID:</span>
                    <strong className="stand-id-code">{card.cardId}</strong>
                  </div>

                  <div className="stand-status-actions">
                    <span className={`status-pill ${isActive ? "pill-active" : "pill-inactive"}`}>
                      <span className={`status-dot ${isActive ? "dot-pulsing" : ""}`} />
                      {isActive ? "ACTIVE (LIVE)" : "NON-ACTIVE (PAUSED)"}
                    </span>

                    <button
                      className={`status-toggle-btn ${isActive ? "btn-pause" : "btn-activate"}`}
                      onClick={() => handleToggleStatus(card)}
                      title={isActive ? "Pause / Disable Stand" : "Activate Stand"}
                    >
                      <Power size={13} />
                      {isActive ? "Pause" : "Activate"}
                    </button>
                  </div>
                </div>

                {/* Stand Title if available */}
                {card.title && (
                  <div className="stand-title-row">
                    <Store size={15} className="stand-title-icon" />
                    <span className="stand-title-text">{card.title}</span>
                  </div>
                )}

                {/* HIGHLIGHTED SECTION: Connected Destination Link (Google Review / Maps) */}
                <div className="connected-link-box">
                  <div className="connected-link-header">
                    <span className="connected-label">
                      <Globe size={13} /> CONNECTED DESTINATION LINK:
                    </span>
                    <span className={`link-status-badge ${isActive ? "link-live" : "link-paused"}`}>
                      {isActive ? "🟢 Live Connected" : "⚪ Stand Disabled"}
                    </span>
                  </div>

                  <div className="connected-link-display">
                    <a
                      href={card.destinationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="connected-url-text"
                      title={card.destinationUrl}
                    >
                      {card.destinationUrl}
                    </a>
                  </div>

                  <div className="connected-link-actions">
                    <a
                      href={card.destinationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-btn"
                    >
                      <ExternalLink size={13} /> Open Target
                    </a>

                    <button
                      className="link-btn"
                      onClick={() => copyToClipboard(card.destinationUrl, `url_${card.cardId}`)}
                    >
                      {isCopied ? <Check size={13} className="text-green" /> : <Copy size={13} />}
                      {isCopied ? "Copied" : "Copy Link"}
                    </button>

                    <button
                      className="link-btn link-btn-highlight"
                      onClick={() => handleOpenEdit(card)}
                    >
                      <Edit3 size={13} /> Edit Link
                    </button>

                    <button
                      className="link-btn link-btn-danger"
                      onClick={() => handleDeleteCard(card.cardId)}
                      title="Delete Card"
                      style={{ color: "#ef4444" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Bottom Row: QR Code Thumbnail, Permanent Scan Redirect Path, and Stats */}
                <div className="stand-card-bottom">
                  {/* QR Preview Thumbnail */}
                  <div
                    className="qr-thumbnail-wrap"
                    onClick={() => setQrModalCard(card)}
                    title="Click to enlarge & download QR"
                  >
                    <QRCodeSVG
                      value={card.qrUrl || `${window.location.origin}/c/${card.cardId}`}
                      size={54}
                      level="M"
                    />
                    <span className="qr-thumbnail-hint">
                      <Eye size={11} /> Enlarge
                    </span>
                  </div>

                  {/* Stand Scan & Redirect Info */}
                  <div className="stand-redirect-info">
                    <div className="redirect-label">Permanent Scan / Tap Route:</div>
                    <code className="redirect-code">/c/{card.cardId}</code>

                    <div className="redirect-actions">
                      <a
                        href={card.qrUrl || `/c/${card.cardId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="test-scan-btn"
                        title="Simulate customer tap or scan"
                      >
                        <Radio size={12} /> Test Scan &rarr;
                      </a>

                      <button
                        className="copy-route-btn"
                        onClick={() =>
                          copyToClipboard(
                            card.qrUrl || `${window.location.origin}/c/${card.cardId}`,
                            `qr_${card.cardId}`
                          )
                        }
                      >
                        {isQrCopied ? <Check size={12} /> : <Copy size={12} />}
                        {isQrCopied ? "Copied" : "Copy QR URL"}
                      </button>
                    </div>
                  </div>

                  {/* Scan Counter & Timestamps */}
                  <div className="stand-stats-col">
                    <div className="stand-scans-badge">
                      <BarChart3 size={13} />
                      <strong>{card.scanCount || 0}</strong>
                      <span>Scans</span>
                    </div>

                    <div className="stand-timestamp">
                      <Calendar size={11} />
                      <span>
                        {card.lastScannedAt
                          ? `Last: ${new Date(card.lastScannedAt).toLocaleDateString()}`
                          : "Never scanned yet"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Edit Destination Link */}
      {editingCard && (
        <div className="modal-backdrop" onClick={() => setEditingCard(null)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">UPDATE LINK</span>
                <h3>Edit Connected Link for {editingCard.cardId}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setEditingCard(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-url">
                  Google Review / Maps Destination URL <span className="required">*</span>
                </label>
                <input
                  id="edit-url"
                  type="url"
                  className="form-input"
                  value={editDestinationUrl}
                  onChange={(e) => setEditDestinationUrl(e.target.value)}
                  placeholder="https://g.page/r/... or https://maps.google.com/..."
                  required
                />
                <p className="input-help">
                  Stand par tap ya scan karne par customer seedha is URL par redirect hoga.
                  Physical stand ka QR badalna nahi padega!
                </p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-title">
                  Shop Name / Stand Title (Optional)
                </label>
                <input
                  id="edit-title"
                  type="text"
                  className="form-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Bilaspur Store Counter Stand"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stand Status</label>
                <div className="status-selector">
                  <label className={`status-option ${editStatus === "active" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={editStatus === "active"}
                      onChange={() => setEditStatus("active")}
                    />
                    <span>🟢 Active (Live)</span>
                  </label>
                  <label className={`status-option ${editStatus === "inactive" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={editStatus === "inactive"}
                      onChange={() => setEditStatus("inactive")}
                    />
                    <span>⚪ Non-Active (Paused)</span>
                  </label>
                </div>
              </div>

              {editError && <div className="form-error">{editError}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setEditingCard(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-dark"
                  disabled={savingEdit}
                >
                  {savingEdit ? (
                    <>
                      <Loader2 size={15} className="spin-icon" /> Saving...
                    </>
                  ) : (
                    "Save & Update Stand"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: View / Download Full QR Code */}
      {qrModalCard && (
        <div className="modal-backdrop" onClick={() => setQrModalCard(null)}>
          <div className="modal-window qr-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">STAND QR CODE</span>
                <h3>Dynamic QR for {qrModalCard.cardId}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setQrModalCard(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="qr-modal-body">
              <div className="qr-display-box">
                <QRCodeSVG
                  id="stand-modal-qr"
                  value={qrModalCard.qrUrl || `${window.location.origin}/c/${qrModalCard.cardId}`}
                  size={240}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="qr-modal-details">
                <div className="qr-detail-item">
                  <span className="detail-label">STAND ID:</span>
                  <strong className="detail-value">{qrModalCard.cardId}</strong>
                </div>
                <div className="qr-detail-item">
                  <span className="detail-label">REDIRECT ROUTE:</span>
                  <code className="detail-code">/c/{qrModalCard.cardId}</code>
                </div>
                <div className="qr-detail-item">
                  <span className="detail-label">CONNECTED TARGET:</span>
                  <span className="detail-link" title={qrModalCard.destinationUrl}>
                    {qrModalCard.destinationUrl}
                  </span>
                </div>
              </div>

              <div className="qr-download-buttons">
                <button
                  className="button button-dark"
                  onClick={() => handleDownloadModalQR("png")}
                >
                  <Download size={15} /> Download PNG
                </button>
                <button
                  className="button button-outline"
                  onClick={() => handleDownloadModalQR("svg")}
                >
                  <Download size={15} /> Download SVG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Quick Register New Stand */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">NEW STAND SETUP</span>
                <h3>Register New Dynamic QR Stand</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCard} className="modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="new-card-id">
                  Card Stand ID <span className="required">*</span>
                </label>
                <input
                  id="new-card-id"
                  type="text"
                  className="form-input"
                  placeholder="e.g. TD-SHOP-02 or BILASPUR-01"
                  value={newCardId}
                  onChange={(e) => setNewCardId(e.target.value)}
                  required
                />
                <p className="input-help">Unique stand identifier printed on card or stand.</p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-dest-url">
                  Google Review / Maps URL <span className="required">*</span>
                </label>
                <input
                  id="new-dest-url"
                  type="url"
                  className="form-input"
                  placeholder="https://g.page/r/... or https://maps.google.com/..."
                  value={newDestinationUrl}
                  onChange={(e) => setNewDestinationUrl(e.target.value)}
                  required
                />
                <p className="input-help">Paste the shop's Google review or Google Maps link.</p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-card-title">
                  Shop Name / Business Title (Optional)
                </label>
                <input
                  id="new-card-title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sharma Kirana Store Bilaspur"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              {addError && <div className="form-error">{addError}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-dark"
                  disabled={addingCard}
                >
                  {addingCard ? (
                    <>
                      <Loader2 size={15} className="spin-icon" /> Creating Stand...
                    </>
                  ) : (
                    "Create Dynamic QR Stand"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
