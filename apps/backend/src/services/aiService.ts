import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

// Initialize AI clients
if (!process.env.GEMINI_API_KEY) {
    console.warn("Warning: GEMINI_API_KEY not found in environment variables");
}
if (!process.env.GROK_API_KEY) {
    console.warn("Warning: GROK_API_KEY not found in environment variables");
}

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const groq = new Groq({ apiKey: process.env.GROK_API_KEY || "" });

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash"; // Changed from gemini-2.5-flash to gemini-1.5-flash
const GROK_MODEL = process.env.GROK_MODEL || "openai/gpt-oss-120b";
const AI_PROVIDER = process.env.AI_PROVIDER || "gemini"; // 'gemini' or 'grok'

// Rate limiting helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry AI request with exponential backoff
 */
const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    initialDelay = 1000
): Promise<T> => {
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            
            // Check if it's a rate limit error (429)
            if (error.status === 429) {
                const delay = initialDelay * Math.pow(2, i);
                console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${i + 1}/${maxRetries})`);
                await sleep(delay);
                continue;
            }
            
            // If it's not a rate limit error, throw immediately
            throw error;
        }
    }
    
    throw lastError;
};

export interface StudyMatchEnhancement {
    matchId: string;
    aiRecommendation: string;
    studyTips: string[];
    suggestedTopics: string[];
    compatibilityInsights: string;
}

export interface AIChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

/**
 * Get AI-enhanced study match recommendations
 */
export const getAIMatchRecommendation = async (
    currentUserProfile: {
        subjects: string[];
        goals: string[];
        learningStyle?: string;
    },
    matchedUserProfile: {
        subjects: string[];
        goals: string[];
        learningStyle?: string;
    },
    matchScore: number
): Promise<StudyMatchEnhancement> => {
    try {
        const prompt = `You are a study matching assistant. Analyze these two study profiles and provide personalized recommendations:

Current User:
- Subjects: ${currentUserProfile.subjects.join(", ")}
- Goals: ${currentUserProfile.goals.join(", ")}
- Learning Style: ${currentUserProfile.learningStyle || "Not specified"}

Matched User:
- Subjects: ${matchedUserProfile.subjects.join(", ")}
- Goals: ${matchedUserProfile.goals.join(", ")}
- Learning Style: ${matchedUserProfile.learningStyle || "Not specified"}

Match Score: ${(matchScore * 100).toFixed(1)}%

Provide a JSON response with:
{
  "recommendation": "A brief personalized recommendation (2-3 sentences) on why this is a good match",
  "studyTips": ["3-5 specific study tips for working together"],
  "suggestedTopics": ["3-5 specific topics they should study together"],
  "compatibilityInsights": "Brief insights about their compatibility (1-2 sentences)"
}`;

        const model = ai.getGenerativeModel({ model: MODEL_NAME });
        const result = await model.generateContent(prompt);
        const response = result.response;
        
        const text = response.text() || "";
        
        // Extract JSON from response (Gemini might wrap it in markdown)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : text;
        const aiResponse = JSON.parse(jsonText);

        return {
            matchId: "", // Will be set by caller
            aiRecommendation: aiResponse.recommendation || "",
            studyTips: aiResponse.studyTips || [],
            suggestedTopics: aiResponse.suggestedTopics || [],
            compatibilityInsights: aiResponse.compatibilityInsights || "",
        };
    } catch (error) {
        console.error("AI Match Recommendation Error:", error);
        // Return fallback response if AI fails
        return {
            matchId: "",
            aiRecommendation:
                "This match looks promising based on shared interests!",
            studyTips: [
                "Set clear study goals together",
                "Maintain regular study sessions",
                "Share resources and notes",
            ],
            suggestedTopics: currentUserProfile.subjects.slice(0, 3),
            compatibilityInsights:
                "You both share similar learning goals and subjects.",
        };
    }
};

/**
 * AI Moderator for study groups
 */
export const getAIModeratorResponse = async (
    groupContext: {
        groupName: string;
        subject: string;
        memberCount: number;
    },
    conversationHistory: AIChatMessage[],
    userMessage: string,
    provider: "gemini" | "grok" = "gemini"
): Promise<string> => {
    try {
        const systemPrompt = `You are an AI study group moderator named "StudyBot" for the "${groupContext.groupName}" study group focusing on ${groupContext.subject}.

Your role:
- Help students with study-related questions
- Facilitate group discussions
- Provide study tips and resources
- Encourage collaboration
- Keep discussions on topic
- Be friendly, supportive, and motivating

FORMATTING RULES:
- Use **bold** for emphasis (e.g., **20 Newtons**, **F_AB = -F_BA**)
- Use bullet points (- or •) for lists
- Use numbered lists (1., 2., 3.) for steps
- Use line breaks to separate paragraphs for better readability
- For equations, use **bold** and clear spacing (e.g., **F_AB = -F_BA**)
- Keep responses well-structured and visually appealing
- Use emojis occasionally for engagement (✨, 📚, 🎯, 💡)

Group has ${groupContext.memberCount} members. Keep responses concise (2-4 paragraphs) unless detailed explanation is needed.

Conversation history:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User: ${userMessage}`;

        let text = "";

        if (provider === "grok") {
            // Use Grok API
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt.split('\n\nUser:')[0] },
                    ...conversationHistory.map(msg => ({
                        role: msg.role as "user" | "assistant",
                        content: msg.content
                    })),
                    { role: "user", content: userMessage }
                ],
                model: GROK_MODEL,
                temperature: 0.7,
                max_tokens: 1024,
            });

            text = chatCompletion.choices[0]?.message?.content || "I'm here to help! Could you please rephrase that?";
        } else {
            // Use Gemini API
            const model = ai.getGenerativeModel({ model: MODEL_NAME });
            const response = await retryWithBackoff(() =>
                model.generateContent(systemPrompt)
            );
            const result = await response;
            const responseData = result.response;

            text = responseData.text() || "I'm here to help! Could you please rephrase that?";
        }

        return text;
    } catch (error: any) {
        console.error("AI Moderator Error:", error);
        
        // Provide more specific error messages
        if (error.status === 429) {
            return "I'm currently experiencing high demand. Please wait a moment and try again.";
        }
        
        return "I'm having trouble processing that right now. Please try again!";
    }
};

/**
 * Generate study session agenda using AI
 */
export const generateStudySessionAgenda = async (
    topic: string,
    duration: number,
    memberGoals: string[]
): Promise<{
    agenda: string[];
    objectives: string[];
    resources: string[];
}> => {
    try {
        const prompt = `Create a study session agenda for:
Topic: ${topic}
Duration: ${duration} minutes
Goals: ${memberGoals.join(", ")}

Provide a JSON response with:
{
  "agenda": ["Ordered list of 4-6 agenda items with time allocations"],
  "objectives": ["3-4 key learning objectives"],
  "resources": ["3-5 recommended study resources or materials"]
}`;

        const model = ai.getGenerativeModel({ model: MODEL_NAME });
        const response = await retryWithBackoff(() =>
            model.generateContent(prompt)
        );
        const result = await response;
        const responseData = result.response;
        
        const text = responseData.text() || "";
        
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : text;
        const aiResponse = JSON.parse(jsonText);

        return {
            agenda: aiResponse.agenda || [],
            objectives: aiResponse.objectives || [],
            resources: aiResponse.resources || [],
        };
    } catch (error) {
        console.error("Study Session Agenda Error:", error);
        return {
            agenda: [
                `Introduction and goals (5 min)`,
                `Main topic discussion (${Math.floor(duration * 0.6)} min)`,
                `Q&A and practice (${Math.floor(duration * 0.3)} min)`,
                `Summary and next steps (${Math.floor(duration * 0.1)} min)`,
            ],
            objectives: [
                `Understand key concepts of ${topic}`,
                "Apply knowledge through practice",
                "Collaborate effectively",
            ],
            resources: [
                "Course textbook",
                "Online tutorials",
                "Practice problems",
            ],
        };
    }
};

/**
 * Check if AI service is available
 */
export const isAIServiceAvailable = (): boolean => {
    if (AI_PROVIDER === "grok") {
        return !!process.env.GROK_API_KEY;
    }
    return !!process.env.GEMINI_API_KEY;
};

/**
 * Analyze productivity patterns and suggest optimal study times
 */
export const analyzeProductivityPatterns = async (
    sessions: Array<{
        subject: string;
        duration: number;
        startTime: Date;
        productivity: number;
        timeOfDay: string;
    }>
): Promise<{
    peakProductivityTimes: string[];
    subjectPerformance: Record<string, { avgDuration: number; avgProductivity: number }>;
    recommendations: string[];
    optimalSchedule: string;
}> => {
    try {
        // Calculate stats
        const hourlyProductivity: Record<number, number[]> = {};
        const subjectStats: Record<string, { durations: number[]; productivities: number[] }> = {};

        sessions.forEach(session => {
            const hour = session.startTime.getHours();
            if (!hourlyProductivity[hour]) hourlyProductivity[hour] = [];
            hourlyProductivity[hour].push(session.productivity);

            if (!subjectStats[session.subject]) {
                subjectStats[session.subject] = { durations: [], productivities: [] };
            }
            subjectStats[session.subject].durations.push(session.duration);
            subjectStats[session.subject].productivities.push(session.productivity);
        });

        const prompt = `As a productivity expert, analyze this study session data:

📊 **Session Data:**
${sessions.slice(0, 20).map(s => `- ${s.subject}: ${s.duration}min at ${s.timeOfDay}, productivity: ${s.productivity}/5`).join("\n")}

${sessions.length > 20 ? `... (${sessions.length - 20} more sessions)` : ""}

🕐 **Hourly Productivity Averages:**
${Object.entries(hourlyProductivity).map(([hour, prods]) => {
    const avg = prods.reduce((a, b) => a + b, 0) / prods.length;
    return `${hour}:00 - ${avg.toFixed(1)}/5`;
}).join(", ")}

Provide a JSON response with:
{
  "peakProductivityTimes": ["time ranges when productivity is highest, e.g., '8-11 PM'"],
  "subjectPerformance": {
    "subjectName": {"avgDuration": <number>, "avgProductivity": <number>}
  },
  "recommendations": ["3-5 specific actionable recommendations"],
  "optimalSchedule": "<1-2 paragraphs suggesting when to schedule different types of tasks>"
}`;

        const model = ai.getGenerativeModel({ model: MODEL_NAME });
        const response = await retryWithBackoff(() =>
            model.generateContent(prompt)
        );
        const result = await response;
        const responseData = result.response;
        
        const text = responseData.text() || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : text;
        const aiResponse = JSON.parse(jsonText);

        // Calculate subject performance from actual data
        const subjectPerformance: Record<string, { avgDuration: number; avgProductivity: number }> = {};
        Object.entries(subjectStats).forEach(([subject, stats]) => {
            subjectPerformance[subject] = {
                avgDuration: stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length,
                avgProductivity: stats.productivities.reduce((a, b) => a + b, 0) / stats.productivities.length,
            };
        });

        return {
            peakProductivityTimes: aiResponse.peakProductivityTimes || ["8-11 PM"],
            subjectPerformance: subjectPerformance,
            recommendations: aiResponse.recommendations || [],
            optimalSchedule: aiResponse.optimalSchedule || "Schedule your most challenging tasks during your peak productivity hours.",
        };
    } catch (error) {
        console.error("Productivity analysis error:", error);
        return {
            peakProductivityTimes: ["Morning (8-11 AM)", "Evening (7-10 PM)"],
            subjectPerformance: {},
            recommendations: [
                "Schedule difficult subjects during your peak energy times",
                "Take regular breaks every 25-50 minutes",
                "Track your productivity to identify patterns",
            ],
            optimalSchedule: "Based on typical patterns, most students are productive in the morning (8-11 AM) and evening (7-10 PM). Schedule your most challenging tasks during these times.",
        };
    }
};

/**
 * Predict exam stress periods and provide recommendations
 */
export const predictExamStress = async (
    upcomingEvents: Array<{
        title: string;
        type: string;
        start: Date;
        end: Date;
        priority: number;
    }>,
    currentWorkload: number
): Promise<{
    stressLevel: "low" | "medium" | "high" | "critical";
    stressPeriods: Array<{ date: string; level: string; reason: string }>;
    recommendations: string[];
    actionPlan: string;
}> => {
    try {
        const exams = upcomingEvents.filter(e => e.type === "exam");
        const assignments = upcomingEvents.filter(e => e.type === "assignment");

        const prompt = `As an academic advisor, analyze this student's upcoming schedule for stress prediction:

📅 **Upcoming Exams (${exams.length}):**
${exams.map(e => `- ${e.title}: ${e.start.toLocaleDateString()} (Priority: ${e.priority}/5)`).join("\n")}

📝 **Upcoming Assignments (${assignments.length}):**
${assignments.map(e => `- ${e.title}: Due ${e.end.toLocaleDateString()} (Priority: ${e.priority}/5)`).join("\n")}

📊 **Current Workload:** ${currentWorkload} hours/week

Provide a JSON response with:
{
  "stressLevel": "<low|medium|high|critical>",
  "stressPeriods": [
    {"date": "<date>", "level": "<stress level>", "reason": "<why this period is stressful>"}
  ],
  "recommendations": ["4-6 specific stress management recommendations"],
  "actionPlan": "<detailed action plan paragraph for managing the workload>"
}`;

        const model = ai.getGenerativeModel({ model: MODEL_NAME });
        const response = await retryWithBackoff(() =>
            model.generateContent(prompt)
        );
        const result = await response;
        const responseData = result.response;
        
        const text = responseData.text() || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : text;
        const aiResponse = JSON.parse(jsonText);

        return {
            stressLevel: aiResponse.stressLevel || "medium",
            stressPeriods: aiResponse.stressPeriods || [],
            recommendations: aiResponse.recommendations || [],
            actionPlan: aiResponse.actionPlan || "Break down large tasks into smaller, manageable chunks. Prioritize based on deadlines and difficulty.",
        };
    } catch (error) {
        console.error("Exam stress prediction error:", error);
        return {
            stressLevel: "medium",
            stressPeriods: [],
            recommendations: [
                "Start studying for exams at least 2 weeks in advance",
                "Break study sessions into focused 25-50 minute blocks",
                "Practice stress-relief techniques like deep breathing",
                "Maintain regular sleep schedule (7-8 hours)",
                "Exercise for 20-30 minutes daily to reduce stress",
            ],
            actionPlan: "Create a study schedule that distributes workload evenly. Prioritize high-priority tasks and exams. Schedule regular breaks and self-care activities.",
        };
    }
};

/**
 * Analyze schedule with AI for productivity insights
 */
export const analyzeScheduleWithAI = async (
    events: Array<{
        title: string;
        start: Date;
        end: Date;
        type: string;
        priority: number;
    }>,
    productiveHours: string[],
    studyGoals?: string[]
): Promise<{
    productivityScore: number;
    analysis: string;
    recommendations: string[];
    warnings: string[];
}> => {
    try {
        const prompt = `As a productivity and study habits expert, analyze this student's schedule and provide actionable insights:

📅 **Schedule Overview** (${events.length} events):
${events.map(e => `- ${e.title} (${e.type}): ${e.start.toLocaleString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' })} - ${e.end.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' })} [Priority: ${e.priority}]`).join("\n")}

⏰ **Productive Hours:** ${productiveHours.join(", ") || "Not specified"}
🎯 **Study Goals:** ${studyGoals?.join(", ") || "Not specified"}

Provide a JSON response with:
{
  "productivityScore": <number 0-100>,
  "analysis": "<2-3 paragraphs analyzing their schedule balance, time management, and patterns>",
  "recommendations": ["<4-6 specific, actionable habits to improve productivity>"],
  "warnings": ["<Any concerning patterns like burnout risk, poor balance, etc. Leave empty array if none>"]
}

Keep recommendations specific, motivating, and practical.`;

        const model = ai.getGenerativeModel({ model: MODEL_NAME });
        const response = await retryWithBackoff(() =>
            model.generateContent(prompt)
        );
        const result = await response;
        const responseData = result.response;
        
        const text = responseData.text() || "";
        
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : text;
        const aiResponse = JSON.parse(jsonText);

        return {
            productivityScore: aiResponse.productivityScore || 75,
            analysis: aiResponse.analysis || "Your schedule shows a balanced approach to time management.",
            recommendations: aiResponse.recommendations || ["Schedule regular breaks", "Prioritize important tasks", "Maintain consistent study hours"],
            warnings: aiResponse.warnings || [],
        };
    } catch (error) {
        console.error("Schedule Analysis Error:", error);
        return {
            productivityScore: 75,
            analysis: "Your schedule demonstrates good time management practices. Continue balancing study time with breaks for optimal productivity.",
            recommendations: [
                "Schedule regular study breaks every 45-60 minutes",
                "Prioritize high-importance tasks during peak productivity hours",
                "Maintain consistent study routines",
                "Review and adjust your schedule weekly"
            ],
            warnings: []
        };
    }
};

/**
 * Generate habit suggestions with AI
 */
export const suggestHabitsWithAI = async (
    currentHabits: Array<{ 
        name: string; 
        frequency: string; 
        completed: number; 
        total: number 
    }>,
    studyGoals?: string[]
): Promise<{
    habitPerformance: string;
    newHabits: Array<{ name: string; description: string; frequency: string }>;
    implementationTips: string[];
    motivation: string;
}> => {
    try {
        const prompt = `As a learning productivity coach, analyze these study habits and provide personalized recommendations:

📊 **Current Habits:**
${currentHabits.map(h => `- ${h.name} (${h.frequency}): ${h.completed}/${h.total} completed - ${Math.round((h.completed/h.total)*100)}%`).join("\n")}

🎯 **Study Goals:** ${studyGoals?.join(", ") || "General improvement"}

Provide a JSON response with:
{
  "habitPerformance": "<1-2 paragraphs analyzing which habits are working well and which need attention>",
  "newHabits": [
    {"name": "<habit name>", "description": "<why this helps>", "frequency": "<daily/weekly>"}
  ],
  "implementationTips": ["<3-5 practical tips on building these habits>"],
  "motivation": "<1-2 encouraging sentences about their progress>"
}

Keep recommendations specific, achievable, and science-backed.`;

        const model = ai.getGenerativeModel({ model: MODEL_NAME });
        const response = await retryWithBackoff(() =>
            model.generateContent(prompt)
        );
        const result = await response;
        const responseData = result.response;
        
        const text = responseData.text() || "";
        
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : text;
        const aiResponse = JSON.parse(jsonText);

        return {
            habitPerformance: aiResponse.habitPerformance || "You're making good progress with your habits!",
            newHabits: aiResponse.newHabits || [],
            implementationTips: aiResponse.implementationTips || [],
            motivation: aiResponse.motivation || "Keep up the great work! Consistency is key to success."
        };
    } catch (error) {
        console.error("Habit Suggestions Error:", error);
        return {
            habitPerformance: "You're building strong study habits! Keep focusing on consistency.",
            newHabits: [
                { name: "Morning Review", description: "Review yesterday's notes for 10 minutes each morning", frequency: "daily" },
                { name: "Active Recall", description: "Test yourself without notes for better retention", frequency: "daily" },
                { name: "Weekly Planning", description: "Plan your study week every Sunday evening", frequency: "weekly" }
            ],
            implementationTips: [
                "Start small - just 5 minutes per day",
                "Link new habits to existing routines (habit stacking)",
                "Track your progress visually",
                "Celebrate small wins"
            ],
            motivation: "You're on the right track! Small daily improvements lead to remarkable results."
        };
    }
};

// ==================== FEATURE 5: SKILL GAP ANALYZER ====================

/**
 * Analyze job postings to extract required skills
 * In production, this would scrape real job sites (Bdjobs, LinkedIn)
 * For now, using AI to generate realistic job market data
 */
export const analyzeJobMarket = async (targetRole: string, industry?: string) => {
    try {
        const prompt = `Analyze the Bangladesh job market for the role: "${targetRole}"${industry ? ` in the ${industry} industry` : ""}.

Based on current job market trends in Bangladesh (Bdjobs.com, LinkedIn, Prothom Alo Jobs), provide:

1. Top 10 required skills with their importance percentage (how many jobs require it)
2. Priority level for each skill (essential/important/nice-to-have)
3. Top 5 companies hiring for this role
4. Average salary range in BDT
5. 5 sample job titles for this role

Return ONLY a valid JSON object with this structure:
{
    "requiredSkills": [
        {"skillName": "Python", "percentage": 85, "priority": "essential"},
        {"skillName": "SQL", "percentage": 70, "priority": "important"}
    ],
    "topCompanies": ["Company 1", "Company 2"],
    "salaryRange": "50,000 - 80,000 BDT/month",
    "sampleJobTitles": ["Job Title 1", "Job Title 2"],
    "totalJobsAnalyzed": 200,
    "marketDemand": "high|medium|low",
    "growthTrend": "growing|stable|declining"
}`;

        return await retryWithBackoff(async () => {
            const model = ai.getGenerativeModel({ model: MODEL_NAME });
            const result = await model.generateContent(prompt);
            const response = result.response;

            const text = response.text().trim();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error("Failed to parse AI response");
        });
    } catch (error) {
        console.error("Job Market Analysis Error:", error);
        // Return fallback data
        return {
            requiredSkills: [
                { skillName: "Communication", percentage: 90, priority: "essential" },
                { skillName: "Problem Solving", percentage: 85, priority: "essential" },
                { skillName: "Teamwork", percentage: 80, priority: "important" }
            ],
            topCompanies: ["Grameenphone", "BRAC", "bKash", "Pathao", "Daraz"],
            salaryRange: "40,000 - 70,000 BDT/month",
            sampleJobTitles: [targetRole, `Senior ${targetRole}`, `Junior ${targetRole}`],
            totalJobsAnalyzed: 150,
            marketDemand: "medium",
            growthTrend: "stable"
        };
    }
};

/**
 * Generate skill assessment questions based on required skills
 */
export const generateSkillAssessment = async (targetRole: string, requiredSkills: string[]) => {
    try {
        const prompt = `Create a 20-question skill assessment for the role: "${targetRole}".

Skills to test: ${requiredSkills.join(", ")}

Create questions with these rules:
- Mix of easy (40%), medium (40%), hard (20%) difficulty
- Multiple choice with 4 options
- Cover all listed skills
- Include 2-3 coding challenges for technical roles
- Questions should be practical and job-relevant

Return ONLY a valid JSON array:
[
    {
        "questionText": "What is...",
        "skillCategory": "Python",
        "difficulty": "easy",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "Option A",
        "explanation": "Brief explanation"
    },
    {
        "questionText": "Write a function to...",
        "skillCategory": "Python",
        "difficulty": "medium",
        "codeChallenge": {
            "prompt": "Write a function that...",
            "language": "python",
            "testCases": [
                {"input": "5", "expectedOutput": "120"}
            ]
        }
    }
]`;

        return await retryWithBackoff(async () => {
            const model = ai.getGenerativeModel({ model: MODEL_NAME });
            const result = await model.generateContent(prompt);
            const response = result.response;

            const text = response.text().trim();
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error("Failed to parse questions");
        });
    } catch (error) {
        console.error("Assessment Generation Error:", error);
        return [];
    }
};

/**
 * Analyze user's assessment results and identify skill gaps
 */
export const analyzeSkillGaps = async (
    targetRole: string,
    requiredSkills: any[],
    assessmentResults: any[]
) => {
    try {
        const prompt = `Analyze skill gaps for "${targetRole}".

Required Skills:
${JSON.stringify(requiredSkills, null, 2)}

User's Assessment Results:
${JSON.stringify(assessmentResults, null, 2)}

Identify:
1. Skills the user has (score >= 70%)
2. Skills with gaps (score < 70%)
3. Critical gaps (essential skills with low scores)
4. Gap severity (critical/moderate/minor)
5. Priority order for learning

Return ONLY valid JSON:
{
    "skillGaps": [
        {
            "skillName": "Python",
            "requiredLevel": "intermediate",
            "currentLevel": "beginner",
            "gap": "moderate",
            "priority": 1
        }
    ],
    "strengths": ["Skill1", "Skill2"],
    "criticalGaps": ["Skill3", "Skill4"],
    "readinessScore": 45
}`;

        return await retryWithBackoff(async () => {
            const model = ai.getGenerativeModel({ model: MODEL_NAME });
            const result = await model.generateContent(prompt);
            const response = result.response;

            const text = response.text().trim();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error("Failed to parse gap analysis");
        });
    } catch (error) {
        console.error("Skill Gap Analysis Error:", error);
        return {
            skillGaps: [],
            strengths: [],
            criticalGaps: [],
            readinessScore: 0
        };
    }
};

/**
 * Generate personalized learning path with free resources
 */
export const generateLearningPath = async (
    targetRole: string,
    skillGaps: any[]
) => {
    try {
        const prompt = `Create a personalized learning roadmap for "${targetRole}".

Skill Gaps to Address:
${JSON.stringify(skillGaps, null, 2)}

Create a week-by-week learning plan:
- Prioritize critical gaps first
- Recommend FREE resources only (YouTube, freeCodeCamp, MDN, Khan Academy, etc.)
- Include hands-on projects
- Realistic time estimates
- 8-12 weeks total

Return ONLY valid JSON:
{
    "totalWeeks": 10,
    "milestones": [
        {
            "weekNumber": 1,
            "title": "Python Fundamentals",
            "description": "Learn basic Python syntax and data structures",
            "skillsToLearn": ["Python Basics", "Variables", "Functions"],
            "resources": [
                {
                    "title": "Python for Beginners",
                    "url": "https://youtube.com/...",
                    "type": "video",
                    "platform": "YouTube",
                    "duration": "4 hours",
                    "isFree": true,
                    "difficulty": "beginner"
                }
            ],
            "projectIdea": "Build a calculator app",
            "estimatedHours": 10
        }
    ]
}`;

        return await retryWithBackoff(async () => {
            const model = ai.getGenerativeModel({ model: MODEL_NAME });
            const result = await model.generateContent(prompt);
            const response = result.response;

            const text = response.text().trim();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error("Failed to parse learning path");
        });
    } catch (error) {
        console.error("Learning Path Generation Error:", error);
        return {
            totalWeeks: 8,
            milestones: []
        };
    }
};

// ==================== FEATURE 6: MOCK INTERVIEW AI ====================

/**
 * Generate interview questions for specific role and company
 */
export const generateInterviewQuestions = async (
    targetRole: string,
    targetCompany?: string,
    interviewType: string = "mixed"
) => {
    try {
        const prompt = `Generate 10 realistic interview questions for:
Role: ${targetRole}
${targetCompany ? `Company: ${targetCompany} (Bangladesh context)` : ""}
Interview Type: ${interviewType}

Question distribution:
- Behavioral: 40% (use STAR method framework)
- Technical: 40% (role-specific)
- Situational: 20%

${targetCompany ? `Include company-specific questions based on ${targetCompany}'s culture and values.` : ""}

For technical roles, include coding challenges.

Return ONLY valid JSON array:
[
    {
        "questionText": "Tell me about a time when...",
        "questionType": "behavioral",
        "difficulty": "medium",
        "expectedKeywords": ["challenge", "solution", "result"],
        "category": "Leadership",
        "starFramework": {
            "situation": "Expected context",
            "task": "Expected challenge",
            "action": "Expected actions",
            "result": "Expected outcome"
        }
    }
]`;

        return await retryWithBackoff(async () => {
            const model = ai.getGenerativeModel({ model: MODEL_NAME });
            const result = await model.generateContent(prompt);
            const response = result.response;

            const text = response.text().trim();
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error("Failed to parse questions");
        });
    } catch (error) {
        console.error("Interview Questions Generation Error:", error);
        return [];
    }
};

/**
 * Provide AI-powered feedback on interview answer
 */
export const provideInterviewFeedback = async (
    questionText: string,
    questionType: string,
    userAnswer: string,
    expectedKeywords: string[]
) => {
    try {
        const prompt = `Evaluate this interview answer:

Question: "${questionText}"
Type: ${questionType}
Expected Keywords: ${expectedKeywords.join(", ")}

User's Answer:
"${userAnswer}"

Provide detailed feedback:

1. Overall score (0-10)
2. Strengths (3-5 points)
3. Areas to improve (3-5 points)
4. Missing key points
5. Communication score (clarity, confidence)
6. Technical accuracy (if applicable)
7. Structure score (STAR method for behavioral)
8. Specific suggestions for improvement

Return ONLY valid JSON:
{
    "overallScore": 7.5,
    "strengths": ["Point 1", "Point 2"],
    "improvements": ["Point 1", "Point 2"],
    "missingKeywords": ["keyword1"],
    "communicationScore": 8,
    "technicalAccuracy": 7,
    "structureScore": 6,
    "suggestions": "Detailed improvement suggestions...",
    "exampleAnswer": "Brief example of better answer"
}`;

        return await retryWithBackoff(async () => {
            const model = ai.getGenerativeModel({ model: MODEL_NAME });
            const result = await model.generateContent(prompt);
            const response = result.response;

            const text = response.text().trim();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error("Failed to parse feedback");
        });
    } catch (error) {
        console.error("Interview Feedback Error:", error);
        return {
            overallScore: 5,
            strengths: ["You provided an answer"],
            improvements: ["Provide more specific examples", "Structure your answer better"],
            missingKeywords: expectedKeywords,
            communicationScore: 5,
            technicalAccuracy: 5,
            structureScore: 5,
            suggestions: "Try to provide more detailed and structured responses.",
            exampleAnswer: "Could not generate example."
        };
    }
};

/**
 * Generate overall interview summary and recommendations
 */
export const generateInterviewSummary = async (
    targetRole: string,
    allFeedback: any[]
) => {
    try {
        const prompt = `Summarize mock interview performance for "${targetRole}":

Feedback from all questions:
${JSON.stringify(allFeedback, null, 2)}

Provide:
1. Top 3 overall strengths
2. Top 3 areas to improve
3. Readiness level (not-ready/needs-practice/ready/well-prepared)
4. Specific recommendations for interview prep

Return ONLY valid JSON:
{
    "strengths": ["Strength 1", "Strength 2", "Strength 3"],
    "areasToImprove": ["Area 1", "Area 2", "Area 3"],
    "readinessLevel": "needs-practice",
    "recommendations": [
        "Practice STAR method answers",
        "Study more technical concepts",
        "Work on communication skills"
    ],
    "overallScore": 72,
    "encouragement": "Motivational message"
}`;

        return await retryWithBackoff(async () => {
            const model = ai.getGenerativeModel({ model: MODEL_NAME });
            const result = await model.generateContent(prompt);
            const response = result.response;

            const text = response.text().trim();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error("Failed to parse summary");
        });
    } catch (error) {
        console.error("Interview Summary Error:", error);
        return {
            strengths: ["Completed the interview"],
            areasToImprove: ["Practice more", "Improve structure"],
            readinessLevel: "needs-practice",
            recommendations: ["Keep practicing mock interviews"],
            overallScore: 50,
            encouragement: "Keep practicing and you'll improve!"
        };
    }
};
