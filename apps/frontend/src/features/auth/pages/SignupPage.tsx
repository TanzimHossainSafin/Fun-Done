import { useNavigate } from "react-router-dom";
import { ThreeDArt } from "../../../components/ui/ThreeDArt";
import { SignupForm } from "../components/SignupForm";

export const SignupPage = () => {
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
                            নতুন অ্যাকাউন্ট তৈরি করুন
                        </h1>
                        <p className="text-base text-slate-600">
                            সাইনআপ করে ড্যাশবোর্ডে স্টাডি ম্যানেজ করুন।
                        </p>
                    </div>
                </header>

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-900">
                            কী পাবেন?
                        </h2>
                        <div className="mt-6 flex items-center justify-center">
                            <ThreeDArt />
                        </div>
                        <ul className="mt-4 space-y-3 text-sm text-slate-600">
                            <li>✅ দ্রুত স্টাডি গ্রুপ খুঁজুন</li>
                            <li>✅ সেশন ও প্রোগ্রেস ট্র্যাক করুন</li>
                            <li>✅ এক জায়গায় সব ফিচার</li>
                        </ul>
                    </section>
                    <SignupForm onSuccess={() => navigate("/login")} />
                </div>
            </div>
        </main>
    );
};
