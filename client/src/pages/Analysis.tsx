import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadZone } from "@/components/UploadZone";
import { useCreateReport, useReports } from "@/hooks/use-agri";
import { AlertTriangle, CheckCircle2, Loader2, ShieldAlert, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Analysis() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { mutate: analyze, isPending } = useCreateReport();
  const { data: reports, isLoading: isLoadingHistory } = useReports();

  const handleAnalyze = () => {
    if (!selectedImage) return;
    analyze(
      { imageUrl: selectedImage },
      {
        onSuccess: () => {
          setSelectedImage(null);
        },
      }
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Drone Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Upload aerial imagery to detect potential risks and generate IPM reports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Upload & Action */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-border shadow-md">
            <CardContent className="p-6">
              {!selectedImage ? (
                <UploadZone 
                  onImageSelected={setSelectedImage} 
                  isProcessing={isPending}
                />
              ) : (
                <div className="space-y-6">
                  <div className="relative rounded-xl overflow-hidden aspect-video border border-border shadow-inner bg-muted">
                    {/* HTML comment for Unsplash: crop disease wheat field */}
                    <img 
                      src={selectedImage} 
                      alt="Drone capture" 
                      className="w-full h-full object-cover"
                    />
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="absolute top-4 right-4"
                      onClick={() => setSelectedImage(null)}
                      disabled={isPending}
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedImage(null)}
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="btn-primary min-w-[140px]"
                      onClick={handleAnalyze}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Generate Report
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Reports List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Recent Analysis Reports</h2>
            {isLoadingHistory ? (
              <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <div className="grid gap-4">
                {reports?.map((report) => {
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
                          <h3 className="font-bold text-lg">Field Scan #{report.id}</h3>
                          <span className="text-xs text-muted-foreground">
                            {new Date(report.createdAt!).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {data.risks.length > 0 ? (
                            data.risks.map((r: any, i: number) => (
                              <Badge key={i} variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {r.risk}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              No Risks Detected
                            </Badge>
                          )}
                        </div>

                        <div className="text-sm text-muted-foreground line-clamp-2">
                          <strong>IPM Measures:</strong> {data.ipmMeasures.join(", ")}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Info Panel */}
        <div className="space-y-6">
          <Card className="bg-secondary/30 border-secondary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-accent" />
                IPM Protocols
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <p>
                Integrated Pest Management (IPM) is an ecosystem-based strategy that focuses on long-term prevention of pests or their damage through a combination of techniques.
              </p>
              <ul className="list-disc pl-4 space-y-2 text-muted-foreground">
                <li>Biological control</li>
                <li>Habitat manipulation</li>
                <li>Modification of cultural practices</li>
                <li>Use of resistant varieties</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
