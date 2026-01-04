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

async function seedDatabase() {
  const reports = await storage.getReports();
  if (reports.length === 0) {
    console.log("Seeding database...");
    await storage.createReport({
      imageUrl: "https://images.unsplash.com/photo-1625246333195-58197ebd0031", // Farm image
      analysis: {
        risks: [
          { risk: "Aphid Infestation", reason: "Yellowing leaves observed in lower quadrant." },
          { risk: "Soil Erosion", reason: "Exposed roots near the irrigation channel." }
        ],
        ipmMeasures: [
          "Introduce ladybugs to control aphids.",
          "Plant cover crops to stabilize soil."
        ],
        confirmed: true
      }
    });

    await storage.createSensorReading({
      soilMoisture: 45,
      humidity: 60,
      irrigationAdvice: "Irrigate soon. Soil moisture is getting low."
    });

    await storage.createAudioLog({
      distance: 15,
      calculatedVolume: 109 // 85 + 20*log10(15) ~= 108.5
    });
    console.log("Database seeded.");
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Seed the DB on startup
  seedDatabase().catch(console.error);

  // === Reports ===
  app.post(api.reports.create.path, async (req, res) => {
    try {
      const { imageUrl } = api.reports.create.input.parse(req.body);

      // Call OpenAI to analyze the image
      const prompt = `
        Analyze this image of an agricultural estate/farm. 
        Identify potential risks such as pests, diseases, hydration issues, or physical hazards.
        For each risk, provide a reason and suggest IPM (Integrated Pest Management) precautionary measures.
        
        Return a JSON object with this structure:
        {
          "risks": [{ "risk": "string", "reason": "string" }],
          "ipmMeasures": ["string"],
          "confirmed": boolean (true if risks are clearly visible)
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Using a vision-capable model
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      });

      const analysisContent = response.choices[0].message.content || "{}";
      const analysis = JSON.parse(analysisContent);

      const report = await storage.createReport({
        imageUrl,
        analysis,
      });

      res.status(201).json(report);
    } catch (err) {
      console.error("Report creation error:", err);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  app.get(api.reports.list.path, async (req, res) => {
    const reports = await storage.getReports();
    res.json(reports);
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
    
    // Simple logic for irrigation advice
    if (soilMoisture < 30) {
      advice = "CRITICAL: Irrigate immediately. Soil moisture is dangerously low.";
    } else if (soilMoisture < 50) {
      if (humidity > 80) {
        advice = "Monitor closely. Soil is drying, but high humidity will slow water loss. Irrigate within 24 hours.";
      } else {
        advice = "Irrigate soon. Soil moisture is getting low.";
      }
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

    // Goal: Maintain ~85dB at the target to deter animals effectively
    // Formula: L_source = L_target + 20 * log10(distance)
    
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
