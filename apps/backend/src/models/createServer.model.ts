import mongoose from "mongoose";

interface CreateServerInterface extends mongoose.Document {
    serverName: string;
    description: string;
    adminUserId: string;
    members: Array<
        {
            userId: mongoose.Types.ObjectId;
            joinedAt: Date;
            role:'host' | 'member';
        }
    >;
    settings: {
        maxParticipants: number;
        contestDurationMinutes: number;
        votingEnabled: boolean;
    };
    status: 'waiting' | 'active' | 'inactive' | 'canceled';
    createdAt: Date;
    statrTime?: Date;
    endTime?: Date;
    createdAtContest?: Date;
    updatedAtContest?: Date;
}

const createServerSchema = new mongoose.Schema({
    serverName: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    adminUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            joinedAt: {
                type: Date,
                default: Date.now
            },
            role:{
                type:String,
                enum:['host','member'],
                default:'member'
            }
        }
    ],
    settings: {
        maxParticipants: {
            type: Number,
            default: 100
        },
        contestDurationMinutes: {
            type: Number,
            default: 60
        },
        votingEnabled: {
            type: Boolean,
            default: true
        }
    },
    status: {
        type: String,
        enum: ['waiting', 'active', 'inactive', 'canceled'],
        default: 'waiting'
    },
    createdAt: {
        type:Date,
        default:Date.now
    },
    statrTime:{
        type:Date
    },
    endTime:{
        type:Date
    },
    createdAtContest:{
        type:Date
    },
    updatedAtContest:{
        type:Date
    }
});

export default mongoose.model<CreateServerInterface>("CreateServer", createServerSchema);