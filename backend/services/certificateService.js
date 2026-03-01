const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const generateCertificate = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({
                layout: 'landscape',
                size: 'A4',
                margin: 0
            });

            // Filename management
            const fileName = `${data.certificateId}.pdf`;
            const folderPath = path.join(__dirname, '../public/certificates');
            if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

            const filePath = path.join(folderPath, fileName);
            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            const assetsPath = path.join(__dirname, '../../frontend/assets');

            /**
             * Safe Image Loader to prevent "Unknown image format" crashes
             * Ensures images exist and are compatible (JPG/PNG only)
             */
            const addImageSafely = (imageName, x, y, options) => {
                const imgPath = path.join(assetsPath, imageName);
                if (fs.existsSync(imgPath)) {
                    try {
                        doc.image(imgPath, x, y, options);
                    } catch (err) {
                        console.error(`⚠️ PDFKit Error loading ${imageName}:`, err.message);
                    }
                } else {
                    console.warn(`⚠️ Asset missing: ${imageName}`);
                }
            };

            // --- 1. BACKGROUND DESIGN (Green & Gold Curves) ---
            
            // Top Right Dark Green Curve
            doc.save()
               .moveTo(600, 0)
               .quadraticCurveTo(750, 50, 841.89, 180)
               .lineTo(841.89, 0)
               .fill('#006837');

            // Bottom Left Dark Green Design
            doc.save()
               .moveTo(0, 420)
               .quadraticCurveTo(120, 500, 280, 595.28)
               .lineTo(0, 595.28)
               .fill('#006837');

            // Bottom Right Gold Accent
            doc.save()
               .moveTo(550, 595.28)
               .quadraticCurveTo(720, 520, 841.89, 480)
               .lineTo(841.89, 595.28)
               .fill('#fbb03b');

            // --- 2. LOGOS & BADGES ---

            // Main Company Logo (Top Left)
            addImageSafely('logo.jpg', 50, 40, { width: 140 });

            // Quality Accreditation Badges (Center Sides)
            addImageSafely('ISO1.png', 50, 240, { width: 90 });
            addImageSafely('AICTE.png', 700, 240, { width: 90 }); 

            // --- 3. TEXT CONTENT ---

            // Main Title
            doc.fillColor('#1a3d31')
               .font('Helvetica-Bold')
               .fontSize(36)
               .text('INTERNSHIP COMPLETION', 0, 210, { align: 'center' });
            
            doc.text('CERTIFICATE', 0, 255, { align: 'center' });

            // Decorative Line
            doc.moveTo(280, 305).lineTo(560, 305).lineWidth(2).strokeColor('#1a3d31').stroke();

            // Student Name
            doc.fillColor('#a1824a')
               .font('Times-BoldItalic')
               .fontSize(42)
               .text(data.studentName.toUpperCase(), 0, 360, { align: 'center' });

            // Internship Body Text
            doc.fillColor('#333333')
               .font('Helvetica')
               .fontSize(16)
               .text('has successfully completed the internship program in the domain of', 0, 440, { align: 'center' });
            
            doc.font('Helvetica-Bold')
               .text(data.courseName, { align: 'center' });

            // --- 4. DYNAMIC QR CODE ---
            const qrSize = 85;
            const qrX = (841.89 / 2) - (qrSize / 2);
            const qrY = 490;

            try {
                // Pointing to your verification HTML page
                const verifyUrl = `${process.env.FRONTEND_URL}/verify.html?id=${data.certificateId}`;
                const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1 });
                doc.image(qrDataUrl, qrX, qrY, { width: qrSize });
                
                // Fine Border for QR
                doc.rect(qrX, qrY, qrSize, qrSize).lineWidth(0.5).strokeColor('#cccccc').stroke();
            } catch (qrErr) {
                console.error("QR Generation Error:", qrErr);
            }

            // --- 5. SIGNATORIES & FOOTER ---
            
            doc.fontSize(12).fillColor('#333333').font('Helvetica-Bold');
            
            // CEO Signature Line
            doc.moveTo(150, 550).lineTo(300, 550).lineWidth(1).strokeColor('#333').stroke();
            doc.text('MANAGING DIRECTOR', 150, 560, { width: 150, align: 'center' });

            // COO/Director Signature Line
            doc.moveTo(540, 550).lineTo(690, 550).stroke();
            doc.text('ACADEMIC DIRECTOR', 540, 560, { width: 150, align: 'center' });

            doc.end();
            
            writeStream.on('finish', () => resolve(`/certificates/${fileName}`));
            writeStream.on('error', (err) => reject(err));

        } catch (error) {
            console.error("Certificate PDF Gen Failure:", error);
            reject(error);
        }
    });
};

module.exports = { generateCertificate };