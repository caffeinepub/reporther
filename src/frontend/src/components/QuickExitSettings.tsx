import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ExternalLink, Info, Keyboard } from 'lucide-react';
import { toast } from 'sonner';
import { getQuickExitUrl, saveQuickExitUrl, getDefaultWeatherUrl, isValidQuickExitUrl } from '../utils/quickExit';

export default function QuickExitSettings() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load current URL on mount
    const currentUrl = getQuickExitUrl();
    setUrl(currentUrl);
  }, []);

  const handleSave = () => {
    setError('');
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidQuickExitUrl(url)) {
      setError('Invalid URL. Please enter a valid http:// or https:// URL.');
      return;
    }

    setIsSaving(true);
    try {
      saveQuickExitUrl(url);
      toast.success('Quick Exit URL saved', {
        description: 'Your custom destination has been saved successfully.',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save URL');
      toast.error('Failed to save URL', {
        description: err.message || 'Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const defaultUrl = getDefaultWeatherUrl();
    setUrl(defaultUrl);
    setError('');
    try {
      saveQuickExitUrl(defaultUrl);
      toast.success('Reset to default', {
        description: 'Quick Exit will now redirect to the default weather website.',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to reset URL');
    }
  };

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ExternalLink className="w-6 h-6 text-primary" />
          Quick Exit Settings
        </CardTitle>
        <CardDescription className="text-base font-medium">
          Configure where the Quick Exit button takes you in case of emergency
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <Alert className="border-2 border-primary/30 bg-primary/5">
          <Info className="h-5 w-5 text-primary" />
          <AlertDescription className="font-medium text-foreground">
            The Quick Exit button allows you to immediately leave this app and navigate to a safe website.
            By default, it redirects to a weather website. You can customize the destination below.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick-exit-url" className="text-base font-semibold">
              Destination URL
            </Label>
            <Input
              id="quick-exit-url"
              type="url"
              placeholder="https://weather.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              className="text-base"
            />
            <p className="text-sm text-muted-foreground">
              Enter a full URL starting with http:// or https://
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="border-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? 'Saving...' : 'Save URL'}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              disabled={isSaving}
            >
              Reset to Default
            </Button>
          </div>
        </div>

        <Alert className="border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5">
          <Keyboard className="h-5 w-5 text-primary" />
          <AlertDescription className="font-medium text-foreground">
            <div className="space-y-2">
              <p className="font-bold">Desktop Keyboard Shortcut:</p>
              <p>Press <kbd className="px-2 py-1 bg-background border border-primary/30 rounded text-sm font-mono">Ctrl+Shift+Q</kbd> (Windows/Linux) or <kbd className="px-2 py-1 bg-background border border-primary/30 rounded text-sm font-mono">Cmd+Shift+Q</kbd> (Mac) to trigger Quick Exit instantly.</p>
              <p className="text-sm text-muted-foreground mt-2">
                The shortcut works anywhere in the app and does not require confirmation.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="p-4 border-2 border-primary/20 rounded-lg bg-background space-y-2">
          <h4 className="font-semibold text-foreground">How Quick Exit Works:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Immediately redirects your browser to the configured website</li>
            <li>Uses replace-style navigation to minimize browser history traces</li>
            <li>Available via the header button, incident form button, or keyboard shortcut</li>
            <li>No confirmation required - activates instantly for your safety</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
