import { MatchResults } from "../../study/components/MatchResults";
import { StudyProfileForm } from "../../study/components/StudyProfileForm";
import { DashboardLayout } from "../components/DashboardLayout";

export const StudyPage = () => {
    return (
        <DashboardLayout
            title="স্টাডি প্রোফাইল ও ম্যাচিং"
            description="স্টাডি পছন্দ সেট করুন এবং পার্টনার ম্যাচিং পান।"
        >
            <div className="mb-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                        <p className="text-sm font-semibold text-blue-900">
                            AI-Powered Study Matching
                        </p>
                        <p className="mt-1 text-xs text-blue-700">
                            Our AI analyzes your study preferences to find the best study partners
                            and provides personalized recommendations, study tips, and compatibility insights!
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2">
                <StudyProfileForm />
                <MatchResults />
            </div>
        </DashboardLayout>
    );
};
