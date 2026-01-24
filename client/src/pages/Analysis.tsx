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
  Upload,
  Leaf,
  Clock,
  Shield,
  Eye,
  Sprout,
  Beaker,
  Timer,
  ChevronRight,
  Volume2,
  Target,
  Zap
} from "lucide-react";
import { indianWildlifeFrequencies, getRecommendedFrequency } from "@shared/animalFrequencies";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { type Report } from "@shared/schema";
import { useLanguage } from "@/lib/i18n";

const getAnimalEmoji = (type: string) => {
  const icons: Record<string, string> = {
    'wild_boar': '🐗',
    'deer': '🦌',
    'monkey': '🐒',
    'langur': '🐒',
    'elephant': '🐘',
    'peacock': '🦚',
    'snake': '🐍',
    'cobra': '🐍',
    'nilgai': '🦬',
    'jackal': '🦊',
    'porcupine': '🦔',
    'hare': '🐰',
    'rat': '🐀',
    'parrot': '🦜',
    'crow': '🐦‍⬛',
    'pigeon': '🕊️',
    'sparrow': '🐦',
    'monitor_lizard': '🦎',
  };
  return icons[type] || '🐾';
};

export default function Analysis() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeReportId, setActiveReportId] = useState<number | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { t, formatDate, formatTime } = useLanguage();

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
        title: t('analysis.cameraError'),
        description: t('analysis.cameraPermission'),
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
        title: t('analysis.analyzing'),
        description: t('analysis.autoProcessing'),
      });
      processMutation.mutate(data.id);
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
        title: t('analysis.analysisComplete'),
        description: t('analysis.reportGenerated'),
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

  useEffect(() => {
    if (selectedImage && !captureMutation.isPending && !processMutation.isPending) {
      captureMutation.mutate(selectedImage);
    }
  }, [selectedImage]);

  const activeReport = reports?.find(r => r.id === activeReportId) || reports?.find(r => r.status === 'pending');

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 md:space-y-8 bg-background/50 min-h-screen">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-foreground flex items-center gap-3">
          <Scan className="w-8 sm:w-10 h-8 sm:h-10 text-primary" />
          {t('analysis.uplinkCenter')}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base font-medium">{t('analysis.pathologyAnalysis')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <Card className="border-none shadow-2xl bg-card overflow-hidden rounded-3xl">
          <CardHeader className="bg-muted/30 border-b pb-4 md:pb-6">
            <CardTitle className="text-lg md:text-xl font-black flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              {t('analysis.captureIntelligence')}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">{t('analysis.directUplink')}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-8">
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

              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <Button 
                  onClick={startCamera} 
                  disabled={showCamera}
                  variant="outline" 
                  className="h-12 md:h-14 rounded-2xl font-black uppercase tracking-widest hover-elevate border-2 text-xs md:text-sm"
                >
                  <Camera className="w-4 md:w-5 h-4 md:h-5 mr-1 md:mr-2" />
                  {t('analysis.liveCamera')}
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
                  <Button variant="outline" className="w-full h-12 md:h-14 rounded-2xl font-black uppercase tracking-widest border-2 text-xs md:text-sm">
                    <Upload className="w-4 md:w-5 h-4 md:h-5 mr-1 md:mr-2" />
                    {t('analysis.uploadFile')}
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">{t('analysis.remoteCamera')}</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">
                  {t('analysis.remoteDescription')}
                </p>
                <Button 
                  variant="ghost" 
                  className="p-0 h-auto text-xs font-black uppercase tracking-widest text-primary hover:text-primary/80"
                  onClick={() => {
                    const ip = prompt(t('analysis.promptMessage'));
                    if (ip) toast({ title: t('analysis.connectingStream'), description: `${t('analysis.attemptingUplink')} ${ip}...` });
                  }}
                >
                  {t('analysis.configureLink')} <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>

              {(captureMutation.isPending || processMutation.isPending) && (
                <div className="w-full h-12 md:h-16 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-sm md:text-lg font-black uppercase tracking-widest text-primary">
                    {t('analysis.analyzing')}...
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl bg-card rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b pb-4 md:pb-6">
            <CardTitle className="text-lg md:text-xl font-black flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              {t('analysis.productionSafeguards')}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">{t('analysis.diagnosticIntegrity')}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-8 space-y-6">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/20 flex gap-4">
                <ShieldCheck className="w-6 h-6 text-green-500 shrink-0" />
                <div>
                  <p className="font-black text-xs md:text-sm uppercase tracking-tight text-green-600">{t('analysis.encryptedUplink')}</p>
                  <p className="text-xs text-muted-foreground font-medium mt-1">{t('analysis.encryptedDescription')}</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 flex gap-4">
                <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0" />
                <div>
                  <p className="font-black text-xs md:text-sm uppercase tracking-tight text-orange-600">{t('analysis.smartAlerting')}</p>
                  <p className="text-xs text-muted-foreground font-medium mt-1">{t('analysis.smartAlertingDescription')}</p>
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
                      <p className="text-sm font-black uppercase tracking-widest text-primary">{t('analysis.pendingAnalysis')}</p>
                      <Button 
                        size="sm" 
                        onClick={() => handleProcess(activeReport.id)}
                        disabled={processMutation.isPending}
                        className="w-full font-bold h-10 rounded-xl"
                      >
                        {processMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          t('analysis.runFullReport')
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
        <h2 className="text-xl md:text-2xl font-black flex items-center gap-2 uppercase tracking-tighter">
          <FileText className="w-5 md:w-6 h-5 md:h-6 text-primary" />
          {t('analysis.intelligenceArchive')}
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
                  onClick={() => setViewingReport(report)}
                  className="bg-card border-none shadow-lg rounded-3xl p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 hover:shadow-2xl transition-all cursor-pointer"
                  data-testid={`card-report-${report.id}`}
                >
                  <div className="w-20 md:w-24 h-20 md:h-24 rounded-2xl overflow-hidden shrink-0 border">
                    <img src={report.imageUrl} alt="Report" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-black text-base md:text-lg tracking-tighter uppercase">{t('common.entry')} #{report.id}</h3>
                      <Badge className={report.status === 'complete' ? 'bg-green-500' : 'bg-red-500'}>
                        {t(`status.${report.status}`)}
                      </Badge>
                    </div>

                    {data?.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{data.summary}</p>
                    )}

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
                        {t('analysis.healthyCrop')}
                      </Badge>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {formatDate(report.createdAt, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                      <span className="text-xs text-primary flex items-center gap-1">
                        {t('analysis.viewDetails')} <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!viewingReport} onOpenChange={() => setViewingReport(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-full">
          {viewingReport && (() => {
            const data = viewingReport.analysis as any;
            const severityColors: Record<string, string> = {
              none: 'bg-green-500',
              low: 'bg-yellow-500',
              medium: 'bg-orange-500',
              high: 'bg-red-500',
              critical: 'bg-red-700'
            };
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Leaf className="w-6 h-6 text-primary" />
                    {t('analysis.cropReport')} #{viewingReport.id}
                  </DialogTitle>
                </DialogHeader>
                
                {/* Severity badge with translation */}
                
                <div className="space-y-4 md:space-y-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <img 
                      src={viewingReport.imageUrl} 
                      alt="Crop" 
                      className="w-full md:w-32 h-32 rounded-xl object-cover border"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={severityColors[data?.severity || 'none']}>
                          {data?.severity?.toUpperCase() || 'NONE'}
                        </Badge>
                        <span className="font-bold text-lg">{data?.cropType || t('common.unknown')}</span>
                      </div>
                      {data?.summary && (
                        <p className="text-muted-foreground">{data.summary}</p>
                      )}
                      {data?.estimatedRecoveryTime && (
                        <p className="text-sm flex items-center gap-2">
                          <Timer className="w-4 h-4 text-primary" />
                          {t('analysis.recovery')}: {data.estimatedRecoveryTime}
                        </p>
                      )}
                    </div>
                  </div>

                  <Card className={`${data?.animals?.length > 0 ? 'border-orange-200 bg-orange-50/50 dark:bg-orange-950/20' : 'border-green-200 bg-green-50/50 dark:bg-green-950/20'}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className={`text-base md:text-lg flex items-center gap-2 ${data?.animals?.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        <Zap className="w-5 h-5" />
                        {t('analysis.wildlifeScan')}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {t('analysis.connectedToDeterrent')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {data?.animals?.length > 0 ? (
                        <>
                          {data.animals.map((animal: any, i: number) => {
                            const frequency = getRecommendedFrequency([animal.type || 'unknown']);
                            const animalData = indianWildlifeFrequencies.find(a => a.id === animal.type);
                            return (
                              <div key={i} className="p-4 bg-background rounded-xl border border-orange-200">
                                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                  <div className="flex items-center gap-3">
                                    <span className="text-3xl">{getAnimalEmoji(animal.type)}</span>
                                    <div>
                                      <p className="font-bold text-orange-600">{animal.name || animal.type}</p>
                                      {animal.localName && <p className="text-sm text-muted-foreground">{animal.localName}</p>}
                                    </div>
                                  </div>
                                  <Badge className="bg-green-500 text-white">
                                    <Volume2 className="w-3 h-3 mr-1" />
                                    {t('analysis.deterrentTriggered')}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 md:gap-3 text-center">
                                  <div className="p-2 md:p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                    <Target className="w-4 h-4 md:w-5 md:h-5 mx-auto text-orange-600 mb-1" />
                                    <p className="text-xs text-muted-foreground">{t('analysis.distance')}</p>
                                    <p className="text-base md:text-lg font-bold text-orange-600">{animal.estimatedDistance || '?'}m</p>
                                  </div>
                                  <div className="p-2 md:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Volume2 className="w-4 h-4 md:w-5 md:h-5 mx-auto text-blue-600 mb-1" />
                                    <p className="text-xs text-muted-foreground">{t('analysis.frequency')}</p>
                                    <p className="text-base md:text-lg font-bold text-blue-600">{frequency} kHz</p>
                                  </div>
                                  <div className="p-2 md:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 mx-auto text-green-600 mb-1" />
                                    <p className="text-xs text-muted-foreground">{t('analysis.result')}</p>
                                    <p className="text-xs md:text-sm font-bold text-green-600">{t('analysis.scaredAway')}</p>
                                  </div>
                                </div>
                                
                                {animalData && (
                                  <p className="text-xs text-muted-foreground mt-3">
                                    {t('analysis.optimalRange')}: {animalData.frequencyRange.min}-{animalData.frequencyRange.max} kHz
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </>
                      ) : (
                        <div className="p-6 text-center bg-background rounded-xl border border-green-200">
                          <ShieldCheck className="w-12 h-12 mx-auto text-green-500 mb-3" />
                          <p className="font-bold text-green-600 text-lg">{t('analysis.noAnimalsDetected')}</p>
                          <p className="text-sm text-muted-foreground mt-1">{t('analysis.fieldClear')}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {data?.diseases?.length > 0 && (
                    <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base md:text-lg flex items-center gap-2 text-red-600">
                          <AlertTriangle className="w-5 h-5" />
                          {t('analysis.diseaseFound')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {data.diseases.map((d: any, i: number) => (
                          <div key={i} className="p-3 bg-background rounded-lg">
                            <p className="font-bold text-red-600">{d.name}</p>
                            {d.localName && <p className="text-sm text-muted-foreground">({d.localName})</p>}
                            {d.symptoms?.length > 0 && (
                              <ul className="mt-2 text-sm space-y-1">
                                {d.symptoms.map((s: string, j: number) => (
                                  <li key={j} className="flex items-start gap-2">
                                    <span className="text-red-500">•</span> {s}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {data?.whatToDoNow?.length > 0 && (
                    <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base md:text-lg flex items-center gap-2 text-blue-600">
                          <CheckCircle2 className="w-5 h-5" />
                          {t('analysis.whatToDo')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {data.whatToDoNow.map((step: any, i: number) => (
                          <div key={i} className="flex gap-3 p-3 bg-background rounded-lg">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${
                              step.urgency === 'immediate' ? 'bg-red-500' :
                              step.urgency === 'within3days' ? 'bg-orange-500' : 'bg-blue-500'
                            }`}>
                              {step.step}
                            </div>
                            <div>
                              <p className="font-bold">{step.action}</p>
                              <p className="text-sm text-muted-foreground">{step.details}</p>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {step.urgency === 'immediate' ? t('analysis.doNow') :
                                 step.urgency === 'within3days' ? t('analysis.within3Days') : t('analysis.thisWeek')}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {data?.organicOptions?.length > 0 && (
                      <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs md:text-sm flex items-center gap-2 text-green-600">
                            <Sprout className="w-4 h-4" />
                            {t('analysis.organicOptions')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-sm space-y-1">
                            {data.organicOptions.map((opt: string, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-green-500">•</span> {opt}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {data?.chemicalOptions?.length > 0 && (
                      <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs md:text-sm flex items-center gap-2 text-purple-600">
                            <Beaker className="w-4 h-4" />
                            {t('analysis.chemicalOptions')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-sm space-y-1">
                            {data.chemicalOptions.map((opt: string, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-purple-500">•</span> {opt}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {data?.prevention?.length > 0 && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base md:text-lg flex items-center gap-2 text-primary">
                          <Shield className="w-5 h-5" />
                          {t('analysis.prevention')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {data.prevention.map((p: any, i: number) => (
                          <div key={i} className="flex gap-3 p-2 bg-background rounded-lg">
                            <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium">{p.tip}</p>
                              <p className="text-xs text-muted-foreground">{p.when}</p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {data?.warningSigns?.length > 0 && (
                    <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs md:text-sm flex items-center gap-2 text-orange-600">
                          <Eye className="w-4 h-4" />
                          {t('analysis.warningSigns')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm space-y-1">
                          {data.warningSigns.map((sign: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-orange-500">•</span> {sign}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {data?.canHarvest !== undefined && (
                    <Card className={data.canHarvest ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20' : 'border-red-200 bg-red-50/50 dark:bg-red-950/20'}>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          {data.canHarvest ? (
                            <CheckCircle2 className="w-5 md:w-6 h-5 md:h-6 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-5 md:w-6 h-5 md:h-6 text-red-600" />
                          )}
                          <div>
                            <p className="font-bold text-sm md:text-base">{data.canHarvest ? t('analysis.canHarvest') : t('analysis.waitToHarvest')}</p>
                            {data.harvestAdvice && (
                              <p className="text-sm text-muted-foreground">{data.harvestAdvice}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
