import { useState, useEffect } from 'react';
import { useGetIncidentMessages, useGetStalkerInfo, useGetIncidentEvidence, useGetAllStalkerProfiles, useFindNearestPoliceDepartment, useGetSelectedDepartment, useSaveSelectedDepartment } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, MessageSquare, Plus, Shield, FileImage, FileAudio, FileText, Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { IncidentReport, PoliceDepartment, StalkerProfile } from '../types';
import MessageGenerator from './MessageGenerator';
import MessageList from './MessageList';
import PoliceReportDialog from './PoliceReportDialog';

interface IncidentDetailProps {
  incident: IncidentReport;
  onBack: () => void;
  policeDepartment?: PoliceDepartment | null;
}

export default function IncidentDetail({ incident, onBack, policeDepartment: initialPoliceDepartment }: IncidentDetailProps) {
  const [showGenerator, setShowGenerator] = useState(false);
  const [showPoliceDialog, setShowPoliceDialog] = useState(false);
  const [currentPoliceDepartment, setCurrentPoliceDepartment] = useState<PoliceDepartment | null>(initialPoliceDepartment || null);
  const [hasLoadedSavedDept, setHasLoadedSavedDept] = useState(false);
  
  const { data: messages, isLoading: messagesLoading } = useGetIncidentMessages(incident.id);
  const { data: stalkerInfo } = useGetStalkerInfo();
  const { data: evidence, isLoading: evidenceLoading } = useGetIncidentEvidence(incident.id);
  const { data: stalkerProfiles = [] } = useGetAllStalkerProfiles();
  const { data: savedDepartment, isLoading: savedDeptLoading } = useGetSelectedDepartment();
  const saveSelectedDepartment = useSaveSelectedDepartment();
  const findNearestDepartment = useFindNearestPoliceDepartment();

  // Load saved department on mount
  useEffect(() => {
    if (!savedDeptLoading && savedDepartment && !hasLoadedSavedDept) {
      setCurrentPoliceDepartment(savedDepartment);
      setHasLoadedSavedDept(true);
    }
  }, [savedDepartment, savedDeptLoading, hasLoadedSavedDept]);

  // Auto-refresh police department when stalker info changes (only if no saved department exists)
  useEffect(() => {
    // Skip auto-refresh if we have a saved department
    if (hasLoadedSavedDept && currentPoliceDepartment) {
      return;
    }

    const refreshPoliceDepartment = async () => {
      if (!stalkerInfo) {
        setCurrentPoliceDepartment(null);
        return;
      }
      
      const hasAddress = stalkerInfo.zipCode || stalkerInfo.fullAddress;
      if (!hasAddress) {
        setCurrentPoliceDepartment(null);
        return;
      }

      try {
        // Build address string from available stalker info
        const addressParts: string[] = [];
        if (stalkerInfo.fullAddress) {
          addressParts.push(stalkerInfo.fullAddress);
        }
        if (stalkerInfo.city) {
          addressParts.push(stalkerInfo.city);
        }
        if (stalkerInfo.state) {
          addressParts.push(stalkerInfo.state);
        }
        if (stalkerInfo.zipCode) {
          addressParts.push(stalkerInfo.zipCode);
        }

        const addressString = addressParts.join(' ').trim();
        if (!addressString) {
          setCurrentPoliceDepartment(null);
          return;
        }

        const result = await findNearestDepartment.mutateAsync(addressString);
        
        if (result) {
          setCurrentPoliceDepartment(result);
        } else {
          setCurrentPoliceDepartment(null);
        }
      } catch (error) {
        console.error('Error auto-refreshing police department:', error);
        setCurrentPoliceDepartment(null);
      }
    };

    refreshPoliceDepartment();
  }, [stalkerInfo?.zipCode, stalkerInfo?.fullAddress, stalkerInfo?.city, stalkerInfo?.state, hasLoadedSavedDept, currentPoliceDepartment]);

  const formatDateTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReportToPolice = () => {
    if (!currentPoliceDepartment) {
      toast.error('Please set up stalker information with address details to find nearest police department');
      return;
    }
    setShowPoliceDialog(true);
  };

  const handleManualRefreshDept = async () => {
    if (!stalkerInfo) {
      toast.error('Please set up stalker information first');
      return;
    }

    const hasAddress = stalkerInfo.zipCode || stalkerInfo.fullAddress;
    if (!hasAddress) {
      toast.error('Please enter address information (zip code at minimum) in Stalker Info');
      return;
    }

    try {
      // Build address string from available stalker info
      const addressParts: string[] = [];
      if (stalkerInfo.fullAddress) {
        addressParts.push(stalkerInfo.fullAddress);
      }
      if (stalkerInfo.city) {
        addressParts.push(stalkerInfo.city);
      }
      if (stalkerInfo.state) {
        addressParts.push(stalkerInfo.state);
      }
      if (stalkerInfo.zipCode) {
        addressParts.push(stalkerInfo.zipCode);
      }

      const addressString = addressParts.join(' ').trim();
      if (!addressString) {
        toast.error('Please enter address information (zip code at minimum) in Stalker Info');
        return;
      }

      const result = await findNearestDepartment.mutateAsync(addressString);
      
      if (result) {
        setCurrentPoliceDepartment(result);
        // Save the refreshed department
        await saveSelectedDepartment.mutateAsync(result);
        toast.success('Police department information refreshed and saved');
      } else {
        setCurrentPoliceDepartment(null);
        toast.error('No police department found for the provided address. Please manually enter department information in the Stalker Info area.');
      }
    } catch (error: any) {
      console.error('Error refreshing police department:', error);
      setCurrentPoliceDepartment(null);
      toast.error(error.message || 'Failed to refresh police department information. Please check your connection and try again.');
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="w-5 h-5" />;
    if (type.startsWith('audio/')) return <FileAudio className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: bigint) => {
    const size = Number(bytes);
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownloadEvidence = (storageId: string, filename: string) => {
    toast.info('Evidence file download functionality will be available once files are stored');
  };

  const handleSubmitSuccess = () => {
    toast.success('Police report submitted successfully');
  };

  if (!incident) {
    return (
      <Card>
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Incident not found. Please return to the history view.
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

  const isRefreshingDept = findNearestDepartment.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to History
        </Button>

        <div className="flex gap-2 flex-wrap">
          {stalkerInfo && (stalkerInfo.zipCode || stalkerInfo.fullAddress) && (
            <Button
              onClick={handleManualRefreshDept}
              disabled={isRefreshingDept}
              variant="outline"
              className="border-2 border-secondary/50 hover:bg-secondary/10 font-semibold"
            >
              {isRefreshingDept ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Police Dept
                </>
              )}
            </Button>
          )}
          
          <Button
            onClick={handleReportToPolice}
            disabled={!currentPoliceDepartment}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold"
          >
            <Shield className="w-4 h-4 mr-2" />
            Report to Police
          </Button>
        </div>
      </div>

      {!stalkerInfo && (
        <Alert className="border-primary/50 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription>
            <strong className="text-primary">Stalker Information Required:</strong> Please set up stalker information 
            in the Stalker Info tab to enable police department lookup and reporting functionality.
          </AlertDescription>
        </Alert>
      )}

      {stalkerInfo && !(stalkerInfo.zipCode || stalkerInfo.fullAddress) && (
        <Alert className="border-primary/50 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription>
            <strong className="text-primary">Address Information Needed:</strong> Please add address information 
            (zip code at minimum) to your stalker profile to automatically locate the nearest police department.
          </AlertDescription>
        </Alert>
      )}

      {stalkerInfo && (stalkerInfo.zipCode || stalkerInfo.fullAddress) && !currentPoliceDepartment && !isRefreshingDept && !savedDeptLoading && (
        <Alert className="border-primary/50 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription>
            <strong className="text-primary">Police Department Not Found:</strong> No department could be found for the 
            provided address. You can manually enter department information in the Stalker Info area or try updating 
            the address details.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>
                <span className="font-normal">Criminal Activity Report Number </span>
                <span className="font-bold">{incident.criminalActivityReportNumber}</span>
              </CardTitle>
              <CardDescription>Reported on {formatDateTime(incident.timestamp)}</CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              {formatDateTime(incident.incidentDate)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Location</p>
            <p className="text-foreground">{incident.location}</p>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Description</p>
            <p className="text-foreground whitespace-pre-wrap">{incident.description}</p>
          </div>

          {incident.evidenceNotes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Evidence Notes</p>
                <p className="text-foreground whitespace-pre-wrap">{incident.evidenceNotes}</p>
              </div>
            </>
          )}

          {incident.additionalNotes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Additional Notes</p>
                <p className="text-foreground whitespace-pre-wrap">{incident.additionalNotes}</p>
              </div>
            </>
          )}

          {/* Evidence Files Section */}
          {evidenceLoading ? (
            <>
              <Separator />
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                <p className="text-muted-foreground">Loading evidence files...</p>
              </div>
            </>
          ) : evidence && evidence.length > 0 ? (
            <>
              <Separator />
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-3">
                  Attached Evidence ({evidence.length})
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {evidence.map((file) => (
                    <Card key={file.id.toString()} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded">
                            {getFileIcon(file.fileType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{file.originalFilename}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.fileSize)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(file.uploadTimestamp)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadEvidence(file.storageId, file.originalFilename)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Generated Messages
              </CardTitle>
              <CardDescription>Create professional message drafts with contextual content based on this incident</CardDescription>
            </div>
            {!showGenerator && (
              <Button onClick={() => setShowGenerator(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Generate Message
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {showGenerator ? (
            <MessageGenerator
              incidentId={incident.id}
              onCancel={() => setShowGenerator(false)}
              onSuccess={() => setShowGenerator(false)}
            />
          ) : (
            <MessageList
              messages={messages || []}
              isLoading={messagesLoading}
              onGenerateNew={() => setShowGenerator(true)}
            />
          )}
        </CardContent>
      </Card>

      {currentPoliceDepartment && (
        <PoliceReportDialog
          open={showPoliceDialog}
          onOpenChange={setShowPoliceDialog}
          incidentId={incident.id}
          criminalActivityReportNumber={incident.criminalActivityReportNumber}
          department={currentPoliceDepartment}
          availableEvidence={evidence || []}
          onSubmitSuccess={handleSubmitSuccess}
        />
      )}
    </div>
  );
}
