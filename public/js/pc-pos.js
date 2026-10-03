let cart = [];
let buffer = "";

// Barcode scanner listener
window.addEventListener("keydown", function (event) {
  if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) {
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    let scannedBarcode = buffer.trim();
    buffer = "";

    if (scannedBarcode !== "") {
      setTimeout(() => {
        processScan(scannedBarcode);
      }, 50);
    }
  } else if (event.key.length === 1) {
    buffer += event.key;
  }
});

// Initialization called by dashboard.js
function initPOSPage() {
  loadCashierPresets();
  renderCart();
}

// Load dropdown options configured in Store Settings
function loadCashierPresets() {
  const settings = JSON.parse(localStorage.getItem("pos_settings"));
  const discountSelect = document.getElementById("discountPresetSelect");

  if (!discountSelect) return;

  if (settings && Array.isArray(settings.discounts) && settings.discounts.length > 0) {
    discountSelect.innerHTML = `<option value="0" data-min="0">No Discount (0%)</option>`;
    settings.discounts.forEach((preset) => {
      let minText = preset.minAmount ? ` - Min: ${preset.minAmount} Ks` : '';
      discountSelect.innerHTML += `<option value="${preset.rate}" data-min="${preset.minAmount || 0}">${preset.name} (${preset.rate}%${minText})</option>`;
    });
  }
}

function processScan(scannedBarcode) {
  let storedInventory = JSON.parse(localStorage.getItem('myInventory')) || [];
  let product = storedInventory.find(item => String(item.barcode) === String(scannedBarcode));

  if (product) {
    if (product.quantity <= 0) {
      alert("Warning: " + product.name + " is OUT OF STOCK!");
    }

    let productquantityInput = prompt("Product found: " + product.name + "\nEnter quantity: ", "1");
    let quantity = parseInt(productquantityInput) || 1;

    if (quantity > product.quantity) {
      alert("Warning: " + product.name + " has insufficient stock! Available: " + product.quantity);
      return;
    }

    let existingItem = cart.find(item => item.name === product.name);
    let currentCartQty = existingItem ? existingItem.quantity : 0;
    
    if (currentCartQty + quantity > product.quantity) {
      alert("Cannot add more! Total in cart would exceed stock level (" + product.quantity + ").");
      return;
    }

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.total = existingItem.price * existingItem.quantity;
    } else {
      cart.push({
        name: product.name,
        price: product.price,
        quantity: quantity,
        total: product.price * quantity
      });
    }

    renderCart();
  } else {
    alert("Barcode: " + scannedBarcode + "\nThis product is not found in inventory!");
  }
}

// Dynamic Calculation linked to Store Settings
function calculateTotals() {
  let subtotal = cart.reduce((sum, item) => sum + item.total, 0);

  // Retrieve store settings
  const settings = JSON.parse(localStorage.getItem("pos_settings")) || { taxRate: 0, discounts: [] };
  const storeTaxRate = (parseFloat(settings.taxRate) || 0) / 100;

  // Retrieve selected cashier discount & minimum threshold requirement
  const discountSelect = document.getElementById("discountPresetSelect");
  let discountRatePercent = 0;

  if (discountSelect) {
    let selectedOption = discountSelect.options[discountSelect.selectedIndex];
    let minAmount = selectedOption ? parseFloat(selectedOption.getAttribute("data-min")) || 0 : 0;
    let selectedRate = selectedOption ? parseFloat(selectedOption.value) || 0 : 0;

    // Apply discount only if subtotal reaches required minimum amount
    if (subtotal >= minAmount) {
      discountRatePercent = selectedRate;
    } else if (selectedRate > 0) {
      // If manually selected but cart amount doesn't meet requirement
      discountRatePercent = 0;
    }
  }

  const discountRate = discountRatePercent / 100;
  let discountAmount = subtotal * discountRate;
  let taxableSubtotal = subtotal - discountAmount;
  let taxAmount = taxableSubtotal * storeTaxRate;
  let grandTotal = taxableSubtotal + taxAmount;

  return {
    subtotal: subtotal,
    discountRatePercent: discountRatePercent,
    discountAmount: discountAmount,
    taxRatePercent: settings.taxRate || 0,
    taxAmount: taxAmount,
    grandTotal: grandTotal
  };
}

function renderCart() {
  let tablebody = document.getElementById("Table");

  if (!tablebody) return;

  if (cart.length === 0) {
    tablebody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center;">No items scanned yet. Click here and scan a barcode.</td>
      </tr>
    `;

    document.getElementById("subtotalDisplay").textContent = "0.00 Ks";
    document.getElementById("discountDisplay").textContent = "-0.00 Ks";
    document.getElementById("taxDisplay").textContent = "0.00 Ks";
    document.getElementById("grandTotalDisplay").textContent = "0.00 Ks";
    return;
  }

  tablebody.innerHTML = "";

  cart.forEach((item, index) => {
    item.total = item.price * item.quantity;
    let row = `<tr> 
      <td>${item.name}</td>
      <td>${item.price.toFixed(2)} Ks</td>
      <td style="text-align: center;">
        <button class="btn-qty" onclick="decreaseQuantity(${index})">-</button>
        <span class="quantityDisplay" style="margin: 0 8px;">${item.quantity}</span>
        <button class="btn-qty" onclick="increaseQuantity(${index})">+</button>
      </td>
      <td style="text-align: right;">${item.total.toFixed(2)} Ks</td>
      <td style="text-align: center;">
        <button class="btn-delete" onclick="deleteRow(${index})">Delete</button>
      </td>
    </tr>`;

    tablebody.innerHTML += row;
  });

  let totals = calculateTotals();
  document.getElementById("subtotalDisplay").textContent = totals.subtotal.toFixed(2) + " Ks";
  document.getElementById("discountDisplay").textContent = `-${totals.discountAmount.toFixed(2)} Ks (${totals.discountRatePercent}%)`;
  document.getElementById("taxDisplay").textContent = `${totals.taxAmount.toFixed(2)} Ks (${totals.taxRatePercent}%)`;
  document.getElementById("grandTotalDisplay").textContent = totals.grandTotal.toFixed(2) + " Ks";
}

function increaseQuantity(index) {
  let cartItem = cart[index];
  let storedInventory = JSON.parse(localStorage.getItem('myInventory')) || [];
  let product = storedInventory.find(item => item.name === cartItem.name || item.barcode === cartItem.barcode);

  if (product && cartItem.quantity + 1 > product.quantity) {
    alert("Warning: Cannot add more! Only " + product.quantity + " items available in stock.");
    return;
  }

  cart[index].quantity += 1;
  renderCart();
}

function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
  } else {
    deleteRow(index);
    return;
  }
  renderCart();
}

function deleteRow(index) {
  cart.splice(index, 1);
  renderCart();
}

function clearCart() {
  cart = [];
  renderCart();
}

function closeReceipt() {
  document.getElementById("receiptModal").style.display = "none";
}

function givingReceipt() {
  if (cart.length === 0) {
    alert("NO Items Scanned Yet!");
    return;
  }

  let modal = document.getElementById("receiptModal");
  if (modal) {
    modal.style.display = "flex";
  }

  let totals = calculateTotals();
  let paymentMethod = document.getElementById("paymentMethod").value;

  let receiptObject = {
    date: new Date().toLocaleString(),
    items: cart,
    totals: totals,
    paymentMethod: paymentMethod
  };

  let storedInventory = JSON.parse(localStorage.getItem('myInventory')) || [];
  cart.forEach(item => {
    let p = storedInventory.find(x => x.name === item.name || x.barcode === item.barcode);
    if (p) p.quantity = Math.max(0, p.quantity - item.quantity);
  });
  localStorage.setItem('myInventory', JSON.stringify(storedInventory));

  // LocalStorage ထဲမှ လက်ရှိ ဝင်ရောက်ထားသော Cashier ၏ Email ကို ယူခြင်း
  let cashierEmail = localStorage.getItem('currentUser') || localStorage.getItem('loggedInUser') || "Unknown Cashier";

  let salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
  salesHistory.push({ 
    cashierEmail: cashierEmail,
    ...receiptObject 
  });
  localStorage.setItem('salesHistory', JSON.stringify(salesHistory));

  let jsonString = JSON.stringify(receiptObject);
  let encodedReceipt = btoa(encodeURIComponent(jsonString));

  let baseURL = "https://friend-pos-shop.loca.lt";
  let receiptURL = baseURL + "/receipt.html?data=" + encodedReceipt;

  let qrcodeContainer = document.getElementById("qrcode");
  if (!qrcodeContainer) return;
  qrcodeContainer.innerHTML = "";

  try {
    new QRCode(qrcodeContainer, {
      text: receiptURL,
      width: 220,
      height: 220,
      correctLevel: QRCode.CorrectLevel.L
    });
  } catch (error) {
    console.error("QR Code Error", error);
    alert("Error generating QR code!");
    return;
  }

  cart = [];
  renderCart();
}