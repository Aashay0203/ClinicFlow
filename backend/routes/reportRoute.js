import express from "express";
import protect from "../middleware/authmiddleware.js";
import { saveCloudinaryResult, getAllReport, getSingleReport, saveMetaData, deleteReport, aiStatus } from "../controllers/reportController.js";
const router = express.Router();
import multer from "multer";

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

router.post('/upload', protect, upload.single('file'), saveCloudinaryResult);
router.get('/', protect, getAllReport);
router.get('/', protect, getAllReport);
router.get('/:id', protect, getSingleReport);
router.patch('/:id', protect, saveMetaData);
router.delete('/:id', protect, deleteReport);
router.get('/:id/status', protect, aiStatus);

export default router;