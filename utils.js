// --- UTILITY FUNCTIONS ---
const API_CACHE_KEY_PREFIX = "crm_dashboard_cache_v2_";
const CACHE_TTL = 3 * 60 * 1000; // 3 phút hết hạn cache

function saveToSessionCache(key, data) {
    try {
        let finalData = data;
        if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0] !== null && !Array.isArray(data[0])) {
            const headers = Object.keys(data[0]);
            const rows = data.map(obj => headers.map(k => obj[k] === undefined ? null : obj[k]));
            finalData = {
                headers: headers,
                rows: rows,
                _compressed: true
            };
        }
        
        const cacheObj = {
            timestamp: Date.now(),
            data: finalData
        };
        sessionStorage.setItem(API_CACHE_KEY_PREFIX + key, JSON.stringify(cacheObj));
    } catch (e) {
        console.warn("Lỗi lưu session cache:", e);
    }
}

function getFromSessionCache(key) {
    try {
        const cacheStr = sessionStorage.getItem(API_CACHE_KEY_PREFIX + key);
        if (!cacheStr) return null;
        
        const cacheObj = JSON.parse(cacheStr);
        const age = Date.now() - cacheObj.timestamp;
        if (age < CACHE_TTL) {
            let cachedData = cacheObj.data;
            if (cachedData && cachedData._compressed === true && Array.isArray(cachedData.headers) && Array.isArray(cachedData.rows)) {
                const headers = cachedData.headers;
                return cachedData.rows.map(row => {
                    const obj = {};
                    headers.forEach((k, idx) => {
                        obj[k] = row[idx];
                    });
                    return obj;
                });
            }
            return cachedData;
        }
        sessionStorage.removeItem(API_CACHE_KEY_PREFIX + key);
    } catch (e) {
        console.warn("Lỗi đọc session cache:", e);
    }
    return null;
}

function smartSort(a, b) {
    const aParts = a.split('|||');
    const bParts = b.split('|||');
    
    for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
        const aNum = Number(aParts[i]);
        const bNum = Number(bParts[i]);
        if (!isNaN(aNum) && !isNaN(bNum)) {
            if (aNum !== bNum) return aNum - bNum;
        } else {
            const comp = aParts[i].localeCompare(bParts[i], 'vi', {numeric: true});
            if (comp !== 0) return comp;
        }
    }
    return aParts.length - bParts.length;
}

function formatNumber(num) {
    if (Number.isInteger(num)) {
        return num.toLocaleString('vi-VN');
    }
    return num.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatTimeHelper(str) {
    if (!str) return '-';
    let t = String(str).trim();
    if (t.includes('T') && t.endsWith('Z')) {
        let d = new Date(t);
        if (!isNaN(d)) {
            let hh = String(d.getHours()).padStart(2, '0');
            let mm = String(d.getMinutes()).padStart(2, '0');
            let ss = String(d.getSeconds()).padStart(2, '0');
            return `${hh}:${mm}:${ss}`;
        }
    }
    if (t.includes(' ') && t.includes(':')) {
        return t.split(' ')[1] || t;
    }
    return t;
}

function isUpdateKey(key) {
    if (!key || typeof key !== 'string') return false;
    const upper = key.toUpperCase();
    return upper.includes("UPDATE") || 
           upper.includes("CẬP NHẬT") || 
           upper.includes("CAP NHAT") || 
           upper.includes("C?P NH?T") ||
           upper.includes("TỰ ĐỘNG") ||
           upper.includes("TU DONG") ||
           upper.includes("T? D?NG");
}

function getUpdateTimestamp(data) {
    if (!data) return null;
    let targetRow = null;
    if (Array.isArray(data) && data.length > 0) {
        targetRow = data[0];
    } else if (typeof data === 'object') {
        targetRow = data;
    }
    if (!targetRow) return null;

    const keys = Object.keys(targetRow);
    if (keys.length === 0) return null;

    // 1. Kiểm tra ô P1 (Cột P trong sheet data, vị trí index 15)
    if (keys.length >= 16) {
        const p1Key = keys[15]; // Cột P
        if (p1Key && (isUpdateKey(p1Key) || p1Key.includes(':') || p1Key.includes('/') || p1Key.includes('Cập nhật'))) {
            const val = targetRow[p1Key] !== undefined && targetRow[p1Key] !== null ? String(targetRow[p1Key]).trim() : '';
            if (val && (val.includes('/') || val.includes(':') || val.includes('-')) && val.length >= 8) {
                return `${p1Key}: ${val}`;
            }
            return p1Key;
        }
    }

    // 2. Tìm bất kỳ tiêu đề nào có chứa từ khóa Cập nhật tự động / Cập nhật / UPDATE
    const matchingKeys = keys.filter(k => isUpdateKey(k));
    if (matchingKeys.length > 0) {
        const key = matchingKeys[matchingKeys.length - 1];
        const val = targetRow[key] !== undefined && targetRow[key] !== null ? String(targetRow[key]).trim() : '';
        if (val && (val.includes('/') || val.includes(':') || val.includes('-')) && val.length >= 8) {
            return `${key}: ${val}`;
        }
        return key;
    }

    return null;
}



function isValidHieuSuatRow(row) {
    if (!row) return false;
    const staff = String(row['Người xử lý'] || '').trim();
    const retailer = String(row['Retailer ID'] || '').trim();
    const stt = String(row['STT'] || '').trim();
    const checkin = String(row['Thời gian checkin'] || row['Thời gian tạo'] || '').trim();

    if (!staff && !retailer && !stt) return false;
    if (staff === '0' || staff === '30' || retailer === '0') return false;
    if (checkin === '00:00' && !retailer && (!staff || staff === '0' || staff === '30')) return false;

    return true;
}

function normalizeNgayCongData(rawData) {
    if (!Array.isArray(rawData) || rawData.length === 0) return [];

    const firstRow = rawData[0];
    if (!firstRow || typeof firstRow !== 'object') return rawData;

    // Direct check: if already has standard keys 'Tên NS', 'Họ và tên', 'staff', or 'Chấm công'
    const keys0 = Object.keys(firstRow);
    const hasStandardKeys = keys0.some(k => k === 'Tên NS' || k === 'Họ và tên' || k === 'staff' || k === 'Chấm công');
    if (hasStandardKeys) {
        return rawData;
    }

    // Headerless format: Row 1 was consumed as header keys by Google Apps Script
    const result = [];
    const headerStaffName = keys0.find(k => k.includes('-') || /[a-zA-ZÀ-ỹ]/.test(k));
    const headerWorkdayKey = keys0.find(k => k !== headerStaffName);

    if (headerStaffName) {
        const workDayVal = headerWorkdayKey ? (Number(headerWorkdayKey) || 0) : 0;
        result.push({
            'Tên NS': headerStaffName.trim(),
            'T công': workDayVal
        });
    }

    rawData.forEach(row => {
        let staffName = '';
        let workDayVal = 0;

        Object.keys(row).forEach(k => {
            const val = row[k];
            if (typeof val === 'string' && (val.includes('-') || /[a-zA-ZÀ-ỹ]/.test(val))) {
                staffName = val.trim();
            } else if (val !== null && val !== undefined && !isNaN(Number(val))) {
                workDayVal = Number(val);
            }
        });

        if (staffName) {
            result.push({
                'Tên NS': staffName,
                'T công': workDayVal
            });
        }
    });

    return result;
}
