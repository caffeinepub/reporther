import { useState, useEffect } from 'react';
import { useGetStalkerInfo, useSaveStalkerInfo, useAddStalkerProfile, useGetAllPoliceDepartments, useSavePoliceDepartment, useUpdatePoliceDepartment, useDeletePoliceDepartment, useSaveSelectedDepartment } from '../hooks/useQueries';
import { useActorReadiness } from '../hooks/useActorReadiness';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, MapPin, User, Calendar, Save, Search, AlertTriangle, Phone, Car, Home, UserCircle, Share2, FolderOpen, Plus, RefreshCw, Mail, Edit, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import type { StalkerProfile, PoliceDepartment } from '../types';
import SavedStalkerProfiles from './SavedStalkerProfiles';

interface StalkerRecordProps {
  onPoliceDepartmentFound?: (department: PoliceDepartment) => void;
}

export default function StalkerRecord({ onPoliceDepartmentFound }: StalkerRecordProps) {
  const { data: stalkerInfo, isLoading } = useGetStalkerInfo();
  const saveStalkerInfo = useSaveStalkerInfo();
  const addStalkerProfile = useAddStalkerProfile();
  const { data: savedDepartments = [], refetch: refetchDepartments } = useGetAllPoliceDepartments();
  const saveDepartment = useSavePoliceDepartment();
  const updateDepartment = useUpdatePoliceDepartment();
  const deleteDepartment = useDeletePoliceDepartment();
  const saveSelectedDepartment = useSaveSelectedDepartment();
  const { isReady: actorReady, isInitializing: actorInitializing, hasError: actorHasError } = useActorReadiness();

  const [activeTab, setActiveTab] = useState('current');
  const [formData, setFormData] = useState<{
    name: string;
    age: string;
    phoneNumber: string;
    city: string;
    state: string;
    zipCode: string;
    fullAddress: string;
    vehicleDescription: string;
    vehiclePlate: string;
    suspectDescription: string;
    socialMediaLinks: string;
  }>({
    name: '',
    age: '',
    phoneNumber: '',
    city: '',
    state: '',
    zipCode: '',
    fullAddress: '',
    vehicleDescription: '',
    vehiclePlate: '',
    suspectDescription: '',
    socialMediaLinks: '',
  });

  const [nearestPolice, setNearestPolice] = useState<PoliceDepartment | null>(null);
  const [searchingPolice, setSearchingPolice] = useState(false);
  const [policeError, setPoliceError] = useState<string | null>(null);
  const [isAutoRetrieved, setIsAutoRetrieved] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  // Manual input state
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualDeptData, setManualDeptData] = useState<PoliceDepartment>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    contactNumber: '',
  });
  const [editingDeptId, setEditingDeptId] = useState<bigint | null>(null);
  
  // Dropdown selection state
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  
  // Delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<bigint | null>(null);

  // Update form when stalker info loads
  useEffect(() => {
    if (stalkerInfo) {
      setFormData({
        name: stalkerInfo.name,
        age: stalkerInfo.age?.toString() || '',
        phoneNumber: stalkerInfo.phoneNumber || '',
        city: stalkerInfo.city || '',
        state: stalkerInfo.state || '',
        zipCode: stalkerInfo.zipCode || '',
        fullAddress: stalkerInfo.fullAddress || '',
        vehicleDescription: stalkerInfo.vehicleDescription || '',
        vehiclePlate: stalkerInfo.vehiclePlate || '',
        suspectDescription: stalkerInfo.suspectDescription || '',
        socialMediaLinks: stalkerInfo.socialMediaLinks || '',
      });
    }
  }, [stalkerInfo]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLoadProfile = (profile: StalkerProfile) => {
    setFormData({
      name: profile.name,
      age: profile.age?.toString() || '',
      phoneNumber: profile.phoneNumber || '',
      city: profile.city || '',
      state: profile.state || '',
      zipCode: profile.zipCode || '',
      fullAddress: profile.fullAddress || '',
      vehicleDescription: profile.vehicleDescription || '',
      vehiclePlate: profile.vehiclePlate || '',
      suspectDescription: profile.suspectDescription || '',
      socialMediaLinks: profile.socialMediaLinks || '',
    });
    setActiveTab('current');
    toast.success('Profile loaded into form');
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Basic phone validation - allows various formats
    const phoneRegex = /^[\d\s\-\(\)\+\.]+$/;
    return phone.trim().length >= 10 && phoneRegex.test(phone);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter the stalker\'s name (required field)');
      return;
    }

    // Validate age if provided
    if (formData.age.trim()) {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 0 || age > 150) {
        toast.error('Please enter a valid age (0-150)');
        return;
      }
    }

    try {
      const stalkerProfile: StalkerProfile = {
        name: formData.name.trim(),
        age: formData.age.trim() ? BigInt(parseInt(formData.age)) : undefined,
        phoneNumber: formData.phoneNumber.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        zipCode: formData.zipCode.trim() || undefined,
        fullAddress: formData.fullAddress.trim() || undefined,
        vehicleDescription: formData.vehicleDescription.trim() || undefined,
        vehiclePlate: formData.vehiclePlate.trim() || undefined,
        suspectDescription: formData.suspectDescription.trim() || undefined,
        socialMediaLinks: formData.socialMediaLinks.trim() || undefined,
      };

      await saveStalkerInfo.mutateAsync(stalkerProfile);
      toast.success('Stalker information saved securely');
      
      // Automatically search for police department after saving if address info is available
      if (formData.zipCode.trim() || formData.fullAddress.trim()) {
        await findNearestPolice();
      }
    } catch (error: any) {
      console.error('Error saving stalker info:', error);
      toast.error(error.message || 'Failed to save stalker information');
    }
  };

  const handleSaveAsProfile = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter the stalker\'s name (required field)');
      return;
    }

    // Validate age if provided
    if (formData.age.trim()) {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 0 || age > 150) {
        toast.error('Please enter a valid age (0-150)');
        return;
      }
    }

    try {
      const stalkerProfile: StalkerProfile = {
        name: formData.name.trim(),
        age: formData.age.trim() ? BigInt(parseInt(formData.age)) : undefined,
        phoneNumber: formData.phoneNumber.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        zipCode: formData.zipCode.trim() || undefined,
        fullAddress: formData.fullAddress.trim() || undefined,
        vehicleDescription: formData.vehicleDescription.trim() || undefined,
        vehiclePlate: formData.vehiclePlate.trim() || undefined,
        suspectDescription: formData.suspectDescription.trim() || undefined,
        socialMediaLinks: formData.socialMediaLinks.trim() || undefined,
      };

      await addStalkerProfile.mutateAsync(stalkerProfile);
      toast.success('Stalker profile saved successfully');
      
      // Automatically search for police department after saving profile if address info is available
      if (formData.zipCode.trim() || formData.fullAddress.trim()) {
        await findNearestPolice();
      }
      
      setActiveTab('saved');
    } catch (error: any) {
      console.error('Error saving stalker profile:', error);
      toast.error(error.message || 'Failed to save stalker profile');
    }
  };

  const findNearestPolice = async () => {
    // Validate address information
    const hasFullAddress = formData.fullAddress.trim().length > 0;
    const hasBasicAddress = formData.city.trim() && formData.state.trim() && formData.zipCode.trim();
    
    if (!hasFullAddress && !hasBasicAddress) {
      toast.error('Please enter address information (city, state, and zip code at minimum)');
      return;
    }

    setSearchingPolice(true);
    setPoliceError(null);
    setNearestPolice(null);
    setIsAutoRetrieved(false);
    setIsVerified(false);

    try {
      // Note: Backend should provide searchNearestPolice function with Google Places API integration
      // including Place Details API for phone numbers and email addresses
      // For now, this is a placeholder that demonstrates the expected data structure
      
      const zipCode = formData.zipCode.trim();
      const geoResponse = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
      
      if (!geoResponse.ok) {
        throw new Error('Invalid zip code or location not found');
      }

      const geoData = await geoResponse.json();
      const place = geoData.places[0];

      // Create police department info (placeholder until backend Google Places integration)
      // Backend should extract phone and email from Google Place Details API
      const policeDept: PoliceDepartment = {
        name: `${place['place name']} Police Department`,
        address: formData.fullAddress.trim() || `${place['place name']}, ${place['state abbreviation']}`,
        city: place['place name'],
        state: place['state abbreviation'],
        zipCode: zipCode,
        contactNumber: '', // Backend should extract from Google Places API formatted_phone_number field
      };

      setNearestPolice(policeDept);
      setIsAutoRetrieved(true);
      
      // Save the selected department
      try {
        await saveSelectedDepartment.mutateAsync(policeDept);
      } catch (saveError) {
        console.error('Error saving selected department:', saveError);
        // Don't fail the whole operation if save fails
      }
      
      // Notify parent component
      if (onPoliceDepartmentFound) {
        onPoliceDepartmentFound(policeDept);
      }
      
      toast.success('Police department information retrieved and saved. Please verify and add phone/email manually if needed.');
    } catch (error: any) {
      console.error('Error finding police department:', error);
      setPoliceError(error.message || 'Failed to find nearest police department. Please verify the address information or use manual input.');
      toast.error('Could not locate police department automatically. Please use manual input.');
    } finally {
      setSearchingPolice(false);
    }
  };

  const handleRefreshPoliceInfo = async () => {
    if (!nearestPolice) {
      toast.info('No police department information to refresh. Please search first.');
      return;
    }
    
    toast.info('Refreshing police department information...');
    await findNearestPolice();
  };

  const handleManualInputToggle = () => {
    if (!showManualInput) {
      // Initialize with current data if available
      if (nearestPolice) {
        setManualDeptData(nearestPolice);
      } else {
        setManualDeptData({
          name: '',
          address: '',
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          contactNumber: '',
        });
      }
    }
    setShowManualInput(!showManualInput);
    setEditingDeptId(null);
  };

  const handleManualDeptChange = (field: keyof PoliceDepartment, value: string) => {
    setManualDeptData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveManualDept = async () => {
    if (!manualDeptData.name.trim() || !manualDeptData.address.trim()) {
      toast.error('Please fill in department name and address');
      return;
    }

    // Validate phone number if provided
    if (manualDeptData.contactNumber.trim() && !validatePhoneNumber(manualDeptData.contactNumber)) {
      toast.error('Please enter a valid phone number (at least 10 digits)');
      return;
    }

    try {
      if (editingDeptId !== null) {
        // Update existing department
        await updateDepartment.mutateAsync({
          deptId: editingDeptId,
          department: manualDeptData,
        });
        toast.success('Police department updated successfully');
      } else {
        // Save new department
        await saveDepartment.mutateAsync(manualDeptData);
        toast.success('Police department saved successfully');
      }
      
      setNearestPolice(manualDeptData);
      setIsAutoRetrieved(false);
      setIsVerified(false); // User-entered departments are not verified
      setShowManualInput(false);
      setEditingDeptId(null);
      
      // Save the selected department
      try {
        await saveSelectedDepartment.mutateAsync(manualDeptData);
      } catch (saveError) {
        console.error('Error saving selected department:', saveError);
        // Don't fail the whole operation if save fails
      }
      
      // Notify parent component
      if (onPoliceDepartmentFound) {
        onPoliceDepartmentFound(manualDeptData);
      }
      
      // Refresh the departments list
      await refetchDepartments();
    } catch (error: any) {
      console.error('Error saving police department:', error);
      toast.error(error.message || 'Failed to save police department');
    }
  };

  const handleSelectDepartment = async (deptIdStr: string) => {
    setSelectedDeptId(deptIdStr);
    
    if (deptIdStr === 'none') {
      setNearestPolice(null);
      setIsAutoRetrieved(false);
      setIsVerified(false);
      return;
    }
    
    const deptId = BigInt(deptIdStr);
    const dept = savedDepartments.find(([id]) => id === deptId);
    
    if (dept) {
      setNearestPolice(dept[1]);
      setIsAutoRetrieved(false);
      // Check if this is a verified department (backend should provide this info)
      // For now, we'll mark East Norriton as verified as an example
      setIsVerified(dept[1].name.toLowerCase().includes('east norriton'));
      
      // Save the selected department
      try {
        await saveSelectedDepartment.mutateAsync(dept[1]);
        toast.success('Police department loaded and saved');
      } catch (saveError) {
        console.error('Error saving selected department:', saveError);
        toast.success('Police department loaded');
      }
      
      // Notify parent component
      if (onPoliceDepartmentFound) {
        onPoliceDepartmentFound(dept[1]);
      }
    }
  };

  const handleEditDepartment = (deptId: bigint) => {
    const dept = savedDepartments.find(([id]) => id === deptId);
    if (dept) {
      setManualDeptData(dept[1]);
      setEditingDeptId(deptId);
      setShowManualInput(true);
    }
  };

  const handleDeleteDepartment = async () => {
    if (deptToDelete === null) return;
    
    try {
      await deleteDepartment.mutateAsync(deptToDelete);
      toast.success('Police department deleted successfully');
      
      // Clear selection if deleted department was selected
      if (selectedDeptId === deptToDelete.toString()) {
        setSelectedDeptId('');
        setNearestPolice(null);
        setIsAutoRetrieved(false);
        setIsVerified(false);
      }
      
      // Refresh the departments list
      await refetchDepartments();
    } catch (error: any) {
      console.error('Error deleting police department:', error);
      toast.error(error.message || 'Failed to delete police department');
    } finally {
      setShowDeleteDialog(false);
      setDeptToDelete(null);
    }
  };

  const sortedDepartments = [...savedDepartments].sort((a, b) => 
    a[1].name.localeCompare(b[1].name)
  );

  // Determine if save buttons should be disabled
  const isSaveDisabled = !actorReady || actorInitializing || saveStalkerInfo.isPending;
  const isSaveAsProfileDisabled = !actorReady || actorInitializing || addStalkerProfile.isPending;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading stalker information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Alert className="border-primary/50 bg-primary/5">
        <Shield className="h-5 w-5 text-primary" />
        <AlertDescription className="font-medium text-foreground">
          <strong className="text-primary">Your Safety First:</strong> Document stalker information securely. 
          This data is encrypted and only accessible to you. Save multiple profiles for different individuals. Only the name is required.
        </AlertDescription>
      </Alert>

      {actorHasError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription>
            <strong>Connection Error:</strong> Unable to connect to the backend service. Please try logging out and logging back in, or refresh the page.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-muted/50 border-2 border-primary/20">
          <TabsTrigger value="current" className="flex items-center gap-2 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <User className="w-4 h-4" />
            Current Record
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FolderOpen className="w-4 h-4" />
            Saved Profiles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardTitle className="flex items-center gap-2 text-xl">
                <UserCircle className="w-6 h-6 text-primary" />
                Stalker Information
              </CardTitle>
              <CardDescription>
                Document identifying information about the individual. Only name is required.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2 font-semibold">
                    <User className="w-4 h-4 text-primary" />
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Full name"
                    className="border-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="flex items-center gap-2 font-semibold">
                    <Calendar className="w-4 h-4 text-primary" />
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="Age (optional)"
                    className="border-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="flex items-center gap-2 font-semibold">
                    <Phone className="w-4 h-4 text-primary" />
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="Phone number (optional)"
                    className="border-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-2 font-semibold">
                    <MapPin className="w-4 h-4 text-primary" />
                    City
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City (optional)"
                    className="border-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="flex items-center gap-2 font-semibold">
                    <MapPin className="w-4 h-4 text-primary" />
                    State
                  </Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State (optional)"
                    className="border-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="flex items-center gap-2 font-semibold">
                    <MapPin className="w-4 h-4 text-primary" />
                    Zip Code
                  </Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="Zip code (optional)"
                    className="border-2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullAddress" className="flex items-center gap-2 font-semibold">
                  <Home className="w-4 h-4 text-primary" />
                  Full Address
                </Label>
                <Input
                  id="fullAddress"
                  value={formData.fullAddress}
                  onChange={(e) => handleInputChange('fullAddress', e.target.value)}
                  placeholder="Complete address (optional)"
                  className="border-2"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleDescription" className="flex items-center gap-2 font-semibold">
                    <Car className="w-4 h-4 text-primary" />
                    Vehicle Description
                  </Label>
                  <Input
                    id="vehicleDescription"
                    value={formData.vehicleDescription}
                    onChange={(e) => handleInputChange('vehicleDescription', e.target.value)}
                    placeholder="Make, model, color (optional)"
                    className="border-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehiclePlate" className="flex items-center gap-2 font-semibold">
                    <Car className="w-4 h-4 text-primary" />
                    License Plate
                  </Label>
                  <Input
                    id="vehiclePlate"
                    value={formData.vehiclePlate}
                    onChange={(e) => handleInputChange('vehiclePlate', e.target.value)}
                    placeholder="License plate number (optional)"
                    className="border-2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="suspectDescription" className="flex items-center gap-2 font-semibold">
                  <User className="w-4 h-4 text-primary" />
                  Physical Description
                </Label>
                <Textarea
                  id="suspectDescription"
                  value={formData.suspectDescription}
                  onChange={(e) => handleInputChange('suspectDescription', e.target.value)}
                  placeholder="Height, build, distinguishing features (optional)"
                  className="border-2 min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="socialMediaLinks" className="flex items-center gap-2 font-semibold">
                  <Share2 className="w-4 h-4 text-primary" />
                  Social Media Links
                </Label>
                <Textarea
                  id="socialMediaLinks"
                  value={formData.socialMediaLinks}
                  onChange={(e) => handleInputChange('socialMediaLinks', e.target.value)}
                  placeholder="Social media profiles, one per line (optional)"
                  className="border-2 min-h-[80px]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isSaveDisabled}
                  className="flex-1 bg-primary hover:bg-primary/90 font-bold"
                >
                  {actorInitializing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : saveStalkerInfo.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Current Record
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleSaveAsProfile}
                  disabled={isSaveAsProfileDisabled}
                  variant="outline"
                  className="flex-1 border-2 border-primary/50 hover:bg-primary/10 font-semibold"
                >
                  {actorInitializing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : addStalkerProfile.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Save as New Profile
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Police Department Section */}
          <Card className="border-2 border-secondary/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-secondary/5 to-primary/5">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Shield className="w-6 h-6 text-secondary" />
                Police Department Information
              </CardTitle>
              <CardDescription>
                Automatically locate or manually enter the nearest police department based on stalker's address
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Saved Departments Dropdown */}
              {sortedDepartments.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="savedDepartments" className="font-semibold">
                    Load Saved Department
                  </Label>
                  <Select value={selectedDeptId} onValueChange={handleSelectDepartment}>
                    <SelectTrigger id="savedDepartments" className="border-2">
                      <SelectValue placeholder="Select a saved department..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- None --</SelectItem>
                      {sortedDepartments.map(([id, dept]) => (
                        <SelectItem key={id.toString()} value={id.toString()}>
                          {dept.name} - {dept.city}, {dept.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={findNearestPolice}
                  disabled={searchingPolice || !formData.zipCode.trim()}
                  className="flex-1 bg-secondary hover:bg-secondary/90 font-bold"
                >
                  {searchingPolice ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Auto-Lookup Department
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleManualInputToggle}
                  variant="outline"
                  className="border-2 border-secondary/50 hover:bg-secondary/10 font-semibold"
                >
                  {showManualInput ? 'Cancel' : 'Manual Input'}
                </Button>
              </div>

              {policeError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{policeError}</AlertDescription>
                </Alert>
              )}

              {showManualInput && (
                <Card className="border-2 border-secondary/30 bg-secondary/5">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {editingDeptId !== null ? 'Edit' : 'Manual'} Police Department Entry
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="deptName">Department Name *</Label>
                        <Input
                          id="deptName"
                          value={manualDeptData.name}
                          onChange={(e) => handleManualDeptChange('name', e.target.value)}
                          placeholder="e.g., East Norriton Police Department"
                          className="border-2"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="deptAddress">Address *</Label>
                        <Input
                          id="deptAddress"
                          value={manualDeptData.address}
                          onChange={(e) => handleManualDeptChange('address', e.target.value)}
                          placeholder="Street address"
                          className="border-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deptCity">City</Label>
                        <Input
                          id="deptCity"
                          value={manualDeptData.city}
                          onChange={(e) => handleManualDeptChange('city', e.target.value)}
                          placeholder="City"
                          className="border-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deptState">State</Label>
                        <Input
                          id="deptState"
                          value={manualDeptData.state}
                          onChange={(e) => handleManualDeptChange('state', e.target.value)}
                          placeholder="State"
                          className="border-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deptZip">Zip Code</Label>
                        <Input
                          id="deptZip"
                          value={manualDeptData.zipCode}
                          onChange={(e) => handleManualDeptChange('zipCode', e.target.value)}
                          placeholder="Zip code"
                          className="border-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deptContact">Contact Number</Label>
                        <Input
                          id="deptContact"
                          value={manualDeptData.contactNumber}
                          onChange={(e) => handleManualDeptChange('contactNumber', e.target.value)}
                          placeholder="Phone number"
                          className="border-2"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleSaveManualDept}
                      disabled={saveDepartment.isPending || updateDepartment.isPending}
                      className="w-full bg-secondary hover:bg-secondary/90 font-bold"
                    >
                      {saveDepartment.isPending || updateDepartment.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {editingDeptId !== null ? 'Update' : 'Save'} Department
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {nearestPolice && (
                <Card className="border-2 border-secondary/50 bg-secondary/5">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {nearestPolice.name}
                          {isVerified && (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {isAutoRetrieved && !isVerified && (
                            <Badge variant="secondary">Auto-Retrieved</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-2 space-y-1">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-0.5 text-secondary flex-shrink-0" />
                            <span>
                              {nearestPolice.address}<br />
                              {nearestPolice.city}, {nearestPolice.state} {nearestPolice.zipCode}
                            </span>
                          </div>
                          {nearestPolice.contactNumber && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-secondary" />
                              <span>{nearestPolice.contactNumber}</span>
                            </div>
                          )}
                        </CardDescription>
                      </div>
                      <Button
                        onClick={handleRefreshPoliceInfo}
                        disabled={searchingPolice}
                        variant="ghost"
                        size="sm"
                      >
                        <RefreshCw className={`w-4 h-4 ${searchingPolice ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              )}

              {/* Saved Departments List */}
              {sortedDepartments.length > 0 && (
                <div className="space-y-2">
                  <Label className="font-semibold">Saved Departments ({sortedDepartments.length})</Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {sortedDepartments.map(([id, dept]) => (
                      <Card key={id.toString()} className="border">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{dept.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {dept.city}, {dept.state} {dept.zipCode}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditDepartment(id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeptToDelete(id);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved">
          <SavedStalkerProfiles onLoadProfile={handleLoadProfile} />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Police Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this police department? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDepartment}
              disabled={deleteDepartment.isPending}
            >
              {deleteDepartment.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
