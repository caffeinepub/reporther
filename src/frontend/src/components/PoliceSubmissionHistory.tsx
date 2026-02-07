import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetPoliceSubmissionLogs } from '../hooks/useQueries';
import { Shield, CheckCircle2, XCircle, FileImage, FileAudio, FileText, AlertTriangle, User, FileCheck } from 'lucide-react';

export default function PoliceSubmissionHistory() {
  const { data: logs, isLoading, error } = useGetPoliceSubmissionLogs();

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

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="w-4 h-4" />;
    if (type.startsWith('audio/')) return <FileAudio className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: bigint) => {
    const size = Number(bytes);
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-destructive">
        <AlertTriangle className="h-5 w-5" />
        <AlertDescription>
          Failed to load police submission history. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Police Submission Evidence Record
          </CardTitle>
          <CardDescription>
            Your complete history of police department submissions with evidence details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              No police submissions yet. When you submit an incident report to law enforcement, 
              it will appear here with complete evidence records for accountability.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Shield className="w-6 h-6 text-primary" />
            Police Submission Evidence Record
          </CardTitle>
          <CardDescription className="text-base">
            Complete transparency of all police department submissions with evidence details
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {logs.map((log, index) => {
          const isSuccess = log.submissionResult.toLowerCase().includes('success');
          const hasNarrative = log.narrative && log.narrative.trim().length > 0;
          
          return (
            <Card key={index} className="border-2 border-secondary/20 shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {isSuccess ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-yellow-600" />
                      )}
                      {log.department.name}
                    </CardTitle>
                    <CardDescription>
                      Submitted on {formatDateTime(log.timestamp)}
                    </CardDescription>
                  </div>
                  <Badge variant={isSuccess ? 'default' : 'secondary'} className="font-semibold">
                    {isSuccess ? 'Submitted' : 'Manual Required'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-3 border">
                  <h4 className="font-semibold text-sm mb-2">Department Information</h4>
                  <div className="space-y-1 text-sm">
                    <p>{log.department.address}</p>
                    <p>{log.department.city}, {log.department.state} {log.department.zipCode}</p>
                    <p>Contact: {log.department.contactNumber}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Submission Status</h4>
                  <p className="text-sm text-muted-foreground">{log.submissionResult}</p>
                </div>

                {/* Incident Description Section */}
                {hasNarrative && (
                  <>
                    <Separator />
                    <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-primary" />
                        Incident Description
                      </h4>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {log.narrative}
                      </p>
                    </div>
                  </>
                )}

                {/* Victim Information Section */}
                {log.victimInfoIncluded && log.victimInfo && (
                  <>
                    <Separator />
                    <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        Victim Information Included
                      </h4>
                      <div className="space-y-1 text-sm">
                        {log.victimInfo.name && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-medium">{log.victimInfo.name}</span>
                          </div>
                        )}
                        {log.victimInfo.dob && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date of Birth:</span>
                            <span className="font-medium">{log.victimInfo.dob}</span>
                          </div>
                        )}
                        {log.victimInfo.address && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Address:</span>
                            <span className="font-medium">{log.victimInfo.address}</span>
                          </div>
                        )}
                        {log.victimInfo.email && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span className="font-medium">{log.victimInfo.email}</span>
                          </div>
                        )}
                        {log.victimInfo.phoneNumber && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Phone Number:</span>
                            <span className="font-medium">{log.victimInfo.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Evidence Section */}
                {log.attachedEvidence && log.attachedEvidence.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm mb-3">
                        Attached Evidence ({log.attachedEvidence.length} file{log.attachedEvidence.length !== 1 ? 's' : ''})
                      </h4>
                      <ScrollArea className="max-h-64">
                        <div className="space-y-2 pr-4">
                          {log.attachedEvidence.map((evidence) => (
                            <div
                              key={evidence.id.toString()}
                              className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                            >
                              <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded">
                                {getFileIcon(evidence.fileType)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{evidence.originalFilename}</p>
                                <p className="text-xs text-muted-foreground">
                                  {evidence.fileType} • {formatFileSize(evidence.fileSize)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Uploaded: {formatDateTime(evidence.uploadTimestamp)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
