import type { ScheduleAnalysis } from "../types";

interface Props {
    analysis: ScheduleAnalysis | null;
    analyzing: boolean;
    onAnalyze: () => void;
    hasEvents: boolean;
}

export default function AIScheduleAnalyzer({ analysis, analyzing, onAnalyze, hasEvents }: Props) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">🤖 AI Schedule Analysis</h3>
                <button
                    onClick={onAnalyze}
                    disabled={analyzing || !hasEvents}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {analyzing ? "Analyzing..." : "Analyze"}
                </button>
            </div>

            {!hasEvents && (
                <div className="text-center py-6">
                    <p className="text-sm text-gray-500">
                        Add events to your schedule to get AI analysis
                    </p>
                </div>
            )}

            {analysis && (
                <div className="space-y-4">
                    {/* Productivity Score */}
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                                Productivity Score
                            </span>
                            <span className="text-2xl font-bold text-indigo-600">
                                {analysis.productivityScore}/100
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${analysis.productivityScore}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Analysis */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2">📊 Analysis</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {analysis.analysis}
                        </p>
                    </div>

                    {/* Recommendations */}
                    {analysis.recommendations.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">💡 Recommendations</h4>
                            <ul className="space-y-2">
                                {analysis.recommendations.map((rec, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                        <span className="text-green-600 mt-0.5">✓</span>
                                        <span className="text-gray-700">{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Warnings */}
                    {analysis.warnings.length > 0 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Warnings</h4>
                            <ul className="space-y-1">
                                {analysis.warnings.map((warning, index) => (
                                    <li key={index} className="text-sm text-yellow-700">
                                        • {warning}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {!analysis && hasEvents && (
                <div className="text-center py-6">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400 mb-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                    </svg>
                    <p className="text-sm text-gray-500">
                        Click "Analyze" to get AI-powered insights about your schedule
                    </p>
                </div>
            )}
        </div>
    );
}
