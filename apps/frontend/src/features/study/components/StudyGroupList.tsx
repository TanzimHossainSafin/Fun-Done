import { useState } from "react";
import { getUser } from "../../auth/utils/authStorage";
import { fetchStudyGroups } from "../services/studyService";
import type { StudyGroup } from "../types";
import { GroupChat } from "./GroupChat";
import { MessageCircle, X, Users } from "lucide-react";
import apiClient from "../../../utils/axios";

interface MemberInfo {
    userId: string;
    username: string;
    email: string;
    role: "admin" | "moderator" | "member";
    joinedAt: string;
}

export const StudyGroupList = () => {
    const [groups, setGroups] = useState<StudyGroup[]>([]);
    const [status, setStatus] = useState("");
    const [selectedGroupForChat, setSelectedGroupForChat] = useState<StudyGroup | null>(null);
    const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<StudyGroup | null>(null);
    const [membersInfo, setMembersInfo] = useState<MemberInfo[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    const handleFetch = async () => {
        setStatus("");
        const user = getUser();
        if (!user) {
            setStatus("Not logged in");
            return;
        }
        try {
            const result = await fetchStudyGroups(user.id);
            setGroups(result.groups);
            setStatus("Groups loaded successfully");
        } catch (error) {
            setStatus("Failed to load groups");
        }
    };

    const handleShowMembers = async (group: StudyGroup) => {
        setSelectedGroupForMembers(group);
        setLoadingMembers(true);
        try {
            // Fetch member details
            const memberPromises = group.members.map(async (member) => {
                try {
                    const response = await apiClient.get(`/app/v1/users/${member.userId}`);
                    return {
                        userId: member.userId,
                        username: response.data.user?.username || "Unknown",
                        email: response.data.user?.email || "",
                        role: member.role,
                        joinedAt: member.joinedAt,
                    };
                } catch (error) {
                    return {
                        userId: member.userId,
                        username: "Unknown",
                        email: "",
                        role: member.role,
                        joinedAt: member.joinedAt,
                    };
                }
            });
            const members = await Promise.all(memberPromises);
            setMembersInfo(members);
        } catch (error) {
            console.error("Failed to load members:", error);
            setMembersInfo([]);
        } finally {
            setLoadingMembers(false);
        }
    };

    return (
        <section className="card-3d rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm h-full">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                Study Group List
            </h2>
            <div className="mt-4 flex flex-wrap items-end gap-3">
                <button
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    type="button"
                    onClick={handleFetch}
                >
                    Show Groups
                </button>
                {status ? (
                    <p className="text-sm text-emerald-600">{status}</p>
                ) : null}
            </div>
            <div className="mt-5 space-y-3">
                {groups.length === 0 ? (
                    <p className="text-sm text-slate-400">No groups yet</p>
                ) : (
                    groups.map((group) => (
                        <article
                            key={group._id}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <h3 className="text-sm font-semibold text-slate-800">
                                    {group.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleShowMembers(group)}
                                        className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1"
                                    >
                                        <Users className="w-3 h-3" />
                                        {group.members.length} members
                                    </button>
                                    <button
                                        onClick={() => setSelectedGroupForChat(group)}
                                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors flex items-center gap-1"
                                    >
                                        <MessageCircle className="w-3 h-3" />
                                        Chat
                                    </button>
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-slate-600">
                                Subject: {group.subject}
                            </p>
                            <p className="text-xs text-slate-600">
                                Meeting:{" "}
                                {group.meetingSuggestions.join(", ") || "-"}
                            </p>
                            {group.description && (
                                <p className="mt-1 text-xs text-slate-500">
                                    {group.description}
                                </p>
                            )}
                        </article>
                    ))
                )}
            </div>

            {/* Chat Modal - Responsive */}
            {selectedGroupForChat && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
                    <div className="relative w-full max-w-4xl h-full sm:h-[80vh] bg-white rounded-lg shadow-xl overflow-hidden">
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
                            <button
                                onClick={() => setSelectedGroupForChat(null)}
                                className="rounded-full bg-slate-100 p-2 hover:bg-slate-200 transition-colors"
                            >
                                <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                            </button>
                        </div>
                        <GroupChat
                            groupId={selectedGroupForChat._id}
                            groupName={selectedGroupForChat.name}
                        />
                    </div>
                </div>
            )}

            {/* Members Modal */}
            {selectedGroupForMembers && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
                    <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-900">
                                Members - {selectedGroupForMembers.name}
                            </h3>
                            <button
                                onClick={() => {
                                    setSelectedGroupForMembers(null);
                                    setMembersInfo([]);
                                }}
                                className="rounded-full bg-slate-100 p-2 hover:bg-slate-200 transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-600" />
                            </button>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto">
                            {loadingMembers ? (
                                <div className="flex items-center justify-center py-8">
                                    <p className="text-sm text-slate-500">Loading members...</p>
                                </div>
                            ) : membersInfo.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-8">No members found</p>
                            ) : (
                                <div className="space-y-3">
                                    {membersInfo.map((member) => (
                                        <div
                                            key={member.userId}
                                            className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                                        <span className="text-white text-xs font-semibold">
                                                            {member.username.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {member.username}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {member.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                member.role === 'admin' 
                                                    ? 'bg-red-100 text-red-700'
                                                    : member.role === 'moderator'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-slate-100 text-slate-700'
                                            }`}>
                                                {member.role}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};
