import { Request, Response } from "express";
import CareerPath from "../models/careerPath.model";
import SkillAssessment from "../models/skillAssessment.model";
import LearningPath from "../models/learningPath.model";
import {
    analyzeJobMarket,
    generateSkillAssessment,
    analyzeSkillGaps,
    generateLearningPath
} from "../services/aiService";

/**
 * Analyze job market for a target role
 * POST /career/analyze
 */
export const analyzeCareerPath = async (req: Request, res: Response) => {
    try {
        const { userId, targetRole, industry } = req.body;

        if (!userId || !targetRole) {
            return res.status(400).json({
                success: false,
                message: "userId and targetRole are required"
            });
        }

        // Get AI analysis of job market
        const jobMarketData = await analyzeJobMarket(targetRole, industry);

        // Create or update career path
        const careerPath = await CareerPath.findOneAndUpdate(
            { userId, targetRole },
            {
                userId,
                targetRole,
                industry: industry || "",
                requiredSkills: jobMarketData.requiredSkills,
                totalJobsAnalyzed: jobMarketData.totalJobsAnalyzed,
                topCompanies: jobMarketData.topCompanies,
                averageSalary: jobMarketData.salaryRange,
                lastUpdated: new Date()
            },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            data: {
                careerPath,
                marketInsights: {
                    demand: jobMarketData.marketDemand,
                    growthTrend: jobMarketData.growthTrend,
                    sampleJobTitles: jobMarketData.sampleJobTitles
                }
            }
        });
    } catch (error: any) {
        console.error("Career Path Analysis Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to analyze career path",
            error: error.message
        });
    }
};

/**
 * Create skill assessment for user
 * POST /career/assessment/create
 */
export const createAssessment = async (req: Request, res: Response) => {
    try {
        const { userId, careerPathId, targetRole } = req.body;

        if (!userId || !targetRole) {
            return res.status(400).json({
                success: false,
                message: "userId and targetRole are required"
            });
        }

        // Get career path to know required skills
        const careerPath = careerPathId 
            ? await CareerPath.findById(careerPathId)
            : await CareerPath.findOne({ userId, targetRole });

        if (!careerPath) {
            return res.status(404).json({
                success: false,
                message: "Career path not found. Please analyze career path first."
            });
        }

        // Extract skill names
        const requiredSkillNames = careerPath.requiredSkills.map(s => s.skillName);

        // Generate assessment questions using AI
        const questions = await generateSkillAssessment(targetRole, requiredSkillNames);

        // Create assessment
        const assessment = new SkillAssessment({
            userId,
            careerPathId: careerPath._id,
            targetRole,
            questions,
            responses: [],
            status: "in-progress"
        });

        await assessment.save();

        // Return questions without correct answers
        const questionsForUser = questions.map((q: any) => ({
            _id: q._id,
            questionText: q.questionText,
            skillCategory: q.skillCategory,
            difficulty: q.difficulty,
            options: q.options,
            codeChallenge: q.codeChallenge
        }));

        res.status(201).json({
            success: true,
            data: {
                assessmentId: assessment._id,
                questions: questionsForUser,
                totalQuestions: questions.length
            }
        });
    } catch (error: any) {
        console.error("Assessment Creation Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create assessment",
            error: error.message
        });
    }
};

/**
 * Submit assessment answer
 * POST /career/assessment/answer
 */
export const submitAnswer = async (req: Request, res: Response) => {
    try {
        const { assessmentId, questionId, userAnswer, timeTaken, codeSubmitted } = req.body;

        if (!assessmentId || !questionId || !userAnswer) {
            return res.status(400).json({
                success: false,
                message: "assessmentId, questionId, and userAnswer are required"
            });
        }

        const assessment = await SkillAssessment.findById(assessmentId);
        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found"
            });
        }

        // Find the question
        const question = assessment.questions.find(q => q._id?.toString() === questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        // Check if answer is correct
        const isCorrect = question.correctAnswer === userAnswer;

        // Add response
        assessment.responses.push({
            questionId,
            userAnswer,
            isCorrect,
            timeTaken,
            codeSubmitted
        });

        await assessment.save();

        res.status(200).json({
            success: true,
            data: {
                isCorrect,
                correctAnswer: question.correctAnswer,
                explanation: (question as any).explanation
            }
        });
    } catch (error: any) {
        console.error("Answer Submission Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit answer",
            error: error.message
        });
    }
};

/**
 * Complete assessment and get results
 * POST /career/assessment/complete
 */
export const completeAssessment = async (req: Request, res: Response) => {
    try {
        const { assessmentId } = req.body;

        if (!assessmentId) {
            return res.status(400).json({
                success: false,
                message: "assessmentId is required"
            });
        }

        const assessment = await SkillAssessment.findById(assessmentId);
        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found"
            });
        }

        // Calculate scores by skill
        const skillScores: any = {};
        
        assessment.responses.forEach(response => {
            const question = assessment.questions.find(q => q._id?.toString() === response.questionId?.toString());
            if (question) {
                if (!skillScores[question.skillCategory]) {
                    skillScores[question.skillCategory] = {
                        correct: 0,
                        total: 0
                    };
                }
                skillScores[question.skillCategory].total++;
                if (response.isCorrect) {
                    skillScores[question.skillCategory].correct++;
                }
            }
        });

        // Convert to skill score array
        const skillScoreArray = Object.keys(skillScores).map(skillName => {
            const score = (skillScores[skillName].correct / skillScores[skillName].total) * 100;
            let level: "beginner" | "intermediate" | "advanced" | "expert" = "beginner";
            if (score >= 90) level = "expert";
            else if (score >= 70) level = "advanced";
            else if (score >= 50) level = "intermediate";

            return {
                skillName,
                score,
                level,
                questionsAnswered: skillScores[skillName].total,
                questionsCorrect: skillScores[skillName].correct
            };
        });

        // Calculate overall score
        const totalCorrect = assessment.responses.filter(r => r.isCorrect).length;
        const overallScore = (totalCorrect / assessment.responses.length) * 100;

        // Calculate total duration
        const duration = assessment.responses.reduce((sum, r) => sum + (r.timeTaken || 0), 0);

        // Update assessment
        // Clear and repopulate skillScores
        assessment.skillScores.splice(0, assessment.skillScores.length);
        skillScoreArray.forEach((score: any) => assessment.skillScores.push(score));
        assessment.overallScore = overallScore;
        assessment.duration = duration;
        assessment.status = "completed";
        assessment.completedAt = new Date();

        await assessment.save();

        res.status(200).json({
            success: true,
            data: {
                assessmentId: assessment._id,
                overallScore,
                skillScores: skillScoreArray,
                totalQuestions: assessment.questions.length,
                correctAnswers: totalCorrect,
                duration
            }
        });
    } catch (error: any) {
        console.error("Assessment Completion Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to complete assessment",
            error: error.message
        });
    }
};

/**
 * Generate personalized learning path
 * POST /career/learning-path/generate
 */
export const createPersonalizedLearningPath = async (req: Request, res: Response) => {
    try {
        const { userId, assessmentId } = req.body;

        if (!userId || !assessmentId) {
            return res.status(400).json({
                success: false,
                message: "userId and assessmentId are required"
            });
        }

        // Get completed assessment
        const assessment = await SkillAssessment.findById(assessmentId);
        if (!assessment || assessment.status !== "completed") {
            return res.status(400).json({
                success: false,
                message: "Assessment not completed yet"
            });
        }

        // Get career path
        const careerPath = await CareerPath.findById(assessment.careerPathId);
        if (!careerPath) {
            return res.status(404).json({
                success: false,
                message: "Career path not found"
            });
        }

        // Analyze skill gaps using AI
        const gapAnalysis = await analyzeSkillGaps(
            assessment.targetRole,
            careerPath.requiredSkills,
            assessment.skillScores
        );

        // Generate learning path using AI
        const learningPathData = await generateLearningPath(
            assessment.targetRole,
            gapAnalysis.skillGaps
        );

        // Calculate estimated completion date
        const estimatedCompletionDate = new Date();
        estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + learningPathData.totalWeeks * 7);

        // Create learning path
        const learningPath = new LearningPath({
            userId,
            careerPathId: careerPath._id,
            assessmentId: assessment._id,
            targetRole: assessment.targetRole,
            skillGaps: gapAnalysis.skillGaps,
            milestones: learningPathData.milestones,
            totalWeeks: learningPathData.totalWeeks,
            estimatedCompletionDate,
            currentWeek: 1,
            overallProgress: 0,
            lastActivityDate: new Date(),
            status: "active"
        });

        await learningPath.save();

        res.status(201).json({
            success: true,
            data: {
                learningPath,
                gapAnalysis: {
                    strengths: gapAnalysis.strengths,
                    criticalGaps: gapAnalysis.criticalGaps,
                    readinessScore: gapAnalysis.readinessScore
                }
            }
        });
    } catch (error: any) {
        console.error("Learning Path Creation Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create learning path",
            error: error.message
        });
    }
};

/**
 * Update milestone progress
 * POST /career/learning-path/progress
 */
export const updateMilestoneProgress = async (req: Request, res: Response) => {
    try {
        const { learningPathId, weekNumber, completed, certificateUrl } = req.body;

        if (!learningPathId || weekNumber === undefined) {
            return res.status(400).json({
                success: false,
                message: "learningPathId and weekNumber are required"
            });
        }

        const learningPath = await LearningPath.findById(learningPathId);
        if (!learningPath) {
            return res.status(404).json({
                success: false,
                message: "Learning path not found"
            });
        }

        // Find and update milestone
        const milestone = learningPath.milestones.find((m: any) => m.weekNumber === weekNumber);
        if (!milestone) {
            return res.status(404).json({
                success: false,
                message: "Milestone not found"
            });
        }

        milestone.completed = completed;
        if (completed) {
            milestone.completedDate = new Date();
        }

        if (certificateUrl) {
            milestone.certificateUrl = certificateUrl;
        }

        // Calculate overall progress
        const completedMilestones = learningPath.milestones.filter((m: any) => m.completed).length;
        learningPath.overallProgress = (completedMilestones / learningPath.milestones.length) * 100;
        learningPath.currentWeek = weekNumber + 1;
        learningPath.lastActivityDate = new Date();
        learningPath.updatedAt = new Date();

        // Check if all milestones completed
        if (completedMilestones === learningPath.milestones.length) {
            learningPath.status = "completed";
        }

        await learningPath.save();

        res.status(200).json({
            success: true,
            data: {
                learningPath,
                progress: learningPath.overallProgress
            }
        });
    } catch (error: any) {
        console.error("Progress Update Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update progress",
            error: error.message
        });
    }
};

/**
 * Get user's learning paths
 * GET /career/learning-path/:userId
 */
export const getUserLearningPaths = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const learningPaths = await LearningPath.find({ userId })
            .populate("careerPathId")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: learningPaths
        });
    } catch (error: any) {
        console.error("Get Learning Paths Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get learning paths",
            error: error.message
        });
    }
};
