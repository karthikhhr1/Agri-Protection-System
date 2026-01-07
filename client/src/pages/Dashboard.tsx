import { Link } from "wouter";
import { useReports, useIrrigationHistory } from "@/hooks/use-agri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Activity, AlertTriangle, Droplets, Camera, LineChart, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: reports, isLoading: reportsLoading } = useReports();
  const { data: readings, isLoading: readingsLoading } = useIrrigationHistory();

  const latestReading = readings?.[0];
  const activeRisks = reports?.filter((r: any) => r.analysis?.diseaseDetected).length || 0;
  const pendingScans = reports?.filter((r: any) => r.status === 'pending').length || 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-accent/5 border border-border shadow-lg">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground font-display">Estate Intelligence</h1>
          <p className="text-muted-foreground text-lg">
            Welcome back. All systems are currently <span className="text-primary font-semibold">monitoring</span>.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="p-4 bg-card rounded-2xl border border-border shadow-sm">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Time</div>
            <div className="text-xl font-bold font-mono text-primary">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <div className="p-4 bg-card rounded-2xl border border-border shadow-sm">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Date</div>
            <div className="text-xl font-bold font-mono text-primary">{new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
          </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-500 border-none bg-primary/5">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Droplets className="w-16 h-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Soil Moisture</CardTitle>
          </CardHeader>
          <CardContent>
            {readingsLoading ? <Skeleton className="h-10 w-24" /> : (
              <div className="space-y-1">
                <div className="text-4xl font-black text-primary">{latestReading?.soilMoisture ?? "--"}%</div>
                <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">Target 65%</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-500 border-none bg-accent/5">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-16 h-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Disease Risks</CardTitle>
          </CardHeader>
          <CardContent>
            {reportsLoading ? <Skeleton className="h-10 w-24" /> : (
              <div className="space-y-1">
                <div className="text-4xl font-black text-accent">{activeRisks}</div>
                <Badge variant="secondary" className="bg-accent/20 text-accent hover:bg-accent/30">Action Required</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-500 border-none bg-blue-500/5">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Camera className="w-16 h-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pending Scans</CardTitle>
          </CardHeader>
          <CardContent>
            {reportsLoading ? <Skeleton className="h-10 w-24" /> : (
              <div className="space-y-1">
                <div className="text-4xl font-black text-blue-600">{pendingScans}</div>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-600">Awaiting Scoring</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-500 border-none bg-green-500/5">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-16 h-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">System Trust</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-4xl font-black text-green-600">99.8%</div>
              <Badge variant="secondary" className="bg-green-500/20 text-green-600">Secure & Stable</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 overflow-hidden shadow-xl border-border/50">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Intelligence Feed
            </CardTitle>
            <Link href="/analysis">
              <Button variant="ghost" size="sm" className="text-primary font-bold">
                Uplink Centre
                <ArrowUpRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {reportsLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
              </div>
            ) : reports?.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">No intelligence data yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {reports?.slice(0, 4).map((report) => (
                  <div key={report.id} className="p-6 flex items-center gap-6 hover:bg-muted/30 transition-colors group">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-border group-hover:ring-primary/50 transition-all shadow-md">
                      <img src={report.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">Scan #{report.id}</span>
                        <Badge variant={report.status === 'complete' ? 'outline' : 'secondary'} className="rounded-full">
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">
                        {report.status === 'complete' 
                          ? (report.analysis as any)?.diseases?.[0]?.name || "No diseases found"
                          : "Processing metadata..."}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-foreground">{new Date(report.createdAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-xs text-muted-foreground">{new Date(report.createdAt!).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary to-primary-foreground text-white border-none shadow-2xl relative overflow-hidden h-full min-h-[400px]">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
               <Activity className="w-96 h-96 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="relative z-10 p-8 flex flex-col h-full justify-between">
              <div className="space-y-4">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md">Active Intelligence</Badge>
                <h3 className="text-3xl font-black leading-tight">Identify Risks Real-Time</h3>
                <p className="text-white/80 font-medium">
                  Connect your drone or handheld camera directly to the scoring engine for instant results.
                </p>
              </div>
              <Link href="/analysis">
                <Button className="w-full bg-white text-primary hover:bg-white/90 text-lg font-black h-14 rounded-2xl shadow-xl">
                  Launch Uplink
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
