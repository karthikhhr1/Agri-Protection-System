// Advanced Spatial Deterrence Implementation
import { useState, useRef } from "react";
import { useReports, useAudioLogs } from "@/hooks/use-agri";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Volume2, 
  Map as MapIcon, 
  ShieldAlert, 
  Zap,
  Target,
  Navigation,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function Deterrent() {
  const [distance, setDistance] = useState("100");
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedCoord, setSelectedCoord] = useState<{ x: number, y: number } | null>(null);
  const { data: audioLogs } = useAudioLogs();
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);

  const handleMapClick = (e: React.MouseEvent) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSelectedCoord({ x, y });
  };

  const calculateVolume = async () => {
    if (!distance) return;
    setIsCalculating(true);
    try {
      await apiRequest("POST", "/api/audio", { 
        distance: String(distance),
        coordinates: selectedCoord
      });
      queryClient.invalidateQueries({ queryKey: ["/api/audio"] });
      toast({
        title: "Acoustic Signature Calculated",
        description: `Deterrent profile deployed at target coordinates.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Calculation Error",
        description: "Failed to calibrate acoustic deterrent.",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="p-6 space-y-8 bg-background/50 min-h-screen">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Spatial Deterrence</h1>
        <p className="text-muted-foreground text-lg">Acoustic perimeter calibration & wildlife management</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-xl border-muted/20 overflow-hidden">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <MapIcon className="w-5 h-5 text-primary" />
                  Acoustic Coverage Map
                </CardTitle>
                <CardDescription>Click to place deterrent units and simulate coverage</CardDescription>
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary">Live Calibration</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div 
              ref={mapRef}
              onClick={handleMapClick}
              className="aspect-video bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center relative cursor-crosshair overflow-hidden"
            >
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
              
              {/* Existing Logs Visualization */}
              {audioLogs?.map((log: any) => (
                log.coordinates && (
                  <DeterrentMarker 
                    key={log.id} 
                    x={log.coordinates.x} 
                    y={log.coordinates.y} 
                    volume={log.calculatedVolume}
                    isNew={false}
                  />
                )
              ))}

              {/* Selection Marker */}
              <AnimatePresence>
                {selectedCoord && (
                  <DeterrentMarker 
                    x={selectedCoord.x} 
                    y={selectedCoord.y} 
                    volume={Number(distance) * 0.5} // visual scale
                    isNew={true}
                  />
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-lg border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Deterrent Calibration
              </CardTitle>
              <CardDescription>Configure acoustic output for target range</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="distance" className="text-sm font-bold flex items-center gap-2">
                  <Target className="w-4 h-4" /> Effective Radius (meters)
                </Label>
                <Input
                  id="distance"
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="e.g. 500"
                  className="h-12 text-lg font-mono border-primary/20 bg-background"
                />
              </div>

              {!selectedCoord && (
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-orange-600 mt-0.5" />
                  <p className="text-xs text-orange-700 font-medium leading-relaxed">
                    Select a location on the coverage map to activate spatial placement.
                  </p>
                </div>
              )}

              <Button 
                onClick={calculateVolume} 
                disabled={isCalculating || !selectedCoord}
                className="w-full h-14 text-lg font-bold gap-2 shadow-xl shadow-primary/20"
              >
                {isCalculating ? (
                  <Activity className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    Deploy Acoustic Barrier
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md border-muted/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Navigation className="w-4 h-4" /> Calibration Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {audioLogs?.slice(0, 10).map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-muted transition-all hover:bg-muted/50">
                    <div>
                      <p className="text-sm font-bold">{log.calculatedVolume} dB</p>
                      <p className="text-[10px] text-muted-foreground">Radius: {log.distance}m</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      {new Date(log.createdAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DeterrentMarker({ x, y, volume, isNew }: any) {
  return (
    <motion.div
      initial={ { scale: 0, opacity: 0 } }
      animate={ { scale: 1, opacity: 1 } }
      style={ { left: `${x}%`, top: `${y}%` } }
      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
    >
      <div className={`relative flex items-center justify-center`}>
        {/* Acoustic waves */}
        <motion.div
          animate={ { 
            scale: [1, 2, 3],
            opacity: [0.5, 0.2, 0]
          } }
          transition={ { 
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          } }
          className={`absolute rounded-full border-2 ${isNew ? 'border-primary' : 'border-accent'}`}
          style={ { width: Math.min(volume, 200), height: Math.min(volume, 200) } }
        />
        
        {/* Center dot */}
        <div className={`w-4 h-4 rounded-full border-2 border-white shadow-xl ${isNew ? 'bg-primary' : 'bg-accent'}`} />
        
        {isNew && (
          <div className="absolute -top-8 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
            Placement Active
          </div>
        )}
      </div>
    </motion.div>
  );
}
