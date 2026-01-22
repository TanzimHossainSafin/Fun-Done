import { Request, Response } from "express";
import mongoose from "mongoose";
import StudyGroup from "../models/studyGroup.model";
import StudyProfile from "../models/studyProfile.model";
import StudySession from "../models/studySession.model";
import {
    studyGroupSchema,
    studySessionSchema,
} from "../utils/validation";
import { suggestMeetingTimes } from "../utils/studyMatcher";

export const createStudyGroup = async (req: Request, res: Response) => {
    const validationResult = studyGroupSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({
            message: "Bad Request Please make sure your data format is correct",
            errors: validationResult.error.flatten(),
        });
    }

    const { name, subject, description, createdBy, memberIds, aiModeratorName } =
        validationResult.data;

    const uniqueMemberIds = Array.from(
        new Set([createdBy, ...(memberIds || [])])
    );
    const createdByObjectId = new mongoose.Types.ObjectId(createdBy);
    const memberObjectIds = uniqueMemberIds.map(
        (memberId) => new mongoose.Types.ObjectId(memberId)
    );

    const profiles = await StudyProfile.find({
        userId: { $in: memberObjectIds },
    }).lean();

    const meetingSuggestions = suggestMeetingTimes(
        profiles.map((profile) => ({
            userId: profile.userId.toString(),
            subjects: profile.subjects,
            goals: profile.goals || [],
            studyTimes: profile.studyTimes || [],
            learningStyle: profile.learningStyle,
        })),
        3
    );

    const group = await StudyGroup.create({
        name,
        subject,
        description,
        createdBy: createdByObjectId,
        aiModeratorName: aiModeratorName || "Udyomix AI Moderator",
        meetingSuggestions,
        members: memberObjectIds.map((memberId) => {
            const role: "admin" | "member" = memberId.equals(
                createdByObjectId
            )
                ? "admin"
                : "member";
            return {
                userId: memberId,
                role,
                joinedAt: new Date(),
            };
        }),
    });

    return res.status(201).json({
        message: "Study group created",
        group,
    });
};

export const joinStudyGroup = async (req: Request, res: Response) => {
    const { groupId } = req.params;
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "Bad Request" });
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const group = await StudyGroup.findById(groupId);
    if (!group) {
        return res.status(404).json({ message: "Study group not found" });
    }

    const alreadyMember = group.members.some(
        (member) => member.userId.toString() === userId
    );
    if (alreadyMember) {
        return res.status(409).json({ message: "You have already joined this group", group });
    }

    group.members.push({
        userId: userObjectId,
        role: "member",
        joinedAt: new Date(),
    });

    await group.save();

    return res.status(201).json({ message: "Joined the group successfully", group });
};

export const joinStudyGroupByName = async (req: Request, res: Response) => {
    const { groupName, userId } = req.body;
    if (!groupName || !userId) {
        return res.status(400).json({ message: "Bad Request" });
    }

    const group = await StudyGroup.findOne({
        name: { $regex: String(groupName), $options: "i" },
    });
    if (!group) {
        return res.status(404).json({ message: "Study group not found" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const alreadyMember = group.members.some(
        (member) => member.userId.toString() === userId
    );
    if (alreadyMember) {
        return res.status(409).json({ message: "You have already joined this group", group });
    }

    group.members.push({
        userId: userObjectId,
        role: "member",
        joinedAt: new Date(),
    });

    await group.save();
    return res.status(201).json({ message: "Joined the group successfully", group });
};

export const getStudyGroup = async (req: Request, res: Response) => {
    const { groupId } = req.params;
    const group = await StudyGroup.findById(groupId);
    if (!group) {
        return res.status(404).json({ message: "Study group not found" });
    }
    return res.status(200).json({ group });
};

export const listStudyGroups = async (req: Request, res: Response) => {
    const { userId } = req.query;
    const query = userId
        ? { "members.userId": new mongoose.Types.ObjectId(String(userId)) }
        : {};

    const groups = await StudyGroup.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ groups });
};

export const searchStudyGroups = async (req: Request, res: Response) => {
    const { query } = req.query;
    const search = String(query || "").trim();
    if (!search) {
        return res.status(200).json({ groups: [] });
    }

    const groups = await StudyGroup.find({
        name: { $regex: search, $options: "i" },
    })
        .sort({ createdAt: -1 })
        .limit(10);

    return res.status(200).json({ groups });
};

export const createStudySession = async (req: Request, res: Response) => {
    const { groupId } = req.params;
    const validationResult = studySessionSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({
            message: "Bad Request Please make sure your data format is correct",
            errors: validationResult.error.flatten(),
        });
    }

    const { topic, startedAt, endedAt, createdBy } = validationResult.data;
    const createdByObjectId = new mongoose.Types.ObjectId(createdBy);
    const group = await StudyGroup.findById(groupId);
    if (!group) {
        return res.status(404).json({ message: "Study group not found" });
    }

    const startedAtDate = new Date(startedAt);
    const endedAtDate = endedAt ? new Date(endedAt) : undefined;
    const durationMinutes =
        endedAtDate && startedAtDate
            ? Math.max(
                  0,
                  Math.round(
                      (endedAtDate.getTime() - startedAtDate.getTime()) / 60000
                  )
              )
            : undefined;

    const session = await StudySession.create({
        groupId,
        topic,
        startedAt: startedAtDate,
        endedAt: endedAtDate,
        durationMinutes,
        createdBy: createdByObjectId,
    });

    return res.status(201).json({
        message: "Study session logged",
        session,
    });
};

export const listStudySessions = async (req: Request, res: Response) => {
    const { groupId } = req.params;
    const sessions = await StudySession.find({ groupId }).sort({
        startedAt: -1,
    });
    return res.status(200).json({ sessions });
};
