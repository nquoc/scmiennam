// --- TAB AI ASSISTANT CHATBOT ---
const GEMINI_API_KEY = atob("QUl6YVN5QllYMV9SUGh6eHp2Z2NOdGhFMU5GVGV0WnptaVJJYjZF");
let aiChatHistory = [];

// Tải lịch sử chat từ localStorage khi load file
try {
    const savedHistory = localStorage.getItem('crm_ai_chat_history');
    if (savedHistory) {
        aiChatHistory = JSON.parse(savedHistory);
    }
} catch (e) {
    console.warn("Lỗi load chat history:", e);
}

function saveChatHistoryToStorage() {
    try {
        // Giới hạn giữ tối đa 20 tin nhắn gần nhất để tối ưu token
        if (aiChatHistory.length > 20) {
            aiChatHistory = aiChatHistory.slice(-20);
        }
        localStorage.setItem('crm_ai_chat_history', JSON.stringify(aiChatHistory));
    } catch (e) {
        console.warn("Lỗi lưu chat history:", e);
    }
}

function toggleAIChat() {
    const container = document.getElementById('aiChatContainer');
    if (container) {
        container.classList.toggle('hidden');
        if (!container.classList.contains('hidden')) {
            renderChatHistory();
            document.getElementById('aiChatInput').focus();
            scrollToBottom();
        }
    }
}

function handleAIChatKeypress(e) {
    if (e.key === 'Enter') {
        sendAIChatMessage();
    }
}

function scrollToBottom() {
    const messages = document.getElementById('aiChatMessages');
    if (messages) {
        messages.scrollTop = messages.scrollHeight;
    }
}

function appendChatMessage(role, text, timeStr) {
    const messagesContainer = document.getElementById('aiChatMessages');
    if (!messagesContainer) return "";

    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-message ${role}`;

    if (!timeStr) {
        const now = new Date();
        timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    msgDiv.innerHTML = `
        <div class="ai-message-content">${text.replace(/\n/g, '<br>')}</div>
        <div class="ai-message-time">${timeStr}</div>
    `;

    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
    return timeStr;
}

function renderChatHistory() {
    const messagesContainer = document.getElementById('aiChatMessages');
    if (!messagesContainer) return;

    messagesContainer.innerHTML = '';

    if (aiChatHistory.length === 0) {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'ai-message bot';
        welcomeDiv.innerHTML = `
            <div class="ai-message-content">
                Xin chào anh Quốc! Em là trợ lý AI thông minh. Em đã đọc toàn bộ dữ liệu hiện tại của anh (Tra cứu Retailer, Lỗi ATC và hiệu suất Ngày công). Anh có câu hỏi gì cần em giải đáp về số liệu không ạ?
            </div>
            <div class="ai-message-time">Vừa xong</div>
        `;
        messagesContainer.appendChild(welcomeDiv);
    } else {
        aiChatHistory.forEach(m => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `ai-message ${m.role === 'user' ? 'user' : 'bot'}`;
            msgDiv.innerHTML = `
                <div class="ai-message-content">${m.text.replace(/\n/g, '<br>')}</div>
                <div class="ai-message-time">${m.time || 'Vừa xong'}</div>
            `;
            messagesContainer.appendChild(msgDiv);
        });
    }
    scrollToBottom();
}

function clearAIChat() {
    if (confirm("Anh có chắc chắn muốn xóa lịch sử chat cũ để bắt đầu cuộc trò chuyện mới không?")) {
        aiChatHistory = [];
        localStorage.removeItem('crm_ai_chat_history');
        renderChatHistory();
    }
}

async function sendAIChatMessage() {
    const input = document.getElementById('aiChatInput');
    if (!input) return;

    const messageText = input.value.trim();
    if (!messageText) return;

    // Thêm tin nhắn của user vào UI và lưu history
    const userTimeStr = appendChatMessage('user', messageText);
    aiChatHistory.push({ role: 'user', text: messageText, time: userTimeStr });
    saveChatHistoryToStorage();

    // Clear input
    input.value = '';

    // Show typing indicator
    const typing = document.getElementById('aiChatTyping');
    if (typing) typing.classList.remove('hidden');
    scrollToBottom();

    try {
        const context = getDashboardContext();
        const responseText = await callGeminiAPI(aiChatHistory, context);

        // Hide typing indicator
        if (typing) typing.classList.add('hidden');

        // Thêm tin nhắn của bot vào UI và lưu history
        const botTimeStr = appendChatMessage('bot', responseText);
        aiChatHistory.push({ role: 'bot', text: responseText, time: botTimeStr });
        saveChatHistoryToStorage();
    } catch (error) {
        console.error("AI Error:", error);
        if (typing) typing.classList.add('hidden');
        appendChatMessage('bot', `❌ Lỗi: Không thể nhận phản hồi từ AI. ${error.message}`);
    }
}

function getDashboardContext() {
    let context = "DƯỚI ĐÂY LÀ DỮ LIỆU HIỆN TẠI ĐANG CÓ TRÊN DASHBOARD CỦA ANH QUỐC:\n\n";

    // Lấy thông tin bộ lọc Tab Pivot Đã làm
    const staffFilter = typeof getSelectedMultiselectValues === 'function' ? getSelectedMultiselectValues('staffFilterPivotDaLamOptions').join(', ') : "";
    const creatorFilter = typeof getSelectedMultiselectValues === 'function' ? getSelectedMultiselectValues('creatorFilterPivotDaLamOptions').join(', ') : "";
    const sourceFilter = typeof getSelectedMultiselectValues === 'function' ? getSelectedMultiselectValues('sourceFilterPivotDaLamOptions').join(', ') : "";
    const selectedImpacts = typeof getSelectedMultiselectValues === 'function' ? getSelectedMultiselectValues('impactFilterPivotDaLamOptions') : [];
    const impactFilter = selectedImpacts.map(i => i === "1" ? "Có Impact (1)" : "Không Impact (0/Trống)").join(', ');
    const fromDayFilter = document.getElementById('fromDayFilterPivotDaLam') ? document.getElementById('fromDayFilterPivotDaLam').value : "";
    const toDayFilter = document.getElementById('toDayFilterPivotDaLam') ? document.getElementById('toDayFilterPivotDaLam').value : "";

    const formatDateForChat = (val) => {
        if (!val) return "";
        const parts = val.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : val;
    };
    const fromDayFilterStr = fromDayFilter ? formatDateForChat(fromDayFilter) : "đầu";
    const toDayFilterStr = toDayFilter ? formatDateForChat(toDayFilter) : "cuối";

    context += `TRẠNG THÁI BỘ LỌC ĐANG ÁP DỤNG TRÊN TAB PIVOT ĐÃ LÀM:\n`;
    context += `- Nhân sự: ${staffFilter || "Tất cả"}\n`;
    context += `- Người tạo: ${creatorFilter || "Tất cả"}\n`;
    context += `- Nguồn data: ${sourceFilter || "Tất cả"}\n`;
    context += `- Impact: ${impactFilter || "Tất cả"}\n`;
    context += `- Khoảng ngày checkin: Từ ngày ${fromDayFilterStr} đến ngày ${toDayFilterStr}\n\n`;

    // 1. Dữ liệu Retailer Treo
    if (cacheData['data'] && cacheData['data'].length > 0) {
        context += `--- 1. BẢNG RETAILER ĐANG TREO (TỔNG CỘNG ${cacheData['data'].length} DATA) ---\n`;
        let simplifiedData = cacheData['data'].map(row => ({
            'Retailer ID': row['Retailer ID'],
            'Tỉnh/Thành': row['Tỉnh/Thành phố'],
            'Nguồn': row['Nguồn data'] || 'Trực tiếp',
            'Người xử lý': row['Người xử lý'] || 'Chưa nhận',
            'Xã/Phường/Thị trấn': row['Xã/Phường/Thị trấn'] || 'Chưa nhận',
            'Thời gian tạo': row['Thời gian tạo'],
            'SLA': row['SLA']
        }));
        context += JSON.stringify(simplifiedData.slice(0, 150), null, 2) + "\n\n"; // Gửi tối đa 150 dòng để tối ưu token
    } else {
        context += "--- 1. BẢNG RETAILER ĐANG TREO: Không có dữ liệu hoặc chưa tải xong ---\n\n";
    }

    // 3. Dữ liệu Hiệu suất nhân sự (Ngày công)
    let summaryData = window.lastSummaryPerformanceData || calculateSummaryPerformanceData();
    if (summaryData && summaryData.length > 0) {
        context += "--- 3. BẢNG TỔNG HỢP HIỆU SUẤT NHÂN SỰ THEO NGÀY CÔNG ---\n";
        let cleanSummary = summaryData.map(r => ({
            'Họ Tên': r.fullName,
            'T công': r.tCong,
            'Tổng ATC': r.totalATC,
            'Tổng Impact': r.totalImpact,
            'Tổng KM': r.totalKM,
            'Tổng giờ SP': r.totalHourSP,
            'TB ATC/Ngày': r.avgATC,
            'TB KM/Ngày': r.avgKM,
            'TB Time/Ngày': r.avgHourSP
        }));
        context += JSON.stringify(cleanSummary, null, 2) + "\n\n";
    } else {
        context += "--- 3. BẢNG HIỆU SUẤT NHÂN SỰ: Không có dữ liệu hoặc chưa tải xong ---\n\n";
    }

    // 4. Chi tiết Nhật ký Hiệu suất (Sheet hieusuat)
    if (cacheData['hieusuat'] && cacheData['hieusuat'].length > 0) {
        context += `--- 4. CHI TIẾT NHẬT KÝ HIỆU SUẤT (TỔNG CỘNG ${cacheData['hieusuat'].length} CA LÀM ĐÃ HOÀN THÀNH) ---\n`;
        context += "Định dạng: Nhân sự | Ngày checkin | Retailer ID | Quãng đường (KM) | Thời gian hỗ trợ (phút) | Địa điểm | Công việc hỗ trợ | Tổng điểm | Addon\n";

        let csvLines = cacheData['hieusuat'].map(row => {
            let staff = row['Người xử lý'] || '';
            let parts = staff.split('-');
            if (parts.length >= 2) {
                staff = parts[1].trim();
            } else {
                staff = staff.trim();
            }

            let day = row['Ngày checkin'] || '';
            let id = row['Retailer ID'] || '';
            let km = row['KM'] !== undefined ? row['KM'] : (row['Quãng đường di chuyển đến KH'] || '0');
            let mins = row['Thời lượng hỗ trợ (phút)'] || '0';
            let loc = row['Địa điểm thực tế cửa hàng'] || '';
            if (loc.length > 35) loc = loc.substring(0, 35) + '...';
            let task = row['Công việc hỗ trợ KH'] || '';
            if (task.length > 25) task = task.substring(0, 25) + '...';
            let score = row['Tổng điểm'] !== undefined ? row['Tổng điểm'] : '0';
            let addon = row['Addon'] !== undefined ? row['Addon'] : '0';

            return `${staff}|${day}|${id}|${km}|${mins}|${loc}|${task}|${score}|${addon}`;
        });

        context += csvLines.join('\n') + "\n\n";
    } else {
        context += "--- 4. CHI TIẾT NHẬT KÝ HIỆU SUẤT: Không có dữ liệu hoặc chưa tải xong ---\n\n";
    }

    return context;
}

function calculateSummaryPerformanceData() {
    if (!cacheData['ngaycong'] || !cacheData['hieusuat']) return [];

    const activeStaffList = cacheData['ngaycong'];
    return activeStaffList.map(ncRow => {
        const fullName = ncRow['Tên NS'] || '';
        let cleanName = fullName;
        let parts = fullName.split('-');
        if (parts.length >= 2) cleanName = parts[1].trim();

        const tCong = Number(ncRow['T công']) || 0;
        const staffRecords = (cacheData['hieusuat'] || []).filter(row => row['Người xử lý'] === cleanName);

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
            avgHourSP
        };
    }).filter(r => r.tCong > 0 || r.totalATC > 0);
}

async function callGeminiAPI(messagesHistory, currentContext) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const systemInstruction = `Bạn là trợ lý AI thông minh tích hợp trên trang Dashboard CRM của anh Quốc. 
Nhiệm vụ của bạn là đọc hiểu dữ liệu hiện tại của hệ thống để trả lời các câu hỏi của anh Quốc bằng tiếng Việt.
Hãy trả lời một cách chuyên nghiệp, cực kỳ ngắn gọn, đi thẳng vào số liệu, thân thiện.

${currentContext}

Chú ý:
- "Retailer ID" là mã số cửa hàng.
- "SLA" là thời gian treo. SLA >= 9 được coi là trễ hạn (overdue).
- "TB ATC/Ngày", "TB KM/Ngày", "TB Time/Ngày" lần lượt là Trung bình ca làm, Trung bình số km di chuyển, Trung bình số giờ hỗ trợ trên một ngày công thực tế (T công).
- Khi được hỏi về hiệu suất tổng hợp, hãy ưu tiên tham chiếu Bảng tổng hợp hiệu suất nhân sự theo Ngày công (Mục 3).
- Khi hỏi về chi tiết ngày checkin, số km di chuyển, địa điểm, công việc cụ thể, Tổng điểm hoặc Addon của từng ca checkin của nhân sự, hãy đối chiếu và sử dụng Nhật ký chi tiết hiệu suất check-in (Mục 4).
- Chỉ trả lời dựa trên dữ liệu thực tế được cung cấp phía trên. Nếu dữ liệu chưa được tải hoặc không có thông tin, hãy báo cho người dùng biết lịch sự.`;

    const requestBody = {
        contents: messagesHistory.map(m => ({
            role: m.role === 'bot' ? 'model' : 'user',
            parts: [{ text: m.text }]
        })),
        systemInstruction: {
            parts: [{ text: systemInstruction }]
        }
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });

    const result = await response.json();
    if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts[0]) {
        return result.candidates[0].content.parts[0].text;
    } else {
        throw new Error(result.error ? result.error.message : "Không nhận được phản hồi từ Gemini API");
    }
}
