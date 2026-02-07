import { useState } from 'react';
import { useSubmitPoliceReportWithEvidence, useGetVictimProfile, useGetIncident } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Shield, FileImage, FileAudio, FileText, AlertCircle, User, BarChart3, AlertTriangle, ChevronDown, FileCheck } from 'lucide-react';
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
  const [includeVictimInfo, setIncludeVictimInfo] = useState(false);
  const [includeSummary, setIncludeSummary] = useState(false);
  const [acknowledgedDisclaimer, setAcknowledgedDisclaimer] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const submitReport = useSubmitPoliceReportWithEvidence();
  const { data: victimProfile } = useGetVictimProfile();
  const { data: incident } = useGetIncident(incidentId);

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
    setSelectedEvidence((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(evidenceId)) {
        newSelected.delete(evidenceId);
      } else {
        newSelected.add(evidenceId);
      }
      return newSelected;
    });
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
      toast.error('Please acknowledge the legal disclosure before submitting');
      return;
    }

    try {
      const selectedIds = Array.from(selectedEvidence);
      const selectedEvidenceItems = availableEvidence.filter(e => selectedIds.includes(e.id));
      
      // Use incident description as narrative
      const narrative = incident?.description || '';
      
      await submitReport.mutateAsync({
        department,
        submissionResult: 'Successfully submitted to police department',
        attachedEvidence: selectedEvidenceItems,
        victimInfoIncluded: includeVictimInfo,
        victimInfo: includeVictimInfo && victimProfile ? victimProfile : null,
        includedSummary: includeSummary,
        narrative,
      });

      toast.success('Police report submitted successfully');
      onSubmitSuccess();
      onOpenChange(false);
      // Reset state when closing
      setSelectedEvidence(new Set());
      setIncludeVictimInfo(false);
      setIncludeSummary(false);
      setAcknowledgedDisclaimer(false);
      setAdvancedOpen(false);
    } catch (error) {
      toast.error('Failed to submit police report');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <div className="flex-shrink-0 px-6 pt-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <Shield className="w-5 h-5 text-primary flex-shrink-0" />
              <span>Submit Police Report - </span>
              <span className="font-normal">Criminal Activity Report Number </span>
              <span className="font-bold">{criminalActivityReportNumber}</span>
            </DialogTitle>
            <DialogDescription>
              Review your report before submission. Optional attachments are available below.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6">
          <div className="space-y-6 py-4">
            {/* Core: Department Information */}
            <div className="bg-muted/50 rounded-lg p-4 border">
              <h4 className="font-semibold text-sm mb-2">Submitting to:</h4>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{department.name}</p>
                <p>{department.address}</p>
                <p>{department.city}, {department.state} {department.zipCode}</p>
                <p>Contact: {department.contactNumber}</p>
              </div>
            </div>

            {/* Core: Incident Description */}
            {incident && incident.description && (
              <>
                <Separator />
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-primary" />
                    Incident Description
                  </h4>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {incident.description}
                  </p>
                </div>
              </>
            )}

            {/* Core: Note about optional attachments */}
            <p className="text-sm text-muted-foreground">
              Optional attachments can be added under Advanced Attachments below. Not required for submission.
            </p>

            <Separator />

            {/* Advanced Attachments (Optional) - Collapsed by default */}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-4 h-auto hover:bg-muted/50"
                >
                  <div className="text-left">
                    <h4 className="font-semibold text-sm">Advanced Attachments (Optional)</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Attach additional context if available. Not required for submission.
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ml-2 ${
                      advancedOpen ? 'rotate-180' : ''
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-6 mt-4">
                {/* Victim/Survivor Information */}
                {victimProfile && (
                  <>
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
                      <p className="text-xs text-muted-foreground mb-2">
                        Include your personal information in the report. Optional.
                      </p>
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
                    <Separator />
                  </>
                )}

                {/* Include Incident Timeline Summary */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      <Label htmlFor="includeSummary" className="font-semibold text-sm cursor-pointer">
                        Include Incident Timeline Summary
                      </Label>
                    </div>
                    <Checkbox
                      id="includeSummary"
                      checked={includeSummary}
                      onCheckedChange={(checked) => setIncludeSummary(checked as boolean)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Include comprehensive pattern analysis and timeline data to demonstrate escalation. Optional.
                  </p>
                </div>

                <Separator />

                {/* Attach Evidence */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">
                      Attach Evidence ({selectedEvidence.size} of {availableEvidence.length} selected)
                    </h4>
                    {availableEvidence.length > 0 && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={selectAll}>
                          Select All
                        </Button>
                        <Button variant="outline" size="sm" onClick={deselectAll}>
                          Deselect All
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Evidence can be added later. Incident details alone are valid.
                  </p>

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
                          <div onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedEvidence.has(evidence.id)}
                              onCheckedChange={() => toggleEvidence(evidence.id)}
                            />
                          </div>
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
              </CollapsibleContent>
            </Collapsible>

            {/* Core: Legal Disclosure Section */}
            <Separator />
            <div className="border-2 border-primary/30 rounded-lg p-4 bg-primary/5">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm mb-2 text-primary">Legal Disclosure</h4>
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
                  aria-label="Acknowledge legal disclosure"
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

            {/* Extra padding at bottom to ensure content is not hidden behind footer */}
            <div className="h-4" />
          </div>
        </div>

        <div className="flex-shrink-0 px-6 pb-6 pt-4 border-t bg-background">
          <DialogFooter>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
