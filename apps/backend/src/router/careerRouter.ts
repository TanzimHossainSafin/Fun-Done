import express from "express";
import * as careerAnalyzer from "../controller/careerAnalyzer";

const router = express.Router();

// Career analysis routes
router.post("/analyze", careerAnalyzer.analyzeCareerPath);
router.post("/assessment/create", careerAnalyzer.createAssessment);
router.post("/assessment/submit", careerAnalyzer.submitAnswer);
router.post("/assessment/complete", careerAnalyzer.completeAssessment);
router.post("/learning-path/create", careerAnalyzer.createPersonalizedLearningPath);
router.put("/learning-path/milestone", careerAnalyzer.updateMilestoneProgress);
router.get("/learning-paths/:userId", careerAnalyzer.getUserLearningPaths);

export default router;
