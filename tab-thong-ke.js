// --- DATA ĐỔ THEO NGÀY (THỐNG KÊ TAB) ---

function setupFiltersThongKe(data) {
    if (!data || data.length === 0) return;
    
    // 1. Nạp Tỉnh/Thành
    const provinces = [...new Set(data.map(item => item['Tỉnh/Thành phố']).filter(p => p && p !== "Grand Total"))].sort();
    const provSelect = document.getElementById('provinceFilterThongKe');
    provSelect.innerHTML = '<option value="">🗺️ Tất cả Tỉnh/Thành</option>';
    provinces.forEach(p => {
        provSelect.innerHTML += `<option value="${p}">${p}</option>`;
    });
    
    // 2. Nạp khoảng ngày (Cột là số)
    const keys = Object.keys(data[0]);
    const dayCols = keys.filter(k => k !== "Tỉnh/Thành phố" && k !== "Grand Total" && !isNaN(k))
                        .map(Number)
                        .sort((a, b) => a - b);
                        
    const fromSelect = document.getElementById('fromDayFilter');
    const toSelect = document.getElementById('toDayFilter');
    
    fromSelect.innerHTML = '<option value="">📅 Từ ngày</option>';
    toSelect.innerHTML = '<option value="">📅 Đến ngày</option>';
    
    dayCols.forEach(d => {
        fromSelect.innerHTML += `<option value="${d}">Ngày ${d}</option>`;
        toSelect.innerHTML += `<option value="${d}">Ngày ${d}</option>`;
    });
}

function applyFiltersThongKe() {
    if (!cacheData['thongke'] || cacheData['thongke'].length === 0) return;
    
    const selectedProv = document.getElementById('provinceFilterThongKe').value;
    const fromDayVal = document.getElementById('fromDayFilter').value;
    const toDayVal = document.getElementById('toDayFilter').value;
    
    const fromDay = fromDayVal ? Number(fromDayVal) : null;
    const toDay = toDayVal ? Number(toDayVal) : null;
    
    // Nếu có nhập khoảng ngày và Ngày bắt đầu lớn hơn Ngày kết thúc, tự điều chỉnh
    if (fromDay !== null && toDay !== null && fromDay > toDay) {
        document.getElementById('toDayFilter').value = fromDay;
        applyFiltersThongKe();
        return;
    }
    
    // Lọc các hàng tỉnh thành (loại bỏ Grand Total gốc)
    const activeRows = cacheData['thongke'].filter(row => {
        const prov = row['Tỉnh/Thành phố'];
        if (!prov || prov === "Grand Total") return false;
        if (selectedProv && prov !== selectedProv) return false;
        return true;
    });
    
    // Lọc các cột ngày
    const keys = Object.keys(cacheData['thongke'][0] || {});
    const dayCols = keys.filter(k => k !== "Tỉnh/Thành phố" && k !== "Grand Total" && !isNaN(k))
                        .map(Number)
                        .sort((a, b) => a - b);
                        
    const activeDayCols = dayCols.filter(day => {
        if (fromDay !== null && day < fromDay) return false;
        if (toDay !== null && day > toDay) return false;
        return true;
    });
    
    if (viewModeThongKe === 'chart') {
        document.getElementById('dataTable').style.display = 'none';
        document.getElementById('chartsThongKe').classList.remove('hidden');
        renderThongKeCharts(activeRows, activeDayCols);
    } else {
        document.getElementById('chartsThongKe').classList.add('hidden');
        document.getElementById('dataTable').style.display = 'table';
        document.getElementById('dataTable').classList.add('pivot-style');
        renderThongKeTable(activeRows, activeDayCols);
    }
}

function renderThongKeTable(activeRows, activeDayCols) {
    const thead = document.getElementById('tableHead');
    const tbody = document.getElementById('tableBody');
    thead.innerHTML = '';
    tbody.innerHTML = '';
    
    document.getElementById('recordCount').innerText = activeRows.length;

    if (activeRows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%" style="text-align:center; padding: 30px; font-style: italic; color: #64748b;">Không tìm thấy dữ liệu phù hợp</td></tr>';
        return;
    }

    // 1. Tiêu đề
    const headers = ['Tỉnh/Thành phố', ...activeDayCols, 'Trung bình', 'Grand Total'];
    let trHead = '<tr>';
    headers.forEach(h => {
        trHead += `<th>${h}</th>`;
    });
    trHead += '</tr>';
    thead.innerHTML = trHead;

    // 2. Nội dung bảng
    let trBody = '';
    const colSums = {};
    activeDayCols.forEach(day => { colSums[day] = 0; });
    let overallGrandTotal = 0;
    const activeDaysCount = activeDayCols.length;

    activeRows.forEach(row => {
        trBody += '<tr class="no-click">';
        trBody += `<td data-label="Tỉnh/Thành phố">${row['Tỉnh/Thành phố'] || '-'}</td>`;
        
        let rowSum = 0;
        activeDayCols.forEach(day => {
            let val = Number(row[day]);
            if (isNaN(val) || row[day] === "") val = 0;
            
            rowSum += val;
            colSums[day] += val;
            
            trBody += `<td data-label="${day}">${val > 0 ? val.toLocaleString('vi-VN') : ''}</td>`;
        });
        
        overallGrandTotal += rowSum;
        const rowAvg = activeDaysCount > 0 ? (rowSum / activeDaysCount) : 0;
        trBody += `<td data-label="Trung bình" style="font-weight: bold; color: #2563eb; text-align: center;">${rowAvg > 0 ? rowAvg.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}</td>`;
        trBody += `<td data-label="Grand Total" style="font-weight: bold; text-align: center;">${rowSum > 0 ? rowSum.toLocaleString('vi-VN') : ''}</td>`;
        trBody += '</tr>';
    });

    // 3. Dòng tổng cộng ở cuối
    if (activeRows.length > 0) {
        trBody += '<tr class="total-row">';
        trBody += '<td data-label="Tỉnh/Thành phố">Grand Total</td>';
        
        activeDayCols.forEach(day => {
            const sumVal = colSums[day];
            trBody += `<td data-label="${day}">${sumVal > 0 ? sumVal.toLocaleString('vi-VN') : ''}</td>`;
        });
        
        const overallAvg = activeDaysCount > 0 ? (overallGrandTotal / activeDaysCount) : 0;
        trBody += `<td data-label="Trung bình" style="font-weight: bold; color: #ef4444; text-align: center;">${overallAvg > 0 ? overallAvg.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}</td>`;
        trBody += `<td data-label="Grand Total" style="text-align: center;">${overallGrandTotal > 0 ? overallGrandTotal.toLocaleString('vi-VN') : ''}</td>`;
        trBody += '</tr>';
    }

    tbody.innerHTML = trBody;
}

// --- Toggle View Mode (List/Chart) ---
function toggleViewMode(tab, mode) {
    if (tab === 'thongke') {
        viewModeThongKe = mode;
        
        document.getElementById('btnViewListThongKe').classList.toggle('active', mode === 'list');
        document.getElementById('btnViewChartThongKe').classList.toggle('active', mode === 'chart');
        
        applyFiltersThongKe();
    }
}

// --- Render Charts for Thong Ke Tab ---
function renderThongKeCharts(activeRows, activeDayCols) {
    if (!activeRows || activeRows.length === 0 || !activeDayCols || activeDayCols.length === 0) return;
    
    // 1. Calculate sum for each Province (Bar Chart)
    const provLabels = activeRows.map(row => row['Tỉnh/Thành phố'] || '-');
    const provValues = activeRows.map(row => {
        let sum = 0;
        activeDayCols.forEach(day => {
            let val = Number(row[day]);
            if (!isNaN(val)) sum += val;
        });
        return sum;
    });
    
    // 2. Calculate sum for each Day (Line Chart)
    const dayLabels = activeDayCols.map(day => `Ngày ${day}`);
    const dayValues = activeDayCols.map(day => {
        let sum = 0;
        activeRows.forEach(row => {
            let val = Number(row[day]);
            if (!isNaN(val)) sum += val;
        });
        return sum;
    });
    
    const isDark = document.documentElement.classList.contains('dark-theme');
    const textColor = isDark ? '#cbd5e1' : '#475569';
    const gridColor = isDark ? '#334155' : '#e2e8f0';
    
    // Render Province Chart (Bar Chart)
    if (chartThongKeProvInstance) {
        chartThongKeProvInstance.destroy();
    }
    const ctxProv = document.getElementById('chartThongKeProv').getContext('2d');
    chartThongKeProvInstance = new Chart(ctxProv, {
        type: 'bar',
        data: {
            labels: provLabels,
            datasets: [{
                label: 'Số lượng data',
                data: provValues,
                backgroundColor: 'rgba(59, 130, 246, 0.75)',
                borderColor: '#3b82f6',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: (e, activeEls) => {
                if (activeEls.length > 0) {
                    const index = activeEls[0].index;
                    const provName = provLabels[index];
                    const filterSelect = document.getElementById('provinceFilterThongKe');
                    if ([...filterSelect.options].some(o => o.value === provName)) {
                        filterSelect.value = provName;
                        applyFiltersThongKe();
                    }
                }
            },
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: 'Segoe UI' } }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: 'Segoe UI' } }
                }
            }
        }
    });
    
    // Render Trend Chart (Line Chart)
    if (chartThongKeTrendInstance) {
        chartThongKeTrendInstance.destroy();
    }
    const ctxTrend = document.getElementById('chartThongKeTrend').getContext('2d');
    chartThongKeTrendInstance = new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: dayLabels,
            datasets: [{
                label: 'Số lượng data đổ',
                data: dayValues,
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderColor: '#10b981',
                borderWidth: 3,
                pointBackgroundColor: '#10b981',
                pointBorderColor: isDark ? '#1e293b' : '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Số lượng: ${context.parsed.y.toLocaleString('vi-VN')}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: 'Segoe UI' } }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: 'Segoe UI' } }
                }
            }
        }
    });
}

function prefetchTabsBackground() {
    const tabsToPrefetch = ['data', 'atcdalam', 'thongke', 'hieusuat', 'ngaycong', 'kpi']; // leader tab uses cacheData['hieusuat'] directly, no extra fetch needed
    tabsToPrefetch.forEach(tabName => {
        if (cacheData[tabName] || getFromSessionCache(tabName)) return;
        
        let fetchUrl = API_URL + "?sheet=" + (tabName === 'kpi' ? 'KPI' : tabName);
        if (tabName === 'thongke') {
            fetchUrl += "&range=K3:AQ11";
        } else if (tabName === 'kpi') {
            fetchUrl += "&range=A16:O27";
        }
        
        fetch(fetchUrl)
            .then(response => response.json())
            .then(result => {
                if (result.status === "success") {
                    cacheData[tabName] = result.data;
                    saveToSessionCache(tabName, result.data);
                    console.log(`[Prefetch] Đã tải xong dữ liệu tab: ${tabName}`);
                }
            })
            .catch(error => {
                console.warn(`[Prefetch] Lỗi khi tải dữ liệu tab ${tabName}:`, error);
            });
    });
}
