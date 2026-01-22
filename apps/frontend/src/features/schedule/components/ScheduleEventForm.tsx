import { useState, type FormEvent } from "react";
import { getUser } from "../../auth/utils/authStorage";
import { addScheduleEvent } from "../services/scheduleService";

export const ScheduleEventForm = () => {
    const [title, setTitle] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [type, setType] = useState<"class" | "study" | "exam" | "personal">(
        "class"
    );
    const [priority, setPriority] = useState(3);
    const [status, setStatus] = useState("");

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setStatus("");
        const user = getUser();
        if (!user) {
            setStatus("Not logged in");
            return;
        }
        try {
            await addScheduleEvent({
                userId: user.id,
                title,
                start,
                end,
                type,
                priority,
            });
            setStatus("Event added successfully");
            setTitle("");
            setStart("");
            setEnd("");
        } catch (error) {
            setStatus("Failed to add event");
        }
    };

    return (
        <section className="card-3d rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
                Add Class/Event
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                    Title
                    <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Physics Class"
                        required
                    />
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                    <label className="block text-sm font-medium text-slate-700">
                        Start (ISO)
                        <input
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                            placeholder="2026-01-16T09:00:00"
                            required
                        />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                        End (ISO)
                        <input
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                            placeholder="2026-01-16T10:30:00"
                            required
                        />
                    </label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <label className="block text-sm font-medium text-slate-700">
                        Type
                        <select
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            value={type}
                            onChange={(e) =>
                                setType(
                                    e.target.value as "class" | "study" | "exam" | "personal"
                                )
                            }
                        >
                            <option value="class">Class</option>
                            <option value="study">Study</option>
                            <option value="exam">Exam</option>
                            <option value="personal">Personal</option>
                        </select>
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                        Priority (1-5)
                        <input
                            type="number"
                            min={1}
                            max={5}
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            value={priority}
                            onChange={(e) => setPriority(Number(e.target.value))}
                        />
                    </label>
                </div>
                <button
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    type="submit"
                >
                    Add Event
                </button>
                {status ? (
                    <p className="text-sm text-emerald-600">{status}</p>
                ) : null}
            </form>
        </section>
    );
};
