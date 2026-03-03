const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const cloudinary = require('cloudinary').v2;

// 🟢 CLOUDINARY CONFIGURATION
cloudinary.config({
    cloud_name: 'dpn8wwgmp',
    api_key: '268669986285641',
    api_secret: '2WUaIat03G_E5hTI8WUua4fIBMI'
});

// backend/services/certificateService.js

const generateCertificate = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margin: 0 
            });

            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // 🎨 1. BACKGROUND DESIGN (Green & Gold Curves)
            // Top-Right Dark Green Curve
            doc.save().moveTo(600, 0)
               .quadraticCurveTo(750, 50, 841.89, 180)
               .lineTo(841.89, 0).fill('#006837');

            // Bottom-Left Dark Green Curve
            doc.save().moveTo(0, 420)
               .quadraticCurveTo(120, 500, 280, 595.28)
               .lineTo(0, 595.28).fill('#006837');

            // Bottom-Right Gold Accent Curve
            doc.save().moveTo(550, 595.28)
               .quadraticCurveTo(720, 520, 841.89, 480)
               .lineTo(841.89, 595.28).fill('#fbb03b');

            const assetsPath = path.join(__dirname, '..', 'assets');

            // 🏛️ 2. TOP HEADER: ISO (Left) & AICTE (Right)
            if (fs.existsSync(path.join(assetsPath, 'ISO1.png'))) {
                doc.image(path.join(assetsPath, 'ISO1.png'), 40, 30, { width: 70 });
            }
            if (fs.existsSync(path.join(assetsPath, 'AICTE.png'))) {
                doc.image(path.join(assetsPath, 'AICTE.png'), 730, 30, { width: 70 });
            }

            // 🏢 3. CENTER LOGO
            if (fs.existsSync(path.join(assetsPath, 'logo.jpg'))) {
                doc.image(path.join(assetsPath, 'logo.jpg'), (841.89 / 2) - 80, 40, { width: 160 });
            }

            // 📝 4. MAIN CONTENT
            doc.moveDown(9);
            doc.font('Helvetica-Bold').fontSize(38).fillColor('#1a3d31').text('CERTIFICATE', { align: 'center' });
            doc.font('Helvetica').fontSize(16).fillColor('#333').text('OF APPRECIATION', { align: 'center', characterSpacing: 2 });
            
            doc.moveDown(2);
            doc.fontSize(14).fillColor('#666').text('THIS CERTIFICATE IS PROUDLY PRESENTED TO', { align: 'center' });
            
            doc.moveDown(1);
            doc.font('Helvetica-Bold').fontSize(34).fillColor('#a1824a').text(data.studentName.toUpperCase(), { align: 'center' });
            
            doc.moveDown(1.5);
            doc.font('Helvetica').fontSize(14).fillColor('#333').text('Has successfully completed the internship program in the domain of', { align: 'center' });
            doc.font('Helvetica-Bold').fontSize(20).text(data.courseName, { align: 'center' });

            // 🖋️ 5. FOOTER: CEO SIGN | QR CODE | COO SIGN
            const footerY = 480;

            // CEO (Left)
            if (fs.existsSync(path.join(assetsPath, 'ceo_sign.png'))) {
                doc.image(path.join(assetsPath, 'ceo_sign.png'), 80, footerY - 20, { width: 110 });
            }
            doc.font('Helvetica-Bold').fontSize(11).fillColor('#1a3d31').text('_________________', 80, footerY + 50);
            doc.text('CHIEF EXECUTIVE OFFICER', 80, footerY + 65);

            // QR Code (Center)
            const verifyUrl = `https://nxtsync.in/verify?id=${data.certificateId}`;
            const qrDataUrl = await QRCode.toDataURL(verifyUrl);
            doc.image(qrDataUrl, (841.89 / 2) - 40, footerY - 15, { width: 80 });
            doc.fontSize(9).text('VERIFY ONLINE', (841.89 / 2) - 40, footerY + 70, { width: 80, align: 'center' });

            // COO (Right)
            if (fs.existsSync(path.join(assetsPath, 'coo_sign.png'))) {
                doc.image(path.join(assetsPath, 'coo_sign.png'), 650, footerY - 20, { width: 110 });
            }
            doc.font('Helvetica-Bold').fontSize(11).text('_________________', 650, footerY + 50);
            doc.text('CHIEF OPERATING OFFICER', 650, footerY + 65);

            doc.end();
            // ... (Cloudinary logic remains exactly the same)
            
            writeStream.on('finish', async () => {
                try {
// Inside writeStream.on('finish', ...) in certificateService.js
const result = await cloudinary.uploader.upload(filePath, {
    folder: 'certificates',
    public_id: data.certificateId,
    resource_type: 'image', // Required for browser rendering
    format: 'pdf',
    type: 'upload',         // 🟢 This makes the link public
    access_mode: 'public',  // 🟢 Explicitly removes 401 restrictions
    invalidate: true,
    // 🟢 ADD THIS: Prevents Cloudinary from applying "authenticated" logic
    delivery_type: 'upload' 
});

                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    resolve(result.secure_url); 
                } catch (uploadErr) {
                    reject(uploadErr);
                }
            });

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateCertificate };