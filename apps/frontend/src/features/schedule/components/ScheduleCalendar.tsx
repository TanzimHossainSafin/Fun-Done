import { useState } from "react";
import { addScheduleEvent } from "../services/scheduleService";
import type { Schedule, ScheduleEvent } from "../types";

interface Props {
    schedule: Schedule | null;
    userId: string;
    onScheduleUpdate: () => void;
}

export default function ScheduleCalendar({ schedule, userId, onScheduleUpdate }: Props) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newEvent, setNewEvent] = useState<Partial<ScheduleEvent>>({
        title: "",
        start: "",
        end: "",
        type: "study",
        priority: 3,
    });
    const [submitting, setSubmitting] = useState(false);

    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newEvent.title || !newEvent.start || !newEvent.end) {
            alert("Please fill in all fields");
            return;
        }

        try {
            setSubmitting(true);
            await addScheduleEvent({
                userId,
                title: newEvent.title,
                start: newEvent.start,
                end: newEvent.end,
                type: newEvent.type as any,
                priority: newEvent.priority || 3,
            });
            
            setShowAddForm(false);
            setNewEvent({
                title: "",
                start: "",
                end: "",
                type: "study",
                priority: 3,
            });
            onScheduleUpdate();
        } catch (error) {
            console.error("Failed to add event:", error);
            alert("Failed to add event");
        } finally {
            setSubmitting(false);
        }
    };

    const getEventColor = (type: string) => {
        const colors: Record<string, string> = {
            class: "bg-blue-100 border-blue-300 text-blue-800",
            study: "bg-green-100 border-green-300 text-green-800",
            exam: "bg-red-100 border-red-300 text-red-800",
            assignment: "bg-purple-100 border-purple-300 text-purple-800",
            break: "bg-yellow-100 border-yellow-300 text-yellow-800",
            personal: "bg-gray-100 border-gray-300 text-gray-800",
            other: "bg-pink-100 border-pink-300 text-pink-800",
        };
        return colors[type] || colors.other;
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString("en-US", { 
            hour: "2-digit", 
            minute: "2-digit" 
        });
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { 
            month: "short", 
            day: "numeric",
            weekday: "short"
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Schedule</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    {showAddForm ? "Cancel" : "+ Add Event"}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAddEvent} className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Event Title
                            </label>
                            <input
                                type="text"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., Math Lecture"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time
                            </label>
                            <input
                                type="datetime-local"
                                value={newEvent.start}
                                onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Time
                            </label>
                            <input
                                type="datetime-local"
                                value={newEvent.end}
                                onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Event Type
                            </label>
                            <select
                                value={newEvent.type}
                                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="study">Study</option>
                                <option value="class">Class</option>
                                <option value="exam">Exam</option>
                                <option value="assignment">Assignment</option>
                                <option value="break">Break</option>
                                <option value="personal">Personal</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Priority (1-5)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={newEvent.priority}
                                onChange={(e) => setNewEvent({ ...newEvent, priority: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {submitting ? "Adding..." : "Add Event"}
                    </button>
                </form>
            )}

            <div className="space-y-3">
                {!schedule?.events || schedule.events.length === 0 ? (
                    <div className="text-center py-12">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No events yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Get started by adding your first event
                        </p>
                    </div>
                ) : (
                    schedule.events
                        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                        .map((event, index) => (
                            <div
                                key={index}
                                className={`p-4 border-l-4 rounded-lg ${getEventColor(event.type)}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{event.title}</h3>
                                        <p className="text-sm mt-1">
                                            {formatDate(event.start)} • {formatTime(event.start)} - {formatTime(event.end)}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs px-2 py-1 bg-white rounded">
                                                {event.type}
                                            </span>
                                            <span className="text-xs">
                                                Priority: {"★".repeat(event.priority)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                )}
            </div>
        </div>
    );
}
