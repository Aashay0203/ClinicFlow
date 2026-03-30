import Doctor from "../models/docterSchema.js";
import User from "../models/userSchema.js";
import bcrypt from "bcryptjs";
import Appointment from "../models/appointmentSchema.js";
import Queue from "../models/queueSchema.js";
import PatientHealthProfile from "../models/patientHealthSumSchema.js";
import mongoose from "mongoose";

export const getAllDoctors = async (req, res) => {
    try {
        const allDoctors = await Doctor.find().select(
            "name speciality startTime avgConsultTime fees phone email"
        );

        // Optional: handle empty list
        if (allDoctors.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                allDoctors: [],
                message: "No doctors found",
            });
        }

        res.status(200).json({
            success: true,
            count: allDoctors.length,
            allDoctors,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch all doctors",
        });
    }
};

export const doctorDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const details = await Doctor.findById(id);
        if (!details) {
            return res.status(400).json({ message: "Doctor details not found", success: false });
        }

        res.status(200).json({ success: true, message: "Doctor Details Fetch Successfully", details });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, messages: "Error in fetching Doctor Details" });
    }
}

export const getTodayAppointments = async (req, res) => {
    try {
        const doctorId = req.user.id;

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const appointments = await Appointment.find({
            doctorId,
            date: today,
        })
            .populate("patientId", "name phone email")
            .sort({ appointmentNumber: 1 });
        console.log(appointments);

        const queue = await Queue.findOne({ doctorId, date: today });
        console.log(queue, "Queues");
        const queueStatus = {
            currentNumber: queue?.currentNumber || 0,
            lastTokenNumber: queue?.lastTokenNumber || 0,
            remaining: Math.max(
                0,
                (queue?.lastTokenNumber || 0) - (queue?.currentNumber || 0)
            ),
        };

        res.status(200).json({ success: true, appointments, queueStatus });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch today's appointments",
        });
    }
};

export const getPatientHealthProfile = async (req, res) => {
    try {
        const { patientId } = req.params;

        const profile = await PatientHealthProfile.findOne({ userId: patientId });

        if (!profile) {
            return res
                .status(404)
                .json({ success: false, message: "No health profile found" });
        }

        res.status(200).json({ success: true, profile });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch patient health profile",
        });
    }
};