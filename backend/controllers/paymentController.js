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

        // Normalize date to UTC midnight to exactly match getBookedSlots query
        const normalizedDate = new Date(appointmentData.date);
        normalizedDate.setUTCHours(0, 0, 0, 0);

        // 2. Generate Atomic Appointment Number
        // Find or create queue for doctor on that date
        const queue = await Queue.findOneAndUpdate(
            { doctorId: appointmentData.doctorId, date: normalizedDate },
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
            date: normalizedDate, // 🌟 Override date with strict UTC midnight
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

export const upiConfirm = async (req, res) => {
    try {
        const { orderId, appointmentData } = req.body;
        console.log(orderId, "in paymentController");
        if (!appointmentData) {
            return res.status(400).json({ success: false, message: "Appointment data is required" });
        }

        /* const payments = await razorpay.orders.fetchPayments(orderId);
        console.log(payments); // ADD THIS
        const successfulPayment = payments.items.find(
            p => p.status === 'captured' || p.status === 'authorized'
        );
        if (!successfulPayment) {
            return res.status(400).json({ success: false, message: "Payment not verified yet." });
        }

 */
        // Normalize date to UTC midnight
        const normalizedDate = new Date(appointmentData.date);
        normalizedDate.setUTCHours(0, 0, 0, 0);

        // 1. Generate Atomic Appointment Number
        const queue = await Queue.findOneAndUpdate(
            { doctorId: appointmentData.doctorId, date: normalizedDate },
            { $inc: { lastTokenNumber: 1 } },
            { upsert: true, new: true }
        );

        const appointmentNumber = queue.lastTokenNumber;

        // 2. Generate 4-digit PIN & Hash it
        const rawPin = Math.floor(1000 + Math.random() * 9000).toString();
        const salt = await bcrypt.genSalt(10);
        const pinHash = await bcrypt.hash(rawPin, salt);

        const patientId = req.user.id; // Grabs the ID of the person logged in

        // 3. Create Final Appointment
        const appointment = new Appointment({
            ...appointmentData,
            date: normalizedDate, // 🌟 Override date with strict UTC midnight
            appointmentNumber,
            patientId,
            pinHash,
            paymentStatus: "paid", // Assuming user paid via QR
            paymentMethod: "UPI",
            razorpayOrderId: orderId
        });

        await appointment.save();

        // 4. Send success response
        res.status(200).json({
            success: true,
            message: "Appointment Confirmed via UPI",
            appointmentNumber,
            rawPin
        });

    } catch (error) {
        console.error("UPI Confirm Error:", error);
        res.status(500).json({ success: false, message: "Failed to confirm appointment" });
    }
};

export const cashConfirm = async (req, res) => {
    try {
        const { appointmentData } = req.body;

        if (!appointmentData) {
            return res.status(400).json({ success: false, message: "Appointment data is required" });
        }

        // Normalize date to UTC midnight
        const normalizedDate = new Date(appointmentData.date);
        normalizedDate.setUTCHours(0, 0, 0, 0);

        // 1. Generate Atomic Appointment Number
        const queue = await Queue.findOneAndUpdate(
            { doctorId: appointmentData.doctorId, date: normalizedDate },
            { $inc: { lastTokenNumber: 1 } },
            { upsert: true, new: true }
        );

        const appointmentNumber = queue.lastTokenNumber;

        // 2. Generate 4-digit PIN & Hash it
        const rawPin = Math.floor(1000 + Math.random() * 9000).toString();
        const salt = await bcrypt.genSalt(10);
        const pinHash = await bcrypt.hash(rawPin, salt);

        const patientId = req.user.id;

        // 3. Create Final Appointment
        const appointment = new Appointment({
            ...appointmentData,
            date: normalizedDate, // 🌟 Override date with strict UTC midnight
            appointmentNumber,
            patientId,
            pinHash,
            // We mark as 'paid' to ensure the slot is blocked in getBookedSlots(),
            // even though payment will be collected at the clinic.
            paymentStatus: "pending",
            paymentMethod: "Cash"
        });

        await appointment.save();

        res.status(200).json({
            success: true,
            message: "Appointment Confirmed",
            appointmentNumber,
            rawPin
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
