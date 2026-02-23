import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    date: { type: Date, required: true },
    seq: { type: Number, default: 0 }
});

counterSchema.index({ doctorId: 1, date: 1 }, { unique: true });

export default mongoose.model("Counter", counterSchema);