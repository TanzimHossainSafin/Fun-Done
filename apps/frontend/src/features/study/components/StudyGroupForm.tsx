import { useEffect, useState, type FormEvent } from "react";
import { getUser } from "../../auth/utils/authStorage";
import { createStudyGroup } from "../services/studyService";
import { searchUsers } from "../../users/services/userSearchService";

export const StudyGroupForm = () => {
    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [memberQuery, setMemberQuery] = useState("");
    const [memberOptions, setMemberOptions] = useState<
        Array<{ id: string; username: string; email: string }>
    >([]);
    const [selectedMembers, setSelectedMembers] = useState<
        Array<{ id: string; username: string }>
    >([]);
    const [status, setStatus] = useState("");

    useEffect(() => {
        if (!memberQuery) {
            setMemberOptions([]);
            return;
        }
        const handler = setTimeout(async () => {
            try {
                const result = await searchUsers(memberQuery);
                setMemberOptions(result.users);
            } catch (error) {
                setMemberOptions([]);
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [memberQuery]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setStatus("");
        const user = getUser();
        if (!user) {
            setStatus("Not logged in");
            return;
        }
        try {
            await createStudyGroup({
                name,
                subject,
                description,
                createdBy: user.id,
                memberIds: selectedMembers.map((member) => member.id),
            });
            setStatus("Group created successfully");
            setName("");
            setSubject("");
            setDescription("");
            setSelectedMembers([]);
            setMemberQuery("");
        } catch (error) {
            setStatus("Failed to create group");
        }
    };

    return (
        <section className="card-3d rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm h-full">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                Create Study Group
            </h2>
            <p className="mt-1 text-sm text-slate-500">
                Create a new group and add members.
            </p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                    Group name
                    <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Physics Champs"
                        required
                    />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                    Subject
                    <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={subject}
                        onChange={(event) => setSubject(event.target.value)}
                        placeholder="Physics"
                        required
                    />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                    Description
                    <textarea
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Weekly problem solving group"
                        required
                    />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                    Member Search (username)
                    <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={memberQuery}
                        onChange={(event) => setMemberQuery(event.target.value)}
                        placeholder="Enter username"
                    />
                </label>
                {memberOptions.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                        {memberOptions.map((member) => (
                            <button
                                key={member.id}
                                type="button"
                                className="mr-2 mt-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-600"
                                onClick={() => {
                                    if (
                                        selectedMembers.some(
                                            (item) => item.id === member.id
                                        )
                                    ) {
                                        return;
                                    }
                                    setSelectedMembers((prev) => [
                                        ...prev,
                                        { id: member.id, username: member.username },
                                    ]);
                                }}
                            >
                                {member.username}
                            </button>
                        ))}
                    </div>
                )}
                {selectedMembers.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                        {selectedMembers.map((member) => (
                            <span
                                key={member.id}
                                className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700"
                            >
                                {member.username}
                            </span>
                        ))}
                    </div>
                )}
                <button
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    type="submit"
                >
                    Create Group
                </button>
                {status ? (
                    <p className="text-sm text-emerald-600">{status}</p>
                ) : null}
            </form>
        </section>
    );
};
