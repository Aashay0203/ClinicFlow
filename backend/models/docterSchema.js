//import { startSession } from "mongoose";
import mongoose from "mongoose";

const DocterSchema = new mongoose.Schema({
    name: { type: String, required: true },

    speciality: {
        type: String,
        required: true,
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
        required: true,
    },
})

export default mongoose.model("Doctor", DocterSchema);