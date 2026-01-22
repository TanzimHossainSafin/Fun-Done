import type { MockInterview, InterviewSummary } from "../types";

interface InterviewResultsProps {
    interview: MockInterview;
    summary: InterviewSummary;
    onBackToHome: () => void;
}

export const InterviewResults = ({ interview, summary, onBackToHome }: InterviewResultsProps) => {
    const getReadinessColor = (level: string) => {
        switch (level) {
            case "well-prepared":
                return "bg-green-100 text-green-800";
            case "ready":
                return "bg-blue-100 text-blue-800";
            case "needs-practice":
                return "bg-yellow-100 text-yellow-800";
            case "not-ready":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-3xl font-bold mb-4">Interview Completed! 🎉</h2>
                
                {/* Overall Score */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-6">
                    <div className="text-center">
                        <div className="text-lg mb-2">Overall Score</div>
                        <div className="text-5xl font-bold">{summary.overallScore}/100</div>
                        <div className={`inline-block mt-4 px-4 py-2 rounded-full ${getReadinessColor(summary.readinessLevel)}`}>
                            {summary.readinessLevel.replace("-", " ").toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* Interview Details */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                        <div className="text-gray-600">Target Role</div>
                        <div className="font-semibold">{interview.targetRole}</div>
                    </div>
                    {interview.targetCompany && (
                        <div className="bg-gray-50 p-3 rounded">
                            <div className="text-gray-600">Target Company</div>
                            <div className="font-semibold">{interview.targetCompany}</div>
                        </div>
                    )}
                    <div className="bg-gray-50 p-3 rounded">
                        <div className="text-gray-600">Interview Type</div>
                        <div className="font-semibold">{interview.interviewType}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                        <div className="text-gray-600">Questions Answered</div>
                        <div className="font-semibold">{interview.responses.length}</div>
                    </div>
                </div>

                {/* Strengths */}
                {summary.strengths.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                            <span className="text-green-600">✓</span> Your Strengths
                        </h3>
                        <div className="space-y-2">
                            {summary.strengths.map((strength, idx) => (
                                <div key={idx} className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                                    {strength}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Areas to Improve */}
                {summary.areasToImprove.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                            <span className="text-yellow-600">⚡</span> Areas to Improve
                        </h3>
                        <div className="space-y-2">
                            {summary.areasToImprove.map((area, idx) => (
                                <div key={idx} className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                                    {area}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                {summary.recommendations.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                            <span className="text-purple-600">💡</span> Recommendations
                        </h3>
                        <div className="space-y-2">
                            {summary.recommendations.map((rec, idx) => (
                                <div key={idx} className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
                                    {rec}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Encouragement */}
                <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-lg mb-6">
                    <p className="text-center text-gray-800 italic">"{summary.encouragement}"</p>
                </div>

                <button
                    onClick={onBackToHome}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
};
