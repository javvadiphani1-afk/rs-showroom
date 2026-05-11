// ============================================
// monthly-analysis.js
// Ramu Saree Showroom Billing System
// ============================================

// Replace with your deployed Google Apps Script URL
const API_URL = "https://script.google.com/macros/s/AKfycbxrgJa4MHcQhyJjVFOW9AFNAO-daxfGgKFbcmwJQZPMJ8W86Hc5egLoF2-vBkoFZ3A-BQ/exec";

// DOM Elements
const analysisMonthInput = document.getElementById("analysis-month");
const loadAnalysisBtn = document.getElementById("load-analysis-btn");
const refreshAnalysisBtn = document.getElementById("refresh-analysis-btn");

const analysisBody = document.getElementById("analysis-body");

const totalSalesEl = document.getElementById("analysis-total-sales");
const cashSalesEl = document.getElementById("analysis-cash-sales");
const upiSalesEl = document.getElementById("analysis-upi-sales");
const totalBillsEl = document.getElementById("analysis-total-bills");

const analysisDetailCard = document.getElementById("analysis-detail");
const analysisDetailText = document.getElementById("analysis-detail-text");
const analysisDetailClose = document.getElementById(
  "analysis-detail-close"
);

// ============================================
// Initialize
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  setCurrentMonth();
  attachEvents();
  loadAnalysis();
});

// ============================================
// Set Current Month
// ============================================
function setCurrentMonth() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  analysisMonthInput.value = `${year}-${month}`;
}

// ============================================
// Attach Events
// ============================================
function attachEvents() {
  loadAnalysisBtn.addEventListener("click", loadAnalysis);
  refreshAnalysisBtn.addEventListener("click", loadAnalysis);

  analysisMonthInput.addEventListener("change", loadAnalysis);

  analysisDetailClose.addEventListener("click", () => {
    analysisDetailCard.classList.add("hidden");
  });
}

// ============================================
// Load Analysis
// ============================================
async function loadAnalysis() {
  showLoading();

  const selectedMonth = analysisMonthInput.value;

  if (!selectedMonth) {
    return;
  }

  try {
    let bills = [];

    // If API URL is not configured, use localStorage
    if (
      !API_URL ||
      API_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL"
    ) {
      bills = loadBillsFromLocal(selectedMonth);
    } else {
      const url =
        `${API_URL}?action=getMonthlyAnalysis` +
        `&month=${encodeURIComponent(selectedMonth)}`;

      const response = await fetch(url);
      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "Failed to load analysis."
        );
      }

      bills = result.bills || [];
    }

    renderAnalysisTable(bills);
    updateSummary(bills);
  } catch (error) {
    console.error("Error loading analysis:", error);

    analysisBody.innerHTML = `
      <div class="table-row">
        Error loading analysis: ${error.message}
      </div>
    `;

    updateSummary([]);
  }
}

// ============================================
// Show Loading
// ============================================
function showLoading() {
  analysisBody.innerHTML = `
    <div class="table-row">
      Loading monthly analysis...
    </div>
  `;
}

// ============================================
// Load Bills from localStorage
// ============================================
function loadBillsFromLocal(selectedMonth) {
  const stored = JSON.parse(
    localStorage.getItem("recentBills") || "[]"
  );

  return stored
    .filter((bill) => {
      // bill.date expected format: YYYY-MM-DD
      return (
        bill.date &&
        bill.date.substring(0, 7) === selectedMonth
      );
    })
    .map((bill) => ({
      billNo: bill.billNo,
      date: bill.date,
      customerName: bill.customerName || "",
      paymentType: bill.paymentType || "CASH",
      total: Number(bill.total || 0),
      status: bill.status || "Paid",
      fullBill: bill.fullBill || bill
    }));
}

// ============================================
// Render Analysis Table
// ============================================
function renderAnalysisTable(bills) {
  analysisBody.innerHTML = "";

  if (!bills || bills.length === 0) {
    analysisBody.innerHTML = `
      <div class="table-row">
        No bills found for the selected month.
      </div>
    `;
    return;
  }

  bills.forEach((bill) => {
    const row = document.createElement("div");
    row.className = "table-row cols-6";

    row.innerHTML = `
      <span>${escapeHtml(bill.billNo)}</span>
      <span>${escapeHtml(bill.date)}</span>
      <span>${escapeHtml(bill.customerName)}</span>
      <span>${escapeHtml(bill.paymentType)}</span>
      <span>₹${Number(bill.total).toFixed(2)}</span>
      <span>
        <button type="button" class="secondary-btn small view-btn">
          View
        </button>
      </span>
    `;

    row.querySelector(".view-btn").addEventListener("click", () => {
      showBillDetail(bill.fullBill || bill);
    });

    analysisBody.appendChild(row);
  });
}

// ============================================
// Update Summary Cards
// ============================================
function updateSummary(bills) {
  let totalSales = 0;
  let cashSales = 0;
  let upiSales = 0;

  bills.forEach((bill) => {
    const amount = Number(bill.total || 0);
    totalSales += amount;

    const paymentType = (bill.paymentType || "").toUpperCase();

    if (paymentType === "CASH") {
      cashSales += amount;
    } else if (paymentType === "UPI") {
      upiSales += amount;
    }
  });

  totalSalesEl.textContent = `₹${totalSales.toFixed(2)}`;
  cashSalesEl.textContent = `₹${cashSales.toFixed(2)}`;
  upiSalesEl.textContent = `₹${upiSales.toFixed(2)}`;
  totalBillsEl.textContent = bills.length;
}

// ============================================
// Show Bill Detail
// ============================================
function showBillDetail(bill) {
  analysisDetailText.textContent = JSON.stringify(
    bill,
    null,
    2
  );

  analysisDetailCard.classList.remove("hidden");
}

// ============================================
// Escape HTML
// ============================================
function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value == null ? "" : String(value);
  return div.innerHTML;
}