// Search Bar - Real-time filtering function
function searchFAQ() {
    const searchInput = document.getElementById("searchInput");

    if (!searchInput) return;

    const input = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll(".faq-card");

    let found = 0;

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();

        if (text.includes(input)) {
            card.style.display = "block";
            found++;
        } else {
            card.style.display = "none";
        }
    });

    // No result message
    const noResultElement = document.getElementById("noResult");

    if (noResultElement) {
        noResultElement.style.display =
            found === 0 ? "block" : "none";
    }
}


// Quick Tag Button Click Handler
function quickSearch(keyword) {
    const searchInput = document.getElementById("searchInput");

    if (!searchInput) return;

    searchInput.value = keyword;

    searchFAQ();
}


// Support Page Initialization
function initSupportPage() {
    // Support page initialization code
}