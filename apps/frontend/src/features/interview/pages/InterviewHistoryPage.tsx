import { useState, useEffect } from "react";
import { getUser } from "../../auth/utils/authStorage";
import { getUserInterviewHistory } from "../services/interviewService";
import { DashboardLayout } from "../../dashboard/components/DashboardLayout";
import type { MockInterview } from "../types";

export const InterviewHistoryPage = () => {
    const [interviews, setInterviews] = useState<MockInterview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const user = getUser();
    const userId = user?.id || "";

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const result = await getUserInterviewHistory(userId);
            setInterviews(result.interviews);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to load interview history");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "in-progress":
                return "bg-blue-100 text-blue-800";
            case "abandoned":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (loading) {
        return (
            <DashboardLayout
                title="📜 Interview History"
                description="View your past interview sessions"
            >
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="📜 Interview History"
            description="View your past interview sessions and results"
        >
            <div className="space-y-6">

                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {interviews.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-gray-600 mb-4">No interview history yet</p>
                        <a
                            href="/interview"
                            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                        >
                            Start Your First Interview
                        </a>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {interviews.map((interview) => (
                            <div
                                key={interview._id}
                                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">
                                            {interview.targetRole}
                                        </h3>
                                        {interview.targetCompany && (
                                            <p className="text-gray-600">
                                                {interview.targetCompany}
                                            </p>
                                        )}
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                            interview.status
                                        )}`}
                                    >
                                        {interview.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                    <div>
                                        <div className="text-gray-600">Type</div>
                                        <div className="font-medium">{interview.interviewType}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Questions</div>
                                        <div className="font-medium">{interview.questions.length}</div>
                                    </div>
                                    {interview.overallScore && (
                                        <div>
                                            <div className="text-gray-600">Score</div>
                                            <div className="font-medium text-blue-600">
                                                {interview.overallScore}/100
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-gray-600">Date</div>
                                        <div className="font-medium">
                                            {new Date(interview.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {interview.status === "completed" && (
                                    <a
                                        href={`/interview/results/${interview._id}`}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        View Results →
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};
