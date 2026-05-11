// ============================================
// new-bill.js
// Ramu Saree Showroom Billing System
// ============================================

// Replace with your deployed Google Apps Script URL
const API_URL =
  "https://script.google.com/macros/s/AKfycbxrgJa4MHcQhyJjVFOW9AFNAO-daxfGgKFbcmwJQZPMJ8W86Hc5egLoF2-vBkoFZ3A-BQ/exec";

// Merchant UPI details
const SHOP_UPI_ID = "8885878767-2@ybl";
const SHOP_NAME = "Ramu";

// DOM Elements
const billNoInput = document.getElementById("billNo");
const billDateInput = document.getElementById("billDate");
const custNameInput = document.getElementById("custName");
const custPhoneInput = document.getElementById("custPhone");

const itemsBody = document.getElementById("items-body");
const addItemBtn = document.getElementById("add-item-btn");

const subtotalDisplay = document.getElementById("subtotal-display");
const totalDisplay = document.getElementById("total-display");
const payAmountDisplay = document.getElementById("pay-amount-display");

const upiSection = document.getElementById("upi-section");
const upiQrContainer = document.getElementById("upi-qr");
const upiIdDisplay = document.getElementById("upi-id-display");
const upiAmountDisplay =
  document.getElementById("upi-amount-display");

const saveBillBtn =
  document.getElementById("save-bill-btn");
const printBillBtn =
  document.getElementById("print-bill-btn");
const whatsappBillBtn =
  document.getElementById("whatsapp-bill-btn");
const newBillBtn =
  document.getElementById("new-bill-btn");

const billMessage =
  document.getElementById("bill-message");
const recentBillsBody =
  document.getElementById("recent-bills-body");

let currentBill = null;

// ============================================
// Initialize
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  initializeNewBill();
});

// ============================================
// Initialize New Bill
// ============================================
function initializeNewBill() {
  setTodayDate();
  generateBillNumber();
  addItemRow();
  updateTotals();
  renderRecentBills();

  upiIdDisplay.textContent = SHOP_UPI_ID;

  // Events
  addItemBtn.addEventListener("click", addItemRow);
  saveBillBtn.addEventListener("click", saveBill);
  printBillBtn.addEventListener("click", printBill);
  whatsappBillBtn.addEventListener(
    "click",
    sendBillWhatsApp
  );
  newBillBtn.addEventListener("click", resetForm);

  document
    .querySelectorAll('input[name="payType"]')
    .forEach((radio) => {
      radio.addEventListener(
        "change",
        updatePaymentSection
      );
    });
}

// ============================================
// Set Today Date
// ============================================
function setTodayDate() {
  const today = new Date()
    .toISOString()
    .split("T")[0];
  billDateInput.value = today;
}

// ============================================
// Generate Bill Number
// ============================================
function generateBillNumber() {
  const now = new Date();
  const billNo =
    "B" +
    now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  billNoInput.value = billNo;
}

// ============================================
// Add Item Row
// ============================================
function addItemRow() {
  const row = document.createElement("div");
  row.className = "item-row";

  row.innerHTML = `
    <input type="text" class="item-desc" placeholder="Saree description" />
    <input type="number" class="item-qty" value="1" min="1" />
    <input type="number" class="item-rate" value="0" min="0" step="0.01" />
    <input type="text" class="item-total" value="0.00" readonly />
    <button type="button" class="remove-item-btn">✕</button>
  `;

  // Update totals when values change
  row
    .querySelectorAll(".item-qty, .item-rate")
    .forEach((input) => {
      input.addEventListener("input", updateTotals);
    });

  // Remove row
  row
    .querySelector(".remove-item-btn")
    .addEventListener("click", () => {
      row.remove();

      if (itemsBody.children.length === 0) {
        addItemRow();
      }

      updateTotals();
    });

  itemsBody.appendChild(row);
}

// ============================================
// Update Totals
// ============================================
function updateTotals() {
  let subtotal = 0;

  const rows =
    itemsBody.querySelectorAll(".item-row");

  rows.forEach((row) => {
    const qty =
      parseFloat(
        row.querySelector(".item-qty").value
      ) || 0;

    const rate =
      parseFloat(
        row.querySelector(".item-rate").value
      ) || 0;

    const total = qty * rate;

    row.querySelector(".item-total").value =
      total.toFixed(2);

    subtotal += total;
  });

  subtotalDisplay.textContent =
    `₹${subtotal.toFixed(2)}`;
  totalDisplay.textContent =
    `₹${subtotal.toFixed(2)}`;
  payAmountDisplay.textContent =
    `₹${subtotal.toFixed(2)}`;
  upiAmountDisplay.textContent =
    `₹${subtotal.toFixed(2)}`;

  updatePaymentSection();
}

// ============================================
// Payment Section
// ============================================
function updatePaymentSection() {
  const payType = getPaymentType();
  const total = getTotalAmount();

  if (payType === "UPI" && total > 0) {
    upiSection.classList.remove("hidden");
    generateUPIQRCode(total);
  } else {
    upiSection.classList.add("hidden");
  }
}

// ============================================
// Get Payment Type
// ============================================
function getPaymentType() {
  const selected = document.querySelector(
    'input[name="payType"]:checked'
  );

  return selected ? selected.value : "CASH";
}

// ============================================
// Get Total Amount
// ============================================
function getTotalAmount() {
  const text = totalDisplay.textContent.replace(
    "₹",
    ""
  );

  return parseFloat(text) || 0;
}

// ============================================
// Generate UPI QR Code
// ============================================
function generateUPIQRCode(amount) {
  const upiUrl =
    `upi://pay?pa=${encodeURIComponent(
      SHOP_UPI_ID
    )}` +
    `&pn=${encodeURIComponent(SHOP_NAME)}` +
    `&am=${amount.toFixed(2)}` +
    `&cu=INR` +
    `&tn=${encodeURIComponent(
      "Bill " + billNoInput.value
    )}`;

  upiQrContainer.innerHTML = "";

  if (typeof QRCode !== "undefined") {
    new QRCode(upiQrContainer, {
      text: upiUrl,
      width: 200,
      height: 200
    });
  } else {
    upiQrContainer.innerHTML =
      "<p>QR library not loaded.</p>";
  }
}

// ============================================
// Collect Bill Data
// ============================================
function collectBillData() {
  const items = [];

  itemsBody
    .querySelectorAll(".item-row")
    .forEach((row) => {
      const description =
        row
          .querySelector(".item-desc")
          .value.trim();

      const qty =
        parseFloat(
          row.querySelector(".item-qty").value
        ) || 0;

      const rate =
        parseFloat(
          row.querySelector(".item-rate").value
        ) || 0;

      const amount = qty * rate;

      if (description && qty > 0) {
        items.push({
          description,
          qty,
          rate,
          amount
        });
      }
    });

  return {
    billNo: billNoInput.value,
    date: billDateInput.value,
    customerName:
      custNameInput.value.trim(),
    customerPhone:
      custPhoneInput.value.trim(),
    paymentType: getPaymentType(),
    subtotal: getTotalAmount(),
    total: getTotalAmount(),
    items
  };
}

// ============================================
// Validate Bill
// ============================================
function validateBill(bill) {
  if (!bill.customerName) {
    showMessage(
      "Customer name is required.",
      false
    );
    return false;
  }

  if (bill.items.length === 0) {
    showMessage(
      "Add at least one item.",
      false
    );
    return false;
  }

  return true;
}

// ============================================
// Save Bill
// ============================================
async function saveBill() {
  const bill = collectBillData();

  if (!validateBill(bill)) {
    return;
  }

  saveBillBtn.disabled = true;
  saveBillBtn.textContent = "Saving...";

  try {
    // If API URL is not configured, save locally
    if (
      !API_URL ||
      API_URL ===
        "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL"
    ) {
      localSaveBill(bill);

      showMessage(
        "Bill saved locally. Configure API_URL to save to Google Sheets.",
        true
      );
    } else {
      // Save bill
      const billResponse = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "saveBill",
          bill
        })
      });

      const billResult = await billResponse.json();

      if (!billResult.success) {
        throw new Error(billResult.message || "Failed to save bill.");
      }

      // Save payment record
      const payment = {
        date: bill.date,
        billNo: bill.billNo,
        customerName: bill.customerName,
        customerPhone: bill.customerPhone,
        amount: bill.total,
        method: bill.paymentType,
        notes: `Bill payment for invoice ${bill.billNo}`
      };

      const paymentResponse = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "savePayment",
          payment
        })
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResult.success) {
        console.warn("Bill saved but payment record failed:", paymentResult.message);
      }

      showMessage("Bill saved successfully.", true);
    }

    currentBill = bill;
    printBillBtn.classList.remove("hidden");
    whatsappBillBtn.classList.remove("hidden");
    renderRecentBills();
  } catch (error) {
    console.error(error);

    showMessage(
      "Error saving bill: " +
        error.message,
      false
    );
  } finally {
    saveBillBtn.disabled = false;
    saveBillBtn.textContent =
      "Save Bill";
  }
}

// ============================================
// Save Locally
// ============================================
function localSaveBill(bill) {
  const bills = JSON.parse(
    localStorage.getItem("recentBills") ||
      "[]"
  );

  bills.unshift({
    billNo: bill.billNo,
    date: bill.date,
    customerName: bill.customerName,
    total: bill.total,
    paymentType: bill.paymentType,
    status: "Saved",
    fullBill: bill
  });

  localStorage.setItem(
    "recentBills",
    JSON.stringify(bills.slice(0, 10))
  );
}

// ============================================
// Render Recent Bills
// ============================================
function renderRecentBills() {
  const bills = JSON.parse(
    localStorage.getItem("recentBills") ||
      "[]"
  );

  recentBillsBody.innerHTML = "";

  if (bills.length === 0) {
    recentBillsBody.innerHTML =
      "<div class='table-row'>No recent bills.</div>";
    return;
  }

  bills.forEach((bill) => {
    const row =
      document.createElement("div");
    row.className =
      "table-row cols-4";

    row.innerHTML = `
      <span>${bill.billNo}</span>
      <span>${bill.date}</span>
      <span>${bill.status}</span>
      <span>₹${Number(
        bill.total
      ).toFixed(2)}</span>
    `;

    recentBillsBody.appendChild(row);
  });
}

// ============================================
// Print Bill
// ============================================
function printBill() {
  if (!currentBill) {
    alert("No bill to print.");
    return;
  }

  // Parse subtotal - it could be a number or string with ₹
  let subtotal = currentBill.subtotal;
  if (typeof subtotal === 'string') {
    subtotal = parseFloat(subtotal.replace(/₹|,/g, ''));
  } else {
    subtotal = parseFloat(subtotal);
  }

  // Calculate GST at 5%
  const gstAmount = subtotal * 0.05;
  const totalAmount = subtotal + gstAmount;

  const billData = {
    billNo: currentBill.billNo,
    billDate: formatDateForPrint(currentBill.date),
    custName: currentBill.customerName,
    custPhone: currentBill.customerPhone,
    subtotal: `₹${subtotal.toFixed(2)}`,
    gst: `₹${gstAmount.toFixed(2)}`,
    total: `₹${totalAmount.toFixed(2)}`,
    paymentMode: currentBill.paymentType || 'Cash',
    items: currentBill.items.map(item => ({
      description: item.description,
      qty: item.qty,
      rate: `₹${parseFloat(item.rate).toFixed(2)}`,
      total: `₹${parseFloat(item.amount).toFixed(2)}`
    }))
  };

  // Call printInvoice from print.js
  if (typeof printInvoice === 'function') {
    printInvoice(billData);
  } else {
    alert('Print function not available. Please refresh the page.');
  }
}

// ============================================
// Send bill via WhatsApp
function sendBillWhatsApp() {
  if (!currentBill) {
    alert("No bill available to send.");
    return;
  }

  const phone = formatWhatsAppPhone(currentBill.customerPhone);
  if (!phone) {
    showMessage(
      "Enter a valid customer phone number to send WhatsApp message.",
      false
    );
    return;
  }

  const messageLines = [
    "═══════════════════════════════════",
    `${SHOP_NAME} - Invoice Receipt`,
    "═══════════════════════════════════",
    "",
    `Dear ${currentBill.customerName || 'Valued Customer'},`,
    "",
    `Invoice No: ${currentBill.billNo}`,
    `Date: ${currentBill.date}`,
    "",
    "───────────────────────────────────",
    "*ITEMS ORDERED:*",
    "───────────────────────────────────"
  ];

  currentBill.items.forEach((item, index) => {
    messageLines.push(
      `${index + 1}. ${item.description}\n   Qty: ${item.qty} | Rate: ₹${parseFloat(item.rate).toFixed(2)} | Amount: ₹${parseFloat(item.amount).toFixed(2)}`
    );
  });

  messageLines.push(
    "",
    "───────────────────────────────────",
    `*Subtotal:* ₹${parseFloat(currentBill.subtotal).toFixed(2)}`,
    `*Total Amount:* ₹${parseFloat(currentBill.total).toFixed(2)}`,
    `*Payment Method:* ${currentBill.paymentType}`,
    "───────────────────────────────────"
  );

  if (currentBill.paymentType === 'UPI') {
    messageLines.push(
      "",
      "*UPI Payment Details:*",
      `UPI ID: ${SHOP_UPI_ID}`,
      `Amount: ₹${parseFloat(currentBill.total).toFixed(2)}`
    );
  }

  messageLines.push(
    "",
    "═══════════════════════════════════",
    "*JOIN OUR COMMUNITY FOR NEW COLLECTIONS:*",
    "https://chat.whatsapp.com/He1vebRTEpPK2IvKdaTkoD",
    "",
    "Thank you for your purchase!",
    "═══════════════════════════════════"
  );

  const text = encodeURIComponent(messageLines.join("\n"));
  const url = `https://wa.me/${phone}?text=${text}`;

  window.open(url, '_blank');
}

function formatWhatsAppPhone(phone) {
  if (!phone) return null;

  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }

  return null;
}

// ============================================
// Format Date for Print
// ============================================
function formatDateForPrint(dateStr) {
  if (!dateStr) return new Date().toLocaleDateString('en-IN');
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN');
  } catch (e) {
    return dateStr;
  }
}

// ============================================
// Reset Form
// ============================================
function resetForm() {
  custNameInput.value = "";
  custPhoneInput.value = "";
  itemsBody.innerHTML = "";

  addItemRow();

  setTodayDate();
  generateBillNumber();
  updateTotals();

  currentBill = null;

  printBillBtn.classList.add("hidden");
  whatsappBillBtn.classList.add("hidden");
  upiSection.classList.add("hidden");

  billMessage.textContent = "";
}

// ============================================
// Show Message
// ============================================
function showMessage(message, success) {
  billMessage.textContent = message;
  billMessage.className = success
    ? "success"
    : "error";
}