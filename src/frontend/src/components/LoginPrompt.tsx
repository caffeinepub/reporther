import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, MessageSquareWarning, AlertCircle } from 'lucide-react';

export default function LoginPrompt() {
  const { login, loginStatus } = useInternetIdentity();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const disabled = loginStatus === 'logging-in';

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="max-w-5xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl gradient-empowerment dark:gradient-empowerment-dark flex items-center justify-center shadow-2xl">
            <img 
              src="/assets/generated/reporther-app-icon-192.dim_192x192.png" 
              alt="Reporther icon" 
              className="w-16 h-16"
            />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-4">
            Reporther
          </h1>
          <p className="text-2xl font-bold text-primary mb-3">
            Document, track, and report harassment with evidence-based accountability.
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A powerful safety tool to record incidents, generate warnings, and maintain evidence. 
            Track stalking and harassment with built-in documentation and police reporting support. 
            Your safety, your evidence, your power.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all shadow-lg hover:shadow-xl">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg gradient-empowerment dark:gradient-empowerment-dark flex items-center justify-center mb-3 shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg font-bold text-primary">Document Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Record detailed incident reports with timestamps, locations, and evidence notes. Build your case with precision and clarity.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all shadow-lg hover:shadow-xl">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg gradient-empowerment dark:gradient-empowerment-dark flex items-center justify-center mb-3 shadow-md">
                <MessageSquareWarning className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg font-bold text-primary">Generate Warnings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create powerful, legally-sound warning messages. Choose from formal evidence statements to direct warnings with clear consequences.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all shadow-lg hover:shadow-xl">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg gradient-empowerment dark:gradient-empowerment-dark flex items-center justify-center mb-3 shadow-md">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg font-bold text-primary">Report to Police</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Submit reports to your nearest police department. Track all submissions in your evidence record for accountability.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="border-2 border-primary/30 shadow-2xl bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="pt-8 pb-8 text-center">
            <AlertCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Take Control of Your Safety
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Login to start documenting incidents and maintaining your evidence record with Reporther.
            </p>
            <Button
              onClick={handleLogin}
              disabled={disabled}
              size="lg"
              className="rounded-full font-bold text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all"
            >
              {disabled ? 'Logging in...' : 'Get Started - Login Now'}
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Secure authentication • Your data is protected
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
