import { Link } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";

export const DashboardPage = () => {
    return (
        <DashboardLayout
            title="আপনার স্টাডি ও গ্রুপ ম্যানেজমেন্ট"
            description="ড্যাশবোর্ড থেকে পছন্দের সেকশনে ঢুকে সব ম্যানেজ করুন।"
        >
            <section className="card-3d rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">
                            Refreshment Zone
                        </h2>
                        <p className="text-sm text-slate-500">
                            মজা করার জন্য জোকস/মিমস শেয়ার করুন।
                        </p>
                    </div>
                    <Link
                        to="/dashboard/refreshment"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                        Share Now
                    </Link>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                    {
                        title: "স্টাডি প্রোফাইল",
                        description: "প্রোফাইল সেট করুন ও ম্যাচিং নিন।",
                        to: "/dashboard/study",
                    },
                    {
                        title: "স্টাডি ম্যাচ",
                        description: "পার্টনার ম্যাচিং ও সাজেস্টেড সময়।",
                        to: "/dashboard/study",
                    },
                    {
                        title: "গ্রুপ তৈরি",
                        description: "নতুন গ্রুপ তৈরি ও মেম্বার যোগ।",
                        to: "/dashboard/groups",
                    },
                    {
                        title: "গ্রুপ তালিকা",
                        description: "আপনার গ্রুপগুলো দেখুন।",
                        to: "/dashboard/groups",
                    },
                    {
                        title: "সেশন লগ",
                        description: "স্টাডি সেশন যোগ ও সময় ট্র্যাকিং।",
                        to: "/dashboard/sessions",
                    },
                    {
                        title: "সেশন তালিকা",
                        description: "পূর্বের সেশনগুলো দেখুন।",
                        to: "/dashboard/sessions",
                    },
                ].map((card) => (
                    <Link
                        key={card.title}
                        to={card.to}
                        className="card-3d group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-start justify-between">
                            <h3 className="text-base font-semibold text-slate-900">
                                {card.title}
                            </h3>
                            <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
                                Open
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                            {card.description}
                        </p>
                        <p className="mt-4 text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                            বিস্তারিত দেখুন →
                        </p>
                    </Link>
                ))}
            </section>
        </DashboardLayout>
    );
};
