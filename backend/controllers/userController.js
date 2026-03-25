import User from "../models/userSchema.js";
import multer from "multer"
import { v2 as cloudinary } from "cloudinary";


const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    },
});

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, user });
    } catch (err) {
        console.error('Profile GET error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

export const patchUser = async (req, res) => {
    try {
        const allowedFields = ['dob', 'gender', 'address', 'abhaId'];
        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, user });
    } catch (err) {
        console.error('Profile PATCH error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

export const uploadprofilePic = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const uploadToCloudinary = () =>
            new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'delhi_med/profile_pictures',
                        public_id: `profile_${req.user.id}`,
                        resource_type: 'image',
                        overwrite: true,
                        transformation: [
                            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                            { quality: 'auto', fetch_format: 'auto' },
                        ],
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });

        const result = await uploadToCloudinary();

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { profilePicture: result.secure_url } },
            { new: true }
        ).select('-password');

        res.status(200).json({ success: true, user, profilePicture: result.secure_url });
    } catch (err) {
        console.error('Profile picture upload error:', err);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
}