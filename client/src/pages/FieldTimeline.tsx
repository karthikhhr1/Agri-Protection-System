import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Plus, 
  MapPin,
  Leaf,
  Calendar,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import type { FarmField, FieldCapture } from "@shared/schema";

interface PolygonPoint {
  lat: number;
  lng: number;
}

interface HealthDiagnostic {
  score?: number;
  issues?: string[];
  recommendations?: string[];
}

function FieldPolygonMap({ polygon }: { polygon: PolygonPoint[] | unknown }) {
  const { t } = useLanguage();
  const points = Array.isArray(polygon) ? polygon as PolygonPoint[] : [];
  
  if (points.length < 3) {
    return (
      <div className="w-full h-40 sm:h-48 bg-muted/30 rounded-md flex items-center justify-center border border-dashed border-muted-foreground/30">
        <p className="text-muted-foreground text-xs sm:text-sm">{t('fieldTimeline.noPolygonData')}</p>
      </div>
    );
  }

  const lats = points.map(p => p.lat);
  const lngs = points.map(p => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  const padding = 20;
  const width = 400;
  const height = 200;
  
  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;
  
  const scaleX = (width - 2 * padding) / lngRange;
  const scaleY = (height - 2 * padding) / latRange;
  
  const svgPoints = points.map(p => {
    const x = padding + (p.lng - minLng) * scaleX;
    const y = height - padding - (p.lat - minLat) * scaleY;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full overflow-hidden rounded-md border border-border bg-gradient-to-br from-green-900/20 via-green-800/10 to-amber-900/10">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40 sm:h-48">
        <defs>
          <pattern id="timeline-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeOpacity="0.05" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#timeline-grid)" />
        <polygon 
          points={svgPoints} 
          fill="hsl(var(--primary) / 0.3)" 
          stroke="hsl(var(--primary))" 
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {points.map((p, i) => {
          const x = padding + (p.lng - minLng) * scaleX;
          const y = height - padding - (p.lat - minLat) * scaleY;
          return (
            <circle 
              key={i} 
              cx={x} 
              cy={y} 
              r="4" 
              fill="hsl(var(--primary))"
              stroke="hsl(var(--background))"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
}

function CaptureTimeline({ 
  captures, 
  selectedCaptureId, 
  onSelectCapture 
}: { 
  captures: FieldCapture[];
  selectedCaptureId: number | null;
  onSelectCapture: (id: number) => void;
}) {
  const { t, formatDate } = useLanguage();
  const sortedCaptures = [...captures].sort((a, b) => 
    new Date(a.captureDate).getTime() - new Date(b.captureDate).getTime()
  );

  if (sortedCaptures.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Clock className="w-5 h-5 mr-2" />
        <span>{t('fieldTimeline.noCapturesYet')}</span>
      </div>
    );
  }

  return (
    <div className="relative py-8">
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />
      <ScrollArea className="w-full">
        <div className="flex items-center gap-8 px-4 min-w-max">
          {sortedCaptures.map((capture, index) => {
            const isSelected = capture.id === selectedCaptureId;
            const diagnostic = capture.healthDiagnostic as HealthDiagnostic | null;
            const score = diagnostic?.score;
            
            return (
              <motion.button
                key={capture.id}
                onClick={() => onSelectCapture(capture.id)}
                className="flex flex-col items-center relative z-10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-testid={`button-capture-${capture.id}`}
              >
                <div 
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-primary border-primary text-primary-foreground scale-125' 
                      : score !== undefined && score >= 70
                        ? 'bg-green-500/20 border-green-500 text-green-600'
                        : score !== undefined && score >= 40
                          ? 'bg-orange-500/20 border-orange-500 text-orange-600'
                          : score !== undefined
                            ? 'bg-red-500/20 border-red-500 text-red-600'
                            : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                </div>
                <span className={`text-xs mt-2 whitespace-nowrap ${isSelected ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                  {formatDate(capture.captureDate, { month: 'short', day: 'numeric' })}
                </span>
                {score !== undefined && (
                  <Badge 
                    variant="secondary" 
                    className={`text-xs mt-1 ${
                      score >= 70 ? 'bg-green-500/10 text-green-600' :
                      score >= 40 ? 'bg-orange-500/10 text-orange-600' :
                      'bg-red-500/10 text-red-600'
                    }`}
                  >
                    {score}%
                  </Badge>
                )}
              </motion.button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

function CaptureGallery({ capture }: { capture: FieldCapture }) {
  const { t, formatDate } = useLanguage();
  const imageUrls = Array.isArray(capture.imageUrls) ? capture.imageUrls as string[] : [];
  const diagnostic = capture.healthDiagnostic as HealthDiagnostic | null;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 flex-shrink-0">
          <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
          {formatDate(capture.captureDate)}
        </h3>
        {diagnostic?.score !== undefined && (
          <Badge 
            className={`text-xs sm:text-sm px-2 sm:px-3 py-1 whitespace-nowrap ${
              diagnostic.score >= 70 ? 'bg-green-500/10 text-green-600 border-green-500/20' :
              diagnostic.score >= 40 ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
              'bg-red-500/10 text-red-600 border-red-500/20'
            }`}
          >
            {t('fieldTimeline.healthScore')}: {diagnostic.score}/100
          </Badge>
        )}
      </div>

      {imageUrls.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {imageUrls.map((url, index) => (
            <div key={index} className="space-y-2">
              <div className="aspect-video rounded-md overflow-hidden border border-border bg-muted/30">
                <img 
                  src={url} 
                  alt={`${t('fieldTimeline.captureDetails')} ${index + 1}`}
                  className="w-full h-full object-cover"
                  data-testid={`image-capture-${capture.id}-${index}`}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8 bg-muted/30 rounded-md border border-dashed border-muted-foreground/30">
          <p className="text-muted-foreground text-sm">{t('fieldTimeline.noImagesInCapture')}</p>
        </div>
      )}

      {diagnostic && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {diagnostic.issues && diagnostic.issues.length > 0 && (
            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{t('fieldTimeline.issuesDetected')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {diagnostic.issues.map((issue, i) => (
                    <li key={i} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-orange-500 mt-1 flex-shrink-0">-</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {diagnostic.recommendations && diagnostic.recommendations.length > 0 && (
            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{t('fieldTimeline.recommendations')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {diagnostic.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500 mt-1 flex-shrink-0">-</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {capture.notes && (
        <div className="p-3 sm:p-4 bg-muted/30 rounded-md border border-border">
          <p className="text-xs sm:text-sm text-muted-foreground">{capture.notes}</p>
        </div>
      )}
    </div>
  );
}

export default function FieldTimeline() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  const [selectedCaptureId, setSelectedCaptureId] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [newCapture, setNewCapture] = useState({
    captureDate: new Date().toISOString().split('T')[0],
    imageUrls: '',
    healthScore: 80,
    issues: '',
    recommendations: '',
    notes: ''
  });

  const { data: fields, isLoading: fieldsLoading } = useQuery<FarmField[]>({
    queryKey: ["/api/fields"],
  });

  const { data: captures, isLoading: capturesLoading } = useQuery<FieldCapture[]>({
    queryKey: ["/api/fields", selectedFieldId, "captures"],
    enabled: selectedFieldId !== null,
  });

  useEffect(() => {
    if (fields && fields.length > 0 && selectedFieldId === null) {
      setSelectedFieldId(fields[0].id);
    }
  }, [fields, selectedFieldId]);

  useEffect(() => {
    if (captures && captures.length > 0 && selectedCaptureId === null) {
      const sorted = [...captures].sort((a, b) => 
        new Date(b.captureDate).getTime() - new Date(a.captureDate).getTime()
      );
      setSelectedCaptureId(sorted[0].id);
    }
  }, [captures, selectedCaptureId]);

  useEffect(() => {
    setSelectedCaptureId(null);
  }, [selectedFieldId]);

  const selectedField = fields?.find(f => f.id === selectedFieldId);
  const selectedCapture = captures?.find(c => c.id === selectedCaptureId);

  const createCapture = useMutation({
    mutationFn: async (data: typeof newCapture) => {
      const imageUrlsArray = data.imageUrls.split('\n').filter(url => url.trim());
      const issuesArray = data.issues.split('\n').filter(i => i.trim());
      const recommendationsArray = data.recommendations.split('\n').filter(r => r.trim());
      
      const res = await apiRequest("POST", `/api/fields/${selectedFieldId}/captures`, {
        captureDate: data.captureDate,
        imageUrls: imageUrlsArray,
        healthDiagnostic: {
          score: data.healthScore,
          issues: issuesArray,
          recommendations: recommendationsArray
        },
        notes: data.notes || undefined
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/fields", selectedFieldId, "captures"] });
      setShowDialog(false);
      setSelectedCaptureId(data.id);
      setNewCapture({
        captureDate: new Date().toISOString().split('T')[0],
        imageUrls: '',
        healthScore: 80,
        issues: '',
        recommendations: '',
        notes: ''
      });
      toast({ title: t('common.success'), description: t('fieldTimeline.captureAdded') });
    },
    onError: () => {
      toast({ title: t('common.error'), description: t('fieldTimeline.captureError'), variant: "destructive" });
    }
  });

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 bg-background/50 min-h-screen">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-primary" data-testid="text-page-title">
            {t('fieldTimeline.title')}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg mt-1">{t('fieldTimeline.subtitle')}</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button 
              className="gap-2" 
              disabled={!selectedFieldId}
              data-testid="button-add-capture"
            >
              <Plus className="w-4 h-4" />
              {t('fieldTimeline.addCapture')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                {t('fieldTimeline.addCapture')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t('fieldTimeline.captureDate')}</Label>
                <Input
                  type="date"
                  value={newCapture.captureDate}
                  onChange={(e) => setNewCapture({ ...newCapture, captureDate: e.target.value })}
                  data-testid="input-capture-date"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('fieldTimeline.imageUrls')}</Label>
                <Textarea
                  value={newCapture.imageUrls}
                  onChange={(e) => setNewCapture({ ...newCapture, imageUrls: e.target.value })}
                  placeholder={t('fieldTimeline.imageUrlsPlaceholder')}
                  rows={3}
                  data-testid="input-image-urls"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('fieldTimeline.healthScore')} ({newCapture.healthScore})</Label>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={newCapture.healthScore}
                  onChange={(e) => setNewCapture({ ...newCapture, healthScore: Number(e.target.value) })}
                  data-testid="input-health-score"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('fieldTimeline.issuesDetected')}</Label>
                <Textarea
                  value={newCapture.issues}
                  onChange={(e) => setNewCapture({ ...newCapture, issues: e.target.value })}
                  placeholder={t('fieldTimeline.issuesPlaceholder')}
                  rows={2}
                  data-testid="input-issues"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('fieldTimeline.recommendations')}</Label>
                <Textarea
                  value={newCapture.recommendations}
                  onChange={(e) => setNewCapture({ ...newCapture, recommendations: e.target.value })}
                  placeholder={t('fieldTimeline.recommendationsPlaceholder')}
                  rows={2}
                  data-testid="input-recommendations"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('fieldTimeline.notes')}</Label>
                <Textarea
                  value={newCapture.notes}
                  onChange={(e) => setNewCapture({ ...newCapture, notes: e.target.value })}
                  placeholder={t('fieldTimeline.notesPlaceholder')}
                  rows={2}
                  data-testid="input-notes"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  {t('common.cancel')}
                </Button>
                <Button 
                  onClick={() => createCapture.mutate(newCapture)}
                  disabled={!newCapture.captureDate || createCapture.isPending}
                  data-testid="button-save-capture"
                >
                  {t('common.save')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-4">
          {fieldsLoading ? (
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 w-40 rounded-md bg-muted animate-pulse" />
              ))}
            </div>
          ) : fields?.length === 0 ? (
            <div className="flex items-center justify-center w-full py-8">
              <p className="text-muted-foreground">{t('fieldSummary.noFields')}</p>
            </div>
          ) : (
            fields?.map((field) => (
              <motion.button
                key={field.id}
                onClick={() => setSelectedFieldId(field.id)}
                className={`flex-shrink-0 p-4 rounded-md border transition-all min-w-[160px] text-left ${
                  selectedFieldId === field.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 bg-card'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                data-testid={`button-field-${field.id}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className={`w-4 h-4 ${selectedFieldId === field.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-semibold truncate">{field.name}</span>
                </div>
                {field.cropType && (
                  <Badge variant="secondary" className="text-xs">
                    <Leaf className="w-3 h-3 mr-1" />
                    {field.cropType}
                  </Badge>
                )}
              </motion.button>
            ))
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {selectedField ? (
        <div className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-2 truncate">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="truncate">{selectedField.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FieldPolygonMap polygon={selectedField.polygon} />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="truncate">{t('fieldTimeline.captureTimeline')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {capturesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : (
                  <CaptureTimeline 
                    captures={captures || []} 
                    selectedCaptureId={selectedCaptureId}
                    onSelectCapture={setSelectedCaptureId}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {selectedCapture && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Camera className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="truncate">{t('fieldTimeline.captureDetails')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CaptureGallery capture={selectedCapture} />
              </CardContent>
            </Card>
          )}

          {!selectedCapture && captures?.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                <Camera className="w-10 sm:w-12 h-10 sm:h-12 text-muted-foreground mb-3 sm:mb-4" />
                <p className="text-muted-foreground text-center text-sm sm:text-base mb-4">{t('fieldTimeline.noCaptures')}</p>
                <Button onClick={() => setShowDialog(true)} className="gap-2 text-xs sm:text-sm" data-testid="button-add-first-capture">
                  <Plus className="w-4 h-4" />
                  {t('fieldTimeline.addCapture')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ) : !fieldsLoading && fields?.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
            <MapPin className="w-10 sm:w-12 h-10 sm:h-12 text-muted-foreground mb-3 sm:mb-4" />
            <p className="text-muted-foreground text-center text-sm sm:text-base">{t('fieldSummary.noFields')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
