import { useState, useEffect } from "react";
import type { InterviewQuestion as IInterviewQuestion, InterviewFeedback } from "../types";

interface InterviewQuestionProps {
    question: IInterviewQuestion;
    questionNumber: number;
    totalQuestions: number;
    onSubmitAnswer: (answer: string, timeTaken: number) => Promise<InterviewFeedback>;
    onNext: () => void;
}

export const InterviewQuestion = ({
    question,
    questionNumber,
    totalQuestions,
    onSubmitAnswer,
    onNext,
}: InterviewQuestionProps) => {
    const [answer, setAnswer] = useState("");
    const [startTime] = useState(Date.now());
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!answer.trim()) {
            setError("Please provide an answer");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const timeTaken = Math.floor((Date.now() - startTime) / 1000);
            const feedbackResult = await onSubmitAnswer(answer, timeTaken);
            setFeedback(feedbackResult);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to submit answer");
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        setAnswer("");
        setFeedback(null);
        setError("");
        onNext();
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "easy":
                return "text-green-600 bg-green-100";
            case "medium":
                return "text-yellow-600 bg-yellow-100";
            case "hard":
                return "text-red-600 bg-red-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            {/* Progress */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                        Question {questionNumber} of {totalQuestions}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty?.toUpperCase()}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                    />
                </div>
            </div>

            {/* Question */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {question.questionType}
                    </span>
                    {question.category && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {question.category}
                        </span>
                    )}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {question.questionText}
                </h3>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {!feedback ? (
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                            Your Answer
                        </label>
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            rows={8}
                            className="w-full px-3 py-2 border rounded-md resize-none"
                            placeholder="Type your answer here..."
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !answer.trim()}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                    >
                        {loading ? "Analyzing..." : "Submit Answer"}
                    </button>
                </form>
            ) : (
                <div className="space-y-4">
                    {/* Overall Score */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-lg mb-2">Overall Score</h4>
                        <div className="text-3xl font-bold text-blue-600">
                            {feedback.overallScore}/10
                        </div>
                    </div>

                    {/* Detailed Scores */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-sm text-gray-600">Communication</div>
                            <div className="text-xl font-semibold">{feedback.communicationScore}/10</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-sm text-gray-600">Technical</div>
                            <div className="text-xl font-semibold">{feedback.technicalAccuracy}/10</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-sm text-gray-600">Structure</div>
                            <div className="text-xl font-semibold">{feedback.structureScore}/10</div>
                        </div>
                    </div>

                    {/* Strengths */}
                    {feedback.strengths.length > 0 && (
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-green-800 mb-2">✓ Strengths</h4>
                            <ul className="list-disc list-inside space-y-1 text-green-700">
                                {feedback.strengths.map((strength, idx) => (
                                    <li key={idx}>{strength}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Improvements */}
                    {feedback.improvements.length > 0 && (
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-yellow-800 mb-2">⚡ Areas to Improve</h4>
                            <ul className="list-disc list-inside space-y-1 text-yellow-700">
                                {feedback.improvements.map((improvement, idx) => (
                                    <li key={idx}>{improvement}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Suggestions */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-purple-800 mb-2">💡 Suggestions</h4>
                        <p className="text-purple-700">{feedback.suggestions}</p>
                    </div>

                    <button
                        onClick={handleNext}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 font-medium"
                    >
                        Next Question →
                    </button>
                </div>
            )}
        </div>
    );
};
