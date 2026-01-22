export const AIFeaturesBanner = () => {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 shadow-lg border border-gray-200">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
                <div className="absolute -left-4 -top-4 h-16 w-16 animate-pulse rounded-full bg-gray-300 blur-2xl"></div>
                <div className="absolute -right-4 -bottom-4 h-20 w-20 animate-pulse rounded-full bg-slate-300 blur-3xl" style={{ animationDelay: '1s' }}></div>
                <div className="absolute left-1/2 top-1/2 h-12 w-12 animate-pulse rounded-full bg-zinc-300 blur-2xl" style={{ animationDelay: '0.5s' }}></div>
            </div>
            
            <div className="relative p-5">
                <div className="flex items-center gap-6">
                    {/* Icon */}
                    <div className="relative flex-shrink-0">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-md">
                            <span className="text-3xl">🤖</span>
                        </div>
                    </div>
                    
                    {/* Title and description */}
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-800 mb-1">
                            AI-Powered Study Features
                        </h2>
                        <p className="text-sm text-gray-600">
                            Enhance your learning experience with intelligent recommendations and assistance
                        </p>
                    </div>
                    
                    {/* Feature cards - horizontal */}
                    <div className="flex gap-3">
                        {/* Smart Matching Card */}
                        <div className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-md border border-gray-100 transition-all hover:shadow-lg hover:scale-105">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm flex-shrink-0">
                                    <span className="text-lg">🎯</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 mb-0.5">Smart Matching</h3>
                                    <p className="text-xs text-gray-600">
                                        AI analyzes profiles to find perfect study partners
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* AI Moderator Card */}
                        <div className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-md border border-gray-100 transition-all hover:shadow-lg hover:scale-105">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm flex-shrink-0">
                                    <span className="text-lg">💬</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 mb-0.5">AI Moderator</h3>
                                    <p className="text-xs text-gray-600">
                                        Get help and guidance from AI in study groups
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Agenda Generator Card */}
                        <div className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-md border border-gray-100 transition-all hover:shadow-lg hover:scale-105">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm flex-shrink-0">
                                    <span className="text-lg">📋</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 mb-0.5">Agenda Generator</h3>
                                    <p className="text-xs text-gray-600">
                                        Create structured study session plans instantly
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bottom badge */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm border border-gray-200 flex-shrink-0">
                        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500"></div>
                        <span>Powered by Gemini AI</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
