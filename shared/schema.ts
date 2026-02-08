import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Export auth models
export * from "./models/auth";
export * from "./models/chat";

// === PLANT PROFILES (For Trend Analysis) ===
export const plantProfiles = pgTable("plant_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g., "Tomato Plant #1", "Field A Row 3"
  cropType: text("crop_type").notNull(),
  fieldId: integer("field_id"), // optional link to farm field
  location: jsonb("location"), // { lat, lng } or { row, column }
  plantedDate: timestamp("planted_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === REPORTS (Drone Image Analysis) ===
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  status: text("status").default("pending").notNull(),
  severity: text("severity").default("none"), // none, low, medium, high, critical
  cropType: text("crop_type").default("unknown"),
  plantProfileId: integer("plant_profile_id"), // optional link for trend analysis
  scanMode: text("scan_mode").default("farmer"), // farmer (simplified) or expert (detailed)
  // Enhanced analysis structure with confidence scores
  // JSON structure: { 
  //   predictions: [{ type: 'disease'|'insect'|'nutrient'|'damage', name: string, confidence: number, severity: string, symptoms: string[], treatment: string[] }],
  //   overallHealth: number (0-100),
  //   nutrientDeficiencies: [{ nutrient: string, confidence: number, symptoms: string[] }],
  //   insects: [{ name: string, confidence: number, damage: string, treatment: string[] }],
  //   diseases: [{ name: string, confidence: number, symptoms: string[], treatment: string[] }],
  //   leafDamage: { detected: boolean, severity: string, confidence: number, cause: string },
  //   modelMetadata: { model: string, version: string, processingTime: number }
  // }
  analysis: jsonb("analysis"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCAN ANALYTICS (Admin Dashboard) ===
export const scanAnalytics = pgTable("scan_analytics", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull(),
  detectionCategory: text("detection_category").notNull(), // disease, insect, nutrient, damage, healthy
  detectionName: text("detection_name"),
  confidence: real("confidence").default(0),
  wasAccurate: boolean("was_accurate"), // user feedback on accuracy
  processingTimeMs: integer("processing_time_ms"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === OFFLINE QUEUE (For sync when online) ===
export const offlineQueue = pgTable("offline_queue", {
  id: serial("id").primaryKey(),
  imageData: text("image_data").notNull(), // base64 or blob reference
  plantProfileId: integer("plant_profile_id"),
  scanMode: text("scan_mode").default("farmer"),
  status: text("status").default("pending"), // pending, uploading, completed, failed
  retryCount: integer("retry_count").default(0),
  queuedAt: timestamp("queued_at").defaultNow(),
  syncedAt: timestamp("synced_at"),
});

// === SENSOR READINGS (Irrigation) ===
export const sensorReadings = pgTable("sensor_readings", {
  id: serial("id").primaryKey(),
  soilMoisture: integer("soil_moisture").notNull(), // 0-100
  humidity: integer("humidity").notNull(), // 0-100
  temperature: integer("temperature").default(25).notNull(), // Celsius
  ambientHumidity: integer("ambient_humidity").default(50).notNull(), // 0-100
  irrigationAdvice: text("irrigation_advice").notNull(),
  healthScore: integer("health_score").default(100), // Predictive health score 0-100
  createdAt: timestamp("created_at").defaultNow(),
});

// === AUDIO LOGS ===
export const audioLogs = pgTable("audio_logs", {
  id: serial("id").primaryKey(),
  distance: text("distance").notNull(), // stored as text to avoid bigint overflow
  calculatedVolume: integer("calculated_volume").notNull(), // decibels
  coordinates: jsonb("coordinates"), // { x: number, y: number } for spatial viz
  createdAt: timestamp("created_at").defaultNow(),
});

// === ANIMAL DETECTIONS ===
export const animalDetections = pgTable("animal_detections", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url"),
  animalType: text("animal_type").notNull(), // e.g., 'wild_boar', 'deer', 'monkey', 'elephant'
  confidence: real("confidence").default(0), // 0-1 confidence score
  distance: real("distance").notNull(), // meters from camera
  coordinates: jsonb("coordinates"), // { x: number, y: number } position on map
  status: text("status").default("detected"), // detected, deterred, left
  deterrentActivated: boolean("deterrent_activated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// === DETERRENT SETTINGS ===
export const deterrentSettings = pgTable("deterrent_settings", {
  id: serial("id").primaryKey(),
  isEnabled: boolean("is_enabled").default(false),
  volume: integer("volume").default(70), // 0-100
  soundType: text("sound_type").default("alarm"), // alarm, ultrasonic, predator, custom
  activationDistance: integer("activation_distance").default(50), // meters
  autoActivate: boolean("auto_activate").default(true), // auto-activate on detection
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === IRRIGATION SETTINGS ===
export const irrigationSettings = pgTable("irrigation_settings", {
  id: serial("id").primaryKey(),
  isActive: boolean("is_active").default(false),
  moistureThreshold: integer("moisture_threshold").default(30), // % below which to irrigate
  manualOverride: boolean("manual_override").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === FARM TASKS (Scheduling) ===
export const farmTasks = pgTable("farm_tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  priority: text("priority").default("medium"), // low, medium, high
  status: text("status").default("pending"), // pending, in_progress, completed
  category: text("category").default("general"), // planting, harvesting, maintenance, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// === INVENTORY ===
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // seeds, fertilizers, pesticides, equipment
  quantity: real("quantity").default(0),
  unit: text("unit").default("kg"), // kg, liters, pieces, bags
  minStock: real("min_stock").default(0), // alert when below this
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// === FINANCIAL TRANSACTIONS ===
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // income, expense
  category: text("category").notNull(), // seeds, fertilizers, labor, sales, equipment, etc.
  description: text("description"),
  amount: real("amount").notNull(),
  date: timestamp("date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === ACTIVITY LOGS ===
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(), // detection, irrigation, deterrent, system
  details: text("details"),
  metadata: jsonb("metadata"), // additional data
  createdAt: timestamp("created_at").defaultNow(),
});

// === FARM FIELDS ===
export const farmFields = pgTable("farm_fields", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  // Polygon coordinates as array of {lat, lng} points
  polygon: jsonb("polygon").notNull(), // [{ lat: number, lng: number }, ...]
  areaAcres: real("area_acres").default(0),
  cropType: text("crop_type"), // current crop being grown
  plantingDate: timestamp("planting_date"),
  expectedHarvestDate: timestamp("expected_harvest_date"),
  projectedYield: real("projected_yield"), // in kg or quintals
  historicalYield: real("historical_yield"), // average from past seasons
  soilType: text("soil_type"),
  irrigationType: text("irrigation_type"), // drip, sprinkler, flood, rainfed
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === FIELD CAPTURES (Drone Timeline) ===
export const fieldCaptures = pgTable("field_captures", {
  id: serial("id").primaryKey(),
  fieldId: integer("field_id").notNull(),
  captureDate: timestamp("capture_date").notNull(),
  imageUrls: jsonb("image_urls").notNull(), // array of image URLs
  healthDiagnostic: jsonb("health_diagnostic"), // { score: number, issues: string[], recommendations: string[] }
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === HARDWARE DEVICES (Sensors & Cameras) ===
export const hardwareDevices = pgTable("hardware_devices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'soil_sensor', 'camera', 'weather_station', 'water_meter'
  model: text("model"), // device model/brand
  connectionType: text("connection_type").default("wifi"), // wifi, lora, zigbee, wired, bluetooth
  connectionUrl: text("connection_url"), // IP address, stream URL, or endpoint
  apiKey: text("api_key"), // device API key if needed
  fieldId: integer("field_id"), // which field this device monitors
  location: jsonb("location"), // { lat: number, lng: number } or { zone: string }
  status: text("status").default("offline"), // online, offline, error, calibrating
  lastDataAt: timestamp("last_data_at"), // last time data was received
  config: jsonb("config"), // device-specific configuration
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===
export const insertPlantProfileSchema = createInsertSchema(plantProfiles).omit({ id: true, createdAt: true });
export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true });
export const insertScanAnalyticsSchema = createInsertSchema(scanAnalytics).omit({ id: true, createdAt: true });
export const insertOfflineQueueSchema = createInsertSchema(offlineQueue).omit({ id: true, queuedAt: true, syncedAt: true });
export const insertSensorReadingSchema = createInsertSchema(sensorReadings).omit({ id: true, createdAt: true });
export const insertAudioLogSchema = createInsertSchema(audioLogs).omit({ id: true, createdAt: true });
export const insertAnimalDetectionSchema = createInsertSchema(animalDetections).omit({ id: true, createdAt: true });
export const insertDeterrentSettingsSchema = createInsertSchema(deterrentSettings).omit({ id: true, updatedAt: true });
export const insertIrrigationSettingsSchema = createInsertSchema(irrigationSettings).omit({ id: true, updatedAt: true });
export const insertFarmTaskSchema = createInsertSchema(farmTasks).omit({ id: true, createdAt: true });
export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({ id: true, lastUpdated: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true });
export const insertFarmFieldSchema = createInsertSchema(farmFields).omit({ id: true, createdAt: true });
export const insertFieldCaptureSchema = createInsertSchema(fieldCaptures).omit({ id: true, createdAt: true });
export const insertHardwareDeviceSchema = createInsertSchema(hardwareDevices).omit({ id: true, createdAt: true });

// === TYPES ===
export type PlantProfile = typeof plantProfiles.$inferSelect;
export type InsertPlantProfile = z.infer<typeof insertPlantProfileSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type ScanAnalytic = typeof scanAnalytics.$inferSelect;
export type InsertScanAnalytic = z.infer<typeof insertScanAnalyticsSchema>;

export type OfflineQueueItem = typeof offlineQueue.$inferSelect;
export type InsertOfflineQueueItem = z.infer<typeof insertOfflineQueueSchema>;

export type SensorReading = typeof sensorReadings.$inferSelect;
export type InsertSensorReading = z.infer<typeof insertSensorReadingSchema>;

export type AudioLog = typeof audioLogs.$inferSelect;
export type InsertAudioLog = z.infer<typeof insertAudioLogSchema>;

export type AnimalDetection = typeof animalDetections.$inferSelect;
export type InsertAnimalDetection = z.infer<typeof insertAnimalDetectionSchema>;

export type DeterrentSetting = typeof deterrentSettings.$inferSelect;
export type InsertDeterrentSetting = z.infer<typeof insertDeterrentSettingsSchema>;

export type IrrigationSetting = typeof irrigationSettings.$inferSelect;
export type InsertIrrigationSetting = z.infer<typeof insertIrrigationSettingsSchema>;

export type FarmTask = typeof farmTasks.$inferSelect;
export type InsertFarmTask = z.infer<typeof insertFarmTaskSchema>;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

export type FarmField = typeof farmFields.$inferSelect;
export type InsertFarmField = z.infer<typeof insertFarmFieldSchema>;

export type FieldCapture = typeof fieldCaptures.$inferSelect;
export type InsertFieldCapture = z.infer<typeof insertFieldCaptureSchema>;

export type HardwareDevice = typeof hardwareDevices.$inferSelect;
export type InsertHardwareDevice = z.infer<typeof insertHardwareDeviceSchema>;

// API Request Types
export const analyzeImageSchema = z.object({
  imageUrl: z.string().min(1),
});

export const captureImageSchema = z.object({
  imageUrl: z.string().min(1),
});

export const irrigationRequestSchema = z.object({
  soilMoisture: z.coerce.number().min(0).max(100),
  humidity: z.coerce.number().min(0).max(100),
});

export const audioRequestSchema = z.object({
  distance: z.coerce.number(),
  coordinates: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
});

export const deterrentSettingsRequestSchema = z.object({
  isEnabled: z.boolean().optional(),
  volume: z.number().min(0).max(100).optional(),
  soundType: z.enum(['alarm', 'ultrasonic', 'predator', 'custom']).optional(),
  activationDistance: z.number().min(1).max(500).optional(),
  autoActivate: z.boolean().optional(),
});

export const irrigationSettingsRequestSchema = z.object({
  isActive: z.boolean().optional(),
  moistureThreshold: z.number().min(0).max(100).optional(),
  manualOverride: z.boolean().optional(),
});

export const farmTaskRequestSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  category: z.string().optional(),
});

export const inventoryItemRequestSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['seeds', 'fertilizers', 'pesticides', 'equipment']),
  quantity: z.number().min(0).optional(),
  unit: z.string().optional(),
  minStock: z.number().min(0).optional(),
});

export const transactionRequestSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.string().min(1),
  description: z.string().optional(),
  amount: z.number(),
  date: z.string().optional(),
});

export const farmFieldRequestSchema = z.object({
  name: z.string().min(1),
  polygon: z.array(z.object({ lat: z.number(), lng: z.number() })),
  areaAcres: z.number().optional(),
  cropType: z.string().optional(),
  plantingDate: z.string().optional(),
  expectedHarvestDate: z.string().optional(),
  projectedYield: z.number().optional(),
  historicalYield: z.number().optional(),
  soilType: z.string().optional(),
  irrigationType: z.string().optional(),
  notes: z.string().optional(),
});

export const fieldCaptureRequestSchema = z.object({
  fieldId: z.number(),
  captureDate: z.string(),
  imageUrls: z.array(z.string()),
  healthDiagnostic: z.object({
    score: z.number(),
    issues: z.array(z.string()),
    recommendations: z.array(z.string()),
  }).optional(),
  notes: z.string().optional(),
});

export const hardwareDeviceRequestSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['soil_sensor', 'camera', 'weather_station', 'water_meter']),
  model: z.string().optional(),
  connectionType: z.enum(['wifi', 'lora', 'zigbee', 'wired', 'bluetooth']).optional(),
  connectionUrl: z.string().optional(),
  apiKey: z.string().optional(),
  fieldId: z.number().optional(),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
  config: z.record(z.any()).optional(),
});
