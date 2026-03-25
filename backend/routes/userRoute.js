import express from 'express';
import protect from "../middleware/authmiddleware.js";
import { getUser, patchUser, uploadprofilePic } from '../controllers/userController.js';
const router = express.Router();
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    },
});

router.get('/profile', protect, getUser);
router.patch('/profile', protect, patchUser);
router.post('/profile/picture', protect, upload.single('profilePicture'), uploadprofilePic);

export default router;