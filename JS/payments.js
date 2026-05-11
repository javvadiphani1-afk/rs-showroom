// ============================================
// payments.js
// Ramu Saree Showroom Billing System
// ============================================

// Replace with your deployed Google Apps Script URL
const API_URL = "https://script.google.com/macros/s/AKfycbxrgJa4MHcQhyJjVFOW9AFNAO-daxfGgKFbcmwJQZPMJ8W86Hc5egLoF2-vBkoFZ3A-BQ/exec";

// DOM Elements
const paymentDateInput = document.getElementById("payment-date");
const paymentMethodFilter = document.getElementById("payment-method-filter");
const paymentSearchInput = document.getElementById("payment-search");
const paymentSearchBtn = document.getElementById("payment-search-btn");
const paymentRefreshBtn = document.getElementById("payment-refresh-btn");

const paymentsBody = document.getElementById("payments-body");

const todayTotalEl = document.getElementById("today-total");
const cashTotalEl = document.getElementById("cash-total");
const upiTotalEl = document.getElementById("upi-total");
const paymentsCountEl = document.getElementById("payments-count");

const paymentDetailCard = document.getElementById("payment-detail");
const paymentDetailText = document.getElementById("payment-detail-text");
const paymentDetailClose = document.getElementById("payment-detail-close");

// ============================================
// Initialize
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  setTodayDate();
  attachEvents();
  loadPayments();
});

// ============================================
// Attach Events
// ============================================
function attachEvents() {
  paymentSearchBtn.addEventListener("click", loadPayments);
  paymentRefreshBtn.addEventListener("click", loadPayments);

  paymentDateInput.addEventListener("change", loadPayments);
  paymentMethodFilter.addEventListener("change", loadPayments);

  paymentSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      loadPayments();
    }
  });

  paymentDetailClose.addEventListener("click", () => {
    paymentDetailCard.classList.add("hidden");
  });
}

// ============================================
// Set Today's Date
// ============================================
function setTodayDate() {
  const today = new Date().toISOString().split("T")[0];
  paymentDateInput.value = today;
}

// ============================================
// Load Payments
// ============================================
async function loadPayments() {
  showLoading();

  const filters = {
    date: paymentDateInput.value,
    method: paymentMethodFilter.value,
    search: paymentSearchInput.value.trim()
  };

  try {
    let payments = [];

    // If API URL is not configured, load from localStorage
    if (
      !API_URL ||
      API_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL"
    ) {
      payments = loadPaymentsFromLocal(filters);
    } else {
      const url =
        `${API_URL}?action=getPayments` +
        `&date=${encodeURIComponent(filters.date)}` +
        `&method=${encodeURIComponent(filters.method)}` +
        `&search=${encodeURIComponent(filters.search)}`;

      const response = await fetch(url);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to load payments.");
      }

      payments = result.payments || [];
    }

    renderPayments(payments);
    updateSummary(payments);
  } catch (error) {
    console.error("Error loading payments:", error);

    paymentsBody.innerHTML = `
      <div class="table-row">
        Error loading payments: ${error.message}
      </div>
    `;

    updateSummary([]);
  }
}

// ============================================
// Show Loading
// ============================================
function showLoading() {
  paymentsBody.innerHTML = `
    <div class="table-row">
      Loading payments...
    </div>
  `;
}

// ============================================
// Load from localStorage
// ============================================
function loadPaymentsFromLocal(filters) {
  const stored = JSON.parse(
    localStorage.getItem("recentBills") || "[]"
  );

  return stored
    .filter((bill) => {
      const dateMatch =
        !filters.date || bill.date === filters.date;

      const methodMatch =
        !filters.method ||
        (bill.paymentType || "").toUpperCase() === filters.method;

      const searchText = filters.search.toLowerCase();

      const searchMatch =
        !searchText ||
        (bill.billNo || "")
          .toLowerCase()
          .includes(searchText) ||
        (bill.customerName || "")
          .toLowerCase()
          .includes(searchText) ||
        (bill.customerPhone || "")
          .toLowerCase()
          .includes(searchText);

      return dateMatch && methodMatch && searchMatch;
    })
    .map((bill) => ({
      billNo: bill.billNo,
      date: bill.date,
      customerName: bill.customerName || "",
      customerPhone: bill.customerPhone || "",
      paymentType: bill.paymentType || "CASH",
      amount: Number(bill.total || 0),
      status: bill.status || "Paid"
    }));
}

// ============================================
// Render Payments Table
// ============================================
function renderPayments(payments) {
  paymentsBody.innerHTML = "";

  if (!payments || payments.length === 0) {
    paymentsBody.innerHTML = `
      <div class="table-row">
        No payments found.
      </div>
    `;
    return;
  }

  payments.forEach((payment) => {
    const row = document.createElement("div");
    row.className = "table-row cols-6";

    row.innerHTML = `
      <span>${escapeHtml(payment.billNo)}</span>
      <span>${escapeHtml(payment.date)}</span>
      <span>${escapeHtml(payment.customerName)}</span>
      <span>${escapeHtml(payment.paymentType)}</span>
      <span>₹${Number(payment.amount).toFixed(2)}</span>
      <span>
        <button type="button" class="secondary-btn small view-btn">
          View
        </button>
      </span>
    `;

    row.querySelector(".view-btn").addEventListener("click", () => {
      showPaymentDetail(payment);
    });

    paymentsBody.appendChild(row);
  });
}

// ============================================
// Update Summary Cards
// ============================================
function updateSummary(payments) {
  let total = 0;
  let cash = 0;
  let upi = 0;

  payments.forEach((payment) => {
    const amount = Number(payment.amount || 0);
    total += amount;

    if ((payment.paymentType || "").toUpperCase() === "CASH") {
      cash += amount;
    } else if ((payment.paymentType || "").toUpperCase() === "UPI") {
      upi += amount;
    }
  });

  todayTotalEl.textContent = `₹${total.toFixed(2)}`;
  cashTotalEl.textContent = `₹${cash.toFixed(2)}`;
  upiTotalEl.textContent = `₹${upi.toFixed(2)}`;
  paymentsCountEl.textContent = payments.length;
}

// ============================================
// Show Payment Detail
// ============================================
function showPaymentDetail(payment) {
  paymentDetailText.textContent = JSON.stringify(
    payment,
    null,
    2
  );

  paymentDetailCard.classList.remove("hidden");
}

// ============================================
// Escape HTML
// ============================================
function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value == null ? "" : String(value);
  return div.innerHTML;
}