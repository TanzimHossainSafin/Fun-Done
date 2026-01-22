import { useState, useEffect } from "react";

export const AIStatusBadge = () => {
    const [isAIActive, setIsAIActive] = useState(true);

    useEffect(() => {
        // Check if AI service is available (you can add actual health check)
        const checkAIStatus = () => {
            // In production, this would ping the AI service
            setIsAIActive(true);
        };

        checkAIStatus();
    }, []);

    return (
        <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-1.5 text-xs font-medium">
            <div className={`h-2 w-2 rounded-full ${isAIActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className={isAIActive ? 'text-green-700' : 'text-gray-600'}>
                {isAIActive ? '🤖 AI Active' : '🤖 AI Offline'}
            </span>
        </div>
    );
};
