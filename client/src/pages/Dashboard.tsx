// Advanced Dashboard 2.0 implementation
import { useReports, useIrrigationHistory } from "@/hooks/use-agri";
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
  Clock
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
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: reports } = useReports();
  const { data: readings } = useIrrigationHistory();

  const latestReading = readings?.[0];
  const pendingReports = reports?.filter((r: any) => r.status === "pending").length || 0;
  const criticalReports = reports?.filter((r: any) => r.severity === "critical" || r.severity === "high").length || 0;

  // Mock trend data for visualization
  const trendData = readings?.slice(0, 10).reverse().map((r: any, i: number) => ({
    time: i,
    moisture: r.soilMoisture,
    health: r.healthScore || 85,
  })) || [];

  return (
    <div className="p-6 space-y-8 bg-background/50 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">Estate Intelligence</h1>
          <p className="text-muted-foreground text-lg">Real-time agricultural health & predictive monitoring</p>
        </div>
        <div className="flex items-center gap-3 bg-card dark:bg-zinc-900 p-2 rounded-xl border shadow-sm">
          <Badge variant="outline" className="px-3 py-1 gap-1.5 border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400">
            <ShieldCheck className="w-4 h-4" /> System Active
          </Badge>
          <div className="h-4 w-px bg-border" />
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> Last sync: Just now
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Avg Soil Moisture" 
          value={`${latestReading?.soilMoisture || 0}%`}
          description="Surface & Sub-surface avg"
          icon={Droplets}
          trend="+2.1% from yesterday"
          color="blue"
        />
        <StatsCard 
          title="Pathology Alerts" 
          value={criticalReports}
          description="Requires immediate action"
          icon={AlertTriangle}
          trend={pendingReports > 0 ? `${pendingReports} pending scans` : "All scans processed"}
          color={criticalReports > 0 ? "orange" : "green"}
          isAlert={criticalReports > 0}
        />
        <StatsCard 
          title="System Health" 
          value={`${latestReading?.healthScore || 92}%`}
          description="Predictive viability score"
          icon={Activity}
          trend="Stable"
          color="green"
        />
        <StatsCard 
          title="Active Estate Coverage" 
          value="98.2%"
          description="Sensor & Drone network"
          icon={Zap}
          trend="Optimized"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-md border-muted/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Health & Moisture Analytics
                </CardTitle>
                <CardDescription>Predictive 24h trend analysis</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none">Live Stream</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={ { backgroundColor: "hsl(var(--card))", borderRadius: "12px", border: "1px solid hsl(var(--border))" } }
                  itemStyle={ { fontWeight: "bold" } }
                />
                <Area type="monotone" dataKey="moisture" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorMoisture)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md border-muted/20">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-500" />
              Recent Pathology
            </CardTitle>
            <CardDescription>Latest AI-detected signatures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reports?.slice(0, 4).map((report: any, i: number) => (
                <motion.div 
                  initial={ { opacity: 0, x: 20 } }
                  animate={ { opacity: 1, x: 0 } }
                  transition={ { delay: i * 0.1 } }
                  key={report.id} 
                  className="flex items-center gap-4 group cursor-pointer hover:bg-muted/30 p-2 rounded-lg transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden border shadow-sm flex-shrink-0">
                    <img src={report.imageUrl} alt="scan" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-sm truncate">
                        {report.cropType && report.cropType !== 'unknown' ? report.cropType : "Crop Analysis"}
                      </p>
                      <SeverityBadge severity={report.severity} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(report.createdAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              {(!reports || reports.length === 0) && (
                <div className="text-center py-10">
                  <div className="bg-muted rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="text-muted-foreground w-6 h-6" />
                  </div>
                  <p className="text-muted-foreground text-sm">No pathology detected</p>
                </div>
              )}
              <Link href="/analysis">
                <Button variant="ghost" className="w-full mt-4 text-primary font-bold hover:bg-primary/5">
                  Launch Uplink Center
                </Button>
              </Link>
            </div>
          </CardContent>
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
    <Card className={`shadow-sm border-muted/20 relative overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] ${isAlert ? 'ring-1 ring-orange-500/50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${colorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        <div className="mt-4 flex items-center gap-1.5">
          <TrendingUp className={`w-3 h-3 ${color === 'orange' ? 'text-orange-500' : 'text-green-500'}`} />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{trend}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function SeverityBadge({ severity }: { severity?: string | null }) {
  const config: any = {
    critical: "bg-red-500/10 text-red-600 border-red-200",
    high: "bg-orange-500/10 text-orange-600 border-orange-200",
    medium: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    low: "bg-blue-500/10 text-blue-600 border-blue-200",
    none: "bg-green-500/10 text-green-600 border-green-200",
  };
  
  return (
    <Badge variant="outline" className={`text-[10px] capitalize font-bold px-1.5 py-0 border-none ${config[severity || 'none']}`}>
      {severity || 'safe'}
    </Badge>
  );
}
