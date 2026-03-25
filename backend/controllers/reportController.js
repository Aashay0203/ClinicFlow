import Report from "../models/reportSchema.js";
import multer from "multer"
import { v2 as cloudinary } from "cloudinary";
import { Readable } from 'stream';

// Cloudinary configuration (add to your .env file)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, fileName) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'delhimed-reports',
                resource_type: 'auto',
                public_id: `report_${Date.now()}_${fileName.replace(/\.[^/.]+$/, '')}`
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        uploadStream.end(buffer);
    });
};

// @route   POST /api/reports/upload
// @desc    Upload report to Cloudinary and save metadata to DB
// @access  Private
export const saveCloudinaryResult = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Upload to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);

        // Get file type from mimetype
        let fileType = req.file.mimetype.split('/')[1];
        if (fileType === 'jpeg') fileType = 'jpg';

        // Create report in database
        const report = new Report({
            userId: req.user.id,
            fileName: req.file.originalname,
            fileUrl: cloudinaryResult.secure_url,
            fileType: fileType,
            fileSize: req.file.size,
            cloudinaryPublicId: cloudinaryResult.public_id,
            reportType: req.body.reportType || '',
            doctorClinicName: req.body.doctorClinicName || '',
            reportDate: req.body.reportDate || null,
            uploadedBy: req.body.uploadedBy || '',
            tags: req.body.tags ? JSON.parse(req.body.tags) : []
        });

        await report.save();

        // TODO: Trigger AI processing in background (Phase 3C)
        // processReportWithAI(report._id);

        res.status(201).json({
            success: true,
            message: 'Report uploaded successfully',
            report
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload report',
            error: error.message
        });
    }
};

export const getAllReport = async (req, res) => {
    try {
        const reports = await Report.find({ userId: req.user.id })
            .sort({ uploadedAt: -1 });

        res.status(200).json({
            success: true,
            reports,
            count: reports.length
        });

    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reports',
            error: error.message
        });
    }
}

export const getSingleReport = async (req, res) => {
    try {
        const report = await Report.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        res.status(200).json({ success: true, report });

    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({
            message: 'Failed to fetch report',
            error: error.message
        });
    }
}

export const saveMetaData = async (req, res) => {
    try {
        const { reportType, doctorClinicName, reportDate, uploadedBy, tags } = req.body;

        const report = await Report.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        // Update fields if provided
        if (reportType !== undefined) report.reportType = reportType;
        if (doctorClinicName !== undefined) report.doctorClinicName = doctorClinicName;
        if (reportDate !== undefined) report.reportDate = reportDate;
        if (uploadedBy !== undefined) report.uploadedBy = uploadedBy;
        if (tags !== undefined) report.tags = tags;

        await report.save();

        res.status(200).json({
            success: true,
            message: 'Report updated successfully',
            report
        });

    } catch (error) {
        console.error('Update report error:', error);
        res.status(500).json({
            message: 'Failed to update report',
            error: error.message
        });
    }
}

export const deleteReport = async (req, res) => {
    try {
        const report = await Report.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(report.cloudinaryPublicId);

        // Delete from database
        await Report.deleteOne({ _id: req.params.id });

        res.status(200).json({ success: true, message: 'Report deleted successfully' });

    } catch (error) {
        console.error('Delete report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete report',
            error: error.message
        });
    }
}

// Get AI processing status for a report (for polling)

export const aiStatus = async (req, res) => {
    try {
        const report = await Report.findOne({
            _id: req.params.id,
            userId: req.user.id
        }).select('aiStatus aiSummary aiError');

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        res.status(200).json({
            success: true,
            aiStatus: report.aiStatus,
            aiSummary: report.aiSummary,
            aiError: report.aiError
        });

    } catch (error) {
        console.error('Get status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch status',
            error: error.message
        });
    }
}
