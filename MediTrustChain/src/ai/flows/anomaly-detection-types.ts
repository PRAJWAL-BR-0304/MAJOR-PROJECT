/**
 * Type definitions and schemas for anomaly detection
 * Separated from server actions to allow exports
 */

import { z } from 'zod';

// ============ Input/Output Schemas ============

export const BatchHistoryEventSchema = z.object({
  location: z.string(),
  timestamp: z.string(),
  status: z.string(),
});

export const BatchDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  mfg: z.string(),
  exp: z.string(),
  qty: z.number(),
  status: z.string(),
  manufacturer: z.string().optional(),
  history: z.array(BatchHistoryEventSchema),
});

export const AnomalySchema = z.object({
  id: z.string().describe("Unique identifier for this anomaly"),
  batchId: z.string().describe("The batch ID where anomaly was detected"),
  type: z.enum(["time_delay", "status_regression", "temperature", "location", "quantity", "expiry", "pattern"]).describe("Category of the anomaly"),
  severity: z.enum(["low", "medium", "high", "critical"]).describe("How severe is this anomaly"),
  title: z.string().describe("Short title describing the anomaly"),
  description: z.string().describe("Detailed explanation of what was detected"),
  recommendation: z.string().describe("Recommended action to take"),
  confidence: z.number().min(0).max(100).describe("AI confidence score (0-100)"),
  detectedAt: z.string().describe("ISO timestamp when anomaly was detected"),
  affectedStage: z.string().describe("Which supply chain stage is affected"),
});

export const AnomalyDetectionInputSchema = z.object({
  batch: BatchDataSchema,
  currentDate: z.string().optional(),
});

export const AnomalyDetectionOutputSchema = z.object({
  isAnomaly: z.boolean().describe("Whether any anomaly was detected"),
  anomalies: z.array(AnomalySchema).describe("List of detected anomalies"),
  overallRiskScore: z.number().min(0).max(100).describe("Overall risk score for this batch"),
  analysisNotes: z.string().describe("Additional notes from the AI analysis"),
});

export const BatchAnalysisInputSchema = z.object({
  batches: z.array(BatchDataSchema),
  currentDate: z.string().optional(),
});

export const BatchAnalysisOutputSchema = z.object({
  totalBatches: z.number(),
  batchesWithAnomalies: z.number(),
  criticalCount: z.number(),
  highCount: z.number(),
  mediumCount: z.number(),
  lowCount: z.number(),
  anomalies: z.array(AnomalySchema),
  summary: z.string().describe("Executive summary of the analysis"),
  topRisks: z.array(z.string()).describe("Top 3 risk areas identified"),
});

// ============ Type Exports ============

export type BatchHistoryEvent = z.infer<typeof BatchHistoryEventSchema>;
export type BatchData = z.infer<typeof BatchDataSchema>;
export type Anomaly = z.infer<typeof AnomalySchema>;
export type AnomalyDetectionInput = z.infer<typeof AnomalyDetectionInputSchema>;
export type AnomalyDetectionOutput = z.infer<typeof AnomalyDetectionOutputSchema>;
export type BatchAnalysisInput = z.infer<typeof BatchAnalysisInputSchema>;
export type BatchAnalysisOutput = z.infer<typeof BatchAnalysisOutputSchema>;

// ============ Quick Check Function (Client-safe) ============

/**
 * Quick rule-based pre-check (runs locally without AI for speed)
 * Use this for real-time monitoring, then run full AI analysis periodically
 */
export function quickAnomalyCheck(batch: BatchData): {
  hasIssues: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const now = new Date();

  // Check expiry
  const expDate = new Date(batch.exp);
  const daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry < 0) {
    issues.push(`Batch is expired (${Math.abs(daysUntilExpiry)} days ago)`);
  } else if (daysUntilExpiry < 30) {
    issues.push(`Batch expires in ${daysUntilExpiry} days`);
  }

  // Check history
  if (!batch.history || batch.history.length === 0) {
    issues.push('Batch has no history records');
  } else {
    // Check for long pending status
    const lastEvent = batch.history[batch.history.length - 1];
    if (lastEvent.status === 'Pending') {
      const pendingDays = Math.ceil(
        (now.getTime() - new Date(lastEvent.timestamp).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (pendingDays > 3) {
        issues.push(`Pending for ${pendingDays} days (exceeds 3 day limit)`);
      }
    }

    // Check for time gaps
    for (let i = 1; i < batch.history.length; i++) {
      const gap = new Date(batch.history[i].timestamp).getTime() - 
                  new Date(batch.history[i - 1].timestamp).getTime();
      const gapHours = gap / (1000 * 60 * 60);
      if (gapHours > 168) { // 7 days
        issues.push(`${Math.round(gapHours / 24)} day gap in tracking history`);
      }
    }
  }

  // Check quantity
  if (batch.qty <= 0) {
    issues.push('Invalid quantity (zero or negative)');
  }

  return {
    hasIssues: issues.length > 0,
    issues,
  };
}
