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

// backend/services/certificateService.js
// backend/services/certificateService.js
const generateCertificate = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const fileName = `${data.certificateId}.pdf`;
            const folderPath = path.join(process.cwd(), 'public', 'certificates', fileName);
            const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // 🎨 1. FULL SVG LAYERING
            doc.save();
            // Top Right Corner Group
            doc.path("M 647 0 C 767 45 949 -38 999 18 L 1000 0 Z").fill('#248e43');
            doc.path("M 885 0 C 840 15 760 16 682 10 C 796 41 947 2 1000 34 L 1000 0 Z").fill('#0e491d');
            doc.path("M 1000 29 C 904 8 849 18 826 24 C 887 23 945 26 1000 49 Z").fill('#fff6cf');
            doc.path("M 999 49 C 949 23 877 20 864 26 C 912 32 958 42 999 69 Z").fill('#f8bc00');
            // Bottom Right Corner Group
            doc.path("M 1000 495 C 779 719 392 671 269 653 C 292 669 322 689 340 700 L 1000 700 Z").fill('#fff6cf');
            doc.path("M 1000 550 C 778 710 503 716 284 664 C 335 682 373 689 435 699 L 1000 700 Z").fill('#f8bc00');
            doc.path("M 1000 577 C 724 775 341 693 290 667 C 309 681 320 686 343 701 L 1000 700 Z ").fill('#0e491d');
            doc.path("M 1000 640 C 959 666 892 686 840 700 L 1000 700 Z").fill('#248e43');
            // Bottom Left Corner Group
            doc.path("M 0 350 C 52 457 209 632 340 700 L 0 700 Z").fill('#fff6cf');
            doc.path("M 0 400 C 40 476 191 636 325 700 L 0 700 Z").fill('#f8bc00');
            doc.path("M 0 439 C 41 509 190 650 315 700 L 0 700 Z").fill('#248e43');
            doc.path("M 0 627 C 35 649 92 677 165 700 L 0 700 Z").fill('#0e491d');
            doc.restore();

            // 📝 2. TEXT CONTENT WITH COORDINATE TRACKING
            let currentY = 135;
            doc.fillColor('#0e491d').font('Times-Bold').fontSize(36).text('INTERNSHIP COMPLETION', 0, currentY, { align: 'center' });
            currentY += 42;
            doc.text('CERTIFICATE', 0, currentY, { align: 'center' });
            currentY += 45;
            doc.moveTo(220, currentY).lineTo(620, currentY).lineWidth(2).stroke('#0e491d');

            currentY += 40;
            doc.font('Times-Italic').fontSize(50).fillColor('#b89c6d').text(data.studentName.toUpperCase(), 0, currentY, { align: 'center', underline: true });
            
            // 🟢 3. BODY TEXT (Separated with forced Y-gap to prevent overlap)
            currentY += 95;
            doc.font('Helvetica').fontSize(16).fillColor('#333');
            
            // First Part
            doc.text('has successfully completed the internship ', 150, currentY, { width: 541, align: 'center', continued: true });
            doc.font('Helvetica-Bold').text(data.courseName + ' ', { continued: true });
            doc.font('Helvetica').text('conducted by');

            // Second Part (Forced vertical move)
            currentY += 38; 
            doc.font('Helvetica-Bold').text('Nxtsync', 150, currentY, { width: 541, align: 'center', continued: true });
            doc.font('Helvetica').text(' from ', { continued: true });
            doc.font('Helvetica-Bold').text(data.startDate, { continued: true });
            doc.font('Helvetica').text(' to ', { continued: true });
            doc.font('Helvetica-Bold').text(data.endDate + '.');

            // 🖋️ 4. FOOTER REPOSITIONING
            const footerY = 485;
            // CEO Sign (Moved Right into white area)
            const assetsPath = path.join(__dirname, '..', 'assets');
            if (fs.existsSync(path.join(assetsPath, 'ceo_sign.png'))) {
                doc.image(path.join(assetsPath, 'ceo_sign.png'), 180, footerY - 45, { width: 110 });
            }
            doc.font('Helvetica-Bold').fontSize(18).fillColor('#000').text('CEO', 180, footerY + 30, { width: 110, align: 'center' });

            // QR and COO
            const verifyUrl = `https://nxtsync.onrender.com/verify.html?id=${data.certificateId}`;
            const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1 });
            doc.image(qrDataUrl, (841.89 / 2) - 45, footerY - 30, { width: 90 });

            if (fs.existsSync(path.join(assetsPath, 'coo_sign.png'))) {
                doc.image(path.join(assetsPath, 'coo_sign.png'), 630, footerY - 45, { width: 80 });
            }
            doc.font('Helvetica-Bold').fontSize(18).text('COO', 630, footerY + 30, { width: 80, align: 'center' });

            doc.end();
            writeStream.on('finish', async () => {
                const result = await cloudinary.uploader.upload(filePath, { folder: 'certificates', public_id: data.certificateId, resource_type: 'image', format: 'pdf', type: 'upload', access_mode: 'public', invalidate: true, delivery_type: 'upload' });
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                resolve(result.secure_url);
            });
        } catch (error) { reject(error); }
    });
};

module.exports = { generateCertificate };