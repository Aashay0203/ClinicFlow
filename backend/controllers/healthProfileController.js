import PatientHealthProfile from "../models/patientHealthSumSchema.js";
import { updateHealthProfileManual } from "../jobs/updateHealthProfile.js";


export const getHealthProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const profile = await PatientHealthProfile.findOne({ userId });

        if (!profile) {
            return res.status(404).json({
                message: "Health profile not found. Start by uploading reports or completing the setup form.",
                profile: null,
            });
        }

        res.json({
            message: "Health profile retrieved",
            profile,
        });
    } catch (error) {
        console.error("[Health Profile] Error fetching profile:", error.message);
        res.status(500).json({ message: "Error fetching health profile" });
    }
}

export const putHealthProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const userProvidedData = req.body; // from frontend form submission

        // Validate that we got data
        if (!userProvidedData || Object.keys(userProvidedData).length === 0) {
            return res.status(400).json({
                message: "No health data provided",
            });
        }

        // Save to DB
        const updatedProfile = await updateHealthProfileManual(
            userId,
            userProvidedData
        );

        res.json({
            message: "Health profile updated successfully",
            profile: updatedProfile,
        });
    } catch (error) {
        console.error("[Health Profile] Error updating user data:", error.message);
        res.status(500).json({ message: "Error updating health profile" });
    }
}

export const deleteHealthProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await PatientHealthProfile.deleteOne({ userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Health profile not found",
            });
        }

        res.json({
            message: "Health profile deleted successfully",
        });
    } catch (error) {
        console.error("[Health Profile] Error deleting profile:", error.message);
        res.status(500).json({ message: "Error deleting health profile" });
    }
}

export const aiExtractSection = async (req, res) => {
    try {
        const userId = req.user.id;

        const profile = await PatientHealthProfile.findOne({ userId }).select(
            "aiExtracted"
        );

        if (!profile) {
            return res.status(404).json({
                message: "No AI-extracted health data found",
                aiExtracted: null,
            });
        }

        res.json({
            message: "AI-extracted data retrieved",
            aiExtracted: profile.aiExtracted,
        });
    } catch (error) {
        console.error("[Health Profile] Error fetching AI data:", error.message);
        res.status(500).json({ message: "Error fetching AI data" });
    }
}

export const userProvided = async (req, res) => {
    try {
        const userId = req.user.id;

        const profile = await PatientHealthProfile.findOne({ userId }).select(
            "userProvided"
        );

        if (!profile) {
            return res.status(404).json({
                message: "No user-provided health data found",
                userProvided: null,
            });
        }

        res.json({
            message: "User-provided data retrieved",
            userProvided: profile.userProvided,
        });
    } catch (error) {
        console.error("[Health Profile] Error fetching user data:", error.message);
        res.status(500).json({ message: "Error fetching user data" });
    }
}
