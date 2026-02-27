import Razorpay from 'razorpay';
import crypto from "crypto";
import bcrypt from "bcrypt";
import Appointment from "../models/appointmentSchema.js";
import Queue from "../models/queueSchema.js";


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// STEP 1: Verify Payment & Finalize Appointment
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            appointmentData // Details sent from frontend
        } = req.body;

        // 1. Verify Signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        // 2. Generate Atomic Appointment Number
        // Find or create queue for doctor on that date
        const queue = await Queue.findOneAndUpdate(
            { doctorId: appointmentData.doctorId, date: appointmentData.date },
            { $inc: { lastTokenNumber: 1 } },
            { upsert: true, new: true }
        );

        const appointmentNumber = queue.lastTokenNumber;

        // 3. Generate 4-digit PIN & Hash it
        const rawPin = Math.floor(1000 + Math.random() * 9000).toString(); // e.g., "5721"
        const salt = await bcrypt.genSalt(10);
        const pinHash = await bcrypt.hash(rawPin, salt);

        const patientId = req.user.id; // Grabs the ID of the person logged in
        // 4. Create Final Appointment
        const appointment = new Appointment({
            ...appointmentData,
            appointmentNumber,
            patientId,
            pinHash,
            paymentStatus: "paid",
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id
        });

        await appointment.save();

        // 5. Send raw PIN back ONCE to the frontend
        res.status(200).json({
            success: true,
            message: "Appointment Confirmed",
            appointmentNumber,
            rawPin // Only sent once here!
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};