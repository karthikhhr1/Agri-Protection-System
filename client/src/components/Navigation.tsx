import { Link, useLocation } from "wouter";
import { LayoutDashboard, Droplets, Volume2, ScanEye, Sprout, Bot, Globe, Calendar, Package, DollarSign, FileText, ChevronDown, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage, languageNames, type Language } from "@/lib/i18n";
import { useState } from "react";

const navItems = [
  { href: "/", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/field-summary", labelKey: "nav.fieldSummary", icon: MapPin },
  { href: "/field-timeline", labelKey: "nav.fieldTimeline", icon: Clock },
  { href: "/analysis", labelKey: "nav.analysis", icon: ScanEye },
  { href: "/irrigation", labelKey: "nav.irrigation", icon: Droplets },
  { href: "/deterrent", labelKey: "nav.deterrent", icon: Volume2 },
  { href: "/assistant", labelKey: "nav.assistant", icon: Bot },
  { href: "/schedule", labelKey: "nav.schedule", icon: Calendar },
  { href: "/inventory", labelKey: "nav.inventory", icon: Package },
  // { href: "/finances", labelKey: "nav.finances", icon: DollarSign },
  { href: "/logs", labelKey: "nav.logs", icon: FileText },
];

export function Navigation() {
  const [location] = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const languages: Language[] = ['en', 'hi', 'te', 'kn', 'ta', 'mr', 'bn', 'gu', 'pa', 'ml', 'or'];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0 p-4 shadow-xl shadow-black/5 z-20">
      <div className="flex items-center gap-3 px-4 py-6 mb-2">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <Sprout className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-xl leading-none tracking-tight text-primary">AgriGuard</h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">{t('nav.subtitle')}</p>
        </div>
      </div>

      <div className="px-2 mb-6">
        <div className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="w-full flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10 transition-all duration-300 hover:bg-primary/10 hover:border-primary/20 cursor-pointer"
            data-testid="button-language-selector"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-0.5">{t('nav.changeLanguage')}</p>
              <p className="text-sm font-bold text-foreground">{languageNames[language]}</p>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isLangOpen && "rotate-180")} />
          </button>
          
          {isLangOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setIsLangOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted flex items-center justify-between",
                    language === lang && "bg-primary/10 text-primary"
                  )}
                  data-testid={`button-language-${lang}`}
                >
                  <span>{languageNames[lang]}</span>
                  {language === lang && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group",
                  isActive 
                    ? "bg-primary/10 text-primary font-semibold shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                data-testid={`nav-${item.href.replace('/', '') || 'dashboard'}`}
              >
                <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                <span className="text-sm">{t(item.labelKey)}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 bg-muted/30 rounded-2xl border border-border/50 mt-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {t('system.online')}
        </div>
        <p className="text-xs text-muted-foreground">
          {t('system.sensors')}<br/>
          {t('system.drone')}
        </p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const [location] = useLocation();
  const { t } = useLanguage();
  
  const mobileItems = navItems.slice(0, 5);
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 z-50 flex justify-around shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
      {mobileItems.map((item) => {
        const isActive = location === item.href;
        const Icon = item.icon;
        
        return (
          <Link key={item.href} href={item.href}>
            <div className={cn(
              "flex flex-col items-center p-2 rounded-lg cursor-pointer",
              isActive ? "text-primary" : "text-muted-foreground"
            )} data-testid={`mobile-nav-${item.href.replace('/', '') || 'dashboard'}`}>
              <Icon className="w-5 h-5" />
              <span className="text-[9px] mt-1 font-medium truncate max-w-[60px]">{t(item.labelKey)}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
