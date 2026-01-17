import { Request, Response } from "express";
import mongoose from "mongoose";
import StudyProfile from "../models/studyProfile.model";
import { studyProfileSchema } from "../utils/validation";
import { getMatchScore, suggestMeetingTimes } from "../utils/studyMatcher";
import { getAIMatchRecommendation, isAIServiceAvailable } from "../services/aiService";

export const upsertStudyProfile = async (req: Request, res: Response) => {
    const validationResult = studyProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({
            message: "Bad Request Please make sure your data format is correct",
            errors: validationResult.error.flatten(),
        });
    }

    const { userId, subjects, studyTimes, learningStyle, goals } =
        validationResult.data;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const profile = await StudyProfile.findOneAndUpdate(
        { userId: userObjectId },
        {
            userId: userObjectId,
            subjects,
            studyTimes: studyTimes || [],
            learningStyle,
            goals: goals || [],
        },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
        }
    );

    return res
        .status(200)
        .json({ message: "Study profile saved", profile });
};

export const getStudyProfile = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const profile = await StudyProfile.findOne({
        userId: new mongoose.Types.ObjectId(userId),
    });
    if (!profile) {
        return res.status(404).json({ message: "Study profile not found" });
    }
    return res.status(200).json({ profile });
};

export const matchStudyPartners = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const limit = Number(req.query.limit) || 5;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const profile = await StudyProfile.findOne({ userId: userObjectId }).lean();
    if (!profile) {
        return res.status(404).json({ message: "Study profile not found" });
    }

    const candidates = await StudyProfile.find({
        userId: { $ne: userObjectId },
    }).lean();

    const scoredMatches = candidates.map((candidate) => {
        const match = getMatchScore(
            {
                userId: profile.userId.toString(),
                subjects: profile.subjects,
                goals: profile.goals || [],
                studyTimes: profile.studyTimes || [],
                learningStyle: profile.learningStyle,
            },
            {
                userId: candidate.userId.toString(),
                subjects: candidate.subjects,
                goals: candidate.goals || [],
                studyTimes: candidate.studyTimes || [],
                learningStyle: candidate.learningStyle,
            }
        );
        return {
            userId: candidate.userId,
            score: match.score,
            breakdown: match.breakdown,
            overlap: match.overlap,
        };
    });

    const matches = scoredMatches
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    const matchedProfiles = candidates.filter((candidate) =>
        matches.some(
            (match) => match.userId.toString() === candidate.userId.toString()
        )
    );

    const meetingSuggestions = suggestMeetingTimes(
        [
            {
                userId: profile.userId.toString(),
                subjects: profile.subjects,
                goals: profile.goals || [],
                studyTimes: profile.studyTimes || [],
                learningStyle: profile.learningStyle,
            },
            ...matchedProfiles.map((candidate) => ({
                userId: candidate.userId.toString(),
                subjects: candidate.subjects,
                goals: candidate.goals || [],
                studyTimes: candidate.studyTimes || [],
                learningStyle: candidate.learningStyle,
            })),
        ],
        3
    );

    // Add AI-enhanced recommendations if available
    const aiEnhancedMatches = await Promise.all(
        matches.map(async (match) => {
            const candidateProfile = matchedProfiles.find(
                (p) => p.userId.toString() === match.userId.toString()
            );

            if (!candidateProfile || !isAIServiceAvailable()) {
                return {
                    ...match,
                    profile: candidateProfile,
                    aiEnhancement: null,
                };
            }

            try {
                const aiEnhancement = await getAIMatchRecommendation(
                    {
                        subjects: profile.subjects,
                        goals: profile.goals || [],
                        learningStyle: profile.learningStyle,
                    },
                    {
                        subjects: candidateProfile.subjects,
                        goals: candidateProfile.goals || [],
                        learningStyle: candidateProfile.learningStyle,
                    },
                    match.score
                );

                return {
                    ...match,
                    profile: candidateProfile,
                    aiEnhancement: {
                        recommendation: aiEnhancement.aiRecommendation,
                        studyTips: aiEnhancement.studyTips,
                        suggestedTopics: aiEnhancement.suggestedTopics,
                        compatibilityInsights: aiEnhancement.compatibilityInsights,
                    },
                };
            } catch (error) {
                console.error("AI Enhancement Error:", error);
                return {
                    ...match,
                    profile: candidateProfile,
                    aiEnhancement: null,
                };
            }
        })
    );

    return res.status(200).json({
        message: "Match results generated",
        matches: aiEnhancedMatches,
        meetingSuggestions,
        aiEnabled: isAIServiceAvailable(),
    });
};
