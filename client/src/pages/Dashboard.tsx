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
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-8">
        <div className="space-y-2 group cursor-default">
          <div className="flex items-center gap-2 overflow-hidden">
            <motion.div 
              initial={ { width: 0 } }
              animate={ { width: 32 } }
              transition={ { duration: 1.5, ease: [0.16, 1, 0.3, 1] } }
              className="h-px bg-primary/30 shrink-0" 
            />
            <motion.span 
              initial={ { x: -20, opacity: 0 } }
              animate={ { x: 0, opacity: 1 } }
              transition={ { duration: 1, delay: 0.5, ease: "easeOut" } }
              className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60"
            >
              AgriGuard Strategic Command
            </motion.span>
          </div>
          <div className="overflow-hidden">
            <motion.h1 
              initial={ { y: 100 } }
              animate={ { y: 0 } }
              transition={ { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
              className="text-5xl font-black tracking-tighter text-foreground leading-[0.8] flex items-baseline gap-2"
            >
              Estate Intelligence
              <span className="text-primary text-6xl">.</span>
            </motion.h1>
          </div>
          <motion.p 
            initial={ { opacity: 0 } }
            animate={ { opacity: 1 } }
            transition={ { duration: 2, delay: 1 } }
            className="text-muted-foreground/80 text-lg font-medium tracking-tight"
          >
            Ecological durability & tactical asset oversight
          </motion.p>
        </div>
        <motion.div 
          initial={ { opacity: 0, scale: 0.95 } }
          animate={ { opacity: 1, scale: 1 } }
          transition={ { duration: 1, delay: 1.2 } }
          className="flex items-center gap-8 px-6 py-4 bg-card rounded-sm border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]"
        >
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Network Status</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-tighter text-foreground">Active Uplink</span>
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            </div>
          </div>
        </motion.div>
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
          color="sky"
        />
        <StatsCard 
          title="Pathology Risk" 
          value={criticalReports}
          description="Critical threats"
          icon={AlertTriangle}
          trend={pendingReports > 0 ? `${pendingReports} in queue` : "Scanning clear"}
          color={criticalReports > 0 ? "red" : "green"}
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

        <Card className="flex flex-col border-none shadow-sm bg-card overflow-hidden rounded-none border-t-2 border-primary">
          <CardHeader className="bg-muted/10 pb-6 pt-8 px-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-px w-4 bg-primary/30" />
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
                    Pathology Feed
                  </CardTitle>
                </div>
                <CardDescription className="text-xs font-medium tracking-tight">Intelligence stream</CardDescription>
              </div>
              <Link href="/analysis">
                <Button size="icon" variant="ghost" className="rounded-none hover:bg-primary/5 transition-colors">
                  <ChevronRight className="w-4 h-4 text-primary" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0 px-8">
            <div className="divide-y divide-border/30">
              <AnimatePresence initial={false}>
                {reports?.slice(0, 10).map((report: any, i: number) => (
                  <motion.div 
                    layout
                    initial={ { opacity: 0 } }
                    animate={ { opacity: 1 } }
                    exit={ { opacity: 0 } }
                    key={report.id} 
                    className="group flex items-center gap-6 py-6 transition-all"
                  >
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-none overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 border border-border/50">
                        <img src={report.imageUrl} alt="scan" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-black text-[11px] text-foreground truncate uppercase tracking-[0.1em]">
                          {report.cropType && report.cropType !== 'unknown' ? report.cropType : "Specimen"}
                        </p>
                        <SeverityBadge severity={report.severity} />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Clock className="w-3 h-3 opacity-50" /> {new Date(report.createdAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground/40 hover:text-destructive rounded-none">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-none border-none shadow-2xl bg-background p-12 max-w-lg">
                              <AlertDialogHeader className="space-y-4">
                                <AlertDialogTitle className="text-4xl font-black tracking-tighter uppercase leading-none">Discard Intelligence?</AlertDialogTitle>
                                <AlertDialogDescription className="text-sm font-medium leading-relaxed">
                                  This operation will purge this specific diagnostic record from the archival database.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              {report.analysis?.precautions && (
                                <div className="mt-4 space-y-2">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Ecological Precautions</p>
                                  <ul className="text-[11px] font-medium text-muted-foreground list-disc pl-4 space-y-1">
                                    {report.analysis.precautions.map((p: string, idx: number) => (
                                      <li key={idx}>{p}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <AlertDialogFooter className="mt-8 gap-4">
                                <AlertDialogCancel className="rounded-none font-black text-[10px] uppercase tracking-widest h-12 px-8 border-none bg-muted hover:bg-muted/80">Retain</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => {
                                    deleteMutation.mutate(report.id);
                                  }} 
                                  className="rounded-none font-black text-[10px] uppercase tracking-widest h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                  Purge Record
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
            </div>
          </CardContent>
          <div className="p-8 bg-muted/5 border-t border-border/30">
            <Link href="/analysis">
              <Button className="w-full font-black text-[10px] uppercase tracking-[0.3em] h-14 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 shadow-none transition-all">
                Commence Scanning
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
    blue: "border-l-[hydration] bg-blue-500/5",
    orange: "border-l-[temperature] bg-orange-500/5",
    sky: "border-l-[humidity] bg-sky-500/5",
    red: "border-l-[risk] bg-red-500/5",
    green: "border-l-[vitality] bg-green-500/5",
  };

  const iconColors: any = {
    blue: "text-blue-500",
    orange: "text-orange-500",
    sky: "text-sky-500",
    red: "text-red-500",
    green: "text-green-500",
  };

  const borderColors: any = {
    blue: "border-blue-500",
    orange: "border-orange-500",
    sky: "border-sky-500",
    red: "border-red-500",
    green: "border-green-500",
  };

  return (
    <Card className={`group relative border-none shadow-sm transition-all duration-700 hover:shadow-xl overflow-hidden rounded-none border-l-4 ${colorMap[color] || 'bg-card border-primary'} ${borderColors[color] || ''}`}>
      <CardHeader className="pb-4 pt-6 px-6">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">{title}</CardTitle>
          <Icon className={`w-5 h-5 ${iconColors[color] || 'text-primary'}`} />
        </div>
        <div className="text-5xl font-black tracking-tighter text-foreground mb-1 group-hover:translate-x-1 transition-transform duration-500">{value}</div>
        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">{description}</p>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="mt-4 pt-4 border-t border-muted/50 flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{trend}</span>
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${iconColors[color] || 'bg-primary'}`} />
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
