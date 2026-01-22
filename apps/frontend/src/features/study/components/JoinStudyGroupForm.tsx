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
            setStatus("Not logged in");
            return;
        }
        try {
            const result = await joinStudyGroupByName(groupQuery, user.id);
            // Check if already a member
            if (result.message && result.message.includes("already joined")) {
                setStatus("You have already joined this group");
            } else {
                setStatus("Joined group successfully");
                setGroupQuery(""); // Clear input on success
            }
        } catch (error: any) {
            // Handle specific error cases
            if (error.response?.status === 409) {
                setStatus("You have already joined this group");
            } else if (error.response?.status === 404) {
                setStatus("Group not found");
            } else {
                setStatus(error.response?.data?.message || "Failed to join group");
            }
        }
    };

    return (
        <section className="card-3d rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                Join Group
            </h2>
            <form onSubmit={handleSubmit} className="mt-3 space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                    Group Search (enter name)
                    <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={groupQuery}
                        onChange={(event) => setGroupQuery(event.target.value)}
                        placeholder="Physics Champs"
                        required
                    />
                </label>
                {groupOptions.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 sm:p-3 text-sm text-slate-600">
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
                    Join
                </button>
                {status ? (
                    <p className={`text-sm ${
                        status.includes("already joined") || status.includes("not found")
                            ? "text-amber-600"
                            : status.includes("successfully")
                            ? "text-emerald-600"
                            : "text-red-600"
                    }`}>
                        {status}
                    </p>
                ) : null}
            </form>
        </section>
    );
};
