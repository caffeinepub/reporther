import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Phone, ExternalLink, Shield, Info } from 'lucide-react';

export default function ImmediateHelpSafetyPlan() {
  return (
    <div className="space-y-6">
      {/* Critical Warning */}
      <Alert className="border-2 border-urgent bg-urgent/5">
        <AlertTriangle className="h-6 w-6 text-urgent" />
        <AlertTitle className="text-lg font-bold text-urgent">Immediate Help & Safety Plan</AlertTitle>
        <AlertDescription className="text-base mt-2">
          If you are in immediate danger, please use the emergency contact options below. This app does not
          automatically contact anyone—all actions require you to tap or click.
        </AlertDescription>
      </Alert>

      {/* Emergency Contacts */}
      <Card className="border-2 border-urgent/30">
        <CardHeader className="bg-urgent/5">
          <div className="flex items-center gap-3">
            <Phone className="h-6 w-6 text-urgent" />
            <CardTitle className="text-xl font-bold">Emergency Contacts</CardTitle>
          </div>
          <CardDescription className="text-base">
            Tap any number below to call. You must initiate the call yourself.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* 911 Emergency */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Emergency Services (911)</h3>
            <p className="text-sm text-muted-foreground mb-3">
              For immediate life-threatening situations requiring police, fire, or medical assistance.
            </p>
            <Button
              asChild
              size="lg"
              className="w-full bg-urgent hover:bg-urgent/90 text-white font-bold text-lg"
            >
              <a href="tel:911">
                <Phone className="mr-2 h-5 w-5" />
                Call 911 Now
              </a>
            </Button>
          </div>

          <Separator />

          {/* National DV Hotline */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">National Domestic Violence Hotline</h3>
            <p className="text-sm text-muted-foreground mb-3">
              24/7 confidential support, crisis intervention, and safety planning. Available in multiple languages.
            </p>
            <Button asChild size="lg" variant="outline" className="w-full border-2 font-semibold">
              <a href="tel:1-800-799-7233">
                <Phone className="mr-2 h-5 w-5" />
                Call 1-800-799-SAFE (7233)
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full border-2 font-semibold mt-2">
              <a href="sms:1-800-787-3224">
                <Phone className="mr-2 h-5 w-5" />
                Text START to 88788
              </a>
            </Button>
          </div>

          <Separator />

          {/* Crisis Text Line */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Crisis Text Line</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Free 24/7 text support for people in crisis. Text-based support for those who prefer not to call.
            </p>
            <Button asChild size="lg" variant="outline" className="w-full border-2 font-semibold">
              <a href="sms:741741">
                <Phone className="mr-2 h-5 w-5" />
                Text HOME to 741741
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Online Resources */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ExternalLink className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl font-bold">Online Support Resources</CardTitle>
          </div>
          <CardDescription>
            Access additional help and information. Tap to open in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">The National Domestic Violence Hotline</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Comprehensive resources, safety planning tools, and information about domestic violence.
            </p>
            <Button asChild variant="outline" className="w-full">
              <a href="https://www.thehotline.org/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit thehotline.org
              </a>
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold">RAINN (Rape, Abuse & Incest National Network)</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Support for survivors of sexual violence with 24/7 hotline and online chat.
            </p>
            <Button asChild variant="outline" className="w-full">
              <a href="https://www.rainn.org/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit rainn.org
              </a>
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold">Love Is Respect</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Support for young people (ages 13-26) experiencing dating abuse or unhealthy relationships.
            </p>
            <Button asChild variant="outline" className="w-full">
              <a href="https://www.loveisrespect.org/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit loveisrespect.org
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Important Disclaimer */}
      <Alert className="border-2 border-primary/30">
        <Info className="h-5 w-5" />
        <AlertTitle className="font-bold">Important Information</AlertTitle>
        <AlertDescription className="space-y-2 mt-2">
          <p>
            <strong>This app does not automatically contact police, shelters, or emergency services.</strong> All
            phone calls, texts, and website visits require you to tap or click the buttons above.
          </p>
          <p>
            Your safety is the top priority. If you are in immediate danger, call 911 or your local emergency
            number right away.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Consider creating a safety plan with a domestic violence advocate. They can help you prepare for
            emergencies and connect you with local resources.
          </p>
        </AlertDescription>
      </Alert>

      {/* Safety Planning Tips */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl font-bold">Safety Planning Tips</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                <strong>Identify safe areas</strong> in your home where there are no weapons and multiple exits.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                <strong>Pack an emergency bag</strong> with important documents, medications, money, and extra
                clothes. Keep it somewhere safe and accessible.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                <strong>Establish a code word</strong> with trusted friends or family to signal when you need help.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                <strong>Memorize important phone numbers</strong> in case you don't have access to your phone.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                <strong>Document everything</strong> using this app's journal and evidence features. Keep records
                safe and backed up.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                <strong>Trust your instincts.</strong> If you feel unsafe, take action to protect yourself.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
