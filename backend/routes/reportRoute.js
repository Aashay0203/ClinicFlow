import express from "express";
import multer from "multer";
import protect from "../middleware/authmiddleware.js";
import {
    saveCloudinaryResult,
    getAllReport,
    getSingleReport,
    saveMetaData,
    deleteReport,
    aiStatus,
    regenerateSummary
} from "../controllers/reportController.js";

const router = express.Router();

// Multer configuration - store in memory for direct Cloudinary upload
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and images are allowed.'));
        }
    }
});

// ─── Non-param routes first (CRITICAL — must be before /:id) ─────────────────
router.post('/upload', protect, upload.single('file'), saveCloudinaryResult);
router.get('/', protect, getAllReport);

// ─── Specific :id sub-routes (MUST be before /:id catch-all) ─────────────────
router.get('/:id/ai-status', protect, aiStatus);
router.post('/:id/regenerate-summary', protect, regenerateSummary);

// ─── Generic :id routes (catch-all — always last) ────────────────────────────
router.get('/:id', protect, getSingleReport);
router.patch('/:id', protect, saveMetaData);
router.delete('/:id', protect, deleteReport);

export default router;