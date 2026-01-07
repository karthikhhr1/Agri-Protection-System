import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // === Reports ===
  app.get(api.reports.list.path, async (req, res) => {
    const reports = await storage.getReports();
    res.json(reports);
  });

  app.post(api.reports.capture.path, async (req, res) => {
    try {
      const { imageUrl } = api.reports.capture.input.parse(req.body);
      const report = await storage.createReport({
        imageUrl,
        status: "pending",
        analysis: null,
      });
      res.status(201).json(report);
    } catch (err) {
      res.status(400).json({ message: "Failed to capture image" });
    }
  });

  app.post(api.reports.process.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const report = await storage.getReport(id);
      if (!report) return res.status(404).json({ message: "Report not found" });

      // Call OpenAI to analyze the image for diseases
      const prompt = `
        Analyze this agricultural image for plant diseases (e.g., root rot, leaf spot, rust).
        Identify the specific disease if present, list symptoms observed, and provide potential risks and IPM (Integrated Pest Management) measures.
        
        Return a JSON object with this structure:
        {
          "diseaseDetected": boolean,
          "diseases": [{ "name": "string", "confidence": number, "symptoms": ["string"] }],
          "risks": [{ "risk": "string", "reason": "string" }],
          "ipmMeasures": ["string"],
          "confirmed": boolean
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: report.imageUrl } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      });

      const analysisContent = response.choices[0].message.content || "{}";
      const analysis = JSON.parse(analysisContent);

      const updatedReport = await storage.updateReport(id, {
        analysis,
        status: "complete"
      });

      res.json(updatedReport);
    } catch (err) {
      console.error("Report processing error:", err);
      res.status(500).json({ message: "Failed to process report" });
    }
  });

  app.get(api.reports.get.path, async (req, res) => {
    const report = await storage.getReport(Number(req.params.id));
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  });

  // === Irrigation ===
  app.post(api.irrigation.calculate.path, async (req, res) => {
    const { soilMoisture, humidity } = api.irrigation.calculate.input.parse(req.body);

    let advice = "";
    if (soilMoisture < 30) {
      advice = "CRITICAL: Irrigate immediately. Soil moisture is dangerously low.";
    } else if (soilMoisture < 50) {
      advice = humidity > 80 
        ? "Monitor closely. Soil is drying, but high humidity will slow water loss. Irrigate within 24 hours." 
        : "Irrigate soon. Soil moisture is getting low.";
    } else if (soilMoisture > 80) {
      advice = "Do not irrigate. Soil is saturated. Check for drainage issues if this persists.";
    } else {
      advice = "Conditions optimal. No irrigation needed at this time.";
    }

    const reading = await storage.createSensorReading({
      soilMoisture,
      humidity,
      irrigationAdvice: advice,
    });

    res.status(201).json(reading);
  });

  app.get(api.irrigation.list.path, async (req, res) => {
    const readings = await storage.getSensorReadings();
    res.json(readings);
  });

  // === Audio ===
  app.post(api.audio.calculate.path, async (req, res) => {
    const { distance } = api.audio.calculate.input.parse(req.body);
    const TARGET_DB = 85;
    const volume = Math.round(TARGET_DB + 20 * Math.log10(distance));

    const log = await storage.createAudioLog({
      distance,
      calculatedVolume: volume,
    });

    res.status(201).json(log);
  });

  return httpServer;
}
