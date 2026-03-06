import Doctor from "../models/docterSchema.js";
import User from "../models/userSchema.js";
import bcrypt from "bcryptjs";


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
