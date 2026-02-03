import { useState } from 'react';
import { useSubmitPoliceReportWithEvidence, useGetVictimProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, FileImage, FileAudio, FileText, AlertCircle, User, BarChart3, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { PoliceDepartment, EvidenceMeta } from '../backend';

interface PoliceReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incidentId: string;
  criminalActivityReportNumber: string;
  department: PoliceDepartment;
  availableEvidence: EvidenceMeta[];
  onSubmitSuccess: () => void;
}

export default function PoliceReportDialog({
  open,
  onOpenChange,
  incidentId,
  criminalActivityReportNumber,
  department,
  availableEvidence,
  onSubmitSuccess,
}: PoliceReportDialogProps) {
  const [selectedEvidence, setSelectedEvidence] = useState<Set<bigint>>(new Set());
  const [includeVictimInfo, setIncludeVictimInfo] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(false);
  const [acknowledgedDisclaimer, setAcknowledgedDisclaimer] = useState(false);
  const submitReport = useSubmitPoliceReportWithEvidence();
  const { data: victimProfile } = useGetVictimProfile();

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

  const toggleEvidence = (evidenceId: bigint) => {
    const newSelected = new Set(selectedEvidence);
    if (newSelected.has(evidenceId)) {
      newSelected.delete(evidenceId);
    } else {
      newSelected.add(evidenceId);
    }
    setSelectedEvidence(newSelected);
  };

  const selectAll = () => {
    setSelectedEvidence(new Set(availableEvidence.map((e) => e.id)));
  };

  const deselectAll = () => {
    setSelectedEvidence(new Set());
  };

  const getTotalSize = () => {
    let total = 0n;
    availableEvidence.forEach((evidence) => {
      if (selectedEvidence.has(evidence.id)) {
        total += evidence.fileSize;
      }
    });
    return formatFileSize(total);
  };

  const handleSubmit = async () => {
    if (!acknowledgedDisclaimer) {
      toast.error('Please acknowledge the legal disclaimer before submitting');
      return;
    }

    try {
      const selectedIds = Array.from(selectedEvidence);
      const selectedEvidenceItems = availableEvidence.filter(e => selectedIds.includes(e.id));
      
      await submitReport.mutateAsync({
        department,
        submissionResult: 'Successfully submitted to police department',
        attachedEvidence: selectedEvidenceItems,
        victimInfoIncluded: includeVictimInfo,
        victimInfo: includeVictimInfo && victimProfile ? victimProfile : null,
        includedSummary: includeSummary,
      });

      toast.success('Police report submitted successfully');
      onSubmitSuccess();
      onOpenChange(false);
      // Reset state when closing
      setAcknowledgedDisclaimer(false);
    } catch (error) {
      toast.error('Failed to submit police report');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span>Submit Police Report - </span>
            <span className="font-normal">Criminal Activity Report Number </span>
            <span className="font-bold">{criminalActivityReportNumber}</span>
          </DialogTitle>
          <DialogDescription>
            Review and select evidence to include in your police report submission
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Department Information */}
            <div className="bg-muted/50 rounded-lg p-4 border">
              <h4 className="font-semibold text-sm mb-2">Submitting to:</h4>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{department.name}</p>
                <p>{department.address}</p>
                <p>{department.city}, {department.state} {department.zipCode}</p>
                <p>Contact: {department.contactNumber}</p>
              </div>
            </div>

            {/* Victim Information Section */}
            {victimProfile && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Victim/Survivor Information
                    </h4>
                    <Checkbox
                      id="includeVictimInfo"
                      checked={includeVictimInfo}
                      onCheckedChange={(checked) => setIncludeVictimInfo(checked as boolean)}
                    />
                  </div>
                  {includeVictimInfo && (
                    <div className="bg-primary/5 rounded-lg p-3 border border-primary/20 text-sm space-y-1">
                      {victimProfile.name && <p><span className="text-muted-foreground">Name:</span> {victimProfile.name}</p>}
                      {victimProfile.dob && <p><span className="text-muted-foreground">Date of Birth:</span> {victimProfile.dob}</p>}
                      {victimProfile.address && <p><span className="text-muted-foreground">Address:</span> {victimProfile.address}</p>}
                      {victimProfile.email && <p><span className="text-muted-foreground">Email:</span> {victimProfile.email}</p>}
                      {victimProfile.phoneNumber && <p><span className="text-muted-foreground">Phone:</span> {victimProfile.phoneNumber}</p>}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Include Summary Option */}
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <Label htmlFor="includeSummary" className="font-semibold text-sm cursor-pointer">
                    Include Interactive Summary
                  </Label>
                </div>
                <Checkbox
                  id="includeSummary"
                  checked={includeSummary}
                  onCheckedChange={(checked) => setIncludeSummary(checked as boolean)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Include comprehensive pattern analysis and timeline data to demonstrate escalation
              </p>
            </div>

            {/* Evidence Selection */}
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">
                  Select Evidence to Include ({selectedEvidence.size} of {availableEvidence.length} selected)
                </h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAll}>
                    Deselect All
                  </Button>
                </div>
              </div>

              {availableEvidence.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No evidence files attached to this incident. You can still submit the report with incident details only.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {availableEvidence.map((evidence) => (
                    <div
                      key={evidence.id.toString()}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedEvidence.has(evidence.id)
                          ? 'bg-primary/5 border-primary'
                          : 'bg-card hover:bg-muted/50'
                      }`}
                      onClick={() => toggleEvidence(evidence.id)}
                    >
                      <Checkbox
                        checked={selectedEvidence.has(evidence.id)}
                        onCheckedChange={() => toggleEvidence(evidence.id)}
                      />
                      <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded">
                        {getFileIcon(evidence.fileType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{evidence.originalFilename}</p>
                        <p className="text-xs text-muted-foreground">
                          {evidence.fileType} • {formatFileSize(evidence.fileSize)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedEvidence.size > 0 && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg border">
                  <p className="text-sm font-medium">
                    Total selected: {selectedEvidence.size} file{selectedEvidence.size !== 1 ? 's' : ''} ({getTotalSize()})
                  </p>
                </div>
              )}
            </div>

            {/* Legal Disclaimer Section */}
            <Separator />
            <div className="border-2 border-primary/30 rounded-lg p-4 bg-primary/5">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm mb-2 text-primary">Legal Disclaimer</h4>
                  <p className="text-sm leading-relaxed italic text-foreground/90">
                    ReportHer is a platform for documentation and awareness. Users are solely responsible for the accuracy of all reports and submissions. The developers, owners, and hosting providers are not liable for false reporting, data loss, technical errors, or third-party integrations. Use of this application constitutes acceptance of these terms.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 mt-4">
                <Checkbox
                  id="acknowledgeDisclaimer"
                  checked={acknowledgedDisclaimer}
                  onCheckedChange={(checked) => setAcknowledgedDisclaimer(checked as boolean)}
                  aria-label="Acknowledge legal disclaimer"
                  className="mt-0.5"
                />
                <Label
                  htmlFor="acknowledgeDisclaimer"
                  className="text-sm font-semibold cursor-pointer leading-relaxed"
                >
                  I understand and accept this disclosure
                </Label>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitReport.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitReport.isPending || !acknowledgedDisclaimer}
            className="bg-primary hover:bg-primary/90"
          >
            {submitReport.isPending ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
