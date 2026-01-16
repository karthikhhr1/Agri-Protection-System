import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, Globe } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "te", name: "Telugu" },
  { code: "kn", name: "Kannada" },
  { code: "ta", name: "Tamil" },
];

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am your AgriGuard Assistant. How can I help you today?" }
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
        title: "Error",
        description: "Failed to get response from AI assistant.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Inject Google Translate script
    const addScript = document.createElement("script");
    addScript.setAttribute("src", "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit");
    document.body.appendChild(addScript);
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'hi,te,kn,ta,en',
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
      }, 'google_translate_element');
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground">AI Assistant</h1>
          <p className="text-muted-foreground font-medium">Expert agricultural guidance in your language</p>
        </div>
        <div id="google_translate_element" className="p-2 bg-card border rounded-md shadow-sm"></div>
      </div>

      <Card className="border-none shadow-xl bg-card overflow-hidden h-[600px] flex flex-col rounded-none border-t-2 border-primary">
        <CardHeader className="bg-muted/10 pb-4 pt-6 px-6">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 flex items-center gap-2">
            <Bot className="w-4 h-4" /> Strategic Intelligence Uplink
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[80%] ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-none border ${m.role === "user" ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border"}`}>
                      {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-4 text-sm font-medium leading-relaxed ${m.role === "user" ? "bg-primary/5 border-r-2 border-primary" : "bg-muted/20 border-l-2 border-primary"}`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-none border bg-muted border-border flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-4 bg-muted/20 border-l-2 border-primary text-sm font-black">ANALYZING...</div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-6 bg-muted/5 border-t border-border/30 flex gap-4">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Query the estate intelligence..." 
              className="rounded-none border-none bg-background shadow-inner h-12 text-sm font-medium"
            />
            <Button onClick={handleSend} disabled={isLoading} size="icon" className="h-12 w-12 rounded-none bg-primary text-primary-foreground hover:bg-primary/90">
              <Send className="w-5 h-5" />
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
