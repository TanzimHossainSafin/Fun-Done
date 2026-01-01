import mongoose from "mongoose";

interface IContestJoke extends mongoose.Document {
    serverId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    name: string;
    category: string;
    setup: string;
    punchline: string;
    votes: Array<{
        userId: mongoose.Types.ObjectId;
        votedAt: Date;
    }>;
    voteCount: number;
    submittedAt: Date;
}
const jokeSchema = new mongoose.Schema({
    serverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CreateServer',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    setup: {
        type: String,
        required: true
    },
    punchline: {
        type: String,
        required: true
    },
    votes: [
        {
            userId: {
                type : mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            votedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    voteCount: {
        type: Number,
        default: 0
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});
export default mongoose.model<IContestJoke>("ContestJoke", jokeSchema);
