import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { 
  BarChart3, 
  Target, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Bug, 
  Leaf, 
  AlertTriangle,
  Zap,
  Shield,
  Activity
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface AdminStats {
  totalScans: number;
  avgConfidence: number;
  categoryBreakdown: { category: string; count: number }[];
  accuracyRate: number;
  recentScans: any[];
}

const CATEGORY_COLORS: Record<string, string> = {
  disease: "#ef4444",
  insect: "#f59e0b",
  nutrient: "#3b82f6",
  damage: "#8b5cf6",
  healthy: "#22c55e",
  wildlife: "#06b6d4",
};

const CATEGORY_ICONS: Record<string, any> = {
  disease: AlertTriangle,
  insect: Bug,
  nutrient: Leaf,
  damage: Zap,
  healthy: CheckCircle2,
  wildlife: Shield,
};

export default function Admin() {
  const { t, formatNumber, formatDate } = useLanguage();
  
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const categoryData = stats?.categoryBreakdown.map(item => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    value: item.count,
    color: CATEGORY_COLORS[item.category] || "#888"
  })) || [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-muted rounded-xl w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-foreground flex items-center gap-3">
          <BarChart3 className="w-8 sm:w-10 h-8 sm:h-10 text-primary" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground text-sm md:text-base font-medium">
          Track scan analytics, accuracy, and pest detection patterns
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-none shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Scans</p>
                <p className="text-3xl font-black text-foreground mt-1">{formatNumber(stats?.totalScans || 0)}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-lg bg-gradient-to-br from-green-500/5 to-green-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Avg Confidence</p>
                <p className="text-3xl font-black text-foreground mt-1">{(stats?.avgConfidence || 0).toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-lg bg-gradient-to-br from-blue-500/5 to-blue-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Accuracy Rate</p>
                <p className="text-3xl font-black text-foreground mt-1">{(stats?.accuracyRate || 0).toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-lg bg-gradient-to-br from-orange-500/5 to-orange-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categories</p>
                <p className="text-3xl font-black text-foreground mt-1">{stats?.categoryBreakdown.length || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              Detection Categories
            </CardTitle>
            <CardDescription>Distribution of detected issues by category</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>No scan data available yet. Start scanning to see analytics.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              Category Distribution
            </CardTitle>
            <CardDescription>Pie chart of detection types</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>No data to display</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-black flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recent Scans
          </CardTitle>
          <CardDescription>Latest analysis results with confidence scores</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {stats?.recentScans && stats.recentScans.length > 0 ? (
            <div className="space-y-3">
              {stats.recentScans.map((scan: any, idx: number) => {
                const CategoryIcon = CATEGORY_ICONS[scan.detectionCategory] || Activity;
                return (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${CATEGORY_COLORS[scan.detectionCategory] || '#888'}20` }}
                      >
                        <CategoryIcon 
                          className="w-5 h-5" 
                          style={{ color: CATEGORY_COLORS[scan.detectionCategory] || '#888' }} 
                        />
                      </div>
                      <div>
                        <p className="font-bold text-sm">
                          {scan.detectionName || scan.detectionCategory?.toUpperCase() || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Report #{scan.reportId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant="outline"
                        className="font-mono"
                        style={{ 
                          borderColor: CATEGORY_COLORS[scan.detectionCategory] || '#888',
                          color: CATEGORY_COLORS[scan.detectionCategory] || '#888'
                        }}
                      >
                        {((scan.confidence || 0) * 100).toFixed(0)}% confidence
                      </Badge>
                      {scan.wasAccurate !== null && (
                        <Badge variant={scan.wasAccurate ? "default" : "destructive"}>
                          {scan.wasAccurate ? "Verified" : "Incorrect"}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No recent scans</p>
              <p className="text-sm">Scan results will appear here once you start analyzing crops</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
