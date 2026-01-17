import {z} from 'zod';
export const registerSchema=z.object({
    username:z.string()
     .min(3,"Username must be at least 3 characters")
     .max(20,"Username must be at most 20 characters")
     .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email:z.string()
     .email({ message: "Invalid email format" }),
    password:z.string()
     .min(6,"Minimum length of pasword is at least 6 lenght")
});

export const studyProfileSchema = z.object({
    userId: z.string().min(1, "UserId is required"),
    subjects: z
        .array(z.string().min(1, "Subject cannot be empty"))
        .min(1, "At least one subject is required"),
    studyTimes: z.array(z.string().min(1)).optional().default([]),
    learningStyle: z
        .enum(["visual", "auditory", "kinesthetic", "reading_writing"])
        .optional(),
    goals: z.array(z.string().min(1)).optional().default([]),
});

export const studyGroupSchema = z.object({
    name: z.string().min(3, "Group name is required"),
    subject: z.string().min(2, "Subject is required"),
    description: z.string().min(3, "Description is required"),
    createdBy: z.string().min(1, "Creator userId is required"),
    memberIds: z.array(z.string().min(1)).optional().default([]),
    aiModeratorName: z.string().optional(),
});

export const studySessionSchema = z.object({
    topic: z.string().min(3, "Session topic is required"),
    startedAt: z.string().min(1, "startedAt is required"),
    endedAt: z.string().optional(),
    createdBy: z.string().min(1, "createdBy is required"),
});

export const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email format" }),
    password: z.string().min(6, "Password is required"),
});

export const scheduleSchema = z.object({
    userId: z.string().min(1, "userId is required"),
    productiveHours: z.array(z.string()).optional().default([]),
    events: z
        .array(
            z.object({
                title: z.string().min(1),
                start: z.string().min(1),
                end: z.string().min(1),
                type: z.enum(["class", "study", "exam", "personal"]),
                priority: z.number().min(1).max(5).optional().default(3),
            })
        )
        .optional()
        .default([]),
});

export const scheduleEventSchema = z.object({
    userId: z.string().min(1, "userId is required"),
    title: z.string().min(1, "title is required"),
    start: z.string().min(1, "start is required"),
    end: z.string().min(1, "end is required"),
    type: z.enum(["class", "study", "exam", "personal"]).optional().default("study"),
    priority: z.number().min(1).max(5).optional().default(3),
});

export const optimizeScheduleSchema = z.object({
    userId: z.string().min(1, "userId is required"),
    preferredStudyBlocks: z
        .array(
            z.object({
                subject: z.string().min(1),
                minutes: z.number().min(30).max(240),
                priority: z.number().min(1).max(5).optional().default(3),
            })
        )
        .optional()
        .default([]),
});