import { useState, useEffect, useRef } from "react";
import { getUser } from "../auth/utils/authStorage";
import { fetchSchedule, analyzeSchedule } from "./services/scheduleService";
import type { Schedule, ScheduleAnalysis } from "./types";
import ScheduleCalendar from "./components/ScheduleCalendar";
import HabitTracker from "./components/HabitTracker";
import AIScheduleAnalyzer from "./components/AIScheduleAnalyzer";
import PomodoroTimer from "./components/PomodoroTimer";
import ProductivityReports from "./components/ProductivityReports";
import ExamStressPredictor from "./components/ExamStressPredictor";
import { DashboardLayout } from "../dashboard/components/DashboardLayout";

export default function TimetablePage() {
    const [schedule, setSchedule] = useState<Schedule | null>(null);
    const [analysis, setAnalysis] = useState<ScheduleAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"schedule" | "pomodoro" | "reports" | "stress">("schedule");
    
    // Timer state (runs in background across all tabs)
    const [timerActive, setTimerActive] = useState(false);
    const [timerMode, setTimerMode] = useState<"focus" | "break">("focus");
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentSubject, setCurrentSubject] = useState("");
    const timerIntervalRef = useRef<number | null>(null);

    const currentUser = getUser();
    const userId = currentUser?.id || "";

    useEffect(() => {
        loadSchedule();
    }, [userId]);

    // Background timer effect
    useEffect(() => {
        if (timerActive && timeLeft > 0) {
            timerIntervalRef.current = window.setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && timerActive) {
            setTimerActive(false);
            // Timer completed logic will be handled by PomodoroTimer component
        }

        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [timerActive, timeLeft]);

    const loadSchedule = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await fetchSchedule(userId);
            setSchedule(data.schedule);
        } catch (err: any) {
            console.error("Failed to load schedule:", err);
            // 404 means no schedule exists yet, which is fine
            if (err.response?.status === 404) {
                setSchedule(null);
            } else {
                setError("Failed to load schedule");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzeSchedule = async () => {
        try {
            setAnalyzing(true);
            setError("");
            const data = await analyzeSchedule({ userId });
            setAnalysis(data.analysis);
        } catch (err: any) {
            console.error("Analysis failed:", err);
            setError(err.response?.data?.message || "Failed to analyze schedule");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSessionComplete = async (duration: number, subject: string) => {
        try {
            await fetch("http://localhost:3000/app/v1/study/productivity/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    subject,
                    duration,
                    startTime: new Date(Date.now() - duration * 60000).toISOString(),
                    productivity: 4,
                    interruptions: 0,
                }),
            });
        } catch (error) {
            console.error("Failed to log session:", error);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    if (loading) {
        return (
            <DashboardLayout title="Smart Timetable" description="Manage your schedule and track habits">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading your schedule...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Smart Timetable & Productivity"
            description="AI-powered schedule management, Pomodoro timer, and productivity tracking"
        >
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Floating Mini Timer (shows when timer is active and not on Pomodoro tab) */}
            {timerActive && activeTab !== "pomodoro" && (
                <div className="fixed bottom-6 right-6 z-50">
                    <div className="relative">
                        {/* Mini Tomato Leaf */}
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                            <svg width="30" height="20" viewBox="0 0 30 20" fill="none">
                                <path d="M15 0 Q15 8, 12 10" stroke="#2d5016" strokeWidth="2" fill="none" />
                                <path d="M12 10 Q8 9, 5 13 Q8 15, 12 10" fill="#4ade80" stroke="#2d5016" strokeWidth="1" />
                                <path d="M12 10 Q16 8, 20 10 Q17 13, 12 10" fill="#4ade80" stroke="#2d5016" strokeWidth="1" />
                            </svg>
                        </div>

                        {/* Mini Tomato Body */}
                        <div className={`relative w-28 h-28 rounded-full shadow-2xl flex items-center justify-center ${
                            timerMode === "focus" 
                                ? "bg-gradient-to-br from-red-500 via-red-600 to-red-700" 
                                : "bg-gradient-to-br from-green-400 via-green-500 to-green-600"
                        }`}>
                            {/* Shine Effect */}
                            <div className="absolute top-4 left-4 w-8 h-10 bg-white opacity-20 rounded-full blur-lg"></div>
                            
                            {/* Seeds */}
                            {timerMode === "focus" && (
                                <>
                                    <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-red-800 rounded-full opacity-60"></div>
                                    <div className="absolute top-2/3 left-1/3 w-1 h-1 bg-red-800 rounded-full opacity-60"></div>
                                    <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-red-800 rounded-full opacity-60"></div>
                                </>
                            )}

                            {/* Content */}
                            <div className="text-center z-10 px-3">
                                <div className="text-xs font-medium text-white opacity-90 mb-1">
                                    {timerMode === "focus" ? "🎯" : "☕"}
                                </div>
                                <div className="text-2xl font-bold text-white drop-shadow-lg">
                                    {formatTime(timeLeft)}
                                </div>
                                {currentSubject && timerMode === "focus" && (
                                    <div className="text-[10px] text-white opacity-80 truncate max-w-[80px] mt-1">
                                        {currentSubject}
                                    </div>
                                )}
                                <button
                                    onClick={() => setActiveTab("pomodoro")}
                                    className="mt-2 text-[10px] px-2 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition"
                                >
                                    View
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab("schedule")}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                            activeTab === "schedule"
                                ? "border-indigo-600 text-indigo-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        📅 Schedule
                    </button>
                    <button
                        onClick={() => setActiveTab("pomodoro")}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                            activeTab === "pomodoro"
                                ? "border-indigo-600 text-indigo-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        🍅 Pomodoro Timer
                    </button>
                    <button
                        onClick={() => setActiveTab("reports")}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                            activeTab === "reports"
                                ? "border-indigo-600 text-indigo-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        📊 Productivity Reports
                    </button>
                    <button
                        onClick={() => setActiveTab("stress")}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                            activeTab === "stress"
                                ? "border-indigo-600 text-indigo-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        🎯 Stress Predictor
                    </button>
                </div>
            </div>

            {/* Schedule Tab */}
            {activeTab === "schedule" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <ScheduleCalendar 
                            schedule={schedule} 
                            userId={userId}
                            onScheduleUpdate={loadSchedule}
                        />
                    </div>
                    <div className="space-y-6">
                        <AIScheduleAnalyzer
                            analysis={analysis}
                            analyzing={analyzing}
                            onAnalyze={handleAnalyzeSchedule}
                            hasEvents={!!(schedule?.events && schedule.events.length > 0)}
                        />
                        <HabitTracker userId={userId} />
                    </div>
                </div>
            )}

            {/* Pomodoro Tab */}
            {activeTab === "pomodoro" && (
                <div className="max-w-2xl mx-auto">
                    <PomodoroTimer 
                        onSessionComplete={handleSessionComplete}
                        timerActive={timerActive}
                        setTimerActive={setTimerActive}
                        timerMode={timerMode}
                        setTimerMode={setTimerMode}
                        timeLeft={timeLeft}
                        setTimeLeft={setTimeLeft}
                        currentSubject={currentSubject}
                        setCurrentSubject={setCurrentSubject}
                    />
                </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
                <ProductivityReports userId={userId} />
            )}

            {/* Stress Predictor Tab */}
            {activeTab === "stress" && (
                <div className="max-w-3xl mx-auto">
                    <ExamStressPredictor userId={userId} />
                </div>
            )}
        </DashboardLayout>
    );
}
