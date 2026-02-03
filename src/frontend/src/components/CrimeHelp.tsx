import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, BookOpen, Scale, Shield, AlertCircle } from 'lucide-react';

export default function CrimeHelp() {
  const handleOpenResource = () => {
    window.open('https://www.womenslaw.org/laws/general/crimes', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-empowerment dark:gradient-empowerment-dark flex items-center justify-center shadow-xl">
          <img 
            src="/assets/generated/crime-help-icon-transparent.dim_64x64.png" 
            alt="Crime help icon" 
            className="w-12 h-12"
          />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
          Crime Help & Legal Resources
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Learn more about criminal laws, women's safety rights, and legal definitions of crimes. 
          Knowledge is power when it comes to protecting yourself and understanding your rights.
        </p>
      </div>

      {/* Educational Content Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg gradient-empowerment dark:gradient-empowerment-dark flex items-center justify-center mb-3 shadow-md">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-primary">Understanding Your Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Every woman has the right to safety, respect, and protection under the law. Understanding your legal rights 
              is the first step in protecting yourself from harassment and stalking.
            </p>
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Right to file police reports and restraining orders</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Right to document and preserve evidence</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Right to legal representation and support services</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg gradient-empowerment dark:gradient-empowerment-dark flex items-center justify-center mb-3 shadow-md">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-primary">Legal Definitions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Understanding legal terminology helps you communicate effectively with law enforcement and legal professionals. 
              Know the difference between harassment, stalking, and other criminal behaviors.
            </p>
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Stalking:</strong> Repeated unwanted contact causing fear</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Harassment:</strong> Unwanted behavior causing distress</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Cyberstalking:</strong> Online harassment and threats</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* External Resource Section */}
      <Card className="border-2 border-primary/30 shadow-2xl bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <ExternalLink className="w-6 h-6" />
            Comprehensive Legal Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            WomensLaw.org provides detailed information about criminal laws, safety planning, and legal rights. 
            This trusted resource offers state-specific information and practical guidance for women facing harassment, 
            stalking, and other safety concerns.
          </p>
          
          <div className="bg-background p-4 rounded-lg border-2 border-primary/20 mb-6">
            <h3 className="font-bold text-foreground mb-2">What You'll Find:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>State-by-state criminal law information</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Restraining order and protection order guidance</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Safety planning resources and support services</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Legal definitions and court procedures</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleOpenResource}
            size="lg"
            className="w-full rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Visit WomensLaw.org — Learn About Your Rights
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Opens in a new tab • Free and confidential resource
          </p>
        </CardContent>
      </Card>

      {/* Empowerment Message */}
      <div className="mt-8 text-center">
        <p className="text-lg font-semibold text-foreground mb-2">
          Knowledge + Documentation + Action = Justice
        </p>
        <p className="text-sm text-muted-foreground italic">
          "When you understand your rights and document incidents properly, you create a powerful case for accountability."
        </p>
      </div>
    </div>
  );
}
