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

const generateCertificate = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({
                layout: 'landscape',
                size: 'A4',
                margin: 0
            });

            const fileName = `${data.certificateId}.pdf`;
            const folderPath = path.join(process.cwd(), 'public', 'certificates');
            if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

            const filePath = path.join(folderPath, fileName);
            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            const assetsPath = path.join(__dirname, '../../frontend/assets');

            const addImageSafely = (imageName, x, y, options) => {
                const imgPath = path.join(assetsPath, imageName);
                if (fs.existsSync(imgPath)) {
                    try {
                        doc.image(imgPath, x, y, options);
                    } catch (err) {
                        console.error(`⚠️ PDFKit Error:`, err.message);
                    }
                }
            };

            // --- DESIGN (Green & Gold Curves) ---
            doc.save().moveTo(600, 0).quadraticCurveTo(750, 50, 841.89, 180).lineTo(841.89, 0).fill('#006837');
            doc.save().moveTo(0, 420).quadraticCurveTo(120, 500, 280, 595.28).lineTo(0, 595.28).fill('#006837');
            doc.save().moveTo(550, 595.28).quadraticCurveTo(720, 520, 841.89, 480).lineTo(841.89, 595.28).fill('#fbb03b');

            addImageSafely('logo.jpg', 50, 40, { width: 140 });
            addImageSafely('ISO1.png', 50, 240, { width: 90 });
            addImageSafely('AICTE.png', 700, 240, { width: 90 }); 

            doc.fillColor('#1a3d31').font('Helvetica-Bold').fontSize(36).text('INTERNSHIP COMPLETION', 0, 210, { align: 'center' });
            doc.text('CERTIFICATE', 0, 255, { align: 'center' });
            doc.fillColor('#a1824a').font('Times-BoldItalic').fontSize(42).text(data.studentName.toUpperCase(), 0, 360, { align: 'center' });
            doc.fillColor('#333333').font('Helvetica').fontSize(16).text('has successfully completed the internship program in the domain of', 0, 440, { align: 'center' });
            doc.font('Helvetica-Bold').text(data.courseName, { align: 'center' });

            // QR Code
            const verifyUrl = `${process.env.FRONTEND_URL}/verify.html?id=${data.certificateId}`;
            const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1 });
            doc.image(qrDataUrl, (841.89 / 2) - 42.5, 490, { width: 85 });

            doc.end();
            
            // 🟢 FIXED FINISH HANDLER
            writeStream.on('finish', async () => {
                try {
                    const result = await cloudinary.uploader.upload(filePath, {
                    folder: 'certificates',
                    public_id: data.certificateId,
                    resource_type: 'auto', // ⬅️ Change 'raw' to 'auto' or 'image'
                    flags: "attachment:false" // ⬅️ Ensures it displays instead of downloading
                });

                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    
                    // This is where your error was: ensured proper closure of brackets
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