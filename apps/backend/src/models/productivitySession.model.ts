import mongoose, { Schema, Document } from "mongoose";

interface IProductivitySession {
    userId: mongoose.Types.ObjectId;
    subject: string;
    duration: number; // in minutes
    startTime: Date;
    endTime: Date;
    sessionType: "focus" | "break";
    productivity: number; // 1-5 rating
    interruptions: number;
}

interface IProductivitySession extends Document {}

const productivitySessionSchema = new Schema<IProductivitySession>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        subject: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        sessionType: {
            type: String,
            enum: ["focus", "break"],
            default: "focus",
        },
        productivity: {
            type: Number,
            min: 1,
            max: 5,
            default: 3,
        },
        interruptions: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Index for faster queries
productivitySessionSchema.index({ userId: 1, startTime: -1 });

const ProductivitySession = mongoose.model<IProductivitySession>(
    "ProductivitySession",
    productivitySessionSchema
);

export default ProductivitySession;
