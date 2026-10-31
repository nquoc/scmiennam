// --- TAB PIVOT DATA ĐÃ LÀM ---
let staffTotalActiveDaysMap = {};
let staffFilteredActiveDaysMap = {};

// Danh sách nhân sự mặc định từ Sheet 'Chi tiết công MN (Tỉnh & HCM)'!B502:O519 phòng hờ mạng lỗi
const DEFAULT_ATTENDANCE_B502_O519 = [
    { 'Tên NS': '8458 - Đặng Duy Khương - Customer Success - CTO', 'Mã NV': 'CT00464', 'T công': 3.5, 'Tổng ATC': 29, 'Tổng Điểm': 111, 'Tổng Impact': 22 },
    { 'Tên NS': '8466 - Lê Cao Minh Đức - Customer Success - CTO', 'Mã NV': 'CT00475', 'T công': 5.0, 'Tổng ATC': 39, 'Tổng Điểm': 63, 'Tổng Impact': 18 },
    { 'Tên NS': '8470 - Lương Trọng Đạo - Customer Success - CTO', 'Mã NV': 'CT00474', 'T công': 5.0, 'Tổng ATC': 32, 'Tổng Điểm': 110, 'Tổng Impact': 23 },
    { 'Tên NS': '8460 - Lê Minh Hiển - Customer Success - CTO', 'Mã NV': 'CT00470', 'T công': 3.0, 'Tổng ATC': 36, 'Tổng Điểm': 73, 'Tổng Impact': 21 },
    { 'Tên NS': '8461 - Trịnh Đức Phong - Customer Success - LĐG', 'Mã NV': 'LĐ00144', 'T công': 6.0, 'Tổng ATC': 49, 'Tổng Điểm': 54, 'Tổng Impact': 22 },
    { 'Tên NS': '8489 - Nguyễn Hà Anh Vũ - Customer Success - LĐG', 'Mã NV': 'LĐ00158', 'T công': 6.0, 'Tổng ATC': 51, 'Tổng Điểm': 90, 'Tổng Impact': 22 },
    { 'Tên NS': '8178 - Phan Ngọc Nguyên - Customer Success - BĐH', 'Mã NV': 'ĐN00286', 'T công': 5.5, 'Tổng ATC': 52, 'Tổng Điểm': 109, 'Tổng Impact': 36 },
    { 'Tên NS': '8469 - Nguyễn Hưng Hải - Customer Success - GLI', 'Mã NV': 'GL00146', 'T công': 5.0, 'Tổng ATC': 55, 'Tổng Điểm': 68, 'Tổng Impact': 35 },
    { 'Tên NS': '8484 - Trần Thanh Nam - Customer Success - VTU', 'Mã NV': 'VT00157', 'T công': 5.0, 'Tổng ATC': 37, 'Tổng Điểm': 43, 'Tổng Impact': 14 },
    { 'Tên NS': '8467 - Nguyễn Thành Đạt - Customer Success', 'Mã NV': 'SG02817', 'T công': 4.5, 'Tổng ATC': 37, 'Tổng Điểm': 27, 'Tổng Impact': 6 },
    { 'Tên NS': '8440 - Doãn Việt Tùng - Customer Success - SGN', 'Mã NV': 'SG02390', 'T công': 4.5, 'Tổng ATC': 37, 'Tổng Điểm': 47, 'Tổng Impact': 14 },
    { 'Tên NS': '8447 - Võ Khánh Duy - Customer Success - SGN', 'Mã NV': 'SG02388', 'T công': 5.5, 'Tổng ATC': 39, 'Tổng Điểm': 87, 'Tổng Impact': 10 },
    { 'Tên NS': '8437 - Nguyễn Đoàn Hưng Phát - Customer Success - SGN', 'Mã NV': 'SG02379', 'T công': 4.5, 'Tổng ATC': 44, 'Tổng Điểm': 84, 'Tổng Impact': 21 },
    { 'Tên NS': '8231 - Thượng Thái Hiếu - Customer Success - SGN', 'Mã NV': 'SG01485', 'T công': 5.5, 'Tổng ATC': 36, 'Tổng Điểm': 95, 'Tổng Impact': 20 },
    { 'Tên NS': '8448 - Nguyễn Đỗ Nhật Minh - Customer Success', 'Mã NV': 'SG02818', 'T công': 5.5, 'Tổng ATC': 40, 'Tổng Điểm': 65, 'Tổng Impact': 20 },
    { 'Tên NS': '8462 - Nguyễn Hoàng Khang - Customer Success', 'Mã NV': 'SG02829', 'T công': 5.0, 'Tổng ATC': 48, 'Tổng Điểm': 67, 'Tổng Impact': 16 }
];

async function fetchAttendanceDataForPivot() {
    // 1. Kiểm tra cacheData / sessionCache trước
    if (cacheData['ngaycong'] && Array.isArray(cacheData['ngaycong']) && cacheData['ngaycong'].length > 0) {
        return cacheData['ngaycong'];
    }
    if (typeof getFromSessionCache === 'function') {
        const sCached = getFromSessionCache('ngaycong');
        if (sCached && Array.isArray(sCached) && sCached.length > 0) {
            return sCached;
        }
    }

    // 2. Thử Local Server nếu đang chạy
    try {
        const localRes = await fetch('http://localhost:3001/api/chamcong/monthly');
        if (localRes.ok) {
            const json = await localRes.json();
            if (json.status === 'success' && Array.isArray(json.data) && json.data.length >= 2) {
                const list = [];
                for (let i = 1; i < json.data.length; i++) {
                    const r = json.data[i];
                    if (r && r[0] && r[0] !== 'TỔNG CỘNG') {
                        list.push({
                            'Tên NS': r[0],
                            'Họ và tên': r[0],
                            'Mã NV': r[1] || '',
                            'T công': parseFloat(r[2]) || 0,
                            'T phép': parseFloat(r[3]) || 0,
                            'T OFF': parseFloat(r[4]) || 0,
                            'Tổng ATC': parseFloat(r[8]) || 0,
                            'Tổng giờ làm': parseFloat(r[9]) || 0,
                            'Tổng Điểm': parseFloat(r[10]) || 0,
                            'Tổng Impact': parseFloat(r[12]) || 0
                        });
                    }
                }
                if (list.length > 0) return list;
            }
        }
    } catch (e) {}

    // 3. Thử Google Sheets API trực tiếp bằng Service Account Token (Chạy trên GitHub Pages không cần server)
    if (typeof getDirectAccessToken === 'function') {
        try {
            const token = await getDirectAccessToken();
            const sId = typeof SPREADSHEET_ID !== 'undefined' ? SPREADSHEET_ID : '1mEuMm3Pntsn3HenWQ33aNlRG50W9daVM5HjrV9pmxY8';
            const tSheet = typeof TARGET_SHEET !== 'undefined' ? TARGET_SHEET : 'Chi tiết công MN (Tỉnh & HCM)';
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${sId}/values/'${encodeURIComponent(tSheet)}'!B502:O519`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const json = await res.json();
                const rows = json.values || [];
                if (rows.length >= 2) {
                    const list = [];
                    for (let i = 1; i < rows.length; i++) {
                        const r = rows[i];
                        if (r && r[0] && r[0] !== 'TỔNG CỘNG') {
                            list.push({
                                'Tên NS': r[0],
                                'Họ và tên': r[0],
                                'Mã NV': r[1] || '',
                                'T công': parseFloat(r[2]) || 0,
                                'T phép': parseFloat(r[3]) || 0,
                                'T OFF': parseFloat(r[4]) || 0,
                                'Tổng ATC': parseFloat(r[8]) || 0,
                                'Tổng giờ làm': parseFloat(r[9]) || 0,
                                'Tổng Điểm': parseFloat(r[10]) || 0,
                                'Tổng Impact': parseFloat(r[12]) || 0
                            });
                        }
                    }
                    if (list.length > 0) {
                        window.chamCongMonthlyData = rows;
                        return list;
                    }
                }
            }
        } catch (e) {
            console.warn("Direct Sheets API fetch warning:", e);
        }
    }

    // 4. Thử Google Apps Script API_URL + "?sheet=ngaycong"
    try {
        const gasRes = await fetch(API_URL + "?sheet=ngaycong");
        if (gasRes.ok) {
            const json = await gasRes.json();
            if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
                return typeof normalizeNgayCongData === 'function' ? normalizeNgayCongData(json.data) : json.data;
            }
        }
    } catch (e) {}

    // 5. Trả về danh sách mặc định B502:O519 để đảm bảo luôn hiển thị đầy đủ
    return DEFAULT_ATTENDANCE_B502_O519;
}

async function fetchPivotDaLamData() {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.style.display = 'block';
        loadingEl.innerText = "⏳ Đang tải Dữ liệu Đã làm và Ngày công để phân tích (Có thể mất vài giây)...";
    }
    
    try {
        const [resHieuSuat, attendanceData] = await Promise.all([
            fetch(API_URL + "?sheet=hieusuat").then(response => response.json()).catch(err => ({ status: 'error', message: err.message })),
            fetchAttendanceDataForPivot()
        ]);

        if (loadingEl) loadingEl.style.display = 'none';

        if (resHieuSuat && resHieuSuat.status === "success") {
            const rawHieuSuat = resHieuSuat.data || [];
            const cleanHieuSuat = typeof isValidHieuSuatRow === 'function' ? rawHieuSuat.filter(isValidHieuSuatRow) : rawHieuSuat;
            cacheData['hieusuat'] = cleanHieuSuat;
            if (typeof saveToSessionCache === 'function') saveToSessionCache('hieusuat', cleanHieuSuat);
        } else {
            if (loadingEl) loadingEl.innerText = "❌ Lỗi: " + (resHieuSuat?.message || "Không thể tải Dữ liệu Đã làm");
            return;
        }

        if (attendanceData && Array.isArray(attendanceData) && attendanceData.length > 0) {
            cacheData['ngaycong'] = attendanceData;
            if (typeof saveToSessionCache === 'function') saveToSessionCache('ngaycong', attendanceData);
        } else if (!cacheData['ngaycong'] || cacheData['ngaycong'].length === 0) {
            cacheData['ngaycong'] = DEFAULT_ATTENDANCE_B502_O519;
        }

        onPivotDaLamDataLoaded(cacheData['hieusuat']);
    } catch (error) {
        if (loadingEl) loadingEl.innerText = "❌ Không thể kết nối tới Google Sheets!";
        console.error("fetchPivotDaLamData error:", error);
    }
}

function onPivotDaLamDataLoaded(rawInputData) {
    const data = typeof isValidHieuSuatRow === 'function' ? (rawInputData || []).filter(isValidHieuSuatRow) : (rawInputData || []);
    cacheData['hieusuat'] = data;
    if (cacheData['ngaycong'] && Array.isArray(cacheData['ngaycong'])) {
        cacheData['ngaycong'] = typeof normalizeNgayCongData === 'function' ? normalizeNgayCongData(cacheData['ngaycong']) : cacheData['ngaycong'];
    }
    let cleanedData = data.map(row => {
        let newRow = {...row};
        if (newRow['Người xử lý']) {
            let parts = String(newRow['Người xử lý']).split('-');
            if (parts.length >= 2) {
                newRow['Người xử lý'] = parts[1].trim();
            }
        }
        if (newRow['Người tạo']) {
            let parts = String(newRow['Người tạo']).split('-');
            if (parts.length >= 2) {
                newRow['Người tạo'] = parts[1].trim();
            }
        }
        return newRow;
    });
    
    pivotDaLamRawData = cleanedData;
    
    if (cleanedData.length > 0) {
        const updateKey = typeof getUpdateTimestamp === 'function' ? getUpdateTimestamp(cleanedData) : Object.keys(cleanedData[0]).find(k => k.toUpperCase().includes("UPDATE"));
        if (updateKey) {
            window.lastUpdateTimestamp = updateKey;
            document.getElementById('lastUpdated').innerText = '🕒 ' + updateKey;
        } else if (window.lastUpdateTimestamp) {
            document.getElementById('lastUpdated').innerText = '🕒 ' + window.lastUpdateTimestamp;
        }
    }
    
    if (pivotDaLamRows.length === 0 && pivotDaLamCols.length === 0 && pivotDaLamVals.length === 0) {
        pivotDaLamRows = ['Người xử lý'];
        pivotDaLamCols = ['Ngày checkin'];
        pivotDaLamVals = ['Retailer ID'];
        const aggrSelect = document.getElementById('pivotDaLamAggrType');
        if (aggrSelect) aggrSelect.value = 'count';
    }
    
    updateDropZonesUIPivotDaLam();
    setupFiltersPivotDaLam(pivotDaLamRawData);
    applyFiltersPivotDaLam();
    
    const activeReportType = localStorage.getItem('ai_dalam_active_report_type') || 'anomaly';
    if (activeReportType === 'performance') {
        if (typeof runAIPerformanceReport === 'function') {
            runAIPerformanceReport(false);
        }
    } else {
        if (typeof runAIPivotDaLamAnalysis === 'function') {
            runAIPivotDaLamAnalysis(false);
        }
    }

    if (typeof currentTab !== 'undefined' && currentTab === 'leader') {
        if (typeof initLeaderTab === 'function') initLeaderTab();
    }
}

function renderPivotDaLamFields() {
    if (!pivotDaLamRawData || pivotDaLamRawData.length === 0) return;
    
    const fieldsContainer = document.getElementById('pivotDaLamFieldsList');
    if (!fieldsContainer) return;
    fieldsContainer.innerHTML = '';
    
    const allFields = Object.keys(pivotDaLamRawData[0]).filter(f => typeof isUpdateKey === 'function' ? !isUpdateKey(f) : !f.toUpperCase().includes('UPDATE'));
    
    allFields.forEach(field => {
        const isRow = pivotDaLamRows.includes(field);
        const isCol = pivotDaLamCols.includes(field);
        
        const card = document.createElement('div');
        card.className = 'pivot-field-card';
        card.setAttribute('draggable', 'true');
        card.dataset.field = field;
        
        card.addEventListener('dragstart', handleDragStartPivotDaLam);
        
        card.innerHTML = `
            <span>☰ ${field}</span>
            <div class="pivot-field-actions">
                <button class="btn-field-add" onclick="toggleFieldQuickPivotDaLam('${field.replace(/'/g, "\\'")}', 'row')">${isRow ? '✕ H' : '+H'}</button>
                <button class="btn-field-add" onclick="toggleFieldQuickPivotDaLam('${field.replace(/'/g, "\\'")}', 'col')">${isCol ? '✕ C' : '+C'}</button>
            </div>
        `;
        fieldsContainer.appendChild(card);
    });
}

function handleDragStartPivotDaLam(e) {
    dragSrcFieldPivotDaLam = e.target.dataset.field || e.target.closest('.pivot-field-card').dataset.field;
    e.dataTransfer.setData('text/plain', dragSrcFieldPivotDaLam);
    e.dataTransfer.effectAllowed = 'move';
}

function handleDropPivotDaLam(e, targetZone) {
    e.preventDefault();
    const zone = e.target.closest('.pivot-dropzone');
    if (zone) zone.classList.remove('drag-over');
    
    const field = e.dataTransfer.getData('text/plain') || dragSrcFieldPivotDaLam;
    if (!field) return;
    
    pivotDaLamRows = pivotDaLamRows.filter(f => f !== field);
    pivotDaLamCols = pivotDaLamCols.filter(f => f !== field);
    pivotDaLamVals = pivotDaLamVals.filter(f => f !== field);
    
    if (targetZone === 'row') {
        if (!pivotDaLamRows.includes(field)) pivotDaLamRows.push(field);
    } else if (targetZone === 'col') {
        if (!pivotDaLamCols.includes(field)) pivotDaLamCols.push(field);
    } else if (targetZone === 'val') {
        pivotDaLamVals = [field];
    }
    
    updateDropZonesUIPivotDaLam();
    calculatePivotDaLam();
}

function removeFieldFromPivotDaLamZone(field, zone) {
    if (zone === 'row') {
        pivotDaLamRows = pivotDaLamRows.filter(f => f !== field);
    } else if (zone === 'col') {
        pivotDaLamCols = pivotDaLamCols.filter(f => f !== field);
    } else if (zone === 'val') {
        pivotDaLamVals = [];
    }
    updateDropZonesUIPivotDaLam();
    calculatePivotDaLam();
}

function toggleFieldQuickPivotDaLam(field, targetZone) {
    if (targetZone === 'row') {
        const idx = pivotDaLamRows.indexOf(field);
        if (idx > -1) {
            pivotDaLamRows.splice(idx, 1);
        } else {
            pivotDaLamCols = pivotDaLamCols.filter(f => f !== field);
            pivotDaLamRows.push(field);
        }
    } else if (targetZone === 'col') {
        const idx = pivotDaLamCols.indexOf(field);
        if (idx > -1) {
            pivotDaLamCols.splice(idx, 1);
        } else {
            pivotDaLamRows = pivotDaLamRows.filter(f => f !== field);
            pivotDaLamCols.push(field);
        }
    }
    updateDropZonesUIPivotDaLam();
    calculatePivotDaLam();
}

function updateDropZonesUIPivotDaLam() {
    const rowZone = document.getElementById('rowDropZonePivotDaLam');
    if (rowZone) renderZoneItemsPivotDaLam(rowZone, pivotDaLamRows, 'row', 'Kéo trường làm hàng dọc ở đây');
    
    const colZone = document.getElementById('colDropZonePivotDaLam');
    if (colZone) renderZoneItemsPivotDaLam(colZone, pivotDaLamCols, 'col', 'Kéo trường làm cột ngang ở đây');
    
    const valZone = document.getElementById('valDropZonePivotDaLam');
    if (valZone) renderZoneItemsPivotDaLam(valZone, pivotDaLamVals, 'val', 'Kéo trường tính toán ở đây');
    
    renderPivotDaLamFields();
}

function renderZoneItemsPivotDaLam(zoneElement, itemsArray, zoneName, placeholder) {
    if (itemsArray.length === 0) {
        zoneElement.innerHTML = `<div class="placeholder-text">${placeholder}</div>`;
        return;
    }
    
    zoneElement.innerHTML = '';
    itemsArray.forEach(item => {
        const badge = document.createElement('div');
        badge.className = 'pivot-dropped-item';
        badge.innerHTML = `
            <span>${item}</span>
            <button class="remove-btn" onclick="removeFieldFromPivotDaLamZone('${item.replace(/'/g, "\\'")}', '${zoneName}')">×</button>
        `;
        zoneElement.appendChild(badge);
    });
}

// Helper to format ISO dates to YYYY-MM-DD
function formatDateToYYYYMMDD(dateStrOrObj) {
    if (!dateStrOrObj) return "";
    const d = new Date(dateStrOrObj);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Helper to format YYYY-MM-DD to DD/MM/YYYY
function formatYYYYMMDDtoDDMMYYYY(dateStr) {
    if (!dateStr) return "";
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}

function setupFiltersPivotDaLam(data) {
    if (!data || data.length === 0) return;

    // 1. Nạp Nhan su checkboxes
    const staffs = [...new Set(data.map(item => item['Người xử lý']).filter(Boolean))].sort();
    const staffOptions = document.getElementById('staffFilterPivotDaLamOptions');
    if (staffOptions) {
        staffOptions.innerHTML = `
            <div class="multiselect-option select-all-option">
                <input type="checkbox" id="staff_opt_all" onchange="toggleSelectAll('staffFilterPivotDaLamContainer', 'staffFilterPivotDaLamOptions', this, '👨‍💼 Nhân sự')">
                <label for="staff_opt_all" style="font-weight: bold; color: #3b82f6;">Chọn tất cả</label>
            </div>
            <div style="border-bottom: 1px solid #e2e8f0; margin: 4px 0; opacity: 0.5;"></div>
        `;
        staffs.forEach((s, idx) => {
            staffOptions.innerHTML += `
                <div class="multiselect-option">
                    <input type="checkbox" id="staff_opt_${idx}" value="${s}" onchange="onMultiselectCheckboxChange('staffFilterPivotDaLamContainer', 'staffFilterPivotDaLamOptions', 'staff_opt_all', '👨‍💼 Nhân sự')">
                    <label for="staff_opt_${idx}">${s}</label>
                </div>
            `;
        });
    }

    // 1b. Nạp Người tạo checkboxes
    const creators = [...new Set(data.map(item => item['Người tạo']).filter(Boolean))].sort();
    const creatorOptions = document.getElementById('creatorFilterPivotDaLamOptions');
    if (creatorOptions) {
        creatorOptions.innerHTML = `
            <div class="multiselect-option select-all-option">
                <input type="checkbox" id="creator_opt_all" onchange="toggleSelectAll('creatorFilterPivotDaLamContainer', 'creatorFilterPivotDaLamOptions', this, '✍️ Người tạo')">
                <label for="creator_opt_all" style="font-weight: bold; color: #3b82f6;">Chọn tất cả</label>
            </div>
            <div style="border-bottom: 1px solid #e2e8f0; margin: 4px 0; opacity: 0.5;"></div>
        `;
        creators.forEach((c, idx) => {
            creatorOptions.innerHTML += `
                <div class="multiselect-option">
                    <input type="checkbox" id="creator_opt_${idx}" value="${c}" onchange="onMultiselectCheckboxChange('creatorFilterPivotDaLamContainer', 'creatorFilterPivotDaLamOptions', 'creator_opt_all', '✍️ Người tạo')">
                    <label for="creator_opt_${idx}">${c}</label>
                </div>
            `;
        });
    }
    
    // 2. Nạp Nguồn data checkboxes
    const sources = [...new Set(data.map(item => item['Nguồn data']).filter(Boolean))].sort();
    const sourceOptions = document.getElementById('sourceFilterPivotDaLamOptions');
    if (sourceOptions) {
        sourceOptions.innerHTML = `
            <div class="multiselect-option select-all-option">
                <input type="checkbox" id="source_opt_all" onchange="toggleSelectAll('sourceFilterPivotDaLamContainer', 'sourceFilterPivotDaLamOptions', this, '🏢 Nguồn data')">
                <label for="source_opt_all" style="font-weight: bold; color: #3b82f6;">Chọn tất cả</label>
            </div>
            <div style="border-bottom: 1px solid #e2e8f0; margin: 4px 0; opacity: 0.5;"></div>
        `;
        sources.forEach((s, idx) => {
            sourceOptions.innerHTML += `
                <div class="multiselect-option">
                    <input type="checkbox" id="source_opt_${idx}" value="${s}" onchange="onMultiselectCheckboxChange('sourceFilterPivotDaLamContainer', 'sourceFilterPivotDaLamOptions', 'source_opt_all', '🏢 Nguồn data')">
                    <label for="source_opt_${idx}">${s}</label>
                </div>
            `;
        });
    }
    
    // Reset triggers text
    updateMultiselectTriggerText('staffFilterPivotDaLamContainer', 'staffFilterPivotDaLamOptions', '👨‍💼 Nhân sự');
    updateMultiselectTriggerText('creatorFilterPivotDaLamContainer', 'creatorFilterPivotDaLamOptions', '✍️ Người tạo');
    updateMultiselectTriggerText('sourceFilterPivotDaLamContainer', 'sourceFilterPivotDaLamOptions', '🏢 Nguồn data');
    updateMultiselectTriggerText('impactFilterPivotDaLamContainer', 'impactFilterPivotDaLamOptions', '✨ Impact');

    // 3. Nạp khoảng ngày cho Flatpickr Date Range Picker
    const dates = data.map(item => {
        const timeIn = item['Thời gian checkin'] || item['Giờ Chekcin'];
        if (!timeIn) return null;
        const d = new Date(timeIn);
        return isNaN(d.getTime()) ? null : d;
    }).filter(Boolean);

    if (dates.length > 0) {
        dates.sort((a, b) => a - b);
        const minDate = dates[0];
        const maxDate = dates[dates.length - 1];
        
        if (window.fpPivotDaLam) {
            window.fpPivotDaLam.set('minDate', minDate);
            window.fpPivotDaLam.set('maxDate', maxDate);
            window.fpPivotDaLam.clear();
        } else if (typeof flatpickr === 'function') {
            window.fpPivotDaLam = flatpickr("#dateRangeFilterPivotDaLam", {
                mode: "range",
                dateFormat: "Y-m-d",
                minDate: minDate,
                maxDate: maxDate,
                locale: {
                    rangeSeparator: ' to '
                },
                onChange: function(selectedDates, dateStr, instance) {
                    if (selectedDates.length === 0 || selectedDates.length === 2) {
                        applyFiltersPivotDaLam();
                    }
                }
            });
        } else {
            console.warn("Flatpickr is not loaded. Falling back to native range text parsing.");
            const input = document.getElementById('dateRangeFilterPivotDaLam');
            if (input) {
                input.removeAttribute('readonly');
                input.placeholder = "YYYY-MM-DD to YYYY-MM-DD";
                input.addEventListener('change', () => {
                    applyFiltersPivotDaLam();
                });
            }
        }
    } else {
        if (window.fpPivotDaLam) {
            window.fpPivotDaLam.clear();
        }
    }
}

function getSelectedDateRange() {
    const dateRangeVal = document.getElementById('dateRangeFilterPivotDaLam') ? document.getElementById('dateRangeFilterPivotDaLam').value : "";
    let fromDayVal = "";
    let toDayVal = "";
    if (dateRangeVal) {
        const parts = dateRangeVal.split(' to ');
        if (parts.length === 2) {
            fromDayVal = parts[0];
            toDayVal = parts[1];
        } else if (parts.length === 1 && parts[0]) {
            fromDayVal = parts[0];
            toDayVal = parts[0];
        }
    }
    return { fromDayVal, toDayVal };
}

function applyFiltersPivotDaLam() {
    if (!pivotDaLamRawData || pivotDaLamRawData.length === 0) return;
    
    const selectedStaffs = getSelectedMultiselectValues('staffFilterPivotDaLamOptions');
    const selectedCreators = getSelectedMultiselectValues('creatorFilterPivotDaLamOptions');
    const selectedSources = getSelectedMultiselectValues('sourceFilterPivotDaLamOptions');
    const selectedImpacts = getSelectedMultiselectValues('impactFilterPivotDaLamOptions');
    
    const { fromDayVal, toDayVal } = getSelectedDateRange();
    
    pivotDaLamFilteredData = pivotDaLamRawData.filter(row => {
        const matchStaff = selectedStaffs.length === 0 || selectedStaffs.includes(row['Người xử lý']);
        const matchCreator = selectedCreators.length === 0 || selectedCreators.includes(row['Người tạo']);
        const matchSource = selectedSources.length === 0 || selectedSources.includes(row['Nguồn data']);
        
        let matchImpact = true;
        if (selectedImpacts.length > 0) {
            const imp = String(Number(row['Impact']) || Number(row['impact']) || 0);
            matchImpact = selectedImpacts.includes(imp);
        }
        
        const rowDateStr = formatDateToYYYYMMDD(row['Thời gian checkin'] || row['Giờ Chekcin']);
        let matchDay = true;
        if (rowDateStr) {
            if (fromDayVal && rowDateStr < fromDayVal) matchDay = false;
            if (toDayVal && rowDateStr > toDayVal) matchDay = false;
        } else {
            // Hậu bị nếu không có dữ liệu trường checkin đầy đủ
            const dayNum = Number(row['Ngày checkin']);
            if (fromDayVal) {
                const fromDayNum = Number(fromDayVal.split('-')[2]);
                if (dayNum < fromDayNum) matchDay = false;
            }
            if (toDayVal) {
                const toDayNum = Number(toDayVal.split('-')[2]);
                if (dayNum > toDayNum) matchDay = false;
            }
        }
        
        return matchStaff && matchCreator && matchSource && matchImpact && matchDay;
    });
    
    // Populate active days maps for scaling workday count
    staffTotalActiveDaysMap = {};
    if (pivotDaLamRawData) {
        pivotDaLamRawData.forEach(row => {
            const staff = row['Người xử lý'];
            const day = row['Ngày checkin'];
            if (staff && day) {
                staffTotalActiveDaysMap[staff] = staffTotalActiveDaysMap[staff] || new Set();
                staffTotalActiveDaysMap[staff].add(day);
            }
        });
    }

    staffFilteredActiveDaysMap = {};
    if (pivotDaLamFilteredData) {
        pivotDaLamFilteredData.forEach(row => {
            const staff = row['Người xử lý'];
            const day = row['Ngày checkin'];
            if (staff && day) {
                staffFilteredActiveDaysMap[staff] = staffFilteredActiveDaysMap[staff] || new Set();
                staffFilteredActiveDaysMap[staff].add(day);
            }
        });
    }
    
    calculateKPIsPivotDaLam(pivotDaLamFilteredData);
    calculatePivotDaLam();
    const summaryData = renderSummaryPerformanceTable(pivotDaLamFilteredData);
    renderPivotDaLamCharts(summaryData);
}

// --- HELPER FUNCTIONS FOR CUSTOM MULTISELECT ---
function getEstimatedWorkday(staff) {
    const list = cacheData['ngaycong'] || [];
    if (!list || list.length === 0) {
        return (staffFilteredActiveDaysMap[staff] && staffFilteredActiveDaysMap[staff].size) || 1;
    }
    
    const firstRow = list[0];
    const isDailyDetailedFormat = ('Chấm công' in firstRow) && ('Ngày' in firstRow) && ('Họ và tên' in firstRow || 'Tên NS' in firstRow);
    
    const { fromDayVal, toDayVal } = getSelectedDateRange();
    const start = fromDayVal ? Number(fromDayVal.split('-')[2]) : null;
    const end = toDayVal ? Number(toDayVal.split('-')[2]) : null;
    
    if (isDailyDetailedFormat) {
        // --- DETAILED DAILY ATTENDANCE FORMAT ---
        const staffRecords = list.filter(row => {
            let name = String(row['Họ và tên'] || row['Tên NS'] || '');
            let parts = name.split('-');
            if (parts.length >= 2) name = parts[1].trim();
            return name === staff || name.toLowerCase().includes(staff.toLowerCase()) || staff.toLowerCase().includes(name.toLowerCase());
        });
        
        let totalCong = 0;
        staffRecords.forEach(row => {
            const dayNum = Number(row['Ngày']);
            if (isNaN(dayNum)) return;
            
            if ((start === null && end === null) || (dayNum >= start && dayNum <= end)) {
                const status = String(row['Chấm công'] || '').trim().toUpperCase();
                if (status === 'X') {
                    totalCong += 1.0;
                } else if (status === 'X/2') {
                    totalCong += 0.5;
                }
            }
        });
        return totalCong > 0 ? totalCong : ((staffFilteredActiveDaysMap[staff] && staffFilteredActiveDaysMap[staff].size) || 0);
    } else {
        // --- SUMMARY FORMAT (B502:O519) ---
        let tCongOriginal = 0;
        const ncRow = list.find(row => {
            let name = String(row['Tên NS'] || row['Họ và tên'] || row['staff'] || '');
            let parts = name.split('-');
            if (parts.length >= 2) name = parts[1].trim();
            return name === staff || name.toLowerCase().includes(staff.toLowerCase()) || staff.toLowerCase().includes(name.toLowerCase());
        });
        if (ncRow) {
            tCongOriginal = Number(ncRow['T công']) || 0;
        }
        
        if (tCongOriginal === 0) {
            return (staffFilteredActiveDaysMap[staff] && staffFilteredActiveDaysMap[staff].size) || 0;
        }
        if (start === null && end === null) {
            return tCongOriginal;
        }
        
        const totalActiveDays = (staffTotalActiveDaysMap[staff] && staffTotalActiveDaysMap[staff].size) || 1;
        const filteredActiveDays = (staffFilteredActiveDaysMap[staff] && staffFilteredActiveDaysMap[staff].size) || 0;
        
        let tCongEstimated = filteredActiveDays * (tCongOriginal / totalActiveDays);
        
        if (start !== null && end !== null) {
            const numFilterDays = end - start + 1;
            tCongEstimated = Math.min(numFilterDays, tCongEstimated);
        }
        
        return tCongEstimated;
    }
}

function toggleMultiselect(containerId) {
    if (window.event) window.event.stopPropagation();
    const container = document.getElementById(containerId);
    if (!container) return;
    const optionsPanel = container.querySelector('.multiselect-options');
    
    // Close other multiselect options
    document.querySelectorAll('.multiselect-options').forEach(opt => {
        if (opt !== optionsPanel) opt.classList.add('hidden');
    });
    
    optionsPanel.classList.toggle('hidden');
}

function onMultiselectChange(containerId, optionsId, defaultLabel) {
    updateMultiselectTriggerText(containerId, optionsId, defaultLabel);
    applyFiltersPivotDaLam();
}

function toggleSelectAll(containerId, optionsId, selectAllCheckbox, defaultLabel) {
    const optionsPanel = document.getElementById(optionsId);
    if (!optionsPanel) return;
    const isChecked = selectAllCheckbox.checked;
    
    // Find all checkboxes in the panel EXCEPT the select-all checkbox itself
    const checkboxes = optionsPanel.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        if (cb !== selectAllCheckbox) {
            cb.checked = isChecked;
        }
    });
    
    updateMultiselectTriggerText(containerId, optionsId, defaultLabel);
    applyFiltersPivotDaLam();
}

function onMultiselectCheckboxChange(containerId, optionsId, selectAllId, defaultLabel) {
    const optionsPanel = document.getElementById(optionsId);
    if (!optionsPanel) return;
    
    const selectAllCheckbox = document.getElementById(selectAllId);
    if (selectAllCheckbox) {
        // Find all checkboxes in the panel EXCEPT the select-all checkbox itself
        const checkboxes = Array.from(optionsPanel.querySelectorAll('input[type="checkbox"]')).filter(cb => cb.id !== selectAllId);
        const checkedCount = checkboxes.filter(cb => cb.checked).length;
        
        if (checkedCount === checkboxes.length) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else if (checkedCount === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    }
    
    updateMultiselectTriggerText(containerId, optionsId, defaultLabel);
    applyFiltersPivotDaLam();
}

function updateMultiselectTriggerText(containerId, optionsId, defaultLabel) {
    const container = document.getElementById(containerId);
    const optionsPanel = document.getElementById(optionsId);
    if (!container || !optionsPanel) return;
    
    const selectAllCheckbox = optionsPanel.querySelector('.select-all-option input[type="checkbox"]');
    const selectAllId = selectAllCheckbox ? selectAllCheckbox.id : null;
    
    const checkboxes = Array.from(optionsPanel.querySelectorAll('input[type="checkbox"]:checked'))
                            .filter(cb => cb.id !== selectAllId);
    const totalCount = optionsPanel.querySelectorAll('input[type="checkbox"]').length - (selectAllCheckbox ? 1 : 0);
    const triggerText = container.querySelector('.trigger-text');
    
    if (checkboxes.length === 0) {
        triggerText.innerText = defaultLabel;
    } else if (checkboxes.length === totalCount) {
        triggerText.innerText = defaultLabel;
    } else if (checkboxes.length === 1) {
        const label = optionsPanel.querySelector(`label[for="${checkboxes[0].id}"]`);
        triggerText.innerText = label ? label.innerText : defaultLabel;
    } else {
        triggerText.innerText = `${defaultLabel} (${checkboxes.length})`;
    }
}

function getSelectedMultiselectValues(optionsId) {
    const optionsPanel = document.getElementById(optionsId);
    if (!optionsPanel) return [];
    
    const selectAllCheckbox = optionsPanel.querySelector('.select-all-option input[type="checkbox"]');
    const selectAllId = selectAllCheckbox ? selectAllCheckbox.id : null;
    
    const checked = Array.from(optionsPanel.querySelectorAll('input[type="checkbox"]:checked'))
                         .filter(cb => cb.id !== selectAllId);
    return checked.map(cb => cb.value);
}

// Close dropdowns when clicking outside
window.addEventListener('click', function(e) {
    if (!e.target.closest('.custom-multiselect')) {
        document.querySelectorAll('.multiselect-options').forEach(opt => opt.classList.add('hidden'));
    }
});

function calculateKPIsPivotDaLam(data) {
    let totalVisits = data.length;
    let totalKM = 0;
    let totalHours = 0;
    
    data.forEach(row => {
        totalKM += Number(row['KM']) || 0;
        totalHours += Number(row['HourSP']) || 0;
    });
    
    const kpiTotalVisitsEl = document.getElementById('kpiTotalVisits');
    if (kpiTotalVisitsEl) kpiTotalVisitsEl.innerText = totalVisits.toLocaleString('vi-VN');
    
    let totalWorkdays = 0;
    const selectedStaffs = getSelectedMultiselectValues('staffFilterPivotDaLamOptions');
    const activeStaffs = selectedStaffs.length > 0 ? selectedStaffs : [...new Set(data.map(row => row['Người xử lý']).filter(Boolean))];
    
    activeStaffs.forEach(staff => {
        totalWorkdays += getEstimatedWorkday(staff);
    });
    
    const avgVisits = totalWorkdays > 0 ? (totalVisits / totalWorkdays) : 0;
    const avgVisitsText = avgVisits > 0 ? avgVisits.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " ca/ngày" : "-";
    const kpiAvgVisitsEl = document.getElementById('kpiAverageVisits');
    if (kpiAvgVisitsEl) kpiAvgVisitsEl.innerText = avgVisitsText;

    const avgHours = totalWorkdays > 0 ? (totalHours / totalWorkdays) : 0;
    const avgHoursText = avgHours > 0 ? avgHours.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + " giờ" : "-";
    const kpiAvgHoursEl = document.getElementById('kpiAverageHours');
    if (kpiAvgHoursEl) kpiAvgHoursEl.innerText = avgHoursText;

    const avgKM = totalWorkdays > 0 ? (totalKM / totalWorkdays) : 0;
    const avgKMText = avgKM > 0 ? avgKM.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " km" : "-";
    const kpiAvgKMEl = document.getElementById('kpiAverageKM');
    if (kpiAvgKMEl) kpiAvgKMEl.innerText = avgKMText;
}

function calculatePivotDaLam() {
    if (!pivotDaLamRawData || pivotDaLamRawData.length === 0) return;
    
    const thead = document.getElementById('pivotDaLamTableHead');
    const tbody = document.getElementById('pivotDaLamTableBody');
    thead.innerHTML = '';
    tbody.innerHTML = '';
    
    if (pivotDaLamRows.length === 0 && pivotDaLamCols.length === 0) {
        thead.innerHTML = '<tr><th>Bảng Pivot</th></tr>';
        tbody.innerHTML = '<tr><td style="text-align: center; color: #64748b; font-style: italic; padding: 30px;">Chưa cấu hình Pivot Table. Hãy kéo/bấm chọn các trường dữ liệu ở cột bên trái.</td></tr>';
        document.getElementById('pivotDaLamInfo').innerText = '';
        return;
    }
    
    const aggrType = document.getElementById('pivotDaLamAggrType').value;
    const valField = pivotDaLamVals.length > 0 ? pivotDaLamVals[0] : null;
    
    const dataset = pivotDaLamFilteredData || pivotDaLamRawData;
    
    const rowKeysSet = new Set();
    const colKeysSet = new Set();
    
    dataset.forEach(row => {
        if (pivotDaLamRows.length > 0) {
            rowKeysSet.add(pivotDaLamRows.map(f => String(row[f] || '-')).join('|||'));
        }
        if (pivotDaLamCols.length > 0) {
            colKeysSet.add(pivotDaLamCols.map(f => String(row[f] || '-')).join('|||'));
        }
    });
    
    let rowKeysList = Array.from(rowKeysSet).sort(smartSort);
    let colKeysList = Array.from(colKeysSet).sort(smartSort);
    
    let actualRowKeys = pivotDaLamRows.length > 0 ? rowKeysList : ['Tất cả'];
    let actualColKeys = pivotDaLamCols.length > 0 ? colKeysList : ['Tổng'];
    
    const pivotTable = {};
    const rowTotals = {};
    const colTotals = {};
    let grandTotalObj = { val: 0, hour: 0 };
    
    dataset.forEach(row => {
        const rKey = pivotDaLamRows.length > 0 ? pivotDaLamRows.map(f => String(row[f] || '-')).join('|||') : 'Tất cả';
        const cKey = pivotDaLamCols.length > 0 ? pivotDaLamCols.map(f => String(row[f] || '-')).join('|||') : 'Tổng';
        
        let val = 1;
        if (valField) {
            val = Number(row[valField]);
            if (isNaN(val)) val = 0;
        }
        
        if (aggrType === 'count') {
            val = (valField && (row[valField] === undefined || row[valField] === null || row[valField] === "")) ? 0 : 1;
        }
        
        let hrVal = parseFloat(row['HourSP']);
        if (isNaN(hrVal)) hrVal = 0;
        
        pivotTable[rKey] = pivotTable[rKey] || {};
        if (!pivotTable[rKey][cKey]) {
            pivotTable[rKey][cKey] = { val: 0, hour: 0 };
        }
        pivotTable[rKey][cKey].val += val;
        pivotTable[rKey][cKey].hour += hrVal;
        
        if (!rowTotals[rKey]) {
            rowTotals[rKey] = { val: 0, hour: 0 };
        }
        rowTotals[rKey].val += val;
        rowTotals[rKey].hour += hrVal;
        
        if (!colTotals[cKey]) {
            colTotals[cKey] = { val: 0, hour: 0 };
        }
        colTotals[cKey].val += val;
        colTotals[cKey].hour += hrVal;
        
        grandTotalObj.val += val;
        grandTotalObj.hour += hrVal;
    });
    
    let headHTML = '<tr>';
    if (pivotDaLamRows.length > 0) {
        pivotDaLamRows.forEach(field => {
            headHTML += `<th style="text-align: left;">${field}</th>`;
        });
    } else {
        headHTML += `<th style="text-align: left;">Dữ liệu</th>`;
    }
    
    actualColKeys.forEach(colKey => {
        const labelParts = colKey.split('|||').map(p => {
            return (pivotDaLamCols.length === 1 && pivotDaLamCols[0] === 'Ngày checkin' && !isNaN(p)) ? `Ngày ${p}` : p;
        });
        const colLabel = labelParts.join(' - ');
        headHTML += `<th>${colLabel}</th>`;
    });
    
    if (pivotDaLamCols.length > 0) {
        headHTML += `<th>Tổng cộng</th>`;
    }
    
    const hasStaffRow = pivotDaLamRows.includes('Người xử lý');
    if (hasStaffRow) {
        headHTML += `<th>TB ca/Ngày công</th>`;
    }
    
    headHTML += '</tr>';
    thead.innerHTML = headHTML;
    
    let bodyHTML = '';
    
    // Workdays loaded from getEstimatedWorkday
    
    actualRowKeys.forEach(rowKey => {
        bodyHTML += '<tr>';
        
        if (pivotDaLamRows.length > 0) {
            const rowVals = rowKey.split('|||');
            rowVals.forEach(val => {
                bodyHTML += `<td class="row-label">${val}</td>`;
            });
        } else {
            bodyHTML += `<td class="row-label">Tất cả dữ liệu</td>`;
        }
        
        actualColKeys.forEach(colKey => {
            const cell = pivotTable[rowKey] && pivotTable[rowKey][colKey];
            let cellText = '';
            if (cell && cell.val > 0) {
                const hrText = cell.hour % 1 === 0 ? cell.hour : cell.hour.toFixed(1);
                cellText = `${cell.val} / <span style="color:#10b981;font-weight:600;">${hrText}</span>`;
            }
            bodyHTML += `<td class="pivot-val-cell" data-row="${rowKey.replace(/"/g, '&quot;')}" data-col="${colKey.replace(/"/g, '&quot;')}" onclick="showPivotDaLamCellDetails(this)">${cellText}</td>`;
        });
        
        const rTotal = rowTotals[rowKey];
        if (pivotDaLamCols.length > 0) {
            let rTotalText = '';
            if (rTotal && rTotal.val > 0) {
                const hrText = rTotal.hour % 1 === 0 ? rTotal.hour : rTotal.hour.toFixed(1);
                rTotalText = `${rTotal.val} / <span style="color:#10b981;font-weight:600;">${hrText}</span>`;
            }
            bodyHTML += `<td class="pivot-val-cell pivot-row-total-cell" data-row="${rowKey.replace(/"/g, '&quot;')}" data-col="Tổng" onclick="showPivotDaLamCellDetails(this)">${rTotalText}</td>`;
        }
        
        if (hasStaffRow) {
            const staffIdx = pivotDaLamRows.indexOf('Người xử lý');
            const staffName = rowKey.split('|||')[staffIdx];
            const tCong = getEstimatedWorkday(staffName);
            const avg = tCong > 0 ? (rTotal.val / tCong) : 0;
            bodyHTML += `<td style="font-weight: bold; color: #2563eb; font-variant-numeric: tabular-nums; text-align: center;">${avg > 0 ? formatNumber(avg) : '-'}</td>`;
        }
        
        bodyHTML += '</tr>';
    });
    
    let footerHTML = '<tr class="total-row">';
    const rowSpanCount = pivotDaLamRows.length > 0 ? pivotDaLamRows.length : 1;
    footerHTML += `<td colspan="${rowSpanCount}" style="text-align: left; font-weight: bold;">Grand Total</td>`;
    
    actualColKeys.forEach(colKey => {
        const cTotal = colTotals[colKey];
        let cTotalText = '';
        if (cTotal && cTotal.val > 0) {
            const hrText = cTotal.hour % 1 === 0 ? cTotal.hour : cTotal.hour.toFixed(1);
            cTotalText = `${cTotal.val} / <span style="color:#10b981;font-weight:600;">${hrText}</span>`;
        }
        footerHTML += `<td class="pivot-val-cell" data-row="Tất cả" data-col="${colKey.replace(/"/g, '&quot;')}" onclick="showPivotDaLamCellDetails(this)">${cTotalText}</td>`;
    });
    
    if (pivotDaLamCols.length > 0) {
        const hrText = grandTotalObj.hour % 1 === 0 ? grandTotalObj.hour : grandTotalObj.hour.toFixed(1);
        const gtText = `${grandTotalObj.val} / <span style="color:#10b981;font-weight:600;">${hrText}</span>`;
        footerHTML += `<td class="grand-total-cell" data-row="Tất cả" data-col="Tổng" onclick="showPivotDaLamCellDetails(this)">${gtText}</td>`;
    }
    
    if (hasStaffRow) {
        let totalCong = 0;
        actualRowKeys.forEach(rowKey => {
            const staffIdx = pivotDaLamRows.indexOf('Người xử lý');
            const staffName = rowKey.split('|||')[staffIdx];
            totalCong += getEstimatedWorkday(staffName);
        });
        const overallAvg = totalCong > 0 ? (grandTotalObj.val / totalCong) : 0;
        footerHTML += `<td style="font-weight: bold; color: #ef4444; font-variant-numeric: tabular-nums; text-align: center;">${overallAvg > 0 ? formatNumber(overallAvg) : '-'}</td>`;
    }
    
    footerHTML += '</tr>';
    tbody.innerHTML = bodyHTML + footerHTML;
    
    let valLabel = valField ? ` [${valField}]` : '';
    let typeLabel = aggrType === 'sum' ? 'Tổng' : 'Đếm';
    document.getElementById('pivotDaLamInfo').innerHTML = `Kết quả (${typeLabel}${valLabel}): ${formatNumber(grandTotalObj.val)} / <span style="color:#10b981;font-weight:600;">${grandTotalObj.hour.toFixed(1)} giờ</span>`;
}

function clearPivotDaLamSettings() {
    pivotDaLamRows = [];
    pivotDaLamCols = [];
    pivotDaLamVals = [];
    updateDropZonesUIPivotDaLam();
    
    document.getElementById('pivotDaLamTableHead').innerHTML = '<tr><th>Bảng Pivot</th></tr>';
    document.getElementById('pivotDaLamTableBody').innerHTML = '<tr><td style="text-align: center; color: #64748b; font-style: italic; padding: 30px;">Chưa cấu hình Pivot Table. Hãy kéo/bấm chọn các trường dữ liệu ở cột bên trái.</td></tr>';
    document.getElementById('pivotDaLamInfo').innerText = '';
}

function exportPivotDaLamToCSV() {
    const table = document.getElementById('pivotDaLamResultTable');
    if (!table || table.rows.length <= 1) {
        alert('Không có dữ liệu để xuất!');
        return;
    }
    
    let csvContent = '';
    for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows[i];
        const rowData = [];
        for (let j = 0; j < row.cells.length; j++) {
            const cell = row.cells[j];
            let text = cell.innerText.replace(/"/g, '""');
            const colspan = cell.colSpan || 1;
            rowData.push(`"${text}"`);
            for(let k = 1; k < colspan; k++) {
                rowData.push('""');
            }
        }
        csvContent += rowData.join('\t') + '\r\n';
    }
    
    const buffer = new ArrayBuffer(csvContent.length * 2 + 2);
    const view = new DataView(buffer);
    view.setUint16(0, 0xFEFF, true); // BOM UTF-16LE
    for (let i = 0; i < csvContent.length; i++) {
        view.setUint16((i + 1) * 2, csvContent.charCodeAt(i), true);
    }
    
    const blob = new Blob([buffer], { type: 'text/csv;charset=utf-16le;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "report_pivot_dalam_" + new Date().toISOString().slice(0,10) + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function renderPivotDaLamCharts(summaryData) {
    if (!summaryData || summaryData.length === 0) return;
    
    // Sort summaryData descending for each chart
    const totalATCData = [...summaryData].sort((a, b) => b.totalATC - a.totalATC);
    const labelsATC = totalATCData.map(item => item.cleanName);
    const valuesATC = totalATCData.map(item => item.totalATC);
    
    const avgATCData = [...summaryData].sort((a, b) => b.avgATC - a.avgATC);
    const labelsAvgATC = avgATCData.map(item => item.cleanName);
    const valuesAvgATC = avgATCData.map(item => item.avgATC);
    
    const avgTimeData = [...summaryData].sort((a, b) => b.avgHourSP - a.avgHourSP);
    const labelsAvgTime = avgTimeData.map(item => item.cleanName);
    const valuesAvgTime = avgTimeData.map(item => item.avgHourSP);
    
    const isDark = document.documentElement.classList.contains('dark-theme');
    const textColor = isDark ? '#cbd5e1' : '#475569';
    const gridColor = isDark ? '#334155' : '#e2e8f0';
    
    // Inline plugin to draw numbers on top of bars
    const topLabelsPlugin = {
        id: 'topLabelsPlugin',
        afterDatasetsDraw(chart) {
            const { ctx } = chart;
            ctx.save();
            chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                meta.data.forEach((bar, index) => {
                    const val = dataset.data[index];
                    if (val === 0) return; // don't draw 0
                    
                    let text = val;
                    if (typeof val === 'number') {
                        if (Number.isInteger(val)) {
                            text = val.toLocaleString('vi-VN');
                        } else {
                            text = val.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        }
                    }
                    
                    ctx.fillStyle = isDark ? '#cbd5e1' : '#475569';
                    ctx.font = '600 11px Segoe UI, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    
                    // Positions
                    const x = bar.x;
                    const y = bar.y;
                    ctx.fillText(text, x, y - 4);
                });
            });
            ctx.restore();
        }
    };
    
    // 1. Chart Total ATC
    if (chartPivotDaLamTotalATCInstance) {
        chartPivotDaLamTotalATCInstance.destroy();
    }
    const ctxTotalATC = document.getElementById('chartPivotDaLamTotalATC').getContext('2d');
    chartPivotDaLamTotalATCInstance = new Chart(ctxTotalATC, {
        type: 'bar',
        data: {
            labels: labelsATC,
            datasets: [{
                label: 'Tổng ATC',
                data: valuesATC,
                backgroundColor: 'rgba(59, 130, 246, 0.75)',
                borderColor: '#3b82f6',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: 'Segoe UI' } }
                },
                y: {
                    grace: '10%', // Adds padding at the top of Y axis to prevent label clipping
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: 'Segoe UI' } }
                }
            }
        },
        plugins: [topLabelsPlugin]
    });
    
    // 2. Chart Avg ATC / Day
    if (chartPivotDaLamAvgATCDayInstance) {
        chartPivotDaLamAvgATCDayInstance.destroy();
    }
    const ctxAvgATC = document.getElementById('chartPivotDaLamAvgATCDay').getContext('2d');
    chartPivotDaLamAvgATCDayInstance = new Chart(ctxAvgATC, {
        type: 'bar',
        data: {
            labels: labelsAvgATC,
            datasets: [{
                label: 'TB ATC / Ngày',
                data: valuesAvgATC,
                backgroundColor: 'rgba(22, 163, 74, 0.75)',
                borderColor: '#16a34a',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: 'Segoe UI' } }
                },
                y: {
                    grace: '10%', // Adds padding at the top of Y axis
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: 'Segoe UI' } }
                }
            }
        },
        plugins: [topLabelsPlugin]
    });
    
    // 3. Chart Avg Time / Day
    if (chartPivotDaLamAvgTimeDayInstance) {
        chartPivotDaLamAvgTimeDayInstance.destroy();
    }
    const ctxAvgTime = document.getElementById('chartPivotDaLamAvgTimeDay').getContext('2d');
    chartPivotDaLamAvgTimeDayInstance = new Chart(ctxAvgTime, {
        type: 'bar',
        data: {
            labels: labelsAvgTime,
            datasets: [{
                label: 'TB Time / Ngày (Giờ)',
                data: valuesAvgTime,
                backgroundColor: 'rgba(139, 92, 246, 0.75)',
                borderColor: '#8b5cf6',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: 'Segoe UI' } }
                },
                y: {
                    grace: '10%', // Adds padding at the top of Y axis
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: 'Segoe UI' } }
                }
            }
        },
        plugins: [topLabelsPlugin]
    });
}

function sortSummaryTable(columnKey) {
    if (summarySortColumn === columnKey) {
        summarySortDirection = summarySortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        summarySortColumn = columnKey;
        if (columnKey === 'fullName' || columnKey === 'originalIndex') {
            summarySortDirection = 'asc';
        } else {
            summarySortDirection = 'desc';
        }
    }
    updateSortIndicators();
    const dataset = pivotDaLamFilteredData || pivotDaLamRawData || [];
    const summaryData = renderSummaryPerformanceTable(dataset);
    renderPivotDaLamCharts(summaryData);
}

function updateSortIndicators() {
    const columns = ['originalIndex', 'fullName', 'tCong', 'totalATC', 'totalImpact', 'totalKM', 'totalHourSP', 'avgATC', 'avgKM', 'avgHourSP'];
    columns.forEach(col => {
        const span = document.getElementById('sort_' + col);
        if (span) {
            if (summarySortColumn === col) {
                span.innerText = summarySortDirection === 'asc' ? ' ▲' : ' ▼';
                span.style.color = '#3b82f6';
            } else {
                span.innerText = '';
            }
        }
    });
}

function renderSummaryPerformanceTable(filteredData) {
    const tbody = document.getElementById('summaryPerformanceBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const selectedStaffs = getSelectedMultiselectValues('staffFilterPivotDaLamOptions');
    const staffMap = new Map();
    const ncList = (cacheData['ngaycong'] && Array.isArray(cacheData['ngaycong']) && cacheData['ngaycong'].length > 0)
        ? cacheData['ngaycong']
        : DEFAULT_ATTENDANCE_B502_O519;
    
    // 1. Thêm nhân sự từ danh sách ngày công (B502:O519 hoặc chấm công chi tiết)
    ncList.forEach((ncRow, idx) => {
        const rawName = String(ncRow['Tên NS'] || ncRow['Họ và tên'] || ncRow['staff'] || '').trim();
        if (!rawName || rawName === 'TỔNG CỘNG' || rawName === 'Tên NS') return;
        let clean = rawName;
        const parts = rawName.split('-');
        if (parts.length >= 2) clean = parts[1].trim();
        if (!staffMap.has(clean)) {
            if (selectedStaffs.length === 0 || selectedStaffs.includes(clean)) {
                staffMap.set(clean, {
                    fullName: rawName,
                    cleanName: clean,
                    ncRow: ncRow,
                    originalIndex: idx
                });
            }
        }
    });

    // 2. Bổ sung các nhân sự có phát sinh trong filteredData nếu chưa có trong danh sách ngày công
    (filteredData || []).forEach(row => {
        const rawName = String(row['Người xử lý'] || '').trim();
        if (!rawName) return;
        let clean = rawName;
        const parts = rawName.split('-');
        if (parts.length >= 2) clean = parts[1].trim();
        if (!staffMap.has(clean)) {
            if (selectedStaffs.length === 0 || selectedStaffs.includes(clean)) {
                staffMap.set(clean, {
                    fullName: rawName,
                    cleanName: clean,
                    ncRow: {},
                    originalIndex: staffMap.size
                });
            }
        }
    });

    const activeStaffList = Array.from(staffMap.values());
    if (activeStaffList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding: 20px; font-style: italic; color: #64748b;">❌ Không tìm thấy nhân sự phù hợp</td></tr>';
        return [];
    }
    
    let rowsData = activeStaffList.map((item, idx) => {
        const ncRow = item.ncRow || {};
        const fullName = item.fullName || ncRow['Tên NS'] || '';
        let cleanName = item.cleanName || '';
        if (!cleanName && fullName) {
            let parts = fullName.split('-');
            cleanName = (parts.length >= 2) ? parts[1].trim() : fullName;
        }
        
        const tCong = getEstimatedWorkday(cleanName);
        const staffRecords = filteredData.filter(row => row['Người xử lý'] === cleanName);
        
        const totalATC = staffRecords.length;
        let totalKM = 0;
        let totalHourSP = 0;
        let totalImpact = 0;
        
        staffRecords.forEach(row => {
            totalKM += Number(row['KM']) || 0;
            totalHourSP += Number(row['HourSP']) || 0;
            let imp = Number(row['Impact']) || Number(row['impact']) || 0;
            if (imp === 1) {
                totalImpact++;
            }
        });
        
        const avgATC = tCong > 0 ? (totalATC / tCong) : 0;
        const avgKM = tCong > 0 ? (totalKM / tCong) : 0;
        const avgHourSP = tCong > 0 ? (totalHourSP / tCong) : 0;
        
        return {
            fullName,
            cleanName,
            tCong,
            totalATC,
            totalImpact,
            totalKM,
            totalHourSP,
            avgATC,
            avgKM,
            avgHourSP,
            originalIndex: idx
        };
    }).filter(r => r.tCong > 0 || r.totalATC > 0);
    
    // Đánh lại số thứ tự gốc sau khi loại bỏ nhân sự 0 công và 0 ca
    rowsData.forEach((r, i) => { r.originalIndex = i; });
    
    if (rowsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding: 20px; font-style: italic; color: #64748b;">❌ Không có nhân sự phát sinh dữ liệu trong khoảng thời gian này</td></tr>';
        return [];
    }
    
    if (summarySortColumn) {
        rowsData.sort((a, b) => {
            let valA = a[summarySortColumn];
            let valB = b[summarySortColumn];
            
            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }
            
            if (valA < valB) return summarySortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return summarySortDirection === 'asc' ? 1 : -1;
            return a.originalIndex - b.originalIndex;
        });
    }
    
    // Helper to extract min2/max2 thresholds for cell-specific conditional formatting
    const getThresholds = (arr) => {
        if (arr.length === 0) return { min2: -999999, max2: 999999, minVal: 0, maxVal: 0 };
        const sorted = [...arr].sort((a, b) => a - b);
        const minVal = sorted[0];
        const maxVal = sorted[sorted.length - 1];
        if (maxVal === minVal) {
            return { min2: -999999, max2: 999999, minVal, maxVal };
        }
        const min2 = sorted.length >= 2 ? sorted[1] : sorted[0];
        const max2 = sorted.length >= 2 ? sorted[sorted.length - 2] : sorted[0];
        return { min2, max2, minVal, maxVal };
    };

    const atcThresh = getThresholds(rowsData.map(r => r.avgATC));
    const kmThresh = getThresholds(rowsData.map(r => r.avgKM));
    const timeThresh = getThresholds(rowsData.map(r => r.avgHourSP));

    let html = '';
    let sumTotalATC = 0;
    let sumTotalImpact = 0;
    let sumTotalKM = 0;
    let sumTotalHourSP = 0;
    let sumAvgATC = 0;
    let sumAvgKM = 0;
    let sumAvgHourSP = 0;
    
    rowsData.forEach((row, idx) => {
        sumTotalATC += row.totalATC;
        sumTotalImpact += row.totalImpact;
        sumTotalKM += row.totalKM;
        sumTotalHourSP += row.totalHourSP;
        sumAvgATC += row.avgATC;
        sumAvgKM += row.avgKM;
        sumAvgHourSP += row.avgHourSP;
        
        // Smart conditional formatting for each average column cell
        let atcClass = 'clickable-val-cell';
        if (atcThresh.maxVal > atcThresh.minVal) {
            if (row.avgATC >= atcThresh.max2) {
                atcClass += ' kpi-high-perf';
            } else if (row.avgATC <= atcThresh.min2) {
                atcClass += ' kpi-low-perf';
            }
        }

        let kmClass = 'clickable-val-cell';
        if (kmThresh.maxVal > kmThresh.minVal) {
            if (row.avgKM >= kmThresh.max2) {
                kmClass += ' kpi-fatigue-warn'; // Cảnh báo mệt mỏi khi đi chuyển nhiều
            } else if (row.avgKM <= kmThresh.min2) {
                kmClass += ' kpi-high-perf'; // Tiết kiệm di chuyển
            }
        }

        let timeClass = 'clickable-val-cell';
        if (timeThresh.maxVal > timeThresh.minVal) {
            if (row.avgHourSP >= timeThresh.max2) {
                timeClass += ' kpi-high-perf';
            } else if (row.avgHourSP <= timeThresh.min2) {
                timeClass += ' kpi-low-perf';
            }
        }

        html += '<tr>';
        html += `<td style="text-align: center; font-variant-numeric: tabular-nums;">${idx + 1}</td>`;
        html += `<td class="row-label clickable-cell" style="text-align: left; font-weight: 500; cursor: pointer;" onclick="showSummaryStaffDetails('${row.cleanName.replace(/'/g, "\\'")}', 'atc')">${row.cleanName}</td>`;
        html += `<td style="text-align: center; font-variant-numeric: tabular-nums;">${formatNumber(row.tCong)}</td>`;
        html += `<td class="clickable-val-cell" style="text-align: center; font-variant-numeric: tabular-nums; cursor: pointer;" onclick="showSummaryStaffDetails('${row.cleanName.replace(/'/g, "\\'")}', 'atc')">${formatNumber(row.totalATC)}</td>`;
        html += `<td class="clickable-val-cell" style="text-align: center; font-variant-numeric: tabular-nums; cursor: pointer;" onclick="showSummaryStaffDetails('${row.cleanName.replace(/'/g, "\\'")}', 'impact')">${formatNumber(row.totalImpact)}</td>`;
        html += `<td class="clickable-val-cell" style="text-align: center; font-variant-numeric: tabular-nums; cursor: pointer;" onclick="showSummaryStaffDetails('${row.cleanName.replace(/'/g, "\\'")}', 'km')">${formatNumber(row.totalKM)}</td>`;
        html += `<td class="clickable-val-cell" style="text-align: center; font-variant-numeric: tabular-nums; cursor: pointer;" onclick="showSummaryStaffDetails('${row.cleanName.replace(/'/g, "\\'")}', 'hours')">${formatNumber(row.totalHourSP)}</td>`;
        html += `<td class="${atcClass}" style="text-align: center; font-variant-numeric: tabular-nums; font-weight: 600; color: #2563eb; cursor: pointer;" onclick="showSummaryStaffDetails('${row.cleanName.replace(/'/g, "\\'")}', 'atc')">${row.avgATC.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>`;
        html += `<td class="${kmClass}" style="text-align: center; font-variant-numeric: tabular-nums; font-weight: 600; color: #16a34a; cursor: pointer;" onclick="showSummaryStaffDetails('${row.cleanName.replace(/'/g, "\\'")}', 'km')">${row.avgKM.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>`;
        html += `<td class="${timeClass}" style="text-align: center; font-variant-numeric: tabular-nums; font-weight: 600; color: #8b5cf6; cursor: pointer;" onclick="showSummaryStaffDetails('${row.cleanName.replace(/'/g, "\\'")}', 'hours')">${row.avgHourSP.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>`;
        html += '</tr>';
    });
    
    const N = rowsData.length;
    const avgTotalATC = N > 0 ? (sumTotalATC / N) : 0;
    const avgTotalImpact = N > 0 ? (sumTotalImpact / N) : 0;
    const avgTotalKM = N > 0 ? (sumTotalKM / N) : 0;
    const avgTotalHourSP = N > 0 ? (sumTotalHourSP / N) : 0;
    const avgAvgATC = N > 0 ? (sumAvgATC / N) : 0;
    const avgAvgKM = N > 0 ? (sumAvgKM / N) : 0;
    const avgAvgHourSP = N > 0 ? (sumAvgHourSP / N) : 0;
    
    html += '<tr class="total-row">';
    html += '<td></td>';
    html += '<td style="text-align: left; font-weight: bold;">Trung bình</td>';
    html += '<td></td>';
    html += `<td style="text-align: center; font-variant-numeric: tabular-nums; font-weight: bold;">${avgTotalATC.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>`;
    html += `<td style="text-align: center; font-variant-numeric: tabular-nums; font-weight: bold;">${avgTotalImpact.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>`;
    html += `<td style="text-align: center; font-variant-numeric: tabular-nums; font-weight: bold;">${avgTotalKM.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>`;
    html += `<td style="text-align: center; font-variant-numeric: tabular-nums; font-weight: bold;">${avgTotalHourSP.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>`;
    html += `<td style="text-align: center; font-variant-numeric: tabular-nums; font-weight: bold; color: #ef4444;">${avgAvgATC.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>`;
    html += `<td style="text-align: center; font-variant-numeric: tabular-nums; font-weight: bold; color: #ef4444;">${avgAvgKM.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>`;
    html += `<td style="text-align: center; font-variant-numeric: tabular-nums; font-weight: bold; color: #ef4444;">${avgAvgHourSP.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>`;
    html += '</tr>';
    
    tbody.innerHTML = html;
    window.lastSummaryPerformanceData = rowsData;
    return rowsData;
}

function showSummaryStaffDetails(staffName, metricType) {
    const dataset = pivotDaLamFilteredData || pivotDaLamRawData;
    if (!dataset) return;
    
    let staffRecords = dataset.filter(row => row['Người xử lý'] === staffName);
    if (staffRecords.length === 0) return;
    
    const dailyData = {};
    staffRecords.forEach(row => {
        const day = Number(row['Ngày checkin']) || 0;
        if (!day) return;
        
        let val = 0;
        if (metricType === 'atc') {
            val = 1;
        } else if (metricType === 'impact') {
            let imp = Number(row['Impact']) || Number(row['impact']) || 0;
            val = imp === 1 ? 1 : 0;
        } else if (metricType === 'km') {
            val = Number(row['KM']) || 0;
        } else if (metricType === 'hours') {
            val = Number(row['HourSP']) || 0;
        }
        
        dailyData[day] = (dailyData[day] || 0) + val;
    });
    
    const sortedDays = Object.keys(dailyData).map(Number).sort((a, b) => a - b);
    
    let titleText = '';
    let unit = '';
    if (metricType === 'atc') {
        titleText = `Chi tiết Số ca hỗ trợ (ATC) theo ngày - ${staffName}`;
        unit = ' ca';
    } else if (metricType === 'impact') {
        titleText = `Chi tiết Số ca Impact theo ngày - ${staffName}`;
        unit = ' impact';
    } else if (metricType === 'km') {
        titleText = `Chi tiết Quãng đường di chuyển (KM) theo ngày - ${staffName}`;
        unit = ' km';
    } else if (metricType === 'hours') {
        titleText = `Chi tiết Thời gian hỗ trợ (Giờ SP) theo ngày - ${staffName}`;
        unit = ' giờ';
    }
    
    const titleEl = document.getElementById('pivotListModalTitle');
    if (titleEl) titleEl.innerText = titleText;
    
    const bodyEl = document.getElementById('pivotListModalBody');
    if (!bodyEl) return;
    bodyEl.innerHTML = '';
    
    let grandTotal = 0;
    
    sortedDays.forEach(day => {
        const val = dailyData[day];
        grandTotal += val;
        
        const card = document.createElement('div');
        card.className = 'pivot-detail-card';
        card.style.cursor = 'pointer';
        card.style.display = 'flex';
        card.style.justifyContent = 'space-between';
        card.style.alignItems = 'center';
        card.style.padding = '12px 15px';
        
        card.onclick = function() {
            showSummaryDayDetails(staffName, day);
        };
        
        const formattedVal = val.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        
        card.innerHTML = `
            <span style="font-weight: 600; color: #475569;">Ngày ${day}</span>
            <span style="font-weight: 700; color: #2563eb; font-variant-numeric: tabular-nums;">${formattedVal}${unit} <span style="font-size: 11px; font-weight: normal; color: #94a3b8; margin-left: 5px;">➔</span></span>
        `;
        bodyEl.appendChild(card);
    });
    
    if (sortedDays.length > 0) {
        const card = document.createElement('div');
        card.className = 'pivot-detail-card summary-total';
        card.style.cursor = 'default';
        card.style.pointerEvents = 'none';
        card.style.display = 'flex';
        card.style.justifyContent = 'space-between';
        card.style.alignItems = 'center';
        card.style.padding = '14px 15px';
        
        const formattedTotal = grandTotal.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        
        card.innerHTML = `
            <span style="font-weight: bold; text-transform: uppercase;">Tổng cộng</span>
            <span style="font-weight: 800; color: #ef4444; font-size: 15px; font-variant-numeric: tabular-nums;">${formattedTotal}${unit}</span>
        `;
        bodyEl.appendChild(card);
    }
    
    const modal = document.getElementById('pivotListModal');
    if (modal) modal.style.display = 'flex';
}

function showSummaryDayDetails(staffName, dayNum) {
    const dataset = pivotDaLamFilteredData || pivotDaLamRawData;
    if (!dataset) return;
    
    let dayRecords = dataset.filter(row => row['Người xử lý'] === staffName && Number(row['Ngày checkin']) === dayNum);
    if (dayRecords.length === 0) return;
    
    const titleEl = document.getElementById('pivotListModalTitle');
    if (titleEl) titleEl.innerText = `Chi tiết công việc - ${staffName} (Ngày ${dayNum} - ${dayRecords.length} ca)`;
    
    const bodyEl = document.getElementById('pivotListModalBody');
    if (!bodyEl) return;
    bodyEl.innerHTML = '';
    
    window.pivotDetailList = dayRecords;
    
    dayRecords.forEach((row, idx) => {
        const card = document.createElement('div');
        card.className = 'pivot-detail-card';
        card.onclick = function() {
            openDetailFromPivot(idx);
        };
        
        const id = row['Retailer ID'] || '-';
        const km = row['KM'] !== undefined ? `${row['KM']} km` : '0 km';
        const hours = row['HourSP'] !== undefined ? `${Number(row['HourSP']).toFixed(2)} giờ` : '0 giờ';
        const checkinTime = formatTimeHelper(row['Thời gian checkin']);
        const checkoutTime = formatTimeHelper(row['Thời gian checkout']);
        const location = row['Địa điểm thực tế cửa hàng'] || row['Địa điểm'] || '-';
        
        card.innerHTML = `
            <div class="pivot-card-header">
                <span>Retailer ID: ${id}</span>
                <span style="font-size:12px; color:#3b82f6; font-weight: 600;">Xem chi tiết ➔</span>
            </div>
            <div class="pivot-card-body">
                <div><strong>Quãng đường:</strong> ${km}</div>
                <div><strong>Giờ hỗ trợ:</strong> ${hours}</div>
                <div><strong>Checkin:</strong> ${checkinTime}</div>
                <div><strong>Checkout:</strong> ${checkoutTime}</div>
                <div style="grid-column: span 2;"><strong>Địa điểm:</strong> ${location}</div>
            </div>
        `;
        bodyEl.appendChild(card);
    });
    
    const modal = document.getElementById('pivotListModal');
    if (modal) modal.style.display = 'flex';
}

function showPivotDaLamCellDetails(el) {
    const valStr = el.innerText.trim();
    if (valStr === '0' || valStr === '-' || valStr === '') return;
    
    const rowKey = el.dataset.row;
    const colKey = el.dataset.col;
    
    const dataset = pivotDaLamFilteredData || pivotDaLamRawData;
    if (!dataset) return;
    
    let cellRecords = dataset.filter(row => {
        let matchRow = true;
        if (rowKey && rowKey !== 'Tất cả' && pivotDaLamRows.length > 0) {
            const rValues = rowKey.split('|||');
            matchRow = pivotDaLamRows.every((f, idx) => String(row[f] || '-') === rValues[idx]);
        }
        
        let matchCol = true;
        if (colKey && colKey !== 'Tổng' && pivotDaLamCols.length > 0) {
            const cValues = colKey.split('|||');
            matchCol = pivotDaLamCols.every((f, idx) => String(row[f] || '-') === cValues[idx]);
        }
        
        return matchRow && matchCol;
    });
    
    if (cellRecords.length === 0) return;
    
    const titleEl = document.getElementById('pivotListModalTitle');
    titleEl.innerText = `Danh sách chi tiết (${cellRecords.length} dòng)`;
    
    const bodyEl = document.getElementById('pivotListModalBody');
    bodyEl.innerHTML = '';
    
    window.pivotDetailList = cellRecords;
    
    cellRecords.forEach((row, idx) => {
        const card = document.createElement('div');
        card.className = 'pivot-detail-card';
        card.onclick = function() {
            openDetailFromPivot(idx);
        };
        
        const id = row['Retailer ID'] || '-';
        const staff = row['Người xử lý'] || '-';
        const km = row['KM'] !== undefined ? `${row['KM']} km` : '0 km';
        const hours = row['HourSP'] !== undefined ? `${Number(row['HourSP']).toFixed(2)} giờ` : '0 giờ';
        const checkinTime = formatTimeHelper(row['Thời gian checkin'] || row['Thời gian tạo']);
        const checkoutTime = formatTimeHelper(row['Thời gian checkout']);
        const location = row['Địa điểm thực tế cửa hàng'] || row['Địa điểm'] || '-';
        
        card.innerHTML = `
            <div class="pivot-card-header">
                <span>Retailer ID: ${id}</span>
                <span style="font-size:12px; color:#3b82f6; font-weight: 600;">Xem chi tiết ➔</span>
            </div>
            <div class="pivot-card-body">
                <div style="grid-column: span 2;"><strong>Nhân sự:</strong> ${staff}</div>
                <div><strong>Quãng đường:</strong> ${km}</div>
                <div><strong>Giờ hỗ trợ:</strong> ${hours}</div>
                <div><strong>Checkin:</strong> ${checkinTime}</div>
                <div><strong>Checkout:</strong> ${checkoutTime}</div>
                <div style="grid-column: span 2;"><strong>Địa điểm:</strong> ${location}</div>
            </div>
        `;
        bodyEl.appendChild(card);
    });
    
    document.getElementById('pivotListModal').style.display = 'flex';
}

function togglePivotDaLamWorkspace() {
    const builder = document.getElementById('pivotDaLamWorkspaceBuilder');
    const btn = document.getElementById('btnTogglePivotDaLamWorkspace');
    if (!builder || !btn) return;
    
    const isHidden = builder.classList.toggle('hidden');
    
    if (isHidden) {
        btn.innerHTML = '⚙️ Tùy biến Pivot Table (Hiện)';
        btn.classList.add('collapsed');
    } else {
        btn.innerHTML = '⚙️ Tùy biến Pivot Table (Ẩn)';
        btn.classList.remove('collapsed');
    }
}

// --- AI ANOMALY SCANNER & REPORT WRITER ---
window.lastGeneratedAnomalyReport = null;
window.lastGeneratedAnomalyRange = null;

function detectAnomalies(dataset) {
    const anomalies = [];
    
    // Group records by staff and day
    const staffDayGroups = {};
    dataset.forEach(row => {
        let staff = row['Người xử lý'];
        if (!staff) return;
        let parts = staff.split('-');
        if (parts.length >= 2) staff = parts[1].trim();
        
        const day = row['Ngày checkin'];
        if (!day) return;
        
        const key = `${staff}|||${day}`;
        staffDayGroups[key] = staffDayGroups[key] || [];
        staffDayGroups[key].push(row);
    });
    
    // Process each group
    for (const key in staffDayGroups) {
        const [staff, day] = key.split('|||');
        const records = staffDayGroups[key];
        
        // Sort records by checkin time
        records.sort((a, b) => {
            const timeA = new Date(a['Thời gian checkin'] || a['Giờ Chekcin']);
            const timeB = new Date(b['Thời gian checkin'] || b['Giờ Chekcin']);
            return timeA - timeB;
        });
        
        const staffAnomalies = [];
        const totalATC = records.length;
        
        // Rule 1: Only 1 check-in in the day (Không có ca check nào tiếp tục)
        if (totalATC === 1) {
            staffAnomalies.push(`Chỉ có duy nhất 1 ca check-in trong ngày (không có ca check nào tiếp tục)`);
        }
        
        // Rule 2: KM vs ATC Count (High mileage for very few cases)
        let totalKM = 0;
        let totalImpact = 0;
        records.forEach(r => {
            totalKM += Number(r['KM']) || 0;
            const imp = Number(r['Impact']) || Number(r['impact']) || 0;
            if (imp === 1) {
                totalImpact++;
            }
        });
        
        if (totalKM > 60 && totalATC <= 2) {
            staffAnomalies.push(`Di chuyển KM lớn (${totalKM.toFixed(1)} km) nhưng chỉ xử lý ${totalATC} ca`);
        }
        
        // Rule 3: Support duration check (too short, too long, short with impact, long with little work)
        records.forEach(r => {
            const minutes = (Number(r['HourSP']) || 0) * 60;
            const hours = Number(r['HourSP']) || 0;
            const imp = Number(r['Impact']) || Number(r['impact']) || 0;
            const taskDesc = String(r['Công việc hỗ trợ KH'] || '').trim();
            
            if (minutes > 0 && minutes < 6) {
                staffAnomalies.push(`Hỗ trợ bất thường: Quá ngắn (${minutes.toFixed(0)} phút) tại Retailer ${r['Retailer ID']}`);
            }
            if (minutes > 0 && minutes < 10 && imp === 1) {
                staffAnomalies.push(`Thời gian hỗ trợ quá ngắn nhưng có Impact: Chỉ hỗ trợ ${minutes.toFixed(0)} phút nhưng ghi nhận có Impact tại Retailer ${r['Retailer ID']}`);
            }
            if (hours > 2 && taskDesc.length < 15) {
                staffAnomalies.push(`Thời gian hỗ trợ quá dài nhưng công việc ít: Hỗ trợ ${hours.toFixed(1)} giờ nhưng mô tả công việc quá ít ("${taskDesc}") tại Retailer ${r['Retailer ID']}`);
            }
            if (hours > 4) {
                staffAnomalies.push(`Hỗ trợ bất thường: Quá lâu (${hours.toFixed(1)} giờ) tại Retailer ${r['Retailer ID']}`);
            }
        });
        
        // Rule 4: Time overlaps, velocities, and gaps > 1 hour
        for (let i = 0; i < records.length - 1; i++) {
            const task1 = records[i];
            const task2 = records[i+1];
            
            const checkout1 = new Date(task1['Thời gian checkout'] || task1['Giờ ChekcOut']);
            const checkin2 = new Date(task2['Thời gian checkin'] || task2['Giờ Chekcin']);
            
            if (!isNaN(checkout1) && !isNaN(checkin2)) {
                const diffMinutes = (checkin2 - checkout1) / 60000;
                const km2 = Number(task2['KM']) || 0;
                
                if (checkin2 < checkout1) {
                    const t1Out = task1['Giờ ChekcOut'] ? task1['Giờ ChekcOut'].substring(11, 16) : "";
                    const t2In = task2['Giờ Chekcin'] ? task2['Giờ Chekcin'].substring(11, 16) : "";
                    staffAnomalies.push(`Thời gian trùng lặp: Điểm 2 checkin (${t2In}) trước khi Điểm 1 checkout (${t1Out})`);
                } else if (diffMinutes < 5 && km2 > 5) {
                    staffAnomalies.push(`Vận tốc bất khả thi: Đi tiếp ${km2.toFixed(1)} km chỉ trong ${diffMinutes.toFixed(1)} phút (giữa Retailer ${task1['Retailer ID']} và ${task2['Retailer ID']})`);
                } else if (diffMinutes > 60) {
                    const t1Out = task1['Giờ ChekcOut'] ? task1['Giờ ChekcOut'].substring(11, 16) : "";
                    const t2In = task2['Giờ Chekcin'] ? task2['Giờ Chekcin'].substring(11, 16) : "";
                    staffAnomalies.push(`Trống thời gian hơn 1 tiếng từ thời điểm check out: Trống ${(diffMinutes / 60).toFixed(1)} tiếng từ lúc checkout Retailer ${task1['Retailer ID']} (${t1Out}) đến checkin Retailer ${task2['Retailer ID']} (${t2In})`);
                }
            }
        }
        
        // Rule 5: Out of hours check-in (outside 6 AM - 10 PM)
        records.forEach(r => {
            const checkinTime = new Date(r['Thời gian checkin'] || r['Giờ Chekcin']);
            if (!isNaN(checkinTime)) {
                const hours = checkinTime.getHours();
                if (hours >= 0 && (hours < 6 || hours >= 22)) {
                    staffAnomalies.push(`Check-in ngoài giờ hành chính lúc ${hours}h tại Retailer ${r['Retailer ID']}`);
                }
            }
        });
        
        if (staffAnomalies.length > 0) {
            anomalies.push({
                staff: staff,
                day: Number(day),
                totalATC: totalATC,
                totalKM: totalKM,
                totalImpact: totalImpact,
                reasons: staffAnomalies,
                records: records
            });
        }
    }
    
    return anomalies;
}

function runAIAnomalyAnalysis() {
    const dataset = pivotDaLamFilteredData || pivotDaLamRawData || [];
    if (dataset.length === 0) {
        alert("Không có dữ liệu trong khoảng lọc hiện tại để quét!");
        return;
    }
    
    const anomalies = detectAnomalies(dataset);
    
    const modal = document.getElementById('aiAnomalyModal');
    const modalBody = document.getElementById('aiAnomalyModalBody');
    const saveBtn = document.getElementById('btnSaveAIAnomaly');
    
    if (modal) modal.style.display = 'flex';
    if (saveBtn) saveBtn.style.display = 'none';
    
    if (anomalies.length === 0) {
        if (modalBody) {
            modalBody.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #0f766e; font-weight: 600; font-size: 16px;">
                    🎉 Tuyệt vời! Hệ thống không phát hiện dấu hiệu bất thường nào (về KM di chuyển, thời gian trùng lặp hay check-in ẩu) trong khoảng dữ liệu lọc hiện tại.
                </div>
            `;
        }
        return;
    }
    
    if (modalBody) {
        modalBody.innerHTML = `
            <div style="text-align: center; padding: 45px; color: #475569; font-weight: 500;">
                <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #8b5cf6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                <span>⏳ AI đang phân tích sâu dữ liệu của <strong>${anomalies.length}</strong> trường hợp bị cắm cờ cảnh báo bất thường. Anh vui lòng chờ tí nhé...</span>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
    }
    
    // Format compact anomaly information to feed to Gemini
    const anomalyPayload = anomalies.map(a => ({
        "Nhân sự": a.staff,
        "Ngày": `Ngày ${a.day}`,
        "Tổng ca làm (ATC)": a.totalATC,
        "Tổng ca có Impact": a.totalImpact,
        "Cảnh báo thuật toán": a.reasons,
        "Dữ liệu checkin": a.records.map(r => ({
            "Mã Retailer": r['Retailer ID'],
            "Thời lượng (Giờ)": r['HourSP'] ? Number(r['HourSP']).toFixed(2) : 0,
            "Checkin": r['Giờ Chekcin'] ? r['Giờ Chekcin'].substring(11, 19) : "",
            "Checkout": r['Giờ ChekcOut'] ? r['Giờ ChekcOut'].substring(11, 19) : "",
            "Impact": Number(r['Impact']) || Number(r['impact']) || 0,
            "Công việc hỗ trợ KH": r['Công việc hỗ trợ KH'] || 'Không ghi nhận',
            "Thực trạng trao đổi": r['Thực trạng trao đổi'] || 'Trống',
            "Thực trạng khi đến": r['Thực trạng khi đến'] || 'Trống'
        }))
    }));
    
    const contextText = JSON.stringify(anomalyPayload, null, 2);
    
    const { fromDayVal, toDayVal } = getSelectedDateRange();
    let daysSpan = 0;
    if (fromDayVal && toDayVal) {
        const d1 = new Date(fromDayVal);
        const d2 = new Date(toDayVal);
        daysSpan = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
    } else {
        const uniqueDays = [...new Set(dataset.map(row => Number(row['Ngày checkin'])).filter(Boolean))];
        daysSpan = uniqueDays.length;
    }
    const useConcise = daysSpan > 7;

    const promptTextConcise = `Bạn là Chuyên viên Kiểm soát Nội bộ. Hãy lập báo cáo cực kỳ ngắn gọn và súc tích gửi anh Quốc về các hành vi check-in/di chuyển bất thường của nhân sự dựa trên dữ liệu.
        
        YÊU CẦU ĐỊNH DẠNG & CÔ ĐỌNG (BẮT BUỘC):
        1. Báo cáo không có bất kỳ lời mở đầu, lời chào hay lời kết rườm rà (Bắt đầu trực tiếp bằng danh sách bullet points của nhân sự).
        2. Mỗi nhân sự chỉ trình bày đúng 1 dòng bullet point duy nhất (TUYỆT ĐỐI KHÔNG sử dụng các bullet point con thụt lề, không xuống dòng trong phần mô tả của một nhân sự).
           Định dạng chuẩn: • Tên nhân sự (Tổng ca ATC: X, Impact: Y): [Mô tả ngắn gọn toàn bộ các hành vi bất thường và lý do/đối chiếu trong tối đa 1-2 câu].
        3. GOM NHÓM DỮ LIỆU:
           - Trống thời gian: Gom lại thành "Trống X lần (tổng Y tiếng, ngày Z)" thay vì liệt kê riêng lẻ từng khoảng thời gian trống.
           - Trùng lặp: Ghi "Trùng lặp X ca (ngày Z)".
           - Hỗ trợ quá ngắn có Impact: Chỉ rõ mã cửa hàng, số phút và impact cực kỳ ngắn gọn (ví dụ: "Retailer 500879040 (8p): tư vấn & kích hoạt payment thành công").
           - Hỗ trợ quá ngắn không Impact: Phải đối chiếu ngay trường "Thực trạng trao đổi" và "Thực trạng khi đến" để giải thích (ví dụ: "Retailer 501012403 (2p) không impact vì Đóng cửa/Call (bình thường)").
        4. Tuyệt đối không viết thêm các mục "Mức độ nghiêm trọng" hay "Khuyến nghị/Đề xuất".
        
        Hãy viết báo cáo cực kỳ ngắn gọn, sắc bén, đi thẳng vào số liệu.`;

    const promptTextDetailed = `Dưới đây là danh sách các nhân sự có ca check-in/di chuyển bất thường.
        Hãy đóng vai trò là Chuyên viên Kiểm soát Nội bộ để phân tích và lập báo cáo chi tiết gửi anh Quốc về hành vi nghi ngờ cụ thể của từng người:
        
        Yêu cầu phân tích và định dạng báo cáo:
        1. Báo cáo phân tích theo từng nhân sự (dạng danh sách bullet points rõ ràng, chi tiết từng ca).
        2. Đối với hành vi "Hỗ trợ quá ngắn có Impact": Phải đối chiếu dữ liệu và chỉ rõ "Impact công việc là gì" (dựa vào trường Công việc hỗ trợ KH).
        3. Đối với hành vi "Hỗ trợ ngắn không có Impact": Cần đối chiếu thêm trường "Thực trạng trao đổi" và "Thực trạng khi đến" (ví dụ: nếu ghi đóng cửa hoặc khách từ chối trao đổi trực tiếp, hãy giải thích rõ đó có thể là lý do bình thường chứ không hẳn là nghi ngờ).
        4. Đối với hành vi "Để trống thời gian dài giữa các ca làm việc": Phải nêu rõ cụ thể trống từ mấy giờ đến mấy giờ, vào ngày nào.
        5. Tuyệt đối KHÔNG viết thêm các mục "Mức độ nghiêm trọng" hay "Đề xuất xử lý" trong báo cáo. Chỉ tập trung nêu rõ thực trạng và chi tiết hành vi nghi ngờ.
        
        Trả lời bằng tiếng Việt thân thiện, chuyên nghiệp, súc tích.`;

    const prompt = {
        role: 'user',
        text: useConcise ? promptTextConcise : promptTextDetailed
    };
    
    if (typeof callGeminiAPI === 'function') {
        callGeminiAPI([prompt], contextText)
        .then(aiReport => {
            let formattedReport = formatMarkdownToHTML(aiReport);
            
            if (modalBody) {
                modalBody.innerHTML = `
                    <div class="ai-report-alert">
                        🚨 Phát hiện ${anomalies.length} nhân sự có dấu hiệu bất thường. Dưới đây là phân tích chi tiết của AI:
                    </div>
                    <div class="ai-report-content" style="font-size: 14px; line-height: 1.7;">
                        ${formattedReport}
                    </div>
                `;
            }
            
            window.lastGeneratedAnomalyReport = aiReport;
            
            const { fromDayVal, toDayVal } = getSelectedDateRange();
            window.lastGeneratedAnomalyRange = (fromDayVal && toDayVal) ? `${formatYYYYMMDDtoDDMMYYYY(fromDayVal)} - ${formatYYYYMMDDtoDDMMYYYY(toDayVal)}` : "Tất cả các ngày";
            
            if (saveBtn) {
                saveBtn.style.display = 'block';
                saveBtn.innerText = "💾 Lưu vào Sheets";
                saveBtn.disabled = false;
                saveBtn.style.opacity = '1';
            }
        })
        .catch(err => {
            console.error("AI Anomaly Scan Error:", err);
            if (modalBody) {
                modalBody.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #ef4444; font-weight: 600;">
                        ❌ Lỗi kết nối AI: ${err.message}<br>
                        <small style="font-weight: normal; color: #64748b;">(Vui lòng kiểm tra lại cấu hình API key)</small>
                    </div>
                `;
            }
        });
    } else {
        if (modalBody) {
            modalBody.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #ef4444; font-weight: 600;">
                    ❌ Lỗi hệ thống: Không tìm thấy hàm gọi AI (callGeminiAPI).
                </div>
            `;
        }
    }
}

function closeAIAnomalyModal() {
    const modal = document.getElementById('aiAnomalyModal');
    if (modal) modal.style.display = 'none';
}

function saveAIAnomalyReport() {
    if (!window.lastGeneratedAnomalyReport) {
        alert("Không có nội dung báo cáo để lưu!");
        return;
    }
    
    const saveBtn = document.getElementById('btnSaveAIAnomaly');
    if (saveBtn) {
        saveBtn.innerText = "⏳ Đang lưu...";
        saveBtn.disabled = true;
        saveBtn.style.opacity = '0.6';
    }
    
    const payload = {
        dateRange: window.lastGeneratedAnomalyRange || "Tất cả",
        analysis: window.lastGeneratedAnomalyReport
    };
    
    fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(() => {
        alert("✅ Báo cáo kiểm soát bất thường đã được gửi! Anh vui lòng kiểm tra Sheet 'baocao_ai' sau vài giây để xem kết quả nhé.");
        if (saveBtn) {
            saveBtn.innerText = "💾 Đã gửi";
            saveBtn.style.background = "#10b981";
        }
    })
    .catch(err => {
        console.error("Save anomaly report error:", err);
        alert("❌ Có lỗi xảy ra khi lưu báo cáo: " + err.message);
        if (saveBtn) {
            saveBtn.innerText = "💾 Lưu vào Sheets";
            saveBtn.disabled = false;
            saveBtn.style.opacity = '1';
        }
    });
}

async function runAIPivotDaLamAnalysis(forceRefresh = false) {
    const container = document.getElementById('aiAnalysisPivotDaLamBody');
    const wrapper = document.getElementById('aiAnalysisPivotDaLamContainer');
    const timeEl = document.getElementById('aiAnalysisPivotDaLamTime');
    const titleEl = document.getElementById('aiAnalysisPivotDaLamTitleText');
    const reloadBtn = document.getElementById('btnReloadAIPivotDaLam');
    const saveBtn = document.getElementById('btnSaveAIAnomalyDaLam');
    if (!container) return;

    // Set active report type to 'anomaly'
    window.activePivotDaLamReportType = 'anomaly';
    localStorage.setItem('ai_dalam_active_report_type', 'anomaly');

    if (titleEl) titleEl.innerHTML = "🚨 AI Phân Tích Bất Thường Check-in";
    if (reloadBtn) {
        reloadBtn.setAttribute('onclick', 'runAIPivotDaLamAnalysis(true)');
    }

    const cachedText = localStorage.getItem('ai_dalam_analysis_text');
    const cachedTime = localStorage.getItem('ai_dalam_analysis_time');
    const cachedRange = localStorage.getItem('ai_dalam_analysis_range');
    const currentRangeText = getDaLamDateRangeText();
    
    if (!forceRefresh && (!cachedText || !cachedTime || cachedRange !== currentRangeText)) {
        if (wrapper) wrapper.classList.add('hidden');
        return;
    }

    if (wrapper) wrapper.classList.remove('hidden');

    if (!forceRefresh && cachedText && cachedTime && cachedRange === currentRangeText) {
        container.innerHTML = formatMarkdownToHTML(cachedText);
        if (timeEl) timeEl.innerText = `Cập nhật lúc: ${cachedTime}`;
        if (saveBtn) {
            saveBtn.style.display = 'inline-flex';
            saveBtn.innerText = "💾 Lưu vào Sheets";
            saveBtn.disabled = false;
            saveBtn.style.opacity = '1';
        }
        window.lastGeneratedReportText = cachedText;
        window.lastGeneratedReportRange = cachedRange;
        return;
    }

    if (!forceRefresh) {
        container.innerHTML = `<div style="color: #64748b; font-style: italic; padding: 15px; text-align: center;">Chưa có dữ liệu phân tích. Hãy nhấn nút "AI Quét Bất thường" hoặc nút Tải lại bên cạnh để bắt đầu.</div>`;
        if (timeEl) timeEl.innerText = `Chưa phân tích`;
        if (saveBtn) saveBtn.style.display = 'none';
        return;
    }

    const dataset = pivotDaLamFilteredData || pivotDaLamRawData || [];
    if (dataset.length === 0) {
        container.innerHTML = `<div style="color: #64748b; font-style: italic; padding: 15px; text-align: center;">Không có dữ liệu trong khoảng lọc hiện tại để quét!</div>`;
        return;
    }

    const anomalies = detectAnomalies(dataset);
    if (anomalies.length === 0) {
        const text = "🎉 Tuyệt vời! Hệ thống không phát hiện dấu hiệu bất thường nào (về KM di chuyển, thời gian trùng lặp hay check-in ẩu) trong khoảng dữ liệu lọc hiện tại.";
        container.innerHTML = `<div style="text-align: center; padding: 20px; color: #0f766e; font-weight: 600; font-size: 14px;">${text}</div>`;
        if (timeEl) {
            const now = new Date();
            const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
            timeEl.innerText = `Cập nhật lúc: ${timeStr}`;
            localStorage.setItem('ai_dalam_analysis_text', text);
            localStorage.setItem('ai_dalam_analysis_time', timeStr);
            localStorage.setItem('ai_dalam_analysis_range', currentRangeText);
            
            window.lastGeneratedReportText = text;
            window.lastGeneratedReportRange = currentRangeText;
        }
        if (saveBtn) saveBtn.style.display = 'none';
        return;
    }

    container.innerHTML = `
        <div style="text-align: center; padding: 30px; color: #8b5cf6; font-weight: 500;">
            <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #8b5cf6; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
            <span>⏳ AI đang phân tích dữ liệu của <strong>${anomalies.length}</strong> trường hợp bất thường. Anh vui lòng chờ tí nhé...</span>
        </div>
    `;
    if (saveBtn) saveBtn.style.display = 'none';

    try {
        const anomalyPayload = anomalies.map(a => ({
            "Nhân sự": a.staff,
            "Ngày": `Ngày ${a.day}`,
            "Tổng ca làm (ATC)": a.totalATC,
            "Tổng ca có Impact": a.totalImpact,
            "Cảnh báo thuật toán": a.reasons,
            "Dữ liệu checkin": a.records.map(r => ({
                "Mã Retailer": r['Retailer ID'],
                "Thời lượng (Giờ)": r['HourSP'] ? Number(r['HourSP']).toFixed(2) : 0,
                "Checkin": r['Giờ Chekcin'] ? r['Giờ Chekcin'].substring(11, 19) : "",
                "Checkout": r['Giờ ChekcOut'] ? r['Giờ ChekcOut'].substring(11, 19) : "",
                "Impact": Number(r['Impact']) || Number(r['impact']) || 0,
                "Công việc hỗ trợ KH": r['Công việc hỗ trợ KH'] || 'Không ghi nhận',
                "Thực trạng trao đổi": r['Thực trạng trao đổi'] || 'Trống',
                "Thực trạng khi đến": r['Thực trạng khi đến'] || 'Trống'
            }))
        }));
        
        const contextText = JSON.stringify(anomalyPayload, null, 2);
        
        const { fromDayVal, toDayVal } = getSelectedDateRange();
        let daysSpan = 0;
        if (fromDayVal && toDayVal) {
            const d1 = new Date(fromDayVal);
            const d2 = new Date(toDayVal);
            daysSpan = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
        } else {
            const uniqueDays = [...new Set(dataset.map(row => Number(row['Ngày checkin'])).filter(Boolean))];
            daysSpan = uniqueDays.length;
        }
        const useConcise = daysSpan > 7;

        const promptTextConcise = `Bạn là Chuyên viên Kiểm soát Nội bộ. Hãy lập báo cáo cực kỳ ngắn gọn và súc tích gửi anh Quốc về các hành vi check-in/di chuyển bất thường của nhân sự dựa trên dữ liệu.
            
            YÊU CẦU ĐỊNH DẠNG & CÔ ĐỌNG (BẮT BUỘC):
            1. Báo cáo không có bất kỳ lời mở đầu, lời chào hay lời kết rườm rà (Bắt đầu trực tiếp bằng danh sách bullet points của nhân sự).
            2. Mỗi nhân sự chỉ trình bày đúng 1 dòng bullet point duy nhất (TUYỆT ĐỐI KHÔNG sử dụng các bullet point con thụt lề, không xuống dòng trong phần mô tả của một nhân sự).
               Định dạng chuẩn: • Tên nhân sự (Tổng ca ATC: X, Impact: Y): [Mô tả ngắn gọn toàn bộ các hành vi bất thường và lý do/đối chiếu trong tối đa 1-2 câu].
            3. GOM NHÓM DỮ LIỆU:
               - Trống thời gian: Gom lại thành "Trống X lần (tổng Y tiếng, ngày Z)" thay vì liệt kê riêng lẻ từng khoảng thời gian trống.
               - Trùng lặp: Ghi "Trùng lặp X ca (ngày Z)".
               - Hỗ trợ quá ngắn có Impact: Chỉ rõ mã cửa hàng, số phút và impact cực kỳ ngắn gọn (ví dụ: "Retailer 500879040 (8p): tư vấn & kích hoạt payment thành công").
               - Hỗ trợ quá ngắn không Impact: Phải đối chiếu ngay trường "Thực trạng trao đổi" và "Thực trạng khi đến" để giải thích (ví dụ: "Retailer 501012403 (2p) không impact vì Đóng cửa/Call (bình thường)").
            4. Tuyệt đối không viết thêm các mục "Mức độ nghiêm trọng" hay "Khuyến nghị/Đề xuất".
            
            Hãy viết báo cáo cực kỳ ngắn gọn, sắc bén, đi thẳng vào số liệu.`;

        const promptTextDetailed = `Dưới đây là danh sách các nhân sự có ca check-in/di chuyển bất thường.
            Hãy đóng vai trò là Chuyên viên Kiểm soát Nội bộ để phân tích và lập báo cáo chi tiết gửi anh Quốc về hành vi nghi ngờ cụ thể của từng người:
            
            Yêu cầu phân tích và định dạng báo cáo:
            1. Báo cáo phân tích theo từng nhân sự (dạng danh sách bullet points rõ ràng, chi tiết từng ca).
            2. Đối với hành vi "Hỗ trợ quá ngắn có Impact": Phải đối chiếu dữ liệu và chỉ rõ "Impact công việc là gì" (dựa vào trường Công việc hỗ trợ KH).
            3. Đối với hành vi "Hỗ trợ ngắn không có Impact": Cần đối chiếu thêm trường "Thực trạng trao đổi" và "Thực trạng khi đến" (ví dụ: nếu ghi đóng cửa hoặc khách từ chối trao đổi trực tiếp, hãy giải thích rõ đó có thể là lý do bình thường chứ không hẳn là nghi ngờ).
            4. Đối với hành vi "Để trống thời gian dài giữa các ca làm việc": Phải nêu rõ cụ thể trống từ mấy giờ đến mấy giờ, vào ngày nào.
            5. Tuyệt đối KHÔNG viết thêm các mục "Mức độ nghiêm trọng" hay "Đề xuất xử lý" trong báo cáo. Chỉ tập trung nêu rõ thực trạng và chi tiết hành vi nghi ngờ.
            
            Trả lời bằng tiếng Việt thân thiện, chuyên nghiệp, súc tích.`;

        const prompt = {
            role: 'user',
            text: useConcise ? promptTextConcise : promptTextDetailed
        };

        if (typeof callGeminiAPI !== 'function') {
            throw new Error("Không tìm thấy hàm gọi Gemini API (callGeminiAPI)");
        }

        const aiReport = await callGeminiAPI([prompt], contextText);
        
        const now = new Date();
        const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        localStorage.setItem('ai_dalam_analysis_text', aiReport);
        localStorage.setItem('ai_dalam_analysis_time', timeStr);
        localStorage.setItem('ai_dalam_analysis_range', currentRangeText);
        
        window.lastGeneratedReportText = aiReport;
        window.lastGeneratedReportRange = currentRangeText;

        container.innerHTML = `
            <div class="ai-report-alert">
                🚨 Phát hiện ${anomalies.length} nhân sự có dấu hiệu bất thường. Dưới đây là phân tích chi tiết của AI:
            </div>
            <div class="ai-report-content" style="font-size: 14px; line-height: 1.7;">
                ${formatMarkdownToHTML(aiReport)}
            </div>
        `;
        
        if (timeEl) timeEl.innerText = `Cập nhật lúc: ${timeStr}`;
        if (saveBtn) {
            saveBtn.style.display = 'inline-flex';
            saveBtn.innerText = "💾 Lưu vào Sheets";
            saveBtn.disabled = false;
            saveBtn.style.opacity = '1';
        }
    } catch (error) {
        console.error("AI Anomaly Analysis Error:", error);
        container.innerHTML = `<div style="color: #ef4444; font-weight: bold; padding: 15px;">❌ Lỗi phân tích AI: ${error.message}</div>`;
    }
}

async function runAIPerformanceReport(forceRefresh = false) {
    const container = document.getElementById('aiAnalysisPivotDaLamBody');
    const wrapper = document.getElementById('aiAnalysisPivotDaLamContainer');
    const timeEl = document.getElementById('aiAnalysisPivotDaLamTime');
    const titleEl = document.getElementById('aiAnalysisPivotDaLamTitleText');
    const reloadBtn = document.getElementById('btnReloadAIPivotDaLam');
    const saveBtn = document.getElementById('btnSaveAIAnomalyDaLam');
    if (!container) return;

    // Set active report type to 'performance'
    window.activePivotDaLamReportType = 'performance';
    localStorage.setItem('ai_dalam_active_report_type', 'performance');

    if (titleEl) titleEl.innerHTML = "📊 AI Báo Cáo Hiệu Suất Họp";
    if (reloadBtn) {
        reloadBtn.setAttribute('onclick', 'runAIPerformanceReport(true)');
    }

    const cachedText = localStorage.getItem('ai_dalam_perf_text');
    const cachedTime = localStorage.getItem('ai_dalam_perf_time');
    const cachedRange = localStorage.getItem('ai_dalam_perf_range');
    const currentRangeText = getDaLamDateRangeText();

    if (!forceRefresh && (!cachedText || !cachedTime || cachedRange !== currentRangeText)) {
        if (wrapper) wrapper.classList.add('hidden');
        return;
    }

    if (wrapper) wrapper.classList.remove('hidden');

    if (!forceRefresh && cachedText && cachedTime && cachedRange === currentRangeText) {
        container.innerHTML = `
            <div class="ai-report-content" style="font-size: 14px; line-height: 1.7;">
                ${formatMarkdownToHTML(cachedText)}
            </div>
        `;
        if (timeEl) timeEl.innerText = `Cập nhật lúc: ${cachedTime}`;
        window.lastGeneratedReportText = cachedText;
        window.lastGeneratedReportRange = cachedRange;
        if (saveBtn) {
            saveBtn.style.display = 'inline-flex';
            saveBtn.innerText = "💾 Lưu vào Sheets";
            saveBtn.disabled = false;
            saveBtn.style.opacity = '1';
        }
        return;
    }

    if (!forceRefresh) {
        container.innerHTML = `<div style="color: #64748b; font-style: italic; padding: 15px; text-align: center;">Chưa có báo cáo hiệu suất họp. Hãy nhấn nút "AI Báo cáo Hiệu suất Họp" hoặc nút Tải lại bên cạnh để bắt đầu phân tích.</div>`;
        if (timeEl) timeEl.innerText = `Chưa phân tích`;
        if (saveBtn) saveBtn.style.display = 'none';
        return;
    }

    const dataset = pivotDaLamFilteredData || pivotDaLamRawData || [];
    if (dataset.length === 0) {
        container.innerHTML = `<div style="color: #64748b; font-style: italic; padding: 15px; text-align: center;">Không có dữ liệu trong khoảng lọc hiện tại để phân tích!</div>`;
        return;
    }

    // Call renderSummaryPerformanceTable to get rowsData (it computes and renders the table, then returns rowsData)
    const rowsData = renderSummaryPerformanceTable(dataset);
    if (!rowsData || rowsData.length === 0) {
        container.innerHTML = `<div style="color: #64748b; font-style: italic; padding: 15px; text-align: center;">Không thể tính toán dữ liệu hiệu suất để phân tích!</div>`;
        return;
    }

    container.innerHTML = `
        <div style="text-align: center; padding: 30px; color: #6366f1; font-weight: 500;">
            <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #6366f1; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
            <span>⏳ AI đang tổng hợp báo cáo hiệu suất làm việc của <strong>${rowsData.length}</strong> nhân sự. Anh vui lòng chờ tí nhé...</span>
        </div>
    `;
    if (saveBtn) saveBtn.style.display = 'none';

    try {
        let tableText = "| Tên NS | T công | Tổng ATC | Tổng Impact | Tổng KM | Tổng giờ SP | TB ATC/Ngày | TB KM/Ngày | TB Time/Ngày |\n";
        tableText += "| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n";
        rowsData.forEach(row => {
            tableText += `| ${row.cleanName} | ${row.tCong} | ${row.totalATC} | ${row.totalImpact} | ${row.totalKM.toFixed(2)} | ${row.totalHourSP.toFixed(2)} | ${row.avgATC.toFixed(2)} | ${row.avgKM.toFixed(2)} | ${row.avgHourSP.toFixed(2)} |\n`;
        });

        const N = rowsData.length;
        const sumTotalATC = rowsData.reduce((sum, r) => sum + r.totalATC, 0);
        const sumTotalImpact = rowsData.reduce((sum, r) => sum + r.totalImpact, 0);
        const sumTotalKM = rowsData.reduce((sum, r) => sum + r.totalKM, 0);
        const sumTotalHourSP = rowsData.reduce((sum, r) => sum + r.totalHourSP, 0);
        const sumAvgATC = rowsData.reduce((sum, r) => sum + r.avgATC, 0);
        const sumAvgKM = rowsData.reduce((sum, r) => sum + r.avgKM, 0);
        const sumAvgHourSP = rowsData.reduce((sum, r) => sum + r.avgHourSP, 0);

        const avgTotalATC = N > 0 ? (sumTotalATC / N) : 0;
        const avgTotalImpact = N > 0 ? (sumTotalImpact / N) : 0;
        const avgTotalKM = N > 0 ? (sumTotalKM / N) : 0;
        const avgTotalHourSP = N > 0 ? (sumTotalHourSP / N) : 0;
        const avgAvgATC = N > 0 ? (sumAvgATC / N) : 0;
        const avgAvgKM = N > 0 ? (sumAvgKM / N) : 0;
        const avgAvgHourSP = N > 0 ? (sumAvgHourSP / N) : 0;

        tableText += `| Trung bình | | ${avgTotalATC.toFixed(2)} | ${avgTotalImpact.toFixed(2)} | ${avgTotalKM.toFixed(2)} | ${avgTotalHourSP.toFixed(2)} | ${avgAvgATC.toFixed(2)} | ${avgAvgKM.toFixed(2)} | ${avgAvgHourSP.toFixed(2)} |\n`;

        const contextText = JSON.stringify(rowsData, null, 2);
        
        const prompt = {
            role: 'user',
            text: `Bạn là Chuyên viên Kiểm soát Nội bộ và Quản lý Vận hành.
Dưới đây là bảng dữ liệu hiệu suất làm việc của nhân sự (Bảng tổng hợp hiệu suất nhân sự theo Ngày công) trong khoảng thời gian lọc hiện tại:

${tableText}

Hãy lập báo cáo tóm tắt năng suất làm việc trung bình của nhân sự để họp giao ban, sử dụng đúng dữ liệu thực tế tính toán từ bảng trên.
Báo cáo phải viết bằng tiếng Việt, định dạng rõ ràng, ngắn gọn và bao gồm các thông tin chính xác theo cấu trúc sau:

1. Tiêu đề chính dạng Heading 2: **2. NĂNG SUẤT LÀM VIỆC TB CỦA NHÂN SỰ**
2. **Thời gian hỗ trợ TB của team [Average_TB_Time_Ngay]h** (Lấy đúng giá trị TB Time/Ngày ở dòng Trung bình, ví dụ: 4.77h)
3. Các đầu mục phân tích cụ thể (dạng bullet points):
   - Chỉ ra những nhân sự có thời gian hỗ trợ trung bình thấp hơn 4 giờ (Time hỗ trợ < 4h). Ví dụ: "• Khương (3.92h), Phong (3.97h), Vũ (3.98h) có thời gian hỗ trợ trung bình thấp hơn 4 giờ."
   - Chỉ ra những nhân sự có thời gian hỗ trợ trung bình cao nhất team (nêu rõ tên và số giờ của họ). Ví dụ: "• Lê Minh (6.21h), Lê Cao Minh Đức (5.85h) và Nguyễn Tiến Dũng (5.61h) có thời gian hỗ trợ cao nhất team."
   - Nêu rõ **Số Atc TB/ngày của team là [Average_TB_ATC_Ngay]** (Lấy đúng giá trị TB ATC/Ngày ở dòng Trung bình, ví dụ: 7.62).
   - Chỉ ra những nhân sự có số lượng hỗ trợ khách hàng trung bình (ATC/ngày) cao nhất. Ví dụ: "• Nguyễn Tiến Dũng (9.41), Lê Minh (8.65) và Nguyễn Hưng Hải (8.62) có số lượng hỗ trợ khách hàng trung bình cao nhất."
   - Chỉ ra những nhân sự có năng suất thấp nhất (ví dụ: trung bình < 7 ATC/ngày), và nêu rõ họ là các nhân sự có số lượng hỗ trợ khách hàng trung bình thấp nhất/ngày. Ví dụ: "• TB < 7 atc / ngày: Lương Trọng Đạo (6.60), Trịnh Đức Phong (6.87), Lê Cao Minh Đức (6.98) là các nhân sự có số lượng hỗ trợ khách hàng trung bình thấp nhất/ngày."
   - Nêu rõ **TB KM/ngày của team là [Average_TB_KM_Ngay] KM** (Lấy đúng giá trị TB KM/Ngày ở dòng Trung bình, ví dụ: 52.30 KM). Đồng thời, hãy chỉ ra nhân sự di chuyển trung bình nhiều nhất và ít nhất team (nêu rõ số KM của họ). Ví dụ: "• TB KM/ngày của team là 52.30 KM (Trong đó, Nguyễn Tiến Dũng (69.26 KM), Lê Minh Hiển (76.73 KM) di chuyển nhiều nhất; Phan Ngọc Nguyên (28.09 KM) di chuyển ít nhất)."

YÊU CẦU ĐỊNH DẠNG & CÔ ĐỌNG (BẮT BUỘC):
- Tuyệt đối không viết các mục "Đề xuất", "Mức độ nghiêm trọng", "Giải trình". Chỉ tập trung phân tích số liệu hiệu suất theo yêu cầu.
- Báo cáo phải bắt đầu trực tiếp bằng tiêu đề và các phân tích, không có bất kỳ lời mở đầu, lời chào xã giao hay lời kết luận nào khác.
- Các số liệu trung bình và tên nhân sự phải được trích xuất chính xác 100% từ bảng dữ liệu. Làm tròn các số thập phân đến 2 chữ số.`
        };

        if (typeof callGeminiAPI !== 'function') {
            throw new Error("Không tìm thấy hàm gọi Gemini API (callGeminiAPI)");
        }

        const aiReport = await callGeminiAPI([prompt], contextText);
        
        const now = new Date();
        const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        localStorage.setItem('ai_dalam_perf_text', aiReport);
        localStorage.setItem('ai_dalam_perf_time', timeStr);
        localStorage.setItem('ai_dalam_perf_range', currentRangeText);
        
        window.lastGeneratedReportText = aiReport;
        window.lastGeneratedReportRange = currentRangeText;

        container.innerHTML = `
            <div class="ai-report-content" style="font-size: 14px; line-height: 1.7;">
                ${formatMarkdownToHTML(aiReport)}
            </div>
        `;
        
        if (timeEl) timeEl.innerText = `Cập nhật lúc: ${timeStr}`;
        if (saveBtn) {
            saveBtn.style.display = 'inline-flex';
            saveBtn.innerText = "💾 Lưu vào Sheets";
            saveBtn.disabled = false;
            saveBtn.style.opacity = '1';
        }
    } catch (error) {
        console.error("AI Performance Report Error:", error);
        container.innerHTML = `<div style="color: #ef4444; font-weight: bold; padding: 15px;">❌ Lỗi phân tích AI: ${error.message}</div>`;
    }
}

function getDaLamDateRangeText() {
    const { fromDayVal, toDayVal } = getSelectedDateRange();
    return (fromDayVal && toDayVal) ? `${formatYYYYMMDDtoDDMMYYYY(fromDayVal)} - ${formatYYYYMMDDtoDDMMYYYY(toDayVal)}` : "Tất cả các ngày";
}

function saveAIAnomalyReportDaLam() {
    const reportText = window.lastGeneratedReportText;
    const reportRange = window.lastGeneratedReportRange;
    if (!reportText) {
        alert("Không có nội dung báo cáo để lưu!");
        return;
    }
    
    const saveBtn = document.getElementById('btnSaveAIAnomalyDaLam');
    if (saveBtn) {
        saveBtn.innerText = "⏳ Đang lưu...";
        saveBtn.disabled = true;
        saveBtn.style.opacity = '0.6';
    }
    
    const isPerf = window.activePivotDaLamReportType === 'performance';
    const payload = {
        dateRange: reportRange || "Tất cả",
        analysis: reportText,
        reportType: isPerf ? "performance" : "anomaly"
    };
    
    fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(() => {
        alert("✅ Báo cáo đã được lưu thành công vào Sheets! Anh vui lòng kiểm tra Sheet sau vài giây để xem kết quả nhé.");
        if (saveBtn) {
            saveBtn.innerText = "💾 Đã gửi";
            saveBtn.style.background = "#10b981";
            saveBtn.disabled = false;
            saveBtn.style.opacity = '1';
        }
    })
    .catch(err => {
        console.error("Lỗi lưu báo cáo:", err);
        alert("❌ Lỗi khi gửi báo cáo: " + err.message);
        if (saveBtn) {
            saveBtn.innerText = "💾 Lưu vào Sheets";
            saveBtn.disabled = false;
            saveBtn.style.opacity = '1';
        }
    });
}

function clearAIPivotDaLamAnalysis() {
    const activeReportType = window.activePivotDaLamReportType || localStorage.getItem('ai_dalam_active_report_type') || 'anomaly';
    if (activeReportType === 'performance') {
        localStorage.removeItem('ai_dalam_perf_text');
        localStorage.removeItem('ai_dalam_perf_time');
        localStorage.removeItem('ai_dalam_perf_range');
    } else {
        localStorage.removeItem('ai_dalam_analysis_text');
        localStorage.removeItem('ai_dalam_analysis_time');
        localStorage.removeItem('ai_dalam_analysis_range');
    }
    const wrapper = document.getElementById('aiAnalysisPivotDaLamContainer');
    if (wrapper) wrapper.classList.add('hidden');
}

