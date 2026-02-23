import Doctor from "../models/docterSchema.js";
import User from "../models/userSchema.js";
import bcrypt from "bcryptjs";


export const getAllDoctors = async (req, res) => {
    try {
        const allDoctors = await Doctor.find().select(
            "name speciality startTime avgConsultTime fee"
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
export const createDoctor = async (req, res) => {
    try {
        const { name, speciality, startTime, avgConsultTime, fee } = req.body;

        if (!name || !speciality || !fee) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing"
            });
        }

        const doctor = await Doctor.create({
            name,
            speciality,
            startTime,
            avgConsultTime,
            fee
        });

        res.status(201).json({
            success: true,
            doctor
        });
    } catch (error) {
        console.error("Create doctor error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create doctor"
        });
    }
};