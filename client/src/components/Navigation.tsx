import { Link, useLocation } from "wouter";
import { LayoutDashboard, Droplets, Volume2, ScanEye, Sprout, Bot, Globe, Calendar, Package, FileText, ChevronDown, MapPin, Clock, Menu, X, Cpu, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage, languageNames, languageNamesEnglish, type Language } from "@/lib/i18n";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QRCodeModal } from "./QRCodeModal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  { href: "/finances", labelKey: "nav.finances", icon: DollarSign },
  { href: "/logs", labelKey: "nav.logs", icon: FileText },
  { href: "/hardware", labelKey: "nav.hardware", icon: Cpu },
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

      <div className="px-2 mb-4">
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="w-full flex items-center gap-3 p-3 h-auto bg-primary/5 border border-primary/10"
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
          </Button>
          
          {isLangOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
              {languages.map((lang) => (
                <Button
                  key={lang}
                  variant={language === lang ? "secondary" : "ghost"}
                  onClick={() => {
                    setLanguage(lang);
                    setIsLangOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-3 h-auto justify-between text-sm font-medium rounded-none",
                    language === lang && "bg-primary/10 text-primary"
                  )}
                  data-testid={`button-language-${lang}`}
                >
                  <span>
                    {languageNames[lang]}
                    {lang !== 'en' && <span className="text-muted-foreground ml-1.5">({languageNamesEnglish[lang]})</span>}
                  </span>
                  {language === lang && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-2 mb-4">
        <div className="flex items-center gap-2">
          <QRCodeModal testId="button-qr-code-desktop" />
          <span className="text-xs text-muted-foreground">{t('qr.openOnMobile')}</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 px-4 py-2.5 h-auto",
                  isActive && "bg-primary/10 text-primary font-semibold shadow-sm"
                )}
                data-testid={`nav-${item.href.replace('/', '') || 'dashboard'}`}
              >
                <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                <span className="text-sm">{t(item.labelKey)}</span>
              </Button>
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
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  
  const languages: Language[] = ['en', 'hi', 'te', 'kn', 'ta', 'mr', 'bn', 'gu', 'pa', 'ml', 'or'];
  const quickNavItems = navItems.slice(0, 4);
  
  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 bg-card border-b border-border p-3 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Sprout className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-primary">AgriGuard</span>
        </div>
        <div className="flex items-center gap-2">
          <QRCodeModal testId="button-qr-code-mobile" />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Sprout className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span>AgriGuard</span>
                </SheetTitle>
              </SheetHeader>
              
              <div className="p-4 border-b">
                <Button
                  variant="ghost"
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="w-full flex items-center gap-3 p-3 h-auto bg-primary/5 border border-primary/10"
                  data-testid="button-mobile-language-selector"
                >
                  <Globe className="w-4 h-4 text-primary" />
                  <div className="flex-1 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">{t('nav.changeLanguage')}</p>
                    <p className="text-sm font-bold">{languageNames[language]}</p>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", isLangOpen && "rotate-180")} />
                </Button>
                
                {isLangOpen && (
                  <div className="mt-2 bg-muted rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    {languages.map((lang) => (
                      <Button
                        key={lang}
                        variant={language === lang ? "secondary" : "ghost"}
                        onClick={() => {
                          setLanguage(lang);
                          setIsLangOpen(false);
                        }}
                        className={cn(
                          "w-full px-4 py-2 h-auto justify-start text-left text-sm rounded-none",
                          language === lang && "bg-primary/10 text-primary font-medium"
                        )}
                        data-testid={`button-mobile-lang-${lang}`}
                      >
                        {languageNames[lang]}
                        {lang !== 'en' && <span className="text-muted-foreground ml-1.5">({languageNamesEnglish[lang]})</span>}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
                {navItems.map((item) => {
                  const isActive = location === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "w-full justify-start gap-3 px-4 py-3 h-auto",
                          isActive && "bg-primary/10 text-primary font-semibold"
                        )}
                        data-testid={`mobile-nav-${item.href.replace('/', '') || 'dashboard'}`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{t(item.labelKey)}</span>
                      </Button>
                    </Link>
                  );
                })}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {t('system.online')}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 z-50 flex justify-around shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
        {quickNavItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "flex flex-col items-center h-auto py-2 px-2 min-w-[60px]",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                data-testid={`bottom-nav-${item.href.replace('/', '') || 'dashboard'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] mt-1 font-medium truncate text-center w-full">{t(item.labelKey)}</span>
              </Button>
            </Link>
          );
        })}
        <Button
          variant="ghost"
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center h-auto py-2 px-2 text-muted-foreground min-w-[60px]"
          data-testid="button-bottom-more"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[9px] mt-1 font-medium">{t('nav.more')}</span>
        </Button>
      </nav>
    </>
  );
}
