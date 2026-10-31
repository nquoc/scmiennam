// --- CORE GLOBAL STATE AND SWITCHERS ---
const API_URL = "https://script.google.com/macros/s/AKfycbyybJYA4MGgdvXJWLattzfoFYuFWPWz9gXf1-pHAEJDwK0k1VMua5WSz_azYuIWsq-y/exec"; 

let currentTab = 'data';
let cacheData = { 'data': null, 'atcdalam': null, 'thongke': null, 'hieusuat': null, 'ngaycong': null, 'kpi': null };
let allData = [];

// Global Chart instances to avoid chart canvas reuse error
let chartThongKeProvInstance = null;
let chartThongKeTrendInstance = null;
let chartPivotDaLamTotalATCInstance = null;
let chartPivotDaLamAvgATCDayInstance = null;
let chartPivotDaLamAvgTimeDayInstance = null;

// Active view modes ('list' or 'chart')
let viewModeThongKe = 'list';

// Pivot Workspace Treo State
var pivotRows = [];
var pivotCols = [];
var pivotVals = [];
var pivotRawData = [];
var pivotFilteredData = [];
var dragSrcField = null;
var isPivotTreoVisible = false;

// Pivot Workspace Đã làm State
var pivotDaLamRawData = [];
var pivotDaLamFilteredData = [];
var pivotDaLamRows = [];
var pivotDaLamCols = [];
var pivotDaLamVals = [];
var dragSrcFieldPivotDaLam = null;

// Workday Summary Sorting State
var summarySortColumn = null;
var summarySortDirection = 'asc';

window.onload = function() {
    switchTab('pivotdalam');
    // Chạy ngầm tải trước các tab khác sau 1.5 giây để tránh làm chậm lần đầu load trang
    if (typeof prefetchTabsBackground === 'function') {
        setTimeout(prefetchTabsBackground, 1500);
    }
};

function switchTab(tabName) {
    currentTab = tabName;
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');

    document.getElementById('dashboardData').classList.add('hidden');
    document.getElementById('dashboardATC').classList.add('hidden');
    document.getElementById('filtersData').classList.add('hidden');
    document.getElementById('filtersATC').classList.add('hidden');
    document.getElementById('pivotWorkspace').classList.add('hidden');
    document.getElementById('btnCopyReport').classList.add('hidden');
    document.getElementById('filtersThongKe').classList.add('hidden');
    if (document.getElementById('viewModeThongKe')) document.getElementById('viewModeThongKe').classList.add('hidden');
    if (document.getElementById('chartsThongKe')) document.getElementById('chartsThongKe').classList.add('hidden');
    if (document.getElementById('pivotDaLamWorkspace')) document.getElementById('pivotDaLamWorkspace').classList.add('hidden');
    if (document.getElementById('filtersPivotDaLam')) document.getElementById('filtersPivotDaLam').classList.add('hidden');
    if (document.getElementById('filtersKPI')) document.getElementById('filtersKPI').classList.add('hidden');
    if (document.getElementById('aiAnalysisTreoContainer')) document.getElementById('aiAnalysisTreoContainer').classList.add('hidden');
    if (document.getElementById('aiAnalysisPivotDaLamContainer')) document.getElementById('aiAnalysisPivotDaLamContainer').classList.add('hidden');
    if (document.getElementById('aiAnalysisKPIContainer')) document.getElementById('aiAnalysisKPIContainer').classList.add('hidden');
    if (document.getElementById('togglePivotWorkspaceContainer')) document.getElementById('togglePivotWorkspaceContainer').classList.add('hidden');
    if (document.getElementById('leaderTabContent')) document.getElementById('leaderTabContent').classList.add('hidden');
    if (document.getElementById('weeklyReportContent')) document.getElementById('weeklyReportContent').classList.add('hidden');
    if (document.getElementById('dashboardChamCong')) document.getElementById('dashboardChamCong').classList.add('hidden');
    
    document.querySelector('.search-section').classList.remove('hidden');
    document.querySelector('.status-text').classList.remove('hidden');
    document.getElementById('searchInput').classList.remove('hidden');
    document.getElementById('searchBtn').classList.remove('hidden');
    
    document.getElementById('tableHead').innerHTML = '';
    document.getElementById('tableBody').innerHTML = '';
    document.getElementById('recordCount').innerText = '0';
    document.getElementById('activeFilters').innerHTML = '';
    if (window.lastUpdateTimestamp) {
        document.getElementById('lastUpdated').innerText = '🕒 ' + window.lastUpdateTimestamp;
    } else {
        document.getElementById('lastUpdated').innerText = '';
    }
    document.getElementById('dataTable').style.display = 'none';
    document.getElementById('dataTable').classList.remove('pivot-style');
    document.getElementById('dataTable').classList.remove('kpi-style');

    if (tabName === 'pivotdalam') {
        if (document.getElementById('filtersPivotDaLam')) document.getElementById('filtersPivotDaLam').classList.remove('hidden');
        document.getElementById('searchInput').classList.add('hidden');
        document.getElementById('searchBtn').classList.add('hidden');
        document.querySelector('.status-text').classList.add('hidden');
        if (document.getElementById('pivotDaLamWorkspace')) document.getElementById('pivotDaLamWorkspace').classList.remove('hidden');
        if (document.getElementById('aiAnalysisPivotDaLamContainer')) document.getElementById('aiAnalysisPivotDaLamContainer').classList.remove('hidden');
        
        if (!cacheData['ngaycong']) {
            const cachedNC = getFromSessionCache('ngaycong');
            if (cachedNC) {
                cacheData['ngaycong'] = typeof normalizeNgayCongData === 'function' ? normalizeNgayCongData(cachedNC) : cachedNC;
            }
        }
        
        if (cacheData['hieusuat'] && cacheData['ngaycong']) {
            if (typeof onPivotDaLamDataLoaded === 'function') onPivotDaLamDataLoaded(cacheData['hieusuat']);
        } else {
            const cachedHieuSuat = getFromSessionCache('hieusuat');
            const cachedNgayCong = getFromSessionCache('ngaycong');
            if (cachedHieuSuat && cachedNgayCong) {
                cacheData['hieusuat'] = cachedHieuSuat;
                cacheData['ngaycong'] = typeof normalizeNgayCongData === 'function' ? normalizeNgayCongData(cachedNgayCong) : cachedNgayCong;
                if (typeof onPivotDaLamDataLoaded === 'function') onPivotDaLamDataLoaded(cachedHieuSuat);
            } else {
                if (typeof fetchPivotDaLamData === 'function') fetchPivotDaLamData();
            }
        }
    } else if (tabName === 'leader') {
        document.getElementById('searchInput').classList.add('hidden');
        document.getElementById('searchBtn').classList.add('hidden');
        document.querySelector('.search-section').classList.add('hidden');
        document.querySelector('.status-text').classList.add('hidden');
        if (document.getElementById('leaderTabContent')) document.getElementById('leaderTabContent').classList.remove('hidden');
        
        if (cacheData['hieusuat'] && cacheData['hieusuat'].length > 0) {
            if (typeof initLeaderTab === 'function') initLeaderTab();
        } else {
            const cachedHieuSuat = getFromSessionCache('hieusuat');
            const cachedNgayCong = getFromSessionCache('ngaycong');
            if (cachedHieuSuat && cachedNgayCong) {
                cacheData['hieusuat'] = cachedHieuSuat;
                cacheData['ngaycong'] = typeof normalizeNgayCongData === 'function' ? normalizeNgayCongData(cachedNgayCong) : cachedNgayCong;
                if (typeof initLeaderTab === 'function') initLeaderTab();
            } else {
                if (typeof initLeaderTab === 'function') initLeaderTab();
                if (typeof fetchPivotDaLamData === 'function') fetchPivotDaLamData();
            }
        }
    } else if (tabName === 'baocao') {
        document.getElementById('searchInput').classList.add('hidden');
        document.getElementById('searchBtn').classList.add('hidden');
        document.querySelector('.search-section').classList.add('hidden');
        document.querySelector('.status-text').classList.add('hidden');
        if (document.getElementById('weeklyReportContent')) document.getElementById('weeklyReportContent').classList.remove('hidden');
        if (typeof initWeeklyReportTab === 'function') initWeeklyReportTab();
    } else if (tabName === 'chamcong') {
        document.getElementById('searchInput').classList.add('hidden');
        document.getElementById('searchBtn').classList.add('hidden');
        document.querySelector('.search-section').classList.add('hidden');
        document.querySelector('.status-text').classList.add('hidden');
        if (document.getElementById('dashboardChamCong')) document.getElementById('dashboardChamCong').classList.remove('hidden');
        if (typeof initChamCongTab === 'function') initChamCongTab();
    } else {
        if (cacheData[tabName]) {
            onDataLoaded(cacheData[tabName]);
        } else {
            const cached = getFromSessionCache(tabName);
            if (cached) {
                cacheData[tabName] = cached;
                onDataLoaded(cached);
            } else {
                fetchData(tabName);
            }
        }
    }
}

function fetchData(tabName) {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('loading').innerText = "⏳ CHỜ XÍU ĐANG KẾT NỐI VỚI DATABASE (Lần đầu load tab " + tabName + " có thể mất tới 5 giây)...";
    
    let fetchUrl = API_URL + "?sheet=" + (tabName === 'kpi' ? 'KPI' : tabName);
    if (tabName === 'thongke') {
        fetchUrl += "&range=K3:AQ11";
    } else if (tabName === 'kpi') {
        fetchUrl += "&range=A16:O27";
    }
    
    fetch(fetchUrl)
        .then(response => response.json())
        .then(result => {
            if(result.status === "success") {
                cacheData[tabName] = result.data;
                saveToSessionCache(tabName, result.data);
                onDataLoaded(result.data);
            } else {
                document.getElementById('loading').innerText = "❌ Lỗi: " + result.message;
            }
        })
        .catch(error => {
            document.getElementById('loading').innerText = "❌ Không thể kết nối tới Google Sheets!";
        });
}

function cleanCorruptedKeys(records) {
    if (!Array.isArray(records) || records.length === 0) return records;
    const standardHeaders = [
        'Retailer ID', 'Người tạo', 'Tỉnh/Thành phố', 'Xã/Phường/Thị trấn',
        'Nguồn data', 'Mô tả', 'Ngành hàng', 'Địa điểm', 'Loại công việc',
        'Người xử lý', 'Thời gian tạo', 'SLA', 'Thuộc KV QUỐC'
    ];
    return records.map(row => {
        const cleanedRow = {};
        Object.keys(row).forEach(key => {
            let matchedHeader = standardHeaders.find(h => key.startsWith(h));
            if (matchedHeader) {
                cleanedRow[matchedHeader] = row[key];
            } else {
                cleanedRow[key] = row[key];
            }
        });
        return cleanedRow;
    });
}

function onDataLoaded(data) {
    if (Array.isArray(data)) {
        data = cleanCorruptedKeys(data);
    }
    if (currentTab === 'thongke') {
        allData = data;
        document.getElementById('loading').style.display = 'none';
        document.getElementById('filtersThongKe').classList.remove('hidden');
        document.getElementById('searchInput').classList.add('hidden');
        if (document.getElementById('viewModeThongKe')) document.getElementById('viewModeThongKe').classList.remove('hidden');
        
        if (typeof setupFiltersThongKe === 'function') setupFiltersThongKe(allData);
        if (typeof applyFiltersThongKe === 'function') applyFiltersThongKe();
        return;
    }
    
    allData = data.map(row => {
        if (row['Người xử lý']) {
            let parts = String(row['Người xử lý']).split('-');
            if (parts.length >= 2) {
                row['Người xử lý'] = parts[1].trim();
            }
        }
        
        ['Thời gian checkin', 'Thời gian checkout', 'Thời gian tạo'].forEach(col => {
            if (row[col]) {
                let t = String(row[col]).trim();
                if (t.includes('T') && t.endsWith('Z')) {
                    let d = new Date(t);
                    if (!isNaN(d)) {
                        let dd = String(d.getDate()).padStart(2, '0');
                        let mm = String(d.getMonth() + 1).padStart(2, '0');
                        let yyyy = d.getFullYear();
                        row[col] = `${dd}/${mm}/${yyyy}`;
                    }
                } else if (t.includes(' ') && t.includes('/')) {
                    row[col] = t.split(' ')[0];
                }
            }
        });
        
        return row;
    });
    document.getElementById('loading').style.display = 'none';
    
    if (allData.length > 0) {
        const updateKey = typeof getUpdateTimestamp === 'function' ? getUpdateTimestamp(allData) : Object.keys(allData[0]).find(k => k.toUpperCase().includes("UPDATE"));
        if (updateKey) {
            window.lastUpdateTimestamp = updateKey;
            document.getElementById('lastUpdated').innerText = '🕒 ' + updateKey;
        } else if (window.lastUpdateTimestamp) {
            document.getElementById('lastUpdated').innerText = '🕒 ' + window.lastUpdateTimestamp;
        } else {
            document.getElementById('lastUpdated').innerText = '';
        }
    }
    
    if (currentTab === 'data') {
        document.getElementById('dashboardData').classList.remove('hidden');
        document.getElementById('filtersData').classList.remove('hidden');
        document.getElementById('searchInput').classList.remove('hidden');
        
        if (document.getElementById('aiAnalysisTreoContainer')) document.getElementById('aiAnalysisTreoContainer').classList.remove('hidden');
        if (document.getElementById('togglePivotWorkspaceContainer')) document.getElementById('togglePivotWorkspaceContainer').classList.remove('hidden');
        
        if (typeof initPivotWorkspace === 'function') {
            initPivotWorkspace(allData);
        }
        
        if (typeof runAITreoAnalysis === 'function') {
            runAITreoAnalysis(false);
        }
        
        const builder = document.getElementById('pivotWorkspace');
        const btn = document.getElementById('btnTogglePivotWorkspace');
        if (builder && btn) {
            if (window.isPivotTreoVisible) {
                builder.classList.remove('hidden');
                btn.innerHTML = '⚙️ Tùy biến Pivot Table (Ẩn)';
                btn.classList.remove('collapsed');
            } else {
                builder.classList.add('hidden');
                btn.innerHTML = '⚙️ Tùy biến Pivot Table (Hiện)';
                btn.classList.add('collapsed');
            }
        }
    } else if (currentTab === 'atcdalam') {
        document.getElementById('dashboardATC').classList.remove('hidden');
        document.getElementById('filtersATC').classList.remove('hidden');
        document.getElementById('searchInput').classList.add('hidden');
        document.getElementById('btnCopyReport').classList.remove('hidden');
    } else if (currentTab === 'kpi') {
        if (document.getElementById('filtersKPI')) document.getElementById('filtersKPI').classList.remove('hidden');
        if (document.getElementById('aiAnalysisKPIContainer')) document.getElementById('aiAnalysisKPIContainer').classList.remove('hidden');
        if (typeof runAIKPIAnalysis === 'function') {
            runAIKPIAnalysis(false);
        }
    }
    
    document.getElementById('dataTable').style.display = 'table';
    document.getElementById('dataTable').classList.remove('pivot-style');
    
    if (typeof setupFilters === 'function') setupFilters(allData);
    if (typeof renderDashboard === 'function') renderDashboard(allData);
    if (typeof applyFilters === 'function') applyFilters();
}

// --- Theme Toggle Logic ---
function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark-theme');
    const themeIcon = document.querySelector('.theme-icon');
    if (isDark) {
        document.documentElement.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
        if (themeIcon) themeIcon.innerText = '🌙';
    } else {
        document.documentElement.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
        if (themeIcon) themeIcon.innerText = '☀️';
    }
    
    // Redraw charts if view mode is chart
    if (currentTab === 'thongke' && viewModeThongKe === 'chart' && cacheData['thongke']) {
        if (typeof applyFiltersThongKe === 'function') applyFiltersThongKe();
    } else if (currentTab === 'pivotdalam' && cacheData['hieusuat']) {
        if (typeof applyFiltersPivotDaLam === 'function') applyFiltersPivotDaLam();
    } else if (currentTab === 'leader' && cacheData['hieusuat']) {
        if (typeof initLeaderTab === 'function') initLeaderTab();
    }
}

// Sync theme icon on load
(function() {
    const savedTheme = localStorage.getItem('theme');
    const icon = document.querySelector('.theme-icon');
    if (icon) {
        if (savedTheme === 'dark') {
            icon.innerText = '☀️';
        } else {
            icon.innerText = '🌙';
        }
    }
})();

function closeModal() {
    document.getElementById('detailModal').style.display = 'none';
}

function closePivotListModal() {
    document.getElementById('pivotListModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('detailModal');
    const listModal = document.getElementById('pivotListModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
    if (event.target == listModal) {
        listModal.style.display = "none";
    }
}

function openDetailFromPivot(idx) {
    const detailData = window.pivotDetailList[idx];
    if (!detailData) return;
    
    let detailHtml = '';
    for (const [key, value] of Object.entries(detailData)) {
        if (typeof isUpdateKey === 'function' ? isUpdateKey(key) : key.toUpperCase().includes("UPDATE")) continue;
        detailHtml += `
            <div class="detail-item">
                <span class="detail-label">${key}</span>
                <span class="detail-value">${value !== "" ? value : "<em style='color:#9ca3af;'>Chưa cập nhật</em>"}</span>
            </div>
        `;
    }

    document.getElementById('modalBody').innerHTML = detailHtml;
    document.getElementById('detailModal').style.display = 'flex';
}

function forceRefreshData() {
    const btn = document.getElementById('refreshBtn');
    if (btn) {
        btn.classList.add('rotating');
        btn.disabled = true;
    }
    
    // Xóa toàn bộ cache trong sessionStorage liên quan đến dashboard
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(API_CACHE_KEY_PREFIX)) {
            sessionStorage.removeItem(key);
            i--; // Giảm chỉ số vì length giảm sau khi xóa
        }
    }
    
    // Reset bộ nhớ cache trong biến js
    cacheData = { 'data': null, 'atcdalam': null, 'thongke': null, 'hieusuat': null, 'ngaycong': null };
    
    // Tải lại dữ liệu cho tab hiện tại
    let tabName = currentTab;
    
    // Định nghĩa hàm hoàn thành load để khôi phục trạng thái nút
    const restoreBtn = () => {
        setTimeout(() => {
            if (btn) {
                btn.classList.remove('rotating');
                btn.disabled = false;
            }
        }, 800);
    };

    if (tabName === 'pivotdalam') {
        if (typeof fetchPivotDaLamData === 'function') {
            fetchPivotDaLamData();
        }
        restoreBtn();
    } else {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('loading').innerText = "⏳ ĐANG LÀM MỚI VÀ KẾT NỐI DATABASE...";
        
        let fetchUrl = API_URL + "?sheet=" + tabName;
        if (tabName === 'thongke') {
            fetchUrl += "&range=K3:AQ11";
        }
        
        fetch(fetchUrl)
            .then(response => response.json())
            .then(result => {
                if(result.status === "success") {
                    cacheData[tabName] = result.data;
                    saveToSessionCache(tabName, result.data);
                    onDataLoaded(result.data);
                } else {
                    document.getElementById('loading').innerText = "❌ Lỗi: " + result.message;
                }
                restoreBtn();
            })
            .catch(error => {
                document.getElementById('loading').innerText = "❌ Không thể kết nối tới Google Sheets!";
                restoreBtn();
            });
    }

    // Chạy ngầm tải trước các tab khác sau khi xóa cache
    if (typeof prefetchTabsBackground === 'function') {
        setTimeout(prefetchTabsBackground, 2000);
    }
}

function prefetchTabsBackground() {
    if (!cacheData['data']) {
        const cached = getFromSessionCache('data');
        if (cached) {
            cacheData['data'] = cached;
            if (typeof getUpdateTimestamp === 'function') {
                const updateKey = getUpdateTimestamp(cached);
                if (updateKey) {
                    window.lastUpdateTimestamp = updateKey;
                    const el = document.getElementById('lastUpdated');
                    if (el) el.innerText = '🕒 ' + updateKey;
                }
            }
        } else {
            fetch(API_URL + "?sheet=data")
                .then(res => res.json())
                .then(result => {
                    if (result.status === "success" && result.data) {
                        cacheData['data'] = result.data;
                        saveToSessionCache('data', result.data);
                        if (typeof getUpdateTimestamp === 'function') {
                            const updateKey = getUpdateTimestamp(result.data);
                            if (updateKey) {
                                window.lastUpdateTimestamp = updateKey;
                                const el = document.getElementById('lastUpdated');
                                if (el) el.innerText = '🕒 ' + updateKey;
                            }
                        }
                    }
                })
                .catch(() => {});
        }
    }
}

