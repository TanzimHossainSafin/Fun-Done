import { Button } from "./Button";
import { useState, type FormEvent } from "react";

export interface JokeData {
    name: string;
    category: string;
    setup: string;
    punchline: string;
}

export interface FormProps {
    name: string;
    category: string;
    setup: string;
    punchline: string;
    onSubmit: (data: JokeData) => void;
};

export const Form = ({ name, category, setup, punchline, onSubmit }: FormProps) => {
    const [_name, setName] = useState('');
    const [_category, setCategory] = useState('');
    const [_setup, setSetup] = useState('');
    const [_punchline, setPunchline] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit({
            name: _name,
            category: _category,
            setup: _setup,
            punchline: _punchline
        });
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="text" placeholder={name} onChange={(e) => setName(e.target.value)} className="border p-2" />
            <input type="text" placeholder={category} onChange={(e) => setCategory(e.target.value)} className="border p-2" />
            <input type="text" placeholder={setup} onChange={(e) => setSetup(e.target.value)} className="border p-2" />
            <input type="text" placeholder={punchline} onChange={(e) => setPunchline(e.target.value)} className="border p-2" />
            <Button text="Submit" size="md" color="primary" type="submit" onClick={handleSubmit} />
        </form>
    )
};