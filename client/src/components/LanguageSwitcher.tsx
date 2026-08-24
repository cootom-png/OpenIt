import { Globe2 } from "lucide-react";
import { supportedLanguages, useI18n, type Language } from "@/i18n";

export function LanguageSwitcher() {
  const { language, setLanguage, languageNames, t } = useI18n();

  return (
    <label className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 shadow-sm">
      <Globe2 className="h-3.5 w-3.5 text-slate-500" />
      <span className="sr-only">{t("common.language")}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className="bg-transparent text-xs font-medium outline-none"
        aria-label={t("common.language")}
      >
        {supportedLanguages.map((item) => (
          <option key={item} value={item}>
            {languageNames[item]}
          </option>
        ))}
      </select>
    </label>
  );
}

