// ============================================
// Google Apps Script for Ramu Saree Showroom Billing System
// Deploy this as a Web App and replace API_URL in JS files
// ============================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    switch (action) {
      case 'saveBill':
        return saveBillToSheet(data.bill);
      case 'savePayment':
        return savePaymentToSheet(data.payment);
      default:
        return createJsonResponse({
          success: false,
          message: 'Unknown action: ' + action
        });
    }
  } catch (error) {
    return createJsonResponse({
      success: false,
      message: error.toString()
    });
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;

    switch (action) {
      case 'getBills':
        return getBillsFromSheet(e.parameter);
      case 'getPayments':
        return getPaymentsFromSheet(e.parameter);
      case 'getMonthlyAnalysis':
        return getMonthlyAnalysisFromSheet(e.parameter);
      case 'getCustomers':
        return getCustomersFromSheet(e.parameter);
      default:
        return createJsonResponse({
          success: false,
          message: 'Unknown action: ' + action
        });
    }
  } catch (error) {
    return createJsonResponse({
      success: false,
      message: error.toString()
    });
  }
}

// ============================================
// Response helper with CORS support
// ============================================
function createJsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doOptions(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// Save Bill to Google Sheet
// ============================================
function saveBillToSheet(bill) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    // Save to Bills sheet
    let billsSheet = spreadsheet.getSheetByName('Bills');
    if (!billsSheet) {
      billsSheet = spreadsheet.insertSheet('Bills');
      billsSheet.appendRow([
        'Bill No', 'Date', 'Customer Name', 'Customer Phone', 'Payment Type',
        'Subtotal', 'Total', 'Items', 'Timestamp'
      ]);
    }

    const itemsString = bill.items.map(item =>
      `${item.description} (Qty: ${item.qty}, Rate: ₹${item.rate}, Amount: ₹${item.amount})`
    ).join('; ');

    billsSheet.appendRow([
      bill.billNo,
      bill.date,
      bill.customerName,
      bill.customerPhone,
      bill.paymentType,
      bill.subtotal,
      bill.total,
      itemsString,
      new Date().toISOString()
    ]);

    // Save/update customer in Customers sheet
    saveCustomerToSheet({
      name: bill.customerName,
      phone: bill.customerPhone,
      lastBillDate: bill.date,
      totalBills: 1,
      totalAmount: bill.total
    });

    return createJsonResponse({
      success: true,
      message: 'Bill saved successfully'
    });

  } catch (error) {
    return createJsonResponse({
      success: false,
      message: 'Error saving bill: ' + error.toString()
    });
  }
}

// ============================================
// Save Payment to Google Sheet
// ============================================
function savePaymentToSheet(payment) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let paymentsSheet = spreadsheet.getSheetByName('Payments');

    // Create Payments sheet if it doesn't exist
    if (!paymentsSheet) {
      paymentsSheet = spreadsheet.insertSheet('Payments');
      // Add headers
      paymentsSheet.appendRow([
        'Date', 'Bill No', 'Customer Name', 'Customer Phone', 'Amount', 'Payment Method', 'Notes', 'Timestamp'
      ]);
    }

    // Add payment data
    paymentsSheet.appendRow([
      payment.date,
      payment.billNo,
      payment.customerName,
      payment.customerPhone || '',
      payment.amount,
      payment.method,
      payment.notes || '',
      new Date().toISOString()
    ]);

    return createJsonResponse({
      success: true,
      message: 'Payment saved successfully'
    });

  } catch (error) {
    return createJsonResponse({
      success: false,
      message: 'Error saving payment: ' + error.toString()
    });
  }
}

// ============================================
// Save/Update Customer to Google Sheet
// ============================================
function saveCustomerToSheet(customerData) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let customersSheet = spreadsheet.getSheetByName('Customers');

    // Create Customers sheet if it doesn't exist
    if (!customersSheet) {
      customersSheet = spreadsheet.insertSheet('Customers');
      // Add headers
      customersSheet.appendRow([
        'Customer Name', 'Phone', 'First Bill Date', 'Last Bill Date', 'Total Bills', 'Total Amount', 'Timestamp'
      ]);
    }

    const data = customersSheet.getDataRange().getValues();
    let customerRowIndex = -1;

    // Find existing customer by phone number
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === customerData.phone) { // Phone column
        customerRowIndex = i + 1; // +1 because array is 0-indexed but sheet is 1-indexed
        break;
      }
    }

    if (customerRowIndex > 0) {
      // Update existing customer
      const existingData = data[customerRowIndex - 1];
      const currentTotalBills = parseInt(existingData[4]) || 0;
      const currentTotalAmount = parseFloat(existingData[5]) || 0;

      customersSheet.getRange(customerRowIndex, 4).setValue(customerData.lastBillDate); // Last Bill Date
      customersSheet.getRange(customerRowIndex, 5).setValue(currentTotalBills + customerData.totalBills); // Total Bills
      customersSheet.getRange(customerRowIndex, 6).setValue(currentTotalAmount + customerData.totalAmount); // Total Amount
      customersSheet.getRange(customerRowIndex, 7).setValue(new Date().toISOString()); // Timestamp
    } else {
      // Add new customer
      customersSheet.appendRow([
        customerData.name,
        customerData.phone,
        customerData.lastBillDate, // First Bill Date
        customerData.lastBillDate, // Last Bill Date
        customerData.totalBills,
        customerData.totalAmount,
        new Date().toISOString()
      ]);
    }

  } catch (error) {
    console.error('Error saving customer:', error);
    // Don't throw error for customer saving - bill should still save
  }
}

// ============================================
// Get Bills from Google Sheet
// ============================================
function getBillsFromSheet(params) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const billsSheet = spreadsheet.getSheetByName('Bills');

    if (!billsSheet) {
      return createJsonResponse({
        success: true,
        bills: []
      });
    }

    const data = billsSheet.getDataRange().getValues();
    const headers = data[0];
    const bills = [];

    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const bill = {
        billNo: row[0],
        date: row[1],
        customerName: row[2],
        customerPhone: row[3],
        paymentType: row[4],
        subtotal: parseFloat(row[5]) || 0,
        total: parseFloat(row[6]) || 0,
        itemsString: row[7],
        timestamp: row[8]
      };

      // Apply filters
      if (params.search) {
        const searchTerm = params.search.toLowerCase();
        if (!bill.customerName.toLowerCase().includes(searchTerm) &&
            !bill.billNo.toString().toLowerCase().includes(searchTerm)) {
          continue;
        }
      }

      if (params.date && bill.date !== params.date) {
        continue;
      }

      bills.push(bill);
    }

    // Sort by date descending
    bills.sort((a, b) => new Date(b.date) - new Date(a.date));

    return createJsonResponse({
        success: true,
        bills: bills
      });

  } catch (error) {
    return createJsonResponse({
        success: false,
        message: 'Error getting bills: ' + error.toString()
      });
  }
}

// ============================================
// Get Payments from Google Sheet
// ============================================
function getPaymentsFromSheet(params) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const paymentsSheet = spreadsheet.getSheetByName('Payments');

    if (!paymentsSheet) {
      return createJsonResponse({
        success: true,
        payments: []
      });
    }

    const data = paymentsSheet.getDataRange().getValues();
    const payments = [];

    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const payment = {
        date: row[0],
        billNo: row[1],
        customerName: row[2],
        customerPhone: row[3],
        amount: parseFloat(row[4]) || 0,
        method: row[5],
        notes: row[6],
        timestamp: row[7]
      };

      // Apply filters
      if (params.date && payment.date !== params.date) {
        continue;
      }

      if (params.method && params.method !== 'all' && payment.method !== params.method) {
        continue;
      }

      if (params.search) {
        const searchTerm = params.search.toLowerCase();
        if (!payment.customerName.toLowerCase().includes(searchTerm) &&
            !payment.billNo.toString().toLowerCase().includes(searchTerm)) {
          continue;
        }
      }

      payments.push(payment);
    }

    // Sort by date descending
    payments.sort((a, b) => new Date(b.date) - new Date(a.date));

    return createJsonResponse({
        success: true,
        payments: payments
      });

  } catch (error) {
    return createJsonResponse({
        success: false,
        message: 'Error getting payments: ' + error.toString()
      });
  }
}

// ============================================
// Get Monthly Analysis from Google Sheet
// ============================================
function getMonthlyAnalysisFromSheet(params) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const billsSheet = spreadsheet.getSheetByName('Bills');

    if (!billsSheet) {
      return createJsonResponse({
        success: true,
        analysis: {
          totalSales: 0,
          cashSales: 0,
          upiSales: 0,
          totalBills: 0,
          bills: []
        }
      });
    }

    const data = billsSheet.getDataRange().getValues();
    const month = params.month; // Format: YYYY-MM
    const bills = [];
    let totalSales = 0;
    let cashSales = 0;
    let upiSales = 0;

    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const billDate = row[1]; // Date column

      // Check if bill is in the requested month
      if (billDate && billDate.toString().startsWith(month)) {
        const bill = {
          billNo: row[0],
          date: billDate,
          customerName: row[2],
          customerPhone: row[3],
          paymentType: row[4],
          subtotal: parseFloat(row[5]) || 0,
          total: parseFloat(row[6]) || 0,
          itemsString: row[7],
          timestamp: row[8]
        };

        bills.push(bill);
        totalSales += bill.total;

        if (bill.paymentType.toLowerCase().includes('cash')) {
          cashSales += bill.total;
        } else if (bill.paymentType.toLowerCase().includes('upi')) {
          upiSales += bill.total;
        }
      }
    }

    // Sort bills by date descending
    bills.sort((a, b) => new Date(b.date) - new Date(a.date));

    return createJsonResponse({
        success: true,
        analysis: {
          totalSales: totalSales,
          cashSales: cashSales,
          upiSales: upiSales,
          totalBills: bills.length,
          bills: bills
        }
      });

  } catch (error) {
    return createJsonResponse({
        success: false,
        message: 'Error getting monthly analysis: ' + error.toString()
      });
  }
}

// ============================================
// Get Customers from Google Sheet
// ============================================
function getCustomersFromSheet(params) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const customersSheet = spreadsheet.getSheetByName('Customers');

    if (!customersSheet) {
      return createJsonResponse({
        success: true,
        customers: []
      });
    }

    const data = customersSheet.getDataRange().getValues();
    const customers = [];

    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const customer = {
        name: row[0],
        phone: row[1],
        firstBillDate: row[2],
        lastBillDate: row[3],
        totalBills: parseInt(row[4]) || 0,
        totalAmount: parseFloat(row[5]) || 0,
        timestamp: row[6]
      };

      // Apply search filter
      if (params.search) {
        const searchTerm = params.search.toLowerCase();
        if (!customer.name.toLowerCase().includes(searchTerm) &&
            !customer.phone.toLowerCase().includes(searchTerm)) {
          continue;
        }
      }

      customers.push(customer);
    }

    // Sort by last bill date descending
    customers.sort((a, b) => new Date(b.lastBillDate) - new Date(a.lastBillDate));

    return createJsonResponse({
        success: true,
        customers: customers
      });

  } catch (error) {
    return createJsonResponse({
        success: false,
        message: 'Error getting customers: ' + error.toString()
      });
  }
}