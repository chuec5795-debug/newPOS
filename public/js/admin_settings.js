

// Function called by dashboard.js when page loads
function initAdminSettings() {
  loadSettings();
}

// 1. Load stored tax rate, profit margin, and discounts into the page
function loadSettings() {
  var savedData = localStorage.getItem("pos_settings");
  // Default values: taxRate = 5%, profitMargin = 15%
  var settings = savedData ? JSON.parse(savedData) : { taxRate: 5, profitMargin: 15, discounts: [] };

  // Set values in inputs (or fallbacks if missing in older saved objects)
  document.getElementById("storeTaxRate").value = settings.taxRate !== undefined ? settings.taxRate : 5;
  document.getElementById("storeProfitMargin").value = settings.profitMargin !== undefined ? settings.profitMargin : 15;

  var tbody = document.getElementById("presetTableBody");
  tbody.innerHTML = "";

  var discounts = settings.discounts || [];
  for (var i = 0; i < discounts.length; i++) {
    var item = discounts[i];
    
    var tr = document.createElement("tr");
    
    var tdName = document.createElement("td");
    tdName.textContent = item.name;
    
    var tdMin = document.createElement("td");
    tdMin.textContent = item.minAmount + " Ks";
    
    var tdRate = document.createElement("td");
    tdRate.textContent = item.rate + "%";
    
    var tdAction = document.createElement("td");
    var btn = document.createElement("button");
    btn.textContent = "Remove";
    btn.setAttribute("onclick", "deletePreset(" + i + ")");
    tdAction.appendChild(btn);
    
    tr.appendChild(tdName);
    tr.appendChild(tdMin);
    tr.appendChild(tdRate);
    tr.appendChild(tdAction);
    
    tbody.appendChild(tr);
  }
}

// 2. Save tax rate
function saveTaxRate() {
  var taxValue = document.getElementById("storeTaxRate").value;
  var parsedTax = parseFloat(taxValue);
  
  if (isNaN(parsedTax) || parsedTax < 0) { 
    parsedTax = 0; 
  }

  var savedData = localStorage.getItem("pos_settings");
  var settings = savedData ? JSON.parse(savedData) : { taxRate: 5, profitMargin: 15, discounts: [] };

  settings.taxRate = parsedTax;
  localStorage.setItem("pos_settings", JSON.stringify(settings));
  
  alert("Tax rate saved!");
  loadSettings();
}

// 3. Save Profit Margin Percentage
function saveProfitMargin() {
  var marginValue = document.getElementById("storeProfitMargin").value;
  var parsedMargin = parseFloat(marginValue);
  
  if (isNaN(parsedMargin) || parsedMargin < 0) { 
    parsedMargin = 15; // Fallback default
  }

  var savedData = localStorage.getItem("pos_settings");
  var settings = savedData ? JSON.parse(savedData) : { taxRate: 5, profitMargin: 15, discounts: [] };

  settings.profitMargin = parsedMargin;
  localStorage.setItem("pos_settings", JSON.stringify(settings));
  
  alert("Profit margin percentage saved!");
  loadSettings();
}

// 4. Add a new discount item with minimum purchase threshold
function addDiscountPreset() {
  var name = document.getElementById("discountName").value.trim();
  var minAmount = parseFloat(document.getElementById("discountMinAmount").value);
  var rate = parseFloat(document.getElementById("discountRate").value);

  if (name === "" || isNaN(minAmount) || isNaN(rate) || minAmount < 0 || rate < 0) {
    alert("Please enter a valid name, minimum amount, and discount rate.");
    return;
  }

  var savedData = localStorage.getItem("pos_settings");
  var settings = savedData ? JSON.parse(savedData) : { taxRate: 5, profitMargin: 15, discounts: [] };

  if (!settings.discounts) {
    settings.discounts = [];
  }

  settings.discounts.push({ name: name, minAmount: minAmount, rate: rate });
  localStorage.setItem("pos_settings", JSON.stringify(settings));

  // Reset inputs
  document.getElementById("discountName").value = "";
  document.getElementById("discountMinAmount").value = "";
  document.getElementById("discountRate").value = "";
  
  loadSettings();
}

// 5. Delete a discount item
function deletePreset(index) {
  var savedData = localStorage.getItem("pos_settings");
  if (!savedData) return;
  
  var settings = JSON.parse(savedData);
  if (settings.discounts) {
    settings.discounts.splice(index, 1);
    localStorage.setItem("pos_settings", JSON.stringify(settings));
  }
  loadSettings();
}