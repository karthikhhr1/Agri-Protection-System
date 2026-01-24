import { useAnimalDetections, useDeterrentSettings, useUpdateDeterrentSettings, useAutomationStatus } from "@/hooks/use-agri";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Volume2, 
  Shield,
  ShieldCheck,
  Activity,
  Radio,
  Clock,
  Target,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { indianWildlifeFrequencies } from "@shared/animalFrequencies";

export default function Deterrent() {
  const { t, formatTime, formatNumber } = useLanguage();
  const { data: detections, isLoading: detectionsLoading } = useAnimalDetections();
  const { data: settings, isLoading: settingsLoading } = useDeterrentSettings();
  const { data: automationStatus } = useAutomationStatus();
  const updateSettings = useUpdateDeterrentSettings();

  const recentDetections = detections?.slice(0, 10) || [];
  const deterredCount = detections?.filter((d: any) => d.deterrentActivated).length || 0;
  const totalDetections = detections?.length || 0;

  const handleToggleSystem = (enabled: boolean) => {
    updateSettings.mutate({ isEnabled: enabled, autoActivate: enabled });
  };

  const getAnimalIcon = (type: string) => {
    const icons: Record<string, string> = {
      'wild_boar': '🐗',
      'deer': '🦌',
      'monkey': '🐒',
      'elephant': '🐘',
      'peacock': '🦚',
      'snake': '🐍',
      'nilgai': '🦬',
      'jackal': '🦊',
      'porcupine': '🦔',
      'rat': '🐀',
      'parrot': '🦜',
      'crow': '🐦‍⬛',
    };
    return icons[type] || '🐾';
  };

  const getAnimalName = (type: string) => {
    const animal = indianWildlifeFrequencies.find(a => a.id === type);
    return animal?.name || type.replace('_', ' ');
  };

  const getAnimalFrequency = (type: string) => {
    const animal = indianWildlifeFrequencies.find(a => a.id === type);
    return animal?.optimalFrequency || 15;
  };

  const isLoading = detectionsLoading || settingsLoading;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-background/50 min-h-screen">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-primary flex items-center gap-3">
          <Shield className="w-8 h-8" />
          {t('deterrent.pageTitle')}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">{t('deterrent.simpleDesc')}</p>
      </header>

      {/* Simple On/Off Control */}
      <Card className={cn(
        "shadow-xl border-2 transition-all",
        settings?.isEnabled 
          ? "border-green-500/50 bg-green-500/5" 
          : "border-muted"
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-all",
                settings?.isEnabled 
                  ? "bg-green-500/20 animate-pulse" 
                  : "bg-muted"
              )}>
                {settings?.isEnabled ? (
                  <Zap className="w-8 h-8 text-green-600" />
                ) : (
                  <Shield className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold">
                  {settings?.isEnabled ? t('deterrent.systemOn') : t('deterrent.systemOff')}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {settings?.isEnabled 
                    ? t('deterrent.autoProtectionActive')
                    : t('deterrent.turnOnToProtect')}
                </p>
              </div>
            </div>
            <Switch
              checked={settings?.isEnabled || false}
              onCheckedChange={handleToggleSystem}
              disabled={updateSettings.isPending}
              className="scale-150"
              data-testid="switch-deterrent-power"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-lg bg-green-500/5 border-green-500/20">
          <CardContent className="p-4 text-center">
            <ShieldCheck className="w-8 h-8 mx-auto text-green-600 mb-2" />
            <p className="text-3xl font-bold text-green-600">{deterredCount}</p>
            <p className="text-sm text-muted-foreground">{t('deterrent.animalsDeterred')}</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <Activity className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-3xl font-bold text-primary">{totalDetections}</p>
            <p className="text-sm text-muted-foreground">{t('deterrent.totalDetections')}</p>
          </CardContent>
        </Card>
      </div>

      {/* How it works - Simple explanation */}
      <Card className="shadow-lg border-primary/20 bg-primary/5">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{t('deterrent.fullyAutomatic')}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('deterrent.fullyAutomaticDesc')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Detections */}
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                {t('deterrent.recentActivity')}
              </CardTitle>
              <CardDescription className="text-sm">{t('deterrent.whatHappened')}</CardDescription>
            </div>
            {settings?.isEnabled && (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20 animate-pulse">
                <Radio className="w-3 h-3 mr-1" />
                {t('deterrent.watching')}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {recentDetections.length === 0 ? (
            <div className="py-12 text-center">
              <ShieldCheck className="w-16 h-16 mx-auto text-green-500/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">{t('deterrent.noAnimals')}</p>
              <p className="text-sm text-muted-foreground/70 mt-1">{t('deterrent.fieldSafe')}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              <AnimatePresence>
                {recentDetections.map((detection: any, index: number) => (
                  <motion.div
                    key={detection.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all",
                      detection.deterrentActivated 
                        ? "bg-green-500/5 border-green-500/20" 
                        : "bg-orange-500/5 border-orange-500/20"
                    )}
                    data-testid={`detection-${detection.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{getAnimalIcon(detection.animalType)}</div>
                      <div>
                        <p className="font-semibold text-foreground">{getAnimalName(detection.animalType)}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {formatNumber(detection.distance)}m
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(detection.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {detection.deterrentActivated ? (
                        <>
                          <Badge className="bg-green-500 text-white">
                            <Volume2 className="w-3 h-3 mr-1" />
                            {t('deterrent.scaredAway')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {getAnimalFrequency(detection.animalType)} kHz
                          </span>
                        </>
                      ) : (
                        <Badge variant="outline" className="border-orange-500/50 text-orange-600">
                          {t('deterrent.detected')}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
