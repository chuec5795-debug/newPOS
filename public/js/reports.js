// gLobal function အနေနဲ့ dashboard.js က ခေါ်လို့ရအောင် လုပ်ခြင်း
function initReportsPage() {
    loadSalesReports();
}

function loadSalesReports() {
    let salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    renderReportsTable(salesHistory);
}

function renderReportsTable(data) {
    const tableBody = document.getElementById("reports-table-body");
    const totalRevenueVal = document.getElementById("total-revenue-val");
    const totalInvoicesVal = document.getElementById("total-invoices-val");

    if (!tableBody) return;

    tableBody.innerHTML = "";
    let totalRevenue = 0;
    let invoiceCount = data.length;

    if (invoiceCount === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #777; padding: 20px;">အရောင်းစာရင်း မရှိပါ</td></tr>`;
    } else {
        data.forEach(item => {
            let grandTotal = item.totals ? item.totals.grandTotal : 0;
            totalRevenue += grandTotal;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.cashierEmail || 'Unknown'}</td>
                <td>${item.date}</td>
                <td>${grandTotal.toLocaleString()} ကျပ်</td>
            `;
            tableBody.appendChild(row);
        });
    }

    if (totalRevenueVal) totalRevenueVal.innerText = totalRevenue.toLocaleString() + " ကျပ်";
    if (totalInvoicesVal) totalInvoicesVal.innerText = invoiceCount;
}

// Page ကို တိုက်ရိုက် ဖွင့်တဲ့အခါမှာလည်း အလုပ်လုပ်စေရန်
document.addEventListener("DOMContentLoaded", () => {
    initReportsPage();
});