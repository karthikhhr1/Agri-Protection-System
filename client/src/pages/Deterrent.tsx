import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { audioRequestSchema } from "@shared/routes";
import { useCalculateAudio } from "@/hooks/use-agri";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Volume2, VolumeX, LocateFixed } from "lucide-react";
import { motion } from "framer-motion";

type FormValues = z.infer<typeof audioRequestSchema>;

export default function Deterrent() {
  const { mutate: calculate, isPending } = useCalculateAudio();
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(audioRequestSchema),
    defaultValues: { distance: 50 },
  });

  const onSubmit = (data: FormValues) => {
    calculate(data, {
      onSuccess: (res) => {
        setResult(res.calculatedVolume);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Audio Deterrent</h1>
        <p className="text-muted-foreground mt-2">
          Calculate the optimal acoustic volume to deter wildlife based on distance.
        </p>
      </div>

      <Card className="border-border shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-amber-500" />
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                <FormField
                  control={form.control}
                  name="distance"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Distance to Target (meters)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LocateFixed className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input type="number" className="pl-9 h-12 text-lg" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" size="lg" className="btn-primary" disabled={isPending}>
                  {isPending ? "Calculating..." : "Calculate Volume"}
                </Button>
              </div>
            </form>
          </Form>

          {result !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-10 pt-10 border-t border-dashed border-border"
            >
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className={`
                  p-6 rounded-full transition-colors duration-500
                  ${result > 90 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}
                `}>
                  {result > 0 ? <Volume2 className="w-12 h-12" /> : <VolumeX className="w-12 h-12" />}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Required Volume</h3>
                  <div className="text-5xl font-display font-bold text-foreground mt-2">
                    {result} <span className="text-2xl text-muted-foreground font-sans">dB</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground max-w-sm">
                  {result > 85 
                    ? "Warning: High volume required. Ensure no humans are in close proximity." 
                    : "Standard deterrent volume. Safe for short-term emission."}
                </p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
      
      {/* Visual illustration */}
      <div className="grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground opacity-60">
        <div>
          <div className="bg-muted h-1 rounded-full mb-2 w-full max-w-[50px] mx-auto"></div>
          Close Range (10m)
        </div>
        <div>
          <div className="bg-muted h-1 rounded-full mb-2 w-full max-w-[100px] mx-auto"></div>
          Mid Range (50m)
        </div>
        <div>
          <div className="bg-muted h-1 rounded-full mb-2 w-full max-w-[150px] mx-auto"></div>
          Long Range (100m+)
        </div>
      </div>
    </div>
  );
}
