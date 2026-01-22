import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { chatWithAIModerator, getConversationHistory, clearConversationHistory, type ChatMessage } from "../services/aiService";
import { getUser } from "../../auth/utils/authStorage";

interface AIChatBoxProps {
    groupId: string;
    groupName: string;
    onMessagesChange?: (messages: ChatMessage[]) => void;
}

export const AIChatBox = ({ groupId, groupName, onMessagesChange }: AIChatBoxProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [aiProvider, setAIProvider] = useState<"gemini" | "grok">("gemini");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load AI provider preference from localStorage
    useEffect(() => {
        const savedProvider = localStorage.getItem("aiProvider") as "gemini" | "grok";
        if (savedProvider) {
            setAIProvider(savedProvider);
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        onMessagesChange?.(messages);
    }, [messages]);

    useEffect(() => {
        loadHistory();
    }, [groupId]);

    const loadHistory = async () => {
        try {
            const result = await getConversationHistory(groupId);
            onMessagesChange?.(result.history);
            setMessages(result.history);
        } catch (err) {
            console.error("Failed to load history", err);
        }
    };

    const handleSend = async () => {
        if (!inputMessage.trim()) return;

        const user = getUser();
        if (!user) {
            setError("Not logged in");
            return;
        }

        setIsLoading(true);
        setError("");

        // Add user message immediately
        const userMessage: ChatMessage = {
            role: "user",
            content: inputMessage,
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInputMessage("");

        try {
            const result = await chatWithAIModerator(groupId, inputMessage, user.id, aiProvider);
            
            // Add AI response
            const aiMessage: ChatMessage = {
                role: "assistant",
                content: result.response,
                timestamp: result.timestamp,
            };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (err) {
            setError("AI response failed");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearHistory = async (timeRange: 'today' | 'week' | 'all') => {
        const confirmMsg = 
            timeRange === 'today' ? "Clear today's chat history?" :
            timeRange === 'week' ? "Clear chat history from the last week?" :
            "Clear all chat history?";
            
        if (!confirm(confirmMsg)) {
            return;
        }
        
        try {
            const now = new Date();
            let filteredMessages = messages;
            
            if (timeRange === 'today') {
                const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                filteredMessages = messages.filter(msg => new Date(msg.timestamp) < startOfDay);
            } else if (timeRange === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filteredMessages = messages.filter(msg => new Date(msg.timestamp) < weekAgo);
            } else {
                filteredMessages = [];
                await clearConversationHistory(groupId);
            }
            
            setMessages(filteredMessages);
            onMessagesChange?.(filteredMessages);
        } catch (err) {
            setError("Failed to clear history");
        }
    };

    return (
        <div className="card-3d rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                            🤖 AI Moderator
                        </h3>
                        <p className="text-xs text-slate-500">{groupName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* AI Provider Selector */}
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg">
                            <button
                                onClick={() => {
                                    setAIProvider("gemini");
                                    localStorage.setItem("aiProvider", "gemini");
                                }}
                                className={`px-2 py-1 text-xs rounded transition ${
                                    aiProvider === "gemini"
                                        ? "bg-blue-600 text-white font-medium"
                                        : "text-slate-600 hover:text-slate-800"
                                }`}
                                type="button"
                                title="Use Google Gemini"
                            >
                                🤖 Gemini
                            </button>
                            <button
                                onClick={() => {
                                    setAIProvider("grok");
                                    localStorage.setItem("aiProvider", "grok");
                                }}
                                className={`px-2 py-1 text-xs rounded transition ${
                                    aiProvider === "grok"
                                        ? "bg-purple-600 text-white font-medium"
                                        : "text-slate-600 hover:text-slate-800"
                                }`}
                                type="button"
                                title="Use Grok AI"
                            >
                                ⚡ Grok
                            </button>
                        </div>
                        
                        <div className="h-4 w-px bg-slate-300"></div>
                        
                        {/* Clear History Buttons */}
                        <div className="flex gap-2">
                        <button
                            onClick={() => handleClearHistory('today')}
                            className="px-2 py-1 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition"
                            type="button"
                            title="Clear today's messages"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => handleClearHistory('week')}
                            className="px-2 py-1 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition"
                            type="button"
                            title="Clear last week's messages"
                        >
                            1 Week
                        </button>
                        <button
                            onClick={() => handleClearHistory('all')}
                            className="px-3 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded transition font-medium"
                            type="button"
                            title="Clear all chat history"
                        >
                            Clear History
                        </button>
                    </div>
                    </div>
                </div>
            </div>

            <div className="h-96 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <p className="text-center text-sm text-slate-400">
                        Start chatting with AI Moderator!
                    </p>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${
                                msg.role === "user" ? "justify-end" : "justify-start"
                            }`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                    msg.role === "user"
                                        ? "bg-blue-600 text-white"
                                        : "bg-slate-100 text-slate-900"
                                }`}
                            >
                                {msg.role === "user" ? (
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                ) : (
                                    <div className="text-sm prose prose-sm max-w-none prose-p:my-2 prose-ul:my-1 prose-li:my-0 prose-strong:text-slate-900 prose-strong:font-bold">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm, remarkMath]}
                                            rehypePlugins={[rehypeKatex]}
                                            components={{
                                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
                                                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                                                li: ({ children }) => <li className="ml-2">{children}</li>,
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                )}
                                <p className="mt-1 text-xs opacity-70">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-200 p-4">
                {error && (
                    <p className="mb-2 text-xs text-red-600">{error}</p>
                )}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Ask AI moderator anything..."
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !inputMessage.trim()}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                        type="button"
                    >
                        {isLoading ? "..." : "Send"}
                    </button>
                </div>
            </div>
        </div>
    );
};
