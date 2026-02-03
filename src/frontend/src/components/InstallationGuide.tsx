import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, Smartphone, CheckCircle2, Heart, Download, Users, Copy, Check, Image as ImageIcon } from 'lucide-react';
import { SiApple, SiAndroid } from 'react-icons/si';
import { toast } from 'sonner';

const OFFICIAL_APP_URL = 'https://reporther-2cs.caffeine.xyz';

// Define share message types locally since they're not in the backend
enum ShareMessageType {
  appRecommendation = 'appRecommendation',
  firmAccountability = 'firmAccountability',
  personalFeminineTouch = 'personalFeminineTouch',
}

type ShareOption = {
  id: ShareMessageType;
  title: string;
  description: string;
  buttonLabel: string;
  imageUrl: string;
  imageAlt: string;
  message: string;
};

const shareOptions: ShareOption[] = [
  {
    id: ShareMessageType.appRecommendation,
    title: 'Option 1: Empowering',
    description: 'Supportive and encouraging message focusing on women\'s empowerment and safety features.',
    buttonLabel: 'Use Empowering Message',
    imageUrl: '/assets/generated/social-empowering-final.dim_800x600.png',
    imageAlt: 'ReportHer — Your Safety, Your Power. Social media template with empowering design featuring magenta and noir colors with app link https://reporther-2cs.caffeine.xyz',
    message: `Download "ReportHer" - Empowerment & Safety at your fingertips. 

**ReportHer** - Your safety, your evidence, your power. 
- Report harassers
- Document incidents
- Safely store proof
- Automatic police reporting

Accountability, protection, and support all in one app. 

Install for FREE at
${OFFICIAL_APP_URL} and take control of your safety.`,
  },
  {
    id: ShareMessageType.firmAccountability,
    title: 'Option 2: Professional',
    description: 'Professional and informative tone emphasizing accountability and legal documentation.',
    buttonLabel: 'Use Professional Message',
    imageUrl: '/assets/generated/social-professional-final.dim_800x600.png',
    imageAlt: 'ReportHer — Comprehensive Harassment Reporting Tool. Professional social media template with navy and crimson tones featuring app link https://reporther-2cs.caffeine.xyz',
    message: `"ReportHer" is a women's safety app for reporting and documenting harassment. This is a professional notification of your behavior for accountability purposes. 

Legal documentation has been created and may be submitted to law enforcement. If you have questions about police reporting, you can find more information at ${OFFICIAL_APP_URL}`,
  },
  {
    id: ShareMessageType.personalFeminineTouch,
    title: 'Option 3: The Personal Feminine Touch',
    description: 'Harsh, direct, and biting tone toward predatory behavior with zero-tolerance language.',
    buttonLabel: 'Use Personal Feminine Touch',
    imageUrl: '/assets/generated/social-feminine-touch-final.dim_800x600.png',
    imageAlt: 'Zero Tolerance for Men\'s Predatory Behavior. File charges now! Bold social media template with strong typography and app link https://reporther-2cs.caffeine.xyz',
    message: `"Personal Feminine Touch (PFT) Share Message "
---------------------------
Subject: New Female Safety & Self-Protection App
---------------------------

This platform helps to break the silence, give accountability, and empower female friends and family, while holding predatory behavior accountable.

Full Legal Coverage & Evidence Storage: Reduces the risk of public discussions about harassment, stalking, and predatory behavior. Keeps no record on your device, while it's uploaded directly to ReportHer and a backup legal server with proof of submission.

Exposure & Documentation: This platform holds accountable men who harass, stalk, exploit, or abuse legal gaps, without storing your private data on your phone. Accountability has started.

Female Accountability: To all women who have hidden, deleted, or dropped complaints or have tolerated scary or intimidating behavior due to fear, lack of proof, or worry about 'legal loopholes,' this is the answer.
No more ignoring or deleting proof out of fear.

Male Accountability: To all men, predators, manipulators, offenders, and 'innocent bystanders,' this is your sign.
With all evidence, content, photos, phone records, and vehicle details finally being documented, it is the end for manipulation, threats, and exploitation.

Professional Profile: Every account is validated, checked, and protected.

No More Manipulation: This app changes everything. For your own protection: install it and send this message to trusted friends and family.

Install for FREE at ${OFFICIAL_APP_URL}.`,
  },
];

export default function InstallationGuide() {
  const [selectedOption, setSelectedOption] = useState<ShareMessageType | null>(null);
  const [shareMessage, setShareMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const loadShareMessage = (messageType: ShareMessageType) => {
    const option = shareOptions.find(opt => opt.id === messageType);
    if (option) {
      setShareMessage(option.message);
      setSelectedOption(messageType);
      setCopied(false);
      toast.success('Share message loaded!');
    }
  };

  const handleCopyMessage = async () => {
    if (!shareMessage) return;

    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      toast.success('Message copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error('Could not copy message');
    }
  };

  const handleShareMessage = async () => {
    if (!shareMessage) return;

    const shareData = {
      title: 'ReportHer - Empowering Women\'s Safety',
      text: shareMessage,
      url: OFFICIAL_APP_URL,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Thanks for sharing ReportHer!');
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      await handleCopyMessage();
    }
  };

  const handleDownloadImage = async (imageUrl: string, optionTitle: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporther-${optionTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded! Share it on social media.');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Could not download image');
    }
  };

  const handleShareWithImage = async () => {
    if (!shareMessage || !selectedOption) return;

    const selectedOptionData = shareOptions.find(opt => opt.id === selectedOption);
    if (!selectedOptionData) return;

    // Try to share with Web Share API (if supported)
    if (navigator.share) {
      try {
        // Fetch the image and convert to File
        const response = await fetch(selectedOptionData.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'reporther-share.png', { type: 'image/png' });

        const shareData: ShareData = {
          title: 'ReportHer - Empowering Women\'s Safety',
          text: shareMessage,
          files: [file],
        };

        // Check if files can be shared
        if (navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData);
          toast.success('Thanks for sharing ReportHer!');
        } else {
          // Fallback: download image and copy message
          await handleDownloadImage(selectedOptionData.imageUrl, selectedOptionData.title);
          await handleCopyMessage();
          toast.info('Image downloaded and message copied! Paste them in your social media post.');
        }
      } catch (error) {
        // User cancelled or error occurred
        console.error('Share error:', error);
      }
    } else {
      // Fallback: download image and copy message
      await handleDownloadImage(selectedOptionData.imageUrl, selectedOptionData.title);
      await handleCopyMessage();
      toast.info('Image downloaded and message copied! Paste them in your social media post.');
    }
  };

  const handleQuickShare = async () => {
    const shareData = {
      title: 'ReportHer - Empowering Women\'s Safety',
      text: 'Install ReportHer to document harassment and stalking incidents. Take control of your safety with evidence tracking and police reporting.',
      url: OFFICIAL_APP_URL,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Thanks for sharing ReportHer!');
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy link to clipboard
      try {
        await navigator.clipboard.writeText(OFFICIAL_APP_URL);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        toast.error('Could not copy link');
      }
    }
  };

  const handleAddToHomeScreen = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      toast.info('Tap the Share button at the bottom, then select "Add to Home Screen"');
    } else if (isAndroid) {
      toast.info('Tap the menu (⋮) in the top right, then select "Install app"');
    } else {
      toast.info('Follow the installation instructions below for your device');
    }
  };

  const selectedOptionData = selectedOption ? shareOptions.find(opt => opt.id === selectedOption) : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero Section with Headline */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-empowerment dark:gradient-empowerment-dark flex items-center justify-center shadow-xl">
          <img 
            src="/assets/generated/app-icon-man-behind-bars-transparent.dim_200x200.png" 
            alt="ReportHer icon" 
            className="w-12 h-12"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
          Install & Share ReportHer
        </h1>
        <p className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Empowering Women's Safety and Accountability
        </p>
        <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto mb-8">
          Take your safety with you everywhere. Install ReportHer on your phone for instant access to document harassment, generate firm warnings, and report incidents to authorities. Professional accountability starts here.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={handleAddToHomeScreen}
            size="lg"
            className="rounded-full font-bold text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
          >
            <Download className="w-5 h-5 mr-2" />
            Add to Home Screen
          </Button>
          <Button 
            onClick={handleQuickShare}
            size="lg"
            variant="outline"
            className="rounded-full font-bold text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all border-2 border-primary w-full sm:w-auto"
          >
            <Users className="w-5 h-5 mr-2" />
            Share with a Friend
          </Button>
        </div>
      </div>

      {/* Share Message Selection Section */}
      <Card className="mb-8 border-2 border-primary/20 shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <Share2 className="w-6 h-6" />
            Choose Your Share Message & Social Media Template
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Select a message style that resonates with you. Each option includes a professionally designed social media image template optimized for Facebook and Instagram with bold, legible typography and the official app link <strong>{OFFICIAL_APP_URL}</strong>.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {shareOptions.map((option) => (
            <div
              key={option.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedOption === option.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground mb-1">
                    {option.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <Button
                  onClick={() => loadShareMessage(option.id)}
                  variant={selectedOption === option.id ? 'default' : 'outline'}
                  className="whitespace-nowrap"
                >
                  {selectedOption === option.id ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Selected
                    </>
                  ) : (
                    option.buttonLabel
                  )}
                </Button>
              </div>
            </div>
          ))}

          {/* Message Preview, Social Media Template, and Actions */}
          {shareMessage && selectedOptionData && (
            <div className="mt-6 space-y-6">
              {/* Social Media Template Preview */}
              <div className="p-4 bg-background rounded-lg border-2 border-primary/20">
                <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  Social Media Template — Ready for Facebook & Instagram
                </h4>
                <div className="bg-muted p-4 rounded-md mb-4">
                  <img 
                    src={selectedOptionData.imageUrl}
                    alt={selectedOptionData.imageAlt}
                    className="w-full h-auto rounded-lg shadow-lg border-2 border-primary/20"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => handleDownloadImage(selectedOptionData.imageUrl, selectedOptionData.title)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Image
                  </Button>
                  <Button
                    onClick={handleShareWithImage}
                    className="flex-1"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Image & Message
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Download the image and share it on social media with your message to spread awareness. Each template includes the app link prominently displayed.
                </p>
              </div>

              {/* Message Preview */}
              <div className="p-4 bg-background rounded-lg border-2 border-primary/20">
                <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Message Preview
                </h4>
                <div className="bg-muted p-4 rounded-md mb-4 max-h-64 overflow-y-auto">
                  <p className="text-sm text-foreground whitespace-pre-wrap font-mono">
                    {shareMessage}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleCopyMessage}
                    variant="outline"
                    className="flex-1"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Message
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleShareMessage}
                    className="flex-1"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Message
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Why Install Section */}
      <Card className="mb-8 border-2 border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">
            Why Install the App?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-foreground"><strong>Instant Access:</strong> Open ReportHer directly from your home screen in seconds</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-foreground"><strong>Works Offline:</strong> Access your evidence record even without internet</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-foreground"><strong>Private & Secure:</strong> Your data stays protected on your device</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-foreground"><strong>Always Ready:</strong> Document incidents the moment they happen</p>
          </div>
        </CardContent>
      </Card>

      {/* iPhone Installation */}
      <Card className="mb-8 border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <SiApple className="w-6 h-6 text-primary" />
            <span className="font-bold">iPhone Installation (Safari)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Open Safari Browser</p>
                  <p className="text-sm text-muted-foreground">Navigate to ReportHer in Safari (not Chrome or other browsers)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Tap the Share Button</p>
                  <p className="text-sm text-muted-foreground">Look for the share icon (square with arrow) at the bottom of your screen</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Select "Add to Home Screen"</p>
                  <p className="text-sm text-muted-foreground">Scroll down in the share menu and tap this option</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Confirm Installation</p>
                  <p className="text-sm text-muted-foreground">Tap "Add" in the top right corner. ReportHer will appear on your home screen!</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <img 
                src="/assets/generated/iphone-install-step.dim_400x600.png" 
                alt="iPhone installation steps showing Safari share menu and Add to Home Screen option" 
                className="rounded-lg shadow-xl border-2 border-primary/20 max-w-full h-auto"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Android Installation */}
      <Card className="mb-8 border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <SiAndroid className="w-6 h-6 text-primary" />
            <span className="font-bold">Android Installation (Chrome)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Open Chrome Browser</p>
                  <p className="text-sm text-muted-foreground">Navigate to ReportHer in Chrome browser</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Tap the Menu Button</p>
                  <p className="text-sm text-muted-foreground">Look for the three dots (⋮) in the top right corner</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Select "Install app" or "Add to Home screen"</p>
                  <p className="text-sm text-muted-foreground">The exact wording may vary depending on your Android version</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Confirm Installation</p>
                  <p className="text-sm text-muted-foreground">Tap "Install" or "Add". ReportHer will appear on your home screen!</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <img 
                src="/assets/generated/android-install-step.dim_400x600.png" 
                alt="Android installation steps showing Chrome menu and Install app option" 
                className="rounded-lg shadow-xl border-2 border-primary/20 max-w-full h-auto"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Section with Community Image */}
      <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="pt-6 text-center">
          <div className="mb-6">
            <img 
              src="/assets/generated/women-support-community.dim_600x400.png" 
              alt="Women supporting each other in a community of safety and empowerment" 
              className="rounded-lg shadow-lg mx-auto max-w-full h-auto border-2 border-primary/20"
            />
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-destructive fill-destructive" />
            <h3 className="text-2xl font-bold text-foreground">Strength in Numbers</h3>
            <Heart className="w-6 h-6 text-destructive fill-destructive" />
          </div>
          
          <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
            Everyone deserves safety and respect. Share ReportHer with your friends, family, and community. Together, we support accountability and create safer spaces.
          </p>

          <p className="text-base font-semibold text-foreground mb-6 max-w-2xl mx-auto">
            When we stand together and support each other, we create real change. Share this guide and help build a network where safety is a priority and harassment has consequences.
          </p>

          <Button 
            onClick={handleQuickShare}
            size="lg"
            className="rounded-full font-bold text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share This Guide
          </Button>

          <p className="text-sm text-muted-foreground mt-4 italic">
            "When we support each other and refuse to tolerate harassment, we create a safer world for everyone."
          </p>
        </CardContent>
      </Card>

      {/* Help Section */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p className="mb-2">
          <strong>Need help?</strong> If you're having trouble installing, make sure you're using the correct browser for your device.
        </p>
        <p>
          <Smartphone className="w-4 h-4 inline mr-1" />
          iPhone users must use Safari • Android users should use Chrome
        </p>
      </div>
    </div>
  );
}
