import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import udyomixLogo from "../../assets/udyomix-logo.svg";

export default function PageNavbar() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        const { clearToken } = await import("../../features/auth/utils/authStorage");
        await clearToken();
        navigate("/login");
    };

    return (
        <nav className="bg-white shadow-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <img 
                            src={udyomixLogo} 
                            alt="Udyomix Logo" 
                            className="h-10 w-auto"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            to="/dashboard"
                            className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                        >
                            🏠 Dashboard
                        </Link>
                        <Link
                            to="/dashboard/study-matcher"
                            className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                        >
                            🤝 Study Match
                        </Link>
                        <Link
                            to="/dashboard/career"
                            className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                        >
                            💼 Career
                        </Link>
                        <Link
                            to="/dashboard/interview"
                            className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                        >
                            🎯 Interview
                        </Link>
                        <Link
                            to="/dashboard/ai-tools"
                            className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                        >
                            🤖 AI Tools
                        </Link>
                        <Link
                            to="/dashboard/timetable"
                            className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                        >
                            📅 Timetable
                        </Link>

                        {/* User Menu */}
                        <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-300">
                            <Link
                                to="/dashboard/interview/history"
                                className="text-gray-600 hover:text-indigo-600 transition-colors"
                                title="Interview History"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <div className="flex flex-col gap-3">
                            <Link
                                to="/dashboard"
                                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                🏠 Dashboard
                            </Link>
                            <Link
                                to="/dashboard/study-matcher"
                                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                🤝 Study Match
                            </Link>
                            <Link
                                to="/dashboard/career"
                                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                💼 Career
                            </Link>
                            <Link
                                to="/dashboard/interview"
                                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                🎯 Interview
                            </Link>
                            <Link
                                to="/dashboard/ai-tools"
                                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                🤖 AI Tools
                            </Link>
                            <Link
                                to="/dashboard/timetable"
                                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                📅 Timetable
                            </Link>
                            <Link
                                to="/dashboard/interview/history"
                                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                📜 Interview History
                            </Link>
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    handleLogout();
                                }}
                                className="mx-4 px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-medium text-left"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
