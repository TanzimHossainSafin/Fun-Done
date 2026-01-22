import { clearToken } from "../../auth/utils/authStorage";
import { NavLink, useNavigate } from "react-router-dom";
import udyomixLogo from "../../../assets/udyomix-logo.svg";

export const DashboardNav = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await clearToken();
        navigate("/login");
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
                <div className="flex items-center gap-3">
                    <img 
                        src={udyomixLogo} 
                        alt="Udyomix Logo" 
                        className="h-8 w-auto transition-opacity hover:opacity-80"
                    />
                </div>
                <div className="hidden items-center gap-1 text-sm font-medium lg:flex">
                    {[
                        { to: "/dashboard", label: "Overview" },
                        { to: "/dashboard/study", label: "Study Match" },
                        { to: "/dashboard/groups", label: "Groups" },
                        { to: "/dashboard/sessions", label: "Sessions" },
                        { to: "/dashboard/timetable", label: "Timetable" },
                        { to: "/dashboard/interview", label: "Interview" },
                        { to: "/dashboard/career", label: "Career" },
                        { to: "/dashboard/ai-tools", label: "AI Tools" },
                        { to: "/dashboard/refreshment", label: "Refreshment" },
                    ].map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                    isActive
                                        ? "bg-blue-50 text-blue-700 font-semibold"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </div>
                <button
                    onClick={handleLogout}
                    className="rounded-md bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-all duration-200 hover:bg-red-100 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};
