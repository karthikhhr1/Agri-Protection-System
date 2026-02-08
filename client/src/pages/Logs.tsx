import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Activity,
  Droplets,
  Volume2,
  ScanEye,
  Shield,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { queryClient } from "@/lib/queryClient";
import type { ActivityLog } from "@shared/schema";
import { useState } from "react";

const actionIcons: Record<string, any> = {
  detection: ScanEye,
  irrigation: Droplets,
  deterrent: Volume2,
  system: Shield,
};

const actionColors: Record<string, string> = {
  detection: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  irrigation: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  deterrent: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  system: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

export default function Logs() {
  const { t, formatDate, formatTime } = useLanguage();
  const [filter, setFilter] = useState<string | null>(null);

  const { data: logs, isLoading, refetch } = useQuery<ActivityLog[]>({
    queryKey: ["/api/logs"],
  });

  const filteredLogs = filter 
    ? logs?.filter(l => l.action === filter)
    : logs;

  const actionTypes = ['detection', 'irrigation', 'deterrent', 'system'];

  const getActionCount = (action: string) => logs?.filter(l => l.action === action).length || 0;

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 bg-background/50 min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-primary">{t('logs.title')}</h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg mt-1">{t('logs.subtitle')}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => refetch()} 
          className="gap-2 whitespace-nowrap" 
          data-testid="button-refresh-logs"
        >
          <RefreshCw className="w-4 h-4" />
          {t('common.refresh')}
        </Button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {actionTypes.map((action) => {
          const Icon = actionIcons[action];
          const isSelected = filter === action;
          return (
            <button
              key={action}
              onClick={() => setFilter(isSelected ? null : action)}
              className={`p-3 md:p-4 rounded-lg md:rounded-xl border transition-all ${
                isSelected 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50 bg-card'
              }`}
              data-testid={`button-filter-${action}`}
            >
              <Icon className={`w-6 md:w-8 h-6 md:h-8 mx-auto mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="font-medium text-xs md:text-sm capitalize">{t(`logs.${action}`)}</p>
              <p className="text-xl md:text-2xl font-bold text-primary">{getActionCount(action)}</p>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Activity className="w-4 md:w-5 h-4 md:h-5 text-primary flex-shrink-0" />
            <span className="truncate">{filter ? t(`logs.${filter}`) : t('logs.allActions')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {isLoading ? (
            <p className="text-muted-foreground text-sm md:text-base">{t('common.loading')}</p>
          ) : filteredLogs?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm md:text-base">{t('logs.noLogs')}</p>
          ) : (
            <div className="space-y-2 md:space-y-3 max-h-[600px] overflow-y-auto pr-1 md:pr-2">
              {filteredLogs?.map((log, index) => {
                const Icon = actionIcons[log.action] || FileText;
                return (
                  <motion.div
                    key={log.id}
                    initial={ { opacity: 0, x: -20 } }
                    animate={ { opacity: 1, x: 0 } }
                    transition={ { delay: index * 0.05 } }
                    className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg md:rounded-xl bg-muted/30 border border-muted"
                  >
                    <div className={`w-9 md:w-10 h-9 md:h-10 rounded-lg flex items-center justify-center shrink-0 ${actionColors[log.action] || 'bg-muted'}`}>
                      <Icon className="w-4 md:w-5 h-4 md:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-1">
                        <Badge variant="outline" className={`${actionColors[log.action]} text-xs md:text-sm`}>
                          {t(`logs.${log.action}`)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(log.createdAt, { month: 'short', day: 'numeric' })} {formatTime(log.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-foreground">{log.details}</p>
                      {log.metadata != null && (
                        <pre className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded overflow-x-auto max-w-full">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
