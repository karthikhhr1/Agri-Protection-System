import { Link } from "wouter";
import { useReports, useIrrigationHistory } from "@/hooks/use-agri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Activity, AlertTriangle, Droplets } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: reports, isLoading: reportsLoading } = useReports();
  const { data: readings, isLoading: readingsLoading } = useIrrigationHistory();

  const latestReading = readings?.[0];
  const riskCount = reports?.filter((r: any) => r.analysis.risks.length > 0).length || 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground font-display">Farm Overview</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Real-time monitoring and estate analytics.
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-muted-foreground">Local Time</div>
          <div className="text-xl font-mono">{new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dashboard-card border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
              Soil Moisture
              <Droplets className="w-4 h-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {readingsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{latestReading?.soilMoisture ?? "--"}%</span>
                <span className="text-sm text-green-600 font-medium">Optimal</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Last update: Just now</p>
          </CardContent>
        </Card>

        <Card className="dashboard-card border-l-4 border-l-accent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
              Active Risks
              <AlertTriangle className="w-4 h-4 text-accent" />
            </CardTitle>
          </CardHeader>
          <CardContent>
             {reportsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-accent">{riskCount}</span>
                <span className="text-sm text-muted-foreground">Detected</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Requires IPM Action</p>
          </CardContent>
        </Card>

        <Card className="dashboard-card border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
              System Health
              <Activity className="w-4 h-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-600">98%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">All sensors operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions / Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {reportsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : reports?.length === 0 ? (
              <p className="text-muted-foreground text-sm">No reports generated yet.</p>
            ) : (
              <div className="space-y-4">
                {reports?.slice(0, 3).map((report) => (
                  <div key={report.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                      <img src={report.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">Field Scan #{report.id}</div>
                      <div className="text-xs text-muted-foreground">{new Date(report.createdAt!).toLocaleDateString()}</div>
                    </div>
                    <Link href={`/analysis`}>
                      <Button variant="ghost" size="icon">
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-border">
              <Link href="/analysis">
                <Button variant="outline" className="w-full">View All Reports</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="relative rounded-2xl overflow-hidden min-h-[300px] group">
          {/* HTML comment for Unsplash: farm landscape drone view */}
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop" 
            alt="Farm view" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-8 flex flex-col justify-end">
            <h3 className="text-white text-2xl font-bold">Start New Analysis</h3>
            <p className="text-white/80 mt-2 mb-4">
              Upload fresh drone imagery to update your estate's health status.
            </p>
            <Link href="/analysis">
              <Button className="w-fit bg-white text-black hover:bg-white/90">
                Launch Drone Uplink
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
