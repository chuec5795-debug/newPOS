

// document.addEventListener("DOMContentLoaded", initInventory);

function initInventory() {
    const userRole = localStorage.getItem("userRole");
    const isSales = userRole === "sales";

    // Helper function to dynamically retrieve the profit margin percentage from pos_settings
    function getProfitMargin() {
        const savedData = localStorage.getItem("pos_settings");
        if (savedData) {
            try {
                const settings = JSON.parse(savedData);
                if (settings.profitMargin !== undefined && !isNaN(parseFloat(settings.profitMargin))) {
                    return parseFloat(settings.profitMargin);
                }
            } catch (e) {
                console.error("Error parsing pos_settings:", e);
            }
        }
        return 15; // Default fallback to 15% if setting is not saved yet
    }

    const currentMargin = getProfitMargin();
    const marginMultiplier = 1 + (currentMargin / 100);

    // Default Placeholder Image
    const defaultImg = "https://via.placeholder.com/50";

    // Default product list calculated with current profit margin setting
    let defaultProducts = [
        { name: "Fish Crackers", image: "https://www.oishi.com.ph/wp-content/uploads/2017/04/OFC-UA.png", barcode: "8886805705430", category: "Snacks", quantity: 20, originalPrice: 6500 },
        { name: "ပေါင်မုန့်", image: defaultImg, barcode: "8859858300754", category: "Bakery", quantity: 20, originalPrice: 2000 },
        { name: "အပ်မှို", image: defaultImg, barcode: "8859819400578", category: "Groceries", quantity: 20, originalPrice: 4500 },
        { name: "လပ်ကီးခေါက်ဆွဲ", image: defaultImg, barcode: "8836000095294", category: "Noodles", quantity: 20, originalPrice: 2500 },
        { name: "ချောကလက်မုန့်", image: defaultImg, barcode: "8996001354001", category: "Snacks", quantity: 20, originalPrice: 1000 },
        { name: "c-vitt", image: defaultImg, barcode: "8851123237000", category: "Beverages", quantity: 20, originalPrice: 2000 },
        { name: "chess cake", image: defaultImg, barcode: "8858152047617", category: "Bakery", quantity: 20, originalPrice: 500 },
        { name: "ဖရုံစေ့", image: defaultImg, barcode: "100035", category: "Snacks", quantity: 20, originalPrice: 4500 },
        { name: "Tooth", image: defaultImg, barcode: "8850006944257", category: "Personal Care", quantity: 20, originalPrice: 1500 },
        { name: "Coffee", image: defaultImg, barcode: "8850250000365", category: "Beverages", quantity: 20, originalPrice: 4500 },
        { name: "Milk", image: defaultImg, barcode: "7612100062845", category: "Beverages", quantity: 20, originalPrice: 5000 }
    ].map(item => ({
        ...item,
        price: Math.round(item.originalPrice * marginMultiplier)
    }));

    let localData = localStorage.getItem("myInventory");
    if (!localData || localData === "[]") {
        localStorage.setItem("myInventory", JSON.stringify(defaultProducts));
    }

    let inventory = JSON.parse(localStorage.getItem("myInventory")) || [];

    // DATA MIGRATION: Ensure all items have images and auto-calculated prices using dynamic multiplier
    let updated = false;
    inventory = inventory.map(item => {
        let changed = false;
        
        if (!item.image) {
            item.image = defaultImg;
            changed = true;
        }

        if (item.originalPrice === undefined || item.originalPrice === null) {
            item.originalPrice = item.price ? Math.round(item.price / marginMultiplier) : 0;
            changed = true;
        }

        // Auto-set markup sale price based on configured store margin
        const expectedPrice = Math.round((item.originalPrice || 0) * marginMultiplier);
        if (!item.price || item.price === 0) {
            item.price = expectedPrice;
            changed = true;
        }

        if (changed) updated = true;
        return item;
    });

    if (updated) {
        localStorage.setItem("myInventory", JSON.stringify(inventory));
    }

    // LIVE AUTO-SET: Auto-calculate Sale Price using latest store setting when Original Price input changes
    const origInput = document.getElementById("newOriginalPrice");
    const priceInput = document.getElementById("newPrice");

    if (origInput && priceInput) {
        origInput.addEventListener("input", function () {
            const origValue = parseFloat(this.value) || 0;
            const liveMarginMultiplier = 1 + (getProfitMargin() / 100);
            if (origValue > 0) {
                priceInput.value = Math.round(origValue * liveMarginMultiplier);
            } else {
                priceInput.value = "";
            }
        });
    }

    // SALES ROLE UI
    if (isSales) {
        const addForm = document.querySelector(".add-form");
        if (addForm) addForm.style.display = "none";
    }

    let selectedCategory = "All";

    // RENDER TABLES BY CATEGORY WITH TABS
    window.renderTable = function (data = inventory) {
        const container = document.getElementById("categoryTablesContainer");
        const tabsContainer = document.getElementById("categoryTabs");
        if (!container || !tabsContainer) return;

        container.innerHTML = "";
        tabsContainer.innerHTML = "";

        if (data.length === 0) {
            container.innerHTML = "<p style='text-align:center; padding: 20px;'>No products found.</p>";
            return;
        }

        const groupedCategory = data.reduce((acc, item) => {
            const cat = item.category || "Uncategorized";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(item);
            return acc;
        }, {});

        const categories = ["All", ...Object.keys(groupedCategory)];

        if (!categories.includes(selectedCategory)) {
            selectedCategory = "All";
        }

        // Render Tabs
        categories.forEach((cat) => {
            const tabBtn = document.createElement("button");
            tabBtn.className = `tab-btn ${cat === selectedCategory ? "active" : ""}`;
            tabBtn.innerText = cat;
            tabBtn.onclick = () => {
                selectedCategory = cat;
                renderTable(data);
            };
            tabsContainer.appendChild(tabBtn);
        });

        const categoriesToRender = selectedCategory === "All" 
            ? Object.keys(groupedCategory) 
            : [selectedCategory];

        // Render Tables
        categoriesToRender.forEach((categoryName) => {
            const items = groupedCategory[categoryName];
            if (!items) return;

            const catSection = document.createElement("div");
            catSection.className = "category-section";

            let tableHeaderHTML = `
                <h3 class="category-title">${categoryName}</h3>
                <div class="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th style="width: 70px;">Image</th>
                      <th>Name</th>
                      <th>Barcode</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Sale Price</th>
                      ${!isSales ? `<th class="original-price-header">Original Price</th>` : ""}
                      <th>Status</th>
                      ${!isSales ? `<th>Action</th>` : ""}
                    </tr>
                  </thead>
                  <tbody>
            `;

            let tableRowsHTML = "";
            items.forEach((item) => {
                let statusText = "In Stock";
                let statusClass = "status-in-stock";

                if (item.quantity <= 0) {
                    statusText = "Out of Stock";
                    statusClass = "status-out-of-stock";
                } else if (item.quantity <= 5) {
                    statusText = "Low Stock";
                    statusClass = "status-low-stock";
                }

                const originalIndex = inventory.indexOf(item);
                const imgUrl = item.image || defaultImg;

                if (isSales) {
                    tableRowsHTML += `
                        <tr>
                            <td>
                                <div class="product-img-box">
                                    <img src="${imgUrl}" alt="${item.name}">
                                </div>
                            </td>
                            <td>${item.name}</td>
                            <td>${item.barcode}</td>
                            <td>${item.category}</td>
                            <td>${item.quantity}</td>
                            <td>${item.price} kyats</td>
                            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        </tr>
                    `;
                } else {
                    tableRowsHTML += `
                        <tr>
                            <td>
                                <div class="product-img-box">
                                    <img src="${imgUrl}" alt="${item.name}">
                                </div>
                            </td>
                            <td>${item.name}</td>
                            <td>${item.barcode}</td>
                            <td>${item.category}</td>
                            <td>${item.quantity}</td>
                            <td>${item.price} kyats</td>
                            <td>${item.originalPrice || 0} kyats</td>
                            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                            <td>
                                <button class="btn-edit" onclick="editItem(${originalIndex})">Edit</button>
                                <button class="btn-delete" onclick="deleteItem(${originalIndex})">Delete</button>
                            </td>
                        </tr>
                    `;
                }
            });

            let tableFooterHTML = `
                  </tbody>
                </table>
                </div>
            `;

            catSection.innerHTML = tableHeaderHTML + tableRowsHTML + tableFooterHTML;
            container.appendChild(catSection);
        });
    };

    // ADD ITEM
    window.addItem = function () {
        if (isSales) return;

        const nameVal = document.getElementById("newName").value.trim();
        const barcodeVal = document.getElementById("newBarcode").value.trim();
        const categoryVal = document.getElementById("newCategory").value.trim();
        const quantityVal = parseInt(document.getElementById("newQuantity").value) || 0;
        const originalPriceVal = parseFloat(document.getElementById("newOriginalPrice").value) || 0;
        
        // Auto-calculate Sale Price based on store setting rate
        const liveMarginMultiplier = 1 + (getProfitMargin() / 100);
        let priceVal = parseFloat(document.getElementById("newPrice").value);
        if (isNaN(priceVal) || priceVal === 0) {
            priceVal = Math.round(originalPriceVal * liveMarginMultiplier);
        }

        const fileInput = document.getElementById("newImageFile");
        const file = fileInput ? fileInput.files[0] : null;

        if (nameVal === "") {
            alert("Please enter product name");
            return;
        }

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                saveProductData(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            saveProductData(defaultImg);
        }

        function saveProductData(imageSrc) {
            const newItem = {
                name: nameVal,
                image: imageSrc,
                barcode: barcodeVal,
                category: categoryVal || "General",
                quantity: quantityVal,
                price: priceVal,
                originalPrice: originalPriceVal
            };

            inventory.push(newItem);
            saveDataToLocalStorage();

            // Clear inputs
            document.getElementById("newName").value = "";
            if (fileInput) fileInput.value = "";
            document.getElementById("newBarcode").value = "";
            document.getElementById("newCategory").value = "";
            document.getElementById("newQuantity").value = "";
            document.getElementById("newPrice").value = "";
            document.getElementById("newOriginalPrice").value = "";
        }
    };

    window.clearSelectedFile = function () {
        const fileInput = document.getElementById("newImageFile");
        if (fileInput) {
            fileInput.value = "";
        }
    };

    function saveDataToLocalStorage() {
        localStorage.setItem("myInventory", JSON.stringify(inventory));
        renderTable();
    }

    // EDIT ITEM
    window.editItem = function (index) {
        if (isSales) return;

        const item = inventory[index];
        if (!item) return;

        const liveMarginMultiplier = 1 + (getProfitMargin() / 100);

        const newName = prompt("Enter new Name:", item.name);
        if (newName === null) return;

        const newImage = prompt("Enter new Image URL:", item.image || "");
        if (newImage === null) return;

        const newBarcode = prompt("Enter new barcode:", item.barcode);
        if (newBarcode === null) return;

        const newCategory = prompt("Enter new Category:", item.category);
        if (newCategory === null) return;

        const newQty = prompt("Enter new quantity:", item.quantity);
        if (newQty === null) return;

        const newOriginalPrice = prompt("Enter new original price:", item.originalPrice || 0);
        if (newOriginalPrice === null) return;

        const parsedOrig = parseFloat(newOriginalPrice) || 0;
        const defaultSalePrice = Math.round(parsedOrig * liveMarginMultiplier);

        const newPrice = prompt("Enter new sale price:", defaultSalePrice);
        if (newPrice === null) return;

        inventory[index].name = newName || item.name;
        inventory[index].image = newImage || item.image || defaultImg;
        inventory[index].barcode = newBarcode || item.barcode;
        inventory[index].category = newCategory || item.category;
        inventory[index].quantity = parseInt(newQty) || 0;
        inventory[index].originalPrice = parsedOrig;
        inventory[index].price = parseFloat(newPrice) || defaultSalePrice;

        saveDataToLocalStorage();
    };

    // DELETE ITEM
    window.deleteItem = function (index) {
        if (isSales) return;

        if (confirm("Are you sure want to delete this product?")) {
            inventory.splice(index, 1);
            saveDataToLocalStorage();
        }
    };

    // SEARCH & FILTER
    window.filterTable = function () {
        const nameInput = document.getElementById("searchName");
        const categoryInput = document.getElementById("searchCategory");

        const nameTerm = nameInput ? nameInput.value.toLowerCase() : "";
        const catTerm = categoryInput ? categoryInput.value.toLowerCase() : "";

        const filtered = inventory.filter(item =>
            item.name.toLowerCase().includes(nameTerm) &&
            item.category.toLowerCase().includes(catTerm)
        );

        renderTable(filtered);
    };

    renderTable();
}

document.addEventListener("DOMContentLoaded", initInventory);