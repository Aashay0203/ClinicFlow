import bcrypt from "bcryptjs";
import Appointment from "../models/appointmentSchema.js";
import Queue from "../models/queueSchema.js";
import { calculateETA } from "../utils/calculateETA.js";
import Doctor from "../models/docterSchema.js";
import mongoose from "mongoose";
import Razorpay from "razorpay";

// 1. Initialize the machine at the top of the file
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const appointmentBook = async (req, res) => {
    try {
        const patientId = req.user.id; // from JWT
        const { doctorId, date, slotTime } = req.body;

        if (!doctorId || !date || !slotTime) {
            return res.status(400).json({
                success: false,
                message: "doctorId, date and slotTime are required"
            });
        }

        // Normalize date to UTC midnight
        const appointmentDate = new Date(date);
        appointmentDate.setUTCHours(0, 0, 0, 0);

        // 1. ❌ Prevent double booking (KEEP THIS!)
        const existing = await Appointment.findOne({
            patientId,
            doctorId,
            date: appointmentDate
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "You already have an appointment with this doctor on this date"
            });
        }

        // 2. 💸 Create the Razorpay Order (NEW!)
        // Let's assume the fee is 500 INR. (Amount is in paise, so 500 * 100)
        const options = {
            amount: 500 * 100,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        // 3. Send the order back to the frontend so the popup can open
        return res.status(200).json({
            success: true,
            message: "Slot is available, please complete payment",
            order: order // Frontend needs this to open Razorpay
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Appointment booking Failed" });
    }
}

export const getAppointmentStatus = async (req, res) => {
    try {
        const appointmentId = req.params.id;

        // 1️⃣ Validate appointment ID
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment ID"
            });
        }

        // 2️⃣ Fetch appointment
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        // 3️⃣ Authorization (patient can only see own appointment)
        if (appointment.patientId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        // 4️⃣ Fetch doctor
        const doctor = await Doctor.findById(appointment.doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }
        // 5️⃣ Fetch queue (create if missing)
        // Ensure the date is a proper UTC midnight Date object
        const normalizedDate = new Date(appointment.date);
        normalizedDate.setUTCHours(0, 0, 0, 0);

        let queue = await Queue.findOne({
            doctorId: doctor._id,
            date: normalizedDate // Filter by date so we don't grab yesterday's queue!
        });

        if (!queue) {
            queue = await Queue.create({
                doctorId: doctor._id,
                date: normalizedDate, // Force it to save as a Date object
                currentNumber: 0
            });
        }

        // 6️⃣ Calculate ETA
        const { remaining, etaMinutes } = calculateETA(
            appointment.appointmentNumber,
            queue.currentNumber,
            doctor.avgConsultTime
        );

        // 7️⃣ Derive status
        let status = "waiting";
        if (remaining <= 0) status = "serving";
        else if (remaining <= 2) status = "near";

        return res.status(200).json({
            success: true,
            appointmentId,
            appointmentNumber: appointment.appointmentNumber,
            currentNumber: queue.currentNumber,
            remaining,
            etaMinutes,
            status
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to fetch Status" });
    }

}

export const markAppointmentArrived = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { pin } = req.body;

        // 1️⃣ Validate appointment ID
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment ID"
            });
        }

        if (!pin) {
            return res.status(400).json({
                success: false,
                message: "PIN is required"
            });
        }

        // 2️⃣ Fetch appointment
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        // 3️⃣ Prevent re-arrival
        if (appointment.status === "arrived") {
            return res.status(200).json({
                success: true,
                message: "Patient already arrived"
            });
        }

        // 4️⃣ Verify PIN
        const isMatch = await bcrypt.compare(pin, appointment.pinHash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid PIN"
            });
        }

        // 5️⃣ Update status
        appointment.status = "arrived";
        await appointment.save();

        return res.status(200).json({
            success: true,
            message: "Patient marked as arrived",
            appointmentId: appointment._id
        });

    } catch (error) {
        console.error("Arrival error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to mark arrival"
        });
    }
};

// Add this new export function

export const getBookedSlots = async (req, res) => {
    try {
        const { doctorId, date } = req.query;

        if (!doctorId || !date) {
            return res.status(400).json({
                success: false,
                message: "doctorId and date are required"
            });
        }

        // Normalize date to UTC midnight for consistent querying
        const appointmentDate = new Date(date);
        appointmentDate.setUTCHours(0, 0, 0, 0);

        // Find all booked appointments for this doctor on this date
        const bookedAppointments = await Appointment.find({
            doctorId,
            date: appointmentDate,
            paymentStatus: "paid" // Only count paid appointments as "booked"
        }).select("slotTime");

        const bookedSlots = bookedAppointments.map(apt => apt.slotTime);

        return res.status(200).json({
            success: true,
            bookedSlots
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch booked slots"
        });
    }
};