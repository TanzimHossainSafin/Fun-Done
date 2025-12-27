import axios from "axios";
import type { JokeData } from "../components/ui/Form";

const BASE_URL = "http://localhost:3000/app/v1/funs";

//submit a joke 
export const submitJoke = async (joke: JokeData) => {
    const result = await axios.post(`${BASE_URL}/addjokes`, joke);
    return result;
}

//get all jokes 
export const getJokes = async () => {
    const result = await axios.get(`${BASE_URL}/jokes`);
    return result.data;
}
