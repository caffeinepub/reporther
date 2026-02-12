import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetAbuserName,
  useSetAbuserName,
  useGetJournalEntries,
  useAddJournalEntry,
  useAnalyzeJournal,
  useGetLastJournalAnalysis,
} from '../hooks/useDVJournalQueries';
import { useGetAllStalkerProfiles, useDeleteStalkerProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Shield,
  Save,
  FileText,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Calendar,
  Clock,
  Phone,
  Trash2,
} from 'lucide-react';
import type { RiskFactor } from '../backend';
import { containsHighRiskKeyword } from '../utils/highRiskKeywords';
import { formatTimestampSafe } from '../utils/normalizeTimestampMs';
import ProfileDeleteConfirmDialog from './ProfileDeleteConfirmDialog';

interface DVJournalSectionProps {
  onNavigateToImmediateHelp?: () => void;
}

export default function DVJournalSection({ onNavigateToImmediateHelp }: DVJournalSectionProps) {
  const { identity } = useInternetIdentity();
  const [abuserNameInput, setAbuserNameInput] = useState('');
  const [journalEntryInput, setJournalEntryInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<{ id: bigint; name: string } | null>(null);

  const { data: abuserName = '', isLoading: nameLoading, isFetched: nameFetched } = useGetAbuserName();
  const { data: entries = [], isLoading: entriesLoading } = useGetJournalEntries();
  const { data: analysis } = useGetLastJournalAnalysis();
  const { data: stalkerProfiles = [], isLoading: profilesLoading } = useGetAllStalkerProfiles();

  const setAbuserNameMutation = useSetAbuserName();
  const addEntryMutation = useAddJournalEntry();
  const analyzeJournalMutation = useAnalyzeJournal();
  const deleteStalkerProfileMutation = useDeleteStalkerProfile();

  const isAuthenticated = !!identity;

  // Check if most recent entry contains high-risk keywords
  const mostRecentEntryIsHighRisk = entries.length > 0 && containsHighRiskKeyword(entries[0].entry);

  // Check if analysis shows extreme risk
  const analysisIsExtreme = analysis?.riskFactor === 'extreme';

  // Show escalation CTA if either condition is true
  const showEscalationCTA = mostRecentEntryIsHighRisk || analysisIsExtreme;

  // Sync input with fetched abuser name when not actively editing
  useEffect(() => {
    if (nameFetched && abuserName && !isEditingName) {
      setAbuserNameInput(abuserName);
    }
  }, [abuserName, nameFetched, isEditingName]);

  const handleSaveAbuserName = async () => {
    if (!identity) {
      toast.error('Please sign in first', {
        description: 'You must be authenticated to save the abuser name',
      });
      return;
    }

    if (!abuserNameInput.trim()) {
      toast.error('Please enter a name');
      return;
    }

    try {
      await setAbuserNameMutation.mutateAsync(abuserNameInput.trim());
      toast.success('Abuser name saved');
      setIsEditingName(false);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to save name. Please try again.';
      toast.error('Failed to save name', {
        description: errorMessage,
      });
      // Don't clear editing state on error so user can retry
    }
  };

  const handleAddEntry = async () => {
    if (!identity) {
      toast.error('Please sign in first', {
        description: 'You must be authenticated to add journal entries',
      });
      return;
    }

    if (!journalEntryInput.trim()) {
      toast.error('Please enter a journal entry');
      return;
    }

    if (!abuserName) {
      toast.error('Please save the abuser name first');
      return;
    }

    try {
      await addEntryMutation.mutateAsync(journalEntryInput.trim());
      toast.success('Journal entry added');
      setJournalEntryInput('');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to add entry. Please try again.';
      toast.error('Failed to add entry', {
        description: errorMessage,
      });
    }
  };

  const handleAnalyze = async () => {
    if (!identity) {
      toast.error('Please sign in first', {
        description: 'You must be authenticated to analyze your journal',
      });
      return;
    }

    if (entries.length === 0) {
      toast.error('No entries to analyze', {
        description: 'Please add at least one journal entry before analyzing',
      });
      return;
    }

    try {
      const result = await analyzeJournalMutation.mutateAsync();
      if (result) {
        toast.success('Analysis complete', {
          description: `Risk level: ${getRiskFactorLabel(result.riskFactor)}`,
        });
      } else {
        toast.info('No analysis available', {
          description: 'Please add more entries and try again',
        });
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to analyze journal. Please try again.';
      toast.error('Failed to analyze journal', {
        description: errorMessage,
      });
    }
  };

  const handleProfileSelect = (profileName: string) => {
    setAbuserNameInput(profileName);
    setIsEditingName(true);
  };

  const handleDeleteClick = (id: bigint, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setProfileToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!profileToDelete) return;

    try {
      const success = await deleteStalkerProfileMutation.mutateAsync(profileToDelete.id);
      if (success) {
        toast.success('Profile deleted', {
          description: `${profileToDelete.name} has been removed from your saved profiles`,
        });

        // Clear the input if the deleted profile matches the current input
        if (abuserNameInput === profileToDelete.name) {
          setAbuserNameInput('');
          setIsEditingName(true);
        }

        setDeleteDialogOpen(false);
        setProfileToDelete(null);
      } else {
        toast.error('Failed to delete profile', {
          description: 'The profile could not be found or deleted',
        });
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to delete profile. Please try again.';
      toast.error('Failed to delete profile', {
        description: errorMessage,
      });
    }
  };

  const getRiskFactorLabel = (risk: RiskFactor): string => {
    switch (risk) {
      case 'low':
        return 'Low';
      case 'moderate':
        return 'Moderate';
      case 'high':
        return 'High';
      case 'extreme':
        return 'Extreme';
      default:
        return 'Unknown';
    }
  };

  const getRiskFactorColor = (risk: RiskFactor): string => {
    switch (risk) {
      case 'low':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'moderate':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
      case 'extreme':
        return 'bg-urgent/10 text-urgent border-urgent/30';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Domestic Violence Entry</CardTitle>
          <CardDescription>Please sign in to access this feature</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Shield className="h-5 w-5" />
            <AlertDescription>
              You must be authenticated to use the Domestic Violence journal feature.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      <ProfileDeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        profileName={profileToDelete?.name || ''}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteStalkerProfileMutation.isPending}
      />

      {/* Escalation CTA - shown when extreme risk or high-risk keywords detected */}
      {showEscalationCTA && onNavigateToImmediateHelp && (
        <Alert className="border-2 border-urgent bg-urgent/5">
          <AlertTriangle className="h-6 w-6 text-urgent" />
          <AlertTitle className="text-lg font-bold text-urgent">Immediate Help Available</AlertTitle>
          <AlertDescription className="space-y-3 mt-2">
            <p className="text-base">
              {analysisIsExtreme
                ? 'Your journal analysis indicates an extreme risk situation.'
                : 'Your recent entry contains high-risk keywords indicating a serious situation.'}
            </p>
            <p className="text-sm">
              If you are in danger or need immediate support, please access emergency resources and safety planning
              tools.
            </p>
            <Button
              onClick={onNavigateToImmediateHelp}
              size="lg"
              className="w-full bg-urgent hover:bg-urgent/90 text-white font-bold"
            >
              <Phone className="mr-2 h-5 w-5" />
              Access Immediate Help & Safety Plan
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Abuser Name Section */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Abuser Information
          </CardTitle>
          <CardDescription>
            Save the name of the person you're documenting. You can select from saved profiles or enter a new name.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="abuser-name">Abuser Name</Label>
            <div className="flex gap-2">
              <Input
                id="abuser-name"
                value={abuserNameInput}
                onChange={(e) => {
                  setAbuserNameInput(e.target.value);
                  setIsEditingName(true);
                }}
                placeholder="Enter name"
                disabled={setAbuserNameMutation.isPending || nameLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSaveAbuserName}
                disabled={
                  setAbuserNameMutation.isPending ||
                  !abuserNameInput.trim() ||
                  (abuserNameInput.trim() === abuserName && !isEditingName)
                }
                className="shrink-0"
              >
                {setAbuserNameMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Dropdown to select from saved stalker profiles */}
          {stalkerProfiles.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="profile-select">Or select from saved profiles</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  const profile = stalkerProfiles.find(([id]) => id.toString() === value);
                  if (profile) {
                    handleProfileSelect(profile[1].name);
                  }
                }}
                disabled={profilesLoading || setAbuserNameMutation.isPending}
              >
                <SelectTrigger id="profile-select">
                  <SelectValue placeholder="Select a saved profile" />
                </SelectTrigger>
                <SelectContent>
                  {stalkerProfiles.map(([id, profile]) => (
                    <SelectItem key={id.toString()} value={id.toString()} className="flex items-center justify-between">
                      <div className="flex items-center justify-between w-full">
                        <span>{profile.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteClick(id, profile.name, e)}
                          className="ml-2 h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {abuserName && !isEditingName && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Currently documenting: <strong>{abuserName}</strong>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Journal Entry Section */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Add Journal Entry
          </CardTitle>
          <CardDescription>
            Document incidents, behaviors, and patterns. All entries are timestamped and securely stored.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="journal-entry">Entry</Label>
            <Textarea
              id="journal-entry"
              value={journalEntryInput}
              onChange={(e) => setJournalEntryInput(e.target.value)}
              placeholder="Describe what happened, when, and any relevant details..."
              rows={6}
              disabled={addEntryMutation.isPending || !abuserName}
              className="resize-none"
            />
            {!abuserName && (
              <p className="text-sm text-muted-foreground">Please save the abuser name first before adding entries.</p>
            )}
          </div>

          <Button
            onClick={handleAddEntry}
            disabled={addEntryMutation.isPending || !journalEntryInput.trim() || !abuserName}
            className="w-full"
          >
            {addEntryMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Entry...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Add Entry
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Journal Entries List */}
      {entries.length > 0 && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Journal Entries ({entries.length})
                </CardTitle>
                <CardDescription>Your documented history</CardDescription>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={analyzeJournalMutation.isPending || entries.length === 0}
                variant="outline"
              >
                {analyzeJournalMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Analyze Risk
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {entries.map((entry, index) => {
              const isHighRisk = containsHighRiskKeyword(entry.entry);
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{formatTimestampSafe(entry.timestampMs)}</span>
                    </div>
                    {isHighRisk && (
                      <Badge variant="destructive" className="shrink-0">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        High Risk
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">{entry.entry}</p>
                  {index < entries.length - 1 && <Separator className="mt-4" />}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Risk Analysis Section */}
      {analysis && (
        <Card className={`border-2 ${getRiskFactorColor(analysis.riskFactor)}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Risk Analysis
              </CardTitle>
              <Badge className={getRiskFactorColor(analysis.riskFactor)}>
                {getRiskFactorLabel(analysis.riskFactor)} Risk
              </Badge>
            </div>
            <CardDescription>{analysis.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Suggested Actions:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {analysis.suggestedActions.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">
              Analyzed by {analysis.analyzedBy} on {formatTimestampSafe(analysis.analyzedTimestamp)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {entries.length === 0 && !entriesLoading && abuserName && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertTitle>No entries yet</AlertTitle>
          <AlertDescription>
            Start documenting incidents to build your evidence record. All entries are timestamped and securely stored.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
