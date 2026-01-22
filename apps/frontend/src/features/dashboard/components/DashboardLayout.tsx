import type React from "react";
import dashboardBg from "../../../assets/dashboard-bg.svg";
import { DashboardNav } from "./DashboardNav";
import { getUser } from "../../auth/utils/authStorage";

type DashboardLayoutProps = {
    title: string;
    description: string;
    children: React.ReactNode;
};

// Generate default avatar URL
const generateDefaultAvatar = (username: string): string => {
    const initial = username.charAt(0).toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=3b82f6&color=fff&size=200&bold=true`;
};

export const DashboardLayout = ({
    title,
    description,
    children,
}: DashboardLayoutProps) => {
    const user = getUser();
    const profileImage = user?.profileImage || (user?.username ? generateDefaultAvatar(user.username) : null);

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

            <div className="relative mx-auto flex max-w-7xl flex-col gap-4 sm:gap-6 lg:gap-8 px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10">
                <header className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="max-w-2xl space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                                Dashboard
                            </p>
                            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                                {title}
                            </h1>
                            <p className="text-sm text-slate-600">
                                {description}
                            </p>
                        </div>
                        <div className="hidden md:flex md:items-center md:gap-4">
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt={user?.username || "Profile"}
                                    className="h-24 w-24 rounded-full object-cover border-2 border-blue-500 shadow-sm"
                                    onError={(e) => {
                                        // Fallback to default avatar if image fails to load
                                        const target = e.target as HTMLImageElement;
                                        if (user?.username) {
                                            target.src = generateDefaultAvatar(user.username);
                                        }
                                    }}
                                />
                            ) : user?.username ? (
                                <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-blue-500 bg-blue-600 text-3xl font-bold text-white shadow-sm">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                            ) : null}
                            <div className="card-3d flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-blue-600">
                                        Student Mode
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-600">
                                        Focus. Connect. Grow.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {children}
            </div>
        </main>
    );
};
