// --- TAB CHẤM CÔNG SC (TRỰC TIẾP TRÊN TRÌNH DUYỆT WEB APP / MOBILE RESPONSIVE UI) ---

const SA_CONFIG = {
    client_email: "bot-sheet@confident-slice-495215-s4.iam.gserviceaccount.com",
    private_key: (function() {
        const b64 = "LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2UUlCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktjd2dnU2pBZ0VBQW9JQkFRRFE2YUI1RkJhaS9hTlgKOVFzNVliSU82UlNadGgvbzZhQ0F6bitNTitSVGlDYU01bXR4L2QrdnA4SHRhMzBZT2lCOE5tZVIxQVBsQ085MApoQUVVdlNlV1JsdHF4Tkl6aG85UVpZSktDT2VkcitrZXpZTWl3TWd1ZmZ3YkZzM1YxQk9VSU9OMzNDNHBldUtPClZxRG5Wb2EwM1F3c2lLbEI2Y3NMTHZjYmJtNncxVC9JOVV4SElOQzV4OEFGSjdBakVNUEtWNHNNWGNDWTEwUVMKUEVNSHNNNUc4d0w3bHE2S1RQanJuNy84TkFRbVcyYVJvMHdDS0VWRW9sOTlTYTZRMThoU2hQcVdyV01sb0hWcwpRVDUwRk9UUS9oN1ZHRHFoRkhwOXcxWWVzL0U1T1YwSGZCSEIyZFlxQkU1S1dBU0JLazQxbE5qeDJnUzN1UWdBCjdwM0Y3UUpwQWdNQkFBRUNnZ0VBR1VvTXYxZHhrWSs1WGlDSFdDNEZ3VlVSQmJYMHFTdmQzblhRM2hzV2VFK3AKRmdHZkpGU09oMHVjRjhiZEpPbUZiTy9qaS9WQnR2QWsxNEtTeEcxTTdWMnRPNUNobnZQbEpaN3lIWTcwSmNRcAppTTFwT0ZQa3I2OFh6WG91VnRvR09EWmVmdEFRSlB5UGtCbzN2bVZjcDJpQ1RLSks5ZlFNbkprVjkvTy9jY2VZCnNoVDBrR0RoYklGNkxBclBOdnEya25Fd2I1OEJnRDdrNTBGNmJjSGVEdW1vcDZ3Y08xVWhBMzdPQnN0S3JUdlkKZXhSZEh4Q253Y3NiQXh0ZHlIR0toeXhLZWlBMHBPMkV2SExrM1hobDRvQVhNblJmZ0k5L0hOWVQ1WGp6eVNPNQorNlUrWEFSb1lGclBoV3A0aXQ2Z2tQZ203MnlJRzUybi9EaXdwSGI2RVFLQmdRRHpTeFhMRmkvVVMzM25aYmloCmJtV1lmdlhxeVA0QUJKeDJJTS9BVCs2YnZzRWRoTVBzbkZLZzNEV045TTJmRzA1c2ZyYUUrRW1yclRtVnQzMzIKTWo3MTArcHgwYWdYajFUSmpBRkwyQ1Zhdi9DbVlqdkZaV0g5bHEvK3cwZ1VMdWp2TG1CZlN1eWdodkIxUmROYgpaeVR2YnlzTXdVWkg3U1JQTUVtWHlMUDhXUUtCZ1FEYjB0d3FCczNnUUhRemc5OTFFYWxRNkI5U1hVL1pFQmk5CmNOcFg2ZTVTb1YrbnYyRUlrMlpucEZwZTliNGtkTnJwdllPN2M4eUMwY2FibE1hQ0lMeERKbC9weXRQREdSNnkKRVk5dmhaR3FpbEcvc2xQVllFSDdQSEhGc0x5WWRFT2ZYVk41Tmg1S0o4OFhVVGFUV1g4RmVlemZUWEJDMEpVZApMTHZqNDJFMGtRS0JnUURNZkNCdUdGRE5BMEpvT2VQcnN1a3JPaEtoYXB1cUVqWWJSMHEySGJpMEtLa1JrV1JICk84QnJPWXE5ckxNaWRvWDh4S2ZOclEzbWdHcjAva3Vkb08rd0dKUmxZOHovT0ZZUUxGOXVpdFlpcDA2eDJjRFoKRVhSQit1UWpvYWkwWmhVYjZ3UFBOQjhjY1M0cnN5dUpHSEUvMlZUNm5Idmd1bDJaUFVHdGxHQkt5UUtCZ0ZYRQpSWVpZTlVkRG5wTGk1dktrTzIySHc0QzlTNFFqVmFQRVBreUN4eXVTTHVJaU4xZkRPdmRCRnNscUZBL2hUL0JXCnN1a1dXenJIWWpnZHFmM25pOHlmVWxqRGZDL293eU15MnNYbVZWazJzb0thcno3WFdhY09oRTFma1pYaDl1aGMKMzA2eG9NdktFSERHalFhY3FvU1dkNmNBYmNhRDMwb014Qm84QXhjaEFvR0FBWW1BYndCQytiaWlKdFZiOERxRwpKMU1ZUlg5UVJkOHJlUERVZGY1N05ISEFIVGwwSG5IdjB4YUgxeTRJQlVraHBJZUwwQURId1NtNDFQSWVxUDFXClNiZkFiWTdkOHBvdksxTC9uRXViUkEyNGVUTHM5VnhNdlZ3WTE0eGQvR2hnM2JkeHJkSUkzMnZqbzE0RUdjNUIKZThERjVWL1ZRc2JZZXdZWGtZZnc4b1U9Ci0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0K";
        return (typeof atob === 'function') ? atob(b64.replace(/\s+/g, '')) : Buffer.from(b64, 'base64').toString('utf-8');
    })()
};
const SPREADSHEET_ID = '1mEuMm3Pntsn3HenWQ33aNlRG50W9daVM5HjrV9pmxY8';
const TARGET_SHEET = 'Chi tiết công MN (Tỉnh & HCM)';
const LOCAL_API_BASE = 'http://localhost:3001/api/chamcong';

// Danh sách mã và họ tên nhân sự Team HCM (còn lại thuộc Team Tỉnh)
const HCM_STAFF_CODES = ['8467', '8440', '8447', '8437', '8231', '8448', '8462'];
const HCM_STAFF_NAMES = [
    '8467 - Nguyễn Thành Đạt - Customer Success',
    '8440 - Doãn Việt Tùng - Customer Success - SGN',
    '8447 - Võ Khánh Duy - Customer Success - SGN',
    '8437 - Nguyễn Đoàn Hưng Phát - Customer Success - SGN',
    '8231 - Thượng Thái Hiếu - Customer Success - SGN',
    '8448 - Nguyễn Đỗ Nhật Minh - Customer Success',
    '8462 - Nguyễn Hoàng Khang - Customer Success'
];

function getStaffTeam(staffName, maNv) {
    const sName = String(staffName || '').trim();
    const sCode = String(maNv || '').trim().toUpperCase();
    const isHCM = HCM_STAFF_CODES.some(id => sName.startsWith(id) || sName.includes(id)) ||
                  HCM_STAFF_NAMES.some(h => sName.toLowerCase().includes(h.toLowerCase())) ||
                  sCode.startsWith('SG');
    return isHCM ? 'HCM' : 'TINH';
}

window.chamCongCurrentDay = (new Date()).getDate().toString();
window.chamCongData = [];
window.chamCongEditedRows = {};
window.chamCongViewMode = (window.innerWidth <= 768) ? 'card' : 'table';
window.chamCongConnectionMode = '';
let directTokenCache = { token: null, expiresAt: 0 };
let chamCongNoticeTimer = null;

// Ensure custom CSS is injected
(function injectChamCongStyles() {
    if (document.getElementById('chamCongCustomStyles')) return;
    const style = document.createElement('style');
    style.id = 'chamCongCustomStyles';
    style.innerHTML = `
        .cc-mobile-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
            gap: 14px;
            margin-top: 12px;
        }
        .cc-card {
            background: var(--card-bg, #ffffff);
            border: 1px solid var(--border-color, #e2e8f0);
            border-radius: 14px;
            padding: 14px 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            gap: 10px;
            position: relative;
        }
        html.dark-theme .cc-card {
            background: #1e293b;
            border-color: #334155;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        }
        .cc-card.edited {
            border-color: #10b981 !important;
            background: rgba(16, 185, 129, 0.06) !important;
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25) !important;
        }
        .cc-entry-input {
            border: 1px solid #cbd5e1;
            background: #ffffff;
            color: #1e293b;
            outline: none;
            transition: border-color .15s ease, box-shadow .15s ease, background .15s ease, color .15s ease;
        }
        .cc-entry-input:focus {
            border-color: #60a5fa;
            box-shadow: 0 0 0 3px rgba(59,130,246,.12);
        }
        .cc-entry-input::placeholder { color: #94a3b8; opacity: 1; }
        html.dark-theme .cc-entry-input {
            border-color: #475569;
            background: #0f172a;
            color: #f1f5f9;
        }
        html.dark-theme .cc-entry-input::placeholder { color: #64748b; }
        .cc-table-head-row { background: #f8fafc; }
        html.dark-theme .cc-table-head-row { background: #0f172a; }
        .cc-card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            border-bottom: 1px dashed var(--border-color, #e2e8f0);
            padding-bottom: 10px;
        }
        html.dark-theme .cc-card-header {
            border-bottom-color: #334155;
        }
        .cc-staff-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .cc-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #3b82f6, #6366f1);
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 13px;
            flex-shrink: 0;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
        }
        .cc-staff-name {
            font-weight: 700;
            font-size: 14px;
            color: inherit;
            line-height: 1.3;
        }
        .cc-staff-sub {
            font-size: 11.5px;
            color: #64748b;
        }
        .cc-badge-stt {
            background: rgba(99, 102, 241, 0.1);
            color: #6366f1;
            font-size: 11px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 12px;
        }
        .cc-stats-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
            background: rgba(241, 245, 249, 0.6);
            padding: 8px 10px;
            border-radius: 10px;
            font-size: 11.5px;
            text-align: center;
        }
        html.dark-theme .cc-stats-row {
            background: #0f172a;
        }
        .cc-stat-box {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .cc-stat-lbl {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
        }
        .cc-stat-val {
            font-weight: 700;
            color: inherit;
        }
        .cc-pills-container {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 5px;
        }
        @media (max-width: 480px) {
            .cc-pills-container {
                grid-template-columns: repeat(3, 1fr);
            }
        }
        .cc-pill-btn {
            padding: 7px 4px;
            font-size: 12px;
            font-weight: 700;
            border-radius: 8px;
            border: 1px solid var(--btn-color);
            background: transparent;
            color: var(--btn-color);
            cursor: pointer;
            transition: all 0.15s ease;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .cc-pill-btn.active {
            background: var(--btn-color);
            color: #ffffff !important;
            box-shadow: 0 3px 8px var(--shadow-color);
            transform: translateY(-1px);
        }
        .cc-sticky-bottom {
            position: fixed;
            bottom: 16px;
            left: 50%;
            transform: translateX(-50%);
            width: calc(100% - 32px);
            max-width: 500px;
            z-index: 999;
            box-shadow: 0 10px 25px rgba(0,0,0,0.25);
            border-radius: 14px;
        }
        .cc-page { margin-top: 16px; }
        .cc-shell { padding: 22px !important; border-radius: 18px !important; }
        .cc-page-header {
            display: flex; align-items: flex-start; justify-content: space-between;
            gap: 18px; padding-bottom: 18px; margin-bottom: 16px;
            border-bottom: 1px solid var(--border-color, #e2e8f0);
        }
        .cc-eyebrow {
            color: #3b82f6; font-size: 10.5px; font-weight: 800;
            letter-spacing: 1.3px; margin-bottom: 5px;
        }
        .cc-page-title {
            display: flex; align-items: center; gap: 8px;
            margin: 0 !important; font-size: 21px !important;
        }
        .cc-page-subtitle { color: #64748b; font-size: 12.5px; margin: 6px 0 0; }
        .cc-header-actions, .cc-bulk-actions, .cc-bulk-row {
            display: flex; align-items: center; gap: 9px; flex-wrap: wrap;
        }
        .cc-btn {
            display: inline-flex; align-items: center; justify-content: center; gap: 6px;
            min-height: 36px; padding: 8px 14px; border-radius: 9px;
            border: 1px solid transparent; font-size: 12.5px; font-weight: 750;
            cursor: pointer; white-space: nowrap;
            transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease, background .15s ease;
        }
        .cc-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .cc-btn:disabled { cursor: not-allowed; opacity: .55; box-shadow: none !important; }
        .cc-btn-primary { background: #10b981; color: #fff; box-shadow: 0 4px 12px rgba(16,185,129,.25); }
        .cc-btn-secondary { background: var(--card-bg, #fff); color: #475569; border-color: var(--border-color, #cbd5e1); }
        .cc-btn-ghost { color: #475569; background: transparent; border-color: var(--border-color, #cbd5e1); }
        .cc-btn-soft-blue { color: #1d4ed8; background: #eff6ff; border-color: #bfdbfe; }
        .cc-btn-soft-gray { color: #475569; background: #f8fafc; border-color: #cbd5e1; }
        .cc-btn-soft-red { color: #dc2626; background: #fff1f2; border-color: #fecdd3; }
        html.dark-theme .cc-btn-secondary,
        html.dark-theme .cc-btn-ghost,
        html.dark-theme .cc-btn-soft-gray { color: #cbd5e1; background: #1e293b; border-color: #475569; }
        html.dark-theme .cc-btn-soft-blue { color: #93c5fd; background: rgba(37,99,235,.16); border-color: rgba(96,165,250,.35); }
        html.dark-theme .cc-btn-soft-red { color: #fda4af; background: rgba(225,29,72,.12); border-color: rgba(251,113,133,.35); }
        .cc-summary-grid {
            display: grid; grid-template-columns: repeat(5, minmax(120px, 1fr));
            gap: 10px; margin-bottom: 16px;
        }
        .cc-summary-card {
            display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 1px 8px;
            padding: 12px 14px; border: 1px solid var(--border-color, #e2e8f0);
            border-radius: 12px; background: var(--card-bg, #fff);
        }
        .cc-summary-card span { color: #64748b; font-size: 11.5px; font-weight: 650; }
        .cc-summary-card strong { grid-row: span 2; font-size: 24px; line-height: 1; color: #1e293b; }
        .cc-summary-card small { color: #94a3b8; font-size: 10.5px; }
        .cc-summary-done { border-left: 3px solid #10b981; }
        .cc-summary-pending { border-left: 3px solid #f59e0b; }
        .cc-summary-edited { border-left: 3px solid #6366f1; }
        html.dark-theme .cc-page { color-scheme: dark; }
        html.dark-theme .cc-page-header { border-bottom-color: #334155; }
        html.dark-theme .cc-page-subtitle { color: #94a3b8; }
        html.dark-theme .cc-summary-card {
            background: #172235;
            border-color: #334155;
            box-shadow: 0 4px 14px rgba(2,6,23,.2);
        }
        html.dark-theme .cc-summary-card span { color: #cbd5e1; }
        html.dark-theme .cc-summary-card strong { color: #f8fafc; }
        html.dark-theme .cc-summary-card small { color: #94a3b8; }
        html.dark-theme .cc-summary-done { background: linear-gradient(135deg, rgba(16,185,129,.12), #172235 58%); }
        html.dark-theme .cc-summary-pending { background: linear-gradient(135deg, rgba(245,158,11,.11), #172235 58%); }
        html.dark-theme .cc-summary-edited { background: linear-gradient(135deg, rgba(99,102,241,.13), #172235 58%); }
        .cc-control-panel {
            display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(360px, .9fr);
            gap: 12px; margin-bottom: 12px;
        }
        .cc-control-section {
            padding: 14px; border: 1px solid var(--border-color, #e2e8f0);
            border-radius: 13px; background: rgba(59,130,246,.035);
        }
        html.dark-theme .cc-control-section {
            background: #111c2f;
            border-color: #334155;
        }
        .cc-control-heading {
            color: #475569; font-size: 11.5px; font-weight: 800;
            letter-spacing: .2px; margin-bottom: 10px;
        }
        html.dark-theme .cc-control-heading { color: #cbd5e1; }
        .cc-filter-grid {
            display: grid;
            grid-template-columns: minmax(130px, 1fr) minmax(160px, 1.2fr) minmax(130px, 1fr) minmax(95px, 0.8fr) minmax(95px, 0.8fr) auto;
            align-items: end; gap: 8px;
        }
        .cc-field { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
        .cc-field > span { color: #64748b; font-size: 10.5px; font-weight: 700; }
        .cc-field input, .cc-field select {
            width: 100%; height: 36px; box-sizing: border-box; padding: 6px 10px;
            border: 1px solid var(--border-color, #cbd5e1); border-radius: 8px;
            background: var(--card-bg, #fff); color: inherit; font-size: 12px; outline: none;
        }
        .cc-field input:focus, .cc-field select:focus {
            border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(59,130,246,.12);
        }
        html.dark-theme .cc-field > span { color: #94a3b8; }
        html.dark-theme .cc-field input,
        html.dark-theme .cc-field select {
            background: #0f172a;
            border-color: #475569;
            color: #f1f5f9;
        }
        html.dark-theme .cc-field input::placeholder { color: #64748b; opacity: 1; }
        .cc-filter-reset { width: 100%; height: 36px; }
        .cc-bulk-section { display: flex; flex-direction: column; }
        .cc-bulk-row { justify-content: space-between; }
        .cc-view-toggle {
            display: inline-flex; padding: 3px; gap: 2px;
            border-radius: 9px; background: rgba(100,116,139,.12);
        }
        .cc-view-btn {
            border: none; border-radius: 7px; background: transparent; color: #64748b;
            padding: 6px 10px; font-size: 11.5px; font-weight: 750; cursor: pointer;
        }
        .cc-view-btn.active { color: #fff; background: #3b82f6; box-shadow: 0 2px 6px rgba(59,130,246,.25); }
        .cc-scope-note { color: #64748b; font-size: 11px; line-height: 1.45; margin-top: 10px; }
        html.dark-theme .cc-view-toggle { background: #0f172a; border: 1px solid #334155; }
        html.dark-theme .cc-view-btn { color: #94a3b8; }
        html.dark-theme .cc-view-btn.active { color: #fff; background: #2563eb; }
        html.dark-theme .cc-scope-note { color: #94a3b8; }
        html.dark-theme .cc-btn:disabled { color: #94a3b8; opacity: .72; }
        .cc-api-status {
            display: flex; align-items: center; min-height: 34px; padding: 7px 11px;
            margin-bottom: 10px; border-radius: 9px; background: rgba(100,116,139,.07);
            color: #64748b; font-size: 11.5px;
        }
        html.dark-theme .cc-api-status { background: #172235; color: #cbd5e1; }
        .cc-action-notice {
            padding: 9px 12px; margin-bottom: 10px; border-radius: 9px;
            font-size: 12px; font-weight: 650;
        }
        .cc-action-notice.success { color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0; }
        .cc-action-notice.info { color: #1d4ed8; background: #eff6ff; border: 1px solid #bfdbfe; }
        .cc-action-notice.warning { color: #b45309; background: #fffbeb; border: 1px solid #fde68a; }
        html.dark-theme .cc-action-notice.success { color: #6ee7b7; background: rgba(16,185,129,.12); border-color: rgba(52,211,153,.3); }
        html.dark-theme .cc-action-notice.info { color: #93c5fd; background: rgba(59,130,246,.12); border-color: rgba(96,165,250,.3); }
        html.dark-theme .cc-action-notice.warning { color: #fcd34d; background: rgba(245,158,11,.1); border-color: rgba(251,191,36,.3); }
        .cc-empty-state {
            text-align: center; padding: 42px 20px; border: 1px dashed var(--border-color, #cbd5e1);
            border-radius: 12px; color: #64748b; background: rgba(100,116,139,.035);
        }
        .cc-empty-state strong { display: block; color: inherit; font-size: 14px; margin-bottom: 5px; }
        html.dark-theme .cc-empty-state { color: #94a3b8; background: rgba(15,23,42,.5); border-color: #475569; }
        .cc-data-container .ldr-table { border-radius: 12px; overflow: hidden; }
        .cc-edited-row { background: rgba(16,185,129,.10) !important; box-shadow: inset 3px 0 0 #10b981; }
        @media (max-width: 1180px) {
            .cc-summary-grid { grid-template-columns: repeat(3, minmax(120px, 1fr)); }
            .cc-control-panel { grid-template-columns: 1fr; }
            .cc-filter-grid { grid-template-columns: repeat(3, minmax(140px, 1fr)); }
        }
        @media (max-width: 700px) {
            .cc-shell { padding: 15px !important; }
            .cc-page-header { flex-direction: column; }
            .cc-header-actions { width: 100%; }
            .cc-header-actions .cc-btn { flex: 1; }
            .cc-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .cc-summary-edited { grid-column: span 2; }
            .cc-filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .cc-field-search, .cc-filter-reset { grid-column: span 2; }
            .cc-bulk-row { align-items: stretch; flex-direction: column; }
            .cc-bulk-actions { align-items: stretch; }
            .cc-bulk-actions .cc-btn { flex: 1; }
            .cc-view-toggle { align-self: flex-start; }
        }
        @media (max-width: 480px) {
            .cc-summary-grid { grid-template-columns: 1fr 1fr; }
            .cc-summary-card { padding: 10px 11px; }
            .cc-summary-card strong { font-size: 21px; }
            .cc-filter-grid { grid-template-columns: 1fr 1fr; }
            .cc-field-search, .cc-field:not(.cc-field-day), .cc-filter-reset { grid-column: span 2; }
        }
    `;
    document.head.appendChild(style);
})();

async function getDirectAccessToken() {
    const now = Math.floor(Date.now() / 1000);
    if (directTokenCache.token && directTokenCache.expiresAt > now + 300) {
        return directTokenCache.token;
    }

    function base64UrlEncode(str) {
        return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    }

    function base64UrlEncodeBuffer(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    }

    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
        iss: SA_CONFIG.client_email,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;

    const pemContents = SA_CONFIG.private_key
        .replace(/-----BEGIN PRIVATE KEY-----/g, '')
        .replace(/-----END PRIVATE KEY-----/g, '')
        .replace(/\s+/g, '');
    
    const binaryDerString = atob(pemContents);
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.charCodeAt(i);
    }

    const cryptoKey = await window.crypto.subtle.importKey(
        'pkcs8',
        binaryDer.buffer,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await window.crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        cryptoKey,
        new TextEncoder().encode(unsignedToken)
    );

    const jwt = `${unsignedToken}.${base64UrlEncodeBuffer(signature)}`;

    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt
        })
    });

    const data = await response.json();
    if (data.access_token) {
        directTokenCache.token = data.access_token;
        directTokenCache.expiresAt = now + (data.expires_in || 3600);
        return data.access_token;
    } else {
        throw new Error(data.error_description || 'Không lấy được Token từ Google OAuth2');
    }
}

function initChamCongTab() {
    updateChamCongViewToggleButtons();
    updateChamCongSubmitButtonState();

    // Load all rows once, then every action works on the filtered visible slice.
    if (!Array.isArray(window.chamCongAllData) || window.chamCongAllData.length === 0) {
        fetchChamCongData();
    } else {
        populateChamCongDayRangeFilters(window.chamCongAllData, false);
        renderChamCongView();
    }
}

async function fetchChamCongData() {
    const container = document.getElementById('chamCongTableContainer');
    const statusEl = document.getElementById('chamCongApiStatus');
    if (!container) return;

    container.innerHTML = '<div style="text-align:center; padding:40px; color:#64748b; font-style:italic">⏳ Đang kết nối trực tiếp Google Sheets... Vui lòng chờ vài giây.</div>';
    
    if (statusEl) {
        statusEl.innerHTML = '<span style="color:#f59e0b;">⏳ Đang kết nối API Google Sheets...</span>';
    }

    // Try Local Server first
    try {
        const localRes = await fetch(`${LOCAL_API_BASE}?day=ALL`);
        if (localRes.ok) {
            const res = await localRes.json();
            if (res.status === 'success') {
                processAndRenderChamCongData(res.data, 'Local API / Service Account');
                return;
            }
        }
    } catch (e) {
        console.log("Local API không sẵn sàng, dùng Direct Browser OAuth2...", e);
    }

    // Direct Browser Web Crypto API Fallback — load ALL rows
    try {
        const token = await getDirectAccessToken();
        const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/'${encodeURIComponent(TARGET_SHEET)}'!A2:L`;
        const res = await fetch(sheetUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error(`Google Sheets API Error: ${res.status}`);
        const dataJson = await res.json();
        const rows = dataJson.values || [];
        
        const records = [];

        for (let idx = 0; idx < rows.length; idx++) {
            const row = rows[idx];
            if (row && row[1]) {
                const dayVal = String(row[4] || '').trim();
                records.push({
                    row_index: idx + 2,  // +2 vì bắt đầu từ row 2 trên sheet
                    stt: row[0] || '',
                    staff: row[1] || '',
                    ma_nv: row[2] || '',
                    thu: row[3] || '',
                    ngay: dayVal,
                    in_time: row[5] || '',
                    out_time: row[6] || '',
                    total_time: row[7] || '',
                    act_count: row[8] || '',
                    phat_muon: row[9] || '',
                    cham_cong: row[10] || '',
                    ghi_chu: row[11] || ''
                });
            }
        }

        processAndRenderChamCongData(records, 'Direct Browser (Zero-Server)');
    } catch (err) {
        console.error("Lỗi tải dữ liệu chấm công:", err);
        if (statusEl) {
            statusEl.innerHTML = `<span style="color:#ef4444; font-weight:700;">⚠️ Lỗi kết nối Google Sheets: ${err.message}</span>`;
        }
        container.innerHTML = `
            <div style="text-align:center; padding:30px; background:rgba(239, 68, 68, 0.1); border:1px solid #ef4444; border-radius:10px; color:#ef4444;">
                <h4 style="margin-top:0;">⚠️ Lỗi tải dữ liệu Chấm Công</h4>
                <p style="font-size:13.5px; margin-bottom:10px;">${err.message}</p>
                <button onclick="fetchChamCongData()" style="background:#ef4444; color:#fff; border:none; padding:8px 16px; border-radius:6px; font-weight:bold; cursor:pointer;">🔄 Thử lại</button>
            </div>
        `;
    }
}


function processAndRenderChamCongData(data, connectionMode) {
    const statusEl = document.getElementById('chamCongApiStatus');
    const safeData = (Array.isArray(data) ? data : [])
        .map(row => {
            const dayNumber = Number(row?.ngay);
            return {
                ...row,
                row_index: Number(row?.row_index),
                staff: String(row?.staff || '').trim(),
                ngay: Number.isInteger(dayNumber) ? String(dayNumber) : ''
            };
        })
        .filter(row => (
            Number.isInteger(row.row_index) &&
            row.row_index >= 2 &&
            row.staff !== '' &&
            !['Tên NS', 'TỔNG CỘNG', 'STT'].includes(row.staff) &&
            Number(row.ngay) >= 1 &&
            Number(row.ngay) <= 31
        ));
    window.chamCongAllData = safeData;
    window.chamCongData = [];
    window.chamCongEditedRows = {};
    window.chamCongConnectionMode = connectionMode || '';

    const totalDays = new Set(safeData.map(r => r.ngay).filter(Boolean)).size;
    const totalStaff = new Set(safeData.map(r => r.staff).filter(Boolean)).size;

    if (statusEl) {
        statusEl.innerHTML = `<span style="color:#10b981; font-weight:700;">🟢 Google Sheets đã kết nối (${connectionMode}) · ${safeData.length} dòng · ${totalStaff} nhân sự · ${totalDays} ngày</span>`;
    }

    populateChamCongStaffFilter();
    populateChamCongDayRangeFilters(safeData, true);
    renderChamCongView();
    updateChamCongSubmitButtonState();
}

function populateChamCongDayRangeFilters(data, selectDefaultDay) {
    const fromEl = document.getElementById('chamCongDayFrom');
    const toEl = document.getElementById('chamCongDayTo');
    if (!fromEl || !toEl) return;

    const days = [...new Set((data || [])
        .map(r => Number(r.ngay))
        .filter(d => Number.isInteger(d) && d >= 1 && d <= 31))]
        .sort((a, b) => a - b);
    const oldFrom = fromEl.value;
    const oldTo = toEl.value;
    const options = days.map(d => `<option value="${d}">Ngày ${d}</option>`).join('');
    fromEl.innerHTML = '<option value="">Đầu kỳ</option>' + options;
    toEl.innerHTML = '<option value="">Cuối kỳ</option>' + options;

    const validValues = new Set(days.map(String));
    if (validValues.has(oldFrom)) fromEl.value = oldFrom;
    if (validValues.has(oldTo)) toEl.value = oldTo;

    if (selectDefaultDay && !oldFrom && !oldTo && days.length > 0) {
        const today = String(new Date().getDate());
        const defaultDay = validValues.has(today) ? today : String(days[days.length - 1]);
        fromEl.value = defaultDay;
        toEl.value = defaultDay;
    }
}

function onChamCongDateChange() {
    const fromEl = document.getElementById('chamCongDayFrom');
    const toEl = document.getElementById('chamCongDayTo');
    const fromDay = fromEl && fromEl.value ? Number(fromEl.value) : null;
    const toDay = toEl && toEl.value ? Number(toEl.value) : null;
    if (fromDay !== null && toDay !== null && fromDay > toDay) {
        toEl.value = String(fromDay);
        showChamCongNotice(`Đã điều chỉnh ngày kết thúc về Ngày ${fromDay}.`, 'info');
    }
    renderChamCongView();
}

function refreshChamCongData() {
    const editCount = Object.keys(window.chamCongEditedRows || {}).length;
    if (editCount > 0 && !confirm(`Có ${editCount} dòng chưa nộp. Tải lại sẽ bỏ các thay đổi này. Anh có muốn tiếp tục?`)) {
        return;
    }
    window.chamCongAllData = null;
    window.chamCongData = [];
    window.chamCongEditedRows = {};
    fetchChamCongData();
}

function toggleChamCongViewMode(mode) {
    if (mode !== 'card' && mode !== 'table') return;
    window.chamCongViewMode = mode;
    updateChamCongViewToggleButtons();
    renderChamCongView();
}

function updateChamCongViewToggleButtons() {
    const cardBtn = document.getElementById('btnChamCongViewCard');
    const tableBtn = document.getElementById('btnChamCongViewTable');
    if (cardBtn) cardBtn.classList.toggle('active', window.chamCongViewMode === 'card');
    if (tableBtn) tableBtn.classList.toggle('active', window.chamCongViewMode === 'table');
}

function resetChamCongFilters() {
    const searchEl = document.getElementById('chamCongSearchInput');
    const teamEl = document.getElementById('chamCongTeamFilter');
    const staffEl = document.getElementById('chamCongStaffFilter');
    const statusEl = document.getElementById('chamCongStatusFilter');
    const fromEl = document.getElementById('chamCongDayFrom');
    const toEl = document.getElementById('chamCongDayTo');
    if (searchEl) searchEl.value = '';
    if (teamEl) teamEl.value = 'ALL';
    populateChamCongStaffFilter();
    if (staffEl) staffEl.value = 'ALL';
    if (statusEl) statusEl.value = 'ALL';
    if (fromEl) fromEl.value = '';
    if (toEl) toEl.value = '';
    renderChamCongView();
    showChamCongNotice('Đã xóa bộ lọc, đang hiển thị toàn bộ dữ liệu.', 'info');
}

function onChamCongTeamChange() {
    populateChamCongStaffFilter();
    renderChamCongView();
}

function showChamCongNotice(message, type = 'info') {
    const el = document.getElementById('chamCongActionNotice');
    if (!el) return;
    if (chamCongNoticeTimer) clearTimeout(chamCongNoticeTimer);
    el.textContent = message;
    el.className = `cc-action-notice ${type}`;
    chamCongNoticeTimer = setTimeout(() => el.classList.add('hidden'), 4500);
}

function escapeChamCongHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getStaffInitials(fullName) {
    if (!fullName) return 'SC';
    const clean = fullName.replace(/^\d+\s*-\s*/, '').replace(/-.*/, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
        return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return clean.substring(0, 2).toUpperCase();
}

function getStaffCleanName(fullName) {
    if (!fullName) return '-';
    const parts = String(fullName).split('-');
    if (parts.length >= 2) {
        return parts[1].trim();
    }
    return String(fullName).trim();
}

function populateChamCongStaffFilter() {
    const sel = document.getElementById('chamCongStaffFilter');
    if (!sel || !window.chamCongAllData) return;
    const teamSel = document.getElementById('chamCongTeamFilter');
    const selectedTeam = teamSel ? teamSel.value : 'ALL';
    const currentVal = sel.value;

    let availableStaff = window.chamCongAllData;
    if (selectedTeam !== 'ALL') {
        availableStaff = availableStaff.filter(r => getStaffTeam(r.staff, r.ma_nv) === selectedTeam);
    }

    const staffList = [...new Set(availableStaff.map(r => r.staff).filter(Boolean))].sort();
    sel.innerHTML = '<option value="ALL">Tất cả nhân sự</option>' +
        staffList.map(s => {
            const team = getStaffTeam(s);
            const teamPrefix = (selectedTeam === 'ALL') ? (team === 'HCM' ? '[HCM] ' : '[Tỉnh] ') : '';
            return `<option value="${escapeChamCongHTML(s)}">${teamPrefix}${escapeChamCongHTML(s)}</option>`;
        }).join('');

    if (staffList.includes(currentVal)) {
        sel.value = currentVal;
    } else {
        sel.value = 'ALL';
    }
}

function getEffectiveChamCongValue(row, field) {
    const edited = window.chamCongEditedRows && window.chamCongEditedRows[row.row_index];
    return edited && edited[field] !== undefined ? edited[field] : (row[field] || '');
}

function stageChamCongRowChange(row, chamCongValue, noteValue) {
    const rowIdx = Number(row.row_index);
    const nextStatus = String(chamCongValue || '').trim();
    const nextNote = String(noteValue || '').trim();
    const originalStatus = String(row.cham_cong || '').trim();
    const originalNote = String(row.ghi_chu || '').trim();

    if (nextStatus === originalStatus && nextNote === originalNote) {
        delete window.chamCongEditedRows[rowIdx];
    } else {
        window.chamCongEditedRows[rowIdx] = {
            row_index: rowIdx,
            cham_cong: nextStatus,
            ghi_chu: nextNote
        };
    }
}

function parseChamCongTimeToMinutes(value) {
    const raw = String(value ?? '').trim().toLowerCase();
    if (!raw || ['-', 'n/a', 'null', 'undefined'].includes(raw)) return 0;

    const clockMatch = raw.match(/^(\d{1,3}):(\d{1,2})(?::\d{1,2})?$/);
    if (clockMatch) {
        return (Number(clockMatch[1]) * 60) + Math.min(Number(clockMatch[2]), 59);
    }

    const decimalMatch = raw.replace(',', '.').match(/^(\d+(?:\.\d+)?)\s*(?:h|giờ|gio)?$/);
    if (decimalMatch) return Math.round(Number(decimalMatch[1]) * 60);
    return 0;
}

function getChamCongWorkedMinutes(row) {
    const totalMinutes = parseChamCongTimeToMinutes(row.total_time);
    if (totalMinutes > 0) return totalMinutes;

    const inMinutes = parseChamCongTimeToMinutes(row.in_time);
    const outMinutes = parseChamCongTimeToMinutes(row.out_time);
    if (inMinutes > 0 && outMinutes > 0 && inMinutes !== outMinutes) {
        return outMinutes >= inMinutes
            ? outMinutes - inMinutes
            : (24 * 60) - inMinutes + outMinutes;
    }
    return 0;
}

function hasChamCongWorkSignal(row) {
    const actCount = Number(row.act_count) || 0;
    const hasClockValue = [row.in_time, row.out_time].some(value => {
        const normalized = String(value || '').replace(/\s/g, '');
        return normalized !== '' && !['0', '0:00', '00:00', '0:00:00', '00:00:00', '-'].includes(normalized);
    });
    return getChamCongWorkedMinutes(row) > 0 || actCount > 0 || hasClockValue;
}

function filterChamCongData() {
    const searchInput = document.getElementById('chamCongSearchInput');
    const teamSelect = document.getElementById('chamCongTeamFilter');
    const statusSelect = document.getElementById('chamCongStatusFilter');
    const staffSelect = document.getElementById('chamCongStaffFilter');
    const fromEl = document.getElementById('chamCongDayFrom');
    const toEl = document.getElementById('chamCongDayTo');

    const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const teamVal = teamSelect ? teamSelect.value : 'ALL';
    const statusVal = statusSelect ? statusSelect.value : 'ALL';
    const staffVal = staffSelect ? staffSelect.value : 'ALL';

    const fromDay = fromEl && fromEl.value ? Number(fromEl.value) : null;
    const toDay = toEl && toEl.value ? Number(toEl.value) : null;

    if (!Array.isArray(window.chamCongAllData)) return [];

    return window.chamCongAllData.filter(r => {
        const staffName = (r.staff || '').toLowerCase();
        const staffCode = String(r.ma_nv || '').toLowerCase();
        const chamCongVal = String(getEffectiveChamCongValue(r, 'cham_cong')).trim();
        const staffTeam = getStaffTeam(r.staff, r.ma_nv);

        let matchesDate = true;
        if (fromDay !== null || toDay !== null) {
            const dayNum = Number(r.ngay);
            if (!Number.isInteger(dayNum)) return false;
            if (fromDay !== null && dayNum < fromDay) matchesDate = false;
            if (toDay !== null && dayNum > toDay) matchesDate = false;
        }

        const matchesTeam = teamVal === 'ALL' || staffTeam === teamVal;
        const matchesSearch = !searchVal || staffName.includes(searchVal) || staffCode.includes(searchVal);
        const matchesStaff = staffVal === 'ALL' || r.staff === staffVal;

        let matchesStatus = true;
        if (statusVal === 'DONE') {
            matchesStatus = chamCongVal !== '';
        } else if (statusVal === 'PENDING') {
            matchesStatus = chamCongVal === '';
        } else if (statusVal !== 'ALL') {
            matchesStatus = chamCongVal.toUpperCase() === statusVal.toUpperCase();
        }

        return matchesDate && matchesTeam && matchesSearch && matchesStaff && matchesStatus;
    });
}

function renderChamCongView() {
    const container = document.getElementById('chamCongTableContainer');
    if (!container) return;

    const filteredData = filterChamCongData();
    window.chamCongData = filteredData;
    updateChamCongSummary(filteredData);
    updateChamCongViewToggleButtons();
    updateChamCongSubmitButtonState();

    if (!filteredData || filteredData.length === 0) {
        container.innerHTML = '<div class="cc-empty-state"><strong>Không có dòng phù hợp</strong><span>Hãy nới khoảng ngày hoặc xóa bộ lọc để xem thêm dữ liệu.</span></div>';
        return;
    }

    if (window.chamCongViewMode === 'card') {
        renderChamCongMobileCards(filteredData, container);
    } else {
        renderChamCongDesktopTable(filteredData, container);
    }
}

function updateChamCongSummary(data) {
    const rows = Array.isArray(data) ? data : [];
    const done = rows.filter(r => String(getEffectiveChamCongValue(r, 'cham_cong')).trim() !== '').length;
    const values = {
        ccSummaryVisible: rows.length,
        ccSummaryStaff: new Set(rows.map(r => r.staff).filter(Boolean)).size,
        ccSummaryDone: done,
        ccSummaryPending: rows.length - done,
        ccSummaryEdited: Object.keys(window.chamCongEditedRows || {}).length
    };
    Object.entries(values).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = Number(value).toLocaleString('vi-VN');
    });
}

function renderChamCongMobileCards(data, container) {
    let html = `<div class="cc-mobile-grid">`;

    data.forEach((r, idx) => {
        const rowIdx = r.row_index;
        const fullName = r.staff || '-';
        const cleanName = getStaffCleanName(fullName);
        const initials = getStaffInitials(fullName);
        const thuNgay = `${r.thu || ''} (${r.ngay || ''})`;
        const inOut = (r.in_time || r.out_time) ? `${r.in_time || '0:00'} - ${r.out_time || '0:00'}` : '0:00 - 0:00';
        const actCount = r.act_count || 0;
        const totalTime = r.total_time || '0:00';
        
        const chamCongVal = window.chamCongEditedRows[rowIdx]?.cham_cong !== undefined ? window.chamCongEditedRows[rowIdx].cham_cong : (r.cham_cong || '');
        const ghiChuVal = window.chamCongEditedRows[rowIdx]?.ghi_chu !== undefined ? window.chamCongEditedRows[rowIdx].ghi_chu : (r.ghi_chu || '');
        const isEdited = !!window.chamCongEditedRows[rowIdx];

        const statusBtns = [
            { label: 'X', code: 'X', color: '#10b981', shadow: 'rgba(16, 185, 129, 0.3)', title: 'Có mặt' },
            { label: 'X/2', code: 'X/2', color: '#0284c7', shadow: 'rgba(2, 132, 199, 0.3)', title: 'Nửa ngày' },
            { label: 'OFF', code: 'OFF', color: '#64748b', shadow: 'rgba(100, 116, 139, 0.3)', title: 'Nghỉ tuần' },
            { label: 'L', code: 'L', color: '#8b5cf6', shadow: 'rgba(139, 92, 246, 0.3)', title: 'Nghỉ Lễ' },
            { label: 'P', code: 'P', color: '#f59e0b', shadow: 'rgba(245, 158, 11, 0.3)', title: 'Nghỉ Phép' },
            { label: 'KP', code: 'KP', color: '#ef4444', shadow: 'rgba(239, 68, 68, 0.3)', title: 'Không Phép' }
        ];

        let btnsHtml = statusBtns.map(b => {
            const isActive = String(chamCongVal).trim().toUpperCase() === b.code.toUpperCase();
            return `
                <button type="button" 
                        class="cc-pill-btn ${isActive ? 'active' : ''}" 
                        style="--btn-color:${b.color}; --shadow-color:${b.shadow};"
                        data-pill-row="${rowIdx}"
                        data-pill-code="${b.code}"
                        data-pill-color="${b.color}"
                        data-pill-shadow="${b.shadow}"
                        onclick="setRowChamCongStatus(${rowIdx}, '${b.code}')" 
                        title="${b.title}">
                    ${b.label}
                </button>
            `;
        }).join('');

        const staffTeam = getStaffTeam(fullName, row.ma_nv);
        const teamBadge = staffTeam === 'HCM'
            ? '<span style="font-size:10px; font-weight:700; background:rgba(59,130,246,0.15); color:#2563eb; padding:2px 6px; border-radius:4px;">Team HCM</span>'
            : '<span style="font-size:10px; font-weight:700; background:rgba(16,185,129,0.15); color:#059669; padding:2px 6px; border-radius:4px;">Team Tỉnh</span>';

        html += `
        <div id="cc_card_${rowIdx}" class="cc-card ${isEdited ? 'edited' : ''}">
            <div class="cc-card-header">
                <div class="cc-staff-info">
                    <div class="cc-avatar">${initials}</div>
                    <div>
                        <div class="cc-staff-name">${cleanName}</div>
                        <div class="cc-staff-sub" style="display:flex; align-items:center; gap:6px; margin-top:2px;">
                            <span>${fullName.split('-')[0] || ''}</span>
                            ${teamBadge}
                        </div>
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:3px;">
                    <span class="cc-badge-stt">#${idx + 1}</span>
                    <span style="font-size:11px; font-weight:700; color:#10b981;">${thuNgay}</span>
                </div>
            </div>

            <!-- Quick Stats -->
            <div class="cc-stats-row">
                <div class="cc-stat-box">
                    <span class="cc-stat-lbl">Check-In/Out</span>
                    <span class="cc-stat-val">${inOut}</span>
                </div>
                <div class="cc-stat-box">
                    <span class="cc-stat-lbl">Tổng giờ</span>
                    <span class="cc-stat-val">${totalTime}</span>
                </div>
                <div class="cc-stat-box">
                    <span class="cc-stat-lbl">Hoạt động</span>
                    <span class="cc-stat-val" style="color:${actCount > 0 ? '#10b981' : '#64748b'};">${actCount} act</span>
                </div>
            </div>

            <!-- Status Buttons Grid -->
            <div>
                <div style="font-size:11px; font-weight:700; color:#64748b; margin-bottom:5px; display:flex; justify-content:space-between;">
                    <span>⭐ CHẤM CÔNG (CỘT K)</span>
                    <span id="cc_status_lbl_${rowIdx}" style="color:${chamCongVal ? '#10b981' : '#f59e0b'}; font-weight:700;">${chamCongVal || 'Chưa chấm'}</span>
                </div>
                <div class="cc-pills-container">
                    ${btnsHtml}
                </div>
            </div>

            <!-- Custom Input & Notes -->
            <div style="display:grid; grid-template-columns: 1fr 2fr; gap:8px; margin-top:2px;">
                <input type="text" class="cc-entry-input"
                       id="cc_input_k_${rowIdx}" 
                       value="${escapeChamCongHTML(chamCongVal)}" 
                       placeholder="Khác..." 
                       oninput="onChamCongInputChange(${rowIdx})"
                       style="padding:6px 8px; font-size:12px; border-radius:8px; text-align:center; font-weight:bold;">
                <input type="text" class="cc-entry-input"
                       id="cc_input_l_${rowIdx}" 
                       value="${escapeChamCongHTML(ghiChuVal)}" 
                       placeholder="✍️ Ghi chú thêm..." 
                       oninput="onChamCongInputChange(${rowIdx})"
                       style="padding:6px 10px; font-size:12px; border-radius:8px;">
            </div>
        </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function renderChamCongDesktopTable(data, container) {
    let html = `
    <div style="overflow-x:auto;">
        <table class="ldr-table" style="width:100%; border-collapse:collapse;">
            <thead>
                <tr class="cc-table-head-row">
                    <th style="width:50px; text-align:center;">STT</th>
                    <th style="min-width:200px; text-align:left;">Họ và tên SC</th>
                    <th style="min-width:90px; text-align:center;">Thứ / Ngày</th>
                    <th style="min-width:130px; text-align:center;">In / Out</th>
                    <th style="min-width:110px; text-align:center;">Thời gian / Act</th>
                    <th style="min-width:240px; text-align:center; background:rgba(59, 130, 246, 0.15); color:#3b82f6;">⭐ CỘT K: CHẤM CÔNG</th>
                    <th style="min-width:200px; text-align:left;">CỘT L: GHI CHÚ</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.forEach((r, idx) => {
        const rowIdx = r.row_index;
        const staff = r.staff || '-';
        const thuNgay = `${r.thu || ''} (${r.ngay || ''})`;
        const inOut = (r.in_time || r.out_time) ? `${r.in_time || '0:00'} - ${r.out_time || '0:00'}` : '-';
        const totalAct = `${r.total_time || '0:00'} | <b>${r.act_count || 0} act</b>`;
        const chamCongVal = window.chamCongEditedRows[rowIdx]?.cham_cong !== undefined ? window.chamCongEditedRows[rowIdx].cham_cong : (r.cham_cong || '');
        const ghiChuVal = window.chamCongEditedRows[rowIdx]?.ghi_chu !== undefined ? window.chamCongEditedRows[rowIdx].ghi_chu : (r.ghi_chu || '');
        const isEdited = !!window.chamCongEditedRows[rowIdx];

        const statusBtns = [
            { label: 'X', code: 'X', color: '#10b981', shadow: 'rgba(16, 185, 129, 0.3)', title: 'Có mặt' },
            { label: 'X/2', code: 'X/2', color: '#0284c7', shadow: 'rgba(2, 132, 199, 0.3)', title: 'Nửa ngày' },
            { label: 'OFF', code: 'OFF', color: '#64748b', shadow: 'rgba(100, 116, 139, 0.3)', title: 'Nghỉ tuần' },
            { label: 'L', code: 'L', color: '#8b5cf6', shadow: 'rgba(139, 92, 246, 0.3)', title: 'Nghỉ Lễ' },
            { label: 'P', code: 'P', color: '#f59e0b', shadow: 'rgba(245, 158, 11, 0.3)', title: 'Nghỉ Phép' },
            { label: 'KP', code: 'KP', color: '#ef4444', shadow: 'rgba(239, 68, 68, 0.3)', title: 'Không Phép' }
        ];

        let btnsHtml = statusBtns.map(b => {
            const isActive = String(chamCongVal).trim().toUpperCase() === b.code.toUpperCase();
            return `
                <button type="button" 
                        class="cc-pill-btn ${isActive ? 'active' : ''}" 
                        style="--btn-color:${b.color}; --shadow-color:${b.shadow}; padding:3px 8px; font-size:11px;"
                        data-pill-row="${rowIdx}"
                        data-pill-code="${b.code}"
                        data-pill-color="${b.color}"
                        data-pill-shadow="${b.shadow}"
                        onclick="setRowChamCongStatus(${rowIdx}, '${b.code}')" 
                        title="${b.title}">
                    ${b.label}
                </button>
            `;
        }).join(' ');

        const staffTeam = getStaffTeam(staff, r.ma_nv);
        const teamBadge = staffTeam === 'HCM'
            ? '<span style="font-size:10px; font-weight:700; background:rgba(59,130,246,0.15); color:#2563eb; padding:2px 6px; border-radius:4px; margin-left:6px;">HCM</span>'
            : '<span style="font-size:10px; font-weight:700; background:rgba(16,185,129,0.15); color:#059669; padding:2px 6px; border-radius:4px; margin-left:6px;">Tỉnh</span>';

        html += `
        <tr id="cc_row_${rowIdx}" class="${isEdited ? 'cc-edited-row' : ''}">
            <td style="text-align:center;">${idx + 1}</td>
            <td style="text-align:left; font-weight:600;">${staff} ${teamBadge}</td>
            <td style="text-align:center; font-size:12px;">${thuNgay}</td>
            <td style="text-align:center; font-size:12px;">${inOut}</td>
            <td style="text-align:center; font-size:12px;">${totalAct}</td>
            <td style="text-align:center;">
                <div style="display:flex; flex-direction:column; gap:5px; align-items:center;">
                    <div style="display:flex; gap:4px; flex-wrap:wrap; justify-content:center;">
                        ${btnsHtml}
                    </div>
                    <input type="text" class="cc-entry-input"
                           id="cc_input_k_${rowIdx}" 
                           value="${escapeChamCongHTML(chamCongVal)}" 
                           placeholder="Nhập tùy chỉnh..." 
                           oninput="onChamCongInputChange(${rowIdx})"
                           style="width:90%; padding:3px 8px; font-size:12px; border-radius:5px; text-align:center; font-weight:bold;">
                </div>
            </td>
            <td style="text-align:left;">
                <input type="text" class="cc-entry-input"
                       id="cc_input_l_${rowIdx}" 
                       value="${escapeChamCongHTML(ghiChuVal)}" 
                       placeholder="Ghi chú thêm..." 
                       oninput="onChamCongInputChange(${rowIdx})"
                       style="width:95%; padding:4px 8px; font-size:12px; border-radius:5px;">
            </td>
        </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    </div>
    `;

    container.innerHTML = html;
}

function setRowChamCongStatus(rowIdx, statusCode) {
    const inputK = document.getElementById(`cc_input_k_${rowIdx}`);
    if (inputK) {
        inputK.value = statusCode;
    }
    onChamCongInputChange(rowIdx);
    // Update pill button active states in place (no full re-render)
    updatePillActiveStates(rowIdx, statusCode);
}

function updatePillActiveStates(rowIdx, activeCode) {
    const statusCodes = ['X', 'X/2', 'OFF', 'L', 'P', 'KP'];
    statusCodes.forEach(code => {
        const btn = document.querySelector(`[data-pill-row="${rowIdx}"][data-pill-code="${code}"]`);
        if (!btn) return;
        const color = btn.dataset.pillColor || '#64748b';
        const shadow = btn.dataset.pillShadow || 'rgba(100,116,139,0.3)';
        if (String(activeCode).trim().toUpperCase() === code.toUpperCase()) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function onChamCongInputChange(rowIdx) {
    const inputK = document.getElementById(`cc_input_k_${rowIdx}`);
    const inputL = document.getElementById(`cc_input_l_${rowIdx}`);
    const rowEl = document.getElementById(`cc_row_${rowIdx}`);
    const cardEl = document.getElementById(`cc_card_${rowIdx}`);

    const valK = inputK ? inputK.value.trim() : '';
    const valL = inputL ? inputL.value.trim() : '';
    const originalRow = (window.chamCongAllData || []).find(r => Number(r.row_index) === Number(rowIdx));
    const originalK = String(originalRow?.cham_cong || '').trim();
    const originalL = String(originalRow?.ghi_chu || '').trim();

    if (!window.chamCongEditedRows) window.chamCongEditedRows = {};
    const hasChanged = valK !== originalK || valL !== originalL;
    if (hasChanged) {
        window.chamCongEditedRows[rowIdx] = { row_index: Number(rowIdx), cham_cong: valK, ghi_chu: valL };
    } else {
        delete window.chamCongEditedRows[rowIdx];
    }

    if (rowEl) rowEl.classList.toggle('cc-edited-row', hasChanged);
    if (cardEl) cardEl.classList.toggle('edited', hasChanged);

    // Update pill active states based on new value (no full re-render = no focus loss)
    updatePillActiveStates(rowIdx, valK);
    updateChamCongSubmitButtonState();
    updateChamCongSummary(window.chamCongData || []);
    // Update the status label on the card header if present
    const statusLabelEl = document.getElementById(`cc_status_lbl_${rowIdx}`);
    if (statusLabelEl) {
        statusLabelEl.textContent = valK || 'Chưa chấm';
        statusLabelEl.style.color = valK ? '#10b981' : '#f59e0b';
    }
}

function autoFillChamCongAll(type) {
    if (type === 'RESET') {
        const changedCount = Object.keys(window.chamCongEditedRows || {}).length;
        window.chamCongEditedRows = {};
        renderChamCongView();
        showChamCongNotice(changedCount > 0
            ? `Đã bỏ toàn bộ ${changedCount} dòng thay đổi chưa nộp.`
            : 'Không có thay đổi nào cần khôi phục.', changedCount > 0 ? 'success' : 'info');
        return;
    }

    const visibleRows = Array.isArray(window.chamCongData) ? window.chamCongData : [];
    if (visibleRows.length === 0) {
        showChamCongNotice('Không có dòng nào trong bộ lọc hiện tại.', 'warning');
        return;
    }

    const proposed = { X: 0, HALF: 0, OFF: 0 };
    let reviewCount = 0;
    let blankCount = 0;
    visibleRows.forEach(r => {
        const currentStatus = String(getEffectiveChamCongValue(r, 'cham_cong')).trim();
        if (currentStatus) return;

        blankCount++;
        const currentNote = String(getEffectiveChamCongValue(r, 'ghi_chu')).trim();
        const workedMinutes = getChamCongWorkedMinutes(r);
        let suggestedStatus = '';

        if (workedMinutes >= 6 * 60) {
            suggestedStatus = 'X';
            proposed.X++;
        } else if (workedMinutes > 0 && workedMinutes < 5 * 60) {
            suggestedStatus = 'X/2';
            proposed.HALF++;
        } else if (!hasChamCongWorkSignal(r)) {
            suggestedStatus = 'OFF';
            proposed.OFF++;
        } else {
            reviewCount++;
        }

        if (suggestedStatus) stageChamCongRowChange(r, suggestedStatus, currentNote);
    });

    renderChamCongView();
    const proposedCount = proposed.X + proposed.HALF + proposed.OFF;
    if (proposedCount > 0) {
        const reviewText = reviewCount > 0 ? ` · ${reviewCount} dòng cần kiểm tra thủ công` : '';
        showChamCongNotice(
            `Đã đề xuất ${proposedCount} dòng: ${proposed.X} X · ${proposed.HALF} X/2 · ${proposed.OFF} OFF${reviewText}.`,
            'success'
        );
    } else if (blankCount === 0) {
        showChamCongNotice('Các dòng đang hiển thị đều đã có trạng thái, không có ô trống để đề xuất.', 'info');
    } else {
        showChamCongNotice(`${reviewCount} dòng có thời gian từ 5 đến dưới 6 giờ hoặc dữ liệu chưa đủ rõ; hãy kiểm tra thủ công.`, 'warning');
    }
}

function updateChamCongSubmitButtonState() {
    const btn = document.getElementById('btnSubmitChamCong');
    const count = Object.keys(window.chamCongEditedRows || {}).length;

    if (btn) {
        btn.disabled = count === 0;
        if (count > 0) {
            btn.innerHTML = `💾 Nộp ${count} dòng thay đổi`;
            btn.style.background = '#10b981';
            btn.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.4)';
        } else {
            btn.innerHTML = `💾 Chưa có thay đổi`;
            btn.style.background = '#64748b';
            btn.style.boxShadow = 'none';
        }
    }
}

async function submitChamCongToGoogleSheets() {
    const updates = Object.values(window.chamCongEditedRows || {})
        .filter(item => Number.isInteger(Number(item.row_index)) && Number(item.row_index) >= 2)
        .map(item => ({
            row_index: Number(item.row_index),
            cham_cong: String(item.cham_cong || '').trim(),
            ghi_chu: String(item.ghi_chu || '').trim()
        }));

    if (updates.length === 0) {
        showChamCongNotice('Không có thay đổi nào để nộp.', 'warning');
        return;
    }

    const btn = document.getElementById('btnSubmitChamCong');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `⏳ Đang nộp ${updates.length} dòng lên Google Sheets...`;
    }

    try {
        let successMessage = '';
        try {
            const localRes = await fetch(`${LOCAL_API_BASE}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates })
            });
            if (localRes.ok) {
                const localData = await localRes.json();
                if (localData.status === 'success') successMessage = localData.message;
            }
        } catch (localError) {
            console.log('Local Server submit không khả dụng, chuyển sang Google Sheets API.', localError);
        }

        if (!successMessage) {
            const token = await getDirectAccessToken();
            const dataBatch = updates.map(item => ({
                range: `'${TARGET_SHEET}'!K${item.row_index}:L${item.row_index}`,
                values: [[item.cham_cong, item.ghi_chu]]
            }));
            const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchUpdate`;
            const res = await fetch(batchUrl, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ valueInputOption: 'USER_ENTERED', data: dataBatch })
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error?.message || `Lỗi Sheets API ${res.status}`);
            }
            successMessage = `Đã nộp thành công ${updates.length} dòng.`;
        }

        window.chamCongEditedRows = {};
        showChamCongNotice(`✅ ${successMessage}`, 'success');
        await fetchChamCongData();
    } catch (err) {
        console.error("Lỗi nộp chấm công:", err);
        showChamCongNotice(`❌ Lỗi nộp chấm công: ${err.message}`, 'warning');
    } finally {
        if (btn) {
            btn.disabled = false;
            updateChamCongSubmitButtonState();
        }
    }
}
