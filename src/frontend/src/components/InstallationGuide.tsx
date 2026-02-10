import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Monitor, Share2, Copy, Check, MessageSquare, Heart, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { getShareUrl, copyToClipboard, shareLink } from '../utils/shareLink';
import QuickExitSettings from './QuickExitSettings';

export default function InstallationGuide() {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const handleCopy = async (text: string, id: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedStates({ ...copiedStates, [id]: true });
      toast.success('Copied to clipboard!');
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [id]: false });
      }, 2000);
    } else {
      toast.error('Failed to copy');
    }
  };

  const handleShare = async (text: string) => {
    const success = await shareLink(shareUrl, 'Reporther - Safety & Documentation', text);
    if (!success) {
      // Fallback to copy
      await handleCopy(text, 'share-fallback');
    }
  };

  const shareUrl = getShareUrl();

  // Share message templates
  const calmMessage = `I wanted to share this app with you - Reporther helps document and report harassment incidents safely and privately. It's been really helpful for keeping records organized. ${shareUrl}`;

  const lawEnforcementMessage = `Reporther is a professional documentation tool for harassment and stalking incidents. It provides timestamped evidence records, automatic police reporting, and secure storage. Recommended for anyone needing to build a legal case. ${shareUrl}`;

  const feminineTouchMessage = `Hey! 💕 I found this amazing app called Reporther that helps us stay safe and document any harassment we face. It's super private and secure, and it even helps with police reports if needed. Thought you might want to check it out! ${shareUrl}`;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardTitle className="text-2xl font-bold text-foreground">Install Reporther as an App</CardTitle>
          <CardDescription className="text-base font-medium">
            Install Reporther on your device for quick, private access without browser tabs
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* iPhone/iPad Instructions */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold text-foreground">iPhone & iPad (Safari)</h3>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-foreground ml-2">
              <li className="text-base">Open this page in <strong>Safari</strong> browser</li>
              <li className="text-base">Tap the <strong>Share</strong> button (square with arrow pointing up)</li>
              <li className="text-base">Scroll down and tap <strong>"Add to Home Screen"</strong></li>
              <li className="text-base">Tap <strong>"Add"</strong> in the top right corner</li>
              <li className="text-base">The Reporther app icon will appear on your home screen</li>
            </ol>
          </div>

          {/* Android Instructions */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold text-foreground">Android (Chrome)</h3>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-foreground ml-2">
              <li className="text-base">Open this page in <strong>Chrome</strong> browser</li>
              <li className="text-base">Tap the <strong>three dots menu</strong> (⋮) in the top right</li>
              <li className="text-base">Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></li>
              <li className="text-base">Tap <strong>"Add"</strong> or <strong>"Install"</strong></li>
              <li className="text-base">The Reporther app icon will appear on your home screen</li>
            </ol>
          </div>

          {/* Desktop Instructions */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Monitor className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold text-foreground">Desktop (Chrome, Edge, Brave)</h3>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-foreground ml-2">
              <li className="text-base">Look for the <strong>install icon</strong> (⊕ or computer icon) in the address bar</li>
              <li className="text-base">Click the icon and select <strong>"Install"</strong></li>
              <li className="text-base">Or click the <strong>three dots menu</strong> (⋮) → <strong>"Install Reporther"</strong></li>
              <li className="text-base">The app will open in its own window</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Share Link Section */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Share2 className="w-6 h-6 text-primary" />
            Share Reporther
          </CardTitle>
          <CardDescription className="text-base font-medium">
            Help others stay safe by sharing this app with friends and family
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Share URL */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground">App Link</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-2 border-2 border-primary/20 rounded-lg bg-background text-foreground font-mono text-sm"
              />
              <Button
                onClick={() => handleCopy(shareUrl, 'url')}
                variant="outline"
                className="flex items-center gap-2"
              >
                {copiedStates['url'] ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Share Message Templates */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Share Message Templates</h3>
            
            {/* Calm Template */}
            <div className="p-4 border-2 border-primary/20 rounded-lg bg-card space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-foreground">Calm & Informative</h4>
              </div>
              <p className="text-sm text-muted-foreground">{calmMessage}</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleCopy(calmMessage, 'calm')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {copiedStates['calm'] ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleShare(calmMessage)}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Law Enforcement Template */}
            <div className="p-4 border-2 border-primary/20 rounded-lg bg-card space-y-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-foreground">Professional & Legal</h4>
              </div>
              <p className="text-sm text-muted-foreground">{lawEnforcementMessage}</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleCopy(lawEnforcementMessage, 'law')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {copiedStates['law'] ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleShare(lawEnforcementMessage)}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Feminine Touch Template */}
            <div className="p-4 border-2 border-primary/20 rounded-lg bg-card space-y-3">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-foreground">Friendly & Supportive</h4>
              </div>
              <p className="text-sm text-muted-foreground">{feminineTouchMessage}</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleCopy(feminineTouchMessage, 'feminine')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {copiedStates['feminine'] ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleShare(feminineTouchMessage)}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Exit Settings */}
      <QuickExitSettings />
    </div>
  );
}
