import { useState, useEffect } from 'react';
import { useGetUserIncidents } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, FileText, Loader2, RefreshCw, BarChart3, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import IncidentDetail from './IncidentDetail';
import InteractiveSummaryView from './InteractiveSummaryView';
import type { IncidentReport, PoliceDepartment } from '../types';

interface IncidentHistoryProps {
  selectedIncidentId: string | null;
  policeDepartment?: PoliceDepartment | null;
}

export default function IncidentHistory({ selectedIncidentId, policeDepartment }: IncidentHistoryProps) {
  const { data: incidents, isLoading, error, refetch, isFetching } = useGetUserIncidents();
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Auto-select incident if provided via props
  useEffect(() => {
    if (selectedIncidentId && incidents && incidents.length > 0) {
      const incident = incidents.find((i) => i.id === selectedIncidentId);
      if (incident) {
        setSelectedIncident(incident);
      }
    }
  }, [selectedIncidentId, incidents]);

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

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your incident history...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="mb-4">
              Failed to load incident history. Please try again.
            </AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!incidents || incidents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No incidents reported yet. Use the "New Report" tab to document your first incident.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Show incident detail
  if (selectedIncident) {
    return (
      <IncidentDetail
        incident={selectedIncident}
        onBack={() => setSelectedIncident(null)}
        policeDepartment={policeDepartment}
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Incident History</CardTitle>
              <CardDescription>
                View all your reported incidents. Click on an incident to view details and generate messages.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowSummaryModal(true)}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 font-semibold"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Full Summary
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isFetching}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {incidents.map((incident) => (
                <Card
                  key={incident.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setSelectedIncident(incident)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-foreground">
                            <span className="font-normal">Criminal Activity Report Number </span>
                            <span className="font-bold">{incident.criminalActivityReportNumber}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Reported: {formatDateTime(incident.timestamp)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{formatDate(incident.incidentDate)}</Badge>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Location</p>
                        <p className="text-sm text-foreground">{incident.location}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Description</p>
                        <p className="text-sm text-foreground line-clamp-2">
                          {incident.description}
                        </p>
                      </div>
                      {incident.evidenceNotes && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Evidence Notes</p>
                          <p className="text-sm text-foreground line-clamp-1">
                            {incident.evidenceNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Summary Modal */}
      <Dialog open={showSummaryModal} onOpenChange={setShowSummaryModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Interactive Summary View
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto px-6 pb-6">
            <InteractiveSummaryView onBack={() => setShowSummaryModal(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
