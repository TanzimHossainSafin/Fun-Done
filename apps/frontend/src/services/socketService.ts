import { io, Socket } from "socket.io-client";
import { getUser } from "../features/auth/utils/authStorage";

let socket: Socket | null = null;
let connectionPromise: Promise<Socket> | null = null;

export interface ChatMessage {
    _id: string;
    groupId: string;
    userId: string;
    username: string;
    message: string;
    replyTo?: string;
    replyToMessage?: string;
    replyToUsername?: string;
    createdAt: string | Date;
}

export const connectSocket = (): Promise<Socket> => {
    // If already connected, return existing socket
    if (socket?.connected) {
        return Promise.resolve(socket);
    }

    // If connection is in progress, return the existing promise
    if (connectionPromise) {
        return connectionPromise;
    }

    connectionPromise = new Promise((resolve, reject) => {
        const user = getUser();
        if (!user) {
            connectionPromise = null;
            reject(new Error("User not logged in"));
            return;
        }

        // Disconnect existing socket if any (but not connected)
        if (socket) {
            socket.removeAllListeners();
            socket.disconnect();
            socket = null;
        }

        // Get token from cookie (httpOnly cookies are automatically sent with credentials)
        socket = io("http://localhost:3000", {
            auth: {
                token: "", // Cookie will be sent automatically with withCredentials
            },
            withCredentials: true,
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            timeout: 20000,
        });

        let resolved = false;
        let transportErrorLogged = false;

        socket.on("connect", () => {
            if (!resolved) {
                resolved = true;
                connectionPromise = null;
                console.log("Socket connected:", socket?.id, "via", socket?.io?.engine?.transport?.name || "unknown");
                resolve(socket!);
            }
        });

        // Handle transport errors (websocket failing, but polling may work)
        socket.io?.engine?.on("upgradeError", (error) => {
            if (!transportErrorLogged) {
                transportErrorLogged = true;
                console.warn("WebSocket upgrade failed, falling back to polling:", error.message);
            }
        });

        socket.io?.engine?.on("upgrade", () => {
            console.log("Socket upgraded to:", socket?.io?.engine?.transport?.name);
        });

        socket.on("connect_error", (error) => {
            // Only reject if we haven't resolved yet and it's a real connection error
            if (!resolved) {
                // Check if it's a transport error (websocket failing but polling may work)
                if (error.message.includes("websocket") || error.message.includes("TransportError")) {
                    // Don't reject immediately, let polling fallback work
                    console.warn("WebSocket transport error, trying polling fallback:", error.message);
                    return;
                }
                
                // For other errors, reject after a timeout
                setTimeout(() => {
                    if (!resolved && !socket?.connected) {
                        resolved = true;
                        connectionPromise = null;
                        console.error("Socket connection failed:", error);
                        reject(error);
                    }
                }, 5000);
            }
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
            if (reason === "io server disconnect") {
                // Server disconnected, clear connection promise
                connectionPromise = null;
            }
        });

        socket.on("error", (error) => {
            console.error("Socket error:", error);
        });

        // Timeout fallback
        setTimeout(() => {
            if (!resolved && socket?.connected) {
                resolved = true;
                connectionPromise = null;
                resolve(socket!);
            } else if (!resolved && !socket?.connected) {
                resolved = true;
                connectionPromise = null;
                reject(new Error("Socket connection timeout"));
            }
        }, 20000);
    });

    return connectionPromise;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }
    connectionPromise = null;
};

export const joinGroup = async (groupId: string) => {
    try {
        if (!socket?.connected) {
            await connectSocket();
        }
        socket?.emit("join_group", groupId);
    } catch (error) {
        console.error("Failed to join group:", error);
        throw error;
    }
};

export const leaveGroup = (groupId: string) => {
    socket?.emit("leave_group", groupId);
};

export const sendMessage = async (
    groupId: string,
    message: string,
    replyTo?: string
) => {
    try {
        if (!socket?.connected) {
            await connectSocket();
        }
        socket?.emit("send_message", { groupId, message, replyTo });
    } catch (error) {
        console.error("Failed to send message:", error);
        throw error;
    }
};

export const sendTypingIndicator = (groupId: string, isTyping: boolean) => {
    socket?.emit("typing", { groupId, isTyping });
};

export const onNewMessage = (callback: (message: ChatMessage) => void) => {
    socket?.on("new_message", callback);
};

export const offNewMessage = (callback: (message: ChatMessage) => void) => {
    socket?.off("new_message", callback);
};

export const onJoinedGroup = (callback: (data: { groupId: string }) => void) => {
    socket?.on("joined_group", callback);
};

export const onLeftGroup = (callback: (data: { groupId: string }) => void) => {
    socket?.on("left_group", callback);
};

export const onUserTyping = (
    callback: (data: { userId: string; username: string; isTyping: boolean }) => void
) => {
    socket?.on("user_typing", callback);
};

export const deleteMessage = async (groupId: string, messageId: string) => {
    try {
        if (!socket?.connected) {
            await connectSocket();
        }
        socket?.emit("delete_message", { groupId, messageId });
    } catch (error) {
        console.error("Failed to delete message:", error);
        throw error;
    }
};

export const onMessageDeleted = (callback: (data: { messageId: string }) => void) => {
    socket?.on("message_deleted", callback);
};

export const offMessageDeleted = (callback: (data: { messageId: string }) => void) => {
    socket?.off("message_deleted", callback);
};

export const onError = (callback: (error: { message: string }) => void) => {
    socket?.on("error", callback);
};

export const getSocket = (): Socket | null => {
    return socket;
};
