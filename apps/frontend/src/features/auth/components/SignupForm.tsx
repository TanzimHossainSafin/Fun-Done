import { useState, type FormEvent, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/registerService";
import { extractErrorMessage } from "../utils/error";
import { setUser } from "../utils/authStorage";

type SignupFormProps = {
    onSuccess?: () => void;
};

// Generate default avatar URL
const generateDefaultAvatar = (username: string): string => {
    const initial = username.charAt(0).toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=3b82f6&color=fff&size=200&bold=true`;
};

export const SignupForm = ({ onSuccess }: SignupFormProps) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("");
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setStatus("Please select an image file only");
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setStatus("Image size must be less than 5MB");
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setProfileImage(base64String);
                setImagePreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setProfileImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setStatus("");
        try {
            const result = await registerUser({ 
                username, 
                email, 
                password,
                profileImage: profileImage || undefined
            });
            
            // Auto-login after registration (token is automatically stored in httpOnly cookie)
            setUser(result.user);
            
            setStatus("Signup successful! Redirecting to dashboard...");
            
            // Navigate to dashboard after a short delay
            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);
        } catch (error) {
            setStatus(extractErrorMessage(error, "Signup failed"));
        }
    };

    const displayPreview = imagePreview || (username ? generateDefaultAvatar(username) : null);

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-900">
                    Sign Up
                </h2>
                <p className="text-sm text-slate-500">
                    Create a new account.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center gap-4 pb-4 border-b border-slate-200">
                    <div className="relative">
                        {displayPreview ? (
                            <img
                                src={displayPreview}
                                alt="Profile preview"
                                className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-500">
                                <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        )}
                        {imagePreview && (
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                            >
                                ×
                            </button>
                        )}
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <label className="cursor-pointer">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <span className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                {imagePreview ? "Change Image" : "Add Profile Picture"}
                            </span>
                        </label>
                        {!imagePreview && (
                            <p className="text-xs text-slate-500 text-center">
                                Avatar will be automatically generated if no image is provided
                            </p>
                        )}
                    </div>
                </div>

                <label className="block text-sm font-medium text-slate-700">
                    Username
                    <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder="yourname"
                        required
                    />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                    Email
                    <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="example@email.com"
                        type="email"
                        required
                    />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                    Password
                    <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="********"
                        type="password"
                        required
                    />
                </label>
                <button
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    type="submit"
                >
                    Sign Up
                </button>
                {status ? (
                    <p className="text-sm text-emerald-600">{status}</p>
                ) : null}
            </form>
        </section>
    );
};
