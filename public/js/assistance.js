// Function များကို စတင် ခေါ်ယူခြင်း
initChatHistory();

function initChatHistory() {
    // UI Render ပြီးမှ ပြန်ဖတ်ရန် မလိုအပ်အောင် တန်းပြီး load လုပ်ခြင်း
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadChatHistory);
    } else {
        loadChatHistory();
    }
}

// 🔹 Click Events များအတွက် Event Listener (တစ်ခုတည်းသာ ထားရှိရန်)
document.addEventListener('click', async function(e) {
    const sendBtn = e.target.closest('#aiSendButton');
    const quickBtn = e.target.closest('.ai-quick-btn');
    const clearBtn = e.target.closest('#clearChatBtn'); // Chat ရှင်းမည့် Button

    if (sendBtn) {
        e.preventDefault();
        const inputField = document.getElementById('aiMessageInput');
        if (inputField) {
            await handleSendMessage(inputField.value.trim());
        }
    } else if (quickBtn) {
        e.preventDefault();
        const question = quickBtn.getAttribute('data-question');
        if (question) {
            await handleSendMessage(question);
        }
    } else if (clearBtn) {
        // Chat History အားလုံးကို ဖျက်ပစ်ရန်
        e.preventDefault();
        localStorage.removeItem('aiChatHistory');
        const chatContainer = document.getElementById('aiChatContainer');
        if (chatContainer) chatContainer.innerHTML = '';
    }
});

// 🔹 Enter Key နှိပ်ရင် စာပို့ရန် Event Listener (တစ်ခုတည်းသာ ထားရှိရန်)
document.addEventListener('keypress', async function(e) {
    if (e.key === 'Enter' && e.target.id === 'aiMessageInput') {
        e.preventDefault();
        await handleSendMessage(e.target.value.trim());
    }
});

// JSON Parse လုပ်ရာတွင် Error မတက်စေရန် Helper Function
function safeParseJSON(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : [];
    } catch (e) {
        console.error(`Error parsing LocalStorage key "${key}":`, e);
        return [];
    }
}

// AI ထံ စာပို့ပေးသည့် Core Function
async function handleSendMessage(promptText) {
    if (!promptText) return;

    const inputField = document.getElementById('aiMessageInput');
    const chatContainer = document.getElementById('aiChatContainer');
    const sendBtn = document.getElementById('aiSendButton');

    // Local Storage မှ Data များကို ဖတ်ယူခြင်း
    const salesHistory = safeParseJSON('salesHistory'); // AI ထံ အရောင်းမှတ်တမ်း ပို့ရန်
    const myInventory = safeParseJSON('myInventory');     
    const accounts = safeParseJSON('accounts');
    const currentUser = localStorage.getItem('currentUser') || 'guest';

    // UI ထဲတွင် User မေးခွန်း ပြသခြင်းနှင့် LocalStorage ထဲ သိမ်းခြင်း
    appendMessage(chatContainer, 'user', promptText);
    saveMessageToHistory('user', promptText);

    if (inputField) inputField.value = '';
    if (sendBtn) sendBtn.disabled = true;

    // Loading ပြပေးခြင်း
    const loadingId = appendLoading(chatContainer);

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                prompt: promptText,
                posData: {
                    // inventory: myInventory.length > 0 ? myInventory : products,
                    inventory: myInventory,
                    salesHistory: salesHistory, // AI ဆီသို့ အရောင်းမှတ်တမ်း Data ပို့ပေးမည်
                    accounts: accounts,
                    currentUser: currentUser
                }
            })
        });

        const result = await response.json();
        removeLoading(loadingId);

        if (result.success) {
            appendMessage(chatContainer, 'ai', result.data);
            saveMessageToHistory('ai', result.data);
        } else {
            const errorMsg = "Error: " + (result.message || "Something went wrong");
            appendMessage(chatContainer, 'ai', errorMsg);
            saveMessageToHistory('ai', errorMsg);
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        removeLoading(loadingId);
        const serverError = "Server ချိတ်ဆက်မှု မအောင်မြင်ပါ။ Terminal တွင် `node server.js` run ထားလား စစ်ပါ";
        appendMessage(chatContainer, 'ai', serverError);
        saveMessageToHistory('ai', serverError);
    } finally {
        if (sendBtn) sendBtn.disabled = false;
    }
}

// Chat Message များကို LocalStorage ထဲ သိမ်းပေးသည့် Function
function saveMessageToHistory(sender, text) {
    const history = safeParseJSON('aiChatHistory');
    history.push({ sender, text });
    localStorage.setItem('aiChatHistory', JSON.stringify(history));
}

// Page ပြန်ပွင့်လာပါက LocalStorage ထဲမှ Chat များကို ပြန်ဖတ်ပေးသည့် Function
function loadChatHistory() {
    const chatContainer = document.getElementById('aiChatContainer');
    if (!chatContainer) return;

    chatContainer.innerHTML = ''; // အဟောင်းများကို ရှင်းထုတ်ပြီးမှ ပြန်ထည့်ရန်
    const history = safeParseJSON('aiChatHistory');
    
    if (history.length > 0) {
        history.forEach(msg => {
            appendMessage(chatContainer, msg.sender, msg.text);
        });
    }
}

// UI တွင် Message များ ထည့်ပေးသည့် Helper Functions
function appendMessage(container, sender, text) {
    if (!container) return;

    const msgDiv = document.createElement('div');

    if (sender === 'user') {
        msgDiv.className = 'ai-message user-message';
        msgDiv.style.cssText = 'display: flex; justify-content: flex-end; margin-bottom: 15px;';
        msgDiv.innerHTML = `
            <div class="ai-message-content" style="max-width: 80%;">
                <div class="ai-bubble" style="background: #0a7cff; color: white; border-radius: 12px 12px 0 12px; padding: 10px 15px;">
                    ${escapeHtml(text)}
                </div>
            </div>
        `;
    } else {
        msgDiv.className = 'ai-message';
        msgDiv.style.cssText = 'display: flex; margin-bottom: 15px;';
        msgDiv.innerHTML = `
            <div class="ai-avatar" style="margin-right: 10px;"><i class="fa-solid fa-robot"></i></div>
            <div class="ai-message-content">
                <div class="ai-message-name" style="font-weight: bold; margin-bottom: 3px;">AI Assistant</div>
                <div class="ai-bubble" style="background: #f1f3f4; padding: 10px 15px; border-radius: 0 12px 12px 12px;">
                    ${escapeHtml(text).replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
    }

    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

function appendLoading(container) {
    if (!container) return null;
    const id = 'loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = id;
    loadingDiv.className = 'ai-message';
    loadingDiv.style.cssText = 'display: flex; margin-bottom: 15px;';
    loadingDiv.innerHTML = `
        <div class="ai-avatar" style="margin-right: 10px;"><i class="fa-solid fa-robot"></i></div>
        <div class="ai-message-content">
            <div class="ai-message-name" style="font-weight: bold; margin-bottom: 3px;">AI Assistant</div>
            <div class="ai-bubble" style="background: #f1f3f4; padding: 10px 15px; border-radius: 0 12px 12px 12px;">
                Thinking... ⏳
            </div>
        </div>
    `;
    container.appendChild(loadingDiv);
    container.scrollTop = container.scrollHeight;
    return id;
}

function removeLoading(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.remove();
}

function escapeHtml(string) {
    return String(string).replace(/[&<>"']/g, function(s) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s];
    });
}