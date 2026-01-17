import { useEffect, useState, type FormEvent } from "react";
import { getUser } from "../../auth/utils/authStorage";
import { joinStudyGroupByName, searchGroups } from "../services/studyService";

export const JoinStudyGroupForm = () => {
    const [groupQuery, setGroupQuery] = useState("");
    const [groupOptions, setGroupOptions] = useState<
        Array<{ _id: string; name: string }>
    >([]);
    const [status, setStatus] = useState("");

    useEffect(() => {
        if (!groupQuery) {
            setGroupOptions([]);
            return;
        }
        const handler = setTimeout(async () => {
            try {
                const result = await searchGroups(groupQuery);
                setGroupOptions(
                    result.groups.map((group) => ({
                        _id: group._id,
                        name: group.name,
                    }))
                );
            } catch (error) {
                setGroupOptions([]);
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [groupQuery]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setStatus("");
        const user = getUser();
        if (!user) {
            setStatus("লগইন করা নেই");
            return;
        }
        try {
            await joinStudyGroupByName(groupQuery, user.id);
            setStatus("গ্রুপে যোগ হয়েছে");
        } catch (error) {
            setStatus("গ্রুপে যোগ করা যায়নি");
        }
    };

    return (
        <section className="card-3d rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
                গ্রুপে যোগ দাও
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                    গ্রুপ সার্চ (নাম লিখুন)
                    <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={groupQuery}
                        onChange={(event) => setGroupQuery(event.target.value)}
                        placeholder="Physics Champs"
                        required
                    />
                </label>
                {groupOptions.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                        {groupOptions.map((group) => (
                            <button
                                key={group._id}
                                type="button"
                                className="mr-2 mt-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-600"
                                onClick={() => setGroupQuery(group.name)}
                            >
                                {group.name}
                            </button>
                        ))}
                    </div>
                )}
                <button
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    type="submit"
                >
                    জয়েন করো
                </button>
                {status ? (
                    <p className="text-sm text-emerald-600">{status}</p>
                ) : null}
            </form>
        </section>
    );
};
