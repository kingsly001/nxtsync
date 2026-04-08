# 🎓 NXT SYNC: Automated Certificate Management System

**NXT SYNC** is a professional, full-stack platform designed to streamline course enrollments and generate secure, verifiable internship certificates using a custom-built PDF engine.

---

## 🚀 Features

* **Automated Workflow**: Admin dashboard for reviewing, approving, or rejecting certificate requests.
* **Custom PDF Engine**: High-fidelity generation using `PDFKit` with 12-layer SVG vector designs.
* **QR Verification**: Each certificate includes a unique ID and a scannable QR code linking to a live verification portal.
* **Cloud Infrastructure**: Automated uploads to **Cloudinary** for permanent, secure storage.
* **Secure Authentication**: Role-based access control (RBAC) powered by **JWT**.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript, EJS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Hosting** | Cloudinary API (Media), Render/Railway (Server) |

---

## 📦 Installation & Configuration

### 1. Environment Setup
To protect sensitive credentials, this project uses a `.env` file for configuration. **Do not commit your actual `.env` file to version control.**

1. Navigate to the `/backend` directory.
2. Create a file named `.env`.
3. Copy and paste the following template and fill in your specific values:

```env
# Server Configuration
PORT=5000
JWT_SECRET=your_custom_secret_key

# Database
MONGO_URI=your_mongodb_connection_string

# Cloudinary Credentials (Required for Certificate Hosting)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

2. Setting Up Cloudinary (For Organizations)
If you are setting this up for a new organization, obtain your API keys as follows:

Create an account at Cloudinary.com.

Navigate to your Dashboard.

Copy the Cloud Name, API Key, and API Secret into the .env file above.

🎨 Asset Requirements
The certificate engine requires specific brand assets in the backend/assets/ directory to run correctly:

logo.jpg (Company Branding)

ISO1.png & AICTE.png (Accreditation Badges)

ceo_sign.png & coo_sign.png (Executive Signatures)

🌐 Production Deployment
When deploying to a live host (e.g., Render or AWS):

Environment Variables: Add your .env keys directly into your hosting provider's configuration dashboard.

Verification URL: In backend/services/certificateService.js, update the verifyUrl to match your live domain.

Example: https://your-domain.com/verify.html?id=

🔑 Default Admin Credentials
Username: admin@nxtsync.com

Password: password123
