import { StudySessionForm } from "../../study/components/StudySessionForm";
import { StudySessionList } from "../../study/components/StudySessionList";
import { DashboardLayout } from "../components/DashboardLayout";

export const SessionsPage = () => {
    return (
        <DashboardLayout
            title="স্টাডি সেশন ট্র্যাকিং"
            description="সেশন লগ করুন এবং ইতিহাস দেখুন।"
        >
            <div className="grid gap-6 lg:grid-cols-2">
                <StudySessionForm />
                <StudySessionList />
            </div>
        </DashboardLayout>
    );
};
