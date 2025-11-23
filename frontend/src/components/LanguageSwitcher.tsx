import { useI18n } from "../i18n/useI18n";

interface LanguageSwitcherProps {
  className?: string;
  absolute?: boolean;
}

export default function LanguageSwitcher({ className, absolute = true }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useI18n();

  const toggleLanguage = () => {
    setLanguage(language === "de" ? "en" : "de");
  };

  const positionClasses = absolute ? "absolute bottom-4 right-4 z-50" : "";

  return (
    <button
      onClick={toggleLanguage}
      className={`${positionClasses} cursor-pointer flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md hover:bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${
        className || ""
      }`}
      title={`${t.common.switchToLanguage} ${language === "de" ? "English" : "Deutsch"}`}
    >
      <span className="text-lg">🗣️</span>
      <span className="font-semibold text-gray-700">
        {language.toUpperCase()}
      </span>
    </button>
  );
}
