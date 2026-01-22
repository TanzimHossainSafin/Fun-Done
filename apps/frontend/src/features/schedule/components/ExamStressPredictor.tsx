import { useState } from "react";

interface Props {
    userId: string;
}

interface StressPrediction {
    stressLevel: "low" | "medium" | "high" | "critical";
    stressPeriods: Array<{ date: string; level: string; reason: string }>;
    recommendations: string[];
    actionPlan: string;
}

export default function ExamStressPredictor({ userId }: Props) {
    const [prediction, setPrediction] = useState<StressPrediction | null>(null);
    const [loading, setLoading] = useState(false);
    const [workload, setWorkload] = useState(20);

    const predictStress = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:3000/app/v1/study/productivity/stress`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, currentWorkload: workload }),
                }
            );
            const data = await response.json();
            setPrediction(data.prediction);
        } catch (error) {
            console.error("Failed to predict stress:", error);
            alert("Failed to predict stress. Make sure you have events in your schedule.");
        } finally {
            setLoading(false);
        }
    };

    const getStressColor = (level: string) => {
        switch (level) {
            case "low": return "bg-green-100 text-green-800 border-green-300";
            case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "high": return "bg-orange-100 text-orange-800 border-orange-300";
            case "critical": return "bg-red-100 text-red-800 border-red-300";
            default: return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    const getStressEmoji = (level: string) => {
        switch (level) {
            case "low": return "😌";
            case "medium": return "😐";
            case "high": return "😰";
            case "critical": return "😱";
            default: return "🤔";
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Exam Stress Predictor</h3>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Weekly Workload (hours)
                </label>
                <input
                    type="number"
                    min="0"
                    max="80"
                    value={workload}
                    onChange={(e) => setWorkload(parseInt(e.target.value) || 20)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Estimate your current study/class hours per week
                </p>
            </div>

            <button
                onClick={predictStress}
                disabled={loading}
                className="w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition disabled:opacity-50 mb-4"
            >
                {loading ? "Predicting..." : "🔮 Predict Stress Levels"}
            </button>

            {prediction && (
                <div className="space-y-4">
                    {/* Overall Stress Level */}
                    <div className={`p-4 border-2 rounded-lg ${getStressColor(prediction.stressLevel)}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium">Overall Stress Level</div>
                                <div className="text-2xl font-bold capitalize mt-1">
                                    {prediction.stressLevel}
                                </div>
                            </div>
                            <div className="text-5xl">
                                {getStressEmoji(prediction.stressLevel)}
                            </div>
                        </div>
                    </div>

                    {/* Stress Periods */}
                    {prediction.stressPeriods.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-sm text-gray-900 mb-2">📅 High Stress Periods</h4>
                            <div className="space-y-2">
                                {prediction.stressPeriods.map((period, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-3 border rounded-lg ${getStressColor(period.level)}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="text-sm font-medium">
                                                    {new Date(period.date).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </div>
                                                <div className="text-xs mt-1">{period.reason}</div>
                                            </div>
                                            <span className="text-xs font-medium px-2 py-1 bg-white rounded capitalize">
                                                {period.level}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Plan */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-sm text-blue-900 mb-2">📝 Action Plan</h4>
                        <p className="text-sm text-blue-800">{prediction.actionPlan}</p>
                    </div>

                    {/* Recommendations */}
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-sm text-green-900 mb-2">💡 Stress Management Tips</h4>
                        <ul className="space-y-1">
                            {prediction.recommendations.map((rec, idx) => (
                                <li key={idx} className="text-sm text-green-800">
                                    • {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
