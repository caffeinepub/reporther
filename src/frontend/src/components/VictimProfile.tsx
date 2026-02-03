import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { User, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGetVictimProfile, useSaveVictimProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { VictimProfile as VictimProfileType } from '../backend';

export default function VictimProfile() {
  const { identity } = useInternetIdentity();
  const { data: victimProfile, isLoading } = useGetVictimProfile();
  const saveVictimProfile = useSaveVictimProfile();

  const [formData, setFormData] = useState<VictimProfileType>({
    name: undefined,
    dob: undefined,
    address: undefined,
    email: undefined,
    phoneNumber: undefined,
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (victimProfile) {
      setFormData({
        name: victimProfile.name,
        dob: victimProfile.dob,
        address: victimProfile.address,
        email: victimProfile.email,
        phoneNumber: victimProfile.phoneNumber,
      });
    }
  }, [victimProfile]);

  const handleInputChange = (field: keyof VictimProfileType, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value.trim() === '' ? undefined : value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await saveVictimProfile.mutateAsync(formData);
      toast.success('Your information has been saved securely');
      setHasChanges(false);
    } catch (error: any) {
      console.error('Error saving victim profile:', error);
      toast.error('Failed to save information: ' + (error.message || 'Unknown error'));
    }
  };

  const hasAnyData = formData.name || formData.dob || formData.address || formData.email || formData.phoneNumber;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <User className="w-6 h-6 text-primary" />
            Your Information (Optional)
          </CardTitle>
          <CardDescription className="text-base">
            Provide your personal information to be included in police reports. All fields are completely optional.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <Alert className="border-primary/50 bg-primary/5">
            <AlertCircle className="h-5 w-5 text-primary" />
            <AlertDescription className="font-medium">
              <strong>Privacy Notice:</strong> This information is stored securely and will only be included 
              in police reports when you choose to submit an incident. You control what information to provide.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name (optional)"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="border-2 focus:border-primary"
              />
              <p className="text-sm text-muted-foreground">
                Your legal name for official police reports
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob" className="text-base font-semibold">
                Date of Birth
              </Label>
              <Input
                id="dob"
                type="date"
                placeholder="Enter your date of birth (optional)"
                value={formData.dob || ''}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                className="border-2 focus:border-primary"
              />
              <p className="text-sm text-muted-foreground">
                Your date of birth for identification purposes
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-base font-semibold">
                Address
              </Label>
              <Input
                id="address"
                type="text"
                placeholder="Enter your address (optional)"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="border-2 focus:border-primary"
              />
              <p className="text-sm text-muted-foreground">
                Your current residential address
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address (optional)"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="border-2 focus:border-primary"
              />
              <p className="text-sm text-muted-foreground">
                Your email for law enforcement to contact you if needed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-base font-semibold">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter your phone number (optional)"
                value={formData.phoneNumber || ''}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="border-2 focus:border-primary"
              />
              <p className="text-sm text-muted-foreground">
                Your phone number for law enforcement to contact you if needed
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasAnyData && !hasChanges && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Information saved</span>
                </div>
              )}
              {hasChanges && (
                <span className="text-sm text-muted-foreground">
                  You have unsaved changes
                </span>
              )}
            </div>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saveVictimProfile.isPending}
              className="bg-primary hover:bg-primary/90 font-semibold"
            >
              {saveVictimProfile.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Information
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasAnyData && (
        <Card className="border-2 border-secondary/20">
          <CardHeader>
            <CardTitle className="text-lg">Information Summary</CardTitle>
            <CardDescription>
              This information will be included in police reports when you submit incidents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.name && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-semibold text-muted-foreground">Name:</span>
                <span className="font-medium">{formData.name}</span>
              </div>
            )}
            {formData.dob && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-semibold text-muted-foreground">Date of Birth:</span>
                <span className="font-medium">{formData.dob}</span>
              </div>
            )}
            {formData.address && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-semibold text-muted-foreground">Address:</span>
                <span className="font-medium">{formData.address}</span>
              </div>
            )}
            {formData.email && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-semibold text-muted-foreground">Email:</span>
                <span className="font-medium">{formData.email}</span>
              </div>
            )}
            {formData.phoneNumber && (
              <div className="flex justify-between items-center py-2">
                <span className="font-semibold text-muted-foreground">Phone Number:</span>
                <span className="font-medium">{formData.phoneNumber}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
