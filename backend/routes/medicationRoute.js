import express from "express";
import { getMedication, addMedication } from "../controllers/medicationController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMedication);
router.post("/", protect, addMedication);

export default router;