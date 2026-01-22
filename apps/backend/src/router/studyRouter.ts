import router from "express";
import {
    upsertStudyProfile,
    getStudyProfile,
    matchStudyPartners,
} from "../controller/studyProfile";
import {
    createStudyGroup,
    joinStudyGroup,
    joinStudyGroupByName,
    getStudyGroup,
    listStudyGroups,
    searchStudyGroups,
    createStudySession,
    listStudySessions,
} from "../controller/studyGroup";
import {
    addScheduleEvent,
    deleteScheduleEvent,
    getSchedule,
    optimizeSchedule,
    upsertSchedule,
    analyzeSchedule,
    suggestHabits,
} from "../controller/schedule";
import {
    getHabits,
    createHabit,
    updateHabit,
    incrementHabit,
    deleteHabit,
} from "../controller/habit";
import {
    logProductivitySession,
    getProductivityReport,
    analyzeProductivity,
    predictStress,
} from "../controller/productivity";
import {
    chatWithAIModerator,
    generateSessionAgenda,
    clearConversationHistory,
    getConversationHistory,
} from "../controller/aiModerator";
import {
    getGroupChatMessages,
    getChatMessage,
} from "../controller/groupChat";

export const studyRouter = router();

// study profile
studyRouter.post("/profile", upsertStudyProfile);
studyRouter.get("/profile/:userId", getStudyProfile);
studyRouter.get("/match/:userId", matchStudyPartners);

// study groups
studyRouter.post("/groups", createStudyGroup);
studyRouter.get("/groups", listStudyGroups);
studyRouter.get("/groups/search", searchStudyGroups);
studyRouter.get("/groups/:groupId", getStudyGroup);
studyRouter.post("/groups/:groupId/join", joinStudyGroup);
studyRouter.post("/groups/join-by-name", joinStudyGroupByName);

// study sessions
studyRouter.post("/groups/:groupId/sessions", createStudySession);
studyRouter.get("/groups/:groupId/sessions", listStudySessions);

// group chat
studyRouter.get("/groups/:groupId/chat", getGroupChatMessages);
studyRouter.get("/groups/:groupId/chat/:messageId", getChatMessage);

// AI Moderator endpoints
studyRouter.post("/groups/:groupId/ai-chat", chatWithAIModerator);
studyRouter.post("/ai/generate-agenda", generateSessionAgenda);
studyRouter.get("/groups/:groupId/ai-chat/history", getConversationHistory);
studyRouter.delete("/groups/:groupId/ai-chat/history", clearConversationHistory);

// smart timetable
studyRouter.post("/schedule", upsertSchedule);
studyRouter.get("/schedule/:userId", getSchedule);
studyRouter.post("/schedule/event", addScheduleEvent);
studyRouter.delete("/schedule/event", deleteScheduleEvent);
studyRouter.post("/schedule/optimize", optimizeSchedule);
studyRouter.post("/schedule/analyze", analyzeSchedule);
studyRouter.post("/schedule/habits", suggestHabits);

// habit tracker
studyRouter.get("/habits/:userId", getHabits);
studyRouter.post("/habits", createHabit);
studyRouter.put("/habits/:id", updateHabit);
studyRouter.post("/habits/:id/increment", incrementHabit);
studyRouter.delete("/habits/:id", deleteHabit);

// productivity tracking
studyRouter.post("/productivity/session", logProductivitySession);
studyRouter.get("/productivity/report", getProductivityReport);
studyRouter.post("/productivity/analyze", analyzeProductivity);
studyRouter.post("/productivity/stress", predictStress);
