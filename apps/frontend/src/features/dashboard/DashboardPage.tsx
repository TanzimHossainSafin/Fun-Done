import { Link } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";

export const DashboardPage = () => {
    return (
        <DashboardLayout
            title="Your Study & Group Management"
            description="Manage everything by entering your preferred section from the dashboard."
        >
            <section className="card-3d rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">
                            Refreshment Zone
                        </h2>
                        <p className="text-sm text-slate-500">
                            Share jokes/memes to have some fun.
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
                        title: "Study Profile",
                        description: "Set up your profile and get matched.",
                        to: "/dashboard/study",
                    },
                    {
                        title: "Study Match",
                        description: "Partner matching and suggested times.",
                        to: "/dashboard/study",
                    },
                    {
                        title: "Create Group",
                        description: "Create new groups and add members.",
                        to: "/dashboard/groups",
                    },
                    {
                        title: "Group List",
                        description: "View your groups.",
                        to: "/dashboard/groups",
                    },
                    {
                        title: "Session Log",
                        description: "Add study sessions and track time.",
                        to: "/dashboard/sessions",
                    },
                    {
                        title: "Session List",
                        description: "View previous sessions.",
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
                            View Details →
                        </p>
                    </Link>
                ))}
            </section>
        </DashboardLayout>
    );
};
