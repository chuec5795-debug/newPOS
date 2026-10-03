// const defaultUsers = [
//     {
//         email: "kyawkhaing@gmail.com",
//         password: "12345",
//         role: "admin"
//     },
//     {
//         email: "wailin@gmail.com",
//         password: "12345",
//         role: "manager"
//     },
//     {
//         email: "chue@gmail.com",
//         password: "12345",
//         role: "sales"
//     }
// ];

// if(!localStorage.getItem("systemUsers")){
//     localStorage.setItem("systemUsers",JSON.stringify(defaultUsers));
// }

// document.addEventListener("DOMContentLoaded", function () {
//     const isLoggedIn = localStorage.getItem("isLoggedIn");
//     const userRole = localStorage.getItem("userRole");

// if (isLoggedIn === "true" && window.location.pathname.includes("login.html")) {
//         redirectToRolePage(userRole);
//     }
// });

// const loginForm = document.getElementById("loginform");

// if (loginForm) {
//     loginForm.addEventListener("submit", function (e) {
//         e.preventDefault();

//         const inputEmail = document.getElementById("email").value;
//         const inputPass = document.getElementById("password").value;
//         const selectedRoleElement = document.querySelector('input[name="role"]:checked');
//         const inputRole = selectedRoleElement ? selectedRoleElement.value : null;

//         const users = JSON.parse(localStorage.getItem("systemUsers")) || defaultUsers;
//         const user = users.find(u => u.email === inputEmail && u.password === inputPass && u.role === inputRole);

//         if (user) {
//             localStorage.setItem("isLoggedIn", "true");
//             localStorage.setItem("currentUser", user.email);
//             localStorage.setItem("userRole", user.role);
//             localStorage.setItem(
//                 "systemUsers",
//                 JSON.stringify(users)
//             );

//             alert("Login အောင်မြင်ပါသည်! Welcome " + user.role.toUpperCase());

//             redirectToRolePage(user.role);
//         } else {
//             alert("Email၊ Password သို့မဟုတ် Role မှားယွင်းနေပါသည်။");
//         }
//     });
// }
// function redirectToRolePage(role) {

//         window.location.href = "dashboard.html";
// }

// //update password

// var changeBtn = document.getElementById('changeBtn');

// if (changeBtn) {
//   changeBtn.onclick = function() {
//     var inputEmail = document.getElementById('resetUsername').value.trim();
//     var newPassword = document.getElementById('newPassword').value.trim();
//     var confirmPassword = document.getElementById('confirmPassword').value.trim();
//     var msg = document.getElementById('msg');

//     if (inputEmail == "" || newPassword == "" || confirmPassword == "") {
//       msg.style.color = "red";
//       msg.innerHTML = "အချက်အလက်များ အကုန်ဖြည့်ပါ";
//       return;
//     }

//     if (newPassword != confirmPassword) {
//       msg.style.color = "red";
//       msg.innerHTML = "Password အသစ် နှစ်ခု မတူပါ";
//       return;
//     }

//     var users = JSON.parse(localStorage.getItem('systemUsers')) || defaultUsers;
//     var found = false;

//     for (var i = 0; i < users.length; i++) {
//       if (users[i].email == inputEmail) {
//         users[i].password = newPassword;
//         found = true;
//         break;
//       }
//     }

//     if (found == true) {
     
//       localStorage.setItem('systemUsers', JSON.stringify(users));
      
      
//       document.getElementById('mainCard').style.display = 'none';
//       document.getElementById('successBox').style.display = 'flex';

//     } else {
//       msg.style.color = "red";
//       msg.innerHTML = "Account ရှာမတွေ့ပါ";
//     }
//   };
// }

// To Check Email Format 
const emailRegex = /^[a-zA-C0-9._%+-]+@[a-zA-C0-9.-]+\.[a-zA-C]{2,}$/;

// Password Rule
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const defaultUsers = [
    {
        email: "kyawkhaing@gmail.com",
        password: "Password123!",
        role: "admin"
    },
    {
        email: "wailin@gmail.com",
        password: "Password123!",
        role: "manager"
    },
    {
        email: "chue@gmail.com",
        password: "Password123!",
        role: "sales"
    }
];

if (!localStorage.getItem("systemUsers")) {
    localStorage.setItem("systemUsers", JSON.stringify(defaultUsers));
}

document.addEventListener("DOMContentLoaded", function () {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userRole = localStorage.getItem("userRole");

    if (isLoggedIn === "true" && window.location.pathname.includes("login.html")) {
        redirectToRolePage(userRole);
    }
});

const loginForm = document.getElementById("loginform");

if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const inputEmail = document.getElementById("email").value.trim();
        const inputPass = document.getElementById("password").value;
        const selectedRoleElement = document.querySelector('input[name="role"]:checked');
        const inputRole = selectedRoleElement ? selectedRoleElement.value : null;

        if (!emailRegex.test(inputEmail)) {
            alert("ကျေးဇူးပြု၍ မှန်ကန်သော Email လိပ်စာ ပုံစံ ရိုက်ထည့်ပါ။ (ဥပမာ - example@gmail.com)");
            return;
        }

        if (!passwordRegex.test(inputPass)) {
            alert("Password သည် အနည်းဆုံး ၈ လုံး ရှိရမည်။ စာလုံးကြီး၊ စာလုံးသေး၊ ဂဏန်းနှင့် Special Character (@$!%*?&) ပါဝင်ရမည်။");
            return;
        }

        const users = JSON.parse(localStorage.getItem("systemUsers")) || defaultUsers;
        const user = users.find(u => u.email === inputEmail && u.password === inputPass && u.role === inputRole);

        if (user) {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("currentUser", user.email);
            localStorage.setItem("userRole", user.role);

            alert("Login အောင်မြင်ပါသည်! Welcome " + user.role.toUpperCase());
            redirectToRolePage(user.role);
        } else {
            alert("Email၊ Password သို့မဟုတ် Role မှားယွင်းနေပါသည်။");
        }
    });
}

function redirectToRolePage(role) {
    window.location.href = "dashboard.html";
}

// Update / Reset Password
var changeBtn = document.getElementById('changeBtn');

if (changeBtn) {
    changeBtn.onclick = function() {
        var inputEmail = document.getElementById('resetUsername').value.trim();
        var newPassword = document.getElementById('newPassword').value.trim();
        var confirmPassword = document.getElementById('confirmPassword').value.trim();
        var msg = document.getElementById('msg');

        if (inputEmail === "" || newPassword === "" || confirmPassword === "") {
            msg.style.color = "red";
            msg.innerHTML = "အချက်အလက်များ အကုန်ဖြည့်ပါ";
            return;
        }

        if (!emailRegex.test(inputEmail)) {
            msg.style.color = "red";
            msg.innerHTML = "မှန်ကန်သော Email လိပ်စာ ရိုက်ထည့်ပါ";
            return;
        }

        if (!passwordRegex.test(newPassword)) {
            msg.style.color = "red";
            msg.innerHTML = "Password သည် အနည်းဆုံး ၈ လုံး ရှိရမည်။ (စာလုံးကြီး/သေး၊ ဂဏန်း၊ Special Symbol ပါဝင်ရမည်)";
            return;
        }

        if (newPassword !== confirmPassword) {
            msg.style.color = "red";
            msg.innerHTML = "Password အသစ် နှစ်ခု မတူပါ";
            return;
        }

        var users = JSON.parse(localStorage.getItem('systemUsers')) || defaultUsers;
        var found = false;

        for (var i = 0; i < users.length; i++) {
            if (users[i].email === inputEmail) {
                users[i].password = newPassword;
                found = true;
                break;
            }
        }

        if (found) {
            localStorage.setItem('systemUsers', JSON.stringify(users));
            document.getElementById('mainCard').style.display = 'none';
            document.getElementById('successBox').style.display = 'flex';
        } else {
            msg.style.color = "red";
            msg.innerHTML = "Account ရှာမတွေ့ပါ";
        }
    };
}