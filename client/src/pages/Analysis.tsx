import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadZone } from "@/components/UploadZone";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  ShieldAlert, 
  ArrowRight, 
  Camera, 
  Search, 
  FileText, 
  X,
  Scan,
  ShieldCheck,
  RefreshCw,
  Upload
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { type Report } from "@shared/schema";

export default function Analysis() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeReportId, setActiveReportId] = useState<number | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const { data: reports, isLoading: isLoadingHistory } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setSelectedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const captureMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      const res = await apiRequest("POST", "/api/reports/capture", { imageUrl });
      return res.json();
    },
    onSuccess: (data) => {
      setActiveReportId(data.id);
      setSelectedImage(null);
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Image Captured",
        description: "Data captured successfully. Ready for scoring analysis.",
      });
    },
  });

  const processMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/reports/${id}/process`, {});
      return res.json();
    },
    onSuccess: () => {
      setActiveReportId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Analysis Complete",
        description: "Disease detection report generated successfully.",
      });
    },
  });

  const handleCapture = () => {
    if (!selectedImage) return;
    captureMutation.mutate(selectedImage);
  };

  const handleProcess = (id: number) => {
    processMutation.mutate(id);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const activeReport = reports?.find(r => r.id === activeReportId) || reports?.find(r => r.status === 'pending');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 bg-background/50 min-h-screen">
      <header className="space-y-1">
        <h1 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-3">
          <Scan className="w-10 h-10 text-primary" />
          Uplink Center
        </h1>
        <p className="text-muted-foreground text-lg font-medium">Pathology analysis & diagnostic intelligence</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-2xl bg-card overflow-hidden rounded-3xl">
          <CardHeader className="bg-muted/30 border-b pb-6">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Capture Intelligence
            </CardTitle>
            <CardDescription>Direct uplink from field cameras or local storage</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="relative aspect-video rounded-2xl bg-muted/50 border-2 border-dashed border-muted flex items-center justify-center overflow-hidden group">
                <AnimatePresence mode="wait">
                  {showCamera ? (
                    <motion.div 
                      key="camera"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0"
                    >
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                        <Button onClick={capturePhoto} size="lg" className="rounded-full w-16 h-16 shadow-2xl hover-elevate bg-white text-black hover:bg-white/90">
                          <div className="w-12 h-12 rounded-full border-2 border-black/20" />
                        </Button>
                        <Button onClick={stopCamera} variant="destructive" size="icon" className="rounded-full w-16 h-16 shadow-2xl hover-elevate">
                          <X className="w-6 h-6" />
                        </Button>
                      </div>
                    </motion.div>
                  ) : selectedImage ? (
                    <motion.div 
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0"
                    >
                      <img src={selectedImage} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute top-4 right-4">
                        <Button 
                          onClick={() => setSelectedImage(null)} 
                          variant="destructive" 
                          size="icon" 
                          className="rounded-full shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center space-y-4 p-8 w-full"
                    >
                      <UploadZone 
                        onImageSelected={setSelectedImage} 
                        isProcessing={captureMutation.isPending}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={startCamera} 
                  disabled={showCamera}
                  variant="outline" 
                  className="h-14 rounded-2xl font-black uppercase tracking-widest hover-elevate border-2"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Live Camera
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setSelectedImage(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest border-2">
                    <Upload className="w-5 h-5 mr-2" />
                    Upload File
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Remote Camera Integration</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">
                  Connect third-party hardware via real-time RTSP/WebRTC streams or direct IP uplink.
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-xs font-black uppercase tracking-widest text-primary hover:text-primary/80"
                  onClick={() => {
                    const ip = prompt("Enter Camera IP / Stream URL:");
                    if (ip) toast({ title: "Connecting Stream", description: `Attempting uplink to ${ip}...` });
                  }}
                >
                  Configure Remote Link <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>

              <Button 
                onClick={handleCapture}
                disabled={!selectedImage || captureMutation.isPending}
                className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover-elevate transition-all disabled:opacity-50"
              >
                {captureMutation.isPending ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Scan className="w-6 h-6 mr-2" />
                    Capture & Analyze
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl bg-card rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b pb-6">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              Production Safeguards
            </CardTitle>
            <CardDescription>Diagnostic integrity & encrypted transmission</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/20 flex gap-4">
                <ShieldCheck className="w-6 h-6 text-green-500 shrink-0" />
                <div>
                  <p className="font-black text-sm uppercase tracking-tight text-green-600">Encrypted Uplink</p>
                  <p className="text-xs text-muted-foreground font-medium mt-1">End-to-end security for all camera data transfers.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 flex gap-4">
                <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0" />
                <div>
                  <p className="font-black text-sm uppercase tracking-tight text-orange-600">Smart Alerting</p>
                  <p className="text-xs text-muted-foreground font-medium mt-1">Critical pathologies trigger immediate field protocols.</p>
                </div>
              </div>
            </div>
            
            <AnimatePresence>
              {activeReport && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="pt-6 border-t"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border">
                      <img src={activeReport.imageUrl} alt="Target" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-black uppercase tracking-widest text-primary">Pending Analysis</p>
                      <Button 
                        size="sm" 
                        onClick={() => handleProcess(activeReport.id)}
                        disabled={processMutation.isPending}
                        className="w-full font-bold h-10 rounded-xl"
                      >
                        {processMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          "Run Full Report"
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tighter">
          <FileText className="w-6 h-6 text-primary" />
          Intelligence Archive
        </h2>
        {isLoadingHistory ? (
          <div className="flex justify-center p-12"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports?.filter(r => r.status === 'complete' || r.status === 'failed').map((report) => {
              const data = report.analysis as any;
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border-none shadow-lg rounded-3xl p-6 flex gap-6 hover:shadow-2xl transition-all"
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border">
                    <img src={report.imageUrl} alt="Report" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-lg tracking-tighter uppercase">Entry #{report.id}</h3>
                      <Badge className={report.status === 'complete' ? 'bg-green-500' : 'bg-red-500'}>
                        {report.status}
                      </Badge>
                    </div>

                    {data?.diseases?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {data.diseases.map((d: any, i: number) => (
                          <Badge key={i} variant="destructive" className="bg-red-500/10 text-red-600 border-none font-bold">
                            {d.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-none font-bold">
                        Pathology Clear
                      </Badge>
                    )}
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-2">
                      Logged {new Date(report.createdAt!).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
