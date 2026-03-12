import express from "express";
const router = express.Router();
import { verifyPayment, upiConfirm, cashConfirm } from "../controllers/paymentController.js"
import protect from '../middleware/authmiddleware.js';

router.post('/verify', protect, verifyPayment);
router.post('/upi-confirm', protect, upiConfirm);
router.post('/cash-confirm', protect, cashConfirm);

export default router;