import { Request, Response } from "express";
import MockInterview from "../models/mockInterview.model";
import { generateInterviewQuestions, provideInterviewFeedback } from "../services/aiService";

export const startMockInterview = async (req: Request, res: Response) => {
  try {
    const { userId, targetRole, targetCompany, industry, interviewType, difficulty } = req.body;

    // Generate interview questions using AI
    const questions = await generateInterviewQuestions(targetRole, difficulty || "medium");

    const interview = new MockInterview({
      userId,
      targetRole,
      targetCompany,
      industry,
      interviewType: interviewType || "mixed",
      questions,
      responses: [],
      feedback: [],
      status: "in-progress",
    });

    await interview.save();

    res.status(201).json({
      success: true,
      interviewId: interview._id,
      firstQuestion: questions[0],
    });
  } catch (error) {
    console.error("Error starting mock interview:", error);
    res.status(500).json({ error: "Failed to start mock interview" });
  }
};

export const submitInterviewAnswer = async (req: Request, res: Response) => {
  try {
    const { interviewId, questionId, answer, timeTaken } = req.body;

    const interview = await MockInterview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    // Find the current question
    const currentQuestionIndex = interview.responses.length;
    if (currentQuestionIndex >= interview.questions.length) {
      return res.status(400).json({ error: "No more questions available" });
    }

    const currentQuestion = interview.questions[currentQuestionIndex];
    
    // Evaluate answer using AI
    const feedback = await provideInterviewFeedback(
      currentQuestion.questionText,
      currentQuestion.questionType,
      answer,
      currentQuestion.expectedKeywords || []
    );

    // Add response
    interview.responses.push({
      questionId: currentQuestion._id,
      questionText: currentQuestion.questionText,
      userAnswer: answer,
      timeTaken: timeTaken || 0,
      timestamp: new Date(),
    } as any);

    // Add feedback
    interview.feedback.push({
      questionId: currentQuestion._id,
      overallScore: feedback.overallScore,
      strengths: feedback.strengths,
      improvements: feedback.improvements,
      missingKeywords: feedback.missingKeywords,
      communicationScore: feedback.communicationScore,
      technicalAccuracy: feedback.technicalAccuracy,
      structureScore: feedback.structureScore,
      suggestions: feedback.suggestions,
    } as any);

    await interview.save();

    res.status(200).json({
      success: true,
      feedback,
      hasMoreQuestions: interview.responses.length < interview.questions.length,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({ error: "Failed to submit answer" });
  }
};

export const completeMockInterview = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.body;

    const interview = await MockInterview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    interview.status = "completed";
    interview.completedAt = new Date();

    // Calculate overall score based on feedback
    if (interview.feedback.length > 0) {
      const totalScore = interview.feedback.reduce((sum: number, feedback: any) => sum + feedback.overallScore, 0);
      interview.overallScore = (totalScore / interview.feedback.length) * 10; // Convert to 0-100 scale
    }

    await interview.save();

    res.status(200).json({
      success: true,
      overallScore: interview.overallScore,
      message: "Interview completed successfully",
    });
  } catch (error) {
    console.error("Error completing interview:", error);
    res.status(500).json({ error: "Failed to complete interview" });
  }
};

export const getUserInterviewHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const interviews = await MockInterview.find({ userId })
      .sort({ createdAt: -1 })
      .select("targetRole status overallScore createdAt completedAt");

    res.status(200).json({
      success: true,
      interviews,
    });
  } catch (error) {
    console.error("Error fetching interview history:", error);
    res.status(500).json({ error: "Failed to get interview history" });
  }
};

export const getInterviewResults = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;

    const interview = await MockInterview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error("Error fetching interview results:", error);
    res.status(500).json({ error: "Failed to get interview results" });
  }
};

export const getNextQuestion = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;

    const interview = await MockInterview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    const currentQuestionIndex = interview.responses.length;
    if (currentQuestionIndex >= interview.questions.length) {
      return res.status(200).json({
        success: true,
        hasMoreQuestions: false,
        message: "No more questions available",
      });
    }

    const nextQuestion = interview.questions[currentQuestionIndex];

    res.status(200).json({
      success: true,
      question: nextQuestion,
      questionNumber: currentQuestionIndex + 1,
      totalQuestions: interview.questions.length,
    });
  } catch (error) {
    console.error("Error fetching next question:", error);
    res.status(500).json({ error: "Failed to get next question" });
  }
};
