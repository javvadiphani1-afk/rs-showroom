// ============================================
// customers.js
// Ramu Saree Showroom Billing System
// ============================================

// Replace with your deployed Google Apps Script Web App URL
const API_URL = "https://script.google.com/macros/s/AKfycbxrgJa4MHcQhyJjVFOW9AFNAO-daxfGgKFbcmwJQZPMJ8W86Hc5egLoF2-vBkoFZ3A-BQ/exec";

// DOM Elements
const customerSearchBtn = document.getElementById("customer-search-btn");
const customerSearchInput = document.getElementById("customer-search");
const customerRefreshBtn = document.getElementById("customer-refresh-btn");

const customersBody = document.getElementById("customers-body");

const totalCustomersEl = document.getElementById("total-customers");
const activeCustomersEl = document.getElementById("active-customers");
const totalRevenueEl = document.getElementById("total-revenue");
const avgOrderValueEl = document.getElementById("avg-order-value");

const customerDetailCard = document.getElementById("customer-detail");
const customerDetailText = document.getElementById("customer-detail-text");
const customerDetailClose = document.getElementById("customer-detail-close");

// ============================================
// Initialize
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  loadCustomers();
});

// ============================================
// Event Listeners
// ============================================
customerSearchBtn.addEventListener("click", () => {
  loadCustomers();
});

customerRefreshBtn.addEventListener("click", loadCustomers);

customerSearchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    loadCustomers();
  }
});

customerDetailClose.addEventListener("click", () => {
  customerDetailCard.classList.add("hidden");
});

// ============================================
// Load Customers
// ============================================
async function loadCustomers() {
  customersBody.innerHTML = "<div class='table-row'>Loading customers...</div>";

  const search = customerSearchInput.value.trim();

  try {
    let customers = [];

    // If API URL is not configured, show message
    if (!API_URL || API_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL") {
      customersBody.innerHTML = "<div class='table-row'>Configure API_URL to load customers from Google Sheets.</div>";
      updateSummary([]);
      return;
    }

    const url = `${API_URL}?action=getCustomers&search=${encodeURIComponent(search)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.success) {
      customersBody.innerHTML = "<div class='table-row'>Failed to load customers.</div>";
      return;
    }

    customers = data.customers || [];
    renderCustomers(customers);
    updateSummary(customers);

  } catch (error) {
    console.error("Error loading customers:", error);
    customersBody.innerHTML = "<div class='table-row'>Error loading customers.</div>";
    updateSummary([]);
  }
}

// ============================================
// Render Customers Table
// ============================================
function renderCustomers(customers) {
  if (!customers || customers.length === 0) {
    customersBody.innerHTML = "<div class='table-row'>No customers found.</div>";
    return;
  }

  customersBody.innerHTML = "";

  customers.forEach((customer) => {
    const row = document.createElement("div");
    row.className = "table-row cols-6";

    // Check if customer is active (has bills in last 6 months)
    const lastPurchaseDate = new Date(customer.lastBillDate);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const isActive = lastPurchaseDate >= sixMonthsAgo;

    row.innerHTML = `
      <span>${customer.name}</span>
      <span>${customer.phone}</span>
      <span>${customer.totalBills}</span>
      <span>₹${Number(customer.totalAmount).toFixed(2)}</span>
      <span>${formatDate(customer.lastBillDate)}</span>
      <span>
        <button class="secondary-btn small view-btn" data-customer='${JSON.stringify(customer)}'>
          View Details
        </button>
      </span>
    `;

    // Add active class for styling
    if (isActive) {
      row.classList.add("active-customer");
    }

    customersBody.appendChild(row);
  });

  // Add event listeners to view buttons
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const customer = JSON.parse(e.target.dataset.customer);
      showCustomerDetails(customer);
    });
  });
}

// ============================================
// Update Summary
// ============================================
function updateSummary(customers) {
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalAmount, 0);
  const avgOrderValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  // Count active customers (purchased in last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const activeCustomers = customers.filter(customer =>
    new Date(customer.lastBillDate) >= sixMonthsAgo
  ).length;

  totalCustomersEl.textContent = totalCustomers;
  activeCustomersEl.textContent = activeCustomers;
  totalRevenueEl.textContent = `₹${totalRevenue.toFixed(2)}`;
  avgOrderValueEl.textContent = `₹${avgOrderValue.toFixed(2)}`;
}

// ============================================
// Show Customer Details
// ============================================
function showCustomerDetails(customer) {
  customerDetailText.innerHTML = `
    <div class="customer-info">
      <div class="info-row">
        <strong>Name:</strong> ${customer.name}
      </div>
      <div class="info-row">
        <strong>Phone:</strong> ${customer.phone}
      </div>
      <div class="info-row">
        <strong>First Purchase:</strong> ${formatDate(customer.firstBillDate)}
      </div>
      <div class="info-row">
        <strong>Last Purchase:</strong> ${formatDate(customer.lastBillDate)}
      </div>
      <div class="info-row">
        <strong>Total Bills:</strong> ${customer.totalBills}
      </div>
      <div class="info-row">
        <strong>Total Amount:</strong> ₹${Number(customer.totalAmount).toFixed(2)}
      </div>
      <div class="info-row">
        <strong>Average Order Value:</strong> ₹${(customer.totalAmount / customer.totalBills).toFixed(2)}
      </div>
    </div>
  `;

  customerDetailCard.classList.remove("hidden");
}

// ============================================
// Format Date
// ============================================
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}