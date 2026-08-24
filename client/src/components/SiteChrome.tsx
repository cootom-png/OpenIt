import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft, Box, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type SiteHeaderProps = {
  title: string;
  icon?: ReactNode;
  backHref?: string;
  backLabel?: string;
  right?: ReactNode;
};

export function BrandMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-600/20">
      <Box className="h-4 w-4" />
    </span>
  );
}

export function SiteHeader({ title, icon, backHref = "/", backLabel, right }: SiteHeaderProps) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href={backHref}>
            <Button variant="ghost" size="sm" className="gap-1 text-slate-600 hover:text-slate-950">
              <ArrowLeft className="h-4 w-4" />
              {backLabel || t("common.home")}
            </Button>
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex min-w-0 items-center gap-2">
            {icon || <BrandMark />}
            <h1 className="truncate text-base font-semibold text-slate-950">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {right}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white py-6">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 px-4">
        <a
          href="https://openit.cc"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-slate-950"
        >
          {t("footer.company")}
          <ExternalLink className="h-3 w-3" />
        </a>
        <span className="text-xs text-slate-300">v1.4.0</span>
      </div>
    </footer>
  );
}

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-950">
            <ArrowLeft className="h-4 w-4" />
            {t("common.backHome")}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <div className="flex items-center gap-2">
              <BrandMark />
              <span className="text-base font-semibold">{t("brand.name")}</span>
            </div>
          </div>
        </div>
        <main className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
