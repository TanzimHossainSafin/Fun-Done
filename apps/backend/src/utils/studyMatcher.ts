export type StudyProfileLike = {
    userId: string;
    subjects: string[];
    goals: string[];
    studyTimes: string[];
    learningStyle?: string;
};

type MatchBreakdown = {
    subjectScore: number;
    goalScore: number;
    timeScore: number;
    styleScore: number;
};

const normalizeArray = (items: string[]) =>
    Array.from(
        new Set(
            items
                .map((item) => item.trim().toLowerCase())
                .filter((item) => item.length > 0)
        )
    );

const jaccardSimilarity = (a: string[], b: string[]) => {
    const setA = new Set(a);
    const setB = new Set(b);
    const intersection = [...setA].filter((value) => setB.has(value));
    const union = new Set([...setA, ...setB]);
    if (union.size === 0) {
        return 0;
    }
    return intersection.length / union.size;
};

export const getMatchScore = (
    current: StudyProfileLike,
    candidate: StudyProfileLike
) => {
    const subjectsA = normalizeArray(current.subjects);
    const subjectsB = normalizeArray(candidate.subjects);
    const goalsA = normalizeArray(current.goals);
    const goalsB = normalizeArray(candidate.goals);
    const timesA = normalizeArray(current.studyTimes);
    const timesB = normalizeArray(candidate.studyTimes);

    const subjectScore = jaccardSimilarity(subjectsA, subjectsB);
    const goalScore = jaccardSimilarity(goalsA, goalsB);
    const timeScore = jaccardSimilarity(timesA, timesB);
    const styleScore =
        current.learningStyle &&
        candidate.learningStyle &&
        current.learningStyle.toLowerCase() ===
            candidate.learningStyle.toLowerCase()
            ? 1
            : 0;

    const totalScore =
        subjectScore * 0.4 +
        goalScore * 0.3 +
        timeScore * 0.2 +
        styleScore * 0.1;

    const overlap = {
        subjects: subjectsA.filter((subject) => subjectsB.includes(subject)),
        goals: goalsA.filter((goal) => goalsB.includes(goal)),
        studyTimes: timesA.filter((time) => timesB.includes(time)),
    };

    const breakdown: MatchBreakdown = {
        subjectScore,
        goalScore,
        timeScore,
        styleScore,
    };

    return {
        score: Number(totalScore.toFixed(3)),
        breakdown,
        overlap,
    };
};

export const suggestMeetingTimes = (
    profiles: StudyProfileLike[],
    limit = 3
) => {
    const frequency = new Map<string, number>();
    profiles.forEach((profile) => {
        normalizeArray(profile.studyTimes).forEach((time) => {
            frequency.set(time, (frequency.get(time) || 0) + 1);
        });
    });

    return [...frequency.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([time]) => time);
};
