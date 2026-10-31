
// ─── Helper parse Tuần từ Thời gian checkin ────────────────────
function getWeekInfoFromCheckin(dateStr) {
    if (!dateStr) return null;
    var s = String(dateStr).trim();
    if (!s) return null;
    var d = null;

    if (s.includes('T')) {
        var parts = s.split('T')[0].split('-');
        if (parts.length === 3) {
            d = { year: parseInt(parts[0]), month: parseInt(parts[1]), day: parseInt(parts[2]) };
        }
    } else if (s.includes('-') || s.includes('/')) {
        var firstPart = s.split(' ')[0];
        var parts = firstPart.split('/').join('-').split('-').filter(Boolean);
        if (parts.length === 3) {
            if (parts[0].length === 4) {
                d = { year: parseInt(parts[0]), month: parseInt(parts[1]), day: parseInt(parts[2]) };
            } else {
                d = { year: parseInt(parts[2]), month: parseInt(parts[1]), day: parseInt(parts[0]) };
            }
        }
    }

    if (!d || isNaN(d.year) || isNaN(d.month) || isNaN(d.day)) return null;

    var weekNum = Math.min(5, Math.ceil(d.day / 7));
    var monthStr = String(d.month).padStart(2, '0');
    var weekKey = d.year + '-' + monthStr + '-W' + weekNum;
    var weekLabel = 'Tuần ' + weekNum + ' (Tháng ' + monthStr + '/' + d.year + ')';

    return {
        year: d.year,
        month: d.month,
        day: d.day,
        weekNum: weekNum,
        key: weekKey,
        label: weekLabel
    };
}


// ============================================================
// TAB LEADER — Deep Analyze | 13 Nhóm Phân Tích
// Reads: cacheData['hieusuat'] — DOES NOT touch other tabs.
// ============================================================

let leaderCharts = {};

function destroyLeaderChart(id) {
    if (leaderCharts[id]) { leaderCharts[id].destroy(); delete leaderCharts[id]; }
}

function cleanLeaderName(raw) {
    if (!raw) return '';
    const parts = String(raw).split('-');
    return parts.length >= 2 ? parts[1].trim() : String(raw).trim();
}

// ─── Inline datalabel plugin (works with Chart.js v3 & v4) ──
const leaderLabelPlugin = {
    id: 'leaderLabels',
    afterDatasetsDraw(chart) {
        try {
            const ctx = chart.ctx;
            if (!ctx) return;
            const isDark = document.documentElement.classList.contains('dark-theme');
            const color = isDark ? '#f1f5f9' : '#0f172a';
            const type = chart.config ? chart.config.type : null;
            if (type === 'doughnut' || type === 'pie') return;

            chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                if (!meta || meta.hidden) return;
                const isHoriz = chart.options && chart.options.indexAxis === 'y';
                meta.data.forEach((el, j) => {
                    if (!el || typeof el.x !== 'number' || typeof el.y !== 'number' || isNaN(el.x) || isNaN(el.y)) return;
                    const raw = dataset.data ? dataset.data[j] : null;
                    if (raw === undefined || raw === null || (raw === 0 && type === 'bar')) return;
                    const display = Number.isInteger(raw) ? raw : Number(raw).toFixed(1);
                    ctx.save();
                    ctx.font = 'bold 11px Inter,system-ui,sans-serif';
                    ctx.fillStyle = color;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    if (type === 'bar' && !isHoriz) {
                        ctx.textBaseline = 'bottom';
                        ctx.fillText(display, el.x, el.y - 4);
                    } else if (type === 'bar' && isHoriz) {
                        ctx.textAlign = 'left';
                        ctx.fillText(display, el.x + 5, el.y);
                    } else if (type === 'line') {
                        ctx.textBaseline = 'bottom';
                        ctx.fillText(display, el.x, el.y - 8);
                    }
                    ctx.restore();
                });
            });
        } catch (e) {
            console.warn("leaderLabelPlugin error:", e);
        }
    }
};

// ─── Entry point called from core.js ────────────────────────
function initLeaderTab() {
    const rawData = cacheData['hieusuat'];
    if (!rawData || rawData.length === 0) {
        const kpiCards = document.getElementById('leaderKPICards');
        if (kpiCards) {
            kpiCards.innerHTML = '<div style="grid-column: 1 / -1; text-align:center; padding:30px; color:#64748b; font-style:italic">⏳ Đang tự động tải dữ liệu Deep Analyze... Vui lòng chờ vài giây.</div>';
        }
        return;
    }

    // Populate Week Filter Options
    const weekSelect = document.getElementById('leaderWeekFilter');
    let sortedKeys = [];
    if (weekSelect) {
        const currentSelected = weekSelect.value || 'ALL';
        const weeksMap = {};
        rawData.forEach(r => {
            const checkin = r['Thời gian checkin'] || r['Thời gian tạo'];
            const wInfo = getWeekInfoFromCheckin(checkin);
            if (wInfo) weeksMap[wInfo.key] = wInfo.label;
        });

        sortedKeys = Object.keys(weeksMap).sort();
        let optionsHtml = '<option value="ALL">-- Tất cả các tuần --</option>';
        sortedKeys.forEach(k => {
            const selectedAttr = (k === currentSelected) ? 'selected' : '';
            optionsHtml += `<option value="${k}" ${selectedAttr}>${weeksMap[k]}</option>`;
        });
        weekSelect.innerHTML = optionsHtml;
        if (currentSelected && (currentSelected === 'ALL' || sortedKeys.includes(currentSelected))) {
            weekSelect.value = currentSelected;
        } else {
            weekSelect.value = 'ALL';
        }
    }

    // Populate Staff Filter Options
    const staffSelect = document.getElementById('leaderStaffFilter');
    let sortedStaff = [];
    if (staffSelect) {
        const currentSelectedStaff = staffSelect.value || 'ALL';
        const staffSet = new Set();
        rawData.forEach(r => {
            const s = cleanLeaderName(r['Người xử lý']);
            if (s && !s.toLowerCase().includes('nguyễn ái quốc')) staffSet.add(s);
        });

        sortedStaff = Array.from(staffSet).sort();
        let staffOptionsHtml = '<option value="ALL">-- Tất cả nhân sự --</option>';
        sortedStaff.forEach(s => {
            const selectedAttr = (s === currentSelectedStaff) ? 'selected' : '';
            staffOptionsHtml += `<option value="${s}" ${selectedAttr}>${s}</option>`;
        });
        staffSelect.innerHTML = staffOptionsHtml;
        if (currentSelectedStaff && (currentSelectedStaff === 'ALL' || sortedStaff.includes(currentSelectedStaff))) {
            staffSelect.value = currentSelectedStaff;
        } else {
            staffSelect.value = 'ALL';
        }
    }

    // Sync Section 16 dropdowns
    const sec16Week = document.getElementById('section16WeekFilter');
    if (sec16Week && weekSelect) {
        sec16Week.innerHTML = weekSelect.innerHTML;
        sec16Week.value = weekSelect.value;
    }
    const sec16Staff = document.getElementById('section16StaffFilter');
    if (sec16Staff && staffSelect) {
        sec16Staff.innerHTML = staffSelect.innerHTML;
        sec16Staff.value = staffSelect.value;
    }

    // Filter Data by selected Week and Staff if applicable
    const selectedWeekKey = weekSelect ? weekSelect.value : 'ALL';
    const selectedStaffKey = staffSelect ? staffSelect.value : 'ALL';

    let data = rawData;
    if (selectedWeekKey && selectedWeekKey !== 'ALL') {
        data = data.filter(r => {
            const checkin = r['Thời gian checkin'] || r['Thời gian tạo'];
            const wInfo = getWeekInfoFromCheckin(checkin);
            return wInfo && wInfo.key === selectedWeekKey;
        });
    }
    if (selectedStaffKey && selectedStaffKey !== 'ALL') {
        data = data.filter(r => cleanLeaderName(r['Người xử lý']) === selectedStaffKey);
    }

    const safeRun = function(fn, name, targetData) {
        try {
            if (typeof fn === 'function') fn(targetData || data);
        } catch (e) {
            console.error("Lỗi khi chạy " + name + ":", e);
        }
    };

    safeRun(renderLeaderSection1, 'renderLeaderSection1', data);
    safeRun(renderLeaderSection4, 'renderLeaderSection4', data);
    safeRun(renderLeaderSection5, 'renderLeaderSection5', data);
    safeRun(renderLeaderSection6, 'renderLeaderSection6', data);
    safeRun(renderLeaderSection7, 'renderLeaderSection7', data);
    safeRun(renderLeaderSection8, 'renderLeaderSection8', data);
    safeRun(renderLeaderSection14, 'renderLeaderSection14', data);
    safeRun(renderLeaderSection15, 'renderLeaderSection15', data);
    safeRun(renderLeaderSection16, 'renderLeaderSection16', data);
}

// ────────────────────────────────────────────────────────────
// SECTION 1 — Mini KPI Cards
// ────────────────────────────────────────────────────────────
function renderLeaderSection1(data) {
    const el = document.getElementById('leaderKPICards');
    if (!el) return;
    const totalCases = data.length;
    const totalKM = data.reduce((s,r)=>s+(Number(r['KM'])||0), 0);
    const totalImpact = data.filter(r=>Number(r['Impact'])===1||Number(r['impact'])===1).length;
    const impactRate = totalCases>0 ? ((totalImpact/totalCases)*100).toFixed(1) : 0;
    const totalHour = data.reduce((s,r)=>s+(Number(r['HourSP'])||0), 0);
    const uniqueStaff = new Set(data.map(r=>cleanLeaderName(r['Người xử lý'])).filter(Boolean)).size;

    el.innerHTML = `
        <div class="ldr-kpi-card" style="--accent:#6366f1">
            <div class="ldr-kpi-icon">📋</div>
            <div class="ldr-kpi-value">${totalCases.toLocaleString('vi-VN')}</div>
            <div class="ldr-kpi-label">Tổng ca đã làm</div>
        </div>
        <div class="ldr-kpi-card" style="--accent:#10b981">
            <div class="ldr-kpi-icon">🗺️</div>
            <div class="ldr-kpi-value">${Math.round(totalKM).toLocaleString('vi-VN')} km</div>
            <div class="ldr-kpi-label">Tổng KM di chuyển</div>
        </div>
        <div class="ldr-kpi-card" style="--accent:#f59e0b">
            <div class="ldr-kpi-icon">⚡</div>
            <div class="ldr-kpi-value">${impactRate}%</div>
            <div class="ldr-kpi-label">Tỉ lệ Impact TB</div>
        </div>
        <div class="ldr-kpi-card" style="--accent:#3b82f6">
            <div class="ldr-kpi-icon">⏱️</div>
            <div class="ldr-kpi-value">${Math.round(totalHour).toLocaleString('vi-VN')} giờ</div>
            <div class="ldr-kpi-label">Tổng giờ hỗ trợ</div>
        </div>
        <div class="ldr-kpi-card" style="--accent:#8b5cf6">
            <div class="ldr-kpi-icon">👥</div>
            <div class="ldr-kpi-value">${uniqueStaff}</div>
            <div class="ldr-kpi-label">SC hoạt động</div>
        </div>`;
}

// ────────────────────────────────────────────────────────────
// SECTION 2 — Địa bàn & Di chuyển
// ────────────────────────────────────────────────────────────
function renderLeaderSection2(data) {
    if (!document.getElementById('leaderGeoProvChart')) return;
    const isDark = document.documentElement.classList.contains('dark-theme');
    const labelColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

    const provCount = {};
    data.forEach(r => {
        const prov = (r['Tỉnh/Thành phố']||r['tinh_thanh']||'').trim();
        if (prov) provCount[prov] = (provCount[prov]||0)+1;
    });
    const topProvs = Object.entries(provCount).sort((a,b)=>b[1]-a[1]).slice(0,10);

    destroyLeaderChart('geo1');
    const ctx1 = document.getElementById('leaderGeoProvChart');
    if (ctx1 && topProvs.length>0) {
        leaderCharts['geo1'] = new Chart(ctx1, {
            type:'bar',
            data:{ labels:topProvs.map(p=>p[0]), datasets:[{ label:'Số ca', data:topProvs.map(p=>p[1]), backgroundColor:'rgba(99,102,241,0.75)', borderRadius:6 }] },
            plugins:[leaderLabelPlugin],
            options:{ 
                responsive:true, 
                layout:{padding:{top:22}}, 
                plugins:{legend:{display:false}}, 
                scales:{
                    x:{ticks:{font:{size:11},maxRotation:45,color:labelColor},grid:{color:gridColor}},
                    y:{ticks:{precision:0,color:labelColor},grid:{color:gridColor}}
                } 
            }
        });
    } else if (ctx1) {
        ctx1.parentElement.innerHTML = '<p style="text-align:center;color:#64748b;padding:20px;font-style:italic">Không có dữ liệu tỉnh/thành phố trong dataset.</p>';
    }

    const staffKM={}; const staffCases={};
    data.forEach(r=>{
        const s=cleanLeaderName(r['Người xử lý']); if(!s) return;
        staffKM[s]=(staffKM[s]||0)+(Number(r['KM'])||0);
        staffCases[s]=(staffCases[s]||0)+1;
    });
    const kmRows = Object.keys(staffCases).map(s=>({ name:s, avg: staffCases[s]>0 ? staffKM[s]/staffCases[s] : 0 })).sort((a,b)=>b.avg-a.avg);

    destroyLeaderChart('geo2');
    const ctx2 = document.getElementById('leaderGeoKMChart');
    if (ctx2 && kmRows.length>0) {
        leaderCharts['geo2'] = new Chart(ctx2, {
            type:'bar',
            data:{ labels:kmRows.map(r=>r.name), datasets:[{ label:'KM TB/ca', data:kmRows.map(r=>+r.avg.toFixed(2)), backgroundColor:'rgba(16,185,129,0.75)', borderRadius:6 }] },
            plugins:[leaderLabelPlugin],
            options:{ 
                indexAxis:'y', 
                responsive:true, 
                layout:{padding:{right:42}}, 
                plugins:{legend:{display:false}}, 
                scales:{
                    x:{ticks:{precision:1,color:labelColor},grid:{color:gridColor}},
                    y:{ticks:{color:labelColor},grid:{color:gridColor}}
                } 
            }
        });
    }

    const staffImpact={};
    data.forEach(r=>{
        const s=cleanLeaderName(r['Người xử lý']); if(!s) return;
        if(Number(r['Impact'])===1||Number(r['impact'])===1) staffImpact[s]=(staffImpact[s]||0)+1;
    });
    const effRows = Object.keys(staffCases).map(s=>({
        name:s, cases:staffCases[s], km:staffKM[s]||0, impact:staffImpact[s]||0,
        ratio:(staffKM[s]||0)>0?((staffImpact[s]||0)/(staffKM[s]||1)*100).toFixed(2):0
    })).sort((a,b)=>b.ratio-a.ratio);

    const el = document.getElementById('leaderGeoEffTable');
    if (el) el.innerHTML = `<table class="ldr-table"><thead><tr><th>SC</th><th>Số ca</th><th>Tổng KM</th><th>Impact</th><th>Impact/100km ↓</th></tr></thead><tbody>
        ${effRows.map(r=>`<tr><td><b>${r.name}</b></td><td>${r.cases}</td><td>${r.km.toFixed(1)} km</td><td>${r.impact}</td>
        <td><span class="ldr-badge ${Number(r.ratio)>=5?'badge-green':Number(r.ratio)>=2?'badge-yellow':'badge-red'}">${r.ratio}</span></td></tr>`).join('')}
        </tbody></table>`;
}

// ────────────────────────────────────────────────────────────
// SECTION 3 — Thời gian làm việc
// ────────────────────────────────────────────────────────────
function renderLeaderSection3(data) {
    if (!document.getElementById('leaderTimeHourChart')) return;
    const isDark = document.documentElement.classList.contains('dark-theme');
    const labelColor = isDark ? '#94a3b8' : '#475569';
    const titleColor = isDark ? '#f1f5f9' : '#1e293b';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

    const hourCount = {};
    for(let h=0;h<24;h++) hourCount[h]=0;
    data.forEach(r=>{
        const ci = r['Thời gian checkin']||r['Giờ Chekcin']||'';
        if(ci){ const d=new Date(ci); if(!isNaN(d)) hourCount[d.getHours()]=(hourCount[d.getHours()]||0)+1; }
    });
    const hours = Array.from({length:24},(_,i)=>i);

    destroyLeaderChart('time1');
    const ctx1 = document.getElementById('leaderTimeHourChart');
    if(ctx1){
        leaderCharts['time1'] = new Chart(ctx1,{
            type:'bar',
            data:{ labels:hours.map(h=>`${String(h).padStart(2,'0')}h`),
                datasets:[{label:'Số ca check-in',data:hours.map(h=>hourCount[h]),
                backgroundColor:hours.map(h=>h>=7&&h<=18?'rgba(99,102,241,0.75)':'rgba(239,68,68,0.55)'),borderRadius:4}]},
            plugins:[leaderLabelPlugin],
            options:{
                responsive:true, 
                layout:{padding:{top:22}}, 
                plugins:{
                    legend:{display:false},
                    title:{display:true,text:'🟣 Hành chính (7h-18h)   🔴 Ngoài giờ',color:titleColor}
                },
                scales:{
                    x:{ticks:{color:labelColor},grid:{color:gridColor}},
                    y:{ticks:{precision:0,color:labelColor},grid:{color:gridColor}}
                }
            }
        });
    }

    const staffHour={}; const staffC={};
    data.forEach(r=>{
        const s=cleanLeaderName(r['Người xử lý']); if(!s) return;
        staffHour[s]=(staffHour[s]||0)+(Number(r['HourSP'])||0);
        staffC[s]=(staffC[s]||0)+1;
    });
    const timeRows = Object.keys(staffC).map(s=>({
        name:s, cases:staffC[s], total:staffHour[s]||0,
        avgMin: staffC[s]>0?((staffHour[s]||0)/staffC[s]*60).toFixed(0):0
    })).sort((a,b)=>b.avgMin-a.avgMin);

    const el = document.getElementById('leaderTimeTable');
    if(el) el.innerHTML=`<table class="ldr-table"><thead><tr><th>SC</th><th>Số ca</th><th>Tổng giờ SP</th><th>TB phút/ca ↓</th></tr></thead><tbody>
        ${timeRows.map(r=>`<tr><td><b>${r.name}</b></td><td>${r.cases}</td><td>${r.total.toFixed(1)} giờ</td><td>${r.avgMin} phút</td></tr>`).join('')}
        </tbody></table>`;
}

// ────────────────────────────────────────────────────────────
// SECTION 4 — Khách hàng & Ngành hàng
// ────────────────────────────────────────────────────────────
function renderLeaderSection4(data) {
    const isDark = document.documentElement.classList.contains('dark-theme');
    const legendColor = isDark ? '#e2e8f0' : '#1e293b';
    const palette = ['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16','#ec4899'];

    const indCount={};
    data.forEach(r=>{ const v=(r['Ngành hàng']||'Khác').trim(); indCount[v]=(indCount[v]||0)+1; });
    const topInd = Object.entries(indCount).sort((a,b)=>b[1]-a[1]).slice(0,9);

    destroyLeaderChart('ind1');
    const ctx1=document.getElementById('leaderIndustryChart');
    if(ctx1&&topInd.length>0){
        leaderCharts['ind1']=new Chart(ctx1,{type:'doughnut',
            data:{labels:topInd.map(i=>i[0]),datasets:[{data:topInd.map(i=>i[1]),backgroundColor:palette,borderWidth:2}]},
            options:{
                responsive:true,
                plugins:{
                    legend:{
                        position:'right',
                        labels:{
                            color:legendColor,
                            font:{size:11,weight:'bold'},
                            boxWidth:14,
                            generateLabels:(chart)=>{
                                const d=chart.data;
                                const tot=d.datasets[0].data.reduce((a,b)=>a+b,0);
                                return d.labels.map((lbl,i)=>{
                                    const val=d.datasets[0].data[i];
                                    const pct=tot>0?((val/tot)*100).toFixed(1):0;
                                    return {text:`${lbl}: ${val} (${pct}%)`,fillStyle:d.datasets[0].backgroundColor[i],strokeStyle:'transparent',lineWidth:0,hidden:false,index:i,fontColor:legendColor,color:legendColor};
                                });
                            }
                        }
                    }
                }
            }
        });
    }

    const ctrCount={};
    data.forEach(r=>{ const v=(r['Gói hợp đồng']||'Không rõ').trim(); ctrCount[v]=(ctrCount[v]||0)+1; });
    const topCtr = Object.entries(ctrCount).sort((a,b)=>b[1]-a[1]);

    destroyLeaderChart('ind2');
    const ctx2=document.getElementById('leaderContractChart');
    if(ctx2&&topCtr.length>0){
        leaderCharts['ind2']=new Chart(ctx2,{type:'doughnut',
            data:{labels:topCtr.map(c=>c[0]),datasets:[{data:topCtr.map(c=>c[1]),backgroundColor:palette,borderWidth:2}]},
            options:{
                responsive:true,
                plugins:{
                    legend:{
                        position:'right',
                        labels:{
                            color:legendColor,
                            font:{size:11,weight:'bold'},
                            boxWidth:14,
                            generateLabels:(chart)=>{
                                const d=chart.data;
                                const tot=d.datasets[0].data.reduce((a,b)=>a+b,0);
                                return d.labels.map((lbl,i)=>{
                                    const val=d.datasets[0].data[i];
                                    const pct=tot>0?((val/tot)*100).toFixed(1):0;
                                    return {text:`${lbl}: ${val} (${pct}%)`,fillStyle:d.datasets[0].backgroundColor[i],strokeStyle:'transparent',lineWidth:0,hidden:false,index:i,fontColor:legendColor,color:legendColor};
                                });
                            }
                        }
                    }
                }
            }
        });
    }

    const retCount={};
    const retStaffs={};
    data.forEach(r=>{
        const id=r['Retailer ID'];
        if(id) {
            retCount[id]=(retCount[id]||0)+1;
            if(!retStaffs[id]) retStaffs[id]=new Set();
            const s=cleanLeaderName(r['Người xử lý']);
            if(s) retStaffs[id].add(s);
        }
    });
    const topRet = Object.entries(retCount).filter(r=>r[1]>1).sort((a,b)=>b[1]-a[1]).slice(0,10);
    const el=document.getElementById('leaderRevisitTable');
    if(el){
        if(topRet.length===0){ el.innerHTML='<p style="color:#64748b;font-style:italic;text-align:center;padding:15px">Không có Retailer nào được thăm >1 lần trong kỳ.</p>'; }
        else el.innerHTML=`<table class="ldr-table"><thead><tr><th>Retailer ID</th><th>Số lần viếng thăm ↓</th><th>Nhân sự</th><th>Đánh giá</th></tr></thead><tbody>
            ${topRet.map(r=>{
                const staffsList = Array.from(retStaffs[r[0]] || []).join(', ');
                return `<tr>
                    <td><button class="ldr-drill-btn" onclick="showRetailerVisits('${r[0]}')">🔍 ID: ${r[0]}</button></td>
                    <td>${r[1]} lần</td>
                    <td style="max-width:260px;white-space:normal;">${staffsList || '-'}</td>
                    <td><span class="ldr-badge ${r[1]>=4?'badge-red':r[1]>=2?'badge-yellow':'badge-green'}">${r[1]>=4?'🔁 Cần kiểm tra':r[1]>=2?'👀 Đang theo dõi':'OK'}</span></td>
                </tr>`;
            }).join('')}
            </tbody></table>`;
    }
}

// ────────────────────────────────────────────────────────────
// SECTION 5 — Chất lượng công việc
// ────────────────────────────────────────────────────────────
function renderLeaderSection5(data) {
    const isDark = document.documentElement.classList.contains('dark-theme');
    const labelColor = isDark ? '#94a3b8' : '#475569';
    const legendColor = isDark ? '#e2e8f0' : '#1e293b';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

    const staffM={};
    data.forEach(r=>{
        const s=cleanLeaderName(r['Người xử lý']); if(!s) return;
        if(!staffM[s]) staffM[s]={score:0,impact:0,addon:0,cases:0};
        staffM[s].cases++;
        staffM[s].score+=Number(r['Tổng điểm'])||0;
        if(Number(r['Impact'])===1||Number(r['impact'])===1) staffM[s].impact++;
        staffM[s].addon+=Number(r['Addon'])||0;
    });
    const slist=Object.keys(staffM).sort();

    destroyLeaderChart('qual1');
    const ctx1=document.getElementById('leaderQualityChart');
    if(ctx1&&slist.length>0){
        leaderCharts['qual1']=new Chart(ctx1,{type:'bar',
            data:{labels:slist,datasets:[
                {label:'Tổng điểm',data:slist.map(s=>staffM[s].score),backgroundColor:'rgba(99,102,241,0.75)',borderRadius:4},
                {label:'Impact',data:slist.map(s=>staffM[s].impact),backgroundColor:'rgba(16,185,129,0.75)',borderRadius:4},
                {label:'Addon',data:slist.map(s=>staffM[s].addon),backgroundColor:'rgba(245,158,11,0.75)',borderRadius:4}
            ]},
            plugins:[leaderLabelPlugin],
            options:{
                responsive:true, 
                layout:{padding:{top:22}}, 
                plugins:{
                    legend:{position:'top',labels:{color:legendColor}}
                },
                scales:{
                    x:{ticks:{font:{size:11},color:labelColor},grid:{color:gridColor}},
                    y:{ticks:{precision:0,color:labelColor},grid:{color:gridColor}}
                }
            }
        });
    }

    const dayCount={};
    data.forEach(r=>{
        const d=r['Ngày checkin'];
        if(d!==undefined&&d!==null&&d!==''){
            const k=String(d).padStart(2,'0');
            dayCount[k]=(dayCount[k]||0)+1;
        }
    });
    const days=Object.keys(dayCount).sort((a,b)=>Number(a)-Number(b));

    destroyLeaderChart('qual2');
    const ctx2=document.getElementById('leaderTrendChart');
    if(ctx2&&days.length>0){
        leaderCharts['qual2']=new Chart(ctx2,{type:'line',
            data:{labels:days.map(d=>`Ngày ${d}`),datasets:[{
                label:'Số ca/ngày',data:days.map(d=>dayCount[d]),
                borderColor:'#6366f1',backgroundColor:'rgba(99,102,241,0.08)',
                fill:true,tension:0.4,pointRadius:5,pointHoverRadius:7,
                pointBackgroundColor:'#6366f1'
            }]},
            plugins:[leaderLabelPlugin],
            options:{
                responsive:true, 
                layout:{padding:{top:22}}, 
                plugins:{legend:{display:false}},
                scales:{
                    x:{ticks:{color:labelColor},grid:{color:gridColor}},
                    y:{ticks:{precision:0,color:labelColor},grid:{color:gridColor}}
                }
            }
        });
    }
}

// ────────────────────────────────────────────────────────────
// SECTION 6 — Nguồn data & Phân phối
// ────────────────────────────────────────────────────────────
function renderLeaderSection6(data) {
    const isDark = document.documentElement.classList.contains('dark-theme');
    const legendColor = isDark ? '#e2e8f0' : '#1e293b';
    const palette=['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316'];
    const srcCount={}; const srcImpact={};
    data.forEach(r=>{
        const src=(r['Nguồn data']||'Khác').trim();
        srcCount[src]=(srcCount[src]||0)+1;
        if(Number(r['Impact'])===1||Number(r['impact'])===1) srcImpact[src]=(srcImpact[src]||0)+1;
    });
    const sources=Object.keys(srcCount).sort((a,b)=>srcCount[b]-srcCount[a]);

    destroyLeaderChart('src1');
    const ctx1=document.getElementById('leaderSourceChart');
    if(ctx1){
        leaderCharts['src1']=new Chart(ctx1,{type:'doughnut',
            data:{labels:sources,datasets:[{data:sources.map(s=>srcCount[s]),backgroundColor:palette,borderWidth:2}]},
            options:{
                responsive:true,
                plugins:{
                    legend:{
                        position:'right',
                        labels:{
                            color:legendColor,
                            font:{size:11,weight:'bold'},
                            boxWidth:14,
                            generateLabels:(chart)=>{
                                const d=chart.data;
                                const tot=d.datasets[0].data.reduce((a,b)=>a+b,0);
                                return d.labels.map((lbl,i)=>{
                                    const val=d.datasets[0].data[i];
                                    const pct=tot>0?((val/tot)*100).toFixed(1):0;
                                    return {text:`${lbl}: ${val} (${pct}%)`,fillStyle:d.datasets[0].backgroundColor[i],strokeStyle:'transparent',lineWidth:0,hidden:false,index:i,fontColor:legendColor,color:legendColor};
                                });
                            }
                        }
                    }
                }
            }
        });
    }

    const el=document.getElementById('leaderSourceTable');
    if(el){
        const rows=sources.map(s=>({
            src:s, total:srcCount[s], impact:srcImpact[s]||0,
            rate:srcCount[s]>0?((srcImpact[s]||0)/srcCount[s]*100).toFixed(1):0
        }));

        let sumTotal = 0;
        let sumImpact = 0;
        rows.forEach(r => {
            sumTotal += r.total;
            sumImpact += r.impact;
        });
        const overallRate = sumTotal > 0 ? (sumImpact / sumTotal * 100) : 0;
        const avgBc = overallRate >= 70 ? 'badge-green' : overallRate >= 40 ? 'badge-yellow' : 'badge-red';

        el.innerHTML=`<table class="ldr-table"><thead><tr><th>Nguồn data</th><th>Tổng ca</th><th>Impact</th><th>Tỉ lệ Impact ↓</th></tr></thead><tbody>
            ${rows.map(r=>`<tr><td><b>${r.src}</b></td><td>${r.total}</td><td>${r.impact}</td>
            <td><span class="ldr-badge ${Number(r.rate)>=70?'badge-green':Number(r.rate)>=40?'badge-yellow':'badge-red'}">${r.rate}%</span></td></tr>`).join('')}
            <tr class="total-row" style="font-weight:bold; background: ${isDark ? '#0f172a' : '#e2e8f0'}; border-top: 2px solid ${isDark ? '#334155' : '#cbd5e1'};">
                <td>Total / Trung bình</td>
                <td>${sumTotal}</td>
                <td>${sumImpact}</td>
                <td><span class="ldr-badge ${avgBc}">${overallRate.toFixed(1)}%</span></td>
            </tr>
            </tbody></table>`;
    }
}

// ────────────────────────────────────────────────────────────
// SECTION 7 — Multi-Metric Leaderboard
// ────────────────────────────────────────────────────────────
function renderLeaderSection7(data) {
    const sm={};
    data.forEach(r=>{
        const s=cleanLeaderName(r['Người xử lý']); if(!s) return;
        if(!sm[s]) sm[s]={cases:0,km:0,hourSP:0,impact:0,addon:0,score:0};
        sm[s].cases++;
        sm[s].km+=Number(r['KM'])||0;
        sm[s].hourSP+=Number(r['HourSP'])||0;
        if(Number(r['Impact'])===1||Number(r['impact'])===1) sm[s].impact++;
        sm[s].addon+=Number(r['Addon'])||0;
        sm[s].score+=Number(r['Tổng điểm'])||0;
    });

    const list=Object.entries(sm).map(([name,m])=>({name,...m}));
    if(list.length===0) return;

    ['cases','impact','addon','score'].forEach(metric=>{
        const vals=list.map(s=>s[metric]);
        const min=Math.min(...vals); const max=Math.max(...vals);
        list.forEach(s=>{ s['r_'+metric]=max>min?(s[metric]-min)/(max-min)*100:50; });
    });
    list.forEach(s=>{ s.composite=(s.r_cases+s.r_impact+s.r_addon+s.r_score)/4; });
    list.sort((a,b)=>b.composite-a.composite);

    const medals=['🥇','🥈','🥉'];
    const el=document.getElementById('leaderboardTable');
    if(el) el.innerHTML=`<table class="ldr-table"><thead><tr>
        <th>Hạng</th><th>SC</th><th>Số ca</th><th>KM</th><th>Giờ SP</th><th>Impact</th><th>Addon</th><th>Tổng điểm</th><th>⭐ Điểm TH</th>
        </tr></thead><tbody>
        ${list.map((s,i)=>`<tr class="${i<3?'ldr-podium-row':''}">
            <td style="text-align:center;font-size:20px">${medals[i]||i+1}</td>
            <td><b>${s.name}</b></td><td>${s.cases}</td><td>${s.km.toFixed(1)}</td>
            <td>${s.hourSP.toFixed(1)}</td><td>${s.impact}</td><td>${s.addon}</td><td>${s.score}</td>
            <td><span class="ldr-badge ${s.composite>=70?'badge-green':s.composite>=40?'badge-yellow':'badge-red'}">${s.composite.toFixed(0)}</span></td>
        </tr>`).join('')}
        </tbody></table>`;
}

// ────────────────────────────────────────────────────────────
// SECTION 8 — Fraud Detection (Tự tạo ATC)
// ────────────────────────────────────────────────────────────
let leaderFraudDrillData = {};

function renderLeaderSection8(data) {
    leaderFraudDrillData = {};
    const ss={};
    data.forEach(r=>{
        const processor=cleanLeaderName(r['Người xử lý']);
        const creator=cleanLeaderName(r['Người tạo']);
        if(!processor) return;
        // Bỏ tên Nguyễn Ái Quốc theo yêu cầu
        if(processor.toLowerCase().includes('nguyễn ái quốc')) return;

        if(!ss[processor]) ss[processor]={total:0,self:0};
        ss[processor].total++;
        if(creator && processor && creator===processor){
            ss[processor].self++;
            if(!leaderFraudDrillData[processor]) leaderFraudDrillData[processor]=[];
            leaderFraudDrillData[processor].push(r);
        }
    });

    const rows=Object.entries(ss).map(([name,s])=>({
        name, total:s.total, self:s.self,
        pct:s.total>0?(s.self/s.total*100).toFixed(1):0
    })).sort((a,b)=>Number(b.pct)-Number(a.pct));

    const el=document.getElementById('leaderFraudTable');
    if(!el) return;

    let sumTotal = 0;
    let sumSelf = 0;
    rows.forEach(r => {
        sumTotal += r.total;
        sumSelf += r.self;
    });
    const overallPct = sumTotal > 0 ? (sumSelf / sumTotal * 100) : 0;
    const avgBc = overallPct > 50 ? 'badge-red' : overallPct > 20 ? 'badge-yellow' : 'badge-green';
    const avgLbl = overallPct > 50 ? '🚨 Nghi vấn gian lận' : overallPct > 20 ? '⚠️ Cần để ý' : '✅ Bình thường';
    const isDark = document.documentElement.classList.contains('dark-theme');

    el.innerHTML=`<table class="ldr-table"><thead><tr>
        <th>SC</th><th>Tổng ATC</th><th>Tự tạo</th><th>% Tự tạo ↓</th><th>Đánh giá</th><th>Chi tiết</th>
        </tr></thead><tbody>
        ${rows.map(r=>{
            const p=Number(r.pct);
            const bc=p>50?'badge-red':p>20?'badge-yellow':'badge-green';
            const lbl=p>50?'🚨 Nghi vấn gian lận':p>20?'⚠️ Cần để ý':'✅ Bình thường';
            const safeName = r.name.replace(/'/g, "\'");
            const btn=r.self>0?`<button class="ldr-drill-btn" onclick="showLeaderFraudDetails('${safeName}')">🔍 Xem ${r.self} ATC</button>`:'<span style="color:#94a3b8;font-size:12px">—</span>';
            return `<tr>
                <td><b>${r.name}</b></td><td>${r.total}</td><td>${r.self}</td>
                <td><span class="ldr-badge ${bc}">${r.pct}%</span></td>
                <td>${lbl}</td><td>${btn}</td>
            </tr>`;
        }).join('')}
        <tr class="total-row" style="font-weight:bold; background: ${isDark ? '#0f172a' : '#e2e8f0'}; border-top: 2px solid ${isDark ? '#334155' : '#cbd5e1'};">
            <td>Total / Trung bình đội</td>
            <td>${sumTotal}</td>
            <td>${sumSelf}</td>
            <td><span class="ldr-badge ${avgBc}">${overallPct.toFixed(1)}%</span></td>
            <td>${avgLbl}</td>
            <td>—</td>
        </tr>
        </tbody></table>`;
}

function showLeaderFraudDetails(staffName) {
    const records = leaderFraudDrillData[staffName] || [];
    if (records.length === 0) return;
    
    const titleEl = document.getElementById('pivotListModalTitle');
    if (titleEl) titleEl.innerText = `Danh sách ATC tự tạo - SC ${staffName} (${records.length} ca)`;
    
    const bodyEl = document.getElementById('pivotListModalBody');
    if (!bodyEl) return;
    bodyEl.innerHTML = '';
    
    window.pivotDetailList = records;
    
    records.forEach((row, idx) => {
        const card = document.createElement('div');
        card.className = 'pivot-detail-card';
        card.onclick = function() {
            openDetailFromPivot(idx);
        };
        
        const id = row['Retailer ID'] || '-';
        const km = row['KM'] !== undefined ? `${row['KM']} km` : '0 km';
        const hours = row['HourSP'] !== undefined ? `${Number(row['HourSP']).toFixed(2)} giờ` : '0 giờ';
        const checkinTime = typeof formatTimeHelper === 'function' ? formatTimeHelper(row['Thời gian checkin'] || row['Thời gian tạo']) : (row['Thời gian checkin'] || '-');
        const checkoutTime = typeof formatTimeHelper === 'function' ? formatTimeHelper(row['Thời gian checkout']) : (row['Thời gian checkout'] || '-');
        const location = row['Địa điểm thực tế cửa hàng'] || row['Địa điểm'] || '-';
        
        card.innerHTML = `
            <div class="pivot-card-header">
                <span>Retailer ID: ${id}</span>
                <span style="font-size:12px; color:#ef4444; font-weight: 600;">Xem chi tiết tự tạo ➔</span>
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


// ─── Revisit Rate Drill-down modal listing ─────────────────
function showRetailerVisits(retailerId) {
    const data = cacheData['hieusuat'];
    if (!data) return;
    
    // Filter records for this retailer
    const records = data.filter(row => String(row['Retailer ID']) === String(retailerId));
    if (records.length === 0) return;
    
    const titleEl = document.getElementById('pivotListModalTitle');
    if (titleEl) titleEl.innerText = `Chi tiết viếng thăm - Retailer ${retailerId} (${records.length} ca)`;
    
    const bodyEl = document.getElementById('pivotListModalBody');
    if (!bodyEl) return;
    bodyEl.innerHTML = '';
    
    window.pivotDetailList = records;
    
    records.forEach((row, idx) => {
        const card = document.createElement('div');
        card.className = 'pivot-detail-card';
        card.onclick = function() {
            openDetailFromPivot(idx);
        };
        
        const id = row['Retailer ID'] || '-';
        const staff = row['Người xử lý'] || '-';
        const km = row['KM'] !== undefined ? `${row['KM']} km` : '0 km';
        const hours = row['HourSP'] !== undefined ? `${Number(row['HourSP']).toFixed(2)} giờ` : '0 giờ';
        const checkinTime = typeof formatTimeHelper === 'function' ? formatTimeHelper(row['Thời gian checkin'] || row['Thời gian tạo']) : (row['Thời gian checkin'] || '-');
        const checkoutTime = typeof formatTimeHelper === 'function' ? formatTimeHelper(row['Thời gian checkout']) : (row['Thời gian checkout'] || '-');
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
    
    const modal = document.getElementById('pivotListModal');
    if (modal) modal.style.display = 'flex';
}


// ────────────────────────────────────────────────────────────
// SECTION 11 — Phân tích hiệu quả di chuyển (KM Lãng phí)
// ────────────────────────────────────────────────────────────
function renderLeaderSection11(data) {
    if (!document.getElementById('leaderWastedKMTable')) return;
    const ss = {};
    data.forEach(r => {
        const s = cleanLeaderName(r['Người xử lý']);
        if (!s) return;
        if (!ss[s]) ss[s] = { totalKM: 0, wastedKM: 0, totalCases: 0, wastedCases: 0 };
        
        const km = Number(r['KM']) || 0;
        ss[s].totalKM += km;
        ss[s].totalCases++;
        
        const status = String(r['Thực trạng khi đến'] || '').trim();
        // Wasted if closed, wrong address, or non-existent
        if (status === 'Đúng cửa hàng/cty - Đóng cửa' || 
            status === 'Không có cửa hàng/công ty' || 
            status === 'Địa chỉ trên Opt không tồn tại') {
            ss[s].wastedKM += km;
            ss[s].wastedCases++;
        }
    });

    const rows = Object.entries(ss).map(([name, s]) => ({
        name,
        totalKM: s.totalKM,
        wastedKM: s.wastedKM,
        totalCases: s.totalCases,
        wastedCases: s.wastedCases,
        pct: s.totalKM > 0 ? ((s.wastedKM / s.totalKM) * 100).toFixed(1) : 0
    })).sort((a, b) => b.wastedKM - a.wastedKM);

    const el = document.getElementById('leaderWastedKMTable');
    if (!el) return;
    el.innerHTML = `<table class="ldr-table"><thead><tr>
        <th>SC</th><th>Tổng ca đi</th><th>Ca bị lãng phí</th><th>Tổng KM đã đi</th><th>KM bị lãng phí ↓</th><th>Tỷ lệ hao phí KM</th>
        </tr></thead><tbody>
        ${rows.map(r => {
            const p = Number(r.pct);
            const bc = p > 40 ? 'badge-red' : p > 20 ? 'badge-yellow' : 'badge-green';
            return `<tr>
                <td><b>${r.name}</b></td>
                <td>${r.totalCases} ca</td>
                <td>${r.wastedCases} ca</td>
                <td>${r.totalKM.toFixed(1)} km</td>
                <td><b style="color: ${p > 40 ? '#ef4444' : 'inherit'};">${r.wastedKM.toFixed(1)} km</b></td>
                <td><span class="ldr-badge ${bc}">${r.pct}%</span></td>
            </tr>`;
        }).join('')}
        </tbody></table>`;
}

// ────────────────────────────────────────────────────────────
// SECTION 12 — Khung giờ check-in tối ưu
// ────────────────────────────────────────────────────────────
function renderLeaderSection12(data) {
    if (!document.getElementById('leaderOptimalHourChart')) return;
    const isDark = document.documentElement.classList.contains('dark-theme');
    const labelColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

    // Group hours into slots
    // Slot 1: 08:00 - 10:59 (Sáng)
    // Slot 2: 11:00 - 13:59 (Trưa)
    // Slot 3: 14:00 - 16:59 (Chiều)
    // Slot 4: 17:00+ (Tối)
    const slots = [
        { label: 'Sáng (08h - 11h)', hours: [8, 9, 10], total: 0, open: 0 },
        { label: 'Trưa (11h - 14h)', hours: [11, 12, 13], total: 0, open: 0 },
        { label: 'Chiều (14h - 17h)', hours: [14, 15, 16], total: 0, open: 0 },
        { label: 'Tối (17h trở đi)', hours: [17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7], total: 0, open: 0 }
    ];

    data.forEach(r => {
        const ci = r['Thời gian checkin'] || r['Giờ Chekcin'] || '';
        if (!ci) return;
        const d = new Date(ci);
        if (isNaN(d)) return;
        
        const hour = d.getHours();
        const slot = slots.find(s => s.hours.includes(hour));
        if (slot) {
            slot.total++;
            const status = String(r['Thực trạng khi đến'] || '').trim();
            if (status === 'Đúng cửa hàng/cty - Mở cửa') {
                slot.open++;
            }
        }
    });

    const chartLabels = slots.map(s => s.label);
    const chartData = slots.map(s => s.total > 0 ? ((s.open / s.total) * 100).toFixed(1) : 0);

    destroyLeaderChart('optimalHour');
    const ctx = document.getElementById('leaderOptimalHourChart');
    if (ctx) {
        leaderCharts['optimalHour'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Tỷ lệ Mở cửa (%)',
                    data: chartData,
                    backgroundColor: ['rgba(16, 185, 129, 0.75)', 'rgba(245, 158, 11, 0.75)', 'rgba(59, 130, 246, 0.75)', 'rgba(139, 92, 246, 0.75)'],
                    borderRadius: 6
                }]
            },
            plugins: [leaderLabelPlugin],
            options: {
                responsive: true,
                layout: { padding: { top: 22 } },
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { ticks: { color: labelColor }, grid: { color: gridColor } },
                    y: { 
                        ticks: { color: labelColor, callback: value => value + '%' },
                        grid: { color: gridColor },
                        max: 100
                    }
                }
            }
        });
    }
}


// ────────────────────────────────────────────────────────────
// SECTION 14 — Phân tích tỷ lệ Addon theo SC
// ────────────────────────────────────────────────────────────
const ADDON_KEYS = [
    "Kích hoạt payment thành công", 
    "Giới thiệu Kship", 
    "Giới thiệu Lending",
    "Giới thiệu nâng gói", 
    "Mua phần cứng", 
    "Giới thiệu Thêm kho/thêm chi nhánh",
    "Giới thiệu Hotellink", 
    "Hướng dẫn KH HDDT/CKS thành công", 
    "Chuyển lead tái ký", 
    "Chuyển lead ký mới"
];

function getRecordAddonDetails(row) {
    const cvText = String(row['Công việc hỗ trợ KH'] || '').trim();
    if (!cvText) return [];
    
    const parts = cvText.split('|##|').map(p => p.trim()).filter(Boolean);
    const matched = [];
    
    parts.forEach(part => {
        const partLower = part.toLowerCase();
        const matchedKey = ADDON_KEYS.find(key => partLower.includes(key.toLowerCase()));
        if (matchedKey) {
            matched.push({
                type: matchedKey,
                details: part,
                retailerId: row['Retailer ID'],
                date: row['Thời gian tạo'] || row['Thời gian checkin'] || ''
            });
        }
    });
    
    return matched;
}

window.leaderAddonData = {};

function renderLeaderSection14(data) {
    const isDark = document.documentElement.classList.contains('dark-theme');
    const legendColor = isDark ? '#e2e8f0' : '#1e293b';

    window.leaderAddonData = {};
    const ss = {};
    const overallAddonTypes = {};
    
    data.forEach(r => {
        const s = cleanLeaderName(r['Người xử lý']);
        if (!s) return;
        
        if (!ss[s]) {
            ss[s] = { totalCases: 0, totalAddons: 0, addonTypes: {} };
        }
        
        ss[s].totalCases++;
        
        const addons = getRecordAddonDetails(r);
        if (addons.length > 0) {
            ss[s].totalAddons += addons.length;
            
            if (!window.leaderAddonData[s]) {
                window.leaderAddonData[s] = [];
            }
            const originalIndex = cacheData['hieusuat'].indexOf(r);
            addons.forEach(ad => {
                ad.originalIndex = originalIndex;
                window.leaderAddonData[s].push(ad);
                
                ss[s].addonTypes[ad.type] = (ss[s].addonTypes[ad.type] || 0) + 1;
                overallAddonTypes[ad.type] = (overallAddonTypes[ad.type] || 0) + 1;
            });
        }
    });
    
    const selectEl = document.getElementById('leaderAddonStaffSelect');
    if (selectEl) {
        const currentVal = selectEl.value;
        selectEl.innerHTML = '<option value="">-- Tất cả nhân sự --</option>' + 
            Object.keys(window.leaderAddonData).sort().map(s => 
                `<option value="${s}"${s === currentVal ? ' selected' : ''}>${s} (${window.leaderAddonData[s].length} ca)</option>`
            ).join('');
    }
    
    // Render Overall Addon Donut Chart
    destroyLeaderChart('addonType1');
    const ctx = document.getElementById('leaderAddonTypeChart');
    const addonLabels = Object.keys(overallAddonTypes);
    const addonCounts = Object.values(overallAddonTypes);
    
    if (ctx && addonLabels.length > 0) {
        const colors = [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
            '#ec4899', '#14b8a6', '#06b6d4', '#f43f5e', '#a855f7'
        ];
        
        leaderCharts['addonType1'] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: addonLabels,
                datasets: [{
                    data: addonCounts,
                    backgroundColor: colors.slice(0, addonLabels.length),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: legendColor,
                            font: { size: 10, weight: 'bold' },
                            boxWidth: 12,
                            generateLabels: (chart) => {
                                const d = chart.data;
                                const tot = d.datasets[0].data.reduce((a, b) => a + b, 0);
                                return d.labels.map((lbl, i) => {
                                    const val = d.datasets[0].data[i];
                                    const pct = tot > 0 ? ((val / tot) * 100).toFixed(1) : 0;
                                    const shortLbl = lbl.replace('Giới thiệu ', '').replace(' thành công', '');
                                    return {
                                        text: `${shortLbl}: ${val} (${pct}%)`,
                                        fillStyle: d.datasets[0].backgroundColor[i],
                                        strokeStyle: 'transparent',
                                        lineWidth: 0,
                                        hidden: false,
                                        index: i,
                                        fontColor: legendColor,
                                        color: legendColor
                                    };
                                });
                            }
                        }
                    }
                }
            }
        });
    } else if (ctx) {
        ctx.parentElement.innerHTML = '<p style="text-align:center;color:#64748b;padding:20px;font-style:italic">Không có dữ liệu Addon để lập biểu đồ.</p>';
    }
    
    const rows = Object.entries(ss).map(([name, s]) => {
        const typeSummaries = Object.entries(s.addonTypes)
            .map(([type, count]) => `${type.replace('Giới thiệu ', '')} (${count})`)
            .join(', ') || 'Không có';
            
        const target = getKPIAddonTarget(name);
        const achieved = s.totalAddons * 5;
        const pctAchieved = target > 0 ? ((achieved / target) * 100).toFixed(1) : 0;
            
        return {
            name,
            totalCases: s.totalCases,
            totalAddons: s.totalAddons,
            target,
            achieved,
            pctAchieved,
            typeSummaries
        };
    }).sort((a, b) => b.totalAddons - a.totalAddons);
    
    const tableEl = document.getElementById('leaderAddonTable');
    if (tableEl) {
        tableEl.innerHTML = `<table class="ldr-table"><thead><tr>
            <th>SC</th>
            <th>Tổng ca</th>
            <th>Số Addon</th>
            <th>KPI Addon (Mục tiêu)</th>
            <th>KPI Đạt (Điểm đạt)</th>
            <th>% Đạt KPI ↓</th>
            <th>Các loại Addon đạt được</th>
            </tr></thead><tbody>
            ${rows.map(r => {
                const pctVal = Number(r.pctAchieved);
                const badgeClass = pctVal >= 70 ? 'badge-green' : pctVal >= 50 ? 'badge-yellow' : 'badge-red';
                return `<tr>
                    <td><b>${r.name}</b></td>
                    <td>${r.totalCases} ca</td>
                    <td><b>${r.totalAddons} ca</b></td>
                    <td>${r.target} điểm</td>
                    <td><span class="ldr-badge badge-green">${r.achieved} điểm</span></td>
                    <td><span class="ldr-badge ${badgeClass}">${r.pctAchieved}%</span></td>
                    <td style="font-size:12px;color:#64748b;max-width:320px;white-space:normal;word-wrap:break-word;text-align:left;">${r.typeSummaries}</td>
                </tr>`;
            }).join('')}
            </tbody></table>`;
    }
    
    renderLeaderAddonDetails();
}

function renderLeaderAddonDetails() {
    const selectEl = document.getElementById('leaderAddonStaffSelect');
    const typeSelectEl = document.getElementById('leaderAddonTypeSelect');
    const containerEl = document.getElementById('leaderAddonDetailTableContainer');
    if (!selectEl || !typeSelectEl || !containerEl) return;
    
    const staffName = selectEl.value;
    const addonType = typeSelectEl.value;
    
    // Mặc định không chọn bộ lọc nào -> Ẩn bảng để tránh quá dài
    if (!staffName && !addonType) {
        containerEl.innerHTML = '<p style="text-align:center; color:#64748b; font-style:italic; padding:25px 15px">Vui lòng chọn nhân sự hoặc loại Addon ở trên để bắt đầu tra cứu chi tiết các ca.</p>';
        return;
    }
    
    let records = [];
    if (staffName) {
        records = (window.leaderAddonData[staffName] || []).map(r => ({ ...r, staffName }));
    } else {
        Object.entries(window.leaderAddonData).forEach(([sName, list]) => {
            list.forEach(r => {
                records.push({ ...r, staffName: sName });
            });
        });
    }
    
    if (addonType) {
        records = records.filter(r => r.type === addonType);
    }
    
    if (records.length === 0) {
        containerEl.innerHTML = '<p style="text-align:center; color:#64748b; font-style:italic; padding:15px">Không tìm thấy ca Addon nào khớp với điều kiện lọc.</p>';
        return;
    }
    
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    window.pivotDetailList = records.map(r => cacheData['hieusuat'][r.originalIndex]);
    
    const showSCColumn = !staffName;
    
    containerEl.innerHTML = `<div style="overflow-x:auto;"><table class="ldr-table" style="margin-top:5px;width:100%;"><thead><tr>
        <th>Retailer ID</th>
        ${showSCColumn ? '<th>Nhân sự</th>' : ''}
        <th>Thời gian</th>
        <th>Loại Addon</th>
        <th>Chi tiết công việc ghi nhận</th>
        </tr></thead><tbody>
        ${records.map((r, idx) => {
            const dateStr = typeof formatTimeHelper === 'function' ? formatTimeHelper(r.date) : r.date;
            return `<tr>
                <td><button class="ldr-drill-btn" onclick="openDetailFromPivot(${idx})">🔍 ${r.retailerId}</button></td>
                ${showSCColumn ? `<td><b>${r.staffName}</b></td>` : ''}
                <td style="font-size:12px;white-space:nowrap;">${dateStr}</td>
                <td><span class="ldr-badge badge-yellow">${r.type.replace('Giới thiệu ', '').replace(' thành công', '')}</span></td>
                <td style="font-size:12px;text-align:left;white-space:normal;word-wrap:break-word;max-width:400px;">${r.details}</td>
            </tr>`;
        }).join('')}
        </tbody></table></div>`;
}

function getKPIAddonTarget(scName) {
    const kpiData = cacheData['kpi'] || getFromSessionCache('kpi');
    if (kpiData && Array.isArray(kpiData)) {
        const match = kpiData.find(row => {
            const nameInRow = String(row['Tên SC'] || '');
            return nameInRow.includes(scName);
        });
        if (match) {
            const val = parseFloat(match['KPI addon'] || match['KPI Addon']);
            if (!isNaN(val)) return val;
        }
    }
    return 60; // Mặc định Level 2 là 60
}


// ────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────
// SECTION 15 — Tỷ trọng act theo thời gian hỗ trợ của nhân sự
// ────────────────────────────────────────────────────────────
window.leaderSupportDurationCache = {};

function extractDateDisplay(row) {
    if (row['Ngày checkin']) {
        const val = String(row['Ngày checkin']).trim();
        if (!isNaN(val) && val !== '') return `Ngày ${val}`;
        return val;
    }
    const rawTime = row['Thời gian checkin'] || row['Thời gian tạo'] || '';
    if (rawTime) {
        if (typeof formatTimeHelper === 'function') {
            const formatted = formatTimeHelper(rawTime);
            if (formatted && formatted.includes(' ')) return formatted.split(' ')[0];
            return formatted;
        }
        const d = new Date(rawTime);
        if (!isNaN(d)) {
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yyyy = d.getFullYear();
            return `${dd}/${mm}/${yyyy}`;
        }
        return String(rawTime).split('T')[0];
    }
    return 'Khác';
}

function renderLeaderSection15(data) {
    const el = document.getElementById('leaderSupportDurationTable');
    if (!el) return;

    if (!data || data.length === 0) {
        el.innerHTML = '<p style="color:#64748b;font-style:italic;text-align:center;padding:15px">Không có dữ liệu.</p>';
        return;
    }

    const buckets = [
        { label: '1. 0-5p', check: mins => mins >= 0 && mins <= 5 },
        { label: '2. 6-10p', check: mins => mins > 5 && mins <= 10 },
        { label: '3. 11-30p', check: mins => mins > 10 && mins <= 30 },
        { label: '4. 31-59p', check: mins => mins > 30 && mins < 60 },
        { label: '5. 1-2h', check: mins => mins >= 60 && mins <= 120 },
        { label: '6. 2-4h', check: mins => mins > 120 && mins <= 240 },
        { label: '7. 4-8h', check: mins => mins > 240 && mins <= 480 },
        { label: '8. trên 8h', check: mins => mins > 480 }
    ];

    const staffStats = {};
    const colCounts = new Array(8).fill(0);
    let totalAllCases = 0;

    data.forEach(r => {
        const s = cleanLeaderName(r['Người xử lý']);
        if (!s) return;

        let mins = 0;
        if (r['HourSP'] !== undefined && r['HourSP'] !== null && r['HourSP'] !== '') {
            mins = (Number(r['HourSP']) || 0) * 60;
        } else if (r['Thời gian checkin'] && r['Thời gian checkout']) {
            const d1 = new Date(r['Thời gian checkin']);
            const d2 = new Date(r['Thời gian checkout']);
            if (!isNaN(d1) && !isNaN(d2) && d2 >= d1) {
                mins = (d2 - d1) / 60000;
            }
        }

        if (!staffStats[s]) {
            staffStats[s] = { total: 0, counts: new Array(8).fill(0) };
        }

        let bucketIdx = -1;
        for (let i = 0; i < buckets.length; i++) {
            if (buckets[i].check(mins)) {
                bucketIdx = i;
                break;
            }
        }

        if (bucketIdx >= 0) {
            staffStats[s].counts[bucketIdx]++;
            staffStats[s].total++;
            colCounts[bucketIdx]++;
            totalAllCases++;
        }
    });

    const staffNames = Object.keys(staffStats).sort();
    if (staffNames.length === 0) {
        el.innerHTML = '<p style="color:#64748b;font-style:italic;text-align:center;padding:15px">Không có dữ liệu hỗ trợ theo nhân sự.</p>';
        return;
    }

    const isDark = document.documentElement.classList.contains('dark-theme');
    const legendColor = isDark ? '#e2e8f0' : '#1e293b';

    function getTierStyle(pct) {
        if (pct <= 0) return '';
        if (pct < 20) {
            return isDark
                ? 'background: rgba(59, 130, 246, 0.18); color: #93c5fd; font-weight: 500;'
                : 'background: #eff6ff; color: #1d4ed8; font-weight: 500;';
        } else if (pct <= 50) {
            return isDark
                ? 'background: rgba(59, 130, 246, 0.42); color: #e0f2fe; font-weight: 600;'
                : 'background: #bfdbfe; color: #1e40af; font-weight: 600;';
        } else {
            return isDark
                ? 'background: #2563eb; color: #ffffff; font-weight: 700;'
                : 'background: #3b82f6; color: #ffffff; font-weight: 700;';
        }
    }

    let html = `
    <div style="display:flex; gap:15px; align-items:center; margin-bottom:12px; font-size:12px; flex-wrap:wrap;">
        <span style="font-weight:600; color:${legendColor};">Phân cấp màu tỷ trọng (Bấm vào ô bất kỳ để xem chi tiết theo ngày):</span>
        <span style="padding:3px 10px; border-radius:4px; ${isDark ? 'background:rgba(59, 130, 246, 0.18);color:#93c5fd;' : 'background:#eff6ff;color:#1d4ed8;'}">Ít nhất (&lt; 20%)</span>
        <span style="padding:3px 10px; border-radius:4px; font-weight:600; ${isDark ? 'background:rgba(59, 130, 246, 0.42);color:#e0f2fe;' : 'background:#bfdbfe;color:#1e40af;'}">Bình thường (20% - 50%)</span>
        <span style="padding:3px 10px; border-radius:4px; font-weight:700; ${isDark ? 'background:#2563eb;color:#ffffff;' : 'background:#3b82f6;color:#ffffff;'}">Cao nhất (&gt; 50%)</span>
    </div>
    <div style="overflow-x:auto;">
        <table class="ldr-table" style="width:100%; border-collapse:collapse;">
            <thead>
                <tr style="background: ${isDark ? '#0f172a' : '#f1f5f9'};">
                    <th style="min-width:180px; text-align:left;">last_name</th>
                    ${buckets.map(b => `<th style="text-align:center; min-width:95px; white-space:nowrap;">${b.label}</th>`).join('')}
                    <th style="text-align:center; min-width:110px;">Total</th>
                </tr>
            </thead>
            <tbody>`;

    staffNames.forEach(name => {
        const stat = staffStats[name];
        const safeName = name.replace(/'/g, "\'");
        html += `<tr>
            <td style="font-weight:600; text-align:left;">${name}</td>`;

        stat.counts.forEach((count, bIdx) => {
            if (count > 0 && stat.total > 0) {
                const pct = (count / stat.total) * 100;
                const styleStr = getTierStyle(pct);
                html += `<td style="text-align:center; font-size:12px; cursor:pointer; ${styleStr}" onclick="showSupportDurationDetails('${safeName}', ${bIdx})" title="Bấm xem phân bổ ca theo ngày">${count}/${pct.toFixed(2)}%</td>`;
            } else {
                html += `<td style="text-align:center; color:#94a3b8; font-size:12px;"></td>`;
            }
        });

        html += `<td style="text-align:center; font-weight:700; cursor:pointer; background: ${isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc'};" onclick="showSupportDurationDetails('${safeName}', 'Total')" title="Bấm xem tất cả ca của ${name}">${stat.total} ca / 100.00%</td>
        </tr>`;
    });

    // Total / Summary row
    html += `<tr class="total-row" style="font-weight:bold; background: ${isDark ? '#0f172a' : '#e2e8f0'}; border-top: 2px solid ${isDark ? '#334155' : '#cbd5e1'};">
        <td style="text-align:left; font-weight:700;">Total</td>`;

    colCounts.forEach((cCount, bIdx) => {
        if (cCount > 0 && totalAllCases > 0) {
            const overallPct = (cCount / totalAllCases) * 100;
            html += `<td style="text-align:center; font-weight:700; cursor:pointer;" onclick="showSupportDurationDetails('Total', ${bIdx})" title="Bấm xem phân bổ ca cả đội trong khung này">${cCount}/${overallPct.toFixed(2)}%</td>`;
        } else {
            html += `<td style="text-align:center; font-weight:700;"></td>`;
        }
    });

    html += `<td style="text-align:center; font-weight:700; color:#ef4444; cursor:pointer;" onclick="showSupportDurationDetails('Total', 'Total')" title="Bấm xem toàn bộ ca đi toàn đội">${totalAllCases} ca / 100.00%</td>
    </tr>
    </tbody>
    </table>
    </div>`;

    el.innerHTML = html;
}

function showSupportDurationDetails(staffName, bucketIdx) {
    const data = cacheData['hieusuat'];
    if (!data || data.length === 0) return;

    const buckets = [
        { label: '1. 0-5p', check: mins => mins >= 0 && mins <= 5 },
        { label: '2. 6-10p', check: mins => mins > 5 && mins <= 10 },
        { label: '3. 11-30p', check: mins => mins > 10 && mins <= 30 },
        { label: '4. 31-59p', check: mins => mins > 30 && mins < 60 },
        { label: '5. 1-2h', check: mins => mins >= 60 && mins <= 120 },
        { label: '6. 2-4h', check: mins => mins > 120 && mins <= 240 },
        { label: '7. 4-8h', check: mins => mins > 240 && mins <= 480 },
        { label: '8. trên 8h', check: mins => mins > 480 }
    ];

    const targetBucket = bucketIdx !== 'Total' ? buckets[bucketIdx] : null;
    const bucketLabel = targetBucket ? targetBucket.label : 'Tất cả khung thời gian';

    const matchedRecords = data.filter(r => {
        const s = cleanLeaderName(r['Người xử lý']);
        if (staffName !== 'Total' && s !== staffName) return false;

        if (bucketIdx === 'Total') return true;

        let mins = 0;
        if (r['HourSP'] !== undefined && r['HourSP'] !== null && r['HourSP'] !== '') {
            mins = (Number(r['HourSP']) || 0) * 60;
        } else if (r['Thời gian checkin'] && r['Thời gian checkout']) {
            const d1 = new Date(r['Thời gian checkin']);
            const d2 = new Date(r['Thời gian checkout']);
            if (!isNaN(d1) && !isNaN(d2) && d2 >= d1) {
                mins = (d2 - d1) / 60000;
            }
        }
        return targetBucket.check(mins);
    });

    if (matchedRecords.length === 0) return;

    const dateGroups = {};
    matchedRecords.forEach(r => {
        const dateKey = extractDateDisplay(r);
        if (!dateGroups[dateKey]) dateGroups[dateKey] = [];
        dateGroups[dateKey].push(r);
    });

    window.leaderSupportDurationCache = {
        staffName,
        bucketIdx,
        bucketLabel,
        dateGroups,
        matchedRecords
    };

    const isDark = document.documentElement.classList.contains('dark-theme');
    const titleEl = document.getElementById('pivotListModalTitle');
    const bodyEl = document.getElementById('pivotListModalBody');
    if (!titleEl || !bodyEl) return;

    const staffDisplayName = staffName === 'Total' ? 'Tất cả nhân sự' : staffName;
    titleEl.innerText = `⏱️ Phân bổ ca theo ngày: ${staffDisplayName} — ${bucketLabel} (${matchedRecords.length} ca)`;

    const dateKeys = Object.keys(dateGroups).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numB - numA;
    });

    let html = `
    <div style="font-size:13px; color:${isDark ? '#94a3b8' : '#64748b'}; margin-bottom:12px;">
        💡 Bấm vào một ngày bên dưới để xem danh sách chi tiết các ca đi trong ngày đó:
    </div>
    <div style="display:flex; flex-direction:column; gap:8px;">
    `;

    dateKeys.forEach(dateKey => {
        const list = dateGroups[dateKey];
        const safeDate = dateKey.replace(/'/g, "\'");
        html += `
        <div class="sp-date-card" style="display:flex; justify-content:space-between; align-items:center; padding:12px 15px; border-radius:8px; border:1px solid ${isDark ? '#334155' : '#cbd5e1'}; background:${isDark ? '#1e293b' : '#f8fafc'}; cursor:pointer; transition:background 0.15s;" 
             onclick="showSupportDurationDayRecords('${safeDate}')"
             onmouseenter="this.style.background='${isDark ? '#334155' : '#e2e8f0'}'"
             onmouseleave="this.style.background='${isDark ? '#1e293b' : '#f8fafc'}'">
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:16px;">📅</span>
                <span style="font-weight:700; font-size:13px; color:${isDark ? '#f1f5f9' : '#1e293b'};">${dateKey.startsWith('Ngày') ? dateKey : 'Ngày ' + dateKey}</span>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <span class="ldr-badge badge-green" style="font-size:12px; padding:3px 10px;">${list.length} ca</span>
                <span style="color:#3b82f6; font-weight:bold; font-size:13px;">Xem chi tiết ➔</span>
            </div>
        </div>
        `;
    });

    html += `</div>`;
    bodyEl.innerHTML = html;

    const modal = document.getElementById('pivotListModal');
    if (modal) modal.style.display = 'flex';
}

function showSupportDurationDayRecords(dateKey) {
    const cache = window.leaderSupportDurationCache;
    if (!cache || !cache.dateGroups || !cache.dateGroups[dateKey]) return;

    const dayRecords = cache.dateGroups[dateKey];
    window.pivotDetailList = dayRecords;

    const isDark = document.documentElement.classList.contains('dark-theme');
    const titleEl = document.getElementById('pivotListModalTitle');
    const bodyEl = document.getElementById('pivotListModalBody');
    if (!titleEl || !bodyEl) return;

    const staffDisplayName = cache.staffName === 'Total' ? 'Tất cả nhân sự' : cache.staffName;
    const safeStaffName = cache.staffName.replace(/'/g, "\'");
    titleEl.innerText = `📋 Chi tiết ca đi ${dateKey.startsWith('Ngày') ? dateKey : 'ngày ' + dateKey} — ${staffDisplayName} (${dayRecords.length} ca)`;

    let html = `
    <div style="margin-bottom:12px;">
        <button style="padding:6px 14px; border-radius:6px; border:1px solid ${isDark ? '#475569' : '#cbd5e1'}; background:${isDark ? '#334155' : '#f1f5f9'}; color:${isDark ? '#f1f5f9' : '#1e293b'}; cursor:pointer; font-size:12px; font-weight:600;" 
                onclick="showSupportDurationDetails('${safeStaffName}', '${cache.bucketIdx}')">
            ⬅ Quay lại danh sách ngày (${cache.bucketLabel})
        </button>
    </div>
    <div style="display:flex; flex-direction:column; gap:10px;">
    `;

    dayRecords.forEach((r, idx) => {
        const id = r['Retailer ID'] || '-';
        const staff = cleanLeaderName(r['Người xử lý']) || '-';
        const checkinTime = typeof formatTimeHelper === 'function' ? formatTimeHelper(r['Thời gian checkin'] || r['Thời gian tạo']) : (r['Thời gian checkin'] || '-');
        const checkoutTime = typeof formatTimeHelper === 'function' ? formatTimeHelper(r['Thời gian checkout']) : (r['Thời gian checkout'] || '-');
        const hours = r['HourSP'] !== undefined ? `${Number(r['HourSP']).toFixed(2)} giờ` : '-';
        const location = r['Địa điểm thực tế cửa hàng'] || r['Địa điểm'] || '-';
        const work = r['Công việc hỗ trợ KH'] || r['Loại công việc'] || '-';

        html += `
        <div class="pivot-detail-card" style="border:1px solid ${isDark ? '#334155' : '#e2e8f0'}; background:${isDark ? '#1e293b' : '#ffffff'}; border-radius:8px; padding:12px;">
            <div class="pivot-card-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid ${isDark ? '#334155' : '#f1f5f9'}; padding-bottom:8px; margin-bottom:8px;">
                <button class="ldr-drill-btn" onclick="openDetailFromPivot(${idx})">🔍 Retailer ID: ${id}</button>
                <span style="font-size:12px; color:#10b981; font-weight:700;">⏱️ ${hours}</span>
            </div>
            <div class="pivot-card-body" style="font-size:12px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
                <div style="grid-column: span 2;"><strong>Nhân sự:</strong> ${staff}</div>
                <div><strong>Checkin:</strong> ${checkinTime}</div>
                <div><strong>Checkout:</strong> ${checkoutTime}</div>
                <div style="grid-column: span 2;"><strong>Địa điểm:</strong> ${location}</div>
                <div style="grid-column: span 2; color:#3b82f6;"><strong>Công việc:</strong> ${work}</div>
            </div>
        </div>
        `;
    });

    html += `</div>`;
    bodyEl.innerHTML = html;
}



function exportZaloReport() {
    var rawData = cacheData['hieusuat'];
    if (!rawData || rawData.length === 0) {
        alert("⚠️ Chưa có dữ liệu hiệu suất để xuất báo cáo!");
        return;
    }

    var weekSelect = document.getElementById('leaderWeekFilter');
    var selectedWeekKey = weekSelect ? weekSelect.value : 'ALL';
    var selectedWeekLabel = (weekSelect && weekSelect.options[weekSelect.selectedIndex]) ? weekSelect.options[weekSelect.selectedIndex].text : 'Tất cả các tuần';

    var staffSelect = document.getElementById('leaderStaffFilter');
    var selectedStaffKey = staffSelect ? staffSelect.value : 'ALL';

    var data = rawData;
    if (selectedWeekKey && selectedWeekKey !== 'ALL') {
        data = data.filter(function(r) {
            var checkin = r['Thời gian checkin'] || r['Thời gian tạo'];
            var wInfo = getWeekInfoFromCheckin(checkin);
            return wInfo && wInfo.key === selectedWeekKey;
        });
    }
    if (selectedStaffKey && selectedStaffKey !== 'ALL') {
        data = data.filter(function(r) {
            return cleanLeaderName(r['Người xử lý']) === selectedStaffKey;
        });
    }

    var totalCases = data.length;
    var totalImpact = 0;
    var totalAddon = 0;
    var totalHour = 0;
    var totalKm = 0;

    var staffM = {};

    data.forEach(function(r) {
        if (Number(r['Impact']) === 1 || Number(r['impact']) === 1) totalImpact++;
        totalAddon += Number(r['Addon']) || 0;
        totalHour += Number(r['HourSP']) || 0;
        totalKm += Number(r['KM']) || 0;

        var s = cleanLeaderName(r['Người xử lý']);
        if (!s || s.toLowerCase().includes('nguyễn ái quốc')) return;
        if (!staffM[s]) staffM[s] = { cases: 0, impact: 0, addon: 0 };
        staffM[s].cases++;
        if (Number(r['Impact']) === 1 || Number(r['impact']) === 1) staffM[s].impact++;
        staffM[s].addon += Number(r['Addon']) || 0;
    });

    var impactRate = totalCases > 0 ? ((totalImpact / totalCases) * 100).toFixed(1) : 0;
    var topStaff = Object.keys(staffM).map(function(k) {
        return { name: k, cases: staffM[k].cases, impact: staffM[k].impact, addon: staffM[k].addon };
    }).sort(function(a, b) { return b.cases - a.cases; }).slice(0, 3);

    var medals = ['🥇', '🥈', '🥉'];
    var topLines = topStaff.map(function(s, idx) {
        return (medals[idx] || '⭐') + ' ' + s.name + ': ' + s.cases + ' ca (Impact: ' + s.impact + ', Addon: ' + Math.round(s.addon) + ')';
    }).join('\n');

    var now = new Date();
    var dateStr = now.getDate() + '/' + (now.getMonth() + 1) + '/' + now.getFullYear();

    var msg = '📊 [BÁO CÁO HIỆU SUẤT DASHBOARD - ' + dateStr + ']\n' +
              '📌 Khung thời gian: ' + selectedWeekLabel + '\n' +
              '-----------------------------------------\n' +
              '📋 Tổng ca đã làm: ' + totalCases.toLocaleString('vi-VN') + ' ca\n' +
              '⚡ Số ca Impact: ' + totalImpact.toLocaleString('vi-VN') + ' ca (' + impactRate + '%)\n' +
              '🔌 Tổng điểm Addon: ' + Math.round(totalAddon).toLocaleString('vi-VN') + ' điểm\n' +
              '⏱️ Tổng giờ hỗ trợ: ' + Math.round(totalHour).toLocaleString('vi-VN') + ' giờ\n' +
              '🗺️ Quãng đường di chuyển: ' + Math.round(totalKm).toLocaleString('vi-VN') + ' km\n' +
              '-----------------------------------------\n' +
              '🏆 TOP 3 NHÂN SỰ DẪN ĐẦU:\n' +
              topLines + '\n' +
              '=========================================\n' +
              '🚀 Trích xuất tự động từ CRM Dashboard System.';

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(msg).then(function() {
            alert("✅ ĐÃ SAO CHÉP NỘI DUNG BÁO CÁO!\n\nĐang mở Zalo Web... Vui lòng bấm Ctrl + V vào nhóm chat để gửi.");
            window.open('https://chat.zalo.me/', '_blank');
        }).catch(function() {
            prompt("Vui lòng nhấn Ctrl + C để sao chép báo cáo:", msg);
        });
    } else {
        prompt("Vui lòng nhấn Ctrl + C để sao chép báo cáo:", msg);
    }
}

function onSection16FilterChange() {
    const sec16Week = document.getElementById('section16WeekFilter');
    const sec16Staff = document.getElementById('section16StaffFilter');
    const globalWeek = document.getElementById('leaderWeekFilter');
    const globalStaff = document.getElementById('leaderStaffFilter');

    if (sec16Week && globalWeek) globalWeek.value = sec16Week.value;
    if (sec16Staff && globalStaff) globalStaff.value = sec16Staff.value;

    initLeaderTab();
}

// ────────────────────────────────────────────────────────────
// SECTION 16 — Phân tích tỷ trọng loại công việc trong các ca có Impact (Impact = 1)
// ────────────────────────────────────────────────────────────
window.leaderImpactWorkTypeCache = {};

function renderLeaderSection16(data) {
    const kpiCardsEl = document.getElementById('leaderImpactWorkTypeKPICards');
    const tableEl = document.getElementById('leaderImpactWorkTypeTable');
    if (!kpiCardsEl || !tableEl) return;

    if (!data || data.length === 0) {
        kpiCardsEl.innerHTML = '';
        tableEl.innerHTML = '<p style="color:#64748b;font-style:italic;text-align:center;padding:15px">Không có dữ liệu ca Impact.</p>';
        return;
    }

    // 1. Lọc các ca có Impact = 1
    const impactRows = data.filter(r => Number(r['Impact']) === 1 || Number(r['impact']) === 1);
    const totalImpactCases = impactRows.length;

    if (totalImpactCases === 0) {
        kpiCardsEl.innerHTML = '';
        tableEl.innerHTML = '<p style="color:#64748b;font-style:italic;text-align:center;padding:15px">Không có ca hỗ trợ nào đạt điểm Impact (Impact = 1) trong khoảng thời gian đã chọn.</p>';
        return;
    }

    // 2. Thống kê số lượng từng loại công việc
    const workTypeMap = {};
    const recordsByWorkType = {};
    let totalWorkOccurrences = 0;

    impactRows.forEach(r => {
        const cvText = String(r['Công việc hỗ trợ KH'] || '').trim();
        if (!cvText) return;

        const parts = cvText.split('|##|').map(p => p.trim()).filter(Boolean);
        const uniqueInRow = [...new Set(parts)];

        uniqueInRow.forEach(taskName => {
            if (!workTypeMap[taskName]) {
                workTypeMap[taskName] = 0;
                recordsByWorkType[taskName] = [];
            }
            workTypeMap[taskName]++;
            recordsByWorkType[taskName].push(r);
            totalWorkOccurrences++;
        });
    });

    window.leaderImpactWorkTypeCache = recordsByWorkType;

    // Sắp xếp các loại công việc theo tần suất giảm dần
    const sortedWorkTypes = Object.entries(workTypeMap)
        .map(([name, count]) => {
            const pctOfImpactCases = totalImpactCases > 0 ? ((count / totalImpactCases) * 100).toFixed(1) : 0;
            const pctOfTotalOccurrences = totalWorkOccurrences > 0 ? ((count / totalWorkOccurrences) * 100).toFixed(1) : 0;
            const isAddon = (typeof ADDON_KEYS !== 'undefined' ? ADDON_KEYS : []).some(k => name.toLowerCase().includes(k.toLowerCase()));
            return {
                name,
                count,
                pctOfImpactCases,
                pctOfTotalOccurrences,
                isAddon
            };
        })
        .sort((a, b) => b.count - a.count);

    const topWorkType = sortedWorkTypes[0] ? `${sortedWorkTypes[0].name} (${sortedWorkTypes[0].count} ca - ${sortedWorkTypes[0].pctOfImpactCases}%)` : 'Không có';

    // 3. Render 3 Thẻ Thống kê KPI Nhanh
    kpiCardsEl.innerHTML = `
        <div class="ldr-kpi-card" style="--accent:#f59e0b">
            <div class="ldr-kpi-icon">⚡</div>
            <div class="ldr-kpi-value">${totalImpactCases.toLocaleString('vi-VN')}</div>
            <div class="ldr-kpi-label">Tổng ca có Impact</div>
        </div>
        <div class="ldr-kpi-card" style="--accent:#3b82f6">
            <div class="ldr-kpi-icon">📋</div>
            <div class="ldr-kpi-value">${totalWorkOccurrences.toLocaleString('vi-VN')}</div>
            <div class="ldr-kpi-label">Tổng số lượt công việc thực hiện</div>
        </div>
        <div class="ldr-kpi-card" style="--accent:#10b981">
            <div class="ldr-kpi-icon">🏆</div>
            <div class="ldr-kpi-value" style="font-size:13px; line-height:1.3; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${topWorkType}">${topWorkType}</div>
            <div class="ldr-kpi-label">Top CV chiếm tỷ trọng cao nhất</div>
        </div>
    `;

    // 4. Render Biểu đồ Donut tỷ trọng
    destroyLeaderChart('impactWorkType1');
    const ctx = document.getElementById('leaderImpactWorkTypeChart');
    const isDark = document.documentElement.classList.contains('dark-theme');
    const legendColor = isDark ? '#e2e8f0' : '#1e293b';

    if (ctx && sortedWorkTypes.length > 0) {
        const topChartItems = sortedWorkTypes.slice(0, 10);
        const chartLabels = topChartItems.map(item => item.name);
        const chartData = topChartItems.map(item => item.count);
        const colors = [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
            '#ec4899', '#14b8a6', '#06b6d4', '#f43f5e', '#a855f7'
        ];

        leaderCharts['impactWorkType1'] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: chartData,
                    backgroundColor: colors.slice(0, chartLabels.length),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: legendColor,
                            font: { size: 10, weight: 'bold' },
                            boxWidth: 12,
                            generateLabels: (chart) => {
                                const d = chart.data;
                                return d.labels.map((lbl, i) => {
                                    const val = d.datasets[0].data[i];
                                    const pct = totalImpactCases > 0 ? ((val / totalImpactCases) * 100).toFixed(1) : 0;
                                    let shortLbl = lbl.length > 22 ? lbl.substring(0, 22) + '...' : lbl;
                                    return {
                                        text: `${shortLbl}: ${val} ca (${pct}%)`,
                                        fillStyle: d.datasets[0].backgroundColor[i],
                                        strokeStyle: 'transparent',
                                        lineWidth: 0,
                                        hidden: false,
                                        index: i,
                                        fontColor: legendColor,
                                        color: legendColor
                                    };
                                });
                            }
                        }
                    }
                }
            }
        });
    } else if (ctx) {
        ctx.parentElement.innerHTML = '<p style="text-align:center;color:#64748b;padding:20px;font-style:italic">Không đủ dữ liệu lập biểu đồ.</p>';
    }

    // 5. Render Bảng Số Liệu Chi Tiết
    tableEl.innerHTML = `
        <div style="overflow-x:auto;">
            <table class="ldr-table" style="width:100%;">
                <thead>
                    <tr>
                        <th style="text-align:left;">Tên loại công việc</th>
                        <th style="text-align:center;">Phân loại</th>
                        <th style="text-align:center;">Số ca Impact</th>
                        <th style="text-align:center;">Tỷ trọng / Ca Impact ↓</th>
                        <th style="text-align:center;">Chi tiết</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedWorkTypes.map(item => {
                        const safeName = item.name.replace(/'/g, "\\'");
                        const typeBadge = item.isAddon 
                            ? '<span class="ldr-badge badge-yellow" style="font-size:11px;">🔌 Addon (5đ)</span>'
                            : '<span class="ldr-badge" style="background:#64748b; color:#fff; font-size:11px;">📋 Thường</span>';
                        return `<tr>
                            <td style="text-align:left; font-weight:600;">${item.name}</td>
                            <td style="text-align:center;">${typeBadge}</td>
                            <td style="text-align:center; font-weight:700;">${item.count} ca</td>
                            <td style="text-align:center;">
                                <span class="ldr-badge badge-green" style="font-size:12px; font-weight:700;">${item.pctOfImpactCases}%</span>
                            </td>
                            <td style="text-align:center;">
                                <button class="ldr-drill-btn" onclick="showImpactWorkTypeDetails('${safeName}')">🔍 Xem ${item.count} ca</button>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function showImpactWorkTypeDetails(workTypeName) {
    const cache = window.leaderImpactWorkTypeCache;
    if (!cache || !cache[workTypeName]) return;

    const matchedRecords = cache[workTypeName];
    window.pivotDetailList = matchedRecords;

    const isDark = document.documentElement.classList.contains('dark-theme');
    const titleEl = document.getElementById('pivotListModalTitle');
    const bodyEl = document.getElementById('pivotListModalBody');
    if (!titleEl || !bodyEl) return;

    titleEl.innerText = `⚡ Danh sách ca Impact có CV: "${workTypeName}" (${matchedRecords.length} ca)`;

    let html = `
    <div style="font-size:13px; color:${isDark ? '#94a3b8' : '#64748b'}; margin-bottom:12px;">
        📋 Chi tiết tất cả các ca đạt <b>Impact = 1</b> có thực hiện công việc này:
    </div>
    <div style="display:flex; flex-direction:column; gap:10px;">
    `;

    matchedRecords.forEach((r, idx) => {
        const id = r['Retailer ID'] || '-';
        const staff = cleanLeaderName(r['Người xử lý']) || '-';
        const checkinTime = typeof formatTimeHelper === 'function' ? formatTimeHelper(r['Thời gian checkin'] || r['Thời gian tạo']) : (r['Thời gian checkin'] || '-');
        const checkoutTime = typeof formatTimeHelper === 'function' ? formatTimeHelper(r['Thời gian checkout']) : (r['Thời gian checkout'] || '-');
        const hours = r['HourSP'] !== undefined ? `${Number(r['HourSP']).toFixed(2)} giờ` : '-';
        const location = r['Địa điểm thực tế cửa hàng'] || r['Địa điểm'] || '-';
        const work = r['Công việc hỗ trợ KH'] || r['Loại công việc'] || '-';

        html += `
        <div class="pivot-detail-card" style="border:1px solid ${isDark ? '#334155' : '#e2e8f0'}; background:${isDark ? '#1e293b' : '#ffffff'}; border-radius:8px; padding:12px;">
            <div class="pivot-card-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid ${isDark ? '#334155' : '#f1f5f9'}; padding-bottom:8px; margin-bottom:8px;">
                <button class="ldr-drill-btn" onclick="openDetailFromPivot(${idx})">🔍 Retailer ID: ${id}</button>
                <span class="ldr-badge badge-green" style="font-size:11px;">⚡ Impact = 1</span>
            </div>
            <div class="pivot-card-body" style="font-size:12px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
                <div style="grid-column: span 2;"><strong>Nhân sự:</strong> ${staff}</div>
                <div><strong>Checkin:</strong> ${checkinTime}</div>
                <div><strong>Thời lượng:</strong> ${hours}</div>
                <div style="grid-column: span 2;"><strong>Địa điểm:</strong> ${location}</div>
                <div style="grid-column: span 2; color:#3b82f6;"><strong>Công việc:</strong> ${work}</div>
            </div>
        </div>
        `;
    });

    html += `</div>`;
    bodyEl.innerHTML = html;

    const modal = document.getElementById('pivotListModal');
    if (modal) modal.style.display = 'flex';
}