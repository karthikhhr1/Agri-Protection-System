import { useAnimalDetections, useDeterrentSettings, useUpdateDeterrentSettings } from "@/hooks/use-agri";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Volume2, 
  VolumeX,
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Activity,
  Radio,
  Gauge,
  Clock,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Deterrent() {
  const { t, formatTime, formatNumber } = useLanguage();
  const { data: detections, isLoading: detectionsLoading } = useAnimalDetections();
  const { data: settings, isLoading: settingsLoading } = useDeterrentSettings();
  const updateSettings = useUpdateDeterrentSettings();

  const recentDetections = detections?.slice(0, 10) || [];
  const activeAlerts = detections?.filter((d: any) => d.status === 'detected' && !d.deterrentActivated).length || 0;
  const deterredCount = detections?.filter((d: any) => d.deterrentActivated).length || 0;

  const handleToggleSystem = (enabled: boolean) => {
    updateSettings.mutate({ isEnabled: enabled });
  };

  const handleVolumeChange = (value: number[]) => {
    updateSettings.mutate({ volume: value[0] });
  };

  const handleDistanceChange = (value: number[]) => {
    updateSettings.mutate({ activationDistance: value[0] });
  };

  const handleSoundTypeChange = (value: string) => {
    updateSettings.mutate({ soundType: value });
  };

  const getAnimalIcon = (type: string) => {
    const icons: Record<string, string> = {
      'wild_boar': '🐗',
      'deer': '🦌',
      'monkey': '🐒',
      'elephant': '🐘',
      'peacock': '🦚',
      'snake': '🐍',
      'dog': '🐕',
      'cat': '🐈',
    };
    return icons[type] || '🐾';
  };

  const getAnimalName = (type: string) => {
    const names: Record<string, string> = {
      'wild_boar': t('deterrent.animalWildBoar'),
      'deer': t('deterrent.animalDeer'),
      'monkey': t('deterrent.animalMonkey'),
      'elephant': t('deterrent.animalElephant'),
      'peacock': t('deterrent.animalPeacock'),
      'snake': t('deterrent.animalSnake'),
      'dog': t('deterrent.animalDog'),
      'cat': t('deterrent.animalCat'),
    };
    return names[type] || type;
  };

  const isLoading = detectionsLoading || settingsLoading;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-background/50 min-h-screen">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-primary flex items-center gap-3">
          <Shield className="w-8 h-8" />
          {t('deterrent.pageTitle')}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">{t('deterrent.pageSubtitle')}</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatusCard
          title={t('deterrent.systemStatus')}
          value={settings?.isEnabled ? t('deterrent.on') : t('deterrent.off')}
          icon={settings?.isEnabled ? ShieldCheck : ShieldAlert}
          color={settings?.isEnabled ? "green" : "gray"}
        />
        <StatusCard
          title={t('deterrent.activeAlerts')}
          value={activeAlerts}
          icon={AlertTriangle}
          color={activeAlerts > 0 ? "orange" : "green"}
        />
        <StatusCard
          title={t('deterrent.animalsDeterred')}
          value={deterredCount}
          icon={Shield}
          color="blue"
        />
        <StatusCard
          title={t('deterrent.activationRange')}
          value={`${settings?.activationDistance || 50}m`}
          icon={Target}
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  {t('deterrent.liveDetections')}
                </CardTitle>
                <CardDescription className="text-sm">{t('deterrent.autoProtection')}</CardDescription>
              </div>
              {settings?.isEnabled && (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20 animate-pulse">
                  <Radio className="w-3 h-3 mr-1" />
                  {t('deterrent.monitoring')}
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
                          : detection.status === 'detected'
                            ? "bg-orange-500/5 border-orange-500/20"
                            : "bg-muted/30 border-muted"
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
                              {formatNumber(detection.distance)}m {t('deterrent.away')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(detection.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {detection.deterrentActivated ? (
                          <Badge className="bg-green-500 text-white">
                            <Volume2 className="w-3 h-3 mr-1" />
                            {t('deterrent.soundPlayed')}
                          </Badge>
                        ) : detection.status === 'detected' ? (
                          <Badge variant="outline" className="border-orange-500/50 text-orange-600">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {t('deterrent.detected')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            {t('deterrent.animalLeft')}
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

        <div className="space-y-4">
          <Card className="shadow-lg border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  {t('deterrent.systemControl')}
                </span>
                <Switch
                  checked={settings?.isEnabled || false}
                  onCheckedChange={handleToggleSystem}
                  disabled={updateSettings.isPending}
                  data-testid="switch-deterrent-power"
                />
              </CardTitle>
              <CardDescription className="text-xs">
                {settings?.isEnabled ? t('deterrent.systemActive') : t('deterrent.systemInactive')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                {t('deterrent.triggerDistance')}
              </CardTitle>
              <CardDescription className="text-xs">{t('deterrent.triggerDistanceDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">{settings?.activationDistance || 50}m</span>
                <Badge variant="outline">{t('deterrent.fromCrops')}</Badge>
              </div>
              <Slider
                value={[settings?.activationDistance || 50]}
                onValueChange={handleDistanceChange}
                min={10}
                max={200}
                step={10}
                disabled={updateSettings.isPending}
                data-testid="slider-activation-distance"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10m</span>
                <span>200m</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-primary" />
                {t('deterrent.volume')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">{settings?.volume || 70}%</span>
                {(settings?.volume || 70) > 80 && (
                  <Badge variant="destructive" className="text-xs">{t('deterrent.loud')}</Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <VolumeX className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={[settings?.volume || 70]}
                  onValueChange={handleVolumeChange}
                  min={0}
                  max={100}
                  step={5}
                  disabled={updateSettings.isPending}
                  className="flex-1"
                  data-testid="slider-volume"
                />
                <Volume2 className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Gauge className="w-5 h-5 text-primary" />
                {t('deterrent.soundType')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={settings?.soundType || "alarm"}
                onValueChange={handleSoundTypeChange}
                disabled={updateSettings.isPending}
              >
                <SelectTrigger data-testid="select-sound-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alarm">{t('deterrent.alarm')}</SelectItem>
                  <SelectItem value="ultrasonic">{t('deterrent.ultrasonic')}</SelectItem>
                  <SelectItem value="predator">{t('deterrent.predator')}</SelectItem>
                  <SelectItem value="custom">{t('deterrent.custom')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">{t('deterrent.soundTypeDesc')}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="shadow-lg bg-primary/5 border-primary/20">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{t('deterrent.howItWorks')}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('deterrent.howItWorksDesc')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  const colorClasses: Record<string, string> = {
    green: "bg-green-500/10 text-green-600 border-green-500/20",
    orange: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    gray: "bg-muted text-muted-foreground border-muted",
    primary: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <Card className={cn("shadow-md border", colorClasses[color] || colorClasses.primary)}>
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-medium truncate">{title}</span>
        </div>
        <p className="text-xl md:text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
