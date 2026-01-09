// Advanced Dashboard 2.0 implementation
import { useReports, useIrrigationHistory, useDeleteReport } from "@/hooks/use-agri";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Droplets, 
  AlertTriangle, 
  Leaf, 
  TrendingUp, 
  ShieldCheck,
  Zap,
  Clock,
  Trash2,
  ChevronRight,
  BarChart3
} from "lucide-react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function Dashboard() {
  const { data: reports } = useReports();
  const { data: readings } = useIrrigationHistory();
  const deleteMutation = useDeleteReport();

  const latestReading = readings?.[0];
  const pendingReports = reports?.filter((r: any) => r.status === "pending").length || 0;
  const criticalReports = reports?.filter((r: any) => r.severity === "critical" || r.severity === "high").length || 0;

  // Mock trend data for visualization
  const trendData = readings?.slice(0, 10).reverse().map((r: any, i: number) => ({
    time: i,
    moisture: r.soilMoisture,
    health: r.healthScore || 85,
    temp: r.temperature || 25,
    humidity: r.ambientHumidity || 50,
  })) || [];

  return (
    <div className="p-6 space-y-8 bg-background/50 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-primary" />
            Estate Intelligence
          </h1>
          <p className="text-muted-foreground text-lg font-medium">Real-time pathology & asset monitoring</p>
        </div>
        <div className="flex items-center gap-4 bg-card p-3 rounded-2xl border shadow-sm">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">System Status</span>
            <span className="text-sm font-bold text-green-600 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Optimal Performance
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatsCard 
          title="Hydration Index" 
          value={`${latestReading?.soilMoisture || 0}%`}
          description="Soil saturation"
          icon={Droplets}
          trend="+0.8% variance"
          color="blue"
        />
        <StatsCard 
          title="Ambient Temp" 
          value={`${latestReading?.temperature || 24}°C`}
          description="Field temperature"
          icon={TrendingUp}
          trend="Steady"
          color="orange"
        />
        <StatsCard 
          title="Field Humidity" 
          value={`${latestReading?.ambientHumidity || 48}%`}
          description="Ambient humidity"
          icon={Droplets}
          trend="Optimal"
          color="blue"
        />
        <StatsCard 
          title="Pathology Risk" 
          value={criticalReports}
          description="Critical threats"
          icon={AlertTriangle}
          trend={pendingReports > 0 ? `${pendingReports} in queue` : "Scanning clear"}
          color={criticalReports > 0 ? "orange" : "green"}
          isAlert={criticalReports > 0}
        />
        <StatsCard 
          title="Estate Vitality" 
          value={`${latestReading?.healthScore || 94}%`}
          description="Health score"
          icon={Activity}
          trend="Positive trend"
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 overflow-hidden border-none shadow-xl bg-card">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Predictive Analytics
              </CardTitle>
              <CardDescription>Sensor telemetry & trend forecasting</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-background">Moisture</Badge>
              <Badge variant="outline" className="bg-background">Temp</Badge>
              <Badge variant="outline" className="bg-background">Humidity</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-8 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={ { backgroundColor: "hsl(var(--card))", borderRadius: "16px", border: "1px solid hsl(var(--border))", boxShadow: "var(--shadow-xl)" } }
                  itemStyle={ { fontWeight: "800" } }
                  cursor={ { stroke: 'hsl(var(--primary))', strokeWidth: 2 } }
                />
                <Area type="monotone" dataKey="moisture" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorMoisture)" strokeWidth={4} dot={ { r: 4, fill: 'hsl(var(--primary))' } } />
                <Area type="monotone" dataKey="temp" stroke="#f97316" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="flex flex-col border-none shadow-xl bg-card overflow-hidden">
          <CardHeader className="border-b bg-muted/30 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  Pathology Feed
                </CardTitle>
                <CardDescription>Latest intelligence</CardDescription>
              </div>
              <Link href="/analysis">
                <Button size="icon" variant="ghost" className="rounded-full hover-elevate">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            <div className="divide-y divide-border/50">
              <AnimatePresence initial={false}>
                {reports?.slice(0, 10).map((report: any, i: number) => (
                  <motion.div 
                    layout
                    initial={ { opacity: 0, x: -20 } }
                    animate={ { opacity: 1, x: 0 } }
                    exit={ { opacity: 0, scale: 0.95 } }
                    transition={ { duration: 0.2 } }
                    key={report.id} 
                    className="group flex items-center gap-4 p-4 hover:bg-muted/30 transition-all cursor-default"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border shadow-sm bg-muted flex-shrink-0">
                        <img src={report.imageUrl} alt="scan" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${report.severity === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-green-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-black text-sm text-foreground truncate uppercase tracking-tight">
                          {report.cropType && report.cropType !== 'unknown' ? report.cropType : "Unknown"}
                        </p>
                        <SeverityBadge severity={report.severity} />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(report.createdAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-xl">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-2xl font-black tracking-tighter">Delete Record?</AlertDialogTitle>
                                <AlertDialogDescription className="text-base font-medium">
                                  This action will permanently remove this pathology intelligence from the estate archives.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="gap-3">
                                <AlertDialogCancel className="rounded-2xl font-bold h-12 border-none bg-muted hover:bg-muted/80">Discard</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => {
                                    deleteMutation.mutate(report.id);
                                  }} 
                                  className="rounded-2xl font-bold h-12 bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20"
                                >
                                  Confirm Removal
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {(!reports || reports.length === 0) && (
                <div className="text-center py-32 opacity-20">
                  <Activity className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg font-black uppercase tracking-widest">Active Monitoring</p>
                </div>
              )}
            </div>
          </CardContent>
          <div className="p-4 bg-muted/30 border-t">
            <Link href="/analysis">
              <Button className="w-full font-black text-sm uppercase tracking-widest h-12 rounded-2xl shadow-lg shadow-primary/20 hover-elevate">
                Initiate New Scan
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, description, icon: Icon, trend, color, isAlert }: any) {
  const colorMap: any = {
    blue: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800",
    green: "bg-green-500/10 text-green-600 border-green-200 dark:border-green-800",
    orange: "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800",
    purple: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800",
  };

  return (
    <Card className={`group relative border-none shadow-lg bg-card transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden rounded-3xl ${isAlert ? 'ring-2 ring-orange-500/30' : ''}`}>
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 blur-3xl ${color === 'blue' ? 'bg-blue-500' : color === 'orange' ? 'bg-orange-500' : color === 'purple' ? 'bg-purple-500' : 'bg-green-500'}`} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{title}</CardTitle>
          <div className={`p-3 rounded-2xl shadow-sm ${colorMap[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-black tracking-tighter mb-1 transition-transform group-hover:scale-105 origin-left">{value}</div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{description}</p>
        <div className="mt-6 pt-4 border-t border-muted flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${color === 'orange' ? 'bg-orange-500' : 'bg-green-500'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">{trend}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function SeverityBadge({ severity }: { severity?: string | null }) {
  const config: any = {
    critical: "bg-red-500 text-white shadow-lg shadow-red-500/20",
    high: "bg-orange-500 text-white shadow-lg shadow-orange-500/20",
    medium: "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20",
    low: "bg-blue-500 text-white shadow-lg shadow-blue-500/20",
    none: "bg-green-500 text-white shadow-lg shadow-green-500/20",
  };
  
  return (
    <Badge className={`text-[10px] font-black uppercase tracking-tighter px-2.5 py-0.5 border-none rounded-lg ${config[severity || 'none']}`}>
      {severity || 'safe'}
    </Badge>
  );
}
