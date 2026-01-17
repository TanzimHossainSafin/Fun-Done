import { submitJoke } from "../../services/userService";
import { useState, useRef, useEffect } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import { getUser } from "../../features/auth/utils/authStorage";

interface SubmitJokesProps {
    onCreated?: () => void;
}

export const SubmitJokes = ({ onCreated }: SubmitJokesProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [userName, setUserName] = useState("");
    const [caption, setCaption] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get user info from login session
    const [userId, setUserId] = useState<string>("");
    
    useEffect(() => {
        const user = getUser();
        if (user) {
            setUserName(user.username);
            setUserId(user.id);
        }
    }, []);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async () => {
        if (!caption.trim() && !imagePreview) return;

        setIsSubmitting(true);
        try {
            await submitJoke({
                name: userName || "Anonymous",
                category: "Fun",
                setup: caption,
                punchline: "",
                imageUrl: imagePreview,
                userId: userId
            });
            
            // Reset form
            setCaption("");
            handleRemoveImage();
            setIsExpanded(false);
            onCreated?.();
        } catch (error) {
            console.error("Failed to create post:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setCaption("");
        handleRemoveImage();
        setIsExpanded(false);
    };

    return (
        <div className="card-3d rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
            />

            {!isExpanded ? (
                // Collapsed State - Simple Click to Expand
                <div 
                    className="p-4 cursor-pointer hover:bg-slate-50 transition rounded-2xl"
                    onClick={() => setIsExpanded(true)}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {userName?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 px-4 py-3 rounded-full bg-slate-100 text-slate-400 text-sm">
                            What's on your mind?
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">
                            <ImageIcon size={20} className="text-green-500" />
                            <span>Photo/Video</span>
                        </button>
                    </div>
                </div>
            ) : (
                // Expanded State - Full Posting Interface
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Create Post</h3>
                        <button
                            onClick={handleCancel}
                            className="p-1 hover:bg-slate-100 rounded-full transition"
                        >
                            <X size={20} className="text-slate-500" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {userName?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800">{userName || "Anonymous"}</p>
                            <p className="text-xs text-slate-500">Fun Zone</p>
                        </div>
                    </div>

                    {/* Caption Input */}
                    <textarea
                        placeholder="What's on your mind?"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        rows={4}
                        className="w-full text-lg text-slate-800 outline-none resize-none placeholder:text-slate-400"
                        autoFocus
                    />

                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="relative mt-3 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                            <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="w-full h-auto object-contain"
                                style={{ maxHeight: '400px', aspectRatio: '4/3' }}
                            />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white rounded-full hover:bg-slate-900 transition"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* Add to Post Section */}
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg mt-3">
                        <span className="text-sm font-medium text-slate-700">Add to your post</span>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 hover:bg-slate-100 rounded-full transition"
                            title="Add photo"
                        >
                            <ImageIcon size={20} className="text-green-500" />
                        </button>
                    </div>

                    {/* Post Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || (!caption.trim() && !imagePreview)}
                        className="w-full mt-3 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
                    >
                        {isSubmitting ? "Posting..." : "Post"}
                    </button>
                </div>
            )}
        </div>
    );
};