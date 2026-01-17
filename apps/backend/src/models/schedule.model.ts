import mongoose from "mongoose";

export type ScheduleEventType = "class" | "study" | "exam" | "personal";

interface ScheduleEvent {
    title: string;
    start: Date;
    end: Date;
    type: ScheduleEventType;
    priority: number;
}

interface ScheduleInterface extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    productiveHours: string[];
    events: ScheduleEvent[];
}

const scheduleEventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        start: {
            type: Date,
            required: true,
        },
        end: {
            type: Date,
            required: true,
        },
        type: {
            type: String,
            enum: ["class", "study", "exam", "personal"],
            default: "study",
        },
        priority: {
            type: Number,
            default: 3,
        },
    },
    { _id: false }
);

const scheduleSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        productiveHours: {
            type: [String],
            default: [],
        },
        events: {
            type: [scheduleEventSchema],
            default: [],
        },
    },
    { timestamps: true }
);

const Schedule = mongoose.model<ScheduleInterface>("Schedule", scheduleSchema);

export default Schedule;
