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

  // Initialize abuser name input when data loads (using useEffect to avoid render-time state updates)
  useEffect(() => {
    if (nameFetched && abuserName && !abuserNameInput && !isEditingName) {
      setAbuserNameInput(abuserName);
    }
  }, [abuserName, nameFetched, abuserNameInput, isEditingName]);

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
              className="w-full bg-urgent hover:bg-urgent/90 text-white font-bold mt-2"
            >
              <Phone className="mr-2 h-5 w-5" />
              Get Immediate Help Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Domestic Violence Entry</CardTitle>
          <CardDescription>
            Document incidents in a private journal. Each entry is timestamped and can be analyzed for risk
            assessment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-primary/5 border-primary/20">
            <Shield className="h-5 w-5" />
            <AlertDescription>
              All entries are stored securely and privately. This information is for your safety and documentation
              purposes.
            </AlertDescription>
          </Alert>

          {/* Abuser Name Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <Label htmlFor="abuserName" className="text-base font-semibold">
                Abuser Name
              </Label>
            </div>

            {/* Dropdown to select from saved stalker profiles */}
            <div className="space-y-2">
              <Label htmlFor="profileSelect" className="text-sm text-muted-foreground">
                Select from saved profiles (optional)
              </Label>
              <Select
                onValueChange={handleProfileSelect}
                disabled={profilesLoading || setAbuserNameMutation.isPending || nameLoading}
              >
                <SelectTrigger id="profileSelect" className="w-full">
                  <SelectValue
                    placeholder={
                      profilesLoading
                        ? 'Loading profiles...'
                        : stalkerProfiles.length === 0
                        ? 'No saved profiles'
                        : 'Choose a saved profile'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {stalkerProfiles.length === 0 ? (
                    <SelectItem value="__no_profiles__" disabled>
                      No saved profiles
                    </SelectItem>
                  ) : (
                    stalkerProfiles.map(([id, profile]) => (
                      <SelectItem
                        key={id.toString()}
                        value={profile.name}
                        className="flex items-center justify-between group"
                      >
                        <div className="flex items-center justify-between w-full pr-2">
                          <span>{profile.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                            onClick={(e) => handleDeleteClick(id, profile.name, e)}
                            disabled={deleteStalkerProfileMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Manual input field */}
            <div className="flex gap-2">
              <Input
                id="abuserName"
                value={abuserNameInput}
                onChange={(e) => {
                  setAbuserNameInput(e.target.value);
                  setIsEditingName(true);
                }}
                placeholder="Enter abuser's name"
                disabled={setAbuserNameMutation.isPending || nameLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSaveAbuserName}
                disabled={
                  setAbuserNameMutation.isPending ||
                  nameLoading ||
                  !abuserNameInput.trim() ||
                  (abuserNameInput.trim() === abuserName && !isEditingName)
                }
                className="min-w-[100px]"
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

          <Separator />

          {/* Add Journal Entry Section */}
          <div className="space-y-3">
            <Label htmlFor="journalEntry" className="text-base font-semibold">
              Add Journal Entry
            </Label>
            <Textarea
              id="journalEntry"
              value={journalEntryInput}
              onChange={(e) => setJournalEntryInput(e.target.value)}
              placeholder="Describe what happened... Each entry will be dated and timestamped automatically."
              disabled={addEntryMutation.isPending || !abuserName}
              rows={4}
              className="resize-none"
            />
            {!abuserName && (
              <p className="text-sm text-muted-foreground">Please save the abuser name before adding entries</p>
            )}
            <Button
              onClick={handleAddEntry}
              disabled={addEntryMutation.isPending || !journalEntryInput.trim() || !abuserName}
              className="w-full sm:w-auto"
            >
              {addEntryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Entry...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Add Entry
                </>
              )}
            </Button>
          </div>

          <Separator />

          {/* Risk Analysis Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">Risk Analysis</Label>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={analyzeJournalMutation.isPending || entries.length === 0}
                variant="outline"
                size="sm"
              >
                {analyzeJournalMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Analyze Report
                  </>
                )}
              </Button>
            </div>

            {entries.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-5 w-5" />
                <AlertDescription>
                  No entries available for analysis. Add journal entries to generate a risk assessment.
                </AlertDescription>
              </Alert>
            ) : analysis ? (
              <Card className="bg-muted/30">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Risk Factor:</span>
                    <Badge className={getRiskFactorColor(analysis.riskFactor)} variant="outline">
                      {getRiskFactorLabel(analysis.riskFactor)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Summary:</p>
                    <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                  </div>
                  {analysis.suggestedActions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Suggested Actions:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.suggestedActions.map((action, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Journal Entries List */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-bold">Journal Entries ({entries.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {entriesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : entries.length === 0 ? (
            <Alert>
              <FileText className="h-5 w-5" />
              <AlertDescription>No journal entries yet. Add your first entry above.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, idx) => {
                const isHighRisk = containsHighRiskKeyword(entry.entry);
                return (
                  <Card key={idx} className={isHighRisk ? 'bg-urgent/5 border-urgent/30' : 'bg-muted/30'}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{formatTimestampSafe(entry.timestampMs)}</span>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            Entry #{entries.length - idx}
                          </Badge>
                          {isHighRisk && (
                            <Badge className="bg-urgent/10 text-urgent border-urgent/30 text-xs" variant="outline">
                              High Risk
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{entry.entry}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
