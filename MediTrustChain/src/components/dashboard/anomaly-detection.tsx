"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  MapPin,
  RefreshCw,
  Shield,
  Loader2,
  Package,
  Calendar,
  Hash,
  ChevronRight,
  Brain,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useBatches, type Batch } from "@/contexts/batches-context";
import {
  analyzeBatchesForAnomalies,
} from "@/ai/flows/anomaly-detection-flow";
import { quickAnomalyCheck, type Anomaly, type BatchAnalysisOutput } from "@/ai/flows/anomaly-detection-types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Type icons mapping
const typeIcons: Record<string, React.ReactNode> = {
  time_delay: <Clock className="h-4 w-4" />,
  status_regression: <AlertTriangle className="h-4 w-4" />,
  temperature: <TrendingUp className="h-4 w-4" />,
  location: <MapPin className="h-4 w-4" />,
  quantity: <Package className="h-4 w-4" />,
  expiry: <Calendar className="h-4 w-4" />,
  pattern: <Hash className="h-4 w-4" />,
};

// Severity colors
const severityConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  critical: { color: "text-red-700", bgColor: "bg-red-100 border-red-200", label: "CRITICAL" },
  high: { color: "text-orange-700", bgColor: "bg-orange-100 border-orange-200", label: "HIGH" },
  medium: { color: "text-yellow-700", bgColor: "bg-yellow-100 border-yellow-200", label: "MEDIUM" },
  low: { color: "text-blue-700", bgColor: "bg-blue-100 border-blue-200", label: "LOW" },
};

export function AnomalyDetection() {
  const { batches, updateBatchStatus } = useBatches();
  const { toast } = useToast();
  const [analysisResult, setAnalysisResult] = useState<BatchAnalysisOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [quickIssues, setQuickIssues] = useState<Map<string, string[]>>(new Map());
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);

  // Quick local check on mount (fast, no AI)
  useEffect(() => {
    const issues = new Map<string, string[]>();
    batches.forEach(batch => {
      const check = quickAnomalyCheck({
        id: batch.id,
        name: batch.name,
        mfg: batch.mfg,
        exp: batch.exp,
        qty: batch.qty,
        status: batch.status,
        manufacturer: batch.manufacturer,
        history: batch.history,
      });
      if (check.hasIssues) {
        issues.set(batch.id, check.issues);
      }
    });
    setQuickIssues(issues);
  }, [batches]);

  // Full AI analysis
  const runAIAnalysis = useCallback(async () => {
    if (batches.length === 0) {
      toast({
        title: "No Batches",
        description: "There are no batches to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const batchData = batches.map(batch => ({
        id: batch.id,
        name: batch.name,
        mfg: batch.mfg,
        exp: batch.exp,
        qty: batch.qty,
        status: batch.status,
        manufacturer: batch.manufacturer || "Unknown",
        history: batch.history,
      }));

      const result = await analyzeBatchesForAnomalies(batchData);
      setAnalysisResult(result);
      setLastAnalyzed(new Date());

      // Auto-flag critical batches
      const criticalBatches = result.anomalies
        .filter(a => a.severity === "critical" || a.severity === "high")
        .map(a => a.batchId);

      const uniqueCritical = [...new Set(criticalBatches)];
      uniqueCritical.forEach(batchId => {
        const anomaly = result.anomalies.find(a => a.batchId === batchId);
        if (anomaly) {
          const batch = batches.find(b => b.id === batchId);
          if (batch && !batch.anomalyReason) {
            // Don't auto-flag, just notify
            toast({
              title: `⚠️ ${anomaly.severity.toUpperCase()} Risk: ${batchId}`,
              description: anomaly.title,
              variant: "destructive",
            });
          }
        }
      });

      toast({
        title: "Analysis Complete",
        description: `Found ${result.anomalies.length} anomalies across ${result.batchesWithAnomalies} batches.`,
      });
    } catch (error) {
      console.error("AI Analysis failed:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not complete AI analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [batches, toast]);

  // Flag a batch based on anomaly (keep current status, just add anomaly reason)
  const handleFlagBatch = (anomaly: Anomaly) => {
    const batch = batches.find(b => b.id === anomaly.batchId);
    if (batch) {
      updateBatchStatus(anomaly.batchId, batch.status, "Flagged by AI Anomaly Detection", anomaly.description);
      toast({
        title: "Batch Flagged",
        description: `${anomaly.batchId} has been flagged for review.`,
      });
    }
  };

  const totalQuickIssues = Array.from(quickIssues.values()).flat().length;

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                AI Anomaly Detection
                <Badge variant="outline" className="ml-2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  GenKit + Gemini
                </Badge>
              </CardTitle>
              <CardDescription>
                Real-time monitoring with AI-powered pattern analysis
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={runAIAnalysis}
            disabled={isAnalyzing}
            className="gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Run AI Analysis
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard
            label="Total Batches"
            value={batches.length}
            icon={<Package className="h-4 w-4" />}
          />
          <StatCard
            label="Quick Issues"
            value={totalQuickIssues}
            icon={<AlertCircle className="h-4 w-4" />}
            variant={totalQuickIssues > 0 ? "warning" : "default"}
          />
          <StatCard
            label="AI Anomalies"
            value={analysisResult?.anomalies.length ?? "-"}
            icon={<Brain className="h-4 w-4" />}
            variant={(analysisResult?.anomalies.length ?? 0) > 0 ? "danger" : "default"}
          />
          <StatCard
            label="Critical"
            value={analysisResult?.criticalCount ?? "-"}
            icon={<XCircle className="h-4 w-4" />}
            variant={(analysisResult?.criticalCount ?? 0) > 0 ? "danger" : "default"}
          />
          <StatCard
            label="High Risk"
            value={analysisResult?.highCount ?? "-"}
            icon={<AlertTriangle className="h-4 w-4" />}
            variant={(analysisResult?.highCount ?? 0) > 0 ? "warning" : "default"}
          />
        </div>

        {/* Analysis Tabs */}
        <Tabs defaultValue="quick" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quick" className="gap-2">
              <Clock className="h-4 w-4" />
              Quick Check ({totalQuickIssues})
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Brain className="h-4 w-4" />
              AI Analysis {analysisResult ? `(${analysisResult.anomalies.length})` : ""}
            </TabsTrigger>
            <TabsTrigger value="summary" className="gap-2">
              <Shield className="h-4 w-4" />
              Summary
            </TabsTrigger>
          </TabsList>

          {/* Quick Check Tab */}
          <TabsContent value="quick" className="mt-4">
            {totalQuickIssues === 0 ? (
              <EmptyState
                icon={<CheckCircle2 className="h-12 w-12 text-green-500" />}
                title="No Issues Detected"
                description="Quick local checks passed for all batches."
              />
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {Array.from(quickIssues.entries()).map(([batchId, issues]) => (
                    <div key={batchId} className="p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="font-mono">{batchId}</Badge>
                        <Badge variant="secondary">{issues.length} issue(s)</Badge>
                      </div>
                      <ul className="space-y-1">
                        {issues.map((issue, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <AlertCircle className="h-3 w-3 mt-1 text-yellow-600" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="ai" className="mt-4">
            {isAnalyzing ? (
              <div className="space-y-4 py-8">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">AI is analyzing {batches.length} batches...</p>
                  <Progress value={33} className="w-64" />
                </div>
              </div>
            ) : !analysisResult ? (
              <EmptyState
                icon={<Brain className="h-12 w-12 text-muted-foreground" />}
                title="No AI Analysis Yet"
                description="Click 'Run AI Analysis' to detect advanced anomalies using GenKit + Gemini."
              />
            ) : analysisResult.anomalies.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 className="h-12 w-12 text-green-500" />}
                title="All Clear!"
                description="AI analysis found no anomalies in the supply chain."
              />
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {analysisResult.anomalies.map((anomaly) => (
                    <AnomalyCard
                      key={anomaly.id}
                      anomaly={anomaly}
                      onFlag={() => handleFlagBatch(anomaly)}
                      onSelect={() => setSelectedAnomaly(anomaly)}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="mt-4">
            {!analysisResult ? (
              <EmptyState
                icon={<Shield className="h-12 w-12 text-muted-foreground" />}
                title="No Analysis Data"
                description="Run an AI analysis to see the executive summary."
              />
            ) : (
              <div className="space-y-4">
                {/* Risk Overview */}
                <Alert className={analysisResult.criticalCount > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>
                    {analysisResult.criticalCount > 0 ? "⚠️ Action Required" : "✅ Supply Chain Healthy"}
                  </AlertTitle>
                  <AlertDescription>
                    {analysisResult.summary}
                  </AlertDescription>
                </Alert>

                {/* Top Risks */}
                {analysisResult.topRisks.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Top Risk Areas</h4>
                    <ul className="space-y-2">
                      {analysisResult.topRisks.map((risk, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{i + 1}</span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{analysisResult.criticalCount}</p>
                    <p className="text-xs text-muted-foreground">Critical</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{analysisResult.highCount}</p>
                    <p className="text-xs text-muted-foreground">High</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{analysisResult.mediumCount}</p>
                    <p className="text-xs text-muted-foreground">Medium</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{analysisResult.lowCount}</p>
                    <p className="text-xs text-muted-foreground">Low</p>
                  </div>
                </div>

                {lastAnalyzed && (
                  <p className="text-xs text-muted-foreground text-center">
                    Last analyzed: {format(lastAnalyzed, "PPpp")}
                  </p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ============ Sub-components ============

function StatCard({
  label,
  value,
  icon,
  variant = "default"
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  variant?: "default" | "warning" | "danger";
}) {
  const variantStyles = {
    default: "bg-muted/50",
    warning: "bg-yellow-50 border-yellow-200",
    danger: "bg-red-50 border-red-200",
  };

  return (
    <div className={`p-3 rounded-lg border ${variantStyles[variant]}`}>
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center py-8">
      <div className="flex justify-center mb-4 opacity-50">{icon}</div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function AnomalyCard({
  anomaly,
  onFlag,
  onSelect
}: {
  anomaly: Anomaly;
  onFlag: () => void;
  onSelect: () => void;
}) {
  const config = severityConfig[anomaly.severity] || severityConfig.medium;
  const icon = typeIcons[anomaly.type] || <AlertTriangle className="h-4 w-4" />;

  return (
    <div
      className={`p-4 border rounded-lg ${config.bgColor} cursor-pointer hover:shadow-md transition-shadow`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {icon}
            <Badge className={config.color}>{config.label}</Badge>
            <Badge variant="outline" className="font-mono text-xs">{anomaly.batchId}</Badge>
            <Badge variant="secondary" className="text-xs">{anomaly.type.replace("_", " ")}</Badge>
          </div>

          <h4 className="font-semibold text-sm mb-1">{anomaly.title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{anomaly.description}</p>

          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Confidence: {anomaly.confidence}%
            </span>
            <span>{anomaly.affectedStage}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              onFlag();
            }}
          >
            Flag Batch
          </Button>
          <Button size="sm" variant="ghost" className="gap-1">
            Details <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {anomaly.recommendation && (
        <div className="mt-3 pt-3 border-t border-dashed">
          <p className="text-xs">
            <span className="font-semibold">Recommendation:</span> {anomaly.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}
