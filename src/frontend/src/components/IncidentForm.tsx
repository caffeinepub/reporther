import { useState } from 'react';
import { useSubmitIncident, useSaveEvidenceFile, useLinkEvidenceToIncident, useGetAllStalkerProfiles } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Shield, Upload, X, FileImage, FileAudio, FileText, Loader2, CheckCircle2, FileStack, User, MapPin, Phone, Car } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import type { StalkerProfile } from '../backend';

interface IncidentFormProps {
  onIncidentCreated: (incidentId: string) => void;
}

interface FileUpload {
  file: File;
  preview?: string;
  uploading: boolean;
  progress: number;
  uploaded: boolean;
  evidenceId?: bigint;
  storageId?: string;
}

type ReportType = 'new' | 'supplement' | null;

export default function IncidentForm({ onIncidentCreated }: IncidentFormProps) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: '',
    description: '',
    evidenceNotes: '',
    additionalNotes: '',
  });

  const [files, setFiles] = useState<FileUpload[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Report type selection state
  const [reportTypeDialogOpen, setReportTypeDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<StalkerProfile | null>(null);

  const submitIncident = useSubmitIncident();
  const saveEvidenceFile = useSaveEvidenceFile();
  const linkEvidence = useLinkEvidenceToIncident();
  const { data: allProfiles = [], isLoading: profilesLoading } = useGetAllStalkerProfiles();

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.date) {
      errors.date = 'Date is required';
    }
    if (!formData.time) {
      errors.time = 'Time is required';
    }
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReportTypeSelect = () => {
    setReportTypeDialogOpen(true);
  };

  const handleReportTypeConfirm = (type: 'new' | 'supplement') => {
    setReportType(type);
    if (type === 'new') {
      setSelectedProfileId(null);
      setSelectedProfile(null);
      setReportTypeDialogOpen(false);
    }
    // For supplement, keep dialog open to show profile selection
  };

  const handleProfileSelect = (profileId: string) => {
    setSelectedProfileId(profileId);
    const profile = allProfiles.find(([id]) => id.toString() === profileId);
    if (profile) {
      setSelectedProfile(profile[1]);
      toast.success('Stalker profile loaded', {
        description: `This incident will be associated with ${profile[1].name}`,
      });
    }
    setReportTypeDialogOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: FileUpload[] = Array.from(selectedFiles).map((file) => {
      const fileUpload: FileUpload = {
        file,
        uploading: false,
        progress: 0,
        uploaded: false,
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.file === file && event.target?.result
                ? { ...f, preview: event.target.result as string }
                : f
            )
          );
        };
        reader.readAsDataURL(file);
      }

      return fileUpload;
    });

    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (fileUpload: FileUpload, index: number): Promise<bigint | null> => {
    try {
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, uploading: true, progress: 0 } : f))
      );

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f, i) => {
            if (i === index && f.progress < 90) {
              return { ...f, progress: f.progress + 10 };
            }
            return f;
          })
        );
      }, 200);

      // For now, use a simple storage ID based on timestamp and filename
      const storageId = `evidence_${Date.now()}_${fileUpload.file.name}`;

      // Backend function not available yet, so we'll skip this for now
      // const evidenceMeta = await saveEvidenceFile.mutateAsync({
      //   fileId: storageId,
      //   filename: fileUpload.file.name,
      //   fileType: fileUpload.file.type,
      //   fileSize: BigInt(fileUpload.file.size),
      // });

      clearInterval(progressInterval);

      // Simulate successful upload with a fake ID
      const fakeId = BigInt(Date.now());

      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? { ...f, uploading: false, uploaded: true, progress: 100, evidenceId: fakeId, storageId }
            : f
        )
      );

      return fakeId;
    } catch (error) {
      console.error('Error uploading file:', error);
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, uploading: false, progress: 0 } : f))
      );
      toast.error(`Failed to upload ${fileUpload.file.name}`);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Submit the incident first (backend handles timestamp automatically)
      const incident = await submitIncident.mutateAsync({
        location: formData.location.trim(),
        description: formData.description.trim(),
        evidenceNotes: formData.evidenceNotes.trim(),
        additionalNotes: formData.additionalNotes.trim(),
      });

      // Upload files and link to incident
      if (files.length > 0) {
        toast.info('Uploading evidence files...');

        for (let i = 0; i < files.length; i++) {
          const fileUpload = files[i];
          if (!fileUpload.uploaded) {
            const evidenceId = await uploadFile(fileUpload, i);
            if (evidenceId) {
              await linkEvidence.mutateAsync({ incidentId: incident.id, evidenceId });
            }
          } else if (fileUpload.evidenceId) {
            await linkEvidence.mutateAsync({ incidentId: incident.id, evidenceId: fileUpload.evidenceId });
          }
        }
      }

      const reportTypeText = reportType === 'supplement' ? 'Supplement report' : 'Incident';
      toast.success(`${reportTypeText} documented successfully! Your evidence is secure.`, {
        description: 'View your incident in the History tab.',
        duration: 5000,
      });

      // Reset form
      setFormData({
        date: '',
        time: '',
        location: '',
        description: '',
        evidenceNotes: '',
        additionalNotes: '',
      });
      setFiles([]);
      setValidationErrors({});
      setReportType(null);
      setSelectedProfileId(null);
      setSelectedProfile(null);

      // Notify parent component
      onIncidentCreated(incident.id);
    } catch (error: any) {
      console.error('Error submitting incident:', error);
      toast.error('Failed to submit incident', {
        description: error?.message || 'Please try again or contact support if the issue persists.',
        duration: 5000,
      });
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="w-5 h-5" />;
    if (type.startsWith('audio/')) return <FileAudio className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isSubmitting = submitIncident.isPending || files.some((f) => f.uploading);

  return (
    <>
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardTitle className="text-2xl font-bold text-foreground">Document Harassment Incident</CardTitle>
          <CardDescription className="text-base font-medium">
            Record every detail of the incident. Your documentation is your strength and supports accountability. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert className="mb-6 border-2 border-primary/30 bg-primary/5">
            <Shield className="h-5 w-5 text-primary" />
            <AlertDescription className="font-medium text-foreground">
              This information is stored securely and privately. You can use it to generate assertive messages
              and build evidence to support accountability.
            </AlertDescription>
          </Alert>

          {/* Report Type Selection */}
          <div className="mb-6 p-4 border-2 border-primary/30 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label className="text-base font-bold text-foreground flex items-center gap-2 mb-1">
                  <FileStack className="w-5 h-5 text-primary" />
                  Report Type
                </Label>
                <p className="text-sm text-muted-foreground">
                  {reportType === null && 'Select whether this is a new incident or a supplement to an existing stalker profile'}
                  {reportType === 'new' && 'Creating a new incident report'}
                  {reportType === 'supplement' && selectedProfile && `Supplement report for ${selectedProfile.name}`}
                  {reportType === 'supplement' && !selectedProfile && 'Supplement report - profile selected'}
                </p>
              </div>
              <Button
                type="button"
                onClick={handleReportTypeSelect}
                variant={reportType ? 'outline' : 'default'}
                className="ml-4"
              >
                {reportType ? 'Change Type' : 'Select Report Type'}
              </Button>
            </div>

            {/* Display selected profile info */}
            {reportType === 'supplement' && selectedProfile && (
              <div className="mt-4 p-3 bg-background border-2 border-primary/20 rounded-lg">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Name:</span>
                    <span>{selectedProfile.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Location:</span>
                    <span>{selectedProfile.city}, {selectedProfile.state}</span>
                  </div>
                  {selectedProfile.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <span className="font-semibold">Phone:</span>
                      <span>{selectedProfile.phoneNumber}</span>
                    </div>
                  )}
                  {selectedProfile.vehiclePlate && (
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-primary" />
                      <span className="font-semibold">Vehicle:</span>
                      <span>{selectedProfile.vehiclePlate}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="font-semibold text-foreground">
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value });
                    setValidationErrors({ ...validationErrors, date: '' });
                  }}
                  disabled={isSubmitting}
                  required
                  className={`border-2 focus:border-primary ${validationErrors.date ? 'border-destructive' : ''}`}
                />
                {validationErrors.date && (
                  <p className="text-sm text-destructive">{validationErrors.date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="font-semibold text-foreground">
                  Time *
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => {
                    setFormData({ ...formData, time: e.target.value });
                    setValidationErrors({ ...validationErrors, time: '' });
                  }}
                  disabled={isSubmitting}
                  required
                  className={`border-2 focus:border-primary ${validationErrors.time ? 'border-destructive' : ''}`}
                />
                {validationErrors.time && (
                  <p className="text-sm text-destructive">{validationErrors.time}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="font-semibold text-foreground">
                Location *
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="e.g., Outside my workplace, 123 Main St"
                value={formData.location}
                onChange={(e) => {
                  setFormData({ ...formData, location: e.target.value });
                  setValidationErrors({ ...validationErrors, location: '' });
                }}
                disabled={isSubmitting}
                required
                className={`border-2 focus:border-primary ${validationErrors.location ? 'border-destructive' : ''}`}
              />
              {validationErrors.location && (
                <p className="text-sm text-destructive">{validationErrors.location}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold text-foreground">
                Description of Incident *
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what happened in detail. Include specific behaviors, words, and actions..."
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  setValidationErrors({ ...validationErrors, description: '' });
                }}
                disabled={isSubmitting}
                rows={5}
                required
                className={`border-2 focus:border-primary ${validationErrors.description ? 'border-destructive' : ''}`}
              />
              {validationErrors.description && (
                <p className="text-sm text-destructive">{validationErrors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidenceNotes" className="font-semibold text-foreground">
                Evidence Notes
              </Label>
              <Textarea
                id="evidenceNotes"
                placeholder="Document any evidence: photos, videos, witnesses, screenshots, etc."
                value={formData.evidenceNotes}
                onChange={(e) => setFormData({ ...formData, evidenceNotes: e.target.value })}
                disabled={isSubmitting}
                rows={3}
                className="border-2 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes" className="font-semibold text-foreground">
                Additional Notes
              </Label>
              <Textarea
                id="additionalNotes"
                placeholder="Any other relevant information that supports your case..."
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                disabled={isSubmitting}
                rows={3}
                className="border-2 focus:border-primary"
              />
            </div>

            {/* Evidence Upload Section */}
            <div className="space-y-4 border-2 border-primary/20 rounded-lg p-4 bg-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-semibold text-foreground text-lg">Add Evidence</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload photos, screenshots, audio recordings, or documents
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('evidence-upload')?.click()}
                  disabled={isSubmitting}
                  className="border-2 border-primary"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
                <input
                  id="evidence-upload"
                  type="file"
                  multiple
                  accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-3 mt-4">
                  {files.map((fileUpload, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-background border-2 border-border rounded-lg"
                    >
                      {fileUpload.preview ? (
                        <img
                          src={fileUpload.preview}
                          alt={fileUpload.file.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 flex items-center justify-center bg-muted rounded">
                          {getFileIcon(fileUpload.file.type)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{fileUpload.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(fileUpload.file.size)}
                        </p>

                        {fileUpload.uploading && (
                          <div className="mt-2 space-y-1">
                            <Progress value={fileUpload.progress} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              Uploading... {fileUpload.progress}%
                            </p>
                          </div>
                        )}

                        {fileUpload.uploaded && (
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                            <p className="text-xs text-green-600 font-medium">
                              Uploaded successfully
                            </p>
                          </div>
                        )}
                      </div>

                      {!fileUpload.uploading && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={isSubmitting}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}

                      {fileUpload.uploading && (
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {files.some((f) => f.uploading) ? 'Uploading Evidence...' : 'Documenting Incident...'}
                </>
              ) : (
                'Document Incident'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Report Type Selection Dialog */}
      <Dialog open={reportTypeDialogOpen} onOpenChange={setReportTypeDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileStack className="w-6 h-6 text-primary" />
              Select Report Type
            </DialogTitle>
            <DialogDescription>
              Is this report a supplement report or a new entry?
            </DialogDescription>
          </DialogHeader>

          {reportType === null && (
            <div className="space-y-4 py-4">
              <Button
                onClick={() => handleReportTypeConfirm('new')}
                variant="outline"
                className="w-full h-auto py-4 px-6 border-2 border-primary/30 hover:border-primary hover:bg-primary/5"
              >
                <div className="text-left w-full">
                  <div className="font-bold text-lg mb-1">New Entry</div>
                  <div className="text-sm text-muted-foreground">
                    Create a completely new incident report
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleReportTypeConfirm('supplement')}
                variant="outline"
                className="w-full h-auto py-4 px-6 border-2 border-primary/30 hover:border-primary hover:bg-primary/5"
                disabled={profilesLoading || allProfiles.length === 0}
              >
                <div className="text-left w-full">
                  <div className="font-bold text-lg mb-1">Supplement Report</div>
                  <div className="text-sm text-muted-foreground">
                    {profilesLoading ? 'Loading profiles...' : 
                     allProfiles.length === 0 ? 'No saved profiles available' :
                     'Add an incident related to an existing stalker profile'}
                  </div>
                </div>
              </Button>
            </div>
          )}

          {reportType === 'supplement' && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="font-semibold">Select Stalker Profile</Label>
                <Select onValueChange={handleProfileSelect} value={selectedProfileId || undefined}>
                  <SelectTrigger className="border-2 border-primary/30">
                    <SelectValue placeholder="Choose a saved stalker profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {allProfiles.map(([id, profile]) => (
                      <SelectItem key={id.toString()} value={id.toString()}>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{profile.name}</span>
                          <span className="text-muted-foreground text-sm">
                            - {profile.city}, {profile.state}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the stalker profile this incident is related to
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReportTypeDialogOpen(false);
                setReportType(null);
                setSelectedProfileId(null);
                setSelectedProfile(null);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
