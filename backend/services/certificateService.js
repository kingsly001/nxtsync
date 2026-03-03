const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dpn8wwgmp',
    api_key: '268669986285641',
    api_secret: '2WUaIat03G_E5hTI8WUua4fIBMI'
});

const generateCertificate = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 🟢 FIX: Define filePath at the very start
            const fileName = `${data.certificateId}.pdf`;
            const folderPath = path.join(process.cwd(), 'public', 'certificates');
            if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
            const filePath = path.join(folderPath, fileName);

            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margin: 0 
            });

            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // 🎨 1. BACKGROUND DESIGN (Matching Green & Gold Curves)
            // Top-Right Dark Green Curve
            doc.save().moveTo(500, 0)
               .quadraticCurveTo(700, 30, 841.89, 150)
               .lineTo(841.89, 0).fill('#1a3d31');

            // Bottom-Left Multi-Layer Green Curve
            doc.save().moveTo(0, 350)
               .quadraticCurveTo(150, 450, 350, 595.28)
               .lineTo(0, 595.28).fill('#1a3d31');

            // Gold Accent Stripe (Matching the image "seal" background style)
            doc.save().moveTo(0, 420)
               .quadraticCurveTo(100, 480, 250, 595.28)
               .lineTo(0, 595.28).fill('#a1824a');

            const assetsPath = path.join(__dirname, '..', 'assets');

            // 🏛️ 2. TOP HEADER: ISO (Left) & AICTE (Right)
            if (fs.existsSync(path.join(assetsPath, 'ISO1.png'))) {
                doc.image(path.join(assetsPath, 'ISO1.png'), 40, 40, { width: 90 });
            }
            if (fs.existsSync(path.join(assetsPath, 'AICTE.png'))) {
                doc.image(path.join(assetsPath, 'AICTE.png'), 710, 40, { width: 90 });
            }

            // 🏢 3. CENTER LOGO
            if (fs.existsSync(path.join(assetsPath, 'logo.jpg'))) {
                doc.image(path.join(assetsPath, 'logo.jpg'), (841.89 / 2) - 80, 30, { width: 160 });
            }

            // 📝 4. MAIN CONTENT (Pixel Clear Alignment)
            doc.moveDown(8);
            doc.font('Helvetica-Bold').fontSize(32).fillColor('#1a3d31').text('INTERNSHIP COMPLETION', { align: 'center' });
            doc.moveDown(0.2);
            doc.fontSize(32).text('CERTIFICATE', { align: 'center' });
            
            doc.moveDown(1.5);
            doc.font('Helvetica-Bold').fontSize(36).fillColor('#a1824a').text(data.studentName.toUpperCase(), { align: 'center' });
            
            doc.moveDown(1.5);
            doc.font('Helvetica').fontSize(14).fillColor('#000').text(`has successfully completed the internship Artificial Intelligence conducted by`, { align: 'center' });
            doc.font('Helvetica-Bold').fontSize(14).text(`Nxtsync from ${data.startDate || '2025-11-24'} to ${data.endDate || '2026-03-31'}.`, { align: 'center' });

            // 🖋️ 5. FOOTER: CEO SIGN | QR CODE | COO SIGN
            const footerY = 480;

            // CEO (Left)
            if (fs.existsSync(path.join(assetsPath, 'ceo_sign.png'))) {
                doc.image(path.join(assetsPath, 'ceo_sign.png'), 250, footerY - 30, { width: 100 });
            }
            doc.font('Helvetica-Bold').fontSize(12).fillColor('#333').text('CEO', 285, footerY + 45);

            // QR Code (Center)
            const verifyUrl = `https://nxtsync.onrender.com/verify.html?id=${data.certificateId}`;
            const qrDataUrl = await QRCode.toDataURL(verifyUrl);
            doc.image(qrDataUrl, (841.89 / 2) - 40, footerY - 25, { width: 80 });

            // COO (Right)
            if (fs.existsSync(path.join(assetsPath, 'coo_sign.png'))) {
                doc.image(path.join(assetsPath, 'coo_sign.png'), 500, footerY - 30, { width: 100 });
            }
            doc.font('Helvetica-Bold').fontSize(12).text('COO', 535, footerY + 45);

            doc.end();

            writeStream.on('finish', async () => {
                try {
                    const result = await cloudinary.uploader.upload(filePath, {
                        folder: 'certificates',
                        public_id: data.certificateId,
                        resource_type: 'image',
                        format: 'pdf',
                        type: 'upload',
                        access_mode: 'public',
                        invalidate: true,
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