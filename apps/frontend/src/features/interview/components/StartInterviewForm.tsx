import { useState } from "react";
import { startMockInterview } from "../services/interviewService";

interface StartInterviewFormProps {
    userId: string;
    onInterviewStarted: (interviewId: string, firstQuestion: any) => void;
    initialRole?: string;
}

export const StartInterviewForm = ({ userId, onInterviewStarted, initialRole = "" }: StartInterviewFormProps) => {
    const [targetRole, setTargetRole] = useState(initialRole);
    const [targetCompany, setTargetCompany] = useState("");
    const [industry, setIndustry] = useState("");
    const [interviewType, setInterviewType] = useState<"technical" | "behavioral" | "mixed" | "case-study">("mixed");
    const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await startMockInterview({
                userId,
                targetRole,
                targetCompany: targetCompany || undefined,
                industry: industry || undefined,
                interviewType,
                difficulty,
            });

            onInterviewStarted(result.interviewId, result.firstQuestion);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to start interview");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Start Mock Interview</h2>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Target Role *
                    </label>
                    <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g., Software Engineer, Data Analyst"
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Target Company (Optional)
                    </label>
                    <input
                        type="text"
                        value={targetCompany}
                        onChange={(e) => setTargetCompany(e.target.value)}
                        placeholder="e.g., Google, Microsoft"
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Industry (Optional)
                    </label>
                    <input
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="e.g., Technology, Finance"
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Interview Type
                    </label>
                    <select
                        value={interviewType}
                        onChange={(e) => setInterviewType(e.target.value as any)}
                        className="w-full px-3 py-2 border rounded-md"
                    >
                        <option value="mixed">Mixed (Technical + Behavioral)</option>
                        <option value="technical">Technical Only</option>
                        <option value="behavioral">Behavioral Only</option>
                        <option value="case-study">Case Study</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Difficulty Level
                    </label>
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as any)}
                        className="w-full px-3 py-2 border rounded-md"
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? "Starting Interview..." : "Start Interview"}
                </button>
            </form>
        </div>
    );
};
