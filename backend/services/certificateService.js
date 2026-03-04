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
            // 🟢 1. CORRECTED: Define filePath and setup document
            const fileName = `${data.certificateId}.pdf`;
            const folderPath = path.join(process.cwd(), 'public', 'certificates');
            if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
            const filePath = path.join(folderPath, fileName);

            const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // 🎨 2. SCALED SVG BACKGROUND LAYERS (Mapped to A4 Landscape)
            doc.save();
            const s = 0.841; // Scale factor: 841.89 / 1000
            const h = 0.850; // Vertical scale: 595.28 / 700

            // Top Right Corner
            doc.path(`M ${647*s} 0 C ${767*s} ${45*h} ${949*s} ${-38*h} ${999*s} ${18*h} L ${1000*s} 0 Z`).fill('#248e43');
            doc.path(`M ${885*s} 0 C ${840*s} ${15*h} ${760*s} ${16*h} ${682*s} ${10*h} C ${796*s} ${41*h} ${947*s} ${2*h} ${1000*s} ${34*h} L ${1000*s} 0 Z`).fill('#0e491d');
            doc.path(`M ${1000*s} ${29*h} C ${904*s} ${8*h} ${849*s} ${18*h} ${826*s} ${24*h} C ${887*s} ${23*h} ${945*s} ${26*h} ${1000*s} ${49*h} Z`).fill('#fff6cf');
            doc.path(`M ${999*s} ${49*h} C ${949*s} ${23*h} ${877*s} ${20*h} ${864*s} ${26*h} C ${912*s} ${32*h} ${958*s} ${42*h} ${999*s} ${69*h} Z`).fill('#f8bc00');

            // Bottom Right Corner
            doc.path(`M ${1000*s} ${495*h} C ${779*s} ${719*h} ${392*s} ${671*h} ${269*s} ${653*h} C ${292*s} ${669*h} ${322*s} ${689*h} ${340*s} ${700*h} L ${1000*s} ${700*h} Z`).fill('#fff6cf');
            doc.path(`M ${1000*s} ${550*h} C ${778*s} ${710*h} ${503*s} ${716*h} ${284*s} ${664*h} C ${335*s} ${682*h} ${373*s} ${689*h} ${435*s} ${699*h} L ${1000*s} ${700*h} Z`).fill('#f8bc00');
            doc.path(`M ${1000*s} ${577*h} C ${724*s} ${775*h} ${341*s} ${693*h} ${290*s} ${667*h} C ${309*s} ${681*h} ${320*s} ${686*h} ${343*s} ${701*h} L ${1000*s} ${700*h} Z`).fill('#0e491d');
            doc.path(`M ${1000*s} ${640*h} C ${959*s} ${666*h} ${892*s} ${686*h} ${840*s} ${700*h} L ${1000*s} ${700*h} Z`).fill('#248e43');

            // Bottom Left Corner
            doc.path(`M 0 ${350*h} C ${52*s} ${457*h} ${209*s} ${632*h} ${340*s} ${700*h} L 0 ${700*h} Z`).fill('#fff6cf');
            doc.path(`M 0 ${400*h} C ${40*s} ${476*h} ${191*s} ${636*h} ${325*s} ${700*h} L 0 ${700*h} Z`).fill('#f8bc00');
            doc.path(`M 0 ${439*h} C ${41*s} ${509*h} ${190*s} ${650*h} ${315*s} ${700*h} L 0 ${700*h} Z`).fill('#248e43');
            doc.path(`M 0 ${627*h} C ${35*s} ${649*h} ${92*s} ${677*h} ${165*s} ${700*h} L 0 ${700*h} Z`).fill('#0e491d');
            doc.restore();

            const assetsPath = path.join(__dirname, '..', 'assets');
            if (fs.existsSync(path.join(assetsPath, 'logo.jpg'))) doc.image(path.join(assetsPath, 'logo.jpg'), 35, 30, { width: 160 });
            if (fs.existsSync(path.join(assetsPath, 'ISO1.png'))) doc.image(path.join(assetsPath, 'ISO1.png'), 35, 140, { width: 140 });
            if (fs.existsSync(path.join(assetsPath, 'AICTE.png'))) doc.image(path.join(assetsPath, 'AICTE.png'), 670, 140, { width: 130 });

            // 📝 3. TEXT SECTION (Manual Y-tracking to prevent collapse)
            let currentY = 125;
            doc.fillColor('#0e491d').font('Times-Bold').fontSize(32).text('INTERNSHIP COMPLETION', 0, currentY, { align: 'center' });
            currentY += 38;
            doc.text('CERTIFICATE', 0, currentY, { align: 'center' });
            
            currentY += 40;
            doc.moveTo(220, currentY).lineTo(620, currentY).lineWidth(2).stroke('#0e491d');

            currentY += 35;
            doc.font('Times-Italic').fontSize(48).fillColor('#b89c6d').text(data.studentName.toUpperCase(), 0, currentY, { align: 'center', underline: true });
            
            // 🟢 4. FIXED BODY TEXT (Explicit Y for second line)
currentY += 85; 
doc.font('Helvetica').fontSize(16).fillColor('#333');

// Line 1: Introduction
doc.text('has successfully completed the internship', 30, currentY, { 
    width: 782, 
    align: 'center' 
});

// Line 2: Bold Course Name
currentY += 30; 
doc.font('Helvetica-Bold').text(data.courseName.toUpperCase(), 30, currentY, { 
    width: 782, 
    align: 'center' 
});

// Line 3: Conducted By + Nxtsync + Dates (Shifted Left to X=150)
currentY += 32; 
doc.font('Helvetica').text('conducted by ', 175, currentY, { continued: true });
doc.font('Helvetica-Bold').text('Nxtsync ', { continued: true });
doc.font('Helvetica').text('from ', { continued: true });
doc.font('Helvetica-Bold').text(data.startDate, { continued: true });
doc.font('Helvetica').text(' to ', { continued: true });
doc.font('Helvetica-Bold').text(data.endDate + '.');

            // 🖋️ 5. FOOTER
            const footerY = 485;
            if (fs.existsSync(path.join(assetsPath, 'ceo_sign.png'))) doc.image(path.join(assetsPath, 'ceo_sign.png'), 180, footerY - 45, { width: 110 });
            doc.font('Helvetica-Bold').fontSize(16).fillColor('#000').text('CEO', 180, footerY + 30, { width: 110, align: 'center' });

            const verifyUrl = `https://nxtsync.onrender.com/verify.html?id=${data.certificateId}`;
            const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1 });
            doc.image(qrDataUrl, (841.89 / 2) - 45, footerY - 30, { width: 90 });

            if (fs.existsSync(path.join(assetsPath, 'coo_sign.png'))) doc.image(path.join(assetsPath, 'coo_sign.png'), 630, footerY - 45, { width: 80 });
            doc.font('Helvetica-Bold').fontSize(16).text('COO', 630, footerY + 30, { width: 80, align: 'center' });

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