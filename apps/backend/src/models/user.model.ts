import mongoose from "mongoose";

interface UserInterface extends mongoose.Document {
    username:{
        type: String,
        required:boolean,
        unique:boolean
    };
    email:{
        type: String,
        required:boolean,
        unique:boolean
    }
    password:{
        type: String,
        required:boolean
    };
    joinedServers:{
        type:Array<string>,
        default:[]
    }
    stats:{
        jokesSubmitted:{
            type:Number,
            default:0
        },
        contestsWon:{
            type:Number,
            default:0
        },
        totalVotes:{
            type:Number,
            default:0
        }
    }
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