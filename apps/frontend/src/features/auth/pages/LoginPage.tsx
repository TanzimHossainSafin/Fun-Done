import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ThreeDArt } from "../../../components/ui/ThreeDArt";
import { LoginForm } from "../components/LoginForm";

export const LoginPage = () => {
    const navigate = useNavigate();

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
                <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="max-w-2xl space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                            Bondhon
                        </p>
                        <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
                            লগইন করে আপনার ড্যাশবোর্ডে যান
                        </h1>
                        <p className="text-base text-slate-600">
                            এক জায়গা থেকে স্টাডি ম্যাচ, গ্রুপ ও সেশন ম্যানেজ করুন।
                        </p>
                    </div>
                </header>

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-900">
                            কেন Bondhon?
                        </h2>
                        <div className="mt-6 flex items-center justify-center">
                            <ThreeDArt />
                        </div>
                        <ul className="mt-4 space-y-3 text-sm text-slate-600">
                            <li>✅ স্মার্ট স্টাডি ম্যাচিং</li>
                            <li>✅ গ্রুপ ও সেশন ট্র্যাকিং</li>
                            <li>✅ ফোকাসড ও পরিচ্ছন্ন ড্যাশবোর্ড</li>
                        </ul>
                    </section>
                    <div className="space-y-4">
                        <LoginForm onSuccess={() => navigate("/dashboard")} />
                        <p className="text-sm text-slate-600">
                            নতুন ইউজার?{" "}
                            <Link
                                to="/signup"
                                className="font-semibold text-blue-600 hover:text-blue-700"
                            >
                                সাইনআপ করুন
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};
