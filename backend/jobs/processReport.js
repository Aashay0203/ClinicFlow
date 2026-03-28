import Report from "../models/reportSchema.js";
import { analyzeReport } from "../services/geminiService.js";
import { updateHealthProfileAI } from "./updateHealthProfile.js";

export async function processReportInBackground(reportId, cloudinaryUrl, fileType, userId) {
    try {
        // 1. Mark as processing
        await Report.findByIdAndUpdate(reportId, {
            aiStatus: "processing",
            aiError: null
        });

        console.log(`[AI] Starting analysis for report ${reportId}`);

        // 2. Call Gemini
        const aiResult = await analyzeReport(cloudinaryUrl, fileType);

        if (!aiResult) {
            await Report.findByIdAndUpdate(reportId, {
                aiStatus: "failed",
                aiError: "AI returned empty result"
            });
            throw new Error("AI returned empty result");
        }

        const normalizedPlainSummary = Array.isArray(aiResult.plainSummary)
            ? aiResult.plainSummary.map((item) => String(item))
            : aiResult.plainSummary
                ? [String(aiResult.plainSummary)]
                : [];

        // 3. Save result into the report
        await Report.findByIdAndUpdate(reportId, {
            aiStatus: "completed",
            aiSummary: {
                testTable: aiResult.testTable || [],
                plainSummary: normalizedPlainSummary,
                extractedHealthData: aiResult.extractedHealthData || {},
                reportTypeDetected: aiResult.reportTypeDetected || "Unknown",
                generatedAt: new Date()
            },
            aiError: null
        });

        console.log(`[AI] Report ${reportId} analysis complete.`);

        // 4. Chain: update the user's overall health profile with the new data
        // This is also non-blocking — if it fails, the report summary is still saved
        updateHealthProfileAI(userId).catch((err) => {
            console.error(`[AI] Health profile update failed for user ${userId}:`, err.message);
        });

    } catch (error) {
        console.error(`[AI] Report ${reportId} analysis failed:`, error.message);

        await Report.findByIdAndUpdate(reportId, {
            aiStatus: "failed",
            aiError: error.message
        });
    }
}