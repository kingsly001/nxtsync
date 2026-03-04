const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const cloudinary = require('cloudinary').v2;

// Cloudinary Configuration
cloudinary.config({
    cloud_name: 'dpn8wwgmp',
    api_key: '268669986285641',
    api_secret: '2WUaIat03G_E5hTI8WUua4fIBMI'
});

const generateCertificate = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 🟢 1. Setup File Path
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

            // 🎨 2. Full SVG Background Implementation (from example.html)
            doc.save();
            // Top Right Corner Group
            doc.path("M 545 0 C 646 38 800 -32 841.89 15 L 841.89 0 Z").fill('#248e43');
            doc.path("M 745 0 C 707 13 640 13 574 8 C 670 34 797 2 841.89 28 L 841.89 0 Z").fill('#0e491d');
            doc.path("M 841.89 24 C 761 7 715 15 695 20 C 747 19 795 22 841.89 41 Z").fill('#fff6cf');
            doc.path("M 841.05 41 C 799 19 738 17 727 22 C 767 27 806 35 841.05 58 Z").fill('#f8bc00');

            // Bottom Right Corner Group
            doc.path("M 841.89 420 C 656 610 330 570 226 554 C 246 568 271 585 286 595.28 L 841.89 595.28 Z").fill('#fff6cf');
            doc.path("M 841.89 466 C 655 602 423 607 239 563 C 282 579 314 585 366 594 L 841.89 595.28 Z").fill('#f8bc00');
            doc.path("M 841.89 489 C 609 657 287 588 244 566 C 260 578 269 582 289 595.28 L 841.89 595.28 Z").fill('#0e491d');
            doc.path("M 841.89 543 C 807 565 751 582 707 595.28 L 841.89 595.28 Z").fill('#248e43');

            // Bottom Left Corner Group
            doc.path("M 0 297 C 44 388 176 536 286 595.28 L 0 595.28 Z").fill('#fff6cf');
            doc.path("M 0 339 C 34 404 161 540 274 595.28 L 0 595.28 Z").fill('#f8bc00');
            doc.path("M 0 372 C 34 432 160 551 265 595.28 L 0 595.28 Z").fill('#248e43');
            doc.path("M 0 531 C 29 550 77 574 139 595.28 L 0 595.28 Z").fill('#0e491d');
            doc.restore();

            const assetsPath = path.join(__dirname, '..', 'assets');

            // 🏢 3. Image Alignment (Respecting dimensions)
            if (fs.existsSync(path.join(assetsPath, 'logo.jpg'))) {
                doc.image(path.join(assetsPath, 'logo.jpg'), 35, 30, { width: 160 });
            }
            if (fs.existsSync(path.join(assetsPath, 'ISO1.png'))) {
                doc.image(path.join(assetsPath, 'ISO1.png'), 35, 140, { width: 140 });
            }
            if (fs.existsSync(path.join(assetsPath, 'AICTE.png'))) {
                doc.image(path.join(assetsPath, 'AICTE.png'), 670, 140, { width: 130 });
            }

            // 📝 4. Text Content (Manual Y-tracking to prevent overlap)
            let currentY = 135; 

            doc.fillColor('#0e491d').font('Times-Bold').fontSize(38)
               .text('INTERNSHIP COMPLETION', 0, currentY, { align: 'center' });
            currentY += 42;
            doc.text('CERTIFICATE', 0, currentY, { align: 'center' });
            
            // Divider
            currentY += 45;
            doc.moveTo(220, currentY).lineTo(620, currentY).lineWidth(2).stroke('#0e491d');

            // Student Name (Dynamic)
            currentY += 40;
            doc.font('Times-Italic').fontSize(64).fillColor('#b89c6d')
               .text(data.studentName.toUpperCase(), 0, currentY, { align: 'center', underline: true });
            
            // Body Text
            currentY += 95;
            doc.font('Helvetica').fontSize(20).fillColor('#333');
            const bodyLine1 = `has successfully completed the internship ${data.courseName} conducted by`;
            const bodyLine2 = `Nxtsync from ${data.startDate} to ${data.endDate}.`;

            doc.text(bodyLine1, 100, currentY, { width: 641, align: 'center' });
            currentY += 32;
            doc.text(bodyLine2, 100, currentY, { width: 641, align: 'center' });

            // 🖋️ 5. Footer: CEO Sign | QR | COO Sign
            const footerY = 485;

            // CEO Section
            if (fs.existsSync(path.join(assetsPath, 'ceo_sign.png'))) {
                doc.image(path.join(assetsPath, 'ceo_sign.png'), 100, footerY - 45, { width: 110 });
            }
            doc.font('Helvetica-Bold').fontSize(18).fillColor('#000').text('CEO', 100, footerY + 30, { width: 110, align: 'center' });

            // Dynamic QR Code
            const verifyUrl = `https://nxtsync.onrender.com/verify.html?id=${data.certificateId}`;
            const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1 });
            doc.image(qrDataUrl, (841.89 / 2) - 45, footerY - 30, { width: 90 });

            // COO Section
            if (fs.existsSync(path.join(assetsPath, 'coo_sign.png'))) {
                doc.image(path.join(assetsPath, 'coo_sign.png'), 630, footerY - 45, { width: 80 });
            }
            doc.font('Helvetica-Bold').fontSize(18).fillColor('#000').text('COO', 630, footerY + 30, { width: 80, align: 'center' });

            doc.end();

            // ☁️ 6. Cloudinary Upload
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