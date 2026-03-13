const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Ensure invoices directory exists
const invoicesDir = path.join(__dirname, '../../invoices');
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

// Generate invoice PDF
const generateInvoice = async (billing, patient, doctor, appointment) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Generate filename
      const filename = `invoice-${billing.invoiceNumber}.pdf`;
      const filepath = path.join(invoicesDir, filename);
      
      // Pipe the PDF to a file
      doc.pipe(fs.createWriteStream(filepath));

      // Add clinic header
      addHeader(doc);
      
      // Add invoice details
      addInvoiceDetails(doc, billing, patient, doctor, appointment);
      
      // Add services table
      addServicesTable(doc, billing.services);
      
      // Add totals
      addTotals(doc, billing);
      
      // Add footer
      addFooter(doc);
      
      // Finalize the PDF
      doc.end();
      
      // Wait for the PDF to be written
      doc.on('end', () => {
        resolve(filepath);
      });
      
      doc.on('error', (error) => {
        reject(error);
      });
      
    } catch (error) {
      reject(error);
    }
  });
};

// Add clinic header
const addHeader = (doc) => {
  // Clinic logo area (you can add an actual logo here)
  doc.fontSize(24)
     .fillColor('#2563eb')
     .text('SILOAM DENTAL & EYE CLINIC', 50, 50);
  
  // Clinic details
  doc.fontSize(10)
     .fillColor('#666666')
     .text('Professional Healthcare Services', 50, 80)
     .text('Phone: +254 700 000 000', 50, 95)
     .text('Email: info@siloamclinic.co.ke', 50, 110)
     .text('Address: Nairobi, Kenya', 50, 125);
  
  // Invoice title
  doc.fontSize(20)
     .fillColor('#000000')
     .text('INVOICE', 400, 50);
  
  // Add a line separator
  doc.moveTo(50, 150)
     .lineTo(550, 150)
     .strokeColor('#cccccc')
     .stroke();
};

// Add invoice details
const addInvoiceDetails = (doc, billing, patient, doctor, appointment) => {
  const startY = 170;
  
  // Invoice information (left side)
  doc.fontSize(12)
     .fillColor('#000000')
     .text('Invoice Number:', 50, startY)
     .text(billing.invoiceNumber, 150, startY)
     .text('Invoice Date:', 50, startY + 20)
     .text(new Date(billing.createdAt).toLocaleDateString('en-GB'), 150, startY + 20)
     .text('Payment Status:', 50, startY + 40)
     .text(billing.paymentStatus.toUpperCase(), 150, startY + 40);
  
  // Patient information (right side)
  doc.text('Bill To:', 350, startY)
     .text(patient.fullName, 350, startY + 20)
     .text(patient.email, 350, startY + 40)
     .text(patient.phone, 350, startY + 60)
     .text(patient.address, 350, startY + 80, { width: 150 });
  
  // Appointment details
  const appointmentY = startY + 120;
  doc.text('Appointment Details:', 50, appointmentY)
     .text(`Doctor: Dr. ${doctor.name}`, 50, appointmentY + 20)
     .text(`Specialization: ${doctor.specialization}`, 50, appointmentY + 40)
     .text(`Date: ${new Date(appointment.date).toLocaleDateString('en-GB')}`, 50, appointmentY + 60)
     .text(`Time: ${appointment.time}`, 50, appointmentY + 80);
};

// Add services table
const addServicesTable = (doc, services) => {
  const tableTop = 380;
  const itemCodeX = 50;
  const descriptionX = 150;
  const quantityX = 350;
  const priceX = 400;
  const amountX = 480;
  
  // Table header
  doc.fontSize(12)
     .fillColor('#000000');
  
  // Header background
  doc.rect(50, tableTop, 500, 25)
     .fillColor('#f3f4f6')
     .fill();
  
  // Header text
  doc.fillColor('#000000')
     .text('Item', itemCodeX, tableTop + 8)
     .text('Description', descriptionX, tableTop + 8)
     .text('Qty', quantityX, tableTop + 8)
     .text('Price (KES)', priceX, tableTop + 8)
     .text('Amount (KES)', amountX, tableTop + 8);
  
  // Table rows
  let currentY = tableTop + 25;
  
  services.forEach((service, index) => {
    const y = currentY + (index * 25);
    
    // Alternate row background
    if (index % 2 === 1) {
      doc.rect(50, y, 500, 25)
         .fillColor('#f9fafb')
         .fill();
    }
    
    doc.fillColor('#000000')
       .fontSize(10)
       .text((index + 1).toString(), itemCodeX, y + 8)
       .text(service.name, descriptionX, y + 8, { width: 180 })
       .text('1', quantityX, y + 8)
       .text(service.cost.toLocaleString(), priceX, y + 8)
       .text(service.cost.toLocaleString(), amountX, y + 8);
  });
  
  // Table border
  doc.rect(50, tableTop, 500, 25 + (services.length * 25))
     .strokeColor('#cccccc')
     .stroke();
};

// Add totals section
const addTotals = (doc, billing) => {
  const totalY = 450 + (billing.services.length * 25);
  
  // Subtotal
  const subtotal = billing.totalAmount;
  const tax = 0; // No tax for now
  const total = billing.totalAmount;
  
  doc.fontSize(12)
     .text('Subtotal:', 400, totalY)
     .text(`KES ${subtotal.toLocaleString()}`, 480, totalY)
     .text('Tax (0%):', 400, totalY + 20)
     .text(`KES ${tax.toLocaleString()}`, 480, totalY + 20);
  
  // Total line
  doc.moveTo(400, totalY + 35)
     .lineTo(550, totalY + 35)
     .strokeColor('#000000')
     .stroke();
  
  doc.fontSize(14)
     .fillColor('#000000')
     .text('Total:', 400, totalY + 45)
     .text(`KES ${total.toLocaleString()}`, 480, totalY + 45);
  
  // Payment status
  const statusColor = billing.paymentStatus === 'paid' ? '#10b981' : '#f59e0b';
  doc.fontSize(12)
     .fillColor(statusColor)
     .text(`Status: ${billing.paymentStatus.toUpperCase()}`, 400, totalY + 75);
};

// Add footer
const addFooter = (doc) => {
  const footerY = 700;
  
  // Footer line
  doc.moveTo(50, footerY)
     .lineTo(550, footerY)
     .strokeColor('#cccccc')
     .stroke();
  
  // Footer text
  doc.fontSize(10)
     .fillColor('#666666')
     .text('Thank you for choosing Siloam Dental & Eye Clinic!', 50, footerY + 15)
     .text('For any inquiries, please contact us at info@siloamclinic.co.ke', 50, footerY + 30)
     .text('This is a computer-generated invoice.', 50, footerY + 45);
  
  // Page number
  doc.text(`Page 1 of 1`, 480, footerY + 15);
};

// Generate receipt (simpler version of invoice)
const generateReceipt = async (billing, patient, doctor) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: [300, 600] }); // Smaller receipt size
      
      const filename = `receipt-${billing.invoiceNumber}.pdf`;
      const filepath = path.join(invoicesDir, filename);
      
      doc.pipe(fs.createWriteStream(filepath));

      // Receipt header
      doc.fontSize(16)
         .text('SILOAM CLINIC', 50, 50, { align: 'center' })
         .fontSize(10)
         .text('RECEIPT', 50, 80, { align: 'center' })
         .text('------------------------', 50, 100, { align: 'center' });
      
      // Receipt details
      let y = 120;
      doc.text(`Receipt #: ${billing.invoiceNumber}`, 50, y)
         .text(`Date: ${new Date().toLocaleDateString()}`, 50, y + 15)
         .text(`Patient: ${patient.fullName}`, 50, y + 30)
         .text(`Doctor: Dr. ${doctor.name}`, 50, y + 45)
         .text('------------------------', 50, y + 65, { align: 'center' });
      
      // Services
      y += 85;
      billing.services.forEach((service, index) => {
        doc.text(`${service.name}`, 50, y + (index * 15))
           .text(`KES ${service.cost.toLocaleString()}`, 200, y + (index * 15));
      });
      
      // Total
      y += billing.services.length * 15 + 15;
      doc.text('------------------------', 50, y, { align: 'center' })
         .fontSize(12)
         .text(`TOTAL: KES ${billing.totalAmount.toLocaleString()}`, 50, y + 15, { align: 'center' })
         .fontSize(10)
         .text('------------------------', 50, y + 35, { align: 'center' })
         .text('Thank you!', 50, y + 55, { align: 'center' });
      
      doc.end();
      
      doc.on('end', () => {
        resolve(filepath);
      });
      
      doc.on('error', (error) => {
        reject(error);
      });
      
    } catch (error) {
      reject(error);
    }
  });
};

// Delete PDF file
const deletePDF = (filepath) => {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting PDF:', error);
    return false;
  }
};

module.exports = {
  generateInvoice,
  generateReceipt,
  deletePDF
};