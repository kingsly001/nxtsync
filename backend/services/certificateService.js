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

            // 🎨 1. FULL SVG BACKGROUND (From example.html)
            doc.save();
            doc.path("M 647 0 C 767 45 949 -38 999 18 L 1000 0 Z").fill('#248e43');
            doc.path("M 885 0 C 840 15 760 16 682 10 C 796 41 947 2 1000 34 L 1000 0 Z").fill('#0e491d');
            doc.path("M 1000 29 C 904 8 849 18 826 24 C 887 23 945 26 1000 49 Z").fill('#fff6cf');
            doc.path("M 999 49 C 949 23 877 20 864 26 C 912 32 958 42 999 69 Z").fill('#f8bc00');

            doc.path("M 1000 495 C 779 719 392 671 269 653 C 292 669 322 689 340 700 L 1000 700 Z").fill('#fff6cf');
            doc.path("M 1000 550 C 778 710 503 716 284 664 C 335 682 373 689 435 699 L 1000 700 Z").fill('#f8bc00');
            doc.path("M 1000 577 C 724 775 341 693 290 667 C 309 681 320 686 343 701 L 1000 700 Z ").fill('#0e491d');
            doc.path("M 1000 640 C 959 666 892 686 840 700 L 1000 700 Z").fill('#248e43');

            doc.path("M 0 350 C 52 457 209 632 340 700 L 0 700 Z").fill('#fff6cf');
            doc.path("M 0 400 C 40 476 191 636 325 700 L 0 700 Z").fill('#f8bc00');
            doc.path("M 0 439 C 41 509 190 650 315 700 L 0 700 Z").fill('#248e43');
            doc.path("M 0 627 C 35 649 92 677 165 700 L 0 700 Z").fill('#0e491d');
            doc.restore();

            const assetsPath = path.join(__dirname, '..', 'assets');

            // 🏢 2. IMAGES (Alignment & Sizing)
            if (fs.existsSync(path.join(assetsPath, 'logo.jpg'))) {
                doc.image(path.join(assetsPath, 'logo.jpg'), 35, 30, { width: 160 });
            }
            if (fs.existsSync(path.join(assetsPath, 'ISO1.png'))) {
                doc.image(path.join(assetsPath, 'ISO1.png'), 35, 140, { width: 140 });
            }
            if (fs.existsSync(path.join(assetsPath, 'AICTE.png'))) {
                doc.image(path.join(assetsPath, 'AICTE.png'), 670, 140, { width: 130 });
            }

            // 📝 3. TEXT SECTION (Manual Tracking)
            let currentY = 135; 

            doc.fillColor('#0e491d').font('Times-Bold').fontSize(36)
               .text('INTERNSHIP COMPLETION', 0, currentY, { align: 'center' });
            currentY += 42;
            doc.text('CERTIFICATE', 0, currentY, { align: 'center' });
            
            currentY += 45;
            doc.moveTo(220, currentY).lineTo(620, currentY).lineWidth(2).stroke('#0e491d');

            // 🟢 REDUCED NAME FONT (Was 64pt, now 50pt to prevent side overlap)
            currentY += 40;
            doc.font('Times-Italic').fontSize(50).fillColor('#b89c6d')
               .text(data.studentName.toUpperCase(), 0, currentY, { align: 'center', underline: true });
            
            // 🟢 REDUCED BODY FONT (Was 20pt, now 16pt for better alignment)
            currentY += 90;
            doc.font('Helvetica').fontSize(16).fillColor('#333');
            const bodyLine1 = `has successfully completed the internship ${data.courseName} conducted by`;
            const bodyLine2 = `Nxtsync from ${data.startDate} to ${data.endDate}.`;

            // Increased side padding (width 540) to keep text away from logos
            doc.text(bodyLine1, 150, currentY, { width: 541, align: 'center' });
            currentY += 28;
            doc.text(bodyLine2, 150, currentY, { width: 541, align: 'center' });

            // 🖋️ 4. FOOTER: CEO Sign | QR | COO Sign
            const footerY = 485;

            // 🟢 MOVED CEO TO RIGHT (Was X=100, now X=160 to enter white space)
            if (fs.existsSync(path.join(assetsPath, 'ceo_sign.png'))) {
                doc.image(path.join(assetsPath, 'ceo_sign.png'), 160, footerY - 45, { width: 110 });
            }
            doc.font('Helvetica-Bold').fontSize(18).fillColor('#000').text('CEO', 160, footerY + 30, { width: 110, align: 'center' });

            // QR Code (Stay Center)
            const verifyUrl = `https://nxtsync.onrender.com/verify.html?id=${data.certificateId}`;
            const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1 });
            doc.image(qrDataUrl, (841.89 / 2) - 45, footerY - 30, { width: 90 });

            // COO Section (Stay Right)
            if (fs.existsSync(path.join(assetsPath, 'coo_sign.png'))) {
                doc.image(path.join(assetsPath, 'coo_sign.png'), 630, footerY - 45, { width: 80 });
            }
            doc.font('Helvetica-Bold').fontSize(18).fillColor('#000').text('COO', 630, footerY + 30, { width: 80, align: 'center' });

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