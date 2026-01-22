import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "bn";

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
    en: {
        // Navigation
        "nav.overview": "Overview",
        "nav.studyMatch": "Study Match",
        "nav.groups": "Groups",
        "nav.sessions": "Sessions",
        "nav.timetable": "Timetable",
        "nav.interview": "Interview",
        "nav.career": "Career",
        "nav.aiTools": "AI Tools",
        "nav.refreshment": "Refreshment",
        "nav.logout": "Logout",
        // Common
        "common.loading": "Loading...",
        "common.error": "Error",
        "common.success": "Success",
        "common.save": "Save",
        "common.cancel": "Cancel",
        "common.delete": "Delete",
        "common.edit": "Edit",
        "common.add": "Add",
    },
    bn: {
        // Navigation
        "nav.overview": "ওভারভিউ",
        "nav.studyMatch": "স্টাডি ম্যাচ",
        "nav.groups": "গ্রুপ",
        "nav.sessions": "সেশন",
        "nav.timetable": "সময়সূচী",
        "nav.interview": "ইন্টারভিউ",
        "nav.career": "ক্যারিয়ার",
        "nav.aiTools": "AI টুলস",
        "nav.refreshment": "রিফ্রেশমেন্ট",
        "nav.logout": "লগআউট",
        // Common
        "common.loading": "লোড হচ্ছে...",
        "common.error": "ত্রুটি",
        "common.success": "সফল",
        "common.save": "সংরক্ষণ",
        "common.cancel": "বাতিল",
        "common.delete": "মুছুন",
        "common.edit": "সম্পাদনা",
        "common.add": "যোগ করুন",
    },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem("language");
        return (saved === "en" || saved === "bn" ? saved : "en") as Language;
    });

    useEffect(() => {
        localStorage.setItem("language", language);
        document.documentElement.setAttribute("lang", language);
    }, [language]);

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === "en" ? "bn" : "en"));
    };

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
