# Ramu Saree Showroom Billing System - Google Sheets Integration

This billing system now uses Google Sheets as a database through Google Apps Script. Follow these steps to set it up.

## 🚀 Setup Instructions

### 1. Create a Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "Ramu Saree Showroom Database" (optional)

### 2. Open Google Apps Script
1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any default code in the script editor
3. Copy the entire code from `google-apps-script.js` and paste it
4. Save the project (give it a name like "Ramu Saree Showroom API")

### 3. Deploy the Web App
1. Click the **Deploy** button (blue button)
2. Select **New deployment**
3. Choose type: **Web app**
4. Configure:
   - **Description**: Ramu Saree Showroom API
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone (important for web app access)
5. Click **Deploy**
6. **Copy the Web App URL** - you'll need this next!

### 4. Update JavaScript Files
Replace `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL` in these files with your deployed Web App URL:

- `JS/new-bill.js`
- `JS/bills.js`
- `JS/payments.js`
- `JS/monthly.js`

**Example:**
```javascript
const API_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";
```

### 5. Test the Setup
1. Open `login.html` in your browser
2. Login with any credentials (admin/admin)
3. Create a new bill and save it
4. Check your Google Sheet - you should see data in the "Bills" and "Payments" sheets

## 📊 Google Sheets Structure

The system creates these sheets automatically:

### Bills Sheet
- **Bill No**: Invoice number
- **Date**: Bill date
- **Customer Name**: Customer name
- **Customer Phone**: Customer phone number
- **Payment Type**: CASH or UPI
- **Subtotal**: Amount before GST
- **Total**: Final amount with GST
- **Items**: Itemized list as text
- **Timestamp**: When bill was saved

### Payments Sheet
- **Date**: Payment date
- **Bill No**: Reference to bill
- **Customer Name**: Customer name
- **Customer Phone**: Customer phone number
- **Amount**: Payment amount
- **Payment Method**: CASH or UPI
- **Notes**: Additional notes
- **Timestamp**: When payment was recorded

### Customers Sheet
- **Customer Name**: Full customer name
- **Phone**: Customer phone number
- **First Bill Date**: Date of first purchase
- **Last Bill Date**: Date of most recent purchase
- **Total Bills**: Number of bills/invoices
- **Total Amount**: Total amount spent
- **Timestamp**: When customer record was last updated

## 🔧 Features

- ✅ **Bill Creation**: Save invoices with customer details, items, and GST calculation
- ✅ **Customer Management**: Automatic customer database with contact info and purchase history
- ✅ **UPI QR Codes**: Generate exact amount QR codes for payments
- ✅ **Invoice Printing**: Professional thermal receipt and PDF printing
- ✅ **Bill History**: Search and view all saved bills
- ✅ **Payment Tracking**: View daily payments with filtering
- ✅ **Monthly Analysis**: Sales reports by month
- ✅ **Customer Database**: Complete customer management with search and analytics
- ✅ **Responsive Design**: Works on mobile, tablet, and desktop
- ✅ **Google Sheets Integration**: All data stored in Google Sheets

## 🛠️ Troubleshooting

### CORS Issues
If you get CORS errors, make sure your Web App is deployed with "Anyone" access.

### Data Not Saving
1. Check that your Web App URL is correct in all JS files
2. Verify the Google Apps Script is deployed and running
3. Check the Google Sheet has the correct permissions

### Script Errors
1. Open the Apps Script editor
2. Check the execution logs for errors
3. Make sure all functions are properly defined

## 📱 Usage

1. **Login**: Use any username/password (currently no authentication)
2. **Create Bills**: Add customer details, items, calculate totals
3. **Generate QR**: UPI QR codes for exact payment amounts
4. **Print Invoices**: Thermal receipts or PDF downloads
5. **View Reports**: Check bills, payments, and monthly analysis
6. **Manage Customers**: View customer database, search by name/phone, see purchase history

## 🔒 Security Note

Currently, the system has no authentication. For production use, consider:
- Adding user authentication
- Restricting Web App access to specific users
- Implementing data validation
- Adding backup procedures

## 📞 Support

For issues with Google Apps Script setup:
1. Check the [Apps Script documentation](https://developers.google.com/apps-script)
2. Verify your Google account has Apps Script enabled
3. Test with a simple "Hello World" script first

---

**Business Details:**
- **Shop**: Ramu Saree Showroom
- **Address**: Ramu(Para Military) Lakshmi Complex, Medapadu
- **Phone**: 88858 78767
- **UPI ID**: 9177452433@ybl
- **GST**: 5% (configurable)</content>
<parameter name="filePath">c:\Users\javva\MANDHE\README.md"# rs-showroom" 
