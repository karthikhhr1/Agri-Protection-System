import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === REPORTS (Drone Image Analysis) ===
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  // JSON structure: { risks: [{ risk: string, reason: string }], ipmMeasures: string[], confirmed: boolean }
  analysis: jsonb("analysis").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SENSOR READINGS (Irrigation) ===
export const sensorReadings = pgTable("sensor_readings", {
  id: serial("id").primaryKey(),
  soilMoisture: integer("soil_moisture").notNull(), // 0-100
  humidity: integer("humidity").notNull(), // 0-100
  irrigationAdvice: text("irrigation_advice").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === AUDIO LOGS ===
export const audioLogs = pgTable("audio_logs", {
  id: serial("id").primaryKey(),
  distance: integer("distance").notNull(), // meters
  calculatedVolume: integer("calculated_volume").notNull(), // decibels
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

export const irrigationRequestSchema = z.object({
  soilMoisture: z.coerce.number().min(0).max(100),
  humidity: z.coerce.number().min(0).max(100),
});

export const audioRequestSchema = z.object({
  distance: z.coerce.number().positive(),
});
