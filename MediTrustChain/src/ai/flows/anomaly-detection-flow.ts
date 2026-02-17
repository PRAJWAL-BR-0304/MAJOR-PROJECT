
'use server';
/**
 * @fileOverview AI-powered anomaly detection for pharmaceutical supply chain.
 * Uses GenKit with Google AI to analyze batch patterns and detect irregularities.
 *
 * - checkForAnomalies - Analyzes a single batch for anomalies
 * - analyzeBatchesForAnomalies - Batch analysis of multiple batches
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  BatchDataSchema,
  AnomalyDetectionInputSchema,
  AnomalyDetectionOutputSchema,
  BatchAnalysisInputSchema,
  BatchAnalysisOutputSchema,
  type AnomalyDetectionInput,
  type AnomalyDetectionOutput,
  type BatchAnalysisOutput,
  type BatchData,
} from './anomaly-detection-types';

// ============ Single Batch Anomaly Detection ============

const singleBatchPrompt = ai.definePrompt({
  name: 'singleBatchAnomalyPrompt',
  input: { schema: AnomalyDetectionInputSchema },
  output: { schema: AnomalyDetectionOutputSchema },
  prompt: `You are an expert AI auditor for a pharmaceutical supply chain security system called MediTrustChain. 
Your role is to detect anomalies, fraud patterns, and supply chain risks in drug batch data.

## Analysis Rules

**TIME ANOMALIES:**
- Flag if a batch is "Pending" for more than 3 days
- Flag if "In-Transit" for more than 7 days without location update
- Flag unusual gaps between status changes (>72 hours)

**STATUS ANOMALIES:**
- Flag status regressions (e.g., Delivered → In-Transit)
- Flag if batch goes directly from Pending to Delivered (skipping approvals)
- Flag if Approved status is changed to Pending

**EXPIRY ANOMALIES:**
- Flag batches expiring within 30 days
- Flag expired batches still in transit
- Flag if manufacturing date is after expiry date

**QUANTITY ANOMALIES:**
- Flag if quantity is 0 or negative
- Flag unusually large quantities (>100,000 units for single batch)

**LOCATION ANOMALIES:**
- Flag if location contains "unknown"
- Flag rapid location changes (different cities within hours)
- Flag if location doesn't match expected supply chain route

**PATTERN ANOMALIES:**
- Flag if history has duplicate timestamps
- Flag if batch has no history
- Flag suspicious patterns that could indicate tampering

Current Date: {{currentDate}}

## Batch Data to Analyze:
\`\`\`json
{{{json batch}}}
\`\`\`

Analyze thoroughly and return your findings. Be specific about what triggered each anomaly.
Generate unique IDs for each anomaly in format: "ANM-{batchId}-{type}-{index}"
Set detectedAt to current ISO timestamp.
`,
});

const anomalyDetectionFlow = ai.defineFlow(
  {
    name: 'anomalyDetectionFlow',
    inputSchema: AnomalyDetectionInputSchema,
    outputSchema: AnomalyDetectionOutputSchema,
  },
  async (input) => {
    const currentDate = input.currentDate || new Date().toISOString();
    const { output } = await singleBatchPrompt({ ...input, currentDate });
    return output!;
  }
);

// ============ Multi-Batch Analysis ============

const multiBatchPrompt = ai.definePrompt({
  name: 'multiBatchAnomalyPrompt',
  input: { schema: BatchAnalysisInputSchema },
  output: { schema: BatchAnalysisOutputSchema },
  prompt: `You are an expert AI auditor for MediTrustChain pharmaceutical supply chain security.
Analyze ALL batches provided and detect anomalies across the entire supply chain.

## Analysis Rules (Apply to each batch)

**TIME ANOMALIES (type: "time_delay"):**
- Batch "Pending" for >3 days
- "In-Transit" for >7 days without update
- Gaps >72 hours between status changes

**STATUS ANOMALIES (type: "status_regression"):**
- Status going backwards (e.g., Delivered → In-Transit)
- Skipping required stages
- Unapproved status changes

**EXPIRY ANOMALIES (type: "expiry"):**
- Expiring within 30 days
- Already expired but still active
- Invalid date ranges

**QUANTITY ANOMALIES (type: "quantity"):**
- Zero or negative quantities
- Unusually large quantities (>100,000)

**LOCATION ANOMALIES (type: "location"):**
- Unknown locations
- Impossible travel times
- Route deviations

**PATTERN ANOMALIES (type: "pattern"):**
- Duplicate timestamps
- Missing history
- Tampering indicators

Current Date: {{currentDate}}

## Batches to Analyze ({{batches.length}} total):
\`\`\`json
{{{json batches}}}
\`\`\`

## Instructions:
1. Analyze each batch individually
2. Look for cross-batch patterns (same location issues, timing patterns)
3. Prioritize critical and high severity issues
4. Generate unique anomaly IDs: "ANM-{batchId}-{type}-{index}"
5. Provide actionable recommendations
6. Write an executive summary highlighting top risks

Return comprehensive analysis with all detected anomalies.
`,
});

const batchAnalysisFlow = ai.defineFlow(
  {
    name: 'batchAnalysisFlow',
    inputSchema: BatchAnalysisInputSchema,
    outputSchema: BatchAnalysisOutputSchema,
  },
  async (input) => {
    const currentDate = input.currentDate || new Date().toISOString();
    const { output } = await multiBatchPrompt({ ...input, currentDate });
    return output!;
  }
);

// ============ Public API Functions ============

/**
 * Check a single batch for anomalies
 */
export async function checkForAnomalies(
  input: AnomalyDetectionInput
): Promise<AnomalyDetectionOutput> {
  try {
    return await anomalyDetectionFlow(input);
  } catch (error) {
    console.error('Anomaly detection failed:', error);
    // Return safe default on error
    return {
      isAnomaly: false,
      anomalies: [],
      overallRiskScore: 0,
      analysisNotes: 'Analysis failed due to an error. Please try again.',
    };
  }
}

/**
 * Analyze multiple batches for anomalies (more efficient than individual calls)
 */
export async function analyzeBatchesForAnomalies(
  batches: z.infer<typeof BatchDataSchema>[]
): Promise<BatchAnalysisOutput> {
  try {
    // Filter out batches without proper data
    const validBatches = batches.filter(b => b.id && b.history && b.history.length > 0);
    
    if (validBatches.length === 0) {
      return {
        totalBatches: batches.length,
        batchesWithAnomalies: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        anomalies: [],
        summary: 'No valid batches to analyze.',
        topRisks: [],
      };
    }

    return await batchAnalysisFlow({ 
      batches: validBatches,
      currentDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Batch analysis failed:', error);
    return {
      totalBatches: batches.length,
      batchesWithAnomalies: 0,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      anomalies: [],
      summary: 'Analysis failed due to an error. Please try again.',
      topRisks: [],
    };
  }
}
