// --- TAB PIVOT DATA TREO ---

function fetchPivotData() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('loading').innerText = "⏳ Đang tải Dữ liệu Retailer để phân tích Pivot Data Treo (Có thể mất vài giây)...";
    
    fetch(API_URL + "?sheet=data")
        .then(response => response.json())
        .then(result => {
            if(result.status === "success") {
                cacheData['data'] = result.data;
                saveToSessionCache('data', result.data);
                document.getElementById('loading').style.display = 'none';
                initPivotWorkspace(result.data);
            } else {
                document.getElementById('loading').innerText = "❌ Lỗi: " + result.message;
            }
        })
        .catch(error => {
            document.getElementById('loading').innerText = "❌ Không thể kết nối tới Google Sheets!";
        });
}

function initPivotWorkspace(data) {
    let cleanedData = data.map(row => {
        let newRow = {...row};
        if (newRow['Người xử lý']) {
            let parts = String(newRow['Người xử lý']).split('-');
            if (parts.length >= 2) {
                newRow['Người xử lý'] = parts[1].trim();
            }
        }
        
        ['Thời gian checkin', 'Thời gian checkout', 'Thời gian tạo'].forEach(col => {
            if (newRow[col]) {
                let t = String(newRow[col]).trim();
                if (t.includes('T') && t.endsWith('Z')) {
                    let d = new Date(t);
                    if (!isNaN(d)) {
                        let dd = String(d.getDate()).padStart(2, '0');
                        let mm = String(d.getMonth() + 1).padStart(2, '0');
                        let yyyy = d.getFullYear();
                        newRow[col] = `${dd}/${mm}/${yyyy}`;
                    }
                } else if (t.includes(' ') && t.includes('/')) {
                    newRow[col] = t.split(' ')[0];
                }
            }
        });
        
        return newRow;
    });
    
    pivotRawData = cleanedData;
    
    if (cleanedData.length > 0) {
        const updateKey = typeof getUpdateTimestamp === 'function' ? getUpdateTimestamp(cleanedData) : Object.keys(cleanedData[0]).find(k => k.toUpperCase().includes("UPDATE"));
        if (updateKey) {
            window.lastUpdateTimestamp = updateKey;
            document.getElementById('lastUpdated').innerText = '🕒 ' + updateKey;
        } else if (window.lastUpdateTimestamp) {
            document.getElementById('lastUpdated').innerText = '🕒 ' + window.lastUpdateTimestamp;
        }
    }
    
    setupFilters(pivotRawData);
    
    if (pivotRows.length === 0 && pivotCols.length === 0 && pivotVals.length === 0) {
        pivotRows = ['Người xử lý'];
        pivotCols = ['Tỉnh/Thành phố'];
    }
    
    updateDropZonesUI();
    applyFilters();
}

function renderPivotFields() {
    if (!pivotRawData || pivotRawData.length === 0) return;
    
    const fieldsContainer = document.getElementById('pivotFieldsList');
    fieldsContainer.innerHTML = '';
    
    const allFields = Object.keys(pivotRawData[0]).filter(f => typeof isUpdateKey === 'function' ? !isUpdateKey(f) : !f.toUpperCase().includes('UPDATE'));
    
    allFields.forEach(field => {
        const isRow = pivotRows.includes(field);
        const isCol = pivotCols.includes(field);
        
        const card = document.createElement('div');
        card.className = 'pivot-field-card';
        card.setAttribute('draggable', 'true');
        card.dataset.field = field;
        
        card.addEventListener('dragstart', handleDragStart);
        
        card.innerHTML = `
            <span>☰ ${field}</span>
            <div class="pivot-field-actions">
                <button class="btn-field-add" onclick="toggleFieldQuick('${field.replace(/'/g, "\\'")}', 'row')">${isRow ? '✕ H' : '+H'}</button>
                <button class="btn-field-add" onclick="toggleFieldQuick('${field.replace(/'/g, "\\'")}', 'col')">${isCol ? '✕ C' : '+C'}</button>
            </div>
        `;
        fieldsContainer.appendChild(card);
    });
}

function toggleFieldQuick(field, targetZone) {
    if (targetZone === 'row') {
        const idx = pivotRows.indexOf(field);
        if (idx > -1) {
            pivotRows.splice(idx, 1);
        } else {
            pivotCols = pivotCols.filter(f => f !== field);
            pivotRows.push(field);
        }
    } else if (targetZone === 'col') {
        const idx = pivotCols.indexOf(field);
        if (idx > -1) {
            pivotCols.splice(idx, 1);
        } else {
            pivotRows = pivotRows.filter(f => f !== field);
            pivotCols.push(field);
        }
    }
    updateDropZonesUI();
    calculatePivot();
}

function handleDragStart(e) {
    dragSrcField = e.target.dataset.field || e.target.closest('.pivot-field-card').dataset.field;
    e.dataTransfer.setData('text/plain', dragSrcField);
    e.dataTransfer.effectAllowed = 'move';
}

function allowDrop(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function dragEnter(e) {
    e.preventDefault();
    const zone = e.target.closest('.pivot-dropzone');
    if (zone) zone.classList.add('drag-over');
}

function dragLeave(e) {
    const zone = e.target.closest('.pivot-dropzone');
    if (zone) zone.classList.remove('drag-over');
}

function handleDrop(e, targetZone) {
    e.preventDefault();
    const zone = e.target.closest('.pivot-dropzone');
    if (zone) zone.classList.remove('drag-over');
    
    const field = e.dataTransfer.getData('text/plain') || dragSrcField;
    if (!field) return;
    
    pivotRows = pivotRows.filter(f => f !== field);
    pivotCols = pivotCols.filter(f => f !== field);
    pivotVals = pivotVals.filter(f => f !== field);
    
    if (targetZone === 'row') {
        if (!pivotRows.includes(field)) pivotRows.push(field);
    } else if (targetZone === 'col') {
        if (!pivotCols.includes(field)) pivotCols.push(field);
    } else if (targetZone === 'val') {
        pivotVals = [field];
    }
    
    updateDropZonesUI();
    calculatePivot();
}

function removeFieldFromZone(field, zone) {
    if (zone === 'row') {
        pivotRows = pivotRows.filter(f => f !== field);
    } else if (zone === 'col') {
        pivotCols = pivotCols.filter(f => f !== field);
    } else if (zone === 'val') {
        pivotVals = [];
    }
    updateDropZonesUI();
    calculatePivot();
}

function updateDropZonesUI() {
    const rowZone = document.getElementById('rowDropZone');
    renderZoneItems(rowZone, pivotRows, 'row', 'Kéo trường làm hàng dọc ở đây');
    
    const colZone = document.getElementById('colDropZone');
    renderZoneItems(colZone, pivotCols, 'col', 'Kéo trường làm cột ngang ở đây');
    
    const valZone = document.getElementById('valDropZone');
    renderZoneItems(valZone, pivotVals, 'val', 'Kéo trường tính toán ở đây');
    
    renderPivotFields();
}

function renderZoneItems(zoneElement, itemsArray, zoneName, placeholder) {
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
            <button class="remove-btn" onclick="removeFieldFromZone('${item.replace(/'/g, "\\'")}', '${zoneName}')">×</button>
        `;
        zoneElement.appendChild(badge);
    });
}

function calculatePivot() {
    if (!pivotRawData || pivotRawData.length === 0) return;
    
    const thead = document.getElementById('pivotTableHead');
    const tbody = document.getElementById('pivotTableBody');
    thead.innerHTML = '';
    tbody.innerHTML = '';
    
    if (pivotRows.length === 0 && pivotCols.length === 0) {
        thead.innerHTML = '<tr><th>Bảng Pivot</th></tr>';
        tbody.innerHTML = '<tr><td style="text-align: center; color: #64748b; font-style: italic; padding: 30px;">Chưa cấu hình Pivot Table. Hãy kéo/bấm chọn các trường dữ liệu ở cột bên trái.</td></tr>';
        document.getElementById('pivotCountInfo').innerText = '';
        return;
    }
    
    const aggrType = document.getElementById('pivotAggrType').value;
    const valField = pivotVals.length > 0 ? pivotVals[0] : null;
    
    const dataset = pivotFilteredData || pivotRawData;
    
    const rowKeysSet = new Set();
    const colKeysSet = new Set();
    
    dataset.forEach(row => {
        if (pivotRows.length > 0) {
            rowKeysSet.add(pivotRows.map(f => String(row[f] || '-')).join('|||'));
        }
        if (pivotCols.length > 0) {
            colKeysSet.add(pivotCols.map(f => String(row[f] || '-')).join('|||'));
        }
    });
    
    let rowKeysList = Array.from(rowKeysSet).sort(smartSort);
    let colKeysList = Array.from(colKeysSet).sort(smartSort);
    
    let actualRowKeys = pivotRows.length > 0 ? rowKeysList : ['Tất cả'];
    let actualColKeys = pivotCols.length > 0 ? colKeysList : ['Tổng'];
    
    const pivotTable = {};
    const rowTotals = {};
    const colTotals = {};
    let grandTotal = 0;
    
    dataset.forEach(row => {
        const rKey = pivotRows.length > 0 ? pivotRows.map(f => String(row[f] || '-')).join('|||') : 'Tất cả';
        const cKey = pivotCols.length > 0 ? pivotCols.map(f => String(row[f] || '-')).join('|||') : 'Tổng';
        
        let val = 1;
        if (valField) {
            val = Number(row[valField]);
            if (isNaN(val)) val = 0;
        }
        
        if (aggrType === 'count') {
            val = (valField && (row[valField] === undefined || row[valField] === null || row[valField] === "")) ? 0 : 1;
        }
        
        pivotTable[rKey] = pivotTable[rKey] || {};
        pivotTable[rKey][cKey] = (pivotTable[rKey][cKey] || 0) + val;
        
        rowTotals[rKey] = (rowTotals[rKey] || 0) + val;
        colTotals[cKey] = (colTotals[cKey] || 0) + val;
        grandTotal += val;
    });
    
    let headHTML = '<tr>';
    if (pivotRows.length > 0) {
        pivotRows.forEach(field => {
            headHTML += `<th style="text-align: left;">${field}</th>`;
        });
    } else {
        headHTML += `<th style="text-align: left;">Dữ liệu</th>`;
    }
    
    actualColKeys.forEach(colKey => {
        const colLabel = colKey.split('|||').join(' - ');
        headHTML += `<th>${colLabel}</th>`;
    });
    
    if (pivotCols.length > 0) {
        headHTML += `<th>Tổng cộng</th>`;
    }
    headHTML += '</tr>';
    thead.innerHTML = headHTML;
    
    let bodyHTML = '';
    actualRowKeys.forEach(rowKey => {
        bodyHTML += '<tr>';
        
        if (pivotRows.length > 0) {
            const rowVals = rowKey.split('|||');
            rowVals.forEach(val => {
                bodyHTML += `<td class="row-label">${val}</td>`;
            });
        } else {
            bodyHTML += `<td class="row-label">Tất cả dữ liệu</td>`;
        }
        
        actualColKeys.forEach(colKey => {
            const cellVal = (pivotTable[rowKey] && pivotTable[rowKey][colKey]) || 0;
            bodyHTML += `<td class="pivot-val-cell" data-row="${rowKey.replace(/"/g, '&quot;')}" data-col="${colKey.replace(/"/g, '&quot;')}" onclick="showPivotCellDetails(this)">${formatNumber(cellVal)}</td>`;
        });
        
        if (pivotCols.length > 0) {
            const rTotal = rowTotals[rowKey] || 0;
            bodyHTML += `<td class="pivot-val-cell pivot-row-total-cell" data-row="${rowKey.replace(/"/g, '&quot;')}" data-col="Tổng" onclick="showPivotCellDetails(this)">${formatNumber(rTotal)}</td>`;
        }
        
        bodyHTML += '</tr>';
    });
    
    let footerHTML = '<tr class="total-row">';
    const rowSpanCount = pivotRows.length > 0 ? pivotRows.length : 1;
    footerHTML += `<td colspan="${rowSpanCount}" style="text-align: left; font-weight: bold;">Tổng cộng</td>`;
    
    actualColKeys.forEach(colKey => {
        const cTotal = colTotals[colKey] || 0;
        footerHTML += `<td class="pivot-val-cell" data-row="Tất cả" data-col="${colKey.replace(/"/g, '&quot;')}" onclick="showPivotCellDetails(this)">${formatNumber(cTotal)}</td>`;
    });
    
    if (pivotCols.length > 0) {
        footerHTML += `<td class="grand-total-cell" data-row="Tất cả" data-col="Tổng" onclick="showPivotCellDetails(this)">${formatNumber(grandTotal)}</td>`;
    }
    footerHTML += '</tr>';
    tbody.innerHTML = bodyHTML + footerHTML;
    
    let valLabel = valField ? ` [${valField}]` : '';
    let typeLabel = aggrType === 'sum' ? 'Tổng' : 'Đếm';
    document.getElementById('pivotCountInfo').innerText = `Tổng số dòng phân tích: ${dataset.length} dòng | Kết quả (${typeLabel}${valLabel}): ${formatNumber(grandTotal)}`;
}

function clearPivotSettings() {
    pivotRows = [];
    pivotCols = [];
    pivotVals = [];
    updateDropZonesUI();
    
    document.getElementById('pivotTableHead').innerHTML = '<tr><th>Bảng Pivot</th></tr>';
    document.getElementById('pivotTableBody').innerHTML = '<tr><td style="text-align: center; color: #64748b; font-style: italic; padding: 30px;">Chưa cấu hình Pivot Table. Hãy kéo/bấm chọn các trường dữ liệu ở cột bên trái.</td></tr>';
    document.getElementById('pivotCountInfo').innerText = '';
}

function exportPivotToCSV() {
    const table = document.getElementById('pivotResultTable');
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
    link.setAttribute("download", "report_pivot_" + new Date().toISOString().slice(0,10) + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function showPivotCellDetails(el) {
    const valStr = el.innerText.trim();
    if (valStr === '0' || valStr === '-' || valStr === '') return;
    
    const rowKey = el.dataset.row;
    const colKey = el.dataset.col;
    
    const dataset = pivotFilteredData || pivotRawData;
    if (!dataset) return;
    
    let cellRecords = dataset.filter(row => {
        let matchRow = true;
        if (rowKey && rowKey !== 'Tất cả' && pivotRows.length > 0) {
            const rValues = rowKey.split('|||');
            matchRow = pivotRows.every((f, idx) => String(row[f] || '-') === rValues[idx]);
        }
        
        let matchCol = true;
        if (colKey && colKey !== 'Tổng' && pivotCols.length > 0) {
            const cValues = colKey.split('|||');
            matchCol = pivotCols.every((f, idx) => String(row[f] || '-') === cValues[idx]);
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
        const source = row['Nguồn data'] || '-';
        const location = row['Địa điểm'] || '-';
        const createdTime = row['Thời gian tạo'] || '-';
        
        card.innerHTML = `
            <div class="pivot-card-header">
                <span>Retailer ID: ${id}</span>
                <span style="font-size:12px; color:#3b82f6; font-weight: 600;">Xem chi tiết ➔</span>
            </div>
            <div class="pivot-card-body">
                <div><strong>Nhân sự:</strong> ${staff}</div>
                <div><strong>Nguồn:</strong> ${source}</div>
                <div><strong>Địa điểm:</strong> ${location}</div>
                <div><strong>Thời Gian Tạo:</strong> ${createdTime}</div>
            </div>
        `;
        bodyEl.appendChild(card);
    });
    
    document.getElementById('pivotListModal').style.display = 'flex';
}

function togglePivotWorkspace() {
    const builder = document.getElementById('pivotWorkspace');
    const btn = document.getElementById('btnTogglePivotWorkspace');
    if (!builder || !btn) return;
    
    const isHidden = builder.classList.toggle('hidden');
    window.isPivotTreoVisible = !isHidden;
    
    if (isHidden) {
        btn.innerHTML = '⚙️ Tùy biến Pivot Table (Hiện)';
        btn.classList.add('collapsed');
    } else {
        btn.innerHTML = '⚙️ Tùy biến Pivot Table (Ẩn)';
        btn.classList.remove('collapsed');
        if (typeof renderPivotFields === 'function') renderPivotFields();
        if (typeof calculatePivot === 'function') calculatePivot();
    }
}

function getTreoStatsSummary() {
    const data = cacheData['data'] || [];
    if (data.length === 0) return null;

    let pendingByProv = {};
    let pendingByStaff = {};
    let overdueDetails = [];
    
    data.forEach(row => {
        let prov = row['Tỉnh/Thành phố'] || 'Không rõ';
        let staff = row['Người xử lý'] || 'Chưa nhận';
        let sla = Number(row['SLA']);
        let id = row['Retailer ID'] || 'Không rõ';
        
        pendingByProv[prov] = (pendingByProv[prov] || 0) + 1;
        pendingByStaff[staff] = (pendingByStaff[staff] || 0) + 1;
        
        if (!isNaN(sla) && sla >= 9) {
            overdueDetails.push({
                prov: prov,
                staff: staff,
                id: id,
                sla: sla
            });
        }
    });

    let sortedProv = Object.entries(pendingByProv).sort((a, b) => b[1] - a[1]);
    let sortedStaff = Object.entries(pendingByStaff).sort((a, b) => b[1] - a[1]);

    return {
        total: data.length,
        provinces: sortedProv,
        staff: sortedStaff,
        overdue: overdueDetails
    };
}

async function runAITreoAnalysis(forceRefresh = false) {
    const container = document.getElementById('aiAnalysisTreoBody');
    const wrapper = document.getElementById('aiAnalysisTreoContainer');
    const timeEl = document.getElementById('aiAnalysisTreoTime');
    if (!container) return;

    const cachedText = localStorage.getItem('ai_treo_analysis_text');
    const cachedTime = localStorage.getItem('ai_treo_analysis_time');
    
    if (wrapper) wrapper.classList.remove('hidden');

    if (!forceRefresh && (!cachedText || !cachedTime)) {
        container.innerHTML = `<div style="color: #64748b; font-style: italic; padding: 15px; text-align: center;">Chưa có phân tích dữ liệu treo. Vui lòng bấm "Tải lại AI" ở phía trên để bắt đầu.</div>`;
        if (timeEl) timeEl.innerText = `Chưa phân tích`;
        return;
    }

    if (!forceRefresh && cachedText && cachedTime) {
        container.innerHTML = formatMarkdownToHTML(cachedText);
        if (timeEl) timeEl.innerText = `Cập nhật lúc: ${cachedTime}`;
        return;
    }

    container.innerHTML = `<div class="ai-loading">⏳ AI đang phân tích dữ liệu treo, anh chờ xíu nhé...</div>`;
    
    try {
        const stats = getTreoStatsSummary();
        if (!stats) {
            container.innerHTML = `<div style="color: #64748b; font-style: italic;">Không có dữ liệu treo để phân tích.</div>`;
            return;
        }

        // Filter staff to exclude "Chăm sóc khách hàng" and "Hỗ trợ trực tiếp"
        const filteredStaff = stats.staff.filter(s => {
            const nameLower = s[0].toLowerCase();
            return !nameLower.includes("chăm sóc khách hàng") && !nameLower.includes("hỗ trợ trực tiếp");
        });

        // Find provinces with 7 or fewer pending cases
        const lowDataProvinces = stats.provinces.filter(p => p[1] <= 7);

        const prompt = `Hãy đóng vai trò là một chuyên viên phân tích vận hành CRM thông minh. Phân tích dữ liệu đang treo (Pending) dưới đây để đưa ra báo cáo ngắn gọn, sắc bén gửi anh Quốc.

TỔNG SỐ CA ĐANG TREO: ${stats.total} ca.

1. Treo theo Tỉnh/Thành phố (Tỉnh nào treo nhiều):
${stats.provinces.slice(0, 8).map(p => `- ${p[0]}: ${p[1]} ca treo`).join('\n')}

2. Tỉnh/Thành phố gần hết dữ liệu (Treo ít từ 7 ca trở xuống):
${lowDataProvinces.length > 0 ? lowDataProvinces.map(p => `- ${p[0]}: ${p[1]} ca`).join('\n') : "Không có tỉnh nào dưới 7 ca"}

3. Treo theo Nhân sự phụ trách (Đã lọc bỏ các nhân sự có chứa "Chăm sóc khách hàng" hoặc "Hỗ trợ trực tiếp"):
${filteredStaff.slice(0, 8).map(s => `- ${s[0]}: ${s[1]} ca`).join('\n')}

4. Chi tiết trễ SLA (SLA >= 9 ngày):
Tổng số ca trễ SLA >= 9 ngày: ${stats.overdue.length} ca.
Danh sách chi tiết ca trễ SLA:
${stats.overdue.map(o => `- Retailer ID: ${o.id} | Tỉnh: ${o.prov} | Nhân sự: ${o.staff} | SLA: ${o.sla} ngày`).join('\n')}

Nhiệm vụ của bạn là viết một bản phân tích cực kỳ ngắn gọn, súc tích, đi thẳng vào vấn đề theo các đề mục sau:
- 🗺️ Tỉnh/Thành treo nhiều & Gần hết data: Chỉ rõ tỉnh nào đang tồn đọng nhiều nhất (số ca, tỉ lệ). Đồng thời, liệt kê rõ các tỉnh thành đang **gần hết data (tức là có từ 7 ca treo trở xuống)** để cảnh báo sắp hết dữ liệu.
- 👨‍💼 Top 3 nhân sự giữ nhiều data nhất: Chỉ rõ và liệt kê tên danh sách **3 nhân sự đang giữ nhiều ca treo nhất** (lưu ý: lấy theo danh sách nhân sự đã lọc bỏ các tên chứa "Chăm sóc khách hàng" và "Hỗ trợ trực tiếp" ở trên).
- 🚨 Trễ SLA (>= 9 ngày): Nhận xét về các ca trễ hạn nghiêm trọng, liệt kê rõ các Retailer ID bị trễ cùng với nhân sự phụ trách và tỉnh thành tương ứng.
- 💡 Khuyến nghị hành động: Đề xuất giải pháp nhanh chóng để giải phóng số lượng ca treo này.

Yêu cầu định dạng:
- Báo cáo viết bằng tiếng Việt tự nhiên, chuyên nghiệp và thân thiện với anh Quốc.
- Định dạng rõ ràng, dùng bullet points, in đậm các thông tin quan trọng.
- Trình bày trực quan, sử dụng icon phù hợp.`;

        if (typeof callGeminiAPI !== 'function') {
            throw new Error("Không tìm thấy hàm gọi Gemini API (callGeminiAPI)");
        }

        const history = [{ role: 'user', text: prompt }];
        const responseText = await callGeminiAPI(history, "Bạn là chuyên gia phân tích vận hành CRM của anh Quốc.");
        
        const now = new Date();
        const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        localStorage.setItem('ai_treo_analysis_text', responseText);
        localStorage.setItem('ai_treo_analysis_time', timeStr);
        
        container.innerHTML = formatMarkdownToHTML(responseText);
        if (timeEl) timeEl.innerText = `Cập nhật lúc: ${timeStr}`;
    } catch (error) {
        console.error("AI Treo Analysis Error:", error);
        container.innerHTML = `<div style="color: #ef4444; font-weight: bold; padding: 15px;">❌ Lỗi phân tích AI: ${error.message}</div>`;
    }
}

function formatMarkdownToHTML(text) {
    if (!text) return "";
    
    let clean = String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    
    clean = clean.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    clean = clean.replace(/\*(.*?)\*/g, '<em>$1</em>');
    clean = clean.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    clean = clean.split('\n').map(line => {
        let trimmed = line.trim();
        if (trimmed.startsWith('- ')) {
            return '• ' + line.substring(line.indexOf('- ') + 2);
        } else if (trimmed.startsWith('* ')) {
            return '• ' + line.substring(line.indexOf('* ') + 2);
        }
        return line;
    }).join('\n');
    
    clean = clean.replace(/\n/g, '<br>');
    return clean;
}

function clearAITreoAnalysis() {
    localStorage.removeItem('ai_treo_analysis_text');
    localStorage.removeItem('ai_treo_analysis_time');
    const wrapper = document.getElementById('aiAnalysisTreoContainer');
    if (wrapper) wrapper.classList.add('hidden');
}
