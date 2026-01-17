import { useState, type FormEvent } from "react";
import { registerUser } from "../services/registerService";
import { extractErrorMessage } from "../utils/error";

type SignupFormProps = {
    onSuccess?: () => void;
};

export const SignupForm = ({ onSuccess }: SignupFormProps) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("");

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setStatus("");
        try {
            await registerUser({ username, email, password });
            setStatus("সাইনআপ সফল হয়েছে, এখন লগইন করুন");
            onSuccess?.();
        } catch (error) {
            setStatus(extractErrorMessage(error, "সাইনআপ করা যায়নি"));
        }
    };

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-900">
                    সাইনআপ
                </h2>
                <p className="text-sm text-slate-500">
                    নতুন অ্যাকাউন্ট তৈরি করুন।
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                    ইউজারনেম
                    <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder="yourname"
                        required
                    />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                    ইমেইল
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
                    পাসওয়ার্ড
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
                    সাইনআপ করুন
                </button>
                {status ? (
                    <p className="text-sm text-emerald-600">{status}</p>
                ) : null}
            </form>
        </section>
    );
};
