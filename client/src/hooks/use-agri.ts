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
      return api.reports.list.responses[200].parse(await res.json());
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
      return api.reports.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: AnalyzeImageRequest) => {
      const res = await fetch(api.reports.create.path, {
        method: api.reports.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to analyze image");
      }
      return api.reports.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reports.list.path] });
      toast({
        title: "Analysis Complete",
        description: "The drone image has been processed successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// === IRRIGATION ===

export function useIrrigationHistory() {
  return useQuery({
    queryKey: [api.irrigation.list.path],
    queryFn: async () => {
      const res = await fetch(api.irrigation.list.path);
      if (!res.ok) throw new Error("Failed to fetch irrigation history");
      return api.irrigation.list.responses[200].parse(await res.json());
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
      return api.irrigation.calculate.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.irrigation.list.path] });
      toast({
        title: "Advice Generated",
        description: `Recommendation: ${data.irrigationAdvice}`,
      });
    },
  });
}

// === AUDIO DETERRENT ===

export function useCalculateAudio() {
  return useMutation({
    mutationFn: async (data: AudioRequest) => {
      const res = await fetch(api.audio.calculate.path, {
        method: api.audio.calculate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to calculate volume");
      return api.audio.calculate.responses[201].parse(await res.json());
    },
  });
}
