import express from "express";
import { getMedication, addMedication, updateMedication, resetDailyMedications } from "../controllers/medicationController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMedication);
router.post("/", protect, addMedication);
router.patch("/reset-daily", protect, resetDailyMedications);
router.patch("/:id", protect, updateMedication);

export default router;