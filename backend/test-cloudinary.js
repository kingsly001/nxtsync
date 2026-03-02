const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dpn8wwgmp',
    api_key: '268669986285641',
    api_secret: '2WUaIat03G_E5hTI8WUua4fIBMI'
});

async function testUpload() {
    try {
        console.log("Testing Cloudinary Connection...");
        const result = await cloudinary.uploader.upload("https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png", {
            folder: 'test_folder',
            resource_type: 'image',
            type: 'upload',
            access_mode: 'public'
        });
        console.log("✅ SUCCESS! Public URL:", result.secure_url);
        console.log("Check if you can open this link in your browser.");
    } catch (error) {
        console.error("❌ FAILED:", error.message);
        console.log("Check your Cloudinary Dashboard for 'Strict Transformations' or 'Restricted Media' settings.");
    }
}

testUpload();