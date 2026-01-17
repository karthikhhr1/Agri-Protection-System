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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Plus, 
  MapPin,
  Leaf,
  Droplets,
  Calendar,
  TrendingUp,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";
import type { FarmField } from "@shared/schema";

interface PolygonPoint {
  lat: number;
  lng: number;
}

function FieldPolygonMap({ polygon }: { polygon: PolygonPoint[] | unknown }) {
  const { t } = useLanguage();
  const points = Array.isArray(polygon) ? polygon as PolygonPoint[] : [];
  
  if (points.length < 3) {
    return (
      <div className="w-full h-40 sm:h-48 md:h-64 bg-muted/30 rounded-md flex items-center justify-center border border-dashed border-muted-foreground/30">
        <p className="text-muted-foreground text-xs sm:text-sm">{t('fieldSummary.noPolygonData')}</p>
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
  const height = 250;
  
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
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40 sm:h-48 md:h-64">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeOpacity="0.05" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
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

export default function FieldSummary() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [newField, setNewField] = useState({
    name: '',
    cropType: '',
    areaAcres: 0,
    soilType: '',
    irrigationType: 'drip',
    projectedYield: 0,
    historicalYield: 0,
    plantingDate: '',
    expectedHarvestDate: '',
    notes: '',
    polygon: [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 0.01 },
      { lat: 0.01, lng: 0.01 },
      { lat: 0.01, lng: 0 },
    ]
  });

  const { data: fields, isLoading } = useQuery<FarmField[]>({
    queryKey: ["/api/fields"],
  });

  useEffect(() => {
    if (fields && fields.length > 0 && selectedFieldId === null) {
      setSelectedFieldId(fields[0].id);
    }
  }, [fields, selectedFieldId]);

  const selectedField = fields?.find(f => f.id === selectedFieldId);

  const createField = useMutation({
    mutationFn: async (field: typeof newField) => {
      const res = await apiRequest("POST", "/api/fields", field);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/fields"] });
      setShowDialog(false);
      setSelectedFieldId(data.id);
      setNewField({
        name: '',
        cropType: '',
        areaAcres: 0,
        soilType: '',
        irrigationType: 'drip',
        projectedYield: 0,
        historicalYield: 0,
        plantingDate: '',
        expectedHarvestDate: '',
        notes: '',
        polygon: [
          { lat: 0, lng: 0 },
          { lat: 0, lng: 0.01 },
          { lat: 0.01, lng: 0.01 },
          { lat: 0.01, lng: 0 },
        ]
      });
      toast({ title: t('common.success'), description: t('fieldSummary.fieldCreated') });
    },
    onError: () => {
      toast({ title: t('common.error'), description: t('fieldSummary.createError'), variant: "destructive" });
    }
  });

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const irrigationTypes = ['drip', 'sprinkler', 'flood', 'rainfed'];

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 bg-background/50 min-h-screen">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-primary" data-testid="text-page-title">
            {t('fieldSummary.title')}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg mt-1">{t('fieldSummary.subtitle')}</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-add-field">
              <Plus className="w-4 h-4" />
              {t('fieldSummary.addField')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {t('fieldSummary.addField')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('fieldSummary.fieldName')}</Label>
                  <Input
                    value={newField.name}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    placeholder={t('fieldSummary.fieldNamePlaceholder')}
                    data-testid="input-field-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('fieldSummary.cropType')}</Label>
                  <Input
                    value={newField.cropType}
                    onChange={(e) => setNewField({ ...newField, cropType: e.target.value })}
                    placeholder={t('fieldSummary.cropTypePlaceholder')}
                    data-testid="input-crop-type"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t('fieldSummary.fieldSize')} (acres)</Label>
                  <Input
                    type="number"
                    value={newField.areaAcres}
                    onChange={(e) => setNewField({ ...newField, areaAcres: Number(e.target.value) })}
                    data-testid="input-area"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('fieldSummary.soilType')}</Label>
                  <Input
                    value={newField.soilType}
                    onChange={(e) => setNewField({ ...newField, soilType: e.target.value })}
                    placeholder={t('fieldSummary.soilTypePlaceholder')}
                    data-testid="input-soil-type"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('fieldSummary.irrigationType')}</Label>
                  <Select
                    value={newField.irrigationType}
                    onValueChange={(value) => setNewField({ ...newField, irrigationType: value })}
                  >
                    <SelectTrigger data-testid="select-irrigation-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {irrigationTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`fieldSummary.${type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('fieldSummary.projectedYield')} (kg)</Label>
                  <Input
                    type="number"
                    value={newField.projectedYield}
                    onChange={(e) => setNewField({ ...newField, projectedYield: Number(e.target.value) })}
                    data-testid="input-projected-yield"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('fieldSummary.historicalYield')} (kg)</Label>
                  <Input
                    type="number"
                    value={newField.historicalYield}
                    onChange={(e) => setNewField({ ...newField, historicalYield: Number(e.target.value) })}
                    data-testid="input-historical-yield"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('fieldSummary.plantingDate')}</Label>
                  <Input
                    type="date"
                    value={newField.plantingDate}
                    onChange={(e) => setNewField({ ...newField, plantingDate: e.target.value })}
                    data-testid="input-planting-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('fieldSummary.harvestDate')}</Label>
                  <Input
                    type="date"
                    value={newField.expectedHarvestDate}
                    onChange={(e) => setNewField({ ...newField, expectedHarvestDate: e.target.value })}
                    data-testid="input-harvest-date"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('fieldSummary.notes')}</Label>
                <Textarea
                  value={newField.notes}
                  onChange={(e) => setNewField({ ...newField, notes: e.target.value })}
                  placeholder={t('fieldSummary.fieldNotesPlaceholder')}
                  rows={3}
                  data-testid="input-notes"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  {t('common.cancel')}
                </Button>
                <Button 
                  onClick={() => createField.mutate(newField)}
                  disabled={!newField.name || createField.isPending}
                  data-testid="button-save-field"
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
          {isLoading ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {t('fieldSummary.mapView')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FieldPolygonMap polygon={selectedField.polygon} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="text-field-details-title">
                <FileText className="w-5 h-5 text-primary" />
                {t('fieldSummary.fieldDetails')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <h3 className="text-xl sm:text-2xl font-bold" data-testid="text-selected-field-name">{selectedField.name}</h3>
                <Badge variant="outline" className="text-sm sm:text-lg px-3 py-1 whitespace-nowrap">
                  {selectedField.areaAcres || 0} {t('fieldSummary.acres')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Leaf className="w-4 h-4" />
                    {t('fieldSummary.cropType')}
                  </p>
                  <p className="font-medium" data-testid="text-crop-type">{selectedField.cropType || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t('fieldSummary.soilType')}</p>
                  <p className="font-medium" data-testid="text-soil-type">{selectedField.soilType || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Droplets className="w-4 h-4" />
                    {t('fieldSummary.irrigationType')}
                  </p>
                  <p className="font-medium" data-testid="text-irrigation-type">
                    {selectedField.irrigationType ? t(`fieldSummary.${selectedField.irrigationType}`) : '-'}
                  </p>
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-md bg-muted/30 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-sm sm:text-base">{t('fieldSummary.yieldComparison')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('fieldSummary.projectedYield')}</p>
                    <p className="text-lg sm:text-xl font-bold text-primary" data-testid="text-projected-yield">
                      {selectedField.projectedYield || 0} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('fieldSummary.historicalYield')}</p>
                    <p className="text-lg sm:text-xl font-bold text-muted-foreground" data-testid="text-historical-yield">
                      {selectedField.historicalYield || 0} kg
                    </p>
                  </div>
                </div>
                {selectedField.projectedYield && selectedField.historicalYield && selectedField.historicalYield > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm">
                      {((selectedField.projectedYield - selectedField.historicalYield) / selectedField.historicalYield * 100).toFixed(1)}%{' '}
                      {selectedField.projectedYield >= selectedField.historicalYield ? (
                        <span className="text-green-600">{t('fieldSummary.increase')}</span>
                      ) : (
                        <span className="text-red-600">{t('fieldSummary.decrease')}</span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {t('fieldSummary.plantingDate')}
                  </p>
                  <p className="font-medium text-sm sm:text-base" data-testid="text-planting-date">
                    {formatDate(selectedField.plantingDate)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {t('fieldSummary.harvestDate')}
                  </p>
                  <p className="font-medium text-sm sm:text-base" data-testid="text-harvest-date">
                    {formatDate(selectedField.expectedHarvestDate)}
                  </p>
                </div>
              </div>

              {selectedField.notes && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t('fieldSummary.notes')}</p>
                  <p className="text-sm bg-muted/30 p-3 rounded-md" data-testid="text-notes">
                    {selectedField.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : !isLoading && fields?.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">{t('fieldSummary.noFields')}</p>
            <Button onClick={() => setShowDialog(true)} className="gap-2" data-testid="button-add-first-field">
              <Plus className="w-4 h-4" />
              {t('fieldSummary.addField')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
