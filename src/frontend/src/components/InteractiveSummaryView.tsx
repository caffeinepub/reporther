import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGenerateIncidentSummary } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertCircle, 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Image, 
  Loader2, 
  MapPin, 
  MessageSquare, 
  TrendingUp,
  Shield,
  BarChart3
} from 'lucide-react';
import { ToneIntensity, IncidentSummary } from '../backend';

interface InteractiveSummaryViewProps {
  onBack: () => void;
}

export default function InteractiveSummaryView({ onBack }: InteractiveSummaryViewProps) {
  const { identity } = useInternetIdentity();
  const [summary, setSummary] = useState<IncidentSummary | null>(null);
  const generateSummary = useGenerateIncidentSummary();

  // Generate summary on mount
  useEffect(() => {
    if (identity && !summary && !generateSummary.isPending) {
      generateSummary.mutateAsync().then((result) => {
        setSummary(result);
      }).catch((error) => {
        console.error('Failed to generate summary:', error);
      });
    }
  }, [identity]);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getIntensityColor = (intensity?: ToneIntensity) => {
    if (!intensity) return 'bg-gray-500';
    switch (intensity) {
      case ToneIntensity.calm:
        return 'bg-blue-500';
      case ToneIntensity.firm:
        return 'bg-yellow-500';
      case ToneIntensity.severe:
        return 'bg-orange-500';
      case ToneIntensity.veryHarsh:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getIntensityLabel = (intensity?: ToneIntensity) => {
    if (!intensity) return 'None';
    switch (intensity) {
      case ToneIntensity.calm:
        return 'Calm';
      case ToneIntensity.firm:
        return 'Firm';
      case ToneIntensity.severe:
        return 'Severe';
      case ToneIntensity.veryHarsh:
        return 'Very Harsh';
      default:
        return 'Unknown';
    }
  };

  if (generateSummary.isPending) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Compiling your incident summary...</p>
        </CardContent>
      </Card>
    );
  }

  if (generateSummary.isError) {
    return (
      <Card>
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load incident summary. Please try again.
            </AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to History
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="py-12">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No incidents found. Create your first incident report to see a summary.
            </AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to History
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Interactive Summary View</CardTitle>
              <CardDescription>
                Comprehensive timeline and pattern analysis of all documented incidents
              </CardDescription>
            </div>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Total Analysis Overview */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Overview Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-background/50 rounded-lg border border-primary/20">
              <div className="text-4xl font-bold text-primary mb-2">
                {summary.totalAnalysis.incidentCount.toString()}
              </div>
              <div className="text-sm text-muted-foreground font-medium">Total Incidents</div>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg border border-primary/20">
              <div className="text-4xl font-bold text-secondary mb-2">
                {summary.totalAnalysis.evidenceCount.toString()}
              </div>
              <div className="text-sm text-muted-foreground font-medium">Evidence Files</div>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg border border-primary/20">
              <div className="text-4xl font-bold text-accent mb-2">
                {summary.totalAnalysis.messageCount.toString()}
              </div>
              <div className="text-sm text-muted-foreground font-medium">Messages Generated</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pattern Analysis */}
      {summary.patternAnalysis.locations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Pattern Analysis
            </CardTitle>
            <CardDescription>
              Identified patterns and trends across your documented incidents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Location Patterns */}
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location Patterns
                </h4>
                <div className="space-y-2">
                  {summary.patternAnalysis.locations.map((loc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {loc.count.toString()}
                          </span>
                        </div>
                        <span className="text-sm font-medium">{loc.location}</span>
                      </div>
                      <Badge variant="outline">{loc.severity}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Severity Patterns */}
              {summary.patternAnalysis.severityPatterns.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Message Intensity Patterns
                    </h4>
                    <div className="space-y-2">
                      {summary.patternAnalysis.severityPatterns.map((pattern, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-3 h-3 rounded-full ${getIntensityColor(pattern.intensity)}`}
                            />
                            <span className="text-sm font-medium">
                              {getIntensityLabel(pattern.intensity)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{pattern.incidentCount.toString()} incidents</span>
                            <span>{pattern.evidenceCount.toString()} evidence files</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline of Incidents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Incident Timeline
          </CardTitle>
          <CardDescription>
            Chronological view of all documented incidents with evidence and messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {summary.timelineItems.map((item, idx) => (
                <div key={item.id} className="relative">
                  {/* Timeline connector */}
                  {idx < summary.timelineItems.length - 1 && (
                    <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-primary/20" />
                  )}

                  <Card className="border-primary/30">
                    <CardContent className="pt-6">
                      {/* Incident Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg">
                              <span className="font-normal">Criminal Activity Report Number </span>
                              <span className="font-bold">{item.id}</span>
                            </h4>
                            <Badge variant="outline">{formatDate(item.timestamp)}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <MapPin className="w-4 h-4" />
                            <span>{item.location}</span>
                          </div>
                          <p className="text-sm text-foreground">{item.description}</p>
                        </div>
                      </div>

                      {/* Evidence Section */}
                      {item.evidence.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          <div>
                            <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <Image className="w-4 h-4" />
                              Evidence Files ({item.evidence.length})
                            </h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {item.evidence.map((evidence) => (
                                <div
                                  key={evidence.id.toString()}
                                  className="p-2 bg-muted/50 rounded border border-border text-xs"
                                >
                                  <div className="font-medium truncate">
                                    {evidence.originalFilename}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {evidence.fileType} • {(Number(evidence.fileSize) / 1024).toFixed(1)} KB
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Messages Section */}
                      {item.messages.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          <div>
                            <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Generated Messages ({item.messages.length})
                            </h5>
                            <div className="space-y-2">
                              {item.messages.map((message) => (
                                <div
                                  key={message.id.toString()}
                                  className="p-3 bg-muted/50 rounded border border-border"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {message.tone}
                                    </Badge>
                                    {message.intensity && (
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={`w-2 h-2 rounded-full ${getIntensityColor(message.intensity)}`}
                                        />
                                        <span className="text-xs text-muted-foreground">
                                          {getIntensityLabel(message.intensity)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-xs text-foreground line-clamp-2">
                                    {message.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="py-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground font-medium">
              This comprehensive summary can be included in police reports to demonstrate patterns and escalation.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button onClick={onBack} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to History
              </Button>
              <Button
                onClick={() => {
                  window.print();
                }}
                className="bg-primary hover:bg-primary/90"
              >
                <FileText className="w-4 h-4 mr-2" />
                Print Summary
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
