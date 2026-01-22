import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../auth/utils/authStorage";
import careerService, { type CareerAnalysisResult } from "../../services/careerService";
import { DashboardLayout } from "../dashboard/components/DashboardLayout";

const POPULAR_ROLES = [
    { title: "Software Engineer", industry: "Technology" },
    { title: "Data Analyst", industry: "Technology" },
    { title: "Digital Marketer", industry: "Marketing" },
    { title: "Investment Banker", industry: "Finance" },
    { title: "Product Manager", industry: "Technology" },
    { title: "UI/UX Designer", industry: "Design" },
    { title: "Business Analyst", industry: "Business" },
    { title: "Data Scientist", industry: "Technology" },
    { title: "Content Writer", industry: "Marketing" },
    { title: "HR Manager", industry: "Human Resources" },
    { title: "Accountant", industry: "Finance" },
    { _title: "Sales Executive",get title() {
            return this._title;
        },
set title(value) {
            this._title = value;
        },
 industry: "Sales" }
];

export default function CareerAnalyzerPage() {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState("");
    const [customRole, setCustomRole] = useState("");
    const [industry, setIndustry] = useState("");
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<CareerAnalysisResult | null>(null);
    const [error, setError] = useState("");

    const handleAnalyze = async () => {
        const roleToAnalyze = customRole || selectedRole;
        
        if (!roleToAnalyze) {
            setError("Please select or enter a career role");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const user = getUser();
            if (!user) {
                setError("Please login to continue");
                setLoading(false);
                return;
            }
            
            const result = await careerService.analyzeCareerPath(
                user.id,
                roleToAnalyze,
                industry
            );

            setAnalysis(result);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to analyze career path");
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "essential": return "bg-red-100 text-red-700 border-red-300";
            case "important": return "bg-orange-100 text-orange-700 border-orange-300";
            case "nice-to-have": return "bg-blue-100 text-blue-700 border-blue-300";
            default: return "bg-gray-100 text-gray-700 border-gray-300";
        }
    };

    return (
        <DashboardLayout
            title="🎯 Skill Gap Analyzer"
            description="Discover what skills you need for your dream career in Bangladesh"
        >
            <div className="space-y-8">

                {/* Career Selection */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Select Your Dream Career
                    </h2>

                    {/* Popular Roles */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Popular Roles in Bangladesh
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {POPULAR_ROLES.map((role) => (
                                <button
                                    key={role.title}
                                    onClick={() => {
                                        setSelectedRole(role.title);
                                        setIndustry(role.industry);
                                        setCustomRole("");
                                    }}
                                    className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                                        selectedRole === role.title
                                            ? "border-indigo-600 bg-indigo-50"
                                            : "border-gray-200 hover:border-indigo-300"
                                    }`}
                                >
                                    <div className="font-semibold text-gray-900">{role.title}</div>
                                    <div className="text-xs text-gray-500 mt-1">{role.industry}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Role */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Or Enter Custom Role
                        </label>
                        <input
                            type="text"
                            value={customRole}
                            onChange={(e) => {
                                setCustomRole(e.target.value);
                                setSelectedRole("");
                            }}
                            placeholder="e.g., Machine Learning Engineer"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {/* Industry (optional) */}
                    {customRole && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Industry (Optional)
                            </label>
                            <input
                                type="text"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                placeholder="e.g., Technology, Finance, Healthcare"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Analyze Button */}
                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Analyzing Job Market...
                            </span>
                        ) : (
                            "🔍 Analyze Career Path"
                        )}
                    </button>
                </div>

                {/* Analysis Results */}
                {analysis && (
                    <div className="space-y-8">
                        {/* Market Insights */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                📊 Market Insights
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                                    <div className="text-sm font-medium text-green-700 mb-1">Market Demand</div>
                                    <div className="text-2xl font-bold text-green-900 capitalize">
                                        {analysis.marketInsights.demand}
                                    </div>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                    <div className="text-sm font-medium text-blue-700 mb-1">Growth Trend</div>
                                    <div className="text-2xl font-bold text-blue-900 capitalize">
                                        {analysis.marketInsights.growthTrend}
                                    </div>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                                    <div className="text-sm font-medium text-purple-700 mb-1">Jobs Analyzed</div>
                                    <div className="text-2xl font-bold text-purple-900">
                                        {analysis.careerPath.totalJobsAnalyzed}+
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-6 bg-amber-50 rounded-xl border border-amber-200">
                                <div className="text-sm font-medium text-amber-700 mb-2">💰 Average Salary</div>
                                <div className="text-xl font-bold text-amber-900">
                                    {analysis.careerPath.averageSalary}
                                </div>
                            </div>
                        </div>

                        {/* Required Skills */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                🎓 Required Skills
                            </h2>
                            <div className="space-y-4">
                                {analysis.careerPath.requiredSkills
                                    .sort((a: any, b: any) => b.percentage - a.percentage)
                                    .map((skill: any, index: number) => (
                                        <div key={index} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                                                    <span className="text-lg font-bold text-gray-900">{skill.skillName}</span>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getPriorityColor(skill.priority)}`}>
                                                    {skill.priority.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="mb-2">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-600">Required in jobs</span>
                                                    <span className="font-bold text-indigo-600">{skill.percentage}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3">
                                                    <div
                                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                                                        style={{ width: `${skill.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Top Companies */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                🏢 Top Hiring Companies
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {analysis.careerPath.topCompanies.map((company: string, index: number) => (
                                    <div key={index} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 text-center hover:border-indigo-400 hover:shadow-md transition-all">
                                        <div className="font-semibold text-gray-900">{company}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sample Job Titles */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                💼 Related Job Titles
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {analysis.marketInsights.sampleJobTitles.map((title: string, index: number) => (
                                    <span key={index} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                                        {title}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
                            <h2 className="text-2xl font-bold mb-4">
                                🚀 Ready for the Next Step?
                            </h2>
                            <p className="text-lg mb-6 text-indigo-100">
                                Take our skills assessment or start a mock interview to see where you stand!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => navigate(`/career/assessment?role=${encodeURIComponent(customRole || selectedRole)}&careerPathId=${analysis.careerPath._id}`)}
                                    className="px-8 py-4 bg-white text-indigo-600 font-bold text-lg rounded-xl hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all"
                                >
                                    📝 Take Skills Assessment (20 min)
                                </button>
                                <button
                                    onClick={() => navigate(`/dashboard/interview?role=${encodeURIComponent(customRole || selectedRole)}`)}
                                    className="px-8 py-4 bg-amber-500 text-white font-bold text-lg rounded-xl hover:bg-amber-600 shadow-lg hover:shadow-xl transition-all"
                                >
                                    🎯 Start Mock Interview
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
