"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeographicData } from "@/types/analytics";
import { MapPin, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface GeographicDistributionProps {
  data: GeographicData[];
}

export function GeographicDistribution({ data }: GeographicDistributionProps) {
  const totalBatches = data.reduce((sum, item) => sum + item.batches, 0);
  const totalVerifications = data.reduce((sum, item) => sum + item.verifications, 0);
  const totalIncidents = data.reduce((sum, item) => sum + item.incidents, 0);

  const getIncidentSeverity = (incidents: number, batches: number) => {
    const rate = (incidents / batches) * 100;
    if (rate > 5) return { level: 'high', color: 'text-red-600', bg: 'bg-red-500/10' };
    if (rate > 2) return { level: 'medium', color: 'text-yellow-600', bg: 'bg-yellow-500/10' };
    return { level: 'low', color: 'text-green-600', bg: 'bg-green-500/10' };
  };

  const getVerificationRate = (verifications: number, batches: number) => {
    return (verifications / batches) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Geographic Distribution
        </CardTitle>
        <CardDescription>
          Batch distribution, verification rates, and incidents by location
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500">
            <p className="text-sm text-muted-foreground mb-1">Total Locations</p>
            <p className="text-3xl font-bold text-blue-600">{data.length}</p>
          </div>
          <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500">
            <p className="text-sm text-muted-foreground mb-1">Total Batches</p>
            <p className="text-3xl font-bold text-green-600">{totalBatches}</p>
          </div>
          <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500">
            <p className="text-sm text-muted-foreground mb-1">Verification Rate</p>
            <p className="text-3xl font-bold text-purple-600">
              {totalBatches > 0 ? Math.round((totalVerifications / totalBatches) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Location List */}
        <div className="space-y-3">
          {data.map((location, index) => {
            const verificationRate = getVerificationRate(location.verifications, location.batches);
            const incidentSeverity = getIncidentSeverity(location.incidents, location.batches);
            const incidentRate = ((location.incidents / location.batches) * 100).toFixed(1);

            return (
              <div
                key={`${location.location}-${index}`}
                className="p-4 rounded-lg border hover:shadow-md transition-shadow bg-card"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <h4 className="font-semibold">{location.location}</h4>
                      </div>
                      {location.city && location.state && (
                        <p className="text-xs text-muted-foreground">
                          {location.city}, {location.state}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {location.incidents === 0 ? (
                        <Badge variant="outline" className="bg-green-500/10 border-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          No Incidents
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className={`${incidentSeverity.bg} border-${incidentSeverity.level === 'high' ? 'red' : incidentSeverity.level === 'medium' ? 'yellow' : 'green'}-500`}
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {location.incidents} Incident{location.incidents > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-muted/50 p-2 rounded">
                      <p className="text-xs text-muted-foreground mb-1">Batches</p>
                      <p className="text-lg font-bold">{location.batches}</p>
                      <p className="text-xs text-muted-foreground">
                        {((location.batches / totalBatches) * 100).toFixed(1)}% of total
                      </p>
                    </div>

                    <div className="bg-muted/50 p-2 rounded">
                      <p className="text-xs text-muted-foreground mb-1">Verifications</p>
                      <p className="text-lg font-bold">{location.verifications}</p>
                      <p className="text-xs text-muted-foreground">
                        {verificationRate.toFixed(1)}% rate
                      </p>
                    </div>

                    <div className={`${incidentSeverity.bg} p-2 rounded`}>
                      <p className="text-xs text-muted-foreground mb-1">Incident Rate</p>
                      <p className={`text-lg font-bold ${incidentSeverity.color}`}>
                        {incidentRate}%
                      </p>
                      <p className={`text-xs ${incidentSeverity.color} capitalize`}>
                        {incidentSeverity.level} risk
                      </p>
                    </div>
                  </div>

                  {/* Verification Progress */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Verification Coverage</span>
                      <span className="font-semibold">{verificationRate.toFixed(0)}%</span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full transition-all ${
                          verificationRate >= 90
                            ? 'bg-green-500'
                            : verificationRate >= 70
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${verificationRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {data.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No geographic data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
