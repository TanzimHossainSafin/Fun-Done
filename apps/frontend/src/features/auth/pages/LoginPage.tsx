import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { LoginForm } from "../components/LoginForm";
import udyomixLogo from "../../../assets/udyomix-logo.svg";

export const LoginPage = () => {
    const navigate = useNavigate();

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
            <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12">
                <header className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-8 shadow-lg">
                    <div className="max-w-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <img 
                                src={udyomixLogo} 
                                alt="Udyomix Logo" 
                                className="h-10 w-auto"
                            />
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                    Build Smarter. Succeed Together.
                                </p>
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">
                            Sign in to access your dashboard
                        </h1>
                        <p className="text-lg text-slate-600">
                            Manage study matches, groups, and sessions from one place.
                        </p>
                    </div>
                </header>

                <div className="grid gap-8 lg:grid-cols-[1.2fr_0.9fr]">
                    <section className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-8 shadow-lg">
                        <div className="flex flex-col items-center justify-center space-y-6">
                            <div className="flex items-center justify-center w-40 h-40 rounded-3xl bg-white shadow-xl p-8 border border-slate-200">
                                <img 
                                    src={udyomixLogo} 
                                    alt="Udyomix Logo" 
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    Why Udyomix?
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Your all-in-one study management platform
                                </p>
                            </div>
                        </div>
                        <ul className="mt-8 space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Smart study matching</p>
                                    <p className="text-xs text-slate-500 mt-0.5">AI-powered partner discovery</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Group and session tracking</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Monitor your progress effortlessly</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Focused and clean dashboard</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Streamlined user experience</p>
                                </div>
                            </li>
                        </ul>
                    </section>
                    <div className="space-y-6">
                        <LoginForm onSuccess={() => navigate("/dashboard")} />
                        <div className="rounded-lg border border-slate-200 bg-white/50 p-4 text-center">
                            <p className="text-sm text-slate-600">
                                New user?{" "}
                                <Link
                                    to="/signup"
                                    className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};
