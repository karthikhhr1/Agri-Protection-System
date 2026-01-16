import { Link, useLocation } from "wouter";
import { LayoutDashboard, Droplets, Volume2, ScanEye, Sprout, Bot, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analysis", label: "Drone Analysis", icon: ScanEye },
  { href: "/irrigation", label: "Irrigation", icon: Droplets },
  { href: "/deterrent", label: "Audio Deterrent", icon: Volume2 },
  { href: "/assistant", label: "AI Assistant", icon: Bot },
];

export function Navigation() {
  const [location] = useLocation();

  useEffect(() => {
    // Inject Google Translate script globally if not already present
    if (!document.getElementById("google-translate-script")) {
      const addScript = document.createElement("script");
      addScript.id = "google-translate-script";
      addScript.setAttribute("src", "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit");
      document.body.appendChild(addScript);
      window.googleTranslateElementInit = () => {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'hi,te,kn,ta,en',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
          }, 'google_translate_element_global');
        }
      };
    }
  }, []);

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0 p-4 shadow-xl shadow-black/5 z-20">
      <div className="flex items-center gap-3 px-4 py-6 mb-2">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <Sprout className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-xl leading-none tracking-tight text-primary">AgriGuard</h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Estate Management</p>
        </div>
      </div>

      <div className="px-4 mb-6">
        <div className="relative group/lang flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10 transition-all duration-300 hover:bg-primary/10 hover:border-primary/20">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-0.5">Change Language / भाषा बदलें</p>
            <div id="google_translate_element_global" className="google-translate-styled"></div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {items.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                  isActive 
                    ? "bg-primary/10 text-primary font-semibold shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          System Online
        </div>
        <p className="text-xs text-muted-foreground">
          Sensors active<br/>
          Drone docking ready
        </p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const [location] = useLocation();
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 z-50 flex justify-around shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
      {items.map((item) => {
        const isActive = location === item.href;
        const Icon = item.icon;
        
        return (
          <Link key={item.href} href={item.href}>
            <div className={cn(
              "flex flex-col items-center p-2 rounded-lg cursor-pointer",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
              <Icon className="w-6 h-6" />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
