import { useReports, useIrrigationHistory, useDeleteReport } from "@/hooks/use-agri";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Droplets, 
  AlertTriangle, 
  Leaf, 
  Clock,
  Trash2,
  ChevronRight,
  TreePine,
  Sun,
  Wind
} from "lucide-react";
import { motion } from "framer-motion";
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
import { useLanguage } from "@/lib/i18n";

function NatureFrame() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Central bright glow - light mode */}
      <div className="absolute inset-0 dark:hidden" 
           style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(240,253,244,0.4) 40%, transparent 70%)' }} />
      {/* Central dark glow - dark mode */}
      <div className="absolute inset-0 hidden dark:block" 
           style={{ background: 'radial-gradient(ellipse at center, rgba(20,20,20,0.5) 0%, rgba(20,83,45,0.15) 40%, transparent 70%)' }} />
      
      {/* Top left corner leaves */}
      <svg className="absolute -top-8 -left-8 w-64 h-64 text-green-500/60 dark:text-green-400/40" viewBox="0 0 200 200" fill="currentColor">
        <ellipse cx="30" cy="50" rx="45" ry="25" transform="rotate(-45 30 50)" opacity="0.7" />
        <ellipse cx="60" cy="30" rx="40" ry="20" transform="rotate(-30 60 30)" opacity="0.6" />
        <ellipse cx="90" cy="55" rx="35" ry="18" transform="rotate(-50 90 55)" opacity="0.5" />
        <ellipse cx="40" cy="85" rx="38" ry="22" transform="rotate(-60 40 85)" opacity="0.6" />
        <ellipse cx="15" cy="100" rx="30" ry="16" transform="rotate(-70 15 100)" opacity="0.4" />
        <ellipse cx="75" cy="90" rx="32" ry="17" transform="rotate(-40 75 90)" opacity="0.45" />
        <ellipse cx="110" cy="40" rx="28" ry="14" transform="rotate(-25 110 40)" opacity="0.35" />
      </svg>
      
      {/* Top right corner leaves */}
      <svg className="absolute -top-8 -right-8 w-64 h-64 text-green-500/60 dark:text-green-400/40" viewBox="0 0 200 200" fill="currentColor">
        <ellipse cx="170" cy="50" rx="45" ry="25" transform="rotate(45 170 50)" opacity="0.7" />
        <ellipse cx="140" cy="30" rx="40" ry="20" transform="rotate(30 140 30)" opacity="0.6" />
        <ellipse cx="110" cy="55" rx="35" ry="18" transform="rotate(50 110 55)" opacity="0.5" />
        <ellipse cx="160" cy="85" rx="38" ry="22" transform="rotate(60 160 85)" opacity="0.6" />
        <ellipse cx="185" cy="100" rx="30" ry="16" transform="rotate(70 185 100)" opacity="0.4" />
        <ellipse cx="125" cy="90" rx="32" ry="17" transform="rotate(40 125 90)" opacity="0.45" />
        <ellipse cx="90" cy="40" rx="28" ry="14" transform="rotate(25 90 40)" opacity="0.35" />
      </svg>
      
      {/* Bottom left corner leaves */}
      <svg className="absolute -bottom-8 -left-8 w-56 h-56 text-green-600/50 dark:text-green-500/30" viewBox="0 0 200 200" fill="currentColor">
        <ellipse cx="30" cy="150" rx="42" ry="24" transform="rotate(45 30 150)" opacity="0.6" />
        <ellipse cx="55" cy="170" rx="38" ry="20" transform="rotate(30 55 170)" opacity="0.5" />
        <ellipse cx="80" cy="145" rx="32" ry="16" transform="rotate(55 80 145)" opacity="0.45" />
        <ellipse cx="20" cy="120" rx="28" ry="14" transform="rotate(60 20 120)" opacity="0.4" />
      </svg>
      
      {/* Bottom right corner leaves */}
      <svg className="absolute -bottom-8 -right-8 w-56 h-56 text-green-600/50 dark:text-green-500/30" viewBox="0 0 200 200" fill="currentColor">
        <ellipse cx="170" cy="150" rx="42" ry="24" transform="rotate(-45 170 150)" opacity="0.6" />
        <ellipse cx="145" cy="170" rx="38" ry="20" transform="rotate(-30 145 170)" opacity="0.5" />
        <ellipse cx="120" cy="145" rx="32" ry="16" transform="rotate(-55 120 145)" opacity="0.45" />
        <ellipse cx="180" cy="120" rx="28" ry="14" transform="rotate(-60 180 120)" opacity="0.4" />
      </svg>
      
      {/* Side accent leaves - left */}
      <svg className="absolute top-1/3 -left-4 w-32 h-48 text-green-500/40 dark:text-green-400/25" viewBox="0 0 100 150" fill="currentColor">
        <ellipse cx="20" cy="50" rx="30" ry="15" transform="rotate(-60 20 50)" opacity="0.5" />
        <ellipse cx="15" cy="80" rx="25" ry="12" transform="rotate(-55 15 80)" opacity="0.4" />
        <ellipse cx="25" cy="110" rx="28" ry="14" transform="rotate(-65 25 110)" opacity="0.45" />
      </svg>
      
      {/* Side accent leaves - right */}
      <svg className="absolute top-1/3 -right-4 w-32 h-48 text-green-500/40 dark:text-green-400/25" viewBox="0 0 100 150" fill="currentColor">
        <ellipse cx="80" cy="50" rx="30" ry="15" transform="rotate(60 80 50)" opacity="0.5" />
        <ellipse cx="85" cy="80" rx="25" ry="12" transform="rotate(55 85 80)" opacity="0.4" />
        <ellipse cx="75" cy="110" rx="28" ry="14" transform="rotate(65 75 110)" opacity="0.45" />
      </svg>
      
      {/* Subtle vignette effect */}
      <div className="absolute inset-0 dark:hidden" 
           style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(34,197,94,0.08) 100%)' }} />
      <div className="absolute inset-0 hidden dark:block" 
           style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(34,197,94,0.15) 100%)' }} />
    </div>
  );
}

export default function Dashboard() {
  const { t, formatTime, formatDate } = useLanguage();
  const { data: reports } = useReports();
  const { data: readings } = useIrrigationHistory();
  const deleteMutation = useDeleteReport();

  const latestReading = readings?.[0];
  const criticalReports = reports?.filter((r: any) => r.severity === "critical" || r.severity === "high").length || 0;
  const totalScans = reports?.length || 0;
  const healthyScans = reports?.filter((r: any) => r.severity === "none" || r.severity === "safe" || r.severity === "low").length || 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const slideUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const slideIn = {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-green-50/50 via-background to-green-50/30 dark:from-green-950/20 dark:via-background dark:to-green-950/10 overflow-hidden">
      <NatureFrame />

      <motion.div 
        className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.header 
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/8 via-green-500/4 to-transparent p-6 md:p-8 lg:p-10"
          variants={slideUp}
        >
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3">
              <motion.div 
                className="flex items-center gap-3 flex-wrap"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="p-2 bg-green-500/10 rounded-xl">
                  <TreePine className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-green-600/70">
                  {t('dashboard.commandCenter')}
                </span>
              </motion.div>
              
              <motion.h1 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {t('dashboard.title')}
              </motion.h1>
              
              <motion.p 
                className="text-muted-foreground text-sm md:text-base max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                {t('dashboard.subtitle')}
              </motion.p>
            </div>

            <motion.div 
              className="flex items-center gap-4 px-5 py-3 bg-card/80 backdrop-blur-sm rounded-xl border border-primary/10 shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                <span className="text-sm font-medium text-foreground">{t('dashboard.activeUplink')}</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <span className="text-xs text-muted-foreground">{formatDate(new Date())}</span>
            </motion.div>
          </div>
        </motion.header>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4"
          variants={containerVariants}
        >
          <motion.div variants={slideIn}>
            <StatsCard 
              title={t('dashboard.hydration')} 
              value={`${latestReading?.soilMoisture || 0}%`}
              icon={Droplets}
              color="blue"
            />
          </motion.div>
          <motion.div variants={slideIn}>
            <StatsCard 
              title={t('dashboard.temperature')} 
              value={`${latestReading?.temperature || 24}°C`}
              icon={Sun}
              color="orange"
            />
          </motion.div>
          <motion.div variants={slideIn}>
            <StatsCard 
              title={t('dashboard.humidity')} 
              value={`${latestReading?.ambientHumidity || 48}%`}
              icon={Wind}
              color="sky"
            />
          </motion.div>
          <motion.div variants={slideIn}>
            <StatsCard 
              title={t('dashboard.pathology')} 
              value={criticalReports}
              icon={AlertTriangle}
              color={criticalReports > 0 ? "red" : "green"}
            />
          </motion.div>
          <motion.div variants={slideIn} className="col-span-2 md:col-span-1">
            <StatsCard 
              title={t('dashboard.vitality')} 
              value={`${latestReading?.healthScore || 94}%`}
              icon={Activity}
              color="green"
            />
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <motion.div variants={slideUp} className="lg:col-span-2">
            <Card className="overflow-hidden border-0 shadow-lg bg-card rounded-2xl">
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap border-b bg-green-500/5 p-5">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="p-2 bg-green-500/10 rounded-xl">
                    <TreePine className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">{t('dashboard.farmHealth')}</CardTitle>
                    <CardDescription className="text-sm">{t('dashboard.systemStatus')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-2xl" data-testid="display-farm-vitality">
                    <div className="relative w-28 h-28 md:w-32 md:h-32">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                        <motion.circle 
                          cx="50" cy="50" r="42" fill="none" 
                          stroke="currentColor" strokeWidth="8" 
                          className="text-green-500"
                          strokeLinecap="round"
                          strokeDasharray={264}
                          initial={{ strokeDashoffset: 264 }}
                          animate={{ strokeDashoffset: 264 - (264 * (latestReading?.healthScore || 94) / 100) }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span 
                          className="text-2xl md:text-3xl font-bold text-foreground"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8, duration: 0.5 }}
                        >
                          {latestReading?.healthScore || 94}%
                        </motion.span>
                        <span className="text-xs text-muted-foreground">{t('dashboard.vitality')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl">
                    <div className="relative w-28 h-28 md:w-32 md:h-32">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                        <motion.circle 
                          cx="50" cy="50" r="42" fill="none" 
                          stroke="currentColor" strokeWidth="8" 
                          className="text-blue-500"
                          strokeLinecap="round"
                          strokeDasharray={264}
                          initial={{ strokeDashoffset: 264 }}
                          animate={{ strokeDashoffset: 264 - (264 * (latestReading?.soilMoisture || 65) / 100) }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.7 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span 
                          className="text-2xl md:text-3xl font-bold text-foreground"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1, duration: 0.5 }}
                        >
                          {latestReading?.soilMoisture || 65}%
                        </motion.span>
                        <span className="text-xs text-muted-foreground">{t('dashboard.moisture')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 p-4" data-testid="display-system-status">
                    <motion.div 
                      className="flex items-center gap-3 flex-wrap p-3 bg-green-500/10 rounded-xl"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9, duration: 0.4 }}
                      data-testid="status-irrigation"
                    >
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{t('irrigation.title')}</p>
                        <p className="text-xs text-muted-foreground">{t('dashboard.activeUplink')}</p>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="flex items-center gap-3 flex-wrap p-3 bg-orange-500/10 rounded-xl"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1, duration: 0.4 }}
                      data-testid="status-deterrent"
                    >
                      <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{t('deterrent.title')}</p>
                        <p className="text-xs text-muted-foreground">{t('dashboard.activeUplink')}</p>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="flex items-center gap-3 flex-wrap p-3 bg-primary/10 rounded-xl"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.3, duration: 0.4 }}
                      data-testid="status-analysis"
                    >
                      <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{t('analysis.title')}</p>
                        <p className="text-xs text-muted-foreground">{totalScans} {t('analysis.scans')}, {healthyScans} {t('severity.safe')}</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={slideUp}>
            <Card className="h-full flex flex-col border-0 shadow-lg bg-card rounded-2xl overflow-hidden">
              <CardHeader className="bg-green-500/5 p-5 border-b">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="p-2 bg-green-500/10 rounded-xl">
                      <Leaf className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">{t('dashboard.pathologyFeed')}</CardTitle>
                      <CardDescription className="text-xs">{t('dashboard.intelligenceStream')}</CardDescription>
                    </div>
                  </div>
                  <Link href="/analysis">
                    <Button size="icon" variant="ghost" className="rounded-xl" data-testid="button-view-analysis">
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-auto p-0">
                <div className="divide-y divide-border/50">
                  {reports?.slice(0, 5).map((report: any, i: number) => (
                    <motion.div 
                      key={report.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                      className="group flex items-center flex-wrap gap-4 p-4 hover-elevate"
                    >
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-border/50 shadow-sm">
                          <img src={report.imageUrl} alt="scan" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <p className="font-medium text-sm text-foreground truncate">
                            {report.cropType && report.cropType !== 'unknown' ? report.cropType : t('dashboard.specimen')}
                          </p>
                          <SeverityBadge severity={report.severity} />
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                          <Clock className="w-3 h-3" /> {formatTime(report.createdAt)}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-lg" data-testid={`button-delete-report-${report.id}`}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl border-0 shadow-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-bold">{t('dashboard.discardIntelligence')}</AlertDialogTitle>
                              <AlertDialogDescription>{t('dashboard.purgeDescription')}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2">
                              <AlertDialogCancel className="rounded-xl">{t('dashboard.retain')}</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteMutation.mutate(report.id)} 
                                className="rounded-xl"
                              >
                                {t('dashboard.purgeRecord')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </motion.div>
                  ))}
                  
                  {(!reports || reports.length === 0) && (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <Leaf className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">{t('analysis.noReports')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <div className="p-4 bg-muted/20 border-t">
                <Link href="/analysis">
                  <Button className="w-full rounded-xl font-medium" data-testid="button-start-scanning">
                    <Leaf className="w-4 h-4 mr-2" />
                    {t('dashboard.commenceScanning')}
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={containerVariants}
        >
          <motion.div variants={slideUp}>
            <QuickActionCard 
              icon={TreePine}
              title={t('fieldSummary.title')}
              description={t('fieldSummary.subtitle')}
              href="/field-summary"
              color="green"
            />
          </motion.div>
          <motion.div variants={slideUp}>
            <QuickActionCard 
              icon={Droplets}
              title={t('irrigation.title')}
              description={t('irrigation.subtitle')}
              href="/irrigation"
              color="blue"
            />
          </motion.div>
          <motion.div variants={slideUp}>
            <QuickActionCard 
              icon={Activity}
              title={t('deterrent.title')}
              description={t('deterrent.subtitle')}
              href="/deterrent"
              color="orange"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  const colorConfig: Record<string, { bg: string; icon: string }> = {
    blue: { bg: "bg-blue-500/10", icon: "text-blue-500" },
    orange: { bg: "bg-orange-500/10", icon: "text-orange-500" },
    sky: { bg: "bg-sky-500/10", icon: "text-sky-500" },
    red: { bg: "bg-red-500/10", icon: "text-red-500" },
    green: { bg: "bg-green-500/10", icon: "text-green-500" },
  };

  const config = colorConfig[color] || colorConfig.green;

  return (
    <Card className={`relative overflow-visible border-0 shadow-lg rounded-2xl ${config.bg} group hover-elevate`} data-testid={`card-stats-${color}`}>
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className={`p-2 rounded-xl ${config.bg}`}>
            <Icon className={`w-4 h-4 md:w-5 md:h-5 ${config.icon}`} />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{value}</p>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({ icon: Icon, title, description, href, color }: { icon: any; title: string; description: string; href: string; color: string }) {
  const colorConfig: Record<string, { bg: string; icon: string }> = {
    green: { bg: "bg-green-500/10", icon: "text-green-600" },
    blue: { bg: "bg-blue-500/10", icon: "text-blue-600" },
    orange: { bg: "bg-orange-500/10", icon: "text-orange-600" },
  };

  const config = colorConfig[color] || colorConfig.green;

  return (
    <Link href={href}>
      <Card className={`group cursor-pointer border-0 shadow-lg rounded-2xl ${config.bg} hover-elevate`} data-testid={`card-quick-action-${color}`}>
        <CardContent className="p-5 flex items-center gap-4 flex-wrap">
          <div className={`p-3 rounded-xl bg-white/50 dark:bg-white/10`}>
            <Icon className={`w-6 h-6 ${config.icon}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{title}</h3>
            <p className="text-sm text-muted-foreground truncate">{description}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}

function SeverityBadge({ severity }: { severity?: string | null }) {
  const { t } = useLanguage();
  const config: Record<string, string> = {
    critical: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-blue-100 text-blue-700 border-blue-200",
    none: "bg-green-100 text-green-700 border-green-200",
    safe: "bg-green-100 text-green-700 border-green-200",
  };
  
  const severityKey = severity || 'safe';
  const translatedSeverity = t(`severity.${severityKey}`);
  
  return (
    <Badge className={`text-[10px] font-semibold px-2 py-0.5 border rounded-full ${config[severity || 'none'] || config.safe}`}>
      {translatedSeverity}
    </Badge>
  );
}
