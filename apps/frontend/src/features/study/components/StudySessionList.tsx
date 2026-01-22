import { useState, useEffect } from "react";
import { fetchStudySessions, fetchStudyGroups } from "../services/studyService";
import type { StudySession, StudyGroup } from "../types";
import { getUser } from "../../auth/utils/authStorage";

export const StudySessionList = () => {
    const [groups, setGroups] = useState<StudyGroup[]>([]);
    const [groupId, setGroupId] = useState("");
    const [sessions, setSessions] = useState<StudySession[]>([]);
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

    const handleFetch = async () => {
        setStatus("");
        try {
            const result = await fetchStudySessions(groupId);
            setSessions(result.sessions);
            setStatus("Sessions loaded successfully");
        } catch (error) {
            setStatus("Failed to load sessions");
        }
    };

    return (
        <section className="card-3d rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
                Study Session List
            </h2>
            <p className="mt-1 text-sm text-slate-500">
                View all sessions for the group
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
                <label className="block text-sm font-medium text-slate-700">
                    Select Group
                    <select
                        className="mt-1 w-56 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                        value={groupId}
                        onChange={(event) => setGroupId(event.target.value)}
                    >
                        <option value="">-- Select a group --</option>
                        {groups.map((group) => (
                            <option key={group._id} value={group._id}>
                                {group.name} ({group.subject})
                            </option>
                        ))}
                    </select>
                </label>
                <button
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    type="button"
                    onClick={handleFetch}
                    disabled={!groupId}
                >
                    Show Sessions
                </button>
                {status ? (
                    <p className="text-sm text-emerald-600">{status}</p>
                ) : null}
            </div>
            <div className="mt-5 space-y-3">
                {sessions.length === 0 ? (
                    <p className="text-sm text-slate-400">No sessions yet</p>
                ) : (
                    sessions.map((session) => (
                        <article
                            key={session._id}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                            <h3 className="text-sm font-semibold text-slate-800">
                                {session.topic}
                            </h3>
                            <p className="mt-2 text-xs text-slate-600">
                                Started: {session.startedAt}
                            </p>
                            <p className="text-xs text-slate-600">
                                Duration:{" "}
                                {session.durationMinutes
                                    ? `${session.durationMinutes} min`
                                    : "-"}
                            </p>
                        </article>
                    ))
                )}
            </div>
        </section>
    );
};
