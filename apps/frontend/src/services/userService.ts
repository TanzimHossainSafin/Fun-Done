import axios from "axios";
import type { JokeData } from "../components/ui/Form";

const BASE_URL = "http://localhost:3000/app/v1/funs";

//submit a joke 
export const submitJoke = async (joke: JokeData & { userId?: string }) => {
    const payload = {
        name: joke.name,
        category: joke.category,
        setup: joke.setup,
        punchline: joke.punchline,
        image: joke.imageUrl || '',
        userId: joke.userId
    };
    const result = await axios.post(`${BASE_URL}/addjokes`, payload);
    return result.data;
}

//get all jokes 
export const getJokes = async () => {
    const result = await axios.get(`${BASE_URL}/jokes`);
    return result.data?.joke ?? result.data;
}

//update a joke
export const updateJoke = async (id: string, joke: JokeData, userId?: string) => {
    const payload = {
        name: joke.name,
        category: joke.category,
        setup: joke.setup,
        punchline: joke.punchline,
        image: joke.imageUrl || '',
        userId: userId
    };
    const result = await axios.put(`${BASE_URL}/jokes/${id}`, payload);
    return result.data;
}

//delete a joke
export const deleteJoke = async (id: string, userId?: string) => {
    const result = await axios.delete(`${BASE_URL}/jokes/${id}`, {
        data: { userId }
    });
    return result.data;
}
