import { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
  FileArchive,
  Hash,
  X,
} from "lucide-react";
import { bulkGenerateCardsApi, getAllCardsApi } from "../utils/api";
import { downloadCsvManifest, downloadZipExport } from "../utils/bulkExport";

export default function BulkExportSection({ onBatchCreated, totalCardsCount = 0 }) {
  // Generator State
  const [generateCount, setGenerateCount] = useState(100);
  const [prefix, setPrefix] = useState("TF-");
  const [startNumber, setStartNumber] = useState("");
  const [initialStatus, setInitialStatus] = useState("inactive"); // 'inactive' for unassigned/unclaimed cards
  const [batchTag, setBatchTag] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateSuccess, setGenerateSuccess] = useState(null);
  const [generateError, setGenerateError] = useState("");

  // Export Filter State (Matching Screenshot 3)
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'active' | 'inactive'
  const [limit, setLimit] = useState("500"); // '100' | '250' | '500' | '1000' | 'all'

  // Export Loading & Progress State
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState(null); // { current, total, percentage, cardId }
  const [exportError, setExportError] = useState("");
  const [exportSuccessMsg, setExportSuccessMsg] = useState("");

  // Preview Count Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Quick preset count selection
  function handleCountPreset(num) {
    setGenerateCount(num);
  }

  // Handle Bulk Generation
  async function handleBulkGenerate(e) {
    e.preventDefault();
    setGenerateError("");
    setGenerateSuccess(null);

    const countNum = parseInt(generateCount, 10);
    if (isNaN(countNum) || countNum < 1) {
      setGenerateError("Please enter a valid number of cards to generate (e.g. 100 to 500).");
      return;
    }
    if (countNum > 2000) {
      setGenerateError("Maximum limit per batch is 2,000 cards.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await bulkGenerateCardsApi({
        count: countNum,
        prefix: prefix.trim(),
        startNumber: startNumber ? parseInt(startNumber, 10) : undefined,
        status: initialStatus,
        batchId: batchTag.trim() || undefined,
      });

      if (response && response.success) {
        setGenerateSuccess({
          count: response.count,
          batchId: response.batchId,
          startNumber: response.startNumber,
          endNumber: response.endNumber,
          sampleCards: response.data || [],
        });

        if (onBatchCreated) {
          onBatchCreated(response);
        }
      } else {
        throw new Error(response.message || "Bulk generation failed.");
      }
    } catch (err) {
      setGenerateError(err.message || "Failed to generate dynamic QRs.");
    } finally {
      setIsGenerating(false);
    }
  }

  // Fetch cards according to export filters
  async function fetchExportCards() {
    const limitNum = limit === "all" ? 5000 : parseInt(limit, 10);
    const res = await getAllCardsApi({
      status: filterStatus === "all" ? undefined : filterStatus,
      limit: limitNum,
    });

    if (!res || !res.success || !res.data) {
      throw new Error(res.message || "Failed to fetch cards for export.");
    }

    return res.data;
  }

  // Preview Count Button
  async function handlePreviewCount() {
    setPreviewLoading(true);
    setExportError("");
    setIsPreviewOpen(true);

    try {
      const cards = await fetchExportCards();
      const activeCount = cards.filter((c) => c.status === "active").length;
      const inactiveCount = cards.filter((c) => c.status === "inactive").length;

      setPreviewData({
        total: cards.length,
        activeCount,
        inactiveCount,
        firstId: cards[0]?.cardId || "None",
        lastId: cards[cards.length - 1]?.cardId || "None",
        cards: cards.slice(0, 10), // first 10 for sample
      });
    } catch (err) {
      setExportError(err.message || "Failed to load count preview.");
    } finally {
      setPreviewLoading(false);
    }
  }

  // Download CSV button
  async function handleDownloadCsv() {
    setIsExportingCsv(true);
    setExportError("");
    setExportSuccessMsg("");

    try {
      const cards = await fetchExportCards();
      if (cards.length === 0) {
        throw new Error("No cards found matching the selected filter criteria.");
      }

      const timestamp = new Date().toISOString().slice(0, 10);
      downloadCsvManifest(cards, `codes_${filterStatus}_limit${limit}_${timestamp}.csv`);
      setExportSuccessMsg(`Successfully downloaded CSV manifest with ${cards.length} cards.`);
      setTimeout(() => setExportSuccessMsg(""), 5000);
    } catch (err) {
      setExportError(err.message || "Failed to export CSV.");
    } finally {
      setIsExportingCsv(false);
    }
  }

  // Download ZIP (PNG + SVG + CSV) button
  async function handleDownloadZip(cardsToExport = null) {
    setIsExportingZip(true);
    setExportError("");
    setExportSuccessMsg("");
    setZipProgress({ current: 0, total: 0, percentage: 0 });

    try {
      const cards = cardsToExport || (await fetchExportCards());
      if (cards.length === 0) {
        throw new Error("No cards found to export into ZIP.");
      }

      const timestamp = new Date().toISOString().slice(0, 10);
      await downloadZipExport(cards, {
        filename: `tapform_bulk_qrs_${filterStatus}_${cards.length}_${timestamp}.zip`,
        onProgress: (p) => setZipProgress(p),
      });

      setExportSuccessMsg(`Successfully exported ZIP package with ${cards.length} print-ready PNGs, SVGs & CSV!`);
      setTimeout(() => setExportSuccessMsg(""), 6000);
    } catch (err) {
      setExportError(err.message || "Failed to build ZIP export.");
    } finally {
      setIsExportingZip(false);
      setZipProgress(null);
    }
  }

  return (
    <div className="admin-bulk-wrapper">
      {/* SECTION 1: BULK DYNAMIC QR GENERATOR (Client requested: "maine number dala 100-500 ke beech me wo create kr dega and sabko number bhi provide kr dega") */}
      <div className="admin-card-panel generator-panel">
        <div className="panel-header-row">
          <div>
            <div className="panel-badge-pill">
              <Sparkles size={13} />
              <span>DYNAMIC FACTORY GENERATOR</span>
            </div>
            <h2 className="panel-main-title">Bulk Dynamic QR Creator</h2>
            <p className="panel-sub-desc">
              Generate 100 to 500+ numbered dynamic NFC & QR stands in one click. Numbers and permanent URLs are assigned automatically.
            </p>
          </div>
          <div className="panel-counter-chip">
            <Hash size={14} />
            <span>Database Total: <strong>{totalCardsCount}</strong> Stands</span>
          </div>
        </div>

        <form onSubmit={handleBulkGenerate} className="bulk-gen-form">
          <div className="bulk-form-grid">
            {/* Quantity Input */}
            <div className="form-group-item">
              <label className="form-item-label">
                Number of QRs to Create <span className="req-star">*</span>
              </label>
              <div className="quantity-input-wrap">
                <input
                  type="number"
                  min="1"
                  max="2000"
                  value={generateCount}
                  onChange={(e) => setGenerateCount(e.target.value)}
                  className="admin-input-styled quantity-field"
                  placeholder="100"
                  required
                />
                <div className="quick-preset-pills">
                  {[50, 100, 250, 500].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={`preset-pill ${parseInt(generateCount, 10) === preset ? "active" : ""}`}
                      onClick={() => handleCountPreset(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
              <span className="field-hint">e.g. 100 to 500 cards for factory batch printing</span>
            </div>

            {/* Prefix */}
            <div className="form-group-item">
              <label className="form-item-label">Card ID Prefix</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="admin-input-styled"
                placeholder="TF-"
                maxLength="12"
              />
              <span className="field-hint">e.g. TF-, NFC-, STAND- (auto formats ID)</span>
            </div>

            {/* Starting Number */}
            <div className="form-group-item">
              <label className="form-item-label">Starting Sequence Number</label>
              <input
                type="number"
                value={startNumber}
                onChange={(e) => setStartNumber(e.target.value)}
                className="admin-input-styled"
                placeholder="Auto (next available in DB)"
              />
              <span className="field-hint">Leave blank to auto-detect highest card number</span>
            </div>

            {/* Initial Status */}
            <div className="form-group-item">
              <label className="form-item-label">Initial Card Status</label>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value)}
                className="admin-select-styled"
              >
                <option value="inactive">Inactive (Ready for Customer Activation)</option>
                <option value="active">Active (Immediate Redirection)</option>
              </select>
              <span className="field-hint">
                Inactive cards show setup landing page when scanned until activated
              </span>
            </div>

            {/* Batch Identifier Tag */}
            <div className="form-group-item">
              <label className="form-item-label">Batch Tag / Identifier (Optional)</label>
              <input
                type="text"
                value={batchTag}
                onChange={(e) => setBatchTag(e.target.value)}
                className="admin-input-styled"
                placeholder="e.g. BATCH-APR-RESTAURANT"
                maxLength="32"
              />
              <span className="field-hint">Optional tag to label and group this print run</span>
            </div>
          </div>

          {generateError && (
            <div className="admin-alert-banner alert-danger">
              <AlertCircle size={16} />
              <span>{generateError}</span>
            </div>
          )}

          <div className="generator-actions-row">
            <button
              type="submit"
              className="admin-btn-primary"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="spin-icon" /> Creating {generateCount} Dynamic QRs in DB...
                </>
              ) : (
                <>
                  <Layers size={16} /> Generate {generateCount} Dynamic QRs
                </>
              )}
            </button>
          </div>
        </form>

        {/* Generated Success Card with Quick Export */}
        {generateSuccess && (
          <div className="batch-success-box">
            <div className="batch-success-header">
              <div className="success-icon-badge">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4>Successfully Generated {generateSuccess.count} Dynamic QRs!</h4>
                <p>
                  Batch ID: <code>{generateSuccess.batchId}</code> | Sequence: #{generateSuccess.startNumber} to #{generateSuccess.endNumber}
                </p>
              </div>
            </div>

            <div className="batch-quick-downloads">
              <button
                type="button"
                className="btn-download-zip"
                onClick={() => handleDownloadZip(generateSuccess.sampleCards)}
                disabled={isExportingZip}
              >
                {isExportingZip ? (
                  <>
                    <Loader2 size={15} className="spin-icon" /> Packaging ZIP...
                  </>
                ) : (
                  <>
                    <FileArchive size={15} /> Download ZIP for This Batch ({generateSuccess.count})
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn-download-csv"
                onClick={() => downloadCsvManifest(generateSuccess.sampleCards, `batch_${generateSuccess.batchId}.csv`)}
              >
                <FileSpreadsheet size={15} /> Download CSV ({generateSuccess.count})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: BULK EXPORT (MATCHING CLIENT SCREENSHOT 3 EXACTLY) */}
      <div className="admin-card-panel export-panel-screenshot-match">
        <div className="export-header-block">
          <h2 className="export-main-title">Bulk export</h2>
          <p className="export-subtitle-desc">
            Export QR codes and a CSV manifest for printing. Filenames are based on the QR ID.
          </p>
        </div>

        {/* Screenshot 3 Filter & Buttons Box */}
        <div className="bulk-export-card-box">
          <div className="filter-controls-row">
            {/* Filter by status */}
            <div className="filter-select-group">
              <label className="filter-label">Filter by status</label>
              <div className="select-wrapper">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bolt-style-select"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Limit */}
            <div className="filter-select-group">
              <label className="filter-label">Limit</label>
              <div className="select-wrapper">
                <select
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="bolt-style-select"
                >
                  <option value="100">100</option>
                  <option value="250">250</option>
                  <option value="500">500</option>
                  <option value="1000">1000</option>
                  <option value="all">All</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="export-actions-row">
            <button
              type="button"
              className="bolt-btn-secondary"
              onClick={handlePreviewCount}
              disabled={previewLoading || isExportingZip || isExportingCsv}
            >
              {previewLoading ? (
                <>
                  <Loader2 size={14} className="spin-icon" /> Checking...
                </>
              ) : (
                "Preview count"
              )}
            </button>

            <button
              type="button"
              className="bolt-btn-secondary"
              onClick={handleDownloadCsv}
              disabled={isExportingCsv || isExportingZip}
            >
              {isExportingCsv ? (
                <>
                  <Loader2 size={14} className="spin-icon" /> Downloading...
                </>
              ) : (
                <>
                  <FileSpreadsheet size={15} /> Download CSV
                </>
              )}
            </button>

            <button
              type="button"
              className="bolt-btn-dark"
              onClick={() => handleDownloadZip()}
              disabled={isExportingZip || isExportingCsv}
            >
              {isExportingZip ? (
                <>
                  <Loader2 size={15} className="spin-icon" />
                  {zipProgress
                    ? zipProgress.stage === "compressing"
                      ? `Compressing ZIP (${zipProgress.percentage}%)...`
                      : `Generating ${zipProgress.current}/${zipProgress.total} (${zipProgress.percentage}%)...`
                    : "Preparing ZIP..."}
                </>
              ) : (
                <>
                  <Download size={15} /> Download ZIP (PNG + SVG + CSV)
                </>
              )}
            </button>
          </div>

          {/* Progress / Status feedback */}
          {zipProgress && (
            <div className="zip-progress-bar-wrap">
              <div className="progress-label-row">
                <span>Rendering High-Res PNGs & Vector SVGs</span>
                <span>{zipProgress.percentage}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${zipProgress.percentage}%` }}
                />
              </div>
              {zipProgress.cardId && (
                <div className="progress-subtext">Rendering {zipProgress.cardId}...</div>
              )}
            </div>
          )}

          {exportError && (
            <div className="admin-alert-banner alert-danger mt-12">
              <AlertCircle size={15} />
              <span>{exportError}</span>
            </div>
          )}

          {exportSuccessMsg && (
            <div className="admin-alert-banner alert-success mt-12">
              <CheckCircle2 size={15} />
              <span>{exportSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* Print Readiness Checklist (Exact copy from Screenshot 3) */}
        <div className="print-readiness-checklist-box">
          <h3 className="checklist-heading">Print readiness checklist</h3>
          <ul className="checklist-items">
            <li>PNG images are 1024×1024 px with a 4-module quiet zone — suitable for printing.</li>
            <li>SVG files are vector and scale to any size without quality loss.</li>
            <li>No logos or decorations are embedded inside the QR code.</li>
            <li>Filenames match the QR ID exactly (e.g. A3f9Kp2xQ7.png).</li>
            <li>The included codes.csv lists every QR ID, permanent URL, and status.</li>
          </ul>

          <div className="checklist-badge-note">
            <span className="badge-active-pill">Active</span>
            <span>Only active codes redirect. Inactive/disabled codes show a status page when scanned.</span>
          </div>
        </div>
      </div>

      {/* PREVIEW COUNT MODAL */}
      {isPreviewOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsPreviewOpen(false)}>
          <div className="admin-modal-container preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Eye size={18} />
                <h3>Export Count & Scope Preview</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsPreviewOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {previewLoading ? (
                <div className="modal-loading-state">
                  <Loader2 size={32} className="spin-icon" />
                  <p>Calculating export scope from database...</p>
                </div>
              ) : previewData ? (
                <>
                  <div className="preview-metrics-grid">
                    <div className="metric-box">
                      <span className="metric-lbl">Total Matching</span>
                      <strong className="metric-val">{previewData.total}</strong>
                      <small>Cards to export</small>
                    </div>
                    <div className="metric-box">
                      <span className="metric-lbl">Active Codes</span>
                      <strong className="metric-val green">{previewData.activeCount}</strong>
                      <small>Live redirects</small>
                    </div>
                    <div className="metric-box">
                      <span className="metric-lbl">Inactive Codes</span>
                      <strong className="metric-val orange">{previewData.inactiveCount}</strong>
                      <small>Setup landing page</small>
                    </div>
                  </div>

                  <div className="preview-range-row">
                    <span><strong>First ID:</strong> <code>{previewData.firstId}</code></span>
                    <span><strong>Last ID:</strong> <code>{previewData.lastId}</code></span>
                    <span><strong>Filter:</strong> {filterStatus.toUpperCase()}</span>
                    <span><strong>Limit Applied:</strong> {limit}</span>
                  </div>

                  <div className="preview-sample-table-wrap">
                    <h4>Sample Codes ({previewData.cards.length} preview)</h4>
                    <table className="sample-table">
                      <thead>
                        <tr>
                          <th>QR ID</th>
                          <th>Status</th>
                          <th>Permanent URL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.cards.map((c) => (
                          <tr key={c.cardId}>
                            <td><code>{c.cardId}</code></td>
                            <td>
                              <span className={`status-pill ${c.status === "active" ? "pill-active" : "pill-inactive"}`}>
                                {c.status}
                              </span>
                            </td>
                            <td>
                              <span className="url-truncate">{c.qrUrl || `/c/${c.cardId}`}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p>No preview data available.</p>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setIsPreviewOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                onClick={() => {
                  setIsPreviewOpen(false);
                  handleDownloadZip();
                }}
              >
                <Download size={15} /> Proceed to Download ZIP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
