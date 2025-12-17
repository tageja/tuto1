import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

type Language = "en" | "vi";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (en: string, vi: string) => string;
}

const LanguageContext = createContext<
  LanguageContextType | undefined
>(undefined);

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguage] = useState<Language>("en");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "vi" : "en"));
  };

  const t = (en: string, vi: string) => {
    return language === "en" ? en : vi;
  };

  return (
    <LanguageContext.Provider
      value={{ language, toggleLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error(
      "useLanguage must be used within LanguageProvider",
    );
  }
  return context;
}