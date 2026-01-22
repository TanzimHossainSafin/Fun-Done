import { useState } from "react";
import { AIChatBox } from "./components/AIChatBox";
import { AgendaGenerator } from "./components/AgendaGenerator";
import { AIFeaturesBanner } from "./components/AIFeaturesBanner";
import { DashboardNav } from "../dashboard/components/DashboardNav";
import { fetchStudyGroups } from "./services/studyService";
import { getUser } from "../auth/utils/authStorage";
import type { StudyGroup } from "./types";
import type { ChatMessage } from "./services/aiService";

export const AIFeaturesPage = () => {
    const [groups, setGroups] = useState<StudyGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

    const loadUserGroups = async () => {
        const user = getUser();
        if (!user) {
            alert("Please login first");
            return;
        }

        setIsLoadingGroups(true);
        try {
            const result = await fetchStudyGroups(user.id);
            setGroups(result.groups);
            if (result.groups.length > 0) {
                setSelectedGroup(result.groups[0]);
            }
        } catch (error) {
            console.error("Failed to load groups", error);
        } finally {
            setIsLoadingGroups(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <DashboardNav />
            <div className="mx-auto max-w-7xl space-y-6 p-6">
                <AIFeaturesBanner />

            <div className="grid gap-6 lg:grid-cols-2">
                {/* AI Chat Section */}
                <div className="space-y-4">
                    <div className="card-3d rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Select Study Group
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Choose a group to chat with AI moderator
                        </p>
                        
                        <button
                            onClick={loadUserGroups}
                            disabled={isLoadingGroups}
                            className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:bg-blue-300"
                            type="button"
                        >
                            {isLoadingGroups ? "Loading..." : "Load My Groups"}
                        </button>

                        {groups.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {groups.map((group) => (
                                    <button
                                        key={group._id}
                                        onClick={() => setSelectedGroup(group)}
                                        className={`w-full rounded-lg border p-3 text-left transition ${
                                            selectedGroup?._id === group._id
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-slate-200 bg-white hover:bg-slate-50"
                                        }`}
                                        type="button"
                                    >
                                        <p className="font-semibold text-slate-900">
                                            {group.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {group.subject} • {group.members.length} members
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedGroup && (
                        <AIChatBox
                            groupId={selectedGroup._id}
                            groupName={selectedGroup.name}
                            onMessagesChange={setChatMessages}
                        />
                    )}
                </div>

                {/* Agenda Generator Section */}
                <div className="space-y-4">
                    <AgendaGenerator />
                    
                    {/* Chat History Panel */}
                    {selectedGroup && (
                        <div className="card-3d rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-900">
                                💬 Chat History
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                {selectedGroup.name} • {chatMessages.length} messages
                            </p>
                            <div className="mt-4 max-h-80 overflow-y-auto space-y-3 pr-2">
                                {chatMessages.length === 0 ? (
                                    <p className="text-xs text-slate-400 text-center py-8">
                                        No messages yet. Start chatting! 👈
                                    </p>
                                ) : (
                                    chatMessages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`rounded-lg p-3 ${
                                                msg.role === "user"
                                                    ? "bg-blue-50 border border-blue-200"
                                                    : "bg-slate-50 border border-slate-200"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-semibold text-slate-700">
                                                    {msg.role === "user" ? "👤 You" : "🤖 AI"}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 line-clamp-2">
                                                {msg.content}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
};
