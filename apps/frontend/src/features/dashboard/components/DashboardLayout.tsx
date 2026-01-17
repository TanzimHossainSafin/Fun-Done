import type React from "react";
import studentIllustration from "../../../assets/student-illustration.svg";
import dashboardBg from "../../../assets/dashboard-bg.svg";
import { ThreeDArt } from "../../../components/ui/ThreeDArt";
import { DashboardNav } from "./DashboardNav";

type DashboardLayoutProps = {
    title: string;
    description: string;
    children: React.ReactNode;
};

export const DashboardLayout = ({
    title,
    description,
    children,
}: DashboardLayoutProps) => {
    return (
        <main className="relative min-h-screen overflow-hidden bg-[#F1F3F5] text-slate-900">
            <div className="pointer-events-none absolute inset-0">
                <img
                    src={dashboardBg}
                    alt=""
                    className="h-full w-full object-cover opacity-80"
                />
                <div className="orb orb-blue" />
                <div className="orb orb-purple" />
                <div className="orb orb-sky" />
            </div>

            <DashboardNav />

            <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
                <header className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="max-w-2xl space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                                Dashboard
                            </p>
                            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
                                {title}
                            </h1>
                            <p className="text-base text-slate-600">
                                {description}
                            </p>
                        </div>
                        <div className="hidden md:flex md:items-center md:gap-6">
                            <img
                                src={studentIllustration}
                                alt="Student illustration"
                                className="h-40 w-40 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                            />
                            <div className="card-3d flex items-center gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-blue-600">
                                        Student Mode
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-slate-900">
                                        Focus. Connect. Grow.
                                    </p>
                                </div>
                                <ThreeDArt />
                            </div>
                        </div>
                    </div>
                </header>

                {children}
            </div>
        </main>
    );
};
