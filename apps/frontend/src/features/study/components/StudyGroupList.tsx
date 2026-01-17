import { useState } from "react";
import { getUser } from "../../auth/utils/authStorage";
import { fetchStudyGroups } from "../services/studyService";
import type { StudyGroup } from "../types";

export const StudyGroupList = () => {
    const [groups, setGroups] = useState<StudyGroup[]>([]);
    const [status, setStatus] = useState("");

    const handleFetch = async () => {
        setStatus("");
        const user = getUser();
        if (!user) {
            setStatus("লগইন করা নেই");
            return;
        }
        try {
            const result = await fetchStudyGroups(user.id);
            setGroups(result.groups);
            setStatus("গ্রুপ লোড হয়েছে");
        } catch (error) {
            setStatus("গ্রুপ লোড করা যায়নি");
        }
    };

    return (
        <section className="card-3d rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
                স্টাডি গ্রুপ তালিকা
            </h2>
            <div className="mt-4 flex flex-wrap items-end gap-3">
                <button
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    type="button"
                    onClick={handleFetch}
                >
                    গ্রুপ দেখাও
                </button>
                {status ? (
                    <p className="text-sm text-emerald-600">{status}</p>
                ) : null}
            </div>
            <div className="mt-5 space-y-3">
                {groups.length === 0 ? (
                    <p className="text-sm text-slate-400">কোনো গ্রুপ নেই</p>
                ) : (
                    groups.map((group) => (
                        <article
                            key={group._id}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-800">
                                    {group.name}
                                </h3>
                                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                    {group.members.length} সদস্য
                                </span>
                            </div>
                            <p className="mt-2 text-xs text-slate-600">
                                Subject: {group.subject}
                            </p>
                            <p className="text-xs text-slate-600">
                                Meeting:{" "}
                                {group.meetingSuggestions.join(", ") || "-"}
                            </p>
                            <p className="mt-1 text-xs text-slate-400 font-mono">
                                ID: {group._id}
                            </p>
                        </article>
                    ))
                )}
            </div>
        </section>
    );
};
