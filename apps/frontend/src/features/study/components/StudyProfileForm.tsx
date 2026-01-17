import { useState, type FormEvent } from "react";
import { getUser } from "../../auth/utils/authStorage";
import { parseCommaList } from "../utils/parse";
import { saveStudyProfile } from "../services/studyService";
import type { LearningStyle } from "../types";

export const StudyProfileForm = () => {
    const [subjects, setSubjects] = useState("");
    const [studyTimes, setStudyTimes] = useState("");
    const [goals, setGoals] = useState("");
    const [learningStyle, setLearningStyle] = useState<LearningStyle | "">("");
    const [status, setStatus] = useState("");

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setStatus("");
        const user = getUser();
        if (!user) {
            setStatus("লগইন করা নেই");
            return;
        }

        try {
            await saveStudyProfile({
                userId: user.id,
                subjects: parseCommaList(subjects),
                studyTimes: parseCommaList(studyTimes),
                goals: parseCommaList(goals),
                learningStyle: learningStyle || undefined,
            });
            setStatus("প্রোফাইল সেভ হয়েছে");
        } catch (error) {
            setStatus("প্রোফাইল সেভ করা যায়নি");
        }
    };

    return (
        <section className="card-3d rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
                স্টাডি প্রোফাইল
            </h2>
            <p className="mt-1 text-sm text-slate-500">
                আপনার স্টাডি পছন্দ ও লক্ষ্য যোগ করুন।
            </p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                    Subjects (কমা দিয়ে আলাদা)
                    <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={subjects}
                        onChange={(event) => setSubjects(event.target.value)}
                        placeholder="Math, Physics"
                        required
                    />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                    Study times (কমা দিয়ে আলাদা)
                    <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={studyTimes}
                        onChange={(event) => setStudyTimes(event.target.value)}
                        placeholder="morning, evening"
                    />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                    Goals (কমা দিয়ে আলাদা)
                    <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={goals}
                        onChange={(event) => setGoals(event.target.value)}
                        placeholder="Exam prep, Group study"
                    />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                    Learning style
                    <select
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={learningStyle}
                        onChange={(event) =>
                            setLearningStyle(
                                event.target.value as LearningStyle
                            )
                        }
                    >
                        <option value="">select</option>
                        <option value="visual">Visual</option>
                        <option value="auditory">Auditory</option>
                        <option value="kinesthetic">Kinesthetic</option>
                        <option value="reading_writing">Reading/Writing</option>
                    </select>
                </label>
                <button
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    type="submit"
                >
                    সেভ প্রোফাইল
                </button>
                {status ? (
                    <p className="text-sm text-emerald-600">{status}</p>
                ) : null}
            </form>
        </section>
    );
};
