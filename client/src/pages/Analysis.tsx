import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadZone } from "@/components/UploadZone";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Camera, 
  FileText, 
  X,
  Scan,
  ShieldCheck,
  Upload,
  Leaf,
  Shield,
  Sprout,
  Beaker,
  Timer,
  Volume2,
  Target,
  Zap,
  Download,
  TreePine
} from "lucide-react";
import { indianWildlifeFrequencies, getRecommendedFrequency } from "@shared/animalFrequencies";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { type Report } from "@shared/schema";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { Bug, Bird, Rat, Rabbit, Snail, Fish, Dog } from "lucide-react";

const AnimalIcon = ({ type }: { type: string }) => {
  const iconClass = "w-6 h-6 text-orange-600";
  switch (type) {
    case 'wild_boar':
    case 'nilgai':
    case 'jackal':
    case 'dog':
      return <Dog className={iconClass} />;
    case 'deer':
    case 'monkey':
    case 'langur':
    case 'elephant':
      return <Bug className={iconClass} />;
    case 'peacock':
    case 'parrot':
    case 'crow':
    case 'pigeon':
    case 'sparrow':
      return <Bird className={iconClass} />;
    case 'snake':
    case 'cobra':
    case 'monitor_lizard':
      return <Snail className={iconClass} />;
    case 'hare':
    case 'rabbit':
      return <Rabbit className={iconClass} />;
    case 'rat':
    case 'porcupine':
      return <Rat className={iconClass} />;
    default:
      return <Bug className={iconClass} />;
  }
};

type ScanMode = 'farmer' | 'expert';

function NatureFrame() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute inset-0 dark:hidden" 
           style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(240,253,244,0.4) 40%, transparent 70%)' }} />
      <div className="absolute inset-0 hidden dark:block" 
           style={{ background: 'radial-gradient(ellipse at center, rgba(20,20,20,0.5) 0%, rgba(20,83,45,0.15) 40%, transparent 70%)' }} />
      
      <svg className="absolute -top-8 -left-8 w-64 h-64 text-green-500/60 dark:text-green-400/40" viewBox="0 0 200 200" fill="currentColor">
        <ellipse cx="30" cy="50" rx="45" ry="25" transform="rotate(-45 30 50)" opacity="0.7" />
        <ellipse cx="60" cy="30" rx="40" ry="20" transform="rotate(-30 60 30)" opacity="0.6" />
        <ellipse cx="90" cy="55" rx="35" ry="18" transform="rotate(-50 90 55)" opacity="0.5" />
        <ellipse cx="40" cy="85" rx="38" ry="22" transform="rotate(-60 40 85)" opacity="0.6" />
        <ellipse cx="75" cy="90" rx="32" ry="17" transform="rotate(-40 75 90)" opacity="0.45" />
      </svg>
      
      <svg className="absolute -top-8 -right-8 w-64 h-64 text-green-500/60 dark:text-green-400/40" viewBox="0 0 200 200" fill="currentColor">
        <ellipse cx="170" cy="50" rx="45" ry="25" transform="rotate(45 170 50)" opacity="0.7" />
        <ellipse cx="140" cy="30" rx="40" ry="20" transform="rotate(30 140 30)" opacity="0.6" />
        <ellipse cx="110" cy="55" rx="35" ry="18" transform="rotate(50 110 55)" opacity="0.5" />
        <ellipse cx="160" cy="85" rx="38" ry="22" transform="rotate(60 160 85)" opacity="0.6" />
        <ellipse cx="125" cy="90" rx="32" ry="17" transform="rotate(40 125 90)" opacity="0.45" />
      </svg>
      
      <svg className="absolute -bottom-8 -left-8 w-48 h-48 text-green-600/50 dark:text-green-500/30" viewBox="0 0 200 200" fill="currentColor">
        <ellipse cx="30" cy="150" rx="42" ry="24" transform="rotate(45 30 150)" opacity="0.6" />
        <ellipse cx="55" cy="170" rx="38" ry="20" transform="rotate(30 55 170)" opacity="0.5" />
        <ellipse cx="80" cy="145" rx="32" ry="16" transform="rotate(55 80 145)" opacity="0.45" />
      </svg>
      
      <svg className="absolute -bottom-8 -right-8 w-48 h-48 text-green-600/50 dark:text-green-500/30" viewBox="0 0 200 200" fill="currentColor">
        <ellipse cx="170" cy="150" rx="42" ry="24" transform="rotate(-45 170 150)" opacity="0.6" />
        <ellipse cx="145" cy="170" rx="38" ry="20" transform="rotate(-30 145 170)" opacity="0.5" />
        <ellipse cx="120" cy="145" rx="32" ry="16" transform="rotate(-55 120 145)" opacity="0.45" />
      </svg>
      
      <div className="absolute inset-0 dark:hidden" 
           style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(34,197,94,0.06) 100%)' }} />
      <div className="absolute inset-0 hidden dark:block" 
           style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(34,197,94,0.15) 100%)' }} />
    </div>
  );
}

export default function Analysis() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>(() => {
    const stored = localStorage.getItem('agriguard-scan-mode');
    return (stored as ScanMode) || 'farmer';
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { t, formatDate, language } = useLanguage();

  const toggleScanMode = () => {
    const newMode = scanMode === 'farmer' ? 'expert' : 'farmer';
    setScanMode(newMode);
    localStorage.setItem('agriguard-scan-mode', newMode);
  };

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
      setSelectedImage(null);
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({ title: t('analysis.analyzing'), description: t('analysis.autoProcessing') });
      processMutation.mutate(data.id);
    },
    onError: (error: Error) => {
      setSelectedImage(null);
      toast({
        title: t('analysis.uploadFailed') || 'Upload Failed',
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const processMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/reports/${id}/process`, { language });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      if (data.status === 'failed') {
        // AI validation failed server-side — treat as a soft failure
        setCurrentReport(null);
        toast({
          title: t('analysis.analysisFailed') || 'Analysis Failed',
          description: t('analysis.retryHint') || 'The AI response could not be validated. Please retry or upload a clearer photo.',
          variant: "destructive",
        });
      } else {
        setCurrentReport(data);
        toast({ title: t('analysis.analysisComplete'), description: t('analysis.reportGenerated') });
      }
    },
    onError: (error: Error) => {
      toast({
        title: t('analysis.analysisFailed') || 'Analysis Failed',
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (selectedImage && !captureMutation.isPending && !processMutation.isPending) {
      captureMutation.mutate(selectedImage);
    }
  }, [selectedImage]);

  const isProcessing = captureMutation.isPending || processMutation.isPending;
  const hasMutationError = captureMutation.isError || processMutation.isError;
  const mutationErrorMessage = captureMutation.error?.message || processMutation.error?.message;
  // Only show a complete report (currentReport could be a failed one after server response)
  const latestCompleteReport = (currentReport?.status === 'complete' ? currentReport : null)
    || reports?.find(r => r.status === 'complete');
  // Only show failed banner if the MOST RECENT report failed (not any historical failure)
  const mostRecentReport = reports?.[0];
  const latestFailedReport = mostRecentReport?.status === 'failed' ? mostRecentReport : null;
  // Show error banner on mutation error OR when the latest report is failed
  const hasError = hasMutationError || !!latestFailedReport;
  const errorMessage = mutationErrorMessage
    || (latestFailedReport ? 'The AI response could not be validated. Please retry or upload a clearer photo.' : undefined);

  const handleDownload = async (format: 'pdf' | 'text') => {
    if (!latestCompleteReport) return;
    try {
      const res = await fetch(`/api/reports/${latestCompleteReport.id}/export/${format}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${latestCompleteReport.id}.${format === 'pdf' ? 'pdf' : 'txt'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 via-background to-green-50/30 dark:from-green-950/20 dark:via-background dark:to-green-950/10 relative overflow-hidden">
      <NatureFrame />
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 relative z-10">
        <header className="space-y-2">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-xl">
                <TreePine className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {t('analysis.uplinkCenter')}
                </h1>
                <p className="text-sm text-muted-foreground">{t('analysis.pathologyAnalysis')}</p>
              </div>
            </div>
            <Button
              onClick={toggleScanMode}
              variant="outline"
              className="rounded-full gap-2"
              data-testid="button-scan-mode"
            >
              {scanMode === 'farmer' ? (
                <>
                  <Sprout className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{t('analysis.farmerMode')}</span>
                </>
              ) : (
                <>
                  <Beaker className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{t('analysis.expertMode')}</span>
                </>
              )}
            </Button>
          </div>
        </header>

        <Card className="border-0 shadow-lg bg-card rounded-2xl overflow-hidden">
          <CardHeader className="bg-green-500/5 border-b p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-xl">
                <Scan className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">{t('analysis.captureIntelligence')}</CardTitle>
                <CardDescription className="text-xs">{t('analysis.directUplink')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="relative aspect-video rounded-xl bg-muted/30 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  {showCamera ? (
                    <motion.div 
                      key="camera"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0"
                    >
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                        <Button onClick={capturePhoto} size="icon" className="rounded-full shadow-lg">
                          <Camera className="w-5 h-5" />
                        </Button>
                        <Button onClick={stopCamera} variant="destructive" size="icon" className="rounded-full shadow-lg">
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </motion.div>
                  ) : isProcessing ? (
                    <motion.div 
                      key="processing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center space-y-4 p-8"
                    >
                      <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-600">{t('analysis.analyzing')}...</p>
                        <p className="text-sm text-muted-foreground">{t('analysis.autoProcessing')}</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full p-4"
                    >
                      <UploadZone onImageSelected={setSelectedImage} isProcessing={false} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={startCamera} 
                  disabled={showCamera || isProcessing}
                  variant="outline" 
                  className="flex-1 rounded-xl gap-2"
                  data-testid="button-camera"
                >
                  <Camera className="w-5 h-5" />
                  {t('analysis.liveCamera')}
                </Button>
                <div className="relative flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isProcessing}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Resize/compress before upload
                        const objectUrl = URL.createObjectURL(file);
                        const img = new Image();
                        img.onload = () => {
                          URL.revokeObjectURL(objectUrl);
                          let w = img.width, h = img.height;
                          const MAX = 1600;
                          if (w > MAX || h > MAX) {
                            if (w > h) { h = Math.round(h * (MAX / w)); w = MAX; }
                            else { w = Math.round(w * (MAX / h)); h = MAX; }
                          }
                          const canvas = document.createElement('canvas');
                          canvas.width = w; canvas.height = h;
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            ctx.drawImage(img, 0, 0, w, h);
                            setSelectedImage(canvas.toDataURL('image/jpeg', 0.8));
                          }
                        };
                        img.onerror = () => {
                          URL.revokeObjectURL(objectUrl);
                          // Fallback to raw
                          const reader = new FileReader();
                          reader.onloadend = () => setSelectedImage(reader.result as string);
                          reader.readAsDataURL(file);
                        };
                        img.src = objectUrl;
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    data-testid="input-upload"
                  />
                  <Button variant="outline" className="w-full rounded-xl gap-2" disabled={isProcessing}>
                    <Upload className="w-5 h-5" />
                    {t('analysis.uploadFile')}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
          >
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-red-600">{t('analysis.analysisFailed') || 'Analysis Failed'}</p>
              <p className="text-sm text-muted-foreground">{errorMessage || 'An error occurred during processing.'}</p>
            </div>
            {latestFailedReport && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => processMutation.mutate(latestFailedReport.id)}
                disabled={isProcessing}
                className="shrink-0 gap-2"
              >
                <Loader2 className={isProcessing ? "w-4 h-4 animate-spin" : "w-4 h-4 hidden"} />
                {t('analysis.retryAnalysis') || 'Retry Analysis'}
              </Button>
            )}
          </motion.div>
        )}

        {latestCompleteReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <ReportView report={latestCompleteReport} scanMode={scanMode} />
            
            <Card className="border-0 shadow-lg bg-card rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-sm font-medium text-muted-foreground">{t('analysis.exportReport')}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleDownload('text')}
                      className="gap-2"
                      data-testid="button-download-text"
                    >
                      <FileText className="w-4 h-4" />
                      Text
                    </Button>
                    <Button
                      onClick={() => handleDownload('pdf')}
                      className="gap-2"
                      data-testid="button-download-pdf"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Card className="border-0 shadow-lg bg-card rounded-2xl">
          <CardHeader className="bg-green-500/5 border-b p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-xl">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">{t('analysis.intelligenceArchive')}</CardTitle>
                <CardDescription className="text-xs">{t('analysis.previousScans')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {isLoadingHistory ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : reports?.filter(r => r.status === 'complete' || r.status === 'failed').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Scan className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t('analysis.noReportsYet')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports?.filter(r => r.status === 'complete' || r.status === 'failed').slice(0, 5).map((report) => {
                  const data = report.analysis as any;
                  const isFailed = report.status === 'failed';
                  return (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => {
                        if (isFailed) {
                          processMutation.mutate(report.id);
                        } else {
                          setCurrentReport(report);
                        }
                      }}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-xl hover-elevate cursor-pointer",
                        isFailed ? "bg-red-500/5 border border-red-500/20" : "bg-muted/30"
                      )}
                      data-testid={`card-report-${report.id}`}
                    >
                      <img
                        src={report.imageUrl}
                        alt="Report"
                        className={cn("w-14 h-14 rounded-lg object-cover border", isFailed && "opacity-60")}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{t('common.entry')} #{report.id}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {formatDate(report.createdAt, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      {isFailed ? (
                        <Badge className="bg-red-500/10 text-red-600 border-0">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {t('analysis.failed') || 'Failed — tap to retry'}
                        </Badge>
                      ) : data?.diseases?.length > 0 ? (
                        <Badge className="bg-red-500/10 text-red-600 border-0">
                          {data.diseases.length} {t('analysis.issues')}
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500/10 text-green-600 border-0">
                          {t('analysis.healthy')}
                        </Badge>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ReportView({ report, scanMode }: { report: Report; scanMode: ScanMode }) {
  const { t } = useLanguage();
  const data = report.analysis as any;
  
  const severityColors: Record<string, string> = {
    none: 'bg-green-500', low: 'bg-yellow-500', medium: 'bg-orange-500',
    high: 'bg-red-500', critical: 'bg-red-700'
  };

  return (
    <Card className="border-0 shadow-lg bg-card rounded-2xl overflow-hidden">
      <CardHeader className="bg-green-500/5 border-b p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-xl">
              <Leaf className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{t('analysis.cropReport')} #{report.id}</CardTitle>
              <CardDescription className="text-xs">{t('analysis.analysisResults')}</CardDescription>
            </div>
          </div>
          <Badge className={severityColors[data?.severity || 'none']}>
            {t(`severity.${data?.severity || 'none'}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        <div className="flex gap-4 flex-wrap">
          <img src={report.imageUrl} alt="Crop" className="w-24 h-24 rounded-xl object-cover border" />
          <div className="flex-1 space-y-2 min-w-0">
            <p className="font-semibold text-lg">{data?.cropType || t('common.unknown')}</p>
            {data?.summary && <p className="text-sm text-muted-foreground">{data.summary}</p>}
            {data?.estimatedRecoveryTime && (
              <div className="flex items-center gap-2 text-sm">
                <Timer className="w-4 h-4 text-green-600" />
                <span>{t('analysis.recovery')}: {data.estimatedRecoveryTime}</span>
              </div>
            )}
          </div>
        </div>

        {data?.animals?.length > 0 && (
          <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-600" />
              <span className="font-semibold text-orange-600">{t('analysis.wildlifeScan')}</span>
            </div>
            {data.animals.map((animal: any, i: number) => {
              const frequency = getRecommendedFrequency([animal.type || 'unknown']);
              return (
                <div key={i} className="flex items-center gap-4 p-3 bg-background rounded-lg">
                  <AnimalIcon type={animal.type} />
                  <div className="flex-1">
                    <p className="font-medium text-orange-600">{animal.name || animal.type}</p>
                    {animal.localName && <p className="text-xs text-muted-foreground">{animal.localName}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{animal.estimatedDistance || '?'}m</p>
                    <p className="text-xs text-muted-foreground">{frequency} kHz</p>
                  </div>
                  <Badge variant="outline" className="border-orange-500/50 text-orange-600">
                    <Target className="w-3 h-3 mr-1" />
                    {animal.confidence != null ? `${animal.confidence}%` : t('analysis.detected') || 'Detected'}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}

        {data?.diseases?.length > 0 && (
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-600">{t('analysis.diseaseFound')}</span>
            </div>
            {data.diseases.map((d: any, i: number) => (
              <div key={i} className="p-3 bg-background rounded-lg">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="font-medium text-red-600">{d.name}</p>
                  {scanMode === 'expert' && d.confidence && (
                    <Badge variant="outline" className="text-xs">
                      {d.confidence}% {t('common.confidence')}
                    </Badge>
                  )}
                </div>
                {d.localName && <p className="text-sm text-muted-foreground">({d.localName})</p>}
                {scanMode === 'expert' && d.symptoms?.length > 0 && (
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
          </div>
        )}

        {data?.pests?.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-amber-600">{t('analysis.pestsFound') || 'Pests / Insects Found'}</span>
              <Badge variant="outline" className="ml-auto text-xs">
                {data.pests.length} {data.pests.length === 1 ? 'pest' : 'pests'}
              </Badge>
            </div>
            {scanMode === 'farmer' ? (
              // Farmer mode: simple summary + top 3 pests with actions
              <div className="space-y-2">
                {data.pests.slice(0, 3).map((p: any, i: number) => (
                  <div key={i} className="p-3 bg-background rounded-lg">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-medium text-amber-700">{p.name}</p>
                      {p.confidence && (
                        <Badge className="bg-amber-500/10 text-amber-600 border-0 text-xs">
                          {p.confidence}%
                        </Badge>
                      )}
                    </div>
                    {p.localName && <p className="text-sm text-muted-foreground">({p.localName})</p>}
                    {p.damageType && (
                      <p className="text-sm text-muted-foreground mt-1">{p.damageType}</p>
                    )}
                  </div>
                ))}
                {data.pests.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{data.pests.length - 3} more detected
                  </p>
                )}
              </div>
            ) : (
              // Expert mode: detailed per-pest info
              <div className="space-y-2">
                {data.pests.map((p: any, i: number) => (
                  <div key={i} className="p-3 bg-background rounded-lg space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-medium text-amber-700">{p.name}</p>
                      {p.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {p.confidence}% confidence
                        </Badge>
                      )}
                    </div>
                    {p.localName && <p className="text-sm text-muted-foreground">({p.localName})</p>}
                    <div className="flex flex-wrap gap-2 mt-1">
                      {p.category && (
                        <Badge variant="secondary" className="text-xs">{p.category}</Badge>
                      )}
                      {p.type && (
                        <Badge variant="secondary" className="text-xs">{p.type}</Badge>
                      )}
                      {p.lifestage && (
                        <Badge variant="secondary" className="text-xs">{p.lifestage}</Badge>
                      )}
                    </div>
                    {p.description && (
                      <p className="text-sm text-muted-foreground">{p.description}</p>
                    )}
                    {p.damageType && (
                      <p className="text-sm"><span className="text-amber-600 font-medium">Damage:</span> {p.damageType}</p>
                    )}
                    {p.location && (
                      <p className="text-sm"><span className="text-amber-600 font-medium">Location:</span> {p.location}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {data?.whatToDoNow?.length > 0 && (
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-600">{t('analysis.whatToDo')}</span>
            </div>
            {data.whatToDoNow.map((step: any, i: number) => (
              <div key={i} className="flex gap-3 p-3 bg-background rounded-lg">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                  step.urgency === 'immediate' ? 'bg-red-500' :
                  step.urgency === 'within3days' ? 'bg-orange-500' : 'bg-blue-500'
                }`}>
                  {step.step}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{step.action}</p>
                  <p className="text-sm text-muted-foreground">{step.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.organicOptions?.length > 0 && (
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Sprout className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-600 text-sm">{t('analysis.organicOptions')}</span>
              </div>
              <ul className="text-sm space-y-1">
                {data.organicOptions.map((opt: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-500">•</span> {opt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data?.chemicalOptions?.length > 0 && (
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Beaker className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-600 text-sm">{t('analysis.chemicalOptions')}</span>
              </div>
              <ul className="text-sm space-y-1">
                {data.chemicalOptions.map((opt: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-500">•</span> {opt}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {data?.prevention?.length > 0 && (
          <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-600">{t('analysis.prevention')}</span>
            </div>
            <div className="space-y-2">
              {data.prevention.map((p: any, i: number) => (
                <div key={i} className="flex gap-3 p-2 bg-background rounded-lg">
                  <Shield className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{p.tip}</p>
                    <p className="text-xs text-muted-foreground">{p.when}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
