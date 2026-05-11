// ==========================================
// Bills Page JavaScript
// ==========================================

// Replace with your deployed Google Apps Script Web App URL
const API_URL = "https://script.google.com/macros/s/AKfycbxrgJa4MHcQhyJjVFOW9AFNAO-daxfGgKFbcmwJQZPMJ8W86Hc5egLoF2-vBkoFZ3A-BQ/exec";

// DOM Elements
const billsBody = document.getElementById("bills-body");
const billSearchBtn = document.getElementById("bill-search-btn");
const billSearchInput = document.getElementById("bill-search");
const billFromInput = document.getElementById("bill-from");
const billToInput = document.getElementById("bill-to");

const billDetailCard = document.getElementById("bill-detail");
const billDetailText = document.getElementById("bill-detail-text");
const billDetailClose = document.getElementById("bill-detail-close");

// ------------------------------------------
// Initialize
// ------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadBills();
});

// ------------------------------------------
// Search Button
// ------------------------------------------
billSearchBtn.addEventListener("click", () => {
  loadBills();
});

// ------------------------------------------
// Close Detail Card
// ------------------------------------------
billDetailClose.addEventListener("click", () => {
  billDetailCard.classList.add("hidden");
});

// ------------------------------------------
// Load Bills
// ------------------------------------------
async function loadBills() {
  billsBody.innerHTML = "<div class='table-row'>Loading...</div>";

  const search = billSearchInput.value.trim();
  const from = billFromInput.value;
  const to = billToInput.value;

  try {
    const url =
      `${API_URL}?action=getBills` +
      `&search=${encodeURIComponent(search)}` +
      `&from=${encodeURIComponent(from)}` +
      `&to=${encodeURIComponent(to)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.success) {
      billsBody.innerHTML =
        "<div class='table-row'>Failed to load bills.</div>";
      return;
    }

    renderBills(data.bills);
  } catch (error) {
    console.error("Error loading bills:", error);
    billsBody.innerHTML =
      "<div class='table-row'>Error loading bills.</div>";
  }
}

// ------------------------------------------
// Render Bills Table
// ------------------------------------------
function renderBills(bills) {
  if (!bills || bills.length === 0) {
    billsBody.innerHTML =
      "<div class='table-row'>No bills found.</div>";
    return;
  }

  billsBody.innerHTML = "";

  bills.forEach((bill) => {
    const row = document.createElement("div");
    row.className = "table-row cols-5";

    row.innerHTML = `
      <span>${bill.billNo}</span>
      <span>${bill.date}</span>
      <span>${bill.customerName}</span>
      <span>₹${Number(bill.total).toFixed(2)}</span>
      <span>
        <button class="secondary-btn small view-btn">
          View
        </button>
      </span>
    `;

    row.querySelector(".view-btn").addEventListener("click", () => {
      showBillDetail(bill);
    });

    billsBody.appendChild(row);
  });
}

// ------------------------------------------
// Show Bill Detail
// ------------------------------------------
function showBillDetail(bill) {
  billDetailText.textContent =
    JSON.stringify(bill, null, 2);

  billDetailCard.classList.remove("hidden");
}