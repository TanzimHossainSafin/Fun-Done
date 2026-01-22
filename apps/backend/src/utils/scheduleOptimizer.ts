import type { ScheduleEventType } from "../models/schedule.model";

type ScheduleEvent = {
    title: string;
    start: Date;
    end: Date;
    type: ScheduleEventType;
    priority: number;
};

type StudyBlockPreference = {
    subject: string;
    minutes: number;
    priority: number;
};

const WORK_START_HOUR = 8;
const WORK_END_HOUR = 22;

const parseTimeRange = (range: string) => {
    const [start, end] = range.split("-");
    if (!start || !end) {
        return null;
    }
    return { start, end };
};

const buildSlotsForDay = (
    day: Date,
    productiveHours: string[],
    events: ScheduleEvent[]
) => {
    const dayStart = new Date(day);
    dayStart.setHours(WORK_START_HOUR, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(WORK_END_HOUR, 0, 0, 0);

    const dayEvents = events.filter(
        (event) => event.start < dayEnd && event.end > dayStart
    );

    const slots: Array<{ start: Date; end: Date }> = [];
    let cursor = new Date(dayStart);

    const sortedEvents = [...dayEvents].sort(
        (a, b) => a.start.getTime() - b.start.getTime()
    );

    sortedEvents.forEach((event) => {
        if (event.start > cursor) {
            slots.push({ start: new Date(cursor), end: new Date(event.start) });
        }
        cursor = event.end > cursor ? new Date(event.end) : cursor;
    });

    if (cursor < dayEnd) {
        slots.push({ start: new Date(cursor), end: new Date(dayEnd) });
    }

    if (productiveHours.length === 0) {
        return slots;
    }

    const productiveSlots: Array<{ start: Date; end: Date }> = [];
    productiveHours.forEach((range) => {
        const parsed = parseTimeRange(range);
        if (!parsed) {
            return;
        }
        const rangeStart = new Date(day);
        const rangeEnd = new Date(day);
        const [startHour, startMinute] = parsed.start.split(":");
        const [endHour, endMinute] = parsed.end.split(":");
        rangeStart.setHours(Number(startHour), Number(startMinute || 0), 0, 0);
        rangeEnd.setHours(Number(endHour), Number(endMinute || 0), 0, 0);

        slots.forEach((slot) => {
            const start = slot.start > rangeStart ? slot.start : rangeStart;
            const end = slot.end < rangeEnd ? slot.end : rangeEnd;
            if (start < end) {
                productiveSlots.push({ start: new Date(start), end: new Date(end) });
            }
        });
    });

    return productiveSlots;
};

export const generateStudyPlan = (
    events: ScheduleEvent[],
    productiveHours: string[],
    preferences: StudyBlockPreference[],
    days = 7
) => {
    const today = new Date();
    const suggestions: Array<{
        subject: string;
        start: Date;
        end: Date;
        minutes: number;
        priority: number;
    }> = [];

    const orderedPreferences = [...preferences].sort(
        (a, b) => b.priority - a.priority
    );

    for (let i = 0; i < days; i += 1) {
        const day = new Date(today);
        day.setDate(today.getDate() + i);
        const slots = buildSlotsForDay(day, productiveHours, events);

        orderedPreferences.forEach((pref) => {
            const minutes = pref.minutes;
            const slot = slots.find(
                (slotItem) =>
                    slotItem.end.getTime() - slotItem.start.getTime() >=
                    minutes * 60000
            );
            if (!slot) {
                return;
            }
            const start = new Date(slot.start);
            const end = new Date(start.getTime() + minutes * 60000);
            suggestions.push({
                subject: pref.subject,
                start,
                end,
                minutes,
                priority: pref.priority,
            });
            slot.start = end;
        });
    }

    return suggestions.slice(0, 20);
};
