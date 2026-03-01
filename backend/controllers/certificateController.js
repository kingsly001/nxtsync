const Certificate = require('../models/Certificate');
const Student = require('../models/Student'); // Ensure Student is imported
const Course = require('../models/Course');   // Ensure Course is imported

const verifyCertificate = async (req, res) => {
    const { certificateId } = req.params;

    try {
        const certificate = await Certificate.findOne({ certificateId })
            .populate('studentId')
            .populate('courseId');

        if (!certificate) {
            return res.status(404).json({ valid: false, message: 'Record not found' });
        }

        res.json({
            valid: true,
            // Added safety checks (?.) to prevent 500 errors
            student: certificate.studentId?.name || "N/A",
            course: certificate.courseId?.courseName || "N/A",
            issueDate: certificate.issueDate,
            certId: certificate.certificateId 
        });
    } catch (error) {
        console.error("API Population Error:", error.message);
        res.status(500).json({ valid: false, message: "Internal server error retrieving details." });
    }
};

module.exports = { verifyCertificate };