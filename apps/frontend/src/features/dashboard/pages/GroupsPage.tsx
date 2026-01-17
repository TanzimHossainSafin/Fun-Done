import { JoinStudyGroupForm } from "../../study/components/JoinStudyGroupForm";
import { StudyGroupForm } from "../../study/components/StudyGroupForm";
import { StudyGroupList } from "../../study/components/StudyGroupList";
import { DashboardLayout } from "../components/DashboardLayout";

export const GroupsPage = () => {
    return (
        <DashboardLayout
            title="স্টাডি গ্রুপ ম্যানেজমেন্ট"
            description="নতুন গ্রুপ তৈরি করুন, তালিকা দেখুন বা জয়েন করুন।"
        >
            <div className="grid gap-6 lg:grid-cols-2">
                <StudyGroupForm />
                <StudyGroupList />
            </div>
            <JoinStudyGroupForm />
        </DashboardLayout>
    );
};
