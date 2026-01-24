import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sprout, ScanEye, Volume2, Droplets, Shield, Smartphone, Globe, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Sprout className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-primary">AgriGuard</span>
            </div>
            <Button asChild data-testid="button-login-nav">
              <a href="/api/login">Login</a>
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Shield className="w-4 h-4" />
                    Enterprise-Grade Farm Management
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                    Smart Agriculture for
                    <span className="text-primary block">Modern Farmers</span>
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-lg">
                    AI-powered crop analysis, automated wildlife protection, and intelligent irrigation - 
                    all in one comprehensive platform designed for Indian agriculture.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild className="gap-2" data-testid="button-get-started">
                    <a href="/api/login">
                      Get Started Free
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </Button>
                </div>

                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    11 Indian Languages
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    95%+ Detection Accuracy
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Fully Automated
                  </div>
                </div>
              </div>

              <div className="relative lg:block hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl transform rotate-3" />
                <div className="relative bg-card rounded-3xl border border-border shadow-2xl p-8 space-y-6">
                  <div className="flex items-center gap-4 pb-4 border-b border-border">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                      <ScanEye className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold">Drone Analysis Active</p>
                      <p className="text-sm text-muted-foreground">Scanning 50 acres...</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Crop Health</span>
                      <span className="font-bold text-green-500">98%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Wildlife Threats</span>
                      <span className="font-bold text-green-500">0 Active</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Irrigation Status</span>
                      <span className="font-bold text-blue-500">Optimal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Complete Farm Protection</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Every feature you need to protect and optimize your agricultural estate
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover-elevate transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <ScanEye className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">AI Crop Analysis</h3>
                  <p className="text-muted-foreground text-sm">
                    Drone-based scanning with AI detection for diseases, pests, insects, and wildlife with 95%+ accuracy.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                    <Volume2 className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="font-semibold text-lg">Wildlife Deterrent</h3>
                  <p className="text-muted-foreground text-sm">
                    Automated frequency-based deterrent for 40+ Indian wildlife species. Triggers automatically from drone photos.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-lg">Smart Irrigation</h3>
                  <p className="text-muted-foreground text-sm">
                    Real-time soil moisture monitoring with threshold-based automatic irrigation controls.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="font-semibold text-lg">11 Indian Languages</h3>
                  <p className="text-muted-foreground text-sm">
                    Complete interface in Hindi, Telugu, Kannada, Tamil, Marathi, Bengali, Gujarati, Punjabi, Malayalam, Odia, and English.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-lg">Mobile Responsive</h3>
                  <p className="text-muted-foreground text-sm">
                    Full functionality on any device with QR code access for quick mobile connection.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="font-semibold text-lg">Fully Automated</h3>
                  <p className="text-muted-foreground text-sm">
                    All systems operate automatically without user intervention. Set it and forget it protection.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Protect Your Farm?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of Indian farmers who trust AgriGuard for their agricultural management needs.
            </p>
            <Button size="lg" asChild className="gap-2" data-testid="button-start-now">
              <a href="/api/login">
                Start Now - It's Free
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </section>

        <footer className="py-8 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">AgriGuard</span>
              </div>
              <p className="text-sm text-muted-foreground">
                &copy; 2026 AgriGuard Estate Intelligence. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
