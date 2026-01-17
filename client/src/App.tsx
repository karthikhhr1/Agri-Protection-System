import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation, MobileNav } from "@/components/Navigation";
import { motion, AnimatePresence } from "framer-motion";

import Dashboard from "@/pages/Dashboard";
import Analysis from "@/pages/Analysis";
import Irrigation from "@/pages/Irrigation";
import Deterrent from "@/pages/Deterrent";
import Assistant from "@/pages/Assistant";
import Schedule from "@/pages/Schedule";
import Inventory from "@/pages/Inventory";
import Finances from "@/pages/Finances";
import Logs from "@/pages/Logs";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location}
        initial={ { opacity: 0, x: 20 } }
        animate={ { opacity: 1, x: 0 } }
        exit={ { opacity: 0, x: -20 } }
        transition={ { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }
        className="w-full"
      >
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/analysis" component={Analysis} />
          <Route path="/irrigation" component={Irrigation} />
          <Route path="/deterrent" component={Deterrent} />
          <Route path="/assistant" component={Assistant} />
          <Route path="/schedule" component={Schedule} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/finances" component={Finances} />
          <Route path="/logs" component={Logs} />
          <Route component={NotFound} />
        </Switch>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex min-h-screen bg-background selection:bg-primary/10 selection:text-primary">
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
