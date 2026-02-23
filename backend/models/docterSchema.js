//import { startSession } from "mongoose";
import mongoose from "mongoose";

const DocterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    speciality: {
        type: String,
        default: "Gernal Physician",
    },
    startTime: {
        type: String,
        default: "09:00",
    },
    avgConsultTime: {
        type: Number,
        default: 10,
    },
    fee: {
        type: Number,
        default: 500,
    },
})

export default mongoose.model("Doctor", DocterSchema);