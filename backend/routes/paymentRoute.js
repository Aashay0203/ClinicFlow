import express from "express";
const router = express.Router();
import { verifyPayment } from "../controllers/paymentController.js"
import protect from '../middleware/authmiddleware.js';

router.post('/verify', protect, verifyPayment);

export default router;