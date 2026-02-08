import { useState, useRef, useCallback, useEffect } from "react";
import { useAnimalDetections, useDeterrentSettings, useUpdateDeterrentSettings, useAutomationStatus, useSimulateCameraDetection } from "@/hooks/use-agri";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Volume2,
  VolumeX,
  Shield,
  ShieldCheck,
  Activity,
  Radio,
  Clock,
  Target,
  Zap,
  Settings,
  Camera,
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
  const simulateCamera = useSimulateCameraDetection();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastPlayedRef = useRef<number>(0);

  const recentDetections = detections?.slice(0, 10) || [];
  const deterredCount = detections?.filter((d: any) => d.deterrentActivated).length || 0;
  const totalDetections = detections?.length || 0;

  const handleToggleSystem = (enabled: boolean) => {
    updateSettings.mutate({ isEnabled: enabled, autoActivate: enabled });
  };

  // Web Audio: play a tone at the given frequency
  const playDeterrentTone = useCallback((frequencyKHz: number, durationMs: number = 2000) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequencyKHz * 1000, ctx.currentTime);
      gainNode.gain.setValueAtTime((settings?.volume || 70) / 100, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + durationMs / 1000);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // Web Audio not available
    }
  }, [soundEnabled, settings?.volume]);

  // Watch for new deterred detections and play sound
  useEffect(() => {
    if (!soundEnabled || !detections?.length) return;
    const latestDeterred = detections.find((d: any) => d.deterrentActivated);
    if (latestDeterred && latestDeterred.id !== lastPlayedRef.current) {
      lastPlayedRef.current = latestDeterred.id;
      const freq = getAnimalFrequency(latestDeterred.animalType);
      playDeterrentTone(freq);
    }
  }, [detections, soundEnabled, playDeterrentTone]);

  const getAnimalIcon = (type: string) => {
    const icons: Record<string, string> = {
      'wild_boar': '\u{1F417}',
      'deer': '\u{1F98C}',
      'monkey': '\u{1F412}',
      'elephant': '\u{1F418}',
      'peacock': '\u{1F99A}',
      'snake': '\u{1F40D}',
      'nilgai': '\u{1F9AC}',
      'jackal': '\u{1F98A}',
      'porcupine': '\u{1F994}',
      'rat': '\u{1F400}',
      'parrot': '\u{1F99C}',
      'crow': '\u{1F426}',
    };
    return icons[type] || '\u{1F43E}';
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

      {/* Stats + Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
        <Card className="shadow-lg">
          <CardContent className="p-4 text-center">
            <Button
              onClick={() => simulateCamera.mutate()}
              disabled={simulateCamera.isPending || !settings?.isEnabled}
              variant="outline"
              className="w-full gap-2"
              data-testid="button-simulate-camera"
            >
              <Camera className="w-4 h-4" />
              {t('deterrent.simulateCamera') || 'Simulate Camera'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              {t('deterrent.simulateCameraDesc') || 'Test with random detection'}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center gap-2">
              {soundEnabled ? (
                <Volume2 className="w-8 h-8 text-green-600" />
              ) : (
                <VolumeX className="w-8 h-8 text-muted-foreground" />
              )}
              <Switch
                checked={soundEnabled}
                onCheckedChange={(checked) => {
                  setSoundEnabled(checked);
                  // Initialize AudioContext on user interaction
                  if (checked && !audioCtxRef.current) {
                    audioCtxRef.current = new AudioContext();
                  }
                }}
                data-testid="switch-sound-output"
              />
              <p className="text-xs text-muted-foreground">
                {t('deterrent.soundOutput') || 'Sound Output'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Panel */}
      <Card className="shadow-lg">
        <CardHeader
          className="border-b bg-muted/20 cursor-pointer"
          onClick={() => setShowSettings(!showSettings)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5 text-muted-foreground" />
              {t('deterrent.settings') || 'Deterrent Settings'}
            </CardTitle>
            <Badge variant="outline">{showSettings ? 'Hide' : 'Show'}</Badge>
          </div>
        </CardHeader>
        {showSettings && (
          <CardContent className="p-5 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-medium">{t('deterrent.volume') || 'Volume'}</Label>
                <Badge variant="outline">{settings?.volume || 70}%</Badge>
              </div>
              <Slider
                value={[settings?.volume || 70]}
                onValueCommit={(value) => updateSettings.mutate({ volume: value[0] })}
                min={0}
                max={100}
                step={5}
                disabled={updateSettings.isPending}
                data-testid="slider-volume"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-medium">{t('deterrent.soundType') || 'Sound Type'}</Label>
              <Select
                value={settings?.soundType || 'alarm'}
                onValueChange={(v: any) => updateSettings.mutate({ soundType: v })}
              >
                <SelectTrigger data-testid="select-sound-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alarm">{t('deterrent.soundAlarm') || 'Alarm'}</SelectItem>
                  <SelectItem value="ultrasonic">{t('deterrent.soundUltrasonic') || 'Ultrasonic'}</SelectItem>
                  <SelectItem value="predator">{t('deterrent.soundPredator') || 'Predator Call'}</SelectItem>
                  <SelectItem value="custom">{t('deterrent.soundCustom') || 'Custom'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-medium">{t('deterrent.activationDistance') || 'Activation Distance'}</Label>
                <Badge variant="outline">{settings?.activationDistance || 50}m</Badge>
              </div>
              <Slider
                value={[settings?.activationDistance || 50]}
                onValueCommit={(value) => updateSettings.mutate({ activationDistance: value[0] })}
                min={10}
                max={200}
                step={10}
                disabled={updateSettings.isPending}
                data-testid="slider-activation-distance"
              />
              <p className="text-xs text-muted-foreground">
                {t('deterrent.activationDistanceDesc') || 'Deterrent activates when animal is within this range'}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">{t('deterrent.autoActivate') || 'Auto Activate'}</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('deterrent.autoActivateDesc') || 'Automatically trigger deterrent on detection'}
                </p>
              </div>
              <Switch
                checked={settings?.autoActivate ?? true}
                onCheckedChange={(checked) => updateSettings.mutate({ autoActivate: checked })}
                disabled={updateSettings.isPending}
                data-testid="switch-auto-activate"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* How it works */}
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
