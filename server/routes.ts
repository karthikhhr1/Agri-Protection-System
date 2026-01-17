import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { 
  farmTaskRequestSchema, 
  inventoryItemRequestSchema, 
  transactionRequestSchema,
  deterrentSettingsRequestSchema,
  irrigationSettingsRequestSchema
} from "@shared/schema";

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
        analysis: {},
      });
      await storage.createActivityLog({
        action: "detection",
        details: "New image captured for analysis",
        metadata: { reportId: report.id }
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

      const prompt = `
        You are a world-class plant pathologist and agricultural data scientist. 
        Analyze this agricultural image for ANY plant disease known to science. 
        
        Focus on "Beyond Good Intentions" principles: ecological durability, semi-arid land design, and restorative agriculture.

        Identify:
        1. Specific Disease (if present)
        2. Symptoms observed
        3. SEVERITY LEVEL: (none, low, medium, high, critical)
        4. CROP TYPE: Identify the crop in the image.
        5. IPM measures and risks.
        6. PRECAUTIONS: Provide detailed, actionable ecological precautions.
        7. RESTORATIVE ACTIONS: Suggest soil-building or biodiversity-enhancing measures.
        
        Return a JSON object with this exact structure:
        {
          "diseaseDetected": boolean,
          "severity": "string",
          "cropType": "string",
          "diseases": [{ "name": "string", "confidence": number, "symptoms": ["string"] }],
          "risks": [{ "risk": "string", "reason": "string" }],
          "ipmMeasures": ["string"],
          "precautions": ["string"],
          "restorativeActions": ["string"],
          "confirmed": boolean
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a specialized agricultural AI pathology unit." },
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
        status: "complete",
        severity: analysis.severity || "none",
        cropType: analysis.cropType || "unknown",
      });

      await storage.createActivityLog({
        action: "detection",
        details: `Analysis complete: ${analysis.diseaseDetected ? 'Disease detected' : 'No disease'} - ${analysis.cropType}`,
        metadata: { reportId: id, severity: analysis.severity }
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

  app.delete(api.reports.delete.path, async (req, res) => {
    try {
      await storage.deleteReport(Number(req.params.id));
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ message: "Failed to delete report" });
    }
  });

  app.post(api.reports.bulkDelete.path, async (req, res) => {
    try {
      const { ids } = z.object({ ids: z.array(z.number()) }).parse(req.body);
      await storage.bulkDeleteReports(ids);
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ message: "Failed to bulk delete reports" });
    }
  });

  // === Irrigation ===
  app.post(api.irrigation.calculate.path, async (req, res) => {
    const { soilMoisture, humidity } = api.irrigation.calculate.input.parse(req.body);

    const temperature = Math.floor(Math.random() * 15) + 20;
    const ambientHumidity = Math.floor(Math.random() * 40) + 40;

    // Get irrigation settings
    const settings = await storage.getIrrigationSettings();
    const threshold = settings?.moistureThreshold || 30;

    let advice = "";
    if (soilMoisture < threshold) {
      advice = "CRITICAL: Irrigate immediately. Soil moisture is below threshold.";
    } else if (soilMoisture < 50) {
      advice = humidity > 80 
        ? "Monitor closely. Soil is drying, but high humidity will slow water loss." 
        : "Irrigate soon. Soil moisture is getting low.";
    } else if (soilMoisture > 80) {
      advice = "Do not irrigate. Soil is saturated.";
    } else {
      advice = "Conditions optimal. No irrigation needed.";
    }

    const reading = await storage.createSensorReading({
      soilMoisture,
      humidity,
      temperature,
      ambientHumidity,
      irrigationAdvice: advice,
      healthScore: Math.round((soilMoisture + humidity + (100 - (temperature - 20) * 4)) / 3),
    });

    await storage.createActivityLog({
      action: "irrigation",
      details: advice,
      metadata: { soilMoisture, humidity, temperature }
    });

    res.status(201).json(reading);
  });

  app.get(api.irrigation.list.path, async (req, res) => {
    const readings = await storage.getSensorReadings();
    res.json(readings);
  });

  // === Irrigation Settings ===
  app.get("/api/irrigation/settings", async (req, res) => {
    const settings = await storage.getIrrigationSettings();
    res.json(settings || { isActive: false, moistureThreshold: 30, manualOverride: false });
  });

  app.patch("/api/irrigation/settings", async (req, res) => {
    try {
      const updates = irrigationSettingsRequestSchema.parse(req.body);
      const settings = await storage.updateIrrigationSettings(updates);
      
      await storage.createActivityLog({
        action: "irrigation",
        details: `Irrigation settings updated: ${JSON.stringify(updates)}`,
        metadata: updates
      });
      
      res.json(settings);
    } catch (err) {
      res.status(400).json({ message: "Invalid settings" });
    }
  });

  // === Audio ===
  app.post(api.audio.calculate.path, async (req, res) => {
    const { distance, coordinates } = api.audio.calculate.input.parse(req.body);
    
    // Get deterrent settings for volume calculation
    const settings = await storage.getDeterrentSettings();
    const baseVolume = settings?.volume || 70;
    const volume = Math.round(baseVolume + 20 * Math.log10(Number(distance)));

    const log = await storage.createAudioLog({
      distance: String(distance),
      calculatedVolume: volume,
      coordinates,
    });

    await storage.createActivityLog({
      action: "deterrent",
      details: `Acoustic barrier deployed at ${distance}m with ${volume}dB`,
      metadata: { distance, volume, coordinates }
    });

    res.status(201).json(log);
  });

  app.get(api.audio.list.path, async (req, res) => {
    const logs = await storage.getAudioLogs();
    res.json(logs);
  });

  // === Deterrent Settings ===
  app.get("/api/deterrent/settings", async (req, res) => {
    const settings = await storage.getDeterrentSettings();
    res.json(settings || { isEnabled: false, volume: 70, soundType: 'alarm', activationDistance: 50, autoActivate: true });
  });

  app.patch("/api/deterrent/settings", async (req, res) => {
    try {
      const updates = deterrentSettingsRequestSchema.parse(req.body);
      const settings = await storage.updateDeterrentSettings(updates);
      
      await storage.createActivityLog({
        action: "deterrent",
        details: `Deterrent settings updated: ${updates.isEnabled !== undefined ? (updates.isEnabled ? 'Enabled' : 'Disabled') : 'Modified'}`,
        metadata: updates
      });
      
      res.json(settings);
    } catch (err) {
      res.status(400).json({ message: "Invalid settings" });
    }
  });

  // === Animal Detections ===
  app.get("/api/detections", async (req, res) => {
    const detections = await storage.getAnimalDetections();
    res.json(detections);
  });

  app.post("/api/detections", async (req, res) => {
    try {
      const schema = z.object({
        animalType: z.string(),
        distance: z.number(),
        coordinates: z.object({ x: z.number(), y: z.number() }).optional(),
        imageUrl: z.string().optional(),
      });
      const data = schema.parse(req.body);
      
      const detection = await storage.createAnimalDetection({
        ...data,
        status: "detected",
        confidence: 0.85,
        deterrentActivated: false,
      });

      // Check if we should activate deterrent
      const settings = await storage.getDeterrentSettings();
      if (settings?.isEnabled && settings?.autoActivate && data.distance <= (settings?.activationDistance || 50)) {
        await storage.updateAnimalDetection(detection.id, { deterrentActivated: true });
        
        await storage.createActivityLog({
          action: "deterrent",
          details: `Deterrent auto-activated for ${data.animalType} at ${data.distance}m`,
          metadata: { detectionId: detection.id, animalType: data.animalType, distance: data.distance }
        });
      }

      await storage.createActivityLog({
        action: "detection",
        details: `Animal detected: ${data.animalType} at ${data.distance}m`,
        metadata: { detectionId: detection.id, animalType: data.animalType, distance: data.distance }
      });

      res.status(201).json(detection);
    } catch (err) {
      res.status(400).json({ message: "Failed to create detection" });
    }
  });

  // === Farm Tasks ===
  app.get("/api/tasks", async (req, res) => {
    const tasks = await storage.getFarmTasks();
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const data = farmTaskRequestSchema.parse(req.body);
      const task = await storage.createFarmTask({
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      });
      
      await storage.createActivityLog({
        action: "system",
        details: `Task created: ${data.title}`,
        metadata: { taskId: task.id }
      });
      
      res.status(201).json(task);
    } catch (err) {
      res.status(400).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updates = req.body;
      if (updates.dueDate) {
        updates.dueDate = new Date(updates.dueDate);
      }
      const task = await storage.updateFarmTask(id, updates);
      res.json(task);
    } catch (err) {
      res.status(400).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      await storage.deleteFarmTask(Number(req.params.id));
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // === Inventory ===
  app.get("/api/inventory", async (req, res) => {
    const items = await storage.getInventoryItems();
    res.json(items);
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const data = inventoryItemRequestSchema.parse(req.body);
      const item = await storage.createInventoryItem(data);
      
      await storage.createActivityLog({
        action: "system",
        details: `Inventory item added: ${data.name} (${data.category})`,
        metadata: { itemId: item.id }
      });
      
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ message: "Failed to create inventory item" });
    }
  });

  app.patch("/api/inventory/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const item = await storage.updateInventoryItem(id, req.body);
      res.json(item);
    } catch (err) {
      res.status(400).json({ message: "Failed to update inventory item" });
    }
  });

  app.delete("/api/inventory/:id", async (req, res) => {
    try {
      await storage.deleteInventoryItem(Number(req.params.id));
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });

  // === Transactions ===
  app.get("/api/transactions", async (req, res) => {
    const transactions = await storage.getTransactions();
    res.json(transactions);
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const data = transactionRequestSchema.parse(req.body);
      const trans = await storage.createTransaction({
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
      });
      
      await storage.createActivityLog({
        action: "system",
        details: `Transaction recorded: ${data.type} - ₹${data.amount} (${data.category})`,
        metadata: { transactionId: trans.id }
      });
      
      res.status(201).json(trans);
    } catch (err) {
      res.status(400).json({ message: "Failed to create transaction" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      await storage.deleteTransaction(Number(req.params.id));
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // === Activity Logs ===
  app.get("/api/logs", async (req, res) => {
    const logs = await storage.getActivityLogs();
    res.json(logs);
  });

  // === AI Assistant ===
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = z.object({ message: z.string() }).parse(req.body);
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are an AI agricultural assistant for AgriGuard. You help farmers with crop diseases, irrigation, and land management. Use the 'Beyond Good Intentions' principles: ecological durability, semi-arid land design, and restorative agriculture. Answer concisely and practically." 
          },
          { role: "user", content: message },
        ],
      });
      res.json({ message: response.choices[0].message.content });
    } catch (err) {
      console.error("Chat error:", err);
      res.status(500).json({ message: "Failed to process AI request" });
    }
  });

  return httpServer;
}
