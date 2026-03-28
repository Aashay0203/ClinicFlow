import express from "express";
import protect from "../middleware/authmiddleware.js";
import { getHealthProfile, putHealthProfile, deleteHealthProfile, aiExtractSection, userProvided } from "../controllers/healthProfileController.js";

const router = express.Router();

router.get("/", protect, getHealthProfile);
router.put("/userData", protect, putHealthProfile);
router.delete("/", protect, deleteHealthProfile);
router.get("/ai-only", protect, aiExtractSection);
router.get("/user-only", protect, userProvided);

export default router;