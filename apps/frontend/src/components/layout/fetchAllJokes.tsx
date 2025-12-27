import { getJokes } from "../../services/userService";
import { useEffect, useState } from "react";
export const FetchAllJokes = () => {
    const [jokes, setJokes] = useState([]);
    useEffect(() => {
        getJokes().then((jokes) => setJokes(jokes));
    }, []);
    return (
        <div>
            <h2>Fetch All Jokes</h2>
            {JSON.stringify(jokes)}
        </div>
    )
};