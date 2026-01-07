import { db } from "./db";
import { 
  reports, sensorReadings, audioLogs,
  type InsertReport, type Report,
  type InsertSensorReading, type SensorReading,
  type InsertAudioLog, type AudioLog
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Reports
  createReport(report: Partial<InsertReport> & { imageUrl: string }): Promise<Report>;
  getReports(): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  updateReport(id: number, updates: Partial<Report>): Promise<Report>;

  // Irrigation
  createSensorReading(reading: InsertSensorReading): Promise<SensorReading>;
  getSensorReadings(): Promise<SensorReading[]>;

  // Audio
  createAudioLog(log: InsertAudioLog): Promise<AudioLog>;
}

export class DatabaseStorage implements IStorage {
  // Reports
  async createReport(report: Partial<InsertReport> & { imageUrl: string }): Promise<Report> {
    const [newReport] = await db.insert(reports).values({
      imageUrl: report.imageUrl,
      status: (report.status as any) || "pending",
      analysis: report.analysis || null,
    }).returning();
    return newReport;
  }

  async getReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(desc(reports.createdAt));
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }

  async updateReport(id: number, updates: Partial<Report>): Promise<Report> {
    const [updated] = await db.update(reports)
      .set(updates)
      .where(eq(reports.id, id))
      .returning();
    return updated;
  }

  // Irrigation
  async createSensorReading(reading: InsertSensorReading): Promise<SensorReading> {
    const [newReading] = await db.insert(sensorReadings).values(reading).returning();
    return newReading;
  }

  async getSensorReadings(): Promise<SensorReading[]> {
    return await db.select().from(sensorReadings).orderBy(desc(sensorReadings.createdAt));
  }

  async getAudioLogs(): Promise<AudioLog[]> {
    return await db.select().from(audioLogs).orderBy(desc(audioLogs.createdAt));
  }

  // Audio
  async createAudioLog(log: InsertAudioLog): Promise<AudioLog> {
    const [newLog] = await db.insert(audioLogs).values(log).returning();
    return newLog;
  }
}

export const storage = new DatabaseStorage();
