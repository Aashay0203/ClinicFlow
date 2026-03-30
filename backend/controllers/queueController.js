import mongoose from "mongoose";
import Queue from "../models/queueSchema.js";
import Appointment from "../models/appointmentSchema.js";

/**
 * PUT /api/queues/next
 * Doctor advances the queue
 */
export const moveQueueNext = async (req, res) => {
    try {
        // 🌟 1. Use the secure ID from the JWT token, ignoring the URL parameter!
        const doctorId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid doctor ID in token"
            });
        }

        // 🌟 2. Find today's queue for this doctor
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const queue = await Queue.findOne({ doctorId: doctorId, date: today });

        if (!queue) {
            return res.status(404).json({
                success: false,
                message: "Queue not found for today"
            });
        }

        const currentNumber = queue.currentNumber;

        // Mark current appointment as served
        if (currentNumber > 0) {
            await Appointment.findOneAndUpdate(
                {
                    doctorId,
                    date: today,
                    appointmentNumber: currentNumber
                },
                { status: "served" }
            );
        }

        // Move queue forward
        queue.currentNumber += 1;
        queue.lastUpdatedAt = new Date();
        await queue.save();

        return res.status(200).json({
            success: true,
            message: "Queue moved to next patient",
            currentNumber: queue.currentNumber
        });

    } catch (error) {
        console.error("Queue next error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to move queue"
        });
    }
};