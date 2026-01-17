import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getUser } from "../../auth/utils/authStorage";
import { StartInterviewForm } from "../components/StartInterviewForm";
import { InterviewQuestion } from "../components/InterviewQuestion";
import { InterviewResults } from "../components/InterviewResults";
import { DashboardLayout } from "../../dashboard/components/DashboardLayout";
import {
    submitInterviewAnswer,
    getNextQuestion,
    completeMockInterview,
    getInterviewResults,
} from "../services/interviewService";
import type { InterviewQuestion as IInterviewQuestion, MockInterview, InterviewSummary } from "../types";

type InterviewStage = "start" | "interview" | "results";

export const MockInterviewPage = () => {
    const [searchParams] = useSearchParams();
    const [stage, setStage] = useState<InterviewStage>("start");
    const [interviewId, setInterviewId] = useState<string>("");
    const [currentQuestion, setCurrentQuestion] = useState<IInterviewQuestion | null>(null);
    const [questionNumber, setQuestionNumber] = useState(1);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [interview, setInterview] = useState<MockInterview | null>(null);
    const [summary, setSummary] = useState<InterviewSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [targetRole, setTargetRole] = useState(searchParams.get("role") || "");

    const user = getUser();
    const userId = user?.id || "";

    const handleInterviewStarted = (id: string, firstQuestion: IInterviewQuestion) => {
        setInterviewId(id);
        setCurrentQuestion(firstQuestion);
        setQuestionNumber(1);
        setStage("interview");
    };

    const handleSubmitAnswer = async (answer: string, timeTaken: number) => {
        if (!currentQuestion) return;

        const result = await submitInterviewAnswer(
            interviewId,
            currentQuestion._id,
            answer,
            timeTaken
        );

        return result.feedback;
    };

    const handleNextQuestion = async () => {
        setLoading(true);
        try {
            const result = await getNextQuestion(interviewId);
            
            if (result.success && result.question) {
                setCurrentQuestion(result.question);
                setQuestionNumber(result.questionNumber);
                setTotalQuestions(result.totalQuestions);
            } else {
                // No more questions, complete interview
                await handleCompleteInterview();
            }
        } catch (error) {
            console.error("Error getting next question:", error);
            await handleCompleteInterview();
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteInterview = async () => {
        setLoading(true);
        try {
            await completeMockInterview(interviewId);
            const results = await getInterviewResults(interviewId);
            setInterview(results.interview);
            setSummary(results.summary);
            setStage("results");
        } catch (error) {
            console.error("Error completing interview:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToHome = () => {
        setStage("start");
        setInterviewId("");
        setCurrentQuestion(null);
        setQuestionNumber(1);
        setTotalQuestions(0);
        setInterview(null);
        setSummary(null);
    };

    if (loading) {
        return (
            <DashboardLayout
                title="🎯 Mock Interview"
                description="AI-powered interview practice"
            >
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="🎯 Mock Interview"
            description="Practice with AI-powered interview questions"
        >
            {stage === "start" && (
                <StartInterviewForm
                    userId={userId}
                    onInterviewStarted={handleInterviewStarted}
                    initialRole={targetRole}
                />
            )}

            {stage === "interview" && currentQuestion && (
                <InterviewQuestion
                    question={currentQuestion}
                    questionNumber={questionNumber}
                    totalQuestions={totalQuestions || questionNumber}
                    onSubmitAnswer={handleSubmitAnswer}
                    onNext={handleNextQuestion}
                />
            )}

            {stage === "results" && interview && summary && (
                <InterviewResults
                    interview={interview}
                    summary={summary}
                    onBackToHome={handleBackToHome}
                />
            )}
        </DashboardLayout>
    );
};
