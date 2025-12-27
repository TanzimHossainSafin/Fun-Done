import mongoose from "mongoose";

interface JokeInterface extends mongoose.Document {
    name: string;
    category: string;
    setup: string;
    punchline: string;
}
const jokeSchema = new mongoose.Schema({
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
    }
});

export default mongoose.model<JokeInterface>("Joke", jokeSchema);
