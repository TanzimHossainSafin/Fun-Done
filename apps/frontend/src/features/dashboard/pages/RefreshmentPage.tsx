import { useState } from "react";
import { FetchAllJokes } from "../../../components/layout/fetchAllJokes";
import { SubmitJokes } from "../../../components/layout/submitJokes";
import { DashboardLayout } from "../components/DashboardLayout";

export const RefreshmentPage = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleCreated = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <DashboardLayout
            title="Refreshment Zone"
            description="জোকস ও মিমস শেয়ার করে একটু রিফ্রেশ হন।"
        >
            <div className="grid gap-6 lg:grid-cols-2">
                <SubmitJokes onCreated={handleCreated} />
                <FetchAllJokes refreshKey={refreshKey} />
            </div>
        </DashboardLayout>
    );
};
