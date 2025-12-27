import { submitJoke } from "../../services/userService";
import { Form } from "../ui/Form";

export const SubmitJokes = () => {
    return (
        <div>
            <h2>Submit Jokes</h2>
            <Form name="name" category="category" setup="setup" punchline="punchline" onSubmit={submitJoke} />
        </div>
    )
}