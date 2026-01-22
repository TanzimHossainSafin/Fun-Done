import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getUser } from "../auth/utils/authStorage";
import careerService, { type AssessmentQuestion } from "../../services/careerService";
import { DashboardLayout } from "../dashboard/components/DashboardLayout";

export default function SkillAssessmentPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [assessmentId, setAssessmentId] = useState("");
    const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState("");
    const [codeAnswer, setCodeAnswer] = useState("");
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
    const [error, setError] = useState("");

    const targetRole = searchParams.get("role") || "";
    const careerPathId = searchParams.get("careerPathId") || "";

    useEffect(() => {
        startAssessment();
    }, []);

    const startAssessment = async () => {
        try {
            const user = getUser();
            if (!user) {
                setError("Please login to continue");
                setLoading(false);
                return;
            }
            
            const result = await careerService.createSkillAssessment(
                user.id,
                targetRole,
                careerPathId
            );

            setAssessmentId(result.assessmentId);
            setQuestions(result.questions);
            setQuestionStartTime(Date.now());
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to start assessment");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!selectedAnswer && !codeAnswer) {
            alert("Please provide an answer");
            return;
        }

        const currentQuestion = questions[currentQuestionIndex];
        const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

        try {
            await careerService.submitAssessmentAnswer(
                assessmentId,
                currentQuestion._id,
                codeAnswer || selectedAnswer,
                timeTaken,
                codeAnswer || undefined
            );

            setAnsweredQuestions(prev => new Set(prev).add(currentQuestionIndex));
            
            // Move to next question
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setSelectedAnswer("");
                setCodeAnswer("");
                setQuestionStartTime(Date.now());
            } else {
                // Assessment complete
                completeAssessment();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to submit answer");
        }
    };

    const completeAssessment = async () => {
        try {
            await careerService.completeSkillAssessment(assessmentId);
            // Navigate to results page
            navigate(`/career/assessment/results?assessmentId=${assessmentId}`);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to complete assessment");
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "easy": return "bg-green-100 text-green-700";
            case "medium": return "bg-yellow-100 text-yellow-700";
            case "hard": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    if (loading) {
        return (
            <DashboardLayout
                title="Skills Assessment"
                description="Preparing your personalized assessment"
            >
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-xl font-semibold text-gray-700">Preparing Your Assessment...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout
                title="Assessment Error"
                description="Something went wrong"
            >
                <div className="flex items-center justify-center py-20">
                    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
                        <div className="text-red-600 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={() => navigate("/dashboard/career")}
                            className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
                        >
                            Back to Career Analyzer
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (questions.length === 0) {
        return (
            <DashboardLayout
                title="Skills Assessment"
                description="No questions available"
            >
                <div className="flex items-center justify-center py-20">
                    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
                        <div className="text-6xl mb-4">📝</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Questions Available</h2>
                        <p className="text-gray-600">Please try again later.</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <DashboardLayout
            title={`Skills Assessment - ${targetRole}`}
            description="Answer questions to evaluate your skills"
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Skills Assessment</h1>
                            <p className="text-sm text-gray-600">for {targetRole}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-indigo-600">
                                {currentQuestionIndex + 1}/{questions.length}
                            </div>
                            <div className="text-sm text-gray-600">questions</div>
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    {/* Question Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(currentQuestion.difficulty)}`}>
                            {currentQuestion.difficulty.toUpperCase()}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                            {currentQuestion.skillCategory}
                        </span>
                    </div>

                    {/* Question Text */}
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        {currentQuestion.questionText}
                    </h2>

                    {/* Multiple Choice Options */}
                    {currentQuestion.options && currentQuestion.options.length > 0 && (
                        <div className="space-y-3 mb-6">
                            {currentQuestion.options.map((option, index) => (
                                <label
                                    key={index}
                                    className={`block p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                                        selectedAnswer === option
                                            ? "border-indigo-600 bg-indigo-50"
                                            : "border-gray-200 hover:border-indigo-300"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="answer"
                                        value={option}
                                        checked={selectedAnswer === option}
                                        onChange={(e) => setSelectedAnswer(e.target.value)}
                                        className="mr-3"
                                    />
                                    <span className="font-medium text-gray-900">{option}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {/* Code Challenge */}
                    {currentQuestion.codeChallenge && (
                        <div className="mb-6">
                            <div className="bg-gray-900 text-green-400 p-4 rounded-xl mb-4 font-mono text-sm">
                                <div className="text-gray-400 mb-2"># {currentQuestion.codeChallenge.language}</div>
                                <div className="whitespace-pre-wrap">{currentQuestion.codeChallenge.prompt}</div>
                                
                                {currentQuestion.codeChallenge.testCases && (
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <div className="text-gray-400 mb-2">Test Cases:</div>
                                        {currentQuestion.codeChallenge.testCases.map((test, idx) => (
                                            <div key={idx} className="ml-4 mb-1">
                                                Input: {test.input} → Output: {test.expectedOutput}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <textarea
                                value={codeAnswer}
                                onChange={(e) => setCodeAnswer(e.target.value)}
                                placeholder="Write your code here..."
                                rows={10}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => {
                            if (currentQuestionIndex > 0) {
                                setCurrentQuestionIndex(currentQuestionIndex - 1);
                                setSelectedAnswer("");
                                setCodeAnswer("");
                            }
                        }}
                        disabled={currentQuestionIndex === 0}
                        className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        ← Previous
                    </button>

                    <div className="text-sm text-gray-600">
                        {answeredQuestions.size} of {questions.length} answered
                    </div>

                    <button
                        onClick={handleSubmitAnswer}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                    >
                        {currentQuestionIndex === questions.length - 1 ? "Finish ✓" : "Next →"}
                    </button>
                </div>

                {/* Question Navigator */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Question Navigator</h3>
                    <div className="flex flex-wrap gap-2">
                        {questions.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setCurrentQuestionIndex(index);
                                    setSelectedAnswer("");
                                    setCodeAnswer("");
                                }}
                                className={`w-10 h-10 rounded-lg font-semibold transition ${
                                    index === currentQuestionIndex
                                        ? "bg-indigo-600 text-white"
                                        : answeredQuestions.has(index)
                                        ? "bg-green-100 text-green-700 border-2 border-green-300"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
