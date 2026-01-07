import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadZone } from "@/components/UploadZone";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Loader2, ShieldAlert, ArrowRight, Camera, Search, FileText, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
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

  const activeReport = reports?.find(r => r.id === activeReportId) || reports?.find(r => r.status === 'pending');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Disease Detection & Scoring</h1>
          <p className="text-muted-foreground mt-2">
            Multi-stage analysis: Capture data from drone or upload, then process for disease scoring.
          </p>
        </div>
        <div className="flex gap-2">
           <Badge variant="outline" className="px-3 py-1">
             <Camera className="w-3 h-3 mr-2" />
             Data Capture
           </Badge>
           <ArrowRight className="w-4 h-4 text-muted-foreground" />
           <Badge variant="outline" className="px-3 py-1">
             <Search className="w-3 h-3 mr-2" />
             Scoring Analysis
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Data Capture */}
          <Card className="border-primary/20 shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 bg-primary h-full" />
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider text-primary">
                <Camera className="w-4 h-4" />
                Step 1: Data Capture
              </CardTitle>
              {!selectedImage && !showCamera && (
                <Button size="sm" variant="outline" onClick={startCamera}>
                  <Camera className="w-4 h-4 mr-2" />
                  Use Camera
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-6">
              {showCamera ? (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden aspect-video border border-border bg-black">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-4 right-4 rounded-full"
                      onClick={stopCamera}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button onClick={capturePhoto} size="lg" className="rounded-full w-16 h-16 p-0 border-4 border-primary/20">
                      <div className="w-10 h-10 rounded-full bg-primary" />
                    </Button>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              ) : !selectedImage ? (
                <UploadZone 
                  onImageSelected={setSelectedImage} 
                  isProcessing={captureMutation.isPending}
                />
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden aspect-video border border-border shadow-inner bg-muted">
                    <img 
                      src={selectedImage} 
                      alt="Captured data" 
                      className="w-full h-full object-cover"
                    />
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="absolute top-4 right-4"
                      onClick={() => setSelectedImage(null)}
                      disabled={captureMutation.isPending}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button 
                      className="btn-primary"
                      onClick={handleCapture}
                      disabled={captureMutation.isPending}
                    >
                      {captureMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 mr-2" />
                      )}
                      Capture & Save Data
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
... [remaining content unchanged]

          {/* Step 2: Scoring Component */}
          <AnimatePresence>
            {activeReport && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="border-accent/20 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 bg-accent h-full" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider text-accent">
                      <Search className="w-4 h-4" />
                      Step 2: Scoring & Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="w-full md:w-48 aspect-square rounded-lg overflow-hidden shrink-0 border border-border">
                        <img src={activeReport.imageUrl} alt="To analyze" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-bold">Ready for Disease Analysis</h3>
                          <p className="text-sm text-muted-foreground">
                            Data capture # {activeReport.id} is pending scoring. The AI will analyze the plant structure for signs of root rot and other diseases.
                          </p>
                        </div>
                        <Button 
                          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                          onClick={() => handleProcess(activeReport.id)}
                          disabled={processMutation.isPending}
                        >
                          {processMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing Disease Scoring...
                            </>
                          ) : (
                            <>
                              <FileText className="w-4 h-4 mr-2" />
                              Run Disease Detection Report
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reports History */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Analysis History
            </h2>
            {isLoadingHistory ? (
              <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <div className="grid gap-4">
                {reports?.filter(r => r.status === 'complete' || r.status === 'failed').map((report) => {
                  const data = report.analysis as any;
                  return (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6"
                    >
                      <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0">
                        <img src={report.imageUrl} alt="Report thumbnail" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-lg">Report #{report.id}</h3>
                          <Badge variant={report.status === 'complete' ? 'outline' : 'destructive'}>
                            {report.status}
                          </Badge>
                        </div>

                        {data?.diseases?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {data.diseases.map((d: any, i: number) => (
                              <Badge key={i} variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {d.name} ({Math.round(d.confidence * 100)}%)
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Healthy / No Disease Detected
                          </Badge>
                        )}

                        <div className="text-sm text-muted-foreground">
                          <strong>Observed Symptoms:</strong> {data?.diseases?.flatMap((d: any) => d.symptoms).join(", ") || "None"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Analyzed on {new Date(report.createdAt!).toLocaleString()}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-secondary/30 border-secondary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-accent" />
                Detection Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <p>
                Our vision system is trained to identify complex plant pathologies including:
              </p>
              <ul className="list-disc pl-4 space-y-2 text-muted-foreground">
                <li><strong>Root Rot:</strong> Characterized by dark, mushy roots and stunted growth.</li>
                <li><strong>Leaf Rust:</strong> Identified by orange/brown pustules on foliage.</li>
                <li><strong>Blight:</strong> Rapid browning and death of plant tissues.</li>
                <li><strong>Mildew:</strong> White powdery substance on leaf surfaces.</li>
              </ul>
              <div className="p-3 bg-background/50 rounded-lg border border-border text-xs italic">
                Note: Captured images are stored in the data lake before being passed to the scoring engine.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
