import { useState, useEffect, useRef } from "react";

interface Props {
    onSessionComplete?: (duration: number, subject: string) => void;
    timerActive: boolean;
    setTimerActive: (active: boolean) => void;
    timerMode: "focus" | "break";
    setTimerMode: (mode: "focus" | "break") => void;
    timeLeft: number;
    setTimeLeft: (time: number) => void;
    currentSubject: string;
    setCurrentSubject: (subject: string) => void;
}

export default function PomodoroTimer({ 
    onSessionComplete,
    timerActive,
    setTimerActive,
    timerMode,
    setTimerMode,
    timeLeft,
    setTimeLeft,
    currentSubject,
    setCurrentSubject,
}: Props) {
    const [focusDuration, setFocusDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [totalFocusTime, setTotalFocusTime] = useState(0);
    const [aiRecommendation, setAiRecommendation] = useState<string>("");
    
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Create notification sound
        audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77eeeTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgs7y2Yk2CBlou+3nnk0QDFC');
        
        // Initialize timer if not set
        if (timeLeft === 0) {
            setTimeLeft(focusDuration * 60);
        }
    }, []);

    useEffect(() => {
        // Check if timer completed
        if (timeLeft === 0 && timerActive) {
            handleTimerComplete();
        }
    }, [timeLeft, timerActive]);

    useEffect(() => {
        // AI recommendation based on sessions completed
        if (sessionsCompleted > 0) {
            const avgSessionTime = totalFocusTime / sessionsCompleted;
            if (sessionsCompleted >= 4) {
                setAiRecommendation("🧠 Great focus! After 4 sessions, take a longer 15-20 min break.");
            } else if (avgSessionTime < 20) {
                setAiRecommendation("💡 Try shorter breaks (3 min) if you're in flow state.");
            } else if (sessionsCompleted >= 2 && totalFocusTime > 60) {
                setAiRecommendation("✨ You've focused for over 1 hour. Consider a 10 min break.");
            }
        }
    }, [sessionsCompleted, totalFocusTime]);

    const handleTimerComplete = () => {
        setTimerActive(false);
        audioRef.current?.play();
        
        if (timerMode === "focus") {
            // Log completed session
            const sessionMinutes = focusDuration;
            setTotalFocusTime(prev => prev + sessionMinutes);
            setSessionsCompleted(prev => prev + 1);
            
            if (onSessionComplete && currentSubject) {
                onSessionComplete(sessionMinutes, currentSubject);
            }
            
            // Switch to break
            const recommendedBreak = calculateBreakTime();
            setBreakDuration(recommendedBreak);
            setTimeLeft(recommendedBreak * 60);
            setTimerMode("break");
            
            // Show notification
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Focus Session Complete! 🎉", {
                    body: `Great work! Time for a ${recommendedBreak} minute break.`,
                    icon: "📚"
                });
            }
        } else {
            // Break complete, back to focus
            setTimeLeft(focusDuration * 60);
            setTimerMode("focus");
            
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Break Over! 💪", {
                    body: "Ready to focus again?",
                    icon: "⏰"
                });
            }
        }
    };

    const calculateBreakTime = () => {
        // AI-recommended break based on patterns
        if (sessionsCompleted === 0) return 5;
        if (sessionsCompleted % 4 === 3) return 15; // Long break every 4 sessions
        if (totalFocusTime >= 90) return 10; // Longer break after 90+ min
        return 5;
    };

    const startTimer = () => {
        if (timerMode === "focus" && !currentSubject.trim()) {
            alert("Please enter what you're studying!");
            return;
        }
        
        // Request notification permission
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
        
        setTimerActive(true);
    };

    const pauseTimer = () => setTimerActive(false);
    
    const resetTimer = () => {
        setTimerActive(false);
        setTimeLeft(timerMode === "focus" ? focusDuration * 60 : breakDuration * 60);
    };

    const skipToBreak = () => {
        setTimerActive(false);
        setTimerMode("break");
        setTimeLeft(breakDuration * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const progress = timerMode === "focus" 
        ? ((focusDuration * 60 - timeLeft) / (focusDuration * 60)) * 100
        : ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100;

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                    {timerMode === "focus" ? "🎯 Focus Timer" : "☕ Break Time"}
                </h3>
                <div className="text-sm text-gray-600">
                    Sessions: {sessionsCompleted} | Total: {totalFocusTime}m
                </div>
            </div>

            {/* Timer Display */}
            <div className="mb-8">
                {/* Cartoon Tomato Clock */}
                <div className="relative w-96 h-[28rem] mx-auto mb-6 pt-12">
                    {/* Tomato Leaf/Stem */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20">
                        <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
                            {/* Stem */}
                            <path d="M50 8 Q50 25, 45 35" stroke="#2d5016" strokeWidth="5" fill="none" strokeLinecap="round" />
                            {/* Left Leaf */}
                            <path d="M45 35 Q25 30, 15 42 Q22 50, 45 35" fill="#5ecc7b" stroke="#2d5016" strokeWidth="2.5" />
                            <path d="M28 36 Q25 40, 22 44" stroke="#3d8f50" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                            {/* Right Leaf */}
                            <path d="M45 35 Q65 25, 78 38 Q68 48, 45 35" fill="#5ecc7b" stroke="#2d5016" strokeWidth="2.5" />
                            <path d="M62 32 Q65 36, 68 40" stroke="#3d8f50" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                        </svg>
                    </div>

                    {/* Tomato Body */}
                    <div className={`relative w-80 h-80 mx-auto rounded-full shadow-2xl transition-all duration-500 ${
                        timerMode === "focus" 
                            ? "bg-gradient-to-b from-red-400 via-red-500 to-red-600 animate-pulse" 
                            : "bg-gradient-to-b from-green-300 via-green-400 to-green-500"
                    }`} style={{ 
                        borderRadius: "45% 45% 50% 50%",
                        animation: timerActive ? "bounce 2s ease-in-out infinite" : "none",
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2), 0 10px 20px rgba(0, 0, 0, 0.15)"
                    }}>
                        {/* Cartoon Eyes */}
                        <div className="absolute top-20 left-16 flex gap-10 z-20">
                            {/* Left Eye */}
                            <div className="relative">
                                <div className="w-16 h-18 bg-white rounded-full shadow-lg"></div>
                                <div className={`absolute top-5 left-4 w-8 h-8 rounded-full transition-all duration-300 ${
                                    timerMode === "focus" ? "bg-gray-800" : "bg-green-700"
                                }`}>
                                    <div className="absolute top-1.5 left-1.5 w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </div>
                            {/* Right Eye */}
                            <div className="relative">
                                <div className="w-16 h-18 bg-white rounded-full shadow-lg"></div>
                                <div className={`absolute top-5 left-4 w-8 h-8 rounded-full transition-all duration-300 ${
                                    timerMode === "focus" ? "bg-gray-800" : "bg-green-700"
                                }`}>
                                    <div className="absolute top-1.5 left-1.5 w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        {/* Cute Blush Cheeks */}
                        <div className="absolute top-32 left-6 w-10 h-8 bg-red-300 rounded-full opacity-40 blur-sm"></div>
                        <div className="absolute top-32 right-6 w-10 h-8 bg-red-300 rounded-full opacity-40 blur-sm"></div>

                        {/* Cartoon Highlight/Shine */}
                        <div className="absolute top-8 left-10 w-24 h-28 bg-white opacity-30 rounded-full blur-2xl"></div>
                        <div className="absolute top-6 left-8 w-16 h-16 bg-white opacity-50 rounded-full"></div>

                        {/* Timer Display - Below Eyes */}
                        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10 w-full px-4">
                            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-3xl px-8 py-4 border-2 border-white border-opacity-40 mx-auto max-w-fit">
                                <div className="text-5xl font-black text-white drop-shadow-lg tracking-wider" style={{ 
                                    textShadow: "3px 3px 0px rgba(0,0,0,0.2), -1px -1px 0px rgba(255,255,255,0.3)"
                                }}>
                                    {formatTime(timeLeft)}
                                </div>
                            </div>
                        </div>

                        {/* Happy Smile Mouth - Just Above Timer */}
                        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20">
                            <svg width="100" height="50" viewBox="0 0 100 50">
                                <path 
                                    d="M10 10 Q50 35, 90 10" 
                                    stroke="#fff" 
                                    strokeWidth="5" 
                                    fill="none" 
                                    strokeLinecap="round"
                                    opacity="0.9"
                                />
                                <path 
                                    d="M10 10 Q50 35, 90 10" 
                                    stroke={timerMode === "focus" ? "#c92a2a" : "#2d5016"} 
                                    strokeWidth="4" 
                                    fill="none" 
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>

                        {/* Cartoon Highlight/Shine */}
                        <div className="absolute top-8 left-10 w-24 h-28 bg-white opacity-30 rounded-full blur-2xl"></div>
                        <div className="absolute top-6 left-8 w-16 h-16 bg-white opacity-50 rounded-full"></div>

                        {/* Progress Ring Around Tomato */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <ellipse
                                cx="160"
                                cy="160"
                                rx="156"
                                ry="156"
                                stroke="rgba(255, 255, 255, 0.2)"
                                strokeWidth="8"
                                fill="none"
                            />
                            <ellipse
                                cx="160"
                                cy="160"
                                rx="156"
                                ry="156"
                                stroke="rgba(255, 255, 255, 0.95)"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 156}`}
                                strokeDashoffset={`${2 * Math.PI * 156 * (1 - progress / 100)}`}
                                strokeLinecap="round"
                                style={{ 
                                    transition: "stroke-dashoffset 1s linear",
                                    filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))"
                                }}
                            />
                        </svg>

                        {/* Tomato Spots/Seeds */}
                        {timerMode === "focus" && (
                            <>
                                <div className="absolute top-1/4 left-10 w-4 h-4 bg-red-700 rounded-full opacity-30"></div>
                                <div className="absolute top-1/3 left-16 w-3 h-3 bg-red-700 rounded-full opacity-25"></div>
                                <div className="absolute bottom-1/4 left-12 w-4 h-4 bg-red-700 rounded-full opacity-30"></div>
                                <div className="absolute top-1/4 right-10 w-4 h-4 bg-red-700 rounded-full opacity-30"></div>
                                <div className="absolute top-1/3 right-16 w-3 h-3 bg-red-700 rounded-full opacity-25"></div>
                                <div className="absolute bottom-1/4 right-12 w-4 h-4 bg-red-700 rounded-full opacity-30"></div>
                            </>
                        )}
                    </div>

                    {/* Mode Label Below Tomato */}
                    <div className="text-center mt-6">
                        <div className={`inline-block px-4 py-2 rounded-full font-bold text-sm shadow-lg ${
                            timerMode === "focus" 
                                ? "bg-red-100 text-red-700" 
                                : "bg-green-100 text-green-700"
                        }`}>
                            {timerMode === "focus" ? "🎯 Focus Time!" : "☕ Break Time!"}
                        </div>
                        {currentSubject && timerMode === "focus" && (
                            <div className="text-sm text-gray-700 mt-2 font-medium">
                                Studying: {currentSubject}
                            </div>
                        )}
                    </div>
                </div>

                {/* Subject Input (Focus Mode Only) */}
                {timerMode === "focus" && !timerActive && (
                    <input
                        type="text"
                        value={currentSubject}
                        onChange={(e) => setCurrentSubject(e.target.value)}
                        placeholder="What are you studying?"
                        className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                )}

                {/* Controls */}
                <div className="flex gap-4 mb-6">
                    {!timerActive ? (
                        <button
                            onClick={startTimer}
                            className={`flex-1 px-8 py-4 text-lg text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 ${
                                timerMode === "focus" 
                                    ? "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800" 
                                    : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                            }`}
                        >
                            Start
                        </button>
                    ) : (
                        <button
                            onClick={pauseTimer}
                            className="flex-1 px-8 py-4 text-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-bold hover:from-yellow-600 hover:to-yellow-700 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            Pause
                        </button>
                    )}
                    <button
                        onClick={resetTimer}
                        className="px-8 py-4 text-lg bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-bold hover:from-gray-700 hover:to-gray-800 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        Reset
                    </button>
                    {timerMode === "focus" && timerActive && (
                        <button
                            onClick={skipToBreak}
                            className="px-8 py-4 text-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold hover:from-purple-700 hover:to-purple-800 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            Skip
                        </button>
                    )}
                </div>

                {/* Duration Settings (when not running) */}
                {!timerActive && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Focus (min)</label>
                            <input
                                type="number"
                                min="1"
                                max="60"
                                value={focusDuration}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 25;
                                    setFocusDuration(val);
                                    if (timerMode === "focus") setTimeLeft(val * 60);
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Break (min)</label>
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={breakDuration}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 5;
                                    setBreakDuration(val);
                                    if (timerMode === "break") setTimeLeft(val * 60);
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* AI Recommendation */}
            {aiRecommendation && (
                <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                    <p className="text-xs text-purple-900 font-medium">
                        {aiRecommendation}
                    </p>
                </div>
            )}
        </div>
    );
}
