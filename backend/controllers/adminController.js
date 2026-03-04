const Course = require('../models/Course');
const Student = require('../models/Student');
const CertificateRequest = require('../models/CertificateRequest');
const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const { generateCertificate } = require('../services/certificateService');
const sendEmail = require('../utils/sendEmail');

const getOverview = async (req, res) => {
    try {
        const studentCount = await Student.countDocuments();
        const courseCount = await Course.countDocuments();
        const pendingRequests = await CertificateRequest.countDocuments({ status: 'pending' });
        const issuedCertificates = await Certificate.countDocuments();
        res.json({ studentCount, courseCount, pendingRequests, issuedCertificates });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createCourse = async (req, res) => {
    const { courseName, courseCode, duration, description } = req.body;
    try {
        const courseExists = await Course.findOne({ courseCode });
        if (courseExists) return res.status(400).json({ message: 'Course code exists' });
        const course = await Course.create({ courseName, courseCode, duration, description, createdBy: req.user._id });
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCourses = async (req, res) => {
    try {
        const courses = await Course.find({});
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getStudents = async (req, res) => {
    try {
        const students = await Student.find({}).select('-password');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCertificateRequests = async (req, res) => {
    try {
        const requests = await CertificateRequest.find()
            // Ensure this matches the 'Student' ref in the schema
            .populate('studentId', 'name email studentId')
            .populate('courseId', 'courseName courseCode duration');
        res.json(requests);
    } catch (error) {
        // Log the actual error to the terminal to help debugging
        console.error("Fetch Request Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// ... (imports remain the same)

// Inside approveCertificate in adminController.js
// Inside approveCertificate in adminController.js
const approveCertificate = async (req, res) => {
    const { requestId } = req.body;
    try {
        const request = await CertificateRequest.findById(requestId)
            .populate('studentId')
            .populate('courseId');

        // Fetch Enrollment to get the original start date
        const enrollment = await Enrollment.findOne({ 
            studentId: request.studentId._id, 
            courseId: request.courseId._id 
        });

        const today = new Date();
        const formattedToday = today.toLocaleDateString('en-GB'); // DD/MM/YYYY
        
        // Dynamic Date Logic
        const startDate = enrollment 
            ? new Date(enrollment.createdAt).toLocaleDateString('en-GB') 
            : new Date(request.createdAt).toLocaleDateString('en-GB');

        // Inside approveCertificate in adminController.js
        const certificateId = `CERT-${Date.now()}`;
        const verificationCode = Math.random().toString(36).substring(7).toUpperCase(); // This exists

        const cloudinaryUrl = await generateCertificate({
            studentName: request.studentId.name,
            courseName: request.courseId.courseName,
            startDate,
            endDate: formattedToday,
            certificateId,
            verificationCode, // 🟢 Passed to the PDF service
        });

        // 🟢 FIX: Include verificationCode in the database creation object
        await Certificate.create({
            certificateId,
            studentId: request.studentId._id,
            courseId: request.courseId._id,
            certificateUrl: String(cloudinaryUrl).replace('http://', 'https://'),
            verificationCode, // 🟢 This line was missing or mismatched in the create call
            issueDate: today 
        });

        request.status = 'approved';
        await request.save();

        res.json({ message: 'Certificate generated successfully', url: cloudinaryUrl });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Reject certificate request
const rejectCertificate = async (req, res) => {
    const { requestId, reason } = req.body;
    try {
        const request = await CertificateRequest.findById(requestId);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        request.status = 'rejected';
        request.rejectionReason = reason;
        await request.save();

        res.json({ message: 'Request rejected' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export all existing + new rejectCertificate
module.exports = {
    createCourse, getCourses, getStudents, getOverview,
    getCertificateRequests, approveCertificate, rejectCertificate
};