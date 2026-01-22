import { useState, useEffect } from "react";
import { suggestHabits, getHabits, createHabit, incrementHabit, deleteHabit } from "../services/scheduleService";
import type { HabitData, HabitSuggestions } from "../types";
import { getUser } from "../../auth/utils/authStorage";

interface Props {
    userId?: string;
}

export default function HabitTracker({ userId: propUserId }: Props) {
    const currentUser = getUser();
    const userId = propUserId || currentUser?.id || "";
    
    const [habits, setHabits] = useState<HabitData[]>([]);
    const [suggestions, setSuggestions] = useState<HabitSuggestions | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingHabits, setLoadingHabits] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newHabit, setNewHabit] = useState({ name: "", frequency: "daily" as "daily" | "weekly" });
    const [error, setError] = useState<string | null>(null);

    // Load habits on mount
    useEffect(() => {
        if (userId) {
            loadHabits();
        } else {
            setLoadingHabits(false);
        }
    }, [userId]);

    const loadHabits = async () => {
        try {
            setLoadingHabits(true);
            setError(null);
            const data = await getHabits(userId);
            setHabits(data.habits || []);
        } catch (err: any) {
            console.error("Failed to load habits:", err);
            setError("Failed to load habits.");
            // If no habits exist, initialize with empty array
            setHabits([]);
        } finally {
            setLoadingHabits(false);
        }
    };

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

    const handleAddHabit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabit.name || !userId) return;

        try {
            setError(null);
            const result = await createHabit({
                userId,
                name: newHabit.name,
                frequency: newHabit.frequency,
                // Daily habits: 1 per day, Weekly habits: 3 per week (default)
                total: newHabit.frequency === "daily" ? 1 : 3,
            });
            setHabits([...habits, result.habit]);
            setNewHabit({ name: "", frequency: "daily" });
            setShowAddForm(false);
        } catch (err: any) {
            console.error("Failed to create habit:", err);
            setError("Failed to add habit.");
        }
    };

    const handleIncrementHabit = async (habitId: string) => {
        if (!habitId) return;
        
        try {
            setError(null);
            const result = await incrementHabit(habitId);
            setHabits(habits.map(h => h._id === habitId ? result.habit : h));
        } catch (err: any) {
            console.error("Failed to increment habit:", err);
            setError("Failed to update habit.");
        }
    };

    const handleDeleteHabit = async (habitId: string) => {
        if (!habitId) return;
        
        try {
            setError(null);
            await deleteHabit(habitId);
            setHabits(habits.filter(h => h._id !== habitId));
        } catch (err: any) {
            console.error("Failed to delete habit:", err);
            setError("Failed to delete habit.");
        }
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
                {userId && (
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                        {showAddForm ? "Cancel" : "+ Add"}
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {loadingHabits ? (
                <p className="text-sm text-gray-500 mb-4">Loading...</p>
            ) : !userId ? (
                <p className="text-sm text-gray-500 mb-4">Please log in to track habits.</p>
            ) : habits.length === 0 ? (
                <p className="text-sm text-gray-500 mb-4">No habits yet. Add one!</p>
            ) : null}

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

            {!loadingHabits && (
                <div className="space-y-3 mb-4">
                    {habits.map((habit) => (
                        <div key={habit._id || habit.name} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <h4 className="font-medium text-sm text-gray-900">{habit.name}</h4>
                                    <p className="text-xs text-gray-500 capitalize">{habit.frequency}</p>
                                </div>
                                <div className="flex gap-2">
                                    {habit._id && (
                                        <>
                                            <button
                                                onClick={() => handleIncrementHabit(habit._id!)}
                                                disabled={habit.completed >= habit.total}
                                                className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                +1
                                            </button>
                                            <button
                                                onClick={() => handleDeleteHabit(habit._id!)}
                                                className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
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
            )}

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
