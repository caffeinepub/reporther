import { useState } from 'react';
import { useSubmitIncident, useSaveEvidenceFile, useGetAllStalkerProfiles } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Shield, Upload, X, FileImage, FileAudio, FileText, Loader2, CheckCircle2, FileStack, User, MapPin, Phone, Car, LogOut } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import type { StalkerProfile } from '../backend';
import { triggerQuickExit } from '../utils/quickExit';

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

  const uploadFile = async (fileUpload: FileUpload, index: number, incidentId: string): Promise<bigint | null> => {
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

      // Generate storage ID
      const storageId = `evidence_${Date.now()}_${fileUpload.file.name}`;

      // Call backend to upload evidence
      const evidenceMeta = await saveEvidenceFile.mutateAsync({
        incidentId,
        storageId,
        filename: fileUpload.file.name,
        fileType: fileUpload.file.type,
        fileSize: BigInt(fileUpload.file.size),
      });

      clearInterval(progressInterval);

      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? { ...f, uploading: false, uploaded: true, progress: 100, evidenceId: evidenceMeta.id, storageId }
            : f
        )
      );

      return evidenceMeta.id;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, uploading: false, progress: 0 } : f))
      );
      toast.error(`Failed to upload ${fileUpload.file.name}`, {
        description: error?.message || 'Please try again. If the issue persists, you can upload evidence later.',
      });
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

      // Upload files to the newly created incident
      if (files.length > 0) {
        toast.info('Uploading evidence files...');

        for (let i = 0; i < files.length; i++) {
          const fileUpload = files[i];
          if (!fileUpload.uploaded) {
            await uploadFile(fileUpload, i, incident.id);
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

  const handleQuickExit = () => {
    triggerQuickExit();
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
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-foreground">Document Harassment Incident</CardTitle>
              <CardDescription className="text-base font-medium">
                Record every detail of the incident. Your documentation is your strength and supports accountability. All fields marked with * are required.
              </CardDescription>
            </div>
            <Button
              type="button"
              onClick={handleQuickExit}
              variant="destructive"
              size="sm"
              className="rounded-full font-bold flex items-center gap-2 flex-shrink-0"
              title="Quick Exit - Leave immediately"
            >
              <LogOut className="w-4 h-4" />
              Quick Exit
            </Button>
          </div>
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
            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-base font-semibold">
                  Date of Incident *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value });
                    setValidationErrors({ ...validationErrors, date: '' });
                  }}
                  className={validationErrors.date ? 'border-destructive' : ''}
                />
                {validationErrors.date && (
                  <p className="text-sm text-destructive">{validationErrors.date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-base font-semibold">
                  Time of Incident *
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => {
                    setFormData({ ...formData, time: e.target.value });
                    setValidationErrors({ ...validationErrors, time: '' });
                  }}
                  className={validationErrors.time ? 'border-destructive' : ''}
                />
                {validationErrors.time && (
                  <p className="text-sm text-destructive">{validationErrors.time}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-base font-semibold">
                Location *
              </Label>
              <Input
                id="location"
                placeholder="Where did this incident occur?"
                value={formData.location}
                onChange={(e) => {
                  setFormData({ ...formData, location: e.target.value });
                  setValidationErrors({ ...validationErrors, location: '' });
                }}
                className={validationErrors.location ? 'border-destructive' : ''}
              />
              {validationErrors.location && (
                <p className="text-sm text-destructive">{validationErrors.location}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">
                Incident Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what happened in detail..."
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  setValidationErrors({ ...validationErrors, description: '' });
                }}
                rows={5}
                className={validationErrors.description ? 'border-destructive' : ''}
              />
              {validationErrors.description && (
                <p className="text-sm text-destructive">{validationErrors.description}</p>
              )}
            </div>

            {/* Evidence Notes */}
            <div className="space-y-2">
              <Label htmlFor="evidenceNotes" className="text-base font-semibold">
                Evidence Notes
              </Label>
              <Textarea
                id="evidenceNotes"
                placeholder="Describe any evidence you have (photos, videos, messages, etc.)"
                value={formData.evidenceNotes}
                onChange={(e) => setFormData({ ...formData, evidenceNotes: e.target.value })}
                rows={3}
              />
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="additionalNotes" className="text-base font-semibold">
                Additional Notes
              </Label>
              <Textarea
                id="additionalNotes"
                placeholder="Any other relevant information..."
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                rows={3}
              />
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Evidence Files</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Files
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-3">
                  {files.map((fileUpload, index) => (
                    <div
                      key={index}
                      className="p-4 border-2 border-primary/20 rounded-lg bg-card space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="text-primary flex-shrink-0 mt-1">
                            {getFileIcon(fileUpload.file.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {fileUpload.file.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(fileUpload.file.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {fileUpload.uploaded && (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )}
                          {fileUpload.uploading && (
                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                          )}
                          {!fileUpload.uploading && !fileUpload.uploaded && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(index)}
                              className="h-8 w-8"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {fileUpload.uploading && (
                        <Progress value={fileUpload.progress} className="h-2" />
                      )}

                      {fileUpload.preview && (
                        <img
                          src={fileUpload.preview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-12 text-base font-bold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Document Incident
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Report Type Selection Dialog */}
      <Dialog open={reportTypeDialogOpen} onOpenChange={setReportTypeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Report Type</DialogTitle>
            <DialogDescription>
              Choose whether this is a new incident or a supplement to an existing stalker profile
            </DialogDescription>
          </DialogHeader>

          {reportType === null ? (
            <div className="space-y-3 py-4">
              <Button
                onClick={() => handleReportTypeConfirm('new')}
                variant="outline"
                className="w-full h-auto py-4 flex flex-col items-start gap-2"
              >
                <span className="font-bold text-base">New Incident Report</span>
                <span className="text-sm text-muted-foreground text-left">
                  Document a new incident without linking to a stalker profile
                </span>
              </Button>

              <Button
                onClick={() => handleReportTypeConfirm('supplement')}
                variant="outline"
                className="w-full h-auto py-4 flex flex-col items-start gap-2"
                disabled={profilesLoading || allProfiles.length === 0}
              >
                <span className="font-bold text-base">Supplement Existing Profile</span>
                <span className="text-sm text-muted-foreground text-left">
                  Add this incident to an existing stalker profile
                </span>
              </Button>

              {allProfiles.length === 0 && !profilesLoading && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  No stalker profiles found. Create one in the "Stalker Info" tab first.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3 py-4">
              <Label className="text-base font-semibold">Select Stalker Profile</Label>
              <Select value={selectedProfileId || ''} onValueChange={handleProfileSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a profile..." />
                </SelectTrigger>
                <SelectContent>
                  {allProfiles.map(([id, profile]) => (
                    <SelectItem key={id.toString()} value={id.toString()}>
                      {profile.name} - {profile.city}, {profile.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
