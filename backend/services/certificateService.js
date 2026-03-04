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

            // 🎨 1. TRANSLATED SVG BACKGROUND PATHS (From example.html)
            // Top Right Corner Layers
            doc.save().moveTo(545, 0).quadraticCurveTo(645, 38, 841.89, 15).lineTo(841.89, 0).fill('#248e43');
            doc.save().moveTo(575, 0).quadraticCurveTo(640, 34, 841.89, 28).lineTo(841.89, 0).fill('#0e491d');
            
            // Bottom Left Corner Layers
            doc.save().moveTo(0, 295).quadraticCurveTo(176, 532, 286, 595.28).lineTo(0, 595.28).fill('#fff6cf');
            doc.save().moveTo(0, 337).quadraticCurveTo(161, 536, 274, 595.28).lineTo(0, 595.28).fill('#f8bc00');
            doc.save().moveTo(0, 370).quadraticCurveTo(160, 548, 265, 595.28).lineTo(0, 595.28).fill('#248e43');
            doc.save().moveTo(0, 528).quadraticCurveTo(77, 571, 139, 595.28).lineTo(0, 595.28).fill('#0e491d');

            const assetsPath = path.join(__dirname, '..', 'assets');

            // 🏢 2. LOGOS (NXT SYNC, ISO, AICTE)
            if (fs.existsSync(path.join(assetsPath, 'logo.jpg'))) {
                doc.image(path.join(assetsPath, 'logo.jpg'), 35, 30, { width: 160 });
            }
            if (fs.existsSync(path.join(assetsPath, 'ISO1.png'))) {
                doc.image(path.join(assetsPath, 'ISO1.png'), 35, 160, { width: 140 });
            }
            if (fs.existsSync(path.join(assetsPath, 'AICTE.png'))) {
                doc.image(path.join(assetsPath, 'AICTE.png'), 666, 160, { width: 140 });
            }

            // 📝 3. MAIN TEXT CONTENT
            doc.moveDown(8.5);
            doc.font('Times-Bold').fontSize(38).fillColor('#0e491d').text('INTERNSHIP COMPLETION', { align: 'center' });
            doc.text('CERTIFICATE', { align: 'center' });
            
            // Green Divider Line
            doc.strokeColor('#0e491d').lineWidth(3).moveTo(220, 265).lineTo(621, 265).stroke();

            // Student Name (Dynamic)
            doc.moveDown(1.5);
            doc.font('Times-Italic').fontSize(56).fillColor('#b89c6d').text(data.studentName.toUpperCase(), { align: 'center', underline: true });
            
            // Description Body
            doc.moveDown(1.2);
            doc.font('Helvetica').fontSize(18).fillColor('#333').text('has successfully completed the internship ', { align: 'center', continued: true });
            doc.font('Helvetica-Bold').text(data.courseName, { continued: true });
            doc.font('Helvetica').text(' conducted by');
            
            doc.font('Helvetica-Bold').text('Nxtsync', { align: 'center', continued: true });
            doc.font('Helvetica').text(` from `, { continued: true });
            doc.font('Helvetica-Bold').text(`${data.startDate}`, { continued: true });
            doc.font('Helvetica').text(` to `, { continued: true });
            doc.font('Helvetica-Bold').text(`${data.endDate}.`);

            // 🖋️ 4. FOOTER: CEO | QR | COO
            const footerY = 490;

            // CEO Section
            if (fs.existsSync(path.join(assetsPath, 'ceo_sign.png'))) {
                doc.image(path.join(assetsPath, 'ceo_sign.png'), 100, footerY - 40, { width: 120 });
            }
            doc.font('Helvetica-Bold').fontSize(16).fillColor('#000').text('CEO', 100, footerY + 35, { width: 120, align: 'center' });

            // Dynamic QR Code
            const verifyUrl = `https://nxtsync.onrender.com/verify.html?id=${data.certificateId}`;
            const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1 });
            doc.image(qrDataUrl, (841.89 / 2) - 45, footerY - 25, { width: 90 });

            // COO Section
            if (fs.existsSync(path.join(assetsPath, 'coo_sign.png'))) {
                doc.image(path.join(assetsPath, 'coo_sign.png'), 621, footerY - 40, { width: 120 });
            }
            doc.font('Helvetica-Bold').fontSize(16).fillColor('#000').text('COO', 621, footerY + 35, { width: 120, align: 'center' });

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