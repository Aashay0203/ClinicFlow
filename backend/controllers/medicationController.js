import Medication from "../models/medicationSchema.js";

export const getMedication = async (req, res) => {
    try {
        const medication = await Medication.find({ userId: req.user.id });
        res.status(200).json({ success: true, medication })
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Error in Fetch Medication" });
    }
}

export const addMedication = async (req, res) => {
    try {

        const med = await Medication.create({
            userId: req.user.id,  // comes from JWT token
            ...req.body
        });
        res.status(201).json({ success: true, med });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Error in post Medication Details" })
    }
}