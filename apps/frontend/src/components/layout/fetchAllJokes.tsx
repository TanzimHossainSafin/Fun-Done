import { deleteJoke, getJokes, updateJoke } from "../../services/userService";
import { useEffect, useState } from "react";
import type { JokeData } from "../ui/Form";
import { Button } from "../ui/Button";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { getUser } from "../../features/auth/utils/authStorage";

interface Joke extends JokeData {
    _id: string;
    submittedAt?: string;
    voteCount?: number;
    imageUrl?: string;
    userId?: string;
}

interface FetchAllJokesProps {
    refreshKey?: number;
}

const emptyEditState: JokeData = {
    name: "",
    category: "",
    setup: "",
    punchline: ""
};

export const FetchAllJokes = ({ refreshKey }: FetchAllJokesProps) => {
    const [jokes, setJokes] = useState<Joke[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingData, setEditingData] = useState<JokeData>(emptyEditState);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const user = getUser();
        if (user) {
            setCurrentUserId(user.id);
        }
    }, []);

    const loadJokes = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getJokes();
            setJokes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError("ফিড লোড করা যাচ্ছে না।");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadJokes();
    }, [refreshKey]);

    const handleEditStart = (joke: Joke) => {
        setEditingId(joke._id);
        setEditingData({
            name: joke.name,
            category: joke.category,
            setup: joke.setup,
            punchline: joke.punchline
        });
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditingData(emptyEditState);
    };

    const handleEditSave = async (id: string) => {
        const result = await updateJoke(id, editingData, currentUserId || undefined);
        const updatedJoke = result?.joke ?? result;
        setJokes((prev) =>
            prev.map((item) => (item._id === id ? { ...item, ...updatedJoke } : item))
        );
        handleEditCancel();
    };

    const handleDelete = async (id: string) => {
        await deleteJoke(id, currentUserId || undefined);
        setJokes((prev) => prev.filter((item) => item._id !== id));
    };

    return (
        <div className="card-3d rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800">Community Feed</h3>
            <p className="mt-1 text-sm text-slate-500">
                সাম্প্রতিক জোকস ও মিমস দেখুন।
            </p>
            {isLoading && (
                <p className="mt-4 text-sm text-slate-500">লোড হচ্ছে...</p>
            )}
            {error && (
                <p className="mt-4 text-sm text-rose-600">{error}</p>
            )}
            <div className="mt-4 grid gap-4">
                {!isLoading && jokes.length === 0 && (
                    <p className="text-sm text-slate-500">এখনও কোন পোস্ট নেই।</p>
                )}
                {jokes.map((joke) => (
                    <div
                        key={joke._id}
                        className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                    >
                        {editingId === joke._id ? (
                            <div className="grid gap-3 p-4">
                                <input
                                    type="text"
                                    value={editingData.name}
                                    onChange={(e) =>
                                        setEditingData((prev) => ({ ...prev, name: e.target.value }))
                                    }
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="name"
                                />
                                <input
                                    type="text"
                                    value={editingData.category}
                                    onChange={(e) =>
                                        setEditingData((prev) => ({ ...prev, category: e.target.value }))
                                    }
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="category"
                                />
                                <input
                                    type="text"
                                    value={editingData.setup}
                                    onChange={(e) =>
                                        setEditingData((prev) => ({ ...prev, setup: e.target.value }))
                                    }
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="setup"
                                />
                                <input
                                    type="text"
                                    value={editingData.punchline}
                                    onChange={(e) =>
                                        setEditingData((prev) => ({ ...prev, punchline: e.target.value }))
                                    }
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="punchline"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        text="Save"
                                        color="success"
                                        size="sm"
                                        onClick={() => handleEditSave(joke._id)}
                                    />
                                    <Button
                                        text="Cancel"
                                        color="light"
                                        size="sm"
                                        onClick={handleEditCancel}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Post Header */}
                                <div className="flex items-center justify-between p-4 pb-0">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {joke.name}
                                        </p>
                                        <p className="text-xs text-slate-500">{joke.category}</p>
                                    </div>
                                    {currentUserId && joke.userId && currentUserId === joke.userId && (
                                        <div className="flex gap-2">
                                            <Button
                                                text="Edit"
                                                color="secondary"
                                                size="sm"
                                                onClick={() => handleEditStart(joke)}
                                            />
                                            <Button
                                                text="Delete"
                                                color="danger"
                                                size="sm"
                                                onClick={() => handleDelete(joke._id)}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Post Content */}
                                <div className="px-4 py-3">
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{joke.setup}</p>
                                    {joke.punchline && (
                                        <p className="mt-2 text-sm font-semibold text-slate-900">
                                            {joke.punchline}
                                        </p>
                                    )}
                                </div>

                                {/* Post Image */}
                                {joke.imageUrl && (
                                    <div className="w-full bg-slate-100">
                                        <img 
                                            src={joke.imageUrl} 
                                            alt="Post content"
                                            className="w-full h-auto object-cover"
                                            style={{ maxHeight: '500px', aspectRatio: '4/3', objectFit: 'contain' }}
                                        />
                                    </div>
                                )}

                                {/* Engagement Stats */}
                                <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                                    <span>{joke.voteCount || 0} Reactions</span>
                                    <span>0 Comments · 0 Shares</span>
                                </div>

                                {/* Action Buttons */}
                                <div className="px-4 py-2 flex items-center gap-1 border-t border-slate-100">
                                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition">
                                        <Heart size={18} />
                                        Like
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition">
                                        <MessageCircle size={18} />
                                        Comment
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition">
                                        <Share2 size={18} />
                                        Share
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
};