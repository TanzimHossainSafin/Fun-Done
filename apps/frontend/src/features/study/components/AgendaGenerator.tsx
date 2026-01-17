import { useState } from "react";
import { generateStudyAgenda, type StudyAgenda } from "../services/aiService";

export const AgendaGenerator = () => {
    const [topic, setTopic] = useState("");
    const [duration, setDuration] = useState(60);
    const [goals, setGoals] = useState("");
    const [agenda, setAgenda] = useState<StudyAgenda | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError("Topic is required");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const memberGoals = goals
                .split(",")
                .map((g) => g.trim())
                .filter((g) => g);
            
            const result = await generateStudyAgenda(topic, duration, memberGoals);
            setAgenda(result);
        } catch (err) {
            setError("Failed to generate agenda");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card-3d rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
                🎯 AI Study Session Agenda Generator
            </h3>
            <p className="mt-1 text-sm text-slate-500">
                Generate a structured agenda for your study session
            </p>

            <div className="mt-4 space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                    Topic *
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., Data Structures and Algorithms"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                    Duration (minutes)
                    <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        min={15}
                        max={240}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                    Goals (comma-separated)
                    <input
                        type="text"
                        value={goals}
                        onChange={(e) => setGoals(e.target.value)}
                        placeholder="e.g., Master sorting, Understand trees, Practice problems"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </label>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !topic.trim()}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    type="button"
                >
                    {isLoading ? "Generating..." : "Generate Agenda"}
                </button>
            </div>

            {agenda && (
                <div className="mt-6 space-y-4">
                    <div className="rounded-lg bg-blue-50 p-4">
                        <h4 className="font-semibold text-blue-900">📋 Agenda</h4>
                        <ul className="mt-2 space-y-1 text-sm text-blue-800">
                            {agenda.agenda.map((item, idx) => (
                                <li key={idx} className="flex gap-2">
                                    <span className="font-semibold">{idx + 1}.</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-lg bg-green-50 p-4">
                        <h4 className="font-semibold text-green-900">🎯 Objectives</h4>
                        <ul className="mt-2 space-y-1 text-sm text-green-800">
                            {agenda.objectives.map((item, idx) => (
                                <li key={idx} className="flex gap-2">
                                    <span>•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-lg bg-purple-50 p-4">
                        <h4 className="font-semibold text-purple-900">📚 Resources</h4>
                        <ul className="mt-2 space-y-1 text-sm text-purple-800">
                            {agenda.resources.map((item, idx) => (
                                <li key={idx} className="flex gap-2">
                                    <span>•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};
