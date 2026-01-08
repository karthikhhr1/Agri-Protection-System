import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type analyzeImageSchema, type irrigationRequestSchema, type audioRequestSchema } from "@shared/routes";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// Types derived from schema
type AnalyzeImageRequest = z.infer<typeof analyzeImageSchema>;
type IrrigationRequest = z.infer<typeof irrigationRequestSchema>;
type AudioRequest = z.infer<typeof audioRequestSchema>;

// === REPORTS (Drone Analysis) ===

export function useReports() {
  return useQuery({
    queryKey: [api.reports.list.path],
    queryFn: async () => {
      const res = await fetch(api.reports.list.path);
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json();
    },
  });
}

export function useReport(id: number) {
  return useQuery({
    queryKey: [api.reports.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.reports.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch report");
      return res.json();
    },
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.reports.capture.path, {
        method: api.reports.capture.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to analyze image");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reports.list.path] });
      toast({
        title: "Analysis Complete",
        description: "The drone image has been processed successfully.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(buildUrl(api.reports.delete.path, { id }), {
        method: api.reports.delete.method,
      });
      if (!res.ok) throw new Error("Failed to delete report");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reports.list.path] });
      toast({ title: "Report Deleted", description: "The pathology record has been removed." });
    },
  });
}

export function useBulkDeleteReports() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await fetch(api.reports.bulkDelete.path, {
        method: api.reports.bulkDelete.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Failed to bulk delete reports");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reports.list.path] });
      toast({ title: "Reports Deleted", description: "The selected records have been removed." });
    },
  });
}

// === IRRIGATION ===

export function useIrrigationHistory() {
  return useQuery({
    queryKey: [api.irrigation.list.path],
    queryFn: async () => {
      const res = await fetch(api.irrigation.list.path);
      if (!res.ok) throw new Error("Failed to fetch irrigation history");
      return res.json();
    },
  });
}

export function useCalculateIrrigation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: IrrigationRequest) => {
      const res = await fetch(api.irrigation.calculate.path, {
        method: api.irrigation.calculate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to calculate irrigation advice");
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [api.irrigation.list.path] });
      toast({
        title: "Advice Generated",
        description: `Recommendation: ${data.irrigationAdvice}`,
      });
    },
  });
}

// === AUDIO DETERRENT ===

export function useAudioLogs() {
  return useQuery({
    queryKey: [api.audio.list.path],
    queryFn: async () => {
      const res = await fetch(api.audio.list.path);
      if (!res.ok) throw new Error("Failed to fetch audio logs");
      return res.json();
    },
  });
}

export function useCalculateAudio() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.audio.calculate.path, {
        method: api.audio.calculate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to calculate volume");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.audio.list.path] });
    }
  });
}
