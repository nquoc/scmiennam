// --- TAB TRA CỨU & BÁO CÁO ATC ---

function isPercentHeader(header, cellVal) {
    if (!header) return false;
    let h = String(header).trim();
    let hLower = h.toLowerCase();
    
    // Any column containing '%' in its header name is a percentage column
    if (hLower.includes('%')) return true;

    // 'KPI Tổng' (or 'kpi tổng') overall KPI percentage column
    if (h === 'KPI Tổng' || hLower === 'kpi tổng' || hLower === 'kpi tống') {
        if (cellVal !== undefined && cellVal !== null && cellVal !== '-' && cellVal !== '') {
            let s = String(cellVal).trim();
            if (s.endsWith('%')) return true;
            let n = parseFloat(s);
            // If n <= 5 (e.g. 0.94131 or 1.04), it's the KPI ratio score percentage column.
            // If n >= 50 (e.g. 300, 400, 500), it's the target points column.
            if (!isNaN(n) && n <= 5) return true;
            return false;
        }
        return true;
    }
    return false;
}

function getPercentFloat(cellVal, headerName) {
    if (cellVal === '-' || cellVal === '' || cellVal === undefined || cellVal === null) return null;
    let val = String(cellVal).trim();

    // If string already has %, extract numeric value (e.g. "82.35%" -> 82.35)
    if (val.endsWith('%')) {
        let num = parseFloat(val.replace('%', ''));
        return isNaN(num) ? null : num;
    }

    let num = parseFloat(val);
    if (isNaN(num)) return null;

    // Convert decimal ratios (e.g. 0.75 -> 75%, 1.25 -> 125%, 1.0233 -> 102.33%) to percentage scale
    if (isPercentHeader(headerName, cellVal)) {
        if (num <= 10.0) {
            return num * 100;
        }
    }
    return num;
}

function setupFilters(data) {
    if (currentTab === 'data' || currentTab === 'pivot') {
        const sources = [...new Set(data.map(item => item['Nguồn data']).filter(Boolean))].sort();
        const sourceSelect = document.getElementById('sourceFilter');
        sourceSelect.innerHTML = '<option value="">🏢 Nguồn data</option>';
        sources.forEach(s => { sourceSelect.innerHTML += `<option value="${s}">${s}</option>`; });

        const provinces = [...new Set(data.map(item => item['Tỉnh/Thành phố']).filter(Boolean))].sort();
        const provinceSelect = document.getElementById('provinceFilter');
        provinceSelect.innerHTML = '<option value="">🗺️ Tỉnh/Thành</option>';
        provinces.forEach(p => { provinceSelect.innerHTML += `<option value="${p}">${p}</option>`; });

        const staffs = [...new Set(data.map(item => item['Người xử lý']).filter(Boolean))].sort();
        const staffSelect = document.getElementById('staffFilter');
        staffSelect.innerHTML = '<option value="">👨‍💼 Nhân sự</option>';
        staffs.forEach(s => { staffSelect.innerHTML += `<option value="${s}">${s}</option>`; });
    } else if (currentTab === 'atcdalam') {
        const staffs = [...new Set(data.map(item => item['Người xử lý']).filter(Boolean))].sort();
        const staffSelect = document.getElementById('staffFilterATC');
        staffSelect.innerHTML = '<option value="">👨‍💼 Nhân sự</option>';
        staffs.forEach(s => { staffSelect.innerHTML += `<option value="${s}">${s}</option>`; });
    } else if (currentTab === 'kpi') {
        populateLevelKPIFilter(data);
    }
}

const genHTML = (obj, filterType) => {
    const entries = Object.entries(obj).sort((a, b) => b[1] - a[1]);
    let total = entries.reduce((sum, item) => sum + item[1], 0);
    
    if (entries.length === 0) {
        return `<li class="stat-item empty" style="text-align:center; color:#94a3b8; font-style:italic; padding:15px 0; justify-content:center;">Không có dữ liệu</li>`;
    }

    if (currentTab === 'data') {
        const maxVal = entries[0] ? entries[0][1] : 1;
        const isOverdue = filterType.includes('overdue');

        const itemsHtml = entries.map(([key, val]) => {
            const pctOfTotal = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
            const barWidth = maxVal > 0 ? ((val / maxVal) * 100).toFixed(1) : 0;
            const barColor = isOverdue ? 'rgba(239, 68, 68, 0.18)' : 'rgba(99, 102, 241, 0.15)';

            return `<li class="stat-item" onclick="triggerFilter('${filterType}', '${key.replace(/'/g, "\\'")}')" title="${key}: ${val} ca (${pctOfTotal}%)">
                <div class="stat-item-bar" style="width: ${barWidth}%; background: ${barColor};"></div>
                <span class="stat-name">${key}</span>
                <div class="stat-val-group">
                    <span class="stat-pct">${pctOfTotal}%</span>
                    <span class="stat-val ${isOverdue ? 'overdue' : ''}">${val}</span>
                </div>
            </li>`;
        }).join('');
        
        return itemsHtml + `
            <li class="stat-item stat-total-footer">
                <span class="total-label">TỔNG CỘNG</span>
                <span class="total-val">${total.toLocaleString('vi-VN')}</span>
            </li>
        `;
    } else {
        const itemsHtml = entries.map(([key, val]) => {
            return `<li class="stat-item" onclick="triggerFilter('${filterType}', '${key.replace(/'/g, "\\'")}')">
                <span class="stat-name">${key}</span>
                <span class="stat-val">${val}</span>
            </li>`;
        }).join('');
        
        return itemsHtml + `
            <li class="stat-item" style="position: sticky; bottom: 0; background: #f8fafc; border-top: 2px solid #cbd5e1; font-weight: bold; cursor: default; z-index: 5; justify-content: space-between;">
                <span style="color: #334155; text-transform: uppercase;">TỔNG CỘNG</span>
                <span style="color: #ef4444; font-size: 15px;">${total}</span>
            </li>
        `;
    }
};

function renderDashboard(data) {
    if (currentTab === 'data') {
        let pendingByProv = {};
        let pendingByStaff = {};
        let overdueByProv = {};
        let overdueByStaff = {};
        
        data.forEach(row => {
            let prov = row['Tỉnh/Thành phố'];
            let staff = row['Người xử lý'];
            let sla = Number(row['SLA']);
            
            if (prov) pendingByProv[prov] = (pendingByProv[prov] || 0) + 1;
            if (staff) pendingByStaff[staff] = (pendingByStaff[staff] || 0) + 1;
            
            if (!isNaN(sla) && sla >= 9) {
                if (prov) overdueByProv[prov] = (overdueByProv[prov] || 0) + 1;
                if (staff) overdueByStaff[staff] = (overdueByStaff[staff] || 0) + 1;
            }
        });

        const totalCases = data.length;
        const totalOverdue = Object.values(overdueByProv).reduce((a, b) => a + b, 0);
        const topProv = Object.entries(pendingByProv).sort((a, b) => b[1] - a[1])[0];
        const topStaff = Object.entries(pendingByStaff).sort((a, b) => b[1] - a[1])[0];

        const topProvText = topProv ? `${topProv[0]} (${topProv[1]} ca)` : 'Không';
        const topStaffText = topStaff ? `${topStaff[0]} (${topStaff[1]} ca)` : 'Không';

        const summaryHtml = `
            <div class="treo-kpi-card kpi-blue">
                <div class="kpi-info">
                    <span class="kpi-title">📦 TỔNG DATA TREO</span>
                    <span class="kpi-number">${totalCases.toLocaleString('vi-VN')} <small>ca</small></span>
                </div>
            </div>
            <div class="treo-kpi-card kpi-red ${totalOverdue > 0 ? 'pulse-alert' : ''}">
                <div class="kpi-info">
                    <span class="kpi-title">🚨 TRỄ SLA (≥ 9 NGÀY)</span>
                    <span class="kpi-number">${totalOverdue.toLocaleString('vi-VN')} <small>ca</small></span>
                </div>
            </div>
            <div class="treo-kpi-card kpi-purple">
                <div class="kpi-info">
                    <span class="kpi-title">📍 TOP TỈNH TREO</span>
                    <span class="kpi-value-str" title="${topProvText}">${topProvText}</span>
                </div>
            </div>
            <div class="treo-kpi-card kpi-amber">
                <div class="kpi-info">
                    <span class="kpi-title">👨‍💼 TOP NS TREO</span>
                    <span class="kpi-value-str" title="${topStaffText}">${topStaffText}</span>
                </div>
            </div>
        `;

        const summaryContainer = document.getElementById('dashTreoSummaryCards');
        if (summaryContainer) summaryContainer.innerHTML = summaryHtml;

        document.getElementById('dashPendingProv').innerHTML = genHTML(pendingByProv, 'province');
        document.getElementById('dashPendingStaff').innerHTML = genHTML(pendingByStaff, 'staff');
        document.getElementById('dashOverdueProv').innerHTML = genHTML(overdueByProv, 'province-overdue');
        document.getElementById('dashOverdueStaff').innerHTML = genHTML(overdueByStaff, 'staff-overdue');
    } else if (currentTab === 'atcdalam') {
        let errStatus = {};
        let errDesc = {};
        let errTemplate = {};
        
        data.forEach(row => {
            let staff = row['Người xử lý'];
            if (!staff) return;
            
            let status = row['Tình trạng xử lý'];
            // Lỗi Tình trạng: nếu khác "Đã làm"
            if (status && String(status).trim().toLowerCase() !== "đã làm") {
                errStatus[staff] = (errStatus[staff] || 0) + 1;
            }
            
            // Lỗi Mô tả: CheckMoTa < 80
            let checkMoTa = Number(row['CheckMoTa']);
            if (!isNaN(checkMoTa) && checkMoTa < 80) {
                errDesc[staff] = (errDesc[staff] || 0) + 1;
            }

            // Lỗi Template
            let moTa = String(row['Mô tả'] || "");
            if (moTa.includes('Số ngày active last 30 day') || moTa.includes('Nguyên nhân Inactive gần nhất')) {
                errTemplate[staff] = (errTemplate[staff] || 0) + 1;
            }
        });

        document.getElementById('dashErrStatus').innerHTML = genHTML(errStatus, 'err-status');
        document.getElementById('dashErrDesc').innerHTML = genHTML(errDesc, 'err-desc');
        document.getElementById('dashErrTemplate').innerHTML = genHTML(errTemplate, 'err-template');
    }
}

function updateWards() {
    if (currentTab !== 'data') return;
    const selectedProv = document.getElementById('provinceFilter').value;
    const wardSelect = document.getElementById('wardFilter');
    wardSelect.innerHTML = '<option value="">Xã/Phường (Tất cả)</option>';
    
    if (!selectedProv) {
        wardSelect.disabled = true;
        wardSelect.innerHTML = '<option value="">Xã/Phường (Chọn Tỉnh trước)</option>';
        return;
    }
    
    wardSelect.disabled = false;
    const wards = [...new Set(allData.filter(item => item['Tỉnh/Thành phố'] === selectedProv).map(item => item['Xã/Phường/Thị trấn']).filter(Boolean))].sort();
    wards.forEach(w => { wardSelect.innerHTML += `<option value="${w}">${w}</option>`; });
}

// Bắt sự kiện thay đổi Tỉnh thành
const provinceFilterEl = document.getElementById('provinceFilter');
if (provinceFilterEl) {
    provinceFilterEl.addEventListener('change', updateWards);
}

function triggerFilter(type, value) {
    document.getElementById('searchInput').value = "";
    
    if (currentTab === 'data') {
        document.getElementById('sourceFilter').value = "";
        document.getElementById('provinceFilter').value = "";
        document.getElementById('wardFilter').value = "";
        document.getElementById('wardFilter').disabled = true;
        document.getElementById('staffFilter').value = "";
        document.getElementById('slaFilter').value = "";

        if (type === 'province' || type === 'province-overdue') {
            const sel = document.getElementById('provinceFilter');
            if ([...sel.options].some(o => o.value === value)) sel.value = value;
            updateWards();
        } 
        if (type === 'staff' || type === 'staff-overdue') {
            const sel = document.getElementById('staffFilter');
            if ([...sel.options].some(o => o.value === value)) sel.value = value;
        }
        if (type === 'province-overdue' || type === 'staff-overdue') {
            document.getElementById('slaFilter').value = ">=9";
        }
    } else if (currentTab === 'atcdalam') {
        document.getElementById('staffFilterATC').value = "";
        document.getElementById('errorTypeFilter').value = "";
        
        const sel = document.getElementById('staffFilterATC');
        if ([...sel.options].some(o => o.value === value)) sel.value = value;
        
        if (type === 'err-status') document.getElementById('errorTypeFilter').value = "status";
        if (type === 'err-desc') document.getElementById('errorTypeFilter').value = "desc";
        if (type === 'err-template') document.getElementById('errorTypeFilter').value = "template";
    }
    
    applyFilters();
    document.querySelector('.search-section').scrollIntoView({behavior: 'smooth'});
}

function applyFilters() {
    if (currentTab === 'thongke') {
        if (typeof applyFiltersThongKe === 'function') applyFiltersThongKe();
        return;
    }
    
    const keyword = document.getElementById('searchInput').value.toLowerCase().trim();
    let filterTexts = [];
    let filteredData = [];
    
    if (keyword) filterTexts.push(`Từ khóa: "${keyword}"`);
    
    if (currentTab === 'data' || currentTab === 'pivot') {
        const selectedSource = document.getElementById('sourceFilter').value;
        const selectedProvince = document.getElementById('provinceFilter').value;
        const selectedWard = document.getElementById('wardFilter').value;
        const selectedSLA = document.getElementById('slaFilter').value;
        const selectedStaff = document.getElementById('staffFilter').value;
        
        if (selectedSource) filterTexts.push(`Nguồn: ${selectedSource}`);
        if (selectedProvince) filterTexts.push(`Tỉnh/Thành: ${selectedProvince}`);
        if (selectedWard) filterTexts.push(`Xã/Phường: ${selectedWard}`);
        if (selectedSLA === ">=9") filterTexts.push(`SLA: Trễ hạn (>= 9)`);
        if (selectedStaff) filterTexts.push(`Nhân sự: ${selectedStaff}`);
        
        if (filterTexts.length === 0) {
            if (currentTab === 'data') {
                window.pivotFilteredData = window.pivotRawData;
                if (typeof calculatePivot === 'function') calculatePivot();
                showEmptyFilterMsg();
            } else {
                showEmptyFilterMsg();
            }
            return;
        }
        
        const targetData = (currentTab === 'pivot') ? window.pivotRawData : allData;
        filteredData = targetData.filter(row => {
            const matchKeyword = Object.values(row).some(value => String(value).toLowerCase().includes(keyword));
            const matchSource = selectedSource === "" || row['Nguồn data'] === selectedSource;
            const matchProvince = selectedProvince === "" || row['Tỉnh/Thành phố'] === selectedProvince;
            const matchWard = selectedWard === "" || row['Xã/Phường/Thị trấn'] === selectedWard;
            const matchStaff = selectedStaff === "" || row['Người xử lý'] === selectedStaff;
            let matchSLA = true;
            if (selectedSLA === ">=9") {
                matchSLA = !isNaN(row['SLA']) && Number(row['SLA']) >= 9;
            }
            return matchKeyword && matchSource && matchProvince && matchWard && matchSLA && matchStaff;
        });
    } else if (currentTab === 'atcdalam') {
        const selectedStaff = document.getElementById('staffFilterATC').value;
        const errorType = document.getElementById('errorTypeFilter').value;
        
        if (selectedStaff) filterTexts.push(`Nhân sự: ${selectedStaff}`);
        if (errorType === "status") filterTexts.push(`Lỗi: Tình trạng (Chưa làm)`);
        if (errorType === "desc") filterTexts.push(`Lỗi: Mô tả chưa viết(<80)`);
        if (errorType === "template") filterTexts.push(`Lỗi: Template (Chưa sửa/xóa)`);
        
        if (filterTexts.length === 0) {
            showEmptyFilterMsg();
            return;
        }
        
        filteredData = allData.filter(row => {
            const matchStaff = selectedStaff === "" || row['Người xử lý'] === selectedStaff;
            
            let matchError = true;
            if (errorType === "status") {
                let status = row['Tình trạng xử lý'];
                matchError = (status && String(status).trim().toLowerCase() !== "đã làm");
            } else if (errorType === "desc") {
                let checkMoTa = Number(row['CheckMoTa']);
                matchError = (!isNaN(checkMoTa) && checkMoTa < 80);
            } else if (errorType === "template") {
                let moTa = String(row['Mô tả'] || "");
                matchError = moTa.includes('Số ngày active last 30 day') || moTa.includes('Nguyên nhân Inactive gần nhất');
            }
            
            return matchStaff && matchError;
        });
    } else if (currentTab === 'kpi') {
        const selectedLevels = getSelectedMultiselectValuesKPI('levelFilterKPIOptions');
        if (selectedLevels.length > 0) {
            filterTexts.push(`Cấp độ: ${selectedLevels.map(l => String(l).replace(/level\s*/i, 'Level ')).join(', ')}`);
        }
        filteredData = allData.filter(row => {
            const matchLevel = selectedLevels.includes(row['Level']);
            const matchKeyword = Object.values(row).some(value => String(value).toLowerCase().includes(keyword));
            return matchLevel && matchKeyword;
        });
    }
    
    if (currentTab === 'data') {
        document.getElementById('activeFilters').innerHTML = 'Đang lọc theo: <span style="color:#ef4444; font-weight: bold;">' + filterTexts.join(' | ') + '</span>';
        renderTable(filteredData);
        window.pivotFilteredData = filteredData;
        if (typeof calculatePivot === 'function') calculatePivot();
    } else {
        document.getElementById('activeFilters').innerHTML = 'Đang lọc theo: <span style="color:#ef4444; font-weight: bold;">' + filterTexts.join(' | ') + '</span>';
        renderTable(filteredData);
    }
}

function showEmptyFilterMsg() {
    document.getElementById('recordCount').innerText = '0';
    document.getElementById('activeFilters').innerHTML = '';
    document.getElementById('tableHead').innerHTML = '';
    document.getElementById('tableBody').innerHTML = '<tr><td colspan="100%" style="text-align:center; padding: 30px; font-style: italic; color: #64748b;">Vui lòng sử dụng bộ lọc và bấm "Tìm kiếm" hoặc chạm vào bảng thống kê ở trên để hiển thị dữ liệu</td></tr>';
}

const searchBtnEl = document.getElementById('searchBtn');
if (searchBtnEl) {
    searchBtnEl.addEventListener('click', applyFilters);
}
const searchInputEl = document.getElementById('searchInput');
if (searchInputEl) {
    searchInputEl.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') applyFilters();
    });
}

function renderTable(data) {
    document.getElementById('recordCount').innerText = data.length;
    const thead = document.getElementById('tableHead');
    const tbody = document.getElementById('tableBody');
    thead.innerHTML = ''; tbody.innerHTML = '';

    if(data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%" style="text-align:center; padding: 30px; font-style: italic; color: #64748b;">Không tìm thấy dữ liệu phù hợp</td></tr>';
        return;
    }

    const headers = Object.keys(data[0]).filter(h => {
        if (h.toUpperCase().includes('UPDATE')) return false;
        if (currentTab === 'data') {
            if (h === 'Mô tả' || h === 'Loại công việc') return false;
        } else if (currentTab === 'atcdalam') {
            const allowedATC = ['Retailer ID', 'Người xử lý', 'Tỉnh/Thành phố', 'Tình trạng xử lý', 'Thời gian checkin', 'Mô tả', 'Địa điểm thực tế cửa hàng', 'Địa điểm'];
            if (!allowedATC.includes(h)) return false;
        }
        return true;
    });
    let trHead = '<tr>';
    headers.forEach(header => { trHead += `<th>${header}</th>`; });
    trHead += '</tr>';
    thead.innerHTML = trHead;

    let trBody = '';
    const rowClass = currentTab === 'data' ? 'is-data-tab' : 'is-atc-tab';
    
    if (currentTab === 'kpi') {
        document.getElementById('dataTable').classList.add('kpi-style');
    } else {
        document.getElementById('dataTable').classList.remove('kpi-style');
    }
    
    window.displayedData = []; // Clear old data array
    
    data.forEach((row, index) => {
        window.displayedData.push(row);
        trBody += `<tr class="${rowClass}" onclick="openModal(${index})">`;
        headers.forEach(header => { 
            let cellVal = row[header] || '-';
            if (currentTab === 'kpi') {
                if (header === 'Tên SC') {
                    let parts = String(cellVal).split(" - ");
                    if (parts.length >= 2) cellVal = parts[1];
                } else if (header === 'Level') {
                    cellVal = String(cellVal).replace(/level\s*/i, '').trim();
                } else if (isPercentHeader(header, cellVal)) {
                    let pVal = getPercentFloat(cellVal, header);
                    if (pVal !== null) {
                        cellVal = pVal.toFixed(2) + '%';
                    }
                }
            }
            if (header === 'Mô tả' && cellVal !== '-' && cellVal.length > 50) {
                cellVal = cellVal.substring(0, 50) + '...........';
            }

            // Apply conditional color styling for KPI columns
            let cellClass = '';
            if (currentTab === 'kpi' && isPercentHeader(header, row[header])) {
                let pVal = getPercentFloat(row[header], header);
                if (pVal !== null) {
                    if (pVal < 50) cellClass = 'kpi-perf-bad';
                    else if (pVal < 70) cellClass = 'kpi-perf-medium';
                    else cellClass = 'kpi-perf-good';
                }
            }

            if(header === 'Retailer ID' || (currentTab === 'atcdalam' && header === 'Người xử lý')) {
                trBody += `<td data-label="${header}" class="clickable-id">${cellVal}</td>`;
            } else {
                let classAttr = cellClass ? ` class="${cellClass}"` : '';
                trBody += `<td data-label="${header}"${classAttr}>${cellVal}</td>`; 
            }
        });
        trBody += '</tr>';
    });

    // If on KPI tab, calculate and append total/average row
    if (currentTab === 'kpi') {
        let sumDaLam = 0;
        data.forEach(row => {
            if (row['Đã làm'] !== undefined && row['Đã làm'] !== null && row['Đã làm'] !== '') {
                let val = parseFloat(row['Đã làm']);
                if (!isNaN(val)) {
                    sumDaLam += val;
                }
            }
        });

        let trTotal = '<tr class="total-row">';
        headers.forEach(header => {
            let hLower = String(header).trim().toLowerCase();
            if (header === 'Tên SC' || hLower === 'tên sc') {
                trTotal += `<td>Tổng cộng / Trung bình</td>`;
            } else if (header === 'Đã làm' || hLower === 'đã làm') {
                trTotal += `<td>${sumDaLam}</td>`;
            } else if (isPercentHeader(header, data[0] ? data[0][header] : null)) {
                let sum = 0;
                let count = 0;
                data.forEach(r => {
                    let pVal = getPercentFloat(r[header], header);
                    if (pVal !== null) {
                        sum += pVal;
                        count++;
                    }
                });
                let avg = count > 0 ? (sum / count) : null;
                let cellVal = avg !== null ? avg.toFixed(2) + '%' : '-';
                trTotal += `<td>${cellVal}</td>`;
            } else {
                trTotal += `<td>-</td>`;
            }
        });
        trTotal += '</tr>';
        trBody += trTotal;
    }

    tbody.innerHTML = trBody;
}

function openModal(index) {
    const detailData = window.displayedData[index];
    if(!detailData) return;

    let detailHtml = '';
    for (const [key, value] of Object.entries(detailData)) {
        if (key.toUpperCase().includes("UPDATE")) continue;
        let displayVal = value;
        if (currentTab === 'kpi') {
            if (key === 'Tên SC') {
                let parts = String(value).split(" - ");
                if (parts.length >= 2) displayVal = parts[1];
            } else if (key === 'Level') {
                displayVal = String(value).replace(/level\s*/i, '').trim();
            } else if (isPercentHeader(key, value)) {
                let pVal = getPercentFloat(value, key);
                if (pVal !== null) {
                    displayVal = pVal.toFixed(2) + '%';
                }
            }
        }
        detailHtml += `
            <div class="detail-item">
                <span class="detail-label">${key}</span>
                <span class="detail-value">${displayVal !== "" ? displayVal : "<em style='color:#9ca3af;'>Chưa cập nhật</em>"}</span>
            </div>
        `;
    }

    document.getElementById('modalBody').innerHTML = detailHtml;
    document.getElementById('detailModal').style.display = 'flex';
}

function copyErrorBaoCao() {
    const selectedStaff = document.getElementById('staffFilterATC') ? document.getElementById('staffFilterATC').value : "";
    const errorType = document.getElementById('errorTypeFilter') ? document.getElementById('errorTypeFilter').value : "";
    
    let dataToProcess = [];
    if (selectedStaff || errorType) {
        dataToProcess = window.displayedData || [];
    } else {
        dataToProcess = allData || [];
    }

    if (dataToProcess.length === 0) {
        alert("Không có dữ liệu lỗi nào để copy!");
        return;
    }

    const reportData = {};

    dataToProcess.forEach(row => {
        const staff = String(row['Người xử lý'] || 'Không rõ').trim();
        if (!staff) return;

        const errors = [];

        const status = row['Tình trạng xử lý'];
        if (status && String(status).trim().toLowerCase() !== "đã làm") {
            errors.push("Chưa làm");
        }

        const checkMoTa = Number(row['CheckMoTa']);
        if (!isNaN(checkMoTa) && checkMoTa < 80) {
            errors.push("Mô tả < 80");
        }



        const moTa = String(row['Mô tả'] || "");
        if (moTa.includes('Số ngày active last 30 day') || moTa.includes('Nguyên nhân Inactive gần nhất')) {
            errors.push("Chưa sửa Template");
        }

        if (errors.length > 0) {
            const id = row['Retailer ID'] || '-';
            if (!reportData[staff]) {
                reportData[staff] = {};
            }
            errors.forEach(err => {
                if (!reportData[staff][err]) {
                    reportData[staff][err] = [];
                }
                if (!reportData[staff][err].includes(id)) {
                    reportData[staff][err].push(id);
                }
            });
        }
    });

    const staffList = Object.keys(reportData).sort();
    if (staffList.length === 0) {
        alert("Không tìm thấy lỗi nào để lập báo cáo!");
        return;
    }

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const dateStr = `${dd}/${mm}/${yyyy}`;

    let content = `📢 BÁO CÁO LỖI GHI NHẬN ATC (${dateStr})\n`;
    content += `---------------------------------------\n`;

    staffList.forEach(staff => {
        content += `👤 ${staff}:\n`;
        const errTypes = Object.keys(reportData[staff]);
        errTypes.forEach(err => {
            const ids = reportData[staff][err].join(', ');
            content += `- ${err}: ${ids}\n`;
        });
        content += `\n`;
    });

    content += `➡️ Các bạn kiểm tra lại và sửa sớm trên CRM nhé!`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(content).then(() => {
            alert("Đã copy báo cáo lỗi vào khay nhớ tạm!");
        }).catch(err => {
            fallbackCopyText(content);
        });
    } else {
        fallbackCopyText(content);
    }
}

function fallbackCopyText(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            alert("Đã copy báo cáo lỗi vào khay nhớ tạm!");
        } else {
            alert("Không thể tự động copy. Vui lòng thử lại!");
        }
    } catch (err) {
        alert("Không thể tự động copy. Vui lòng thử lại!");
    }
    document.body.removeChild(textArea);
}

if (typeof formatMarkdownToHTML !== 'function') {
    window.formatMarkdownToHTML = function(text) {
        if (!text) return "";
        let clean = String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        clean = clean.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        clean = clean.replace(/\*(.*?)\*/g, '<em>$1</em>');
        clean = clean.replace(/\n/g, '<br>');
        return clean;
    };
}

async function runAIKPIAnalysis(forceRefresh = false) {
    const container = document.getElementById('aiAnalysisKPIBody');
    const wrapper = document.getElementById('aiAnalysisKPIContainer');
    const timeEl = document.getElementById('aiAnalysisKPITime');
    if (!container) return;

    const cachedText = localStorage.getItem('ai_kpi_analysis_text');
    const cachedTime = localStorage.getItem('ai_kpi_analysis_time');
    
    if (wrapper) wrapper.classList.remove('hidden');

    if (!forceRefresh && (!cachedText || !cachedTime)) {
        container.innerHTML = `<div style="color: #64748b; font-style: italic; padding: 15px; text-align: center;">Chưa có phân tích KPI. Vui lòng bấm "Phân tích AI / Tải lại" ở phía trên để bắt đầu phân tích.</div>`;
        if (timeEl) timeEl.innerText = `Chưa phân tích`;
        return;
    }

    if (!forceRefresh && cachedText && cachedTime) {
        container.innerHTML = formatMarkdownToHTML(cachedText);
        if (timeEl) timeEl.innerText = `Cập nhật lúc: ${cachedTime}`;
        return;
    }

    container.innerHTML = `<div class="ai-loading">⏳ AI đang đọc bảng điểm KPI và phân tích, anh chờ xíu nhé...</div>`;
    
    try {
        if (!allData || allData.length === 0) {
            container.innerHTML = `<div style="color: #64748b; font-style: italic;">Không có dữ liệu KPI để phân tích.</div>`;
            return;
        }

        // Format data to pass to Gemini
        const kpiRows = allData.map(row => {
            let name = row['Tên SC'] || '-';
            let parts = String(name).split(" - ");
            if (parts.length >= 2) name = parts[1];
            
            let lvl = String(row['Level'] || '-').replace(/level\s*/i, '').trim();
            
            let pImpact = getPercentFloat(row['% impact'], '% impact');
            let pKPIActive = getPercentFloat(row['% KPI active'], '% KPI active');
            let pDiemTong = getPercentFloat(row['% Điểm tổng'], '% Điểm tổng');
            let pDiemAddon = getPercentFloat(row['% Điểm addon'], '% Điểm addon');
            let pKPITong = getPercentFloat(row['KPI Tổng'], 'KPI Tổng');

            return {
                name: name,
                level: `Level ${lvl}`,
                daLam: row['Đã làm'] || 0,
                actImpact: row['Act impact'] || 0,
                pctImpact: pImpact !== null ? pImpact.toFixed(2) + '%' : '-',
                kpiActive: row['KPI active'] || 0,
                active: row['active'] || 0,
                pctKPIActive: pKPIActive !== null ? pKPIActive.toFixed(2) + '%' : '-',
                kpiTong: row['KPI tổng'] || 0,
                tongDiem: row['Tổng điểm'] || 0,
                pctDiemTong: pDiemTong !== null ? pDiemTong.toFixed(2) + '%' : '-',
                kpiAddon: row['KPI addon'] || 0,
                diemAddon: row['Điểm addon'] || 0,
                pctDiemAddon: pDiemAddon !== null ? pDiemAddon.toFixed(2) + '%' : '-',
                kpiTongOverall: pKPITong !== null ? pKPITong.toFixed(2) + '%' : '-'
            };
        });

        // Stringify rows for prompt
        const rowsText = kpiRows.map(r => 
            `- SC: ${r.name} (${r.level}) | Đã làm: ${r.daLam} | Act impact: ${r.actImpact} | Tỉ lệ impact: ${r.pctImpact} | KPI active: ${r.kpiActive} | active: ${r.active} | Tỉ lệ active: ${r.pctKPIActive} | Tổng điểm: ${r.tongDiem}/${r.kpiTong} (${r.pctDiemTong}) | Điểm addon: ${r.diemAddon}/${r.kpiAddon} (${r.pctDiemAddon}) | KPI Tổng: ${r.kpiTongOverall}`
        ).join('\n');

        const today = new Date();
        const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

        const prompt = `Hãy đóng vai trò là một chuyên gia phân tích hiệu suất nhân sự Customer Success (SC) thông minh. Dưới đây là bảng điểm KPI của đội ngũ SC gửi tới anh Quốc (dữ liệu tính tới ngày hiện tại là ${todayStr}):

DANH SÁCH KPI SC:
${rowsText}

Nhiệm vụ của bạn là viết một bản phân tích hiệu suất cơ bản, đi thẳng vào vấn đề theo các đề mục sau:
- 📅 Thời điểm báo cáo: Nhấn mạnh rõ ràng báo cáo này tính tới ngày hiện tại là ngày ${todayStr}.
- 🎯 Đạt KPI Active: Liệt kê các nhân sự đạt hoặc vượt mục tiêu KPI active (tỉ lệ active >= 100% hoặc đạt kết quả tốt nhất).
- 🧩 Đạt KPI Addon: Liệt kê các nhân sự đạt hoặc vượt điểm addon (tỉ lệ addon >= 100% hoặc đạt kết quả tốt nhất).
- 🏆 Đạt KPI Tổng: Liệt kê các nhân sự có điểm KPI Tổng cao nhất (đạt mục tiêu chung xuất sắc).
- 🚨 Cảnh báo hiệu suất kém: Chỉ liệt kê ĐÚNG 2 nhân sự có hiệu suất kém nhất trong danh sách kèm theo chẩn đoán lý do ngắn gọn vì sao kém (ví dụ: do thiếu ca đi Đã làm, tỉ lệ active thấp, hay hụt điểm addon).

Yêu cầu định dạng:
- Báo cáo viết cực kỳ ngắn gọn, súc tích bằng tiếng Việt tự nhiên và thân thiện với anh Quốc.
- Sử dụng các bullet points rõ ràng và icon phù hợp.`;

        if (typeof callGeminiAPI !== 'function') {
            throw new Error("Không tìm thấy hàm gọi Gemini API (callGeminiAPI)");
        }

        const history = [{ role: 'user', text: prompt }];
        const responseText = await callGeminiAPI(history, "Bạn là chuyên gia phân tích hiệu suất KPI SC của anh Quốc.");
        
        const now = new Date();
        const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        localStorage.setItem('ai_kpi_analysis_text', responseText);
        localStorage.setItem('ai_kpi_analysis_time', timeStr);
        
        container.innerHTML = formatMarkdownToHTML(responseText);
        if (timeEl) timeEl.innerText = `Cập nhật lúc: ${timeStr}`;
    } catch (error) {
        console.error("AI KPI Analysis Error:", error);
        container.innerHTML = `<div style="color: #ef4444; font-weight: bold; padding: 15px;">❌ Lỗi phân tích AI: ${error.message}</div>`;
    }
}

function clearAIKPIAnalysis() {
    localStorage.removeItem('ai_kpi_analysis_text');
    localStorage.removeItem('ai_kpi_analysis_time');
    const wrapper = document.getElementById('aiAnalysisKPIContainer');
    if (wrapper) wrapper.classList.add('hidden');
}

function populateLevelKPIFilter(data) {
    const optionsPanel = document.getElementById('levelFilterKPIOptions');
    if (!optionsPanel) return;
    
    const rawLevels = [...new Set(data.map(item => item['Level']).filter(Boolean))];
    rawLevels.sort((a, b) => {
        let numA = parseInt(String(a).replace(/level\s*/i, '').trim()) || 0;
        let numB = parseInt(String(b).replace(/level\s*/i, '').trim()) || 0;
        return numA - numB;
    });

    let html = `
        <div class="multiselect-option select-all-option">
            <input type="checkbox" id="lvl_opt_all" onchange="toggleSelectAllKPI('levelFilterKPIContainer', 'levelFilterKPIOptions', this, '⭐ Cấp độ (Level)')">
            <label for="lvl_opt_all" style="font-weight: bold; color: #3b82f6;">Chọn tất cả</label>
        </div>
        <div style="border-bottom: 1px solid #e2e8f0; margin: 4px 0; opacity: 0.5;"></div>
    `;

    rawLevels.forEach((lvl, idx) => {
        let cleanLvl = String(lvl).replace(/level\s*/i, '').trim();
        html += `
            <div class="multiselect-option">
                <input type="checkbox" id="lvl_opt_${idx}" value="${lvl}" checked onchange="onMultiselectCheckboxChangeKPI('levelFilterKPIContainer', 'levelFilterKPIOptions', 'lvl_opt_all', '⭐ Cấp độ (Level)')">
                <label for="lvl_opt_${idx}">Level ${cleanLvl}</label>
            </div>
        `;
    });

    optionsPanel.innerHTML = html;
    
    const selectAllCheckbox = document.getElementById('lvl_opt_all');
    if (selectAllCheckbox) selectAllCheckbox.checked = true;
    updateMultiselectTriggerTextKPI('levelFilterKPIContainer', 'levelFilterKPIOptions', '⭐ Cấp độ (Level)');
}

function toggleSelectAllKPI(containerId, optionsId, selectAllCheckbox, defaultLabel) {
    const optionsPanel = document.getElementById(optionsId);
    if (!optionsPanel) return;
    const isChecked = selectAllCheckbox.checked;
    
    const checkboxes = optionsPanel.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        if (cb !== selectAllCheckbox) {
            cb.checked = isChecked;
        }
    });
    
    updateMultiselectTriggerTextKPI(containerId, optionsId, defaultLabel);
    applyFilters();
}

function onMultiselectCheckboxChangeKPI(containerId, optionsId, selectAllId, defaultLabel) {
    const optionsPanel = document.getElementById(optionsId);
    if (!optionsPanel) return;
    
    const selectAllCheckbox = document.getElementById(selectAllId);
    if (selectAllCheckbox) {
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
    
    updateMultiselectTriggerTextKPI(containerId, optionsId, defaultLabel);
    applyFilters();
}

function updateMultiselectTriggerTextKPI(containerId, optionsId, defaultLabel) {
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
        triggerText.innerText = defaultLabel + " (Không chọn)";
    } else if (checkboxes.length === totalCount) {
        triggerText.innerText = defaultLabel;
    } else if (checkboxes.length === 1) {
        const label = optionsPanel.querySelector(`label[for="${checkboxes[0].id}"]`);
        triggerText.innerText = label ? label.innerText : defaultLabel;
    } else {
        triggerText.innerText = `${defaultLabel} (${checkboxes.length})`;
    }
}

function getSelectedMultiselectValuesKPI(optionsId) {
    const optionsPanel = document.getElementById(optionsId);
    if (!optionsPanel) return [];
    
    const selectAllCheckbox = optionsPanel.querySelector('.select-all-option input[type="checkbox"]');
    const selectAllId = selectAllCheckbox ? selectAllCheckbox.id : null;
    
    const checked = Array.from(optionsPanel.querySelectorAll('input[type="checkbox"]:checked'))
                         .filter(cb => cb.id !== selectAllId);
    return checked.map(cb => cb.value);
}
