import { z } from 'zod';
import { 
  insertReportSchema, 
  insertSensorReadingSchema, 
  insertAudioLogSchema, 
  analyzeImageSchema,
  captureImageSchema,
  irrigationRequestSchema,
  audioRequestSchema,
  reports,
  sensorReadings,
  audioLogs
} from './schema';

export { 
  insertReportSchema, 
  insertSensorReadingSchema, 
  insertAudioLogSchema, 
  analyzeImageSchema,
  captureImageSchema,
  irrigationRequestSchema,
  audioRequestSchema,
  reports,
  sensorReadings,
  audioLogs
};

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  reports: {
    list: {
      method: 'GET' as const,
      path: '/api/reports',
      responses: {
        200: z.array(z.custom<typeof reports.$inferSelect>()),
      },
    },
    capture: {
      method: 'POST' as const,
      path: '/api/reports/capture',
      input: captureImageSchema,
      responses: {
        201: z.custom<typeof reports.$inferSelect>(),
      },
    },
    process: {
      method: 'POST' as const,
      path: '/api/reports/:id/process',
      input: z.object({}),
      responses: {
        200: z.custom<typeof reports.$inferSelect>(),
        404: errorSchemas.notFound,
        500: errorSchemas.internal,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/reports/:id',
      responses: {
        200: z.custom<typeof reports.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/reports/:id',
      responses: {
        204: z.null(),
        500: errorSchemas.internal,
      },
    },
    bulkDelete: {
      method: 'POST' as const,
      path: '/api/reports/bulk-delete',
      input: z.object({ ids: z.array(z.number()) }),
      responses: {
        204: z.null(),
        500: errorSchemas.internal,
      },
    },
  },
  irrigation: {
    calculate: {
      method: 'POST' as const,
      path: '/api/irrigation',
      input: irrigationRequestSchema,
      responses: {
        201: z.custom<typeof sensorReadings.$inferSelect>(),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/irrigation',
      responses: {
        200: z.array(z.custom<typeof sensorReadings.$inferSelect>()),
      },
    },
  },
  audio: {
    calculate: {
      method: 'POST' as const,
      path: '/api/audio',
      input: audioRequestSchema,
      responses: {
        201: z.custom<typeof audioLogs.$inferSelect>(),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/audio',
      responses: {
        200: z.array(z.custom<typeof audioLogs.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
