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
  irrigationSettingsRequestSchema,
  farmFieldRequestSchema,
  fieldCaptureRequestSchema
} from "@shared/schema";
import { indianWildlifeFrequencies, getRecommendedFrequency } from "@shared/animalFrequencies";

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
        You are an expert agricultural advisor specializing in Indian farming.
        Analyze this crop image and provide a COMPREHENSIVE report that is EASY FOR FARMERS TO UNDERSTAND.
        Use simple, everyday language - avoid technical jargon.
        
        SCAN FOR EVERYTHING - Check for ALL of the following:
        
        === DISEASES (Check ALL categories) ===
        FUNGAL: Powdery mildew, Downy mildew, Rust, Blight (Early/Late), Anthracnose, Fusarium wilt, Verticillium wilt, Damping off, Root rot, Leaf spot, Cercospora, Alternaria, Botrytis, Black spot, White mold, Smut, Ergot
        BACTERIAL: Bacterial wilt, Bacterial leaf blight, Bacterial soft rot, Fire blight, Black rot, Canker, Crown gall, Citrus canker, Angular leaf spot
        VIRAL: Mosaic virus, Leaf curl, Yellow vein mosaic, Bunchy top, Ring spot, Streak virus, Spotted wilt, Tungro, Grassy stunt
        NUTRIENT DEFICIENCY: Nitrogen (yellowing), Phosphorus (purple leaves), Potassium (brown edges), Iron chlorosis, Magnesium, Calcium, Zinc, Boron, Manganese deficiency
        ENVIRONMENTAL: Sunburn, Frost damage, Water stress, Salt injury, Herbicide damage, Ozone damage
        
        === INSECTS & PESTS (Check ALL categories) ===
        SUCKING PESTS: Aphids (green, black, brown, cotton), Whiteflies, Mealybugs, Scale insects, Leafhoppers, Jassids, Thrips, Psyllids, Plant bugs, Spider mites, Red mites, Two-spotted mites
        CHEWING PESTS: Caterpillars (armyworm, cutworm, bollworm, stem borer, fruit borer, leaf roller, tent caterpillar, diamondback moth larvae, tobacco caterpillar, gram pod borer), Beetles (flea beetle, leaf beetle, Colorado potato beetle, ladybird beetle, weevils, grubs), Grasshoppers, Locusts, Crickets, Earwigs
        BORING PESTS: Stem borers, Fruit borers, Shoot borers, Root borers, Wood borers, Bark beetles, Gall makers
        ROOT PESTS: Root-knot nematodes, Cyst nematodes, Root aphids, Wireworms, White grubs, Chafer grubs, Root maggots, Termites
        OTHERS: Slugs, Snails, Ants, Fruit flies, Leaf miners, Sawflies, Bagworms, Tussock moths
        
        === EGGS & LARVAE (Look carefully) ===
        - Egg masses on leaves (butterfly, moth, beetle eggs)
        - Single eggs in clusters or scattered
        - Larvae/grubs in soil, stems, fruits, leaves
        - Pupae or cocoons
        - Webbing, silk trails, frass (insect droppings)
        
        === DAMAGE PATTERNS ===
        - Holes in leaves (irregular, round, shot-hole)
        - Tunnels/mines in leaves
        - Rolled or webbed leaves
        - Skeletonized leaves
        - Wilting tips or shoots
        - Galls or swellings
        - Honeydew or sooty mold
        - Discoloration patterns
        
        Rate severity: none, low, medium, high, or critical
        
        Be SPECIFIC with treatment advice:
        - Name actual products farmers can buy locally in India
        - Give exact quantities (e.g., "2 tablespoons per liter of water")
        - Give timing (e.g., "spray every 7 days for 3 weeks")
        - Include both organic (neem oil, panchagavya, jeevamrutha) and chemical options
        
        Return a JSON object with this exact structure:
        {
          "diseaseDetected": boolean,
          "pestsDetected": boolean,
          "severity": "none" | "low" | "medium" | "high" | "critical",
          "cropType": "string (crop name in simple terms)",
          "summary": "string (1-2 sentence plain language summary of ALL findings)",
          "diseases": [{ 
            "name": "string (disease name)", 
            "localName": "string (Hindi/regional name if known)",
            "category": "fungal" | "bacterial" | "viral" | "nutrient" | "environmental",
            "confidence": number (0-100),
            "symptoms": ["string (visible symptoms described simply)"]
          }],
          "pests": [{
            "name": "string (pest/insect name)",
            "localName": "string (Hindi/regional name if known)",
            "category": "sucking" | "chewing" | "boring" | "root" | "mite" | "other",
            "type": "insect" | "mite" | "worm" | "larvae" | "eggs" | "nematode" | "slug" | "other",
            "lifestage": "egg" | "larvae" | "pupa" | "adult" | "unknown",
            "confidence": number (0-100),
            "description": "string (what it looks like - color, size, shape)",
            "damageType": "string (what damage it causes)",
            "location": "string (where on the plant it was found)"
          }],
          "whatToDoNow": [{
            "step": number,
            "action": "string (clear action)",
            "details": "string (specific instructions with quantities/timing)",
            "urgency": "immediate" | "within3days" | "thisWeek"
          }],
          "prevention": [{
            "tip": "string (prevention method)",
            "when": "string (when to do this)"
          }],
          "warningSigns": ["string (signs to watch for)"],
          "risks": [{ "risk": "string", "reason": "string" }],
          "organicOptions": ["string (natural/organic treatment options with dosage)"],
          "chemicalOptions": ["string (chemical treatment options with product names and dosage)"],
          "estimatedRecoveryTime": "string (how long until crop recovers)",
          "canHarvest": boolean,
          "harvestAdvice": "string (if can harvest, any precautions)",
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
      let analysis;
      try {
        analysis = JSON.parse(analysisContent);
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        analysis = {
          diseaseDetected: false,
          severity: "none",
          cropType: "unknown",
          summary: "Unable to analyze image. Please try again with a clearer photo.",
          diseases: [],
          whatToDoNow: [],
          prevention: [],
          warningSigns: [],
          organicOptions: [],
          chemicalOptions: [],
          confirmed: false
        };
      }

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
      
      // Get optimal frequency for this animal type automatically
      const animalData = indianWildlifeFrequencies.find(a => a.id === data.animalType);
      const optimalFrequency = animalData?.optimalFrequency || getRecommendedFrequency([data.animalType]);
      const effectiveness = animalData?.effectiveness || 'medium';
      
      const detection = await storage.createAnimalDetection({
        ...data,
        status: "detected",
        confidence: 0.85,
        deterrentActivated: false,
      });

      // FULLY AUTOMATED: Check if we should activate deterrent
      const settings = await storage.getDeterrentSettings();
      if (settings?.isEnabled && settings?.autoActivate && data.distance <= (settings?.activationDistance || 50)) {
        await storage.updateAnimalDetection(detection.id, { 
          deterrentActivated: true,
          status: "deterred"
        });
        
        // Calculate volume based on distance (louder for closer animals)
        const baseVolume = settings?.volume || 70;
        const distanceMultiplier = Math.max(1, 100 / data.distance);
        const calculatedVolume = Math.min(100, Math.round(baseVolume * distanceMultiplier / 2));
        
        // Log the automated deterrent activation with frequency
        await storage.createAudioLog({
          distance: String(data.distance),
          calculatedVolume,
          coordinates: data.coordinates || { x: 0, y: 0 },
        });
        
        await storage.createActivityLog({
          action: "deterrent",
          details: `AUTO: Deterrent activated for ${data.animalType} at ${data.distance}m using ${optimalFrequency}kHz (${effectiveness} effectiveness)`,
          metadata: { 
            detectionId: detection.id, 
            animalType: data.animalType, 
            distance: data.distance,
            frequency: optimalFrequency,
            effectiveness,
            volume: calculatedVolume,
            automated: true
          }
        });
      }

      await storage.createActivityLog({
        action: "detection",
        details: `Animal detected: ${data.animalType} at ${data.distance}m`,
        metadata: { detectionId: detection.id, animalType: data.animalType, distance: data.distance, frequency: optimalFrequency }
      });

      res.status(201).json({ ...detection, optimalFrequency, effectiveness });
    } catch (err) {
      res.status(400).json({ message: "Failed to create detection" });
    }
  });

  // === Automated Camera Monitoring ===
  // This endpoint simulates what a real camera would do when connected
  // In production, this would be triggered by actual camera feeds
  app.post("/api/detections/simulate-camera", async (req, res) => {
    try {
      const settings = await storage.getDeterrentSettings();
      if (!settings?.isEnabled) {
        return res.json({ message: "Deterrent system is disabled", simulated: false });
      }

      // Simulate random animal detection (in real system, this comes from camera AI)
      const animalTypes = ['elephant', 'nilgai', 'wild_boar', 'rhesus_macaque', 'peacock', 'rat', 'bandicoot'];
      const randomAnimal = animalTypes[Math.floor(Math.random() * animalTypes.length)];
      const randomDistance = Math.floor(Math.random() * 80) + 10; // 10-90 meters
      
      const animalData = indianWildlifeFrequencies.find(a => a.id === randomAnimal);
      const optimalFrequency = animalData?.optimalFrequency || 20;
      const effectiveness = animalData?.effectiveness || 'medium';
      
      const detection = await storage.createAnimalDetection({
        animalType: randomAnimal,
        distance: randomDistance,
        status: "detected",
        confidence: 0.75 + Math.random() * 0.2,
        deterrentActivated: false,
        coordinates: { x: Math.random() * 100, y: Math.random() * 100 },
      });

      let deterrentTriggered = false;
      if (settings.autoActivate && randomDistance <= (settings.activationDistance || 50)) {
        await storage.updateAnimalDetection(detection.id, { 
          deterrentActivated: true,
          status: "deterred"
        });
        
        const baseVolume = settings.volume || 70;
        const distanceMultiplier = Math.max(1, 100 / randomDistance);
        const calculatedVolume = Math.min(100, Math.round(baseVolume * distanceMultiplier / 2));
        
        await storage.createAudioLog({
          distance: String(randomDistance),
          calculatedVolume,
          coordinates: { x: 0, y: 0 },
        });
        
        await storage.createActivityLog({
          action: "deterrent",
          details: `AUTO-CAMERA: ${animalData?.name || randomAnimal} detected at ${randomDistance}m - Sound played at ${optimalFrequency}kHz`,
          metadata: { 
            detectionId: detection.id, 
            animalType: randomAnimal,
            animalName: animalData?.name,
            distance: randomDistance,
            frequency: optimalFrequency,
            effectiveness,
            volume: calculatedVolume,
            automated: true,
            source: 'camera'
          }
        });
        deterrentTriggered = true;
      }

      await storage.createActivityLog({
        action: "detection",
        details: `CAMERA: ${animalData?.name || randomAnimal} spotted at ${randomDistance}m`,
        metadata: { detectionId: detection.id, animalType: randomAnimal, distance: randomDistance, source: 'camera' }
      });

      res.json({ 
        simulated: true,
        detection: { ...detection, optimalFrequency, effectiveness },
        deterrentTriggered,
        message: deterrentTriggered 
          ? `Automatic deterrent activated for ${animalData?.name || randomAnimal}` 
          : `${animalData?.name || randomAnimal} detected but outside activation range`
      });
    } catch (err) {
      res.status(400).json({ message: "Camera simulation failed" });
    }
  });

  // Get automation status
  app.get("/api/automation/status", async (req, res) => {
    const settings = await storage.getDeterrentSettings();
    const recentDetections = await storage.getAnimalDetections();
    const last24h = recentDetections?.filter((d: any) => {
      const detectionTime = new Date(d.createdAt).getTime();
      const now = Date.now();
      return now - detectionTime < 24 * 60 * 60 * 1000;
    }) || [];
    
    const deterredCount = last24h.filter((d: any) => d.deterrentActivated).length;
    
    res.json({
      isAutomated: settings?.isEnabled && settings?.autoActivate,
      systemStatus: settings?.isEnabled ? 'active' : 'standby',
      detections24h: last24h.length,
      deterrents24h: deterredCount,
      activationDistance: settings?.activationDistance || 50,
      volume: settings?.volume || 70,
    });
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

  // === Farm Fields ===
  app.get("/api/fields", async (req, res) => {
    const fields = await storage.getFields();
    res.json(fields);
  });

  app.get("/api/fields/:id", async (req, res) => {
    const field = await storage.getField(Number(req.params.id));
    if (!field) return res.status(404).json({ message: "Field not found" });
    res.json(field);
  });

  app.post("/api/fields", async (req, res) => {
    try {
      const data = farmFieldRequestSchema.parse(req.body);
      const field = await storage.createField({
        ...data,
        plantingDate: data.plantingDate ? new Date(data.plantingDate) : undefined,
        expectedHarvestDate: data.expectedHarvestDate ? new Date(data.expectedHarvestDate) : undefined,
      });
      
      await storage.createActivityLog({
        action: "system",
        details: `Field created: ${data.name}`,
        metadata: { fieldId: field.id }
      });
      
      res.status(201).json(field);
    } catch (err) {
      res.status(400).json({ message: "Failed to create field" });
    }
  });

  app.patch("/api/fields/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updates = req.body;
      if (updates.plantingDate) {
        updates.plantingDate = new Date(updates.plantingDate);
      }
      if (updates.expectedHarvestDate) {
        updates.expectedHarvestDate = new Date(updates.expectedHarvestDate);
      }
      const field = await storage.updateField(id, updates);
      if (!field) return res.status(404).json({ message: "Field not found" });
      
      await storage.createActivityLog({
        action: "system",
        details: `Field updated: ${field.name}`,
        metadata: { fieldId: id }
      });
      
      res.json(field);
    } catch (err) {
      res.status(400).json({ message: "Failed to update field" });
    }
  });

  app.delete("/api/fields/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteField(id);
      if (!success) return res.status(404).json({ message: "Field not found" });
      
      await storage.createActivityLog({
        action: "system",
        details: `Field deleted`,
        metadata: { fieldId: id }
      });
      
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ message: "Failed to delete field" });
    }
  });

  // === Field Captures ===
  app.get("/api/fields/:fieldId/captures", async (req, res) => {
    const captures = await storage.getFieldCaptures(Number(req.params.fieldId));
    res.json(captures);
  });

  app.post("/api/fields/:fieldId/captures", async (req, res) => {
    try {
      const fieldId = Number(req.params.fieldId);
      const field = await storage.getField(fieldId);
      if (!field) return res.status(404).json({ message: "Field not found" });
      
      const data = fieldCaptureRequestSchema.parse({
        ...req.body,
        fieldId
      });
      
      const capture = await storage.createFieldCapture({
        ...data,
        captureDate: new Date(data.captureDate),
      });
      
      await storage.createActivityLog({
        action: "detection",
        details: `Field capture created for field: ${field.name}`,
        metadata: { fieldId, captureId: capture.id }
      });
      
      res.status(201).json(capture);
    } catch (err) {
      res.status(400).json({ message: "Failed to create field capture" });
    }
  });

  app.delete("/api/captures/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteFieldCapture(id);
      if (!success) return res.status(404).json({ message: "Capture not found" });
      
      await storage.createActivityLog({
        action: "detection",
        details: `Field capture deleted`,
        metadata: { captureId: id }
      });
      
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ message: "Failed to delete field capture" });
    }
  });

  // === Hardware Devices ===
  app.get("/api/devices", async (req, res) => {
    try {
      const devices = await storage.getHardwareDevices();
      res.json(devices);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch devices" });
    }
  });

  app.get("/api/devices/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const device = await storage.getHardwareDevice(id);
      if (!device) return res.status(404).json({ message: "Device not found" });
      res.json(device);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch device" });
    }
  });

  app.post("/api/devices", async (req, res) => {
    try {
      const { hardwareDeviceRequestSchema } = await import("@shared/schema");
      const data = hardwareDeviceRequestSchema.parse(req.body);
      const device = await storage.createHardwareDevice(data);
      
      await storage.createActivityLog({
        action: "system",
        details: `Hardware device "${data.name}" added (${data.type})`,
        metadata: { deviceId: device.id, type: data.type }
      });
      
      res.status(201).json(device);
    } catch (err) {
      console.error("Create device error:", err);
      res.status(500).json({ message: "Failed to create device" });
    }
  });

  app.patch("/api/devices/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updateSchema = z.object({
        name: z.string().optional(),
        type: z.enum(['soil_sensor', 'camera', 'weather_station', 'water_meter']).optional(),
        connectionType: z.enum(['wifi', 'lora', 'zigbee', 'wired', 'bluetooth']).optional(),
        connectionUrl: z.string().optional(),
        status: z.string().optional(),
        lastDataAt: z.date().optional(),
      });
      const updates = updateSchema.parse(req.body);
      const device = await storage.updateHardwareDevice(id, updates);
      if (!device) return res.status(404).json({ message: "Device not found" });
      res.json(device);
    } catch (err) {
      res.status(500).json({ message: "Failed to update device" });
    }
  });

  app.delete("/api/devices/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteHardwareDevice(id);
      if (!success) return res.status(404).json({ message: "Device not found" });
      
      await storage.createActivityLog({
        action: "system",
        details: `Hardware device removed`,
        metadata: { deviceId: id }
      });
      
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ message: "Failed to delete device" });
    }
  });

  // Test device connection
  app.post("/api/devices/:id/test", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const device = await storage.getHardwareDevice(id);
      if (!device) return res.status(404).json({ message: "Device not found" });

      // Simulate connection test based on device type
      const testResult = {
        success: true,
        latency: Math.floor(Math.random() * 100) + 50,
        message: "Connection successful"
      };

      // Update device status to online
      await storage.updateHardwareDevice(id, { 
        status: "online",
        lastDataAt: new Date()
      });

      res.json(testResult);
    } catch (err) {
      res.status(500).json({ message: "Connection test failed" });
    }
  });

  // Capture image from camera device
  app.post("/api/devices/:id/capture", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const device = await storage.getHardwareDevice(id);
      if (!device) return res.status(404).json({ message: "Device not found" });
      if (device.type !== 'camera') return res.status(400).json({ message: "Device is not a camera" });

      // Create a report from the camera capture
      const report = await storage.createReport({
        imageUrl: device.connectionUrl || "https://via.placeholder.com/800x600?text=Camera+Feed",
        status: "pending"
      });

      await storage.createActivityLog({
        action: "detection",
        details: `Image captured from camera "${device.name}"`,
        metadata: { deviceId: id, reportId: report.id }
      });

      res.status(201).json(report);
    } catch (err) {
      res.status(500).json({ message: "Failed to capture image" });
    }
  });

  // Get sensor reading from sensor device
  app.post("/api/devices/:id/read", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const device = await storage.getHardwareDevice(id);
      if (!device) return res.status(404).json({ message: "Device not found" });
      if (device.type !== 'soil_sensor' && device.type !== 'weather_station') {
        return res.status(400).json({ message: "Device is not a sensor" });
      }

      // Simulate sensor reading
      const reading = {
        soilMoisture: Math.floor(Math.random() * 60) + 20, // 20-80%
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
        timestamp: new Date().toISOString()
      };

      // Update device last data time
      await storage.updateHardwareDevice(id, { 
        status: "online",
        lastDataAt: new Date()
      });

      res.json(reading);
    } catch (err) {
      res.status(500).json({ message: "Failed to read sensor data" });
    }
  });

  // === AI Assistant ===
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, language, languageName } = z.object({ 
        message: z.string(),
        language: z.string().optional().default("en"),
        languageName: z.string().optional().default("English")
      }).parse(req.body);
      
      const systemPrompt = language === "en" 
        ? "You are an AI agricultural assistant for AgriGuard. You help farmers with crop diseases, irrigation, and land management. Use the 'Beyond Good Intentions' principles: ecological durability, semi-arid land design, and restorative agriculture. Answer concisely and practically."
        : `You are an AI agricultural assistant for AgriGuard. You help farmers with crop diseases, irrigation, and land management. Use the 'Beyond Good Intentions' principles: ecological durability, semi-arid land design, and restorative agriculture. Answer concisely and practically.

IMPORTANT: The farmer has selected ${languageName} as their preferred language. You MUST respond ENTIRELY in ${languageName}. Use the native script for that language (e.g., Devanagari for Hindi, Telugu script for Telugu, etc.). Do not mix English unless absolutely necessary for technical terms that have no local equivalent. Make your response natural and easy for local farmers to understand.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
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
