import { useState, useEffect } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface Props {
    userId: string;
}

interface ProductivityReport {
    period: string;
    totalSessions: number;
    totalHours: string;
    avgProductivity: string;
    subjectBreakdown: Record<string, { count: number; totalMinutes: number; avgProductivity: number }>;
    dailyBreakdown: Record<string, { sessions: number; minutes: number }>;
}

interface ProductivityAnalysis {
    peakProductivityTimes: string[];
    subjectPerformance: Record<string, { avgDuration: number; avgProductivity: number }>;
    recommendations: string[];
    optimalSchedule: string;
}

export default function ProductivityReports({ userId }: Props) {
    const [period, setPeriod] = useState<"day" | "week" | "month">("week");
    const [report, setReport] = useState<ProductivityReport | null>(null);
    const [analysis, setAnalysis] = useState<ProductivityAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        loadReport();
    }, [period, userId]);

    const loadReport = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:3000/app/v1/study/productivity/report?userId=${userId}&period=${period}`
            );
            const data = await response.json();
            setReport(data.report);
        } catch (error) {
            console.error("Failed to load report:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadAnalysis = async () => {
        try {
            setAnalyzing(true);
            const response = await fetch(
                `http://localhost:3000/app/v1/study/productivity/analyze`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                }
            );
            const data = await response.json();
            setAnalysis(data.analysis);
        } catch (error) {
            console.error("Failed to analyze:", error);
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading report...</p>
                </div>
            </div>
        );
    }

    if (!report || report.totalSessions === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Productivity Reports</h3>
                <div className="text-center py-8">
                    <p className="text-sm text-gray-600">
                        No productivity data yet. Start using the Pomodoro timer to track your study sessions!
                    </p>
                </div>
            </div>
        );
    }

    // Prepare chart data
    const subjectLabels = Object.keys(report.subjectBreakdown);
    const subjectHours = subjectLabels.map(
        (subject) => (report.subjectBreakdown[subject].totalMinutes / 60).toFixed(1)
    );

    const dailyLabels = Object.keys(report.dailyBreakdown).sort().slice(-7);
    const dailyHours = dailyLabels.map(
        (date) => (report.dailyBreakdown[date].minutes / 60).toFixed(1)
    );

    const subjectBarData = {
        labels: subjectLabels,
        datasets: [
            {
                label: "Hours Studied",
                data: subjectHours,
                backgroundColor: "rgba(99, 102, 241, 0.6)",
                borderColor: "rgba(99, 102, 241, 1)",
                borderWidth: 1,
            },
        ],
    };

    const dailyLineData = {
        labels: dailyLabels.map(d => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })),
        datasets: [
            {
                label: "Daily Study Hours",
                data: dailyHours,
                fill: true,
                backgroundColor: "rgba(168, 85, 247, 0.1)",
                borderColor: "rgba(168, 85, 247, 1)",
                tension: 0.4,
            },
        ],
    };

    const productivityDoughnutData = {
        labels: subjectLabels,
        datasets: [
            {
                label: "Study Time Distribution",
                data: subjectHours,
                backgroundColor: [
                    "rgba(99, 102, 241, 0.8)",
                    "rgba(168, 85, 247, 0.8)",
                    "rgba(236, 72, 153, 0.8)",
                    "rgba(34, 197, 94, 0.8)",
                    "rgba(251, 146, 60, 0.8)",
                ],
                borderWidth: 2,
                borderColor: "#fff",
            },
        ],
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">📊 Productivity Reports</h3>
                    <div className="flex gap-2">
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value as any)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="day">Last 24 Hours</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                        </select>
                        <button
                            onClick={loadAnalysis}
                            disabled={analyzing}
                            className="px-4 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                            {analyzing ? "Analyzing..." : "🤖 AI Insights"}
                        </button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-indigo-50 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">{report.totalSessions}</div>
                        <div className="text-xs text-gray-600">Study Sessions</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{report.totalHours}h</div>
                        <div className="text-xs text-gray-600">Total Time</div>
                    </div>
                    <div className="p-4 bg-pink-50 rounded-lg">
                        <div className="text-2xl font-bold text-pink-600">{report.avgProductivity}/5</div>
                        <div className="text-xs text-gray-600">Avg Productivity</div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Study Time by Subject</h4>
                        <Bar
                            data={subjectBarData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { display: false },
                                },
                                scales: {
                                    y: { beginAtZero: true, title: { display: true, text: "Hours" } },
                                },
                            }}
                        />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Time Distribution</h4>
                        <Doughnut
                            data={productivityDoughnutData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { position: "bottom" },
                                },
                            }}
                        />
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Daily Study Pattern</h4>
                    <Line
                        data={dailyLineData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: { display: false },
                            },
                            scales: {
                                y: { beginAtZero: true, title: { display: true, text: "Hours" } },
                            },
                        }}
                    />
                </div>
            </div>

            {/* AI Analysis */}
            {analysis && (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg shadow-md p-6 border border-purple-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">🤖 AI Productivity Insights</h3>

                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-sm text-purple-900 mb-2">⏰ Peak Productivity Times</h4>
                            <div className="flex flex-wrap gap-2">
                                {analysis.peakProductivityTimes.map((time, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full"
                                    >
                                        {time}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-sm text-purple-900 mb-2">📈 Optimal Schedule</h4>
                            <p className="text-sm text-gray-700">{analysis.optimalSchedule}</p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-sm text-purple-900 mb-2">💡 Recommendations</h4>
                            <ul className="space-y-1">
                                {analysis.recommendations.map((rec, idx) => (
                                    <li key={idx} className="text-sm text-gray-700">
                                        • {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
