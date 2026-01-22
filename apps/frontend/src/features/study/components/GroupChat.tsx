import { useState, useEffect, useRef } from "react";
import { getUser, getTabUserId } from "../../auth/utils/authStorage";
import {
    connectSocket,
    joinGroup,
    leaveGroup,
    sendMessage,
    sendTypingIndicator,
    deleteMessage,
    onNewMessage,
    offNewMessage,
    onMessageDeleted,
    offMessageDeleted,
    onUserTyping,
    onError,
    type ChatMessage,
} from "../../../services/socketService";
import apiClient from "../../../utils/axios";
import { MessageCircle, Send, Reply, X, Trash2, Users, AlertCircle } from "lucide-react";

interface GroupChatProps {
    groupId: string;
    groupName: string;
}

export const GroupChat = ({ groupId, groupName }: GroupChatProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [currentUser, setCurrentUser] = useState(getUser());

    // Refresh user on mount and when storage changes
    useEffect(() => {
        const refreshUser = () => {
            const freshUser = getUser();
            setCurrentUser(freshUser);
            
            // Ensure sessionStorage has user ID (tab-specific)
            // If not present but localStorage has it, copy from localStorage (backward compatibility)
            const tabUserId = getTabUserId();
            if (!tabUserId && freshUser?.id) {
                sessionStorage.setItem('udyomix_user_id', freshUser.id);
            }
        };
        
        refreshUser();
        
        // Listen for storage changes (when user logs in/out in another tab)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'udyomix_user') {
                refreshUser();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        // Also check periodically in case storage event doesn't fire
        const interval = setInterval(refreshUser, 1000);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        // Connect socket and join group
        const initializeChat = async () => {
            try {
                setError(null);
                await connectSocket();
                if (isMounted) {
                    setIsConnected(true);
                    await joinGroup(groupId);
                    // Load previous messages after joining
                    await loadMessages();
                }
            } catch (error: any) {
                console.error("Failed to initialize chat:", error);
                if (isMounted) {
                    setIsConnected(false);
                    setError(error.message || "Failed to connect to chat. Please try again.");
                }
            }
        };

        initializeChat();

        // Set up event listeners
        const handleNewMessage = (message: ChatMessage) => {
            setMessages((prev) => {
                // Avoid duplicates
                if (prev.some(msg => msg._id === message._id)) {
                    return prev;
                }
                return [...prev, message];
            });
            scrollToBottom();
        };

        const handleUserTyping = (data: {
            userId: string;
            username: string;
            isTyping: boolean;
        }) => {
            // Use tab-specific user ID from sessionStorage
            const tabUserId = getTabUserId();
            // Keep case-sensitive comparison for ObjectIds
            const normalizedDataUserId = String(data.userId || '').trim();
            const normalizedCurrentUserId = String(tabUserId || '').trim();
            
            if (normalizedDataUserId === normalizedCurrentUserId && normalizedDataUserId !== '') return;

            setTypingUsers((prev) => {
                const newSet = new Set(prev);
                if (data.isTyping) {
                    newSet.add(data.username);
                } else {
                    newSet.delete(data.username);
                }
                return newSet;
            });
        };

        const handleMessageDeleted = (data: { messageId: string }) => {
            setMessages((prev) => prev.filter((msg) => msg._id !== data.messageId));
        };

        const handleError = (error: { message: string }) => {
            console.error("Socket error:", error.message);
            setError(error.message);
            
            // Auto-clear error after 5 seconds
            setTimeout(() => {
                setError(null);
            }, 5000);
        };

        onNewMessage(handleNewMessage);
        onMessageDeleted(handleMessageDeleted);
        onUserTyping(handleUserTyping);
        onError(handleError);

        // Cleanup
        return () => {
            isMounted = false;
            offNewMessage(handleNewMessage);
            offMessageDeleted(handleMessageDeleted);
            leaveGroup(groupId);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [groupId, currentUser?.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiClient.get(`/app/v1/study/groups/${groupId}/chat`);
            const loadedMessages = response.data.messages || [];
            setMessages(loadedMessages);
        } catch (error: any) {
            console.error("Failed to load messages:", error);
            setError("Failed to load messages. Please refresh.");
        } finally {
            setIsLoading(false);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const handleSend = async () => {
        if (!inputMessage.trim()) return;

        const messageToSend = inputMessage.trim();
        setInputMessage("");
        const replyToId = replyingTo?._id;
        setReplyingTo(null);
        sendTypingIndicator(groupId, false);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        try {
            await sendMessage(groupId, messageToSend, replyToId);
        } catch (error: any) {
            console.error("Failed to send message:", error);
            setError(error.message || "Failed to send message. Please try again.");
            // Restore input on error
            setInputMessage(messageToSend);
            setReplyingTo(replyingTo ? messages.find(m => m._id === replyToId) || null : null);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputMessage(e.target.value);

        // Send typing indicator
        sendTypingIndicator(groupId, true);

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing indicator after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            sendTypingIndicator(groupId, false);
        }, 3000);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        // Use tab-specific user ID from sessionStorage (not localStorage)
        const tabUserId = getTabUserId();
        
        // Find the message to verify ownership
        const messageToDelete = messages.find(msg => msg._id === messageId);
        
        // Normalize IDs for comparison (keep case-sensitive for ObjectIds)
        const normalizeId = (id: string | undefined | null | any): string => {
            if (!id) return '';
            return String(id).trim();
        };
        
        const messageUserId = normalizeId(messageToDelete?.userId);
        const currentUserId = normalizeId(tabUserId);
        
        // Double-check: Only allow deleting own messages
        if (!messageToDelete || messageUserId !== currentUserId || messageUserId === '') {
            setError("You can only delete your own messages.");
            setTimeout(() => setError(null), 3000);
            return;
        }

        if (!confirm("Are you sure you want to delete this message?")) {
            return;
        }

        try {
            await deleteMessage(groupId, messageId);
        } catch (error: any) {
            console.error("Failed to delete message:", error);
            setError(error.message || "Failed to delete message. Please try again.");
            setTimeout(() => setError(null), 3000);
        }
    };

    const formatTime = (date: string | Date) => {
        const d = new Date(date);
        const hours = d.getHours();
        const minutes = d.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `${displayHours}:${displayMinutes} ${ampm}`;
    };

    const formatDate = (date: string | Date) => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === today.toDateString()) {
            return "Today";
        } else if (d.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-slate-50 to-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-sm text-slate-600">Loading messages...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-lg">
            {/* Professional Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-base truncate">{groupName}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            {isConnected ? (
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <p className="text-xs text-blue-100">
                                        {typingUsers.size > 0 
                                            ? `${Array.from(typingUsers).join(", ")} typing...`
                                            : `${messages.length} ${messages.length === 1 ? 'message' : 'messages'}`
                                        }
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xs text-red-200">Disconnected</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="px-4 py-2 bg-red-50 border-b border-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700 flex-1">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="text-red-600 hover:text-red-800"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Messages Container */}
            <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 bg-gradient-to-b from-slate-50 to-white"
                style={{ scrollBehavior: 'smooth' }}
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                            <MessageCircle className="w-8 h-8 text-blue-600" />
                        </div>
                        <h4 className="text-base font-semibold text-slate-700 mb-1">
                            No messages yet
                        </h4>
                        <p className="text-sm text-slate-500 max-w-xs">
                            Start the conversation! Send a message to get started.
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => {
                            // Get tab-specific user ID from sessionStorage (not localStorage)
                            // This ensures each tab has its own user ID, even if localStorage is shared
                            const tabUserId = getTabUserId();
                            const freshUser = getUser(); // Keep for username display
                            
                            // Normalize both IDs: ensure they're strings, trim whitespace
                            // Note: We DON'T lowercase because MongoDB ObjectIds are case-sensitive
                            const normalizeId = (id: string | undefined | null | any): string => {
                                if (!id) return '';
                                // Convert to string and trim, but keep original case
                                const str = String(id).trim();
                                return str;
                            };
                            
                            const messageUserId = normalizeId(message.userId);
                            // Use tab-specific user ID from sessionStorage (tab-specific, not shared)
                            const currentUserId = normalizeId(tabUserId);
                            
                            // Strict comparison: both must be non-empty and match exactly (case-sensitive for ObjectIds)
                            const isOwnMessage = messageUserId !== '' && 
                                               currentUserId !== '' && 
                                               messageUserId === currentUserId;
                            
                            const prevMessage = index > 0 ? messages[index - 1] : null;
                            const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
                            
                            // Show date separator if new day
                            const showDateSeparator = !prevMessage || 
                                formatDate(prevMessage.createdAt) !== formatDate(message.createdAt);
                            
                            // Show avatar and username for first message in a group from same user
                            const showAvatar = !isOwnMessage && (
                                index === 0 || 
                                !prevMessage ||
                                String(prevMessage.userId) !== String(message.userId) ||
                                new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() > 300000
                            );
                            
                            // Group spacing
                            const isNewGroup = !prevMessage || 
                                String(prevMessage.userId) !== String(message.userId) ||
                                new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() > 300000;

                            return (
                                <div key={message._id}>
                                    {/* Date Separator */}
                                    {showDateSeparator && (
                                        <div className="flex items-center justify-center my-4">
                                            <div className="px-3 py-1 bg-slate-200 rounded-full">
                                                <span className="text-xs font-medium text-slate-600">
                                                    {formatDate(message.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div
                                        className={`group flex items-end gap-2 ${isOwnMessage ? "justify-end" : "justify-start"} ${isNewGroup ? "mt-3" : "mt-1"}`}
                                    >
                                        {/* Avatar - Only for other users */}
                                        {showAvatar && !isOwnMessage && (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                <span className="text-white text-xs font-semibold">
                                                    {message.username.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        {!showAvatar && !isOwnMessage && (
                                            <div className="w-8" />
                                        )}

                                        {/* Message Content */}
                                        <div className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"} max-w-[75%] sm:max-w-[65%]`}>
                                            {/* Username and Time - Show for every message */}
                                            <div className={`flex items-center gap-2 mb-1 px-1 ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                                                <span className={`text-xs font-semibold ${isOwnMessage ? "text-blue-700" : "text-slate-700"}`}>
                                                    {isOwnMessage ? "You" : message.username}
                                                </span>
                                                <span className={`text-[10px] ${isOwnMessage ? "text-blue-500" : "text-slate-500"}`}>
                                                    {formatTime(message.createdAt)}
                                                </span>
                                            </div>
                                            
                                            {/* Message Bubble */}
                                            <div
                                                className={`relative rounded-2xl px-4 py-2.5 shadow-sm transition-all hover:shadow-md ${
                                                    isOwnMessage
                                                        ? "rounded-br-sm bg-blue-600"
                                                        : "rounded-bl-sm bg-white border border-slate-200"
                                                }`}
                                            >
                                                {/* Reply Quote */}
                                                {message.replyTo && (
                                                    <div
                                                        className={`mb-2 pb-2 border-l-3 ${
                                                            isOwnMessage
                                                                ? "border-blue-300 bg-blue-500/20"
                                                                : "border-slate-400 bg-slate-100"
                                                        }`}
                                                        style={{ borderLeftWidth: '3px', paddingLeft: '10px' }}
                                                    >
                                                        <p className={`text-xs font-semibold ${isOwnMessage ? "text-blue-50" : "text-slate-700"}`}>
                                                            {message.replyToUsername}
                                                        </p>
                                                        <p className={`text-xs mt-0.5 line-clamp-2 ${isOwnMessage ? "text-blue-100" : "text-slate-600"}`}>
                                                            {message.replyToMessage}
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                {/* Message Text */}
                                                <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${isOwnMessage ? "text-white" : "text-slate-900"}`}>
                                                    {message.message}
                                                </p>
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            <div className={`flex items-center gap-1 mt-1 px-1 ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                                                {isOwnMessage ? (
                                                    <button
                                                        onClick={() => handleDeleteMessage(message._id)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50"
                                                        title="Delete message"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setReplyingTo(message)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-50"
                                                        title="Reply to this message"
                                                    >
                                                        <Reply className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
                
                {/* Typing Indicator */}
                {typingUsers.size > 0 && (
                    <div className="flex items-center gap-2 px-2 mt-2">
                        <div className="flex gap-1 bg-white rounded-full px-3 py-2 shadow-sm border border-slate-200">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span className="text-xs text-slate-600 italic">
                            {Array.from(typingUsers).join(", ")} typing...
                        </span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Reply Preview */}
            {replyingTo && (
                <div className="px-4 py-3 bg-blue-50 border-t border-blue-200 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Reply className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <p className="text-xs font-semibold text-blue-900">
                                Replying to {replyingTo.username}
                            </p>
                        </div>
                        <p className="text-xs text-blue-700 line-clamp-1 truncate ml-6">
                            {replyingTo.message}
                        </p>
                    </div>
                    <button
                        onClick={() => setReplyingTo(null)}
                        className="ml-3 p-1.5 rounded-full hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors flex-shrink-0"
                        title="Cancel reply"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Input Area */}
            <div className="px-4 py-3 bg-white border-t border-slate-200 shadow-lg">
                <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputMessage}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            disabled={!isConnected}
                            className="w-full rounded-full border border-slate-300 px-4 py-2.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!inputMessage.trim() || !isConnected}
                        className="rounded-full bg-blue-600 p-2.5 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-md hover:shadow-lg disabled:shadow-none"
                        title="Send message"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
