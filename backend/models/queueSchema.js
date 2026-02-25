import mongoose from "mongoose";

const queueSchema = new mongoose.Schema(
    {
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
        },
        date: {
            type: Date, // YYYY-MM-DD
            required: true,
        },
        currentNumber: {
            type: Number,
            default: 0,
        },
        lastUpdatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

queueSchema.index({ doctorId: 1, date: 1 }, { unique: true });

export default mongoose.model("Queue", queueSchema); 