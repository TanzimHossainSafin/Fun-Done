import { useState } from "react";
import { getUser } from "../../auth/utils/authStorage";
import { fetchMatches } from "../services/studyService";
import type { MatchResult } from "../types";

export const MatchResults = () => {
    const [limit, setLimit] = useState(5);
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [meetingSuggestions, setMeetingSuggestions] = useState<string[]>([]);
    const [status, setStatus] = useState("");

    const handleFetch = async () => {
        setStatus("");
        const user = getUser();
        if (!user) {
            setStatus("লগইন করা নেই");
            return;
        }
        try {
            const result = await fetchMatches(user.id, limit);
            setMatches(result.matches);
            setMeetingSuggestions(result.meetingSuggestions);
            setStatus("ম্যাচ পাওয়া গেছে");
        } catch (error) {
            setStatus("ম্যাচ পাওয়া যায়নি");
        }
    };

    return (
        <section className="card-3d rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
                স্টাডি ম্যাচ
            </h2>
            <p className="mt-1 text-sm text-slate-500">
                সেরা স্টাডি পার্টনারদের লিস্ট।
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                    Limit
                    <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        type="number"
                        min={1}
                        max={10}
                        value={limit}
                        onChange={(event) =>
                            setLimit(Number(event.target.value))
                        }
                    />
                </label>
            </div>
            <div className="mt-4 flex items-center gap-3">
                <button
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    type="button"
                    onClick={handleFetch}
                    disabled={false}
                >
                    ম্যাচ বের করো
                </button>
                {status ? (
                    <p className="text-sm text-emerald-600">{status}</p>
                ) : null}
            </div>
            <div className="mt-6 space-y-3">
                {meetingSuggestions.length > 0 && (
                    <p className="text-sm text-slate-600">
                        সাজেস্টেড সময়: {meetingSuggestions.join(", ")}
                    </p>
                )}
                {matches.length === 0 ? (
                    <p className="text-sm text-slate-400">ম্যাচ এখনো নেই</p>
                ) : (
                    matches.map((match) => (
                        <article
                            key={match.userId}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-800">
                                    User: {match.userId}
                                </h3>
                                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
                                    Score {match.score}
                                </span>
                            </div>
                            <div className="mt-2 text-xs text-slate-600">
                                <p>
                                    Subjects:{" "}
                                    {match.overlap.subjects.join(", ") || "-"}
                                </p>
                                <p>
                                    Goals: {match.overlap.goals.join(", ") || "-"}
                                </p>
                                <p>
                                    Study times:{" "}
                                    {match.overlap.studyTimes.join(", ") || "-"}
                                </p>
                            </div>
                            
                            {match.aiEnhancement && (
                                <div className="mt-3 space-y-2 rounded-lg bg-blue-50 p-3">
                                    <div className="flex items-start gap-2">
                                        <span className="text-blue-600">🤖</span>
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-blue-900">
                                                AI Recommendation
                                            </p>
                                            <p className="mt-1 text-xs text-blue-800">
                                                {match.aiEnhancement.recommendation}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {match.aiEnhancement.studyTips.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-blue-900">
                                                💡 Study Tips
                                            </p>
                                            <ul className="mt-1 space-y-1 text-xs text-blue-800">
                                                {match.aiEnhancement.studyTips.map((tip, idx) => (
                                                    <li key={idx} className="flex gap-1">
                                                        <span>•</span>
                                                        <span>{tip}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    
                                    {match.aiEnhancement.suggestedTopics.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-blue-900">
                                                📚 Suggested Topics
                                            </p>
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {match.aiEnhancement.suggestedTopics.map((topic, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700"
                                                    >
                                                        {topic}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {match.aiEnhancement.compatibilityInsights && (
                                        <div>
                                            <p className="text-xs font-semibold text-blue-900">
                                                🎯 Compatibility
                                            </p>
                                            <p className="mt-1 text-xs text-blue-800">
                                                {match.aiEnhancement.compatibilityInsights}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </article>
                    ))
                )}
            </div>
        </section>
    );
};
