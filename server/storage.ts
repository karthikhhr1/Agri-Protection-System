import { db } from "./db";
import { 
  reports, sensorReadings, audioLogs, farmTasks, inventoryItems, transactions, activityLogs,
  deterrentSettings, irrigationSettings, animalDetections,
  type InsertReport, type Report,
  type InsertSensorReading, type SensorReading,
  type InsertAudioLog, type AudioLog,
  type InsertFarmTask, type FarmTask,
  type InsertInventoryItem, type InventoryItem,
  type InsertTransaction, type Transaction,
  type InsertActivityLog, type ActivityLog,
  type InsertDeterrentSetting, type DeterrentSetting,
  type InsertIrrigationSetting, type IrrigationSetting,
  type InsertAnimalDetection, type AnimalDetection
} from "@shared/schema";
import { eq, desc, inArray } from "drizzle-orm";

export interface IStorage {
  // Reports
  createReport(report: InsertReport): Promise<Report>;
  getReports(): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  updateReport(id: number, updates: Partial<Report>): Promise<Report>;
  deleteReport(id: number): Promise<void>;
  bulkDeleteReports(ids: number[]): Promise<void>;

  // Irrigation
  createSensorReading(reading: InsertSensorReading): Promise<SensorReading>;
  getSensorReadings(): Promise<SensorReading[]>;

  // Audio
  createAudioLog(log: InsertAudioLog): Promise<AudioLog>;
  getAudioLogs(): Promise<AudioLog[]>;

  // Farm Tasks
  createFarmTask(task: InsertFarmTask): Promise<FarmTask>;
  getFarmTasks(): Promise<FarmTask[]>;
  updateFarmTask(id: number, updates: Partial<FarmTask>): Promise<FarmTask>;
  deleteFarmTask(id: number): Promise<void>;

  // Inventory
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  getInventoryItems(): Promise<InventoryItem[]>;
  updateInventoryItem(id: number, updates: Partial<InventoryItem>): Promise<InventoryItem>;
  deleteInventoryItem(id: number): Promise<void>;

  // Transactions
  createTransaction(trans: InsertTransaction): Promise<Transaction>;
  getTransactions(): Promise<Transaction[]>;
  deleteTransaction(id: number): Promise<void>;

  // Activity Logs
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(): Promise<ActivityLog[]>;

  // Deterrent Settings
  getDeterrentSettings(): Promise<DeterrentSetting | undefined>;
  updateDeterrentSettings(settings: Partial<InsertDeterrentSetting>): Promise<DeterrentSetting>;

  // Irrigation Settings
  getIrrigationSettings(): Promise<IrrigationSetting | undefined>;
  updateIrrigationSettings(settings: Partial<InsertIrrigationSetting>): Promise<IrrigationSetting>;

  // Animal Detections
  createAnimalDetection(detection: InsertAnimalDetection): Promise<AnimalDetection>;
  getAnimalDetections(): Promise<AnimalDetection[]>;
  updateAnimalDetection(id: number, updates: Partial<AnimalDetection>): Promise<AnimalDetection>;
}

export class DatabaseStorage implements IStorage {
  // Reports
  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
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

  async deleteReport(id: number): Promise<void> {
    await db.delete(reports).where(eq(reports.id, id));
  }

  async bulkDeleteReports(ids: number[]): Promise<void> {
    await db.delete(reports).where(inArray(reports.id, ids));
  }

  // Irrigation
  async createSensorReading(reading: InsertSensorReading): Promise<SensorReading> {
    const [newReading] = await db.insert(sensorReadings).values(reading).returning();
    return newReading;
  }

  async getSensorReadings(): Promise<SensorReading[]> {
    return await db.select().from(sensorReadings).orderBy(desc(sensorReadings.createdAt));
  }

  // Audio
  async createAudioLog(log: InsertAudioLog): Promise<AudioLog> {
    const [newLog] = await db.insert(audioLogs).values(log).returning();
    return newLog;
  }

  async getAudioLogs(): Promise<AudioLog[]> {
    return await db.select().from(audioLogs).orderBy(desc(audioLogs.createdAt));
  }

  // Farm Tasks
  async createFarmTask(task: InsertFarmTask): Promise<FarmTask> {
    const [newTask] = await db.insert(farmTasks).values(task).returning();
    return newTask;
  }

  async getFarmTasks(): Promise<FarmTask[]> {
    return await db.select().from(farmTasks).orderBy(desc(farmTasks.createdAt));
  }

  async updateFarmTask(id: number, updates: Partial<FarmTask>): Promise<FarmTask> {
    const [updated] = await db.update(farmTasks)
      .set(updates)
      .where(eq(farmTasks.id, id))
      .returning();
    return updated;
  }

  async deleteFarmTask(id: number): Promise<void> {
    await db.delete(farmTasks).where(eq(farmTasks.id, id));
  }

  // Inventory
  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const [newItem] = await db.insert(inventoryItems).values(item).returning();
    return newItem;
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems).orderBy(desc(inventoryItems.lastUpdated));
  }

  async updateInventoryItem(id: number, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const [updated] = await db.update(inventoryItems)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(inventoryItems.id, id))
      .returning();
    return updated;
  }

  async deleteInventoryItem(id: number): Promise<void> {
    await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
  }

  // Transactions
  async createTransaction(trans: InsertTransaction): Promise<Transaction> {
    const [newTrans] = await db.insert(transactions).values(trans).returning();
    return newTrans;
  }

  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async deleteTransaction(id: number): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  // Activity Logs
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db.insert(activityLogs).values(log).returning();
    return newLog;
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt));
  }

  // Deterrent Settings
  async getDeterrentSettings(): Promise<DeterrentSetting | undefined> {
    const [settings] = await db.select().from(deterrentSettings).limit(1);
    return settings;
  }

  async updateDeterrentSettings(updates: Partial<InsertDeterrentSetting>): Promise<DeterrentSetting> {
    const existing = await this.getDeterrentSettings();
    if (existing) {
      const [updated] = await db.update(deterrentSettings)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(deterrentSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [newSettings] = await db.insert(deterrentSettings)
        .values(updates as InsertDeterrentSetting)
        .returning();
      return newSettings;
    }
  }

  // Irrigation Settings
  async getIrrigationSettings(): Promise<IrrigationSetting | undefined> {
    const [settings] = await db.select().from(irrigationSettings).limit(1);
    return settings;
  }

  async updateIrrigationSettings(updates: Partial<InsertIrrigationSetting>): Promise<IrrigationSetting> {
    const existing = await this.getIrrigationSettings();
    if (existing) {
      const [updated] = await db.update(irrigationSettings)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(irrigationSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [newSettings] = await db.insert(irrigationSettings)
        .values(updates as InsertIrrigationSetting)
        .returning();
      return newSettings;
    }
  }

  // Animal Detections
  async createAnimalDetection(detection: InsertAnimalDetection): Promise<AnimalDetection> {
    const [newDetection] = await db.insert(animalDetections).values(detection).returning();
    return newDetection;
  }

  async getAnimalDetections(): Promise<AnimalDetection[]> {
    return await db.select().from(animalDetections).orderBy(desc(animalDetections.createdAt));
  }

  async updateAnimalDetection(id: number, updates: Partial<AnimalDetection>): Promise<AnimalDetection> {
    const [updated] = await db.update(animalDetections)
      .set(updates)
      .where(eq(animalDetections.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
