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
  const { t } = useLanguage();
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
    <div className="p-6 space-y-8 bg-background/50 min-h-screen">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">{t('logs.title')}</h1>
          <p className="text-muted-foreground text-lg mt-1">{t('logs.subtitle')}</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} className="gap-2" data-testid="button-refresh-logs">
          <RefreshCw className="w-4 h-4" />
          {t('common.refresh')}
        </Button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actionTypes.map((action) => {
          const Icon = actionIcons[action];
          const isSelected = filter === action;
          return (
            <button
              key={action}
              onClick={() => setFilter(isSelected ? null : action)}
              className={`p-4 rounded-xl border transition-all ${
                isSelected 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50 bg-card'
              }`}
              data-testid={`button-filter-${action}`}
            >
              <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="font-medium text-sm capitalize">{t(`logs.${action}`)}</p>
              <p className="text-2xl font-bold text-primary">{getActionCount(action)}</p>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            {filter ? t(`logs.${filter}`) : t('logs.allActions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">{t('common.loading')}</p>
          ) : filteredLogs?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t('logs.noLogs')}</p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {filteredLogs?.map((log, index) => {
                const Icon = actionIcons[log.action] || FileText;
                return (
                  <motion.div
                    key={log.id}
                    initial={ { opacity: 0, x: -20 } }
                    animate={ { opacity: 1, x: 0 } }
                    transition={ { delay: index * 0.05 } }
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-muted"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${actionColors[log.action] || 'bg-muted'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={actionColors[log.action]}>
                          {log.action}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.createdAt!).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{log.details}</p>
                      {log.metadata && (
                        <pre className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded overflow-x-auto">
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
