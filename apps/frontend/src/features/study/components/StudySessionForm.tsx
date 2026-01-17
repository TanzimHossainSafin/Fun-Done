import { useState, useEffect, type FormEvent } from "react";
import { getUser } from "../../auth/utils/authStorage";
import { createStudySession, fetchStudyGroups } from "../services/studyService";
import type { StudyGroup } from "../types";

export const StudySessionForm = () => {
    const [groups, setGroups] = useState<StudyGroup[]>([]);
    const [groupId, setGroupId] = useState("");
    const [topic, setTopic] = useState("");
    const [startedAt, setStartedAt] = useState("");
    const [endedAt, setEndedAt] = useState("");
    const [status, setStatus] = useState("");

    // Load user's groups on mount
    useEffect(() => {
        const loadGroups = async () => {
            const user = getUser();
            if (!user) return;
            try {
                const result = await fetchStudyGroups(user.id);
                setGroups(result.groups);
            } catch (error) {
                console.error("Failed to load groups:", error);
            }
        };
        loadGroups();
    }, []);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setStatus("");
        const user = getUser();
        if (!user) {
            setStatus("লগইন করা নেই");
            return;
        }
        try {
            // Convert datetime-local format to ISO string
            const startedAtISO = startedAt ? new Date(startedAt).toISOString() : "";
            const endedAtISO = endedAt ? new Date(endedAt).toISOString() : undefined;
            
            await createStudySession(groupId, {
                topic,
                startedAt: startedAtISO,
                endedAt: endedAtISO,
                createdBy: user.id,
            });
            setStatus("সেশন লগ হয়েছে ✅");
            // Reset form
            setTopic("");
            setStartedAt("");
            setEndedAt("");
        } catch (error) {
            setStatus("সেশন লগ করা যায়নি ❌");
        }
    };

    return (
        <section className="card-3d rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
                স্টাডি সেশন লগ
            </h2>
            <p className="mt-1 text-sm text-slate-500">
                আপনার গ্রুপের জন্য স্টাডি সেশন রেকর্ড করুন
            </p>
            
            {groups.length === 0 && (
                <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <p className="text-sm text-amber-800">
                        📌 প্রথমে <strong>Groups</strong> পেজে গিয়ে একটি স্টাডি গ্রুপ তৈরি করুন
                    </p>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                    Select Study Group *
                    <select
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                        value={groupId}
                        onChange={(event) => setGroupId(event.target.value)}
                        required
                        disabled={groups.length === 0}
                    >
                        <option value="">-- Select a group --</option>
                        {groups.map((group) => (
                            <option key={group._id} value={group._id}>
                                {group.name} ({group.subject})
                            </option>
                        ))}
                    </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                    Topic *
                    <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={topic}
                        onChange={(event) => setTopic(event.target.value)}
                        placeholder="Calculus practice"
                        required
                    />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                    Started at *
                    <input
                        type="datetime-local"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={startedAt}
                        onChange={(event) => setStartedAt(event.target.value)}
                        required
                    />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                    Ended at (optional)
                    <input
                        type="datetime-local"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={endedAt}
                        onChange={(event) => setEndedAt(event.target.value)}
                    />
                </label>
                <button
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    type="submit"
                >
                    সেশন সেভ
                </button>
                {status ? (
                    <p className="text-sm text-emerald-600">{status}</p>
                ) : null}
            </form>
        </section>
    );
};
