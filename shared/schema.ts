import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === REPORTS (Drone Image Analysis) ===
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  status: text("status").default("pending").notNull(),
  severity: text("severity").default("none"), // none, low, medium, high, critical
  cropType: text("crop_type").default("unknown"),
  // JSON structure: { diseaseDetected: boolean, diseases: [{ name: string, confidence: number, symptoms: string[] }], risks: [{ risk: string, reason: string }], ipmMeasures: string[], confirmed: boolean }
  analysis: jsonb("analysis"),
  createdAt: timestamp("created_at").defaultNow(),
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

// === SCHEMAS ===
export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true });
export const insertSensorReadingSchema = createInsertSchema(sensorReadings).omit({ id: true, createdAt: true });
export const insertAudioLogSchema = createInsertSchema(audioLogs).omit({ id: true, createdAt: true });

// === TYPES ===
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type SensorReading = typeof sensorReadings.$inferSelect;
export type InsertSensorReading = z.infer<typeof insertSensorReadingSchema>;

export type AudioLog = typeof audioLogs.$inferSelect;
export type InsertAudioLog = z.infer<typeof insertAudioLogSchema>;

// API Request Types
export const analyzeImageSchema = z.object({
  imageUrl: z.string().url(),
});

export const captureImageSchema = z.object({
  imageUrl: z.string().url(),
});

export const irrigationRequestSchema = z.object({
  soilMoisture: z.coerce.number().min(0).max(100),
  humidity: z.coerce.number().min(0).max(100),
});

export const audioRequestSchema = z.object({
  distance: z.string(), // changed to string for consistency with schema.ts text type
  coordinates: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
});
