import express from "express";
import { 
  startMockInterview,
  submitInterviewAnswer,
  completeMockInterview,
  getUserInterviewHistory,
  getInterviewResults,
  getNextQuestion
} from "../controller/mockInterview";

const router = express.Router();

// Start and manage mock interviews
router.post("/start", startMockInterview);
router.post("/answer", submitInterviewAnswer);
router.post("/complete", completeMockInterview);

// Get interview data
router.get("/history/:userId", getUserInterviewHistory);
router.get("/results/:interviewId", getInterviewResults);
router.get("/next-question/:interviewId", getNextQuestion);

export default router;
