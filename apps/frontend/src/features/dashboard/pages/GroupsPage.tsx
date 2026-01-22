import { JoinStudyGroupForm } from "../../study/components/JoinStudyGroupForm";
import { StudyGroupForm } from "../../study/components/StudyGroupForm";
import { StudyGroupList } from "../../study/components/StudyGroupList";
import { DashboardLayout } from "../components/DashboardLayout";

export const GroupsPage = () => {
    return (
        <DashboardLayout
            title="Study Group Management"
            description="Create new groups, view lists, or join existing groups."
        >
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                <div className="lg:col-span-1">
                    <StudyGroupForm />
                </div>
                <div className="lg:col-span-1">
                    <StudyGroupList />
                </div>
            </div>
            <div className="mt-4 sm:mt-6 max-w-md mx-auto lg:mx-0">
                <JoinStudyGroupForm />
            </div>
        </DashboardLayout>
    );
};
