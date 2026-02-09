import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { irrigationRequestSchema } from "@shared/routes";
import { useCalculateIrrigation, useIrrigationHistory, useIrrigationSettings, useUpdateIrrigationSettings } from "@/hooks/use-agri";
import { useLanguage } from "@/lib/i18n";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Droplets, ThermometerSun, History, Leaf, Settings, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

type FormValues = z.infer<typeof irrigationRequestSchema>;

export default function Irrigation() {
  const { t, formatDate, formatNumber, getLocale } = useLanguage();
  const { mutate: calculate, isPending } = useCalculateIrrigation();
  const { data: history } = useIrrigationHistory();
  const { data: settings } = useIrrigationSettings();
  const updateSettings = useUpdateIrrigationSettings();
  const [lastAdvice, setLastAdvice] = useState<string | null>(null);
  const [localThreshold, setLocalThreshold] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(irrigationRequestSchema),
    defaultValues: {
      soilMoisture: 50,
      humidity: 60,
    },
  });

  const onSubmit = (data: FormValues) => {
    calculate(data, {
      onSuccess: (res) => {
        setLastAdvice(res.irrigationAdvice);
      }
    });
  };

  useEffect(() => {
    setLocalThreshold(settings?.moistureThreshold ?? 30);
  }, [settings?.moistureThreshold]);

  // Check if latest reading needs irrigation
  const latestReading = history?.[0];
  const moistureThreshold = settings?.moistureThreshold ?? 30;
  const displayThreshold = localThreshold ?? moistureThreshold;
  const needsIrrigation = latestReading && settings?.isActive && !settings?.manualOverride
    && latestReading.soilMoisture < moistureThreshold;

  // Format data for chart with localized dates
  const locale = getLocale();
  const chartData = (history ?? [])
    .map((h) => ({
      date: new Date(h.createdAt ?? Date.now()).toLocaleDateString(locale, { month: "short", day: "numeric" }),
      moisture: h.soilMoisture,
      humidity: h.humidity,
    }))
    .slice(-10)
    .reverse();

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('irrigation.title')}</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          {t('irrigation.subtitle')}
        </p>
      </div>

      {/* Irrigation Alert Banner */}
      {needsIrrigation && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
        >
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-600">
              {t('irrigation.needsIrrigation') || 'Irrigation Needed!'}
            </p>
            <p className="text-sm text-muted-foreground">
              Soil moisture is {latestReading.soilMoisture}% (threshold: {moistureThreshold}%)
            </p>
          </div>
          <Badge className="bg-red-500 text-white shrink-0">
            {t('common.urgent') || 'Urgent'}
          </Badge>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
        {/* Left Column: Calculator + Settings */}
        <div className="lg:col-span-5 space-y-4 md:space-y-6">
          {/* Irrigation Settings Card */}
          <Card className="border-border shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Settings className="w-5 h-5 text-muted-foreground" />
                {t('irrigation.settings') || 'Irrigation Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">{t('irrigation.autoIrrigation') || 'Auto Irrigation'}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('irrigation.autoIrrigationDesc') || 'Enable automatic irrigation monitoring'}
                  </p>
                </div>
                <Switch
                  checked={settings?.isActive || false}
                  onCheckedChange={(checked) => updateSettings.mutate({ isActive: checked })}
                  disabled={updateSettings.isPending}
                  data-testid="switch-irrigation-active"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">{t('irrigation.moistureThreshold') || 'Moisture Threshold'}</Label>
                  <Badge variant="outline">{displayThreshold}%</Badge>
                </div>
                <Slider
                  value={[displayThreshold]}
                  onValueChange={(value) => setLocalThreshold(value[0])}
                  onValueCommit={(value) => updateSettings.mutate({ moistureThreshold: value[0] })}
                  min={10}
                  max={80}
                  step={5}
                  disabled={updateSettings.isPending}
                  data-testid="slider-moisture-threshold"
                />
                <p className="text-xs text-muted-foreground">
                  {t('irrigation.thresholdDesc') || 'Alert when soil moisture drops below this level'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">{t('irrigation.manualOverride') || 'Manual Override'}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('irrigation.manualOverrideDesc') || 'Disable automatic alerts temporarily'}
                  </p>
                </div>
                <Switch
                  checked={settings?.manualOverride || false}
                  onCheckedChange={(checked) => updateSettings.mutate({ manualOverride: checked })}
                  disabled={updateSettings.isPending}
                  data-testid="switch-manual-override"
                />
              </div>
            </CardContent>
          </Card>

          {/* Calculator */}
          <Card className="border-border shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Leaf className="w-5 h-5 text-primary" />
                {t('irrigation.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="soilMoisture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('irrigation.soilMoisture')} (%)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Droplets className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                            <Input type="number" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="humidity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('irrigation.humidity')} (%)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <ThermometerSun className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
                            <Input type="number" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full btn-primary" disabled={isPending}>
                    {isPending ? t('irrigation.calculating') : t('irrigation.getAdvice')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {lastAdvice && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary/5 border border-primary/20 rounded-2xl p-4 md:p-6 text-center"
            >
              <h3 className="text-primary font-bold uppercase text-xs tracking-wider mb-2">{t('irrigation.recommendation')}</h3>
              <p className="text-xl md:text-2xl font-display font-bold text-foreground">{lastAdvice}</p>
            </motion.div>
          )}
        </div>

        {/* Right Column: Analytics */}
        <div className="lg:col-span-7 space-y-4 md:space-y-6">
          <Card className="border-border h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <History className="w-5 h-5 text-muted-foreground" />
                {t('irrigation.history')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] md:h-[300px] lg:h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="moisture"
                      name={t('irrigation.soilMoisture')}
                      stroke="hsl(217, 91%, 60%)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      name={t('irrigation.humidity')}
                      stroke="hsl(35, 90%, 55%)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
