import bcrypt from "bcryptjs";
import Appointment from "../models/appointmentSchema.js";
import Queue from "../models/queueSchema.js";
import { calculateETA } from "../utils/calculateETA.js";
import Doctor from "../models/docterSchema.js";
import Counter from "../models/counterSchema.js";
import mongoose from "mongoose";
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

        // ❌ Prevent double booking (same patient, same doctor, same date)
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

        // 🔢 Atomic appointment number
        const counter = await Counter.findOneAndUpdate(
            { doctorId, date: appointmentDate },
            { $inc: { seq: 1 } },
            { upsert: true, returnDocument: "after" }
        );

        const appointmentNumber = counter.seq;

        // 🔐 Generate 4-digit PIN
        const rawPin = Math.floor(1000 + Math.random() * 9000).toString();
        const pinHash = await bcrypt.hash(rawPin, 10);

        // 💾 Save appointment
        const appointment = await Appointment.create({
            patientId,
            doctorId,
            date: appointmentDate,
            slotTime,
            appointmentNumber,
            pinHash
        });

        return res.status(201).json({
            success: true,
            appointmentId: appointment._id,
            appointmentNumber,
            pin: rawPin // returned ONCE
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
        let queue = await Queue.findOne({ doctorId: doctor._id });
        if (!queue) {
            queue = await Queue.create({
                doctorId: doctor._id,
                date: appointment.date,
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