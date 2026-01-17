import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Assistant() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t('assistant.greeting') }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await apiRequest("POST", "/api/chat", { message: userMessage });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
    } catch (err) {
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: t('assistant.error'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6 h-full flex flex-col">
      <div className="flex justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-foreground">
            {t('assistant.title')}
          </h1>
          <p className="text-muted-foreground font-medium text-sm md:text-base mt-1 md:mt-2">
            {t('assistant.pageSubtitle')}
          </p>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-card overflow-hidden flex-1 flex flex-col rounded-none border-t-2 border-primary min-h-0">
        <CardHeader className="bg-muted/10 pb-3 pt-4 px-4 md:pb-4 md:pt-6 md:px-6 flex-shrink-0">
          <CardTitle className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary/60 flex items-center gap-2">
            <Bot className="w-4 h-4 flex-shrink-0" data-testid="icon-bot" /> {t('assistant.header')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col min-h-0">
          <ScrollArea className="flex-1 p-4 md:p-6">
            <div className="space-y-3 md:space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`} data-testid={`message-${m.role}-${i}`}>
                  <div className={`flex gap-2 md:gap-3 max-w-xs md:max-w-md lg:max-w-lg ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-none border text-xs md:text-sm ${m.role === "user" ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border"}`} data-testid={`avatar-${m.role}`}>
                      {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-3 md:p-4 text-xs md:text-sm font-medium leading-relaxed break-words ${m.role === "user" ? "bg-primary/5 border-r-2 border-primary" : "bg-muted/20 border-l-2 border-primary"}`} data-testid={`content-${m.role}-${i}`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start" data-testid="loading-indicator">
                  <div className="flex gap-2 md:gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-none border bg-muted border-border flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-3 md:p-4 bg-muted/20 border-l-2 border-primary text-xs md:text-sm font-black">
                      {t('assistant.analyzing')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-3 md:p-4 bg-muted/5 border-t border-border/30 flex gap-2 md:gap-4 flex-shrink-0" data-testid="input-area">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={t('assistant.inputPlaceholder')} 
              className="rounded-none border-none bg-background shadow-inner h-10 md:h-12 text-xs md:text-sm font-medium"
              data-testid="input-message"
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading} 
              size="icon" 
              className="h-10 md:h-12 w-10 md:w-12 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0"
              data-testid="button-send"
            >
              <Send className="w-4 md:w-5 h-4 md:h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}
