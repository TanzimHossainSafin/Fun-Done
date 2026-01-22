import { StudyProfileForm } from "./components/StudyProfileForm";
import { MatchResults } from "./components/MatchResults";
import { StudyGroupForm } from "./components/StudyGroupForm";
import { StudyGroupList } from "./components/StudyGroupList";
import { JoinStudyGroupForm } from "./components/JoinStudyGroupForm";
import { StudySessionForm } from "./components/StudySessionForm";
import { StudySessionList } from "./components/StudySessionList";
import { AgendaGenerator } from "./components/AgendaGenerator";

export const StudyMatcherPage = () => {
    return (
        <section className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white shadow-lg">
                <h1 className="text-2xl font-bold">📚 Study Matcher & Groups</h1>
                <p className="mt-1 text-blue-100">
                    Find study partners and manage your study groups with AI assistance
                </p>
            </div>
            
            <StudyProfileForm />
            <MatchResults />
            
            <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">
                    💡 AI-Enhanced Matching
                </p>
                <p className="mt-1 text-xs text-blue-700">
                    Our AI analyzes your profile to provide personalized study partner recommendations,
                    compatibility insights, and study tips!
                </p>
            </div>
            
            <AgendaGenerator />
            <StudyGroupForm />
            <StudyGroupList />
            <JoinStudyGroupForm />
            <StudySessionForm />
            <StudySessionList />
        </section>
    );
};
