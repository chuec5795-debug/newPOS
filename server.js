const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(__dirname));
app.use(express.static('public'));

// Root URL သို့ဝင်ပါက login.html သို့ ပို့ပေးရန်
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Favicon 404 Error မတက်စေရန်
app.get('/favicon.ico', (req, res) => res.status(204).end());

// AI API Route
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, posData } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: "Prompt is required" });

    if (!process.env.GROQ_API_KEY) {
      console.error("❌ Error: GROQ_API_KEY is missing in .env file");
      return res.status(500).json({ success: false, message: "API Key မရှိသေးပါ။ .env ဖိုင်ကို စစ်ဆေးပါ။" });
    }

    // 1. ရနိုင်သော Model များကို Server Console တွင် စစ်ဆေးခြင်း
    const modelsResponse = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}` }
    });

    const modelsData = await modelsResponse.json();

    if (!modelsResponse.ok) {
      throw new Error(modelsData.error?.message || "API Key စစ်ဆေး၍ မရပါ။ Key မှန်မမှန် စစ်ပါ။");
    }

    // တရားဝင် အလုပ်လုပ်သော Model ကို ရွေးချယ်ခြင်း
    const availableModelIds = modelsData.data.map(m => m.id);
    const activeModel = availableModelIds.includes("openai/gpt-oss-20b")
      ? "openai/gpt-oss-20b"
      : availableModelIds[0] || "llama3-8b-8192";

// 2. Frontend မှ ပို့လိုက်သော myInventory အပါအဝင် ဒေတာများကို System Prompt ထဲ ထည့်သွင်းခြင်း
const inventoryData = posData?.inventory || posData?.myInventory || [];
const systemInstruction = `
      You are a helpful POS Assistant for a store. 
      Here is the current store data:

      - Inventory: ${JSON.stringify(inventoryData)}
      - Sale History: ${JSON.stringify(posData?.salesHistory || [])}
      
      Rules:
      1. Use only the provided store data to answer questions about products, sales, prices, and stock.
      2. Keep your answers very short, concise, and friendly. Avoid long paragraphs and use bullet points if necessary.
      3. Always format all currency values strictly in Myanmar Kyat using "Ks" (e.g., 5,500 Ks). Never use $, ₱, or any other currency symbols.
      4. If the data is not available, just say you don't have that information.
      5. Low Stock threshold is strictly 5.
    `;

    console.log(`🚀 Sending request using active model: ${activeModel}`);

    // 3. Chat Completion ခေါ်ယူခြင်း
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: activeModel,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Groq API Error");
    }

    res.json({ success: true, data: data.choices[0].message.content });

  } catch (error) {
    console.error("🔥 Error Detail:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ POS Server is running on http://localhost:${PORT}`);
});