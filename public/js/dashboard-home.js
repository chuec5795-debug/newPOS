// Top Products Render Function
function renderTopProducts() {
  const container = document.getElementById("topProductsContainer");
  if (!container) return;

  const salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
  const storedInventory = JSON.parse(localStorage.getItem("myInventory")) || [];

  const productMap = {};

  salesHistory.forEach((sale) => {
    if (sale.items && Array.isArray(sale.items)) {
      sale.items.forEach((item) => {
        const key = item.name || item.barcode;

        if (!productMap[key]) {
          const invMatch = storedInventory.find(
            (p) => p.name === item.name || p.barcode === item.barcode
          );

          productMap[key] = {
            name: item.name,
            category: invMatch ? invMatch.category : "General",
            sku: invMatch ? invMatch.barcode : item.barcode || "N/A",
            price: Number(item.price) || 0,
            sold: 0,
            revenue: 0,
          };
        }

        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;

        productMap[key].sold += quantity;
        productMap[key].revenue += quantity * price;
      });
    }
  });

  if (Object.keys(productMap).length === 0) {
    storedInventory.forEach((p) => {
      productMap[p.name] = {
        name: p.name,
        category: p.category || "General",
        sku: p.barcode || "N/A",
        price: Number(p.price) || 0,
        sold: Number(p.sold) || 0,
        revenue: (Number(p.sold)|| 0) * (Number(p.price)||  0),
      };
    });
  }

  const sortedProducts = Object.values(productMap).sort((a, b) => b.sold - a.sold);

  if (sortedProducts.length === 0) {
    container.innerHTML = `<div class="empty-state">အရောင်းစာရင်း မရှိသေးပါ။</div>`;
    return;
  }

  const top5 = sortedProducts.slice(0, 5);
  container.innerHTML = generateLeaderboardHTML(top5);

  const viewBtn = document.querySelector(".top-products-card .view-btn");
  const modal = document.getElementById("topProductsModal");
  const modalContainer = document.getElementById("modalProductsContainer");
  const closeModalBtn = document.getElementById("closeTopProductsModal");

  if (viewBtn && modal && modalContainer) {
    viewBtn.onclick = function () {
      modalContainer.innerHTML = generateLeaderboardHTML(sortedProducts);
      modal.classList.add("active");
    };
  }

  if (closeModalBtn && modal) {
    closeModalBtn.onclick = () => modal.classList.remove("active");
    window.onclick = (e) => {
      if (e.target === modal) modal.classList.remove("active");
    };
  }
}

function generateLeaderboardHTML(products) {
  return products
    .map((product, index) => {
      const rank = index + 1;
      const rankClass = rank <= 3 ? `rank-${rank}` : "";

      return `
      <div class="rank-item ${rankClass}">
        <div class="rank-left">
          <div class="rank-badge">${rank}</div>
          <div class="product-info">
            <div class="product-title">${product.name}</div>
            <div class="product-sub">${product.category} • SKU: ${product.sku}</div>
          </div>
        </div>
        <div class="sales-metric">
          <div class="sold-count">${product.sold} sold</div>
          <div class="revenue">${product.revenue.toLocaleString()} Ks</div>
        </div>
      </div>
    `;
    })
    .join("");
}

// Daily Sales Chart Render Function
let renderDailyChart = () => {
  const salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
  const ctx = document.getElementById("dailySalesChart");
  if (!ctx) return;

  // ရက်စွဲအလိုက် ရောင်းရငွေများကို စုပေါင်းရန်
  const dailyTotals = {};

  salesHistory.forEach(sale => {
    // "9/13/2026, 1:03:56 AM" ကဲ့သို့သော format မှ ရက်စွဲပိုင်း (9/13/2026) ကိုသာ ဖြတ်ယူခြင်း
    const dateString = sale.date ? sale.date.split(',')[0].trim() : "Unknown";
    
    // Grand Total ကို ယူခြင်း
    const grandTotal = sale.totals && sale.totals.grandTotal ? Number(sale.totals.grandTotal) : 0;

    if (!dailyTotals[dateString]) {
      dailyTotals[dateString] = 0;
    }
    dailyTotals[dateString] += grandTotal;
  });

  const labels = Object.keys(dailyTotals);
  const amounts = Object.values(dailyTotals);

  // ဇယားအဟောင်း ရှိနေပါက အရင်ဖျက်ရန်
  if (window.dailyChartInstance) {
    window.dailyChartInstance.destroy();
  }

  window.dailyChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Daily Sales (Ks)",
        data: amounts,
        borderWidth: 2,
        tension: 0.3,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
};

// Weekly Sales Chart Render Function
// Sales by Category Chart Render Function
let categoryChartInstance = null;
let renderCategoryChart = () => {
  const ctx = document.getElementById("categorySalesChart");
  // အကယ်၍ HTML တွင် ID မပြောင်းရသေးပါက အဟောင်းကို ယူမည်
  const canvasCtx = ctx || document.getElementById("weeklySalesChart"); 
  if (!canvasCtx) return;

  const salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
  const storedInventory = JSON.parse(localStorage.getItem("myInventory")) || [];

  // Category အလိုက် ရောင်းရငွေများကို ပေါင်းရန် Object တည်ဆောက်ခြင်း
  const categoryTotals = {};

  salesHistory.forEach((receipt) => {
    if (receipt.items && Array.isArray(receipt.items)) {
      receipt.items.forEach((item) => {
        // Inventory ထဲမှ သက်ဆိုင်ရာ Category ကို ရှာဖွေခြင်း
        const invMatch = storedInventory.find(p => p.name === item.name || p.barcode === item.barcode);
        const category = invMatch && invMatch.category ? invMatch.category : "General";
        
        const sellingPrice = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        const revenue = sellingPrice * quantity;

        if (!categoryTotals[category]) {
          categoryTotals[category] = 0;
        }
        categoryTotals[category] += revenue;
      });
    }
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);
  
  // Chart အတွက် အရောင်များ
  const bgColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'];

  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  categoryChartInstance = new Chart(canvasCtx, {
    type: "doughnut", // pie ပုံစံပြလိုပါက "pie" ဟု ပြောင်းနိုင်ပါသည်
    data: {
      labels: labels,
      datasets: [{
        label: "Sales (Ks)",
        data: data,
        backgroundColor: bgColors.slice(0, labels.length),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right', // Category အမည်များကို ညာဘက်တွင်ပြရန်
        }
      }
    }
  });
};

function renderLowStockAlerts() {
  const container = document.getElementById("lowStockContainer");
  const countBadge = document.getElementById("lowStockCount");

  if (!container) return;

  const storedProducts = localStorage.getItem("myInventory");
  if (!storedProducts) {
    container.innerHTML = `<div style="text-align:center; padding: 15px; color: #94a3b8;">ပစ္စည်းစာရင်း မရှိသေးပါ။</div>`;
    return;
  }

  const products = JSON.parse(storedProducts);

  const lowStockItems = products.filter(item => (item.quantity !== undefined ? item.quantity : 0) <= 10);

  if (countBadge) {
    countBadge.innerText = `${lowStockItems.length} Items`;
  }

  if (lowStockItems.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 15px; color: #16a34a; font-weight: 500;">ပစ္စည်းပြတ်ခါနီး စာရင်းမရှိပါ။ (Stock အားလုံး ပြည့်စုံပါသည်)</div>`;
    return;
  }

  container.innerHTML = lowStockItems.map(item => `
    <div class="stock-item">
      <div class="stock-info">
        <span class="stock-title">${item.name}</span>
        <span class="stock-sub">${item.category || 'General'} • SKU: #${item.sku || 'N/A'}</span>
      </div>
      <div class="stock-qty-badge">
        ${item.quantity} left
      </div>
    </div>
  `).join('');
}

function renderDashboardCards() {
  // LocalStorage မှ အရောင်းစာရင်းနှင့် ပစ္စည်းစာရင်းကို ယူခြင်း
  const salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
  const storedInventory = JSON.parse(localStorage.getItem("myInventory")) || [];

  let totalSales = 0;
  let totalProfit = 0;
  let totalCustomers = salesHistory.length; // ပြေစာအရေအတွက်ကို Customer အရေအတွက်အဖြစ် သတ်မှတ်သည်

  salesHistory.forEach((receipt) => {
    // Total Sales တွက်ချက်ခြင်း (Grand Total များကို ပေါင်းခြင်း)
    if (receipt.totals && receipt.totals.grandTotal) {
      totalSales += Number(receipt.totals.grandTotal);
    }

    // Total Profit တွက်ချက်ခြင်း (ရောင်းစျေး - မူလစျေး = အမြတ်)
    if (receipt.items && Array.isArray(receipt.items)) {
      receipt.items.forEach((item) => {
        // Inventory ထဲမှ မူလစျေး (Original Price) ကို ရှာခြင်း
        const invMatch = storedInventory.find(p => p.name === item.name || p.barcode === item.barcode);
        
        const sellingPrice = Number(item.price) || 0;
        // မူလစျေး မရှိပါက 0 ဟု သတ်မှတ်မည်
        const originalPrice = invMatch ? (Number(invMatch.originalPrice) || 0) : 0; 
        const quantity = Number(item.quantity) || 0;

        // အမြတ်ငွေ = (ရောင်းစျေး - ဝယ်စျေး) * အရေအတွက်
        totalProfit += (sellingPrice - originalPrice) * quantity;
      });
    }
  });

  // HTML ပေါ်တွင် ပြသခြင်း
  const salesEl = document.getElementById("totalSales");
  const profitEl = document.getElementById("totalProfit");
  const customersEl = document.getElementById("totalCustomers");

  if (salesEl) salesEl.textContent = totalSales.toLocaleString() + " Ks";
  if (profitEl) profitEl.textContent = totalProfit.toLocaleString() + " Ks";
  if (customersEl) customersEl.textContent = totalCustomers;
}