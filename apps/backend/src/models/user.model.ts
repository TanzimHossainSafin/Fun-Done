import mongoose from "mongoose";

interface UserInterface extends mongoose.Document {
    username: string;
    email: string;
    password: string;
    joinedServers: string[];
    stats: {
        jokesSubmitted: number;
        contestsWon: number;
        totalVotes: number;
    };
}

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    joinedServers: {
        type: [String],
        default: []
    },
    stats: {
        jokesSubmitted: {
            type: Number,
            default: 0
        },
        contestsWon: {
            type: Number,
            default: 0
        },
        totalVotes: {
            type: Number,
            default: 0
        }
    }
}); 

const User = mongoose.model<UserInterface>("User", userSchema);
export default User;