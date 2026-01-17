import { clearToken, getUser } from "../../auth/utils/authStorage";
import { NavLink, useNavigate } from "react-router-dom";

export const DashboardNav = () => {
    const navigate = useNavigate();
    const user = getUser();

    const handleLogout = () => {
        clearToken();
        navigate("/login");
    };

    return (
        <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                        B
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-900">
                            Bondhon
                        </p>
                        <p className="text-xs text-slate-500">
                            {user?.username || "Student OS"}
                        </p>
                    </div>
                </div>
                <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
                    {[
                        { to: "/dashboard", label: "Overview" },
                        { to: "/dashboard/study", label: "Study Match" },
                        { to: "/dashboard/groups", label: "Groups" },
                        { to: "/dashboard/sessions", label: "Sessions" },
                        { to: "/dashboard/timetable", label: "📅 Timetable" },
                        { to: "/dashboard/interview", label: "🎯 Interview" },
                        { to: "/dashboard/career", label: "💼 Career" },
                        { to: "/dashboard/ai-tools", label: "🤖 AI Tools" },
                        { to: "/dashboard/refreshment", label: "Refreshment" },
                    ].map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `hover:text-slate-900 ${
                                    isActive ? "text-slate-900" : ""
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </div>
                <button
                    onClick={handleLogout}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};
