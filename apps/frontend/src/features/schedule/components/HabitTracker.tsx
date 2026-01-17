import { useState } from "react";
import { suggestHabits } from "../services/scheduleService";
import type { HabitData, HabitSuggestions } from "../types";

interface Props {
    userId?: string;
}

export default function HabitTracker({ }: Props) {
    const [habits, setHabits] = useState<HabitData[]>([
        { name: "Morning Study", frequency: "daily", completed: 5, total: 7 },
        { name: "Exercise", frequency: "daily", completed: 3, total: 7 },
        { name: "Reading", frequency: "weekly", completed: 2, total: 3 },
    ]);
    const [suggestions, setSuggestions] = useState<HabitSuggestions | null>(null);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newHabit, setNewHabit] = useState({ name: "", frequency: "daily" as "daily" | "weekly" });

    const handleGetSuggestions = async () => {
        try {
            setLoading(true);
            const data = await suggestHabits({ currentHabits: habits });
            setSuggestions(data.suggestions);
        } catch (error) {
            console.error("Failed to get suggestions:", error);
            alert("Failed to get habit suggestions");
        } finally {
            setLoading(false);
        }
    };

    const handleAddHabit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabit.name) return;

        setHabits([
            ...habits,
            {
                name: newHabit.name,
                frequency: newHabit.frequency,
                completed: 0,
                total: newHabit.frequency === "daily" ? 7 : 3,
            },
        ]);
        setNewHabit({ name: "", frequency: "daily" });
        setShowAddForm(false);
    };

    const handleToggleComplete = (index: number) => {
        const updated = [...habits];
        updated[index] = {
            ...updated[index],
            completed: Math.min(updated[index].completed + 1, updated[index].total),
        };
        setHabits(updated);
    };

    const getCompletionPercentage = (habit: HabitData) => {
        return Math.round((habit.completed / habit.total) * 100);
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 80) return "bg-green-600";
        if (percentage >= 50) return "bg-yellow-600";
        return "bg-red-600";
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">📈 Habit Tracker</h3>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                    {showAddForm ? "Cancel" : "+ Add"}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAddHabit} className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <input
                        type="text"
                        value={newHabit.name}
                        onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                        placeholder="Habit name"
                        className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <div className="flex gap-2">
                        <select
                            value={newHabit.frequency}
                            onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value as "daily" | "weekly" })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                        >
                            Add
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-3 mb-4">
                {habits.map((habit, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-medium text-sm text-gray-900">{habit.name}</h4>
                                <p className="text-xs text-gray-500 capitalize">{habit.frequency}</p>
                            </div>
                            <button
                                onClick={() => handleToggleComplete(index)}
                                className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                            >
                                +1
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(getCompletionPercentage(habit))}`}
                                    style={{ width: `${getCompletionPercentage(habit)}%` }}
                                ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-600">
                                {habit.completed}/{habit.total}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleGetSuggestions}
                disabled={loading}
                className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm rounded-lg hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50"
            >
                {loading ? "Getting AI Suggestions..." : "🤖 Get AI Habit Suggestions"}
            </button>

            {suggestions && (
                <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">💭 Performance</h4>
                    <p className="text-xs text-gray-700 mb-3">{suggestions.habitPerformance}</p>

                    {suggestions.newHabits.length > 0 && (
                        <>
                            <h4 className="font-semibold text-sm text-gray-900 mb-2">✨ New Habits to Try</h4>
                            <div className="space-y-2 mb-3">
                                {suggestions.newHabits.map((habit, index) => (
                                    <div key={index} className="p-2 bg-white rounded text-xs">
                                        <div className="font-medium text-gray-900">{habit.name}</div>
                                        <div className="text-gray-600">{habit.description}</div>
                                        <div className="text-gray-500 capitalize mt-1">{habit.frequency}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {suggestions.implementationTips.length > 0 && (
                        <>
                            <h4 className="font-semibold text-sm text-gray-900 mb-2">💡 Tips</h4>
                            <ul className="space-y-1 mb-3">
                                {suggestions.implementationTips.map((tip, index) => (
                                    <li key={index} className="text-xs text-gray-700">
                                        • {tip}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    <div className="p-2 bg-white rounded-lg">
                        <p className="text-xs text-indigo-700 font-medium italic">
                            {suggestions.motivation}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
