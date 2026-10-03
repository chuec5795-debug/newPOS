document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');

    if (!encodedData) {
        console.error("No 'data' query parameter found in URL.");
        return;
    }

    try {
        // Decode Base64 payload
        const sanitizedData = encodedData.replace(/ /g, '+');
        const receipt = JSON.parse(decodeURIComponent(atob(sanitizedData)));

        console.log("Decoded Receipt Data:", receipt); // Check console to see exact structure

        // 1. Set Date
        if (receipt.date) {
            document.getElementById("receiptDate").innerText = receipt.date;
        }

        // 2. Render Items
        const tbody = document.getElementById("receiptItems");
        if (tbody && receipt.items) {
            tbody.innerHTML = "";
            receipt.items.forEach(item => {
                let price = item.total ? item.total : (item.price * item.quantity);
                tbody.innerHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td style="text-align: center;">x${item.quantity}</td>
                    <td style="text-align: right;">${Number(price).toFixed(2)} Ks</td>
                </tr>`;
            });
        }

        // 3. Extract Totals & Percentages (Supports multiple object key names)
        const totals = receipt.totals || receipt; // Fallback if totals isn't nested

        const subtotal = totals.subtotal || 0;
        const discountAmount = totals.discountAmount || totals.discount || 0;
        const taxAmount = totals.taxAmount || totals.tax || 0;
        const grandTotal = totals.grandTotal || totals.total||  0;

        // Extract rates if present
        const discountRate = totals.discountRate ?? totals.discountPercent ?? totals.discountPercentage;
        const taxRate = totals.taxRate ?? totals.taxPercent ?? totals.taxPercentage;

        // 4. Update Labels (HTML)
        const discountLabelEl = document.getElementById("discountLabel");
        const taxLabelEl = document.getElementById("taxLabel");

        if (discountLabelEl) {
            discountLabelEl.innerText = discountRate !== undefined 
                ? `Discount (${discountRate}%):` 
                : "Discount:";
        }

        if (taxLabelEl) {
            taxLabelEl.innerText = taxRate !== undefined 
                ? `Commercial Tax (${taxRate}%):` 
                : "Commercial Tax:";
        }

        // 5. Update Amounts (HTML)
        document.getElementById("receiptSubtotal").innerText = Number(subtotal).toFixed(2) + ' Ks';
        document.getElementById("receiptDiscount").innerText = '-' + Number(discountAmount).toFixed(2) + ' Ks';
        document.getElementById("receiptTax").innerText = Number(taxAmount).toFixed(2) + ' Ks';
        document.getElementById("receiptTotal").innerText = Number(grandTotal).toFixed(2) + ' Ks';

    } catch (e) {
        console.error("Failed to decode or display receipt data:", e);
    }
});

function downloadReceiptImage() {
    const element = document.getElementById('receiptCard');
    const actionButtons = document.getElementById('actionButtons');

    if (actionButtons) actionButtons.style.display = 'none';

    html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff'
    }).then((canvas) => {
        if (actionButtons) actionButtons.style.display = 'flex';

        const link = document.createElement('a');
        link.download = 'Receipt-' + Date.now() + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }).catch((err) => {
        if (actionButtons) actionButtons.style.display = 'flex';
        alert('PNG Generation failed: ' + err.message);
    });
}