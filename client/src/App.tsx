import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation, MobileNav } from "@/components/Navigation";

import Dashboard from "@/pages/Dashboard";
import Analysis from "@/pages/Analysis";
import Irrigation from "@/pages/Irrigation";
import Deterrent from "@/pages/Deterrent";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/analysis" component={Analysis} />
      <Route path="/irrigation" component={Irrigation} />
      <Route path="/deterrent" component={Deterrent} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex min-h-screen bg-background">
          <Navigation />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto mb-16 md:mb-0">
            <div className="max-w-7xl mx-auto">
              <Router />
            </div>
          </main>
          <MobileNav />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
