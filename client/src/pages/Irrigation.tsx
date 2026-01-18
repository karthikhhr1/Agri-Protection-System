import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { irrigationRequestSchema } from "@shared/routes";
import { useCalculateIrrigation, useIrrigationHistory } from "@/hooks/use-agri";
import { useLanguage } from "@/lib/i18n";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, ThermometerSun, History, Leaf } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

type FormValues = z.infer<typeof irrigationRequestSchema>;

export default function Irrigation() {
  const { t, formatDate, formatNumber, getLocale } = useLanguage();
  const { mutate: calculate, isPending } = useCalculateIrrigation();
  const { data: history } = useIrrigationHistory();
  const [lastAdvice, setLastAdvice] = useState<string | null>(null);

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

  // Format data for chart with localized dates
  const locale = getLocale();
  const chartData = history?.map(h => ({
    date: new Date(h.createdAt!).toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
    moisture: h.soilMoisture,
    humidity: h.humidity,
  })).slice(-10).reverse() || [];

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('irrigation.title')}</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          {t('irrigation.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
        {/* Left Column: Calculator */}
        <div className="lg:col-span-5 space-y-4 md:space-y-6">
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
