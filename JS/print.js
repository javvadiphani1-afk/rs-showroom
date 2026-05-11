// ===== INVOICE PRINTING FUNCTIONALITY =====

/**
 * Print invoice in a new window
 * @param {Object} billData - Bill data object
 * Example: {
 *   billNo: "BIL-001",
 *   billDate: "11-05-2026",
 *   custName: "John Doe",
 *   custPhone: "+91 9876543210",
 *   subtotal: "₹1000.00",
 *   gst: "₹50.00",
 *   total: "₹1050.00",
 *   paymentMode: "Cash",
 *   items: [
 *     { description: "Silk Saree", qty: 1, rate: "₹500.00", total: "₹500.00" },
 *     { description: "Cotton Saree", qty: 1, rate: "₹500.00", total: "₹500.00" }
 *   ]
 * }
 */
function printInvoice(billData) {
  if (!billData) {
    alert('No bill data available');
    return;
  }

  // Prepare URL parameters
  const params = new URLSearchParams({
    billNo: billData.billNo || 'BIL-001',
    billDate: billData.billDate || new Date().toLocaleDateString('en-IN'),
    custName: billData.custName || 'Customer',
    custPhone: billData.custPhone || 'N/A',
    subtotal: billData.subtotal || '₹0.00',
    gst: billData.gst || '₹0.00',
    total: billData.total || '₹0.00',
    paymentMode: billData.paymentMode || 'Cash'
  });

  // Add items as JSON
  if (billData.items && Array.isArray(billData.items)) {
    params.append('items', encodeURIComponent(JSON.stringify(billData.items)));
  }

  // Open invoice in new window
  const invoiceUrl = `print/invoice-template.html?${params.toString()}`;
  const invoiceWindow = window.open(invoiceUrl, 'Invoice', 'width=900,height=700');

  if (!invoiceWindow) {
    alert('Please allow pop-ups to print invoice');
  }
}

/**
 * Open print preview in new tab
 * @param {Object} billData - Bill data object
 */
function openInvoicePreview(billData) {
  printInvoice(billData);
}

/**
 * Quick print function (for thermal printer)
 * @param {Object} billData - Bill data object
 */
function quickPrint(billData) {
  // Send to thermal printer (you can integrate with your printer API here)
  printInvoice(billData);
}

/**
 * Export bill as PDF (can be integrated with libraries like jsPDF)
 * @param {Object} billData - Bill data object
 */
function exportAsPDF(billData) {
  if (typeof jsPDF === 'undefined') {
    alert('PDF export requires jsPDF library');
    console.log('Add this to your HTML: <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>');
    return;
  }

  // Create PDF (basic implementation)
  const doc = new jsPDF();
  
  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Ramu Saree Showroom', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('INVOICE', 105, 35, { align: 'center' });
  
  // Details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Invoice No: ${billData.billNo}`, 20, 50);
  doc.text(`Date: ${billData.billDate}`, 20, 60);
  
  // Customer
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 20, 75);
  doc.setFont('helvetica', 'normal');
  doc.text(`${billData.custName} | Phone: ${billData.custPhone}`, 20, 85);
  
  // Items Table (simplified)
  let yPosition = 100;
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 20, yPosition);
  doc.text('Qty', 100, yPosition);
  doc.text('Rate', 130, yPosition);
  doc.text('Amount', 160, yPosition);
  
  yPosition += 10;
  doc.setDrawColor(0, 0, 0);
  doc.line(20, yPosition - 2, 190, yPosition - 2);
  
  // Add items if provided
  if (billData.items && Array.isArray(billData.items)) {
    doc.setFont('helvetica', 'normal');
    billData.items.forEach(item => {
      doc.text(item.description || 'Item', 20, yPosition);
      doc.text(item.qty.toString(), 100, yPosition);
      doc.text(item.rate, 130, yPosition);
      doc.text(item.total, 160, yPosition);
      yPosition += 8;
    });
  }
  
  // Totals
  yPosition += 5;
  doc.line(20, yPosition - 2, 190, yPosition - 2);
  
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', 130, yPosition + 10);
  doc.text(billData.total, 160, yPosition + 10);
  
  // Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('Thank you for your business!', 105, 270, { align: 'center' });
  
  // Download
  doc.save(`Invoice-${billData.billNo}.pdf`);
}

/**
 * Print thermal receipt format (80mm width)
 * @param {Object} billData - Bill data object
 */
function printThermalReceipt(billData) {
  const receiptContent = `
    ====================================
           Ramu Saree Showroom
    ====================================
    
    Date: ${billData.billDate}
    Bill No: ${billData.billNo}
    
    Customer: ${billData.custName}
    Phone: ${billData.custPhone}
    
    ====================================
    ITEMS
    ====================================
    ${billData.items ? billData.items.map((item, i) => `
    ${i + 1}. ${item.description}
       Qty: ${item.qty} x Rate: ${item.rate}
       Amount: ${item.total}
    `).join('') : 'No items'}
    
    ====================================
    Subtotal:        ${billData.subtotal}
    GST (5%):        ${billData.gst}
    ====================================
    TOTAL:           ${billData.total}
    ====================================
    
    Payment Mode: ${billData.paymentMode}
    
    Thank you for your business!
    
    ====================================
  `;

  // Print in new window
  const printWindow = window.open('', '', 'width=400,height=600');
  printWindow.document.write(`
    <html>
      <head>
        <title>Thermal Receipt</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.4;
            margin: 0;
            padding: 10px;
            background: white;
          }
          pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
        </style>
      </head>
      <body>
        <pre>${receiptContent}</pre>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}
