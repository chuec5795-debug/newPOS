document.addEventListener("DOMContentLoaded", function () {
  const mainContent = document.getElementById("main-content");
  const navLinks = document.querySelectorAll(".nav-link");

  // 1. Auth Check
  const isLoginIn = localStorage.getItem("isLoggedIn");
  if (isLoginIn !== "true") {
    window.location.href = "login.html";
    return;
  }

  // 2. User Info Display
  const currentUserEmain = localStorage.getItem("currentUser") || "user@gmail.com";
  const currentUserRole = localStorage.getItem("userRole") || "guest";

  const currentUser = {
    name: currentUserEmain.split('@')[0],
    role: currentUserRole
  };

  const userNameEle = document.getElementById("userName");
  const userRoleEle = document.getElementById("userRole");
  if (userNameEle) userNameEle.innerHTML = currentUser.name;
  if (userRoleEle) userRoleEle.innerHTML = currentUser.role;

  function setActiveNav(targetPageUrl) {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
      item.classList.remove("active");
      const link = item.querySelector(".nav-link");
      if (link && link.getAttribute("data-page") === targetPageUrl) {
        item.classList.add("active");
      }
    });
  }

  // 3. Role Filter Menu
  function filterMenuByRole(userRole) {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
      const allowedRoles = item.getAttribute("data-roles");
      if (allowedRoles) {
        const rolesArray = allowedRoles.split(",").map((r) => r.trim());
        if (!rolesArray.includes(userRole)) {
          item.style.display = "none";
        } else {
          item.style.display = "block";
        }
      }
    });
  }
  filterMenuByRole(currentUser.role);

  // 4. Dynamic Page Loader Function
  function loadPage(pageUrl) {
    if (!pageUrl) return;

    // Page Authorization
    const pageRoles = {
      "dashboard-home.html": ["admin", "manager"],
      "accounts.html": ["admin"],
      "sales.html": ["admin", "manager", "sales"],
      "inventory.html": ["admin", "manager", "sales"],
      "reports.html": ["admin", "manager"],
      "document.html": ["admin", "manager", "sales"],
      "support.html": ["admin", "manager", "sales"],
      "admin_settings.html": ["admin", "manager"],
      "ai.html": ["admin", "manager"],
      "pc.html": ["admin", "manager", "sales"]
    };

    if (pageRoles[pageUrl] && !pageRoles[pageUrl].includes(currentUser.role)) {
      alert("You are not authorized to access this page.");
      return;
    }

    setActiveNav(pageUrl);

    fetch(pageUrl)
      .then((response) => {
        if (!response.ok) throw new Error("Page not found");
        return response.text();
      })
      .then((htmlData) => {
        mainContent.innerHTML = htmlData;

        // Dashboard Home သို့ ရောက်ရှိသည့်အခါမှ Chart နှင့် Top Products များကို Render လုပ်မည်
        if (pageUrl === "dashboard-home.html") {
          if (typeof renderCategoryChart === "function") renderCategoryChart();
          if (typeof renderDailyChart === "function") renderDailyChart();
          if (typeof renderTopProducts === "function") renderTopProducts();
          if (typeof renderLowStockAlerts === "function") renderLowStockAlerts();
          if (typeof renderDashboardCards === "function") renderDashboardCards();
        }
        if (pageUrl === "accounts.html") {
          initAccountPage();
        }
        if (pageUrl === 'inventory.html' && typeof initInventory === "function") {
          initInventory();
        }
        if (pageUrl === "sales.html" && typeof initSalePage === "function") {
          initSalePage();
        }
        if (pageUrl === "reports.html" && typeof initReportsPage === "function") {
          initReportsPage();
        }
        if (pageUrl === "support.html") {
          initSupportPage();
        }
        if(pageUrl === "pc.html" && typeof initPOSPage === "function"){
          initPOSPage();
        }
        if(pageUrl === "admin_settings.html"){
          initAdminSettings();
        }
      })
      .catch((error) => {
        mainContent.innerHTML = `<h2 style="padding: 20px; color: red;">404 - ${pageUrl} ကို ရှာမတွေ့ပါ။</h2>`;
      });
  }

  // Initial Page Load
  if (currentUser.role === "sales") {
    loadPage("pc.html");
  } else {
    loadPage("dashboard-home.html");
  }

  // 5. Navigation Click Handler
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.remove("active");
      });
      this.parentElement.classList.add("active");

      const targetPage = this.getAttribute("data-page");
      if (targetPage) {
        loadPage(targetPage);
      }
    });
  });

  // 6. Logout Handler
  const LogoutBtn = document.getElementById("logoutbtn");
  if (LogoutBtn) {
    LogoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const isconfirmed = confirm("Are you sure want to logout?");
      if (isconfirmed) {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("userRole");
        window.location.href = "login.html";
      }
    });
  }
});

// Accounts Page Initialization Functions (kept in main layout context)
function initAccountPage() {
  renderUserTable();
  const form = document.getElementById("addUserForm");
  if (form) {
    form.onsubmit = function (e) {
      e.preventDefault();
      const email = document.getElementById("accEmail").value;
      const password = document.getElementById("accPassword").value;
      const role = document.getElementById("accRole").value;

      const users = JSON.parse(localStorage.getItem("systemUsers")) || [];
      users.push({ email, password, role });
      localStorage.setItem("systemUsers", JSON.stringify(users));
      form.reset();
      renderUserTable();
    };
  }
}

// function renderUserTable() {
//   const tableBody = document.getElementById("userTableBody");
//   if (!tableBody) return;
  
//   const defaultUsers = [
//     { email: "kyawkhaing@gmail.com", role: "admin" },
//     { email: "wailin@gmail.com", role: "manager" },
//     { email: "chue@gmail.com", role: "sales" }
//   ];

//   const users = JSON.parse(localStorage.getItem("systemUsers")) || defaultUsers;
  
//   tableBody.innerHTML = users.map((user, index) => `
//     <tr class="table-row">
//       <td class="email-cell">${user.email}</td>
//       <td class="role-cell">
//         <span class="role-badge">${user.role}</span>
//       </td>
//       <td class="action-cell">
//         <button class="btn-delete" onclick="deleteUser(${index})">
//           Delete
//         </button>
//       </td>
//     </tr>
//   `).join("");
// }

// function deleteUser(index) {
//   let users = JSON.parse(localStorage.getItem("systemUsers")) || [];
//   users.splice(index, 1);
//   localStorage.setItem("systemUsers", JSON.stringify(users));
//   renderUserTable();
// }

function renderUserTable() {
  const tableBody = document.getElementById("userTableBody");
  if (!tableBody) return;
  
  const defaultUsers = [
    { email: "kyawkhaing@gmail.com", role: "admin" },
    { email: "wailin@gmail.com", role: "manager" },
    { email: "chue@gmail.com", role: "sales" }
  ];

  const users = JSON.parse(localStorage.getItem("systemUsers")) || defaultUsers;
  
  tableBody.innerHTML = users.map((user, index) => {
    const isAdmin = user.role && user.role.toLowerCase() === "admin";

    // Admin ဖြစ်ရင် နှိပ်လို့မရတဲ့ (disabled) Button ပုံစံ ပြမည်
    const actionButton = isAdmin 
      ? `<button class="btn-delete btn-disabled" disabled>Protected</button>` 
      : `<button class="btn-delete" onclick="deleteUser(${index})">Delete</button>`;

    return `
      <tr class="table-row">
        <td class="email-cell">${user.email}</td>
        <td class="role-cell">
          <span class="role-badge">${user.role}</span>
        </td>
        <td class="action-cell">
          ${actionButton}
        </td>
      </tr>
    `;
  }).join("");
}

function deleteUser(index) {
  const defaultUsers = [
    { email: "kyawkhaing@gmail.com", role: "admin" },
    { email: "wailin@gmail.com", role: "manager" },
    { email: "chue@gmail.com", role: "sales" }
  ];

  let users = JSON.parse(localStorage.getItem("systemUsers")) || defaultUsers;

  if (users[index] && users[index].role && users[index].role.toLowerCase() === "admin") {
    alert("Admin အကောင့်ကို ဖျက်ခွင့်မရှိပါ။");
    return;
  }

  users.splice(index, 1);
  localStorage.setItem("systemUsers", JSON.stringify(users));
  renderUserTable();
}