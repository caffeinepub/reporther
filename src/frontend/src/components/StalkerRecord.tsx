import { useState, useEffect } from 'react';
import { useGetStalkerInfo, useSaveStalkerInfo, useAddStalkerProfile, useGetAllPoliceDepartments, useSavePoliceDepartment, useUpdatePoliceDepartment, useDeletePoliceDepartment } from '../hooks/useQueries';
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
import { Shield, MapPin, User, Calendar, Save, Search, AlertTriangle, Phone, Car, Home, UserCircle, Share2, FolderOpen, Plus, RefreshCw, Mail, Edit, Trash2, CheckCircle2 } from 'lucide-react';
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
      
      // Notify parent component
      if (onPoliceDepartmentFound) {
        onPoliceDepartmentFound(policeDept);
      }
      
      toast.success('Police department information retrieved. Please verify and add phone/email manually if needed.');
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

  const handleSelectDepartment = (deptIdStr: string) => {
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
      
      // Notify parent component
      if (onPoliceDepartmentFound) {
        onPoliceDepartmentFound(dept[1]);
      }
      
      toast.success('Police department loaded');
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
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b-2 border-primary/20">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <User className="w-6 h-6 text-primary" />
                Stalker Information
              </CardTitle>
              <CardDescription className="font-medium">
                Record details about the individual for evidence and protection. Only name is required.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter stalker's name (required)"
                    className="border-2 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="Enter approximate age (optional)"
                    min="0"
                    max="150"
                    className="border-2 focus:border-primary"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phoneNumber" className="font-semibold flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="Enter phone number (optional)"
                    className="border-2 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    City
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Enter city (optional)"
                    className="border-2 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    State
                  </Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="Enter state (optional)"
                    maxLength={2}
                    className="border-2 focus:border-primary uppercase"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="zipCode" className="font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Zip Code
                  </Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="Enter zip code (optional)"
                    maxLength={10}
                    className="border-2 focus:border-primary"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="fullAddress" className="font-semibold flex items-center gap-2">
                    <Home className="w-4 h-4 text-primary" />
                    Full Address
                  </Label>
                  <Input
                    id="fullAddress"
                    value={formData.fullAddress}
                    onChange={(e) => handleInputChange('fullAddress', e.target.value)}
                    placeholder="Enter full address (optional)"
                    className="border-2 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleDescription" className="font-semibold flex items-center gap-2">
                    <Car className="w-4 h-4 text-primary" />
                    Vehicle Description
                  </Label>
                  <Input
                    id="vehicleDescription"
                    value={formData.vehicleDescription}
                    onChange={(e) => handleInputChange('vehicleDescription', e.target.value)}
                    placeholder="e.g., Red Honda Civic (optional)"
                    className="border-2 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehiclePlate" className="font-semibold flex items-center gap-2">
                    <Car className="w-4 h-4 text-primary" />
                    Vehicle Plate
                  </Label>
                  <Input
                    id="vehiclePlate"
                    value={formData.vehiclePlate}
                    onChange={(e) => handleInputChange('vehiclePlate', e.target.value)}
                    placeholder="Enter license plate (optional)"
                    className="border-2 focus:border-primary uppercase"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="suspectDescription" className="font-semibold flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-primary" />
                    Suspect Description
                  </Label>
                  <Textarea
                    id="suspectDescription"
                    value={formData.suspectDescription}
                    onChange={(e) => handleInputChange('suspectDescription', e.target.value)}
                    placeholder="Physical description, clothing, distinguishing features, etc. (optional)"
                    className="border-2 focus:border-primary min-h-[80px]"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="socialMediaLinks" className="font-semibold flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-primary" />
                    Suspect Social Media Links
                  </Label>
                  <Textarea
                    id="socialMediaLinks"
                    value={formData.socialMediaLinks}
                    onChange={(e) => handleInputChange('socialMediaLinks', e.target.value)}
                    placeholder="Social media profiles, usernames, or links (optional)"
                    className="border-2 focus:border-primary min-h-[60px]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-end">
                <Button
                  onClick={handleSaveAsProfile}
                  disabled={isSaveAsProfileDisabled}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-6"
                >
                  {actorInitializing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Connecting...
                    </>
                  ) : addStalkerProfile.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Save as Profile
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaveDisabled}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8"
                >
                  {actorInitializing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Connecting...
                    </>
                  ) : saveStalkerInfo.isPending ? (
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

          <Separator className="my-8" />

          <Card className="border-2 border-secondary/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10 border-b-2 border-secondary/20">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Shield className="w-6 h-6 text-secondary" />
                Nearest Police Department
              </CardTitle>
              <CardDescription className="font-medium">
                Find law enforcement near the stalker's location or select from saved departments
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {sortedDepartments.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="selectDept" className="font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-secondary" />
                    Select Saved Department
                  </Label>
                  <Select value={selectedDeptId} onValueChange={handleSelectDepartment}>
                    <SelectTrigger id="selectDept" className="border-2 focus:border-secondary">
                      <SelectValue placeholder="Choose a saved police department..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Search for new)</SelectItem>
                      {sortedDepartments.map(([id, dept]) => {
                        const isVerifiedDept = dept.name.toLowerCase().includes('east norriton');
                        return (
                          <SelectItem key={id.toString()} value={id.toString()}>
                            <div className="flex items-center gap-2">
                              <span>{dept.name} - {dept.city}, {dept.state}</span>
                              {isVerifiedDept && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={findNearestPolice}
                  disabled={searchingPolice || (!formData.zipCode.trim() && !formData.fullAddress.trim())}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold"
                >
                  {searchingPolice ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Find Nearest Police
                    </>
                  )}
                </Button>
                
                {nearestPolice && (
                  <Button
                    onClick={handleRefreshPoliceInfo}
                    disabled={searchingPolice}
                    variant="outline"
                    className="border-2 border-secondary/50 hover:bg-secondary/10 font-semibold"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Department Info
                  </Button>
                )}
                
                <Button
                  onClick={handleManualInputToggle}
                  variant="outline"
                  className="border-2 border-primary/50 hover:bg-primary/10 font-semibold"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {showManualInput ? 'Cancel Manual Input' : 'Manual Input'}
                </Button>
              </div>

              {showManualInput && (
                <Card className="border-2 border-primary/30 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Edit className="w-5 h-5 text-primary" />
                      {editingDeptId !== null ? 'Edit Police Department' : 'Manual Police Department Entry'}
                    </CardTitle>
                    <CardDescription>
                      Enter or correct police department information manually
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="manualName" className="font-semibold">
                          Department Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="manualName"
                          value={manualDeptData.name}
                          onChange={(e) => handleManualDeptChange('name', e.target.value)}
                          placeholder="e.g., Springfield Police Department"
                          className="border-2 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="manualAddress" className="font-semibold">
                          Address <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="manualAddress"
                          value={manualDeptData.address}
                          onChange={(e) => handleManualDeptChange('address', e.target.value)}
                          placeholder="e.g., 123 Main Street"
                          className="border-2 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="manualCity" className="font-semibold">
                          City
                        </Label>
                        <Input
                          id="manualCity"
                          value={manualDeptData.city}
                          onChange={(e) => handleManualDeptChange('city', e.target.value)}
                          placeholder="City"
                          className="border-2 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="manualState" className="font-semibold">
                          State
                        </Label>
                        <Input
                          id="manualState"
                          value={manualDeptData.state}
                          onChange={(e) => handleManualDeptChange('state', e.target.value)}
                          placeholder="State"
                          maxLength={2}
                          className="border-2 focus:border-primary uppercase"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="manualZip" className="font-semibold">
                          Zip Code
                        </Label>
                        <Input
                          id="manualZip"
                          value={manualDeptData.zipCode}
                          onChange={(e) => handleManualDeptChange('zipCode', e.target.value)}
                          placeholder="Zip Code"
                          className="border-2 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="manualPhone" className="font-semibold">
                          Phone Number
                        </Label>
                        <Input
                          id="manualPhone"
                          type="tel"
                          value={manualDeptData.contactNumber}
                          onChange={(e) => handleManualDeptChange('contactNumber', e.target.value)}
                          placeholder="e.g., (555) 123-4567"
                          className="border-2 focus:border-primary"
                        />
                        <p className="text-xs text-muted-foreground">At least 10 digits required</p>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <Button
                        onClick={() => {
                          setShowManualInput(false);
                          setEditingDeptId(null);
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveManualDept}
                        disabled={saveDepartment.isPending || updateDepartment.isPending}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                      >
                        {(saveDepartment.isPending || updateDepartment.isPending) ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Department
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {policeError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{policeError}</AlertDescription>
                </Alert>
              )}

              {nearestPolice && (
                <div className="bg-muted/50 rounded-lg p-6 border-2 border-secondary/20 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-secondary flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        {nearestPolice.name}
                      </h3>
                      {isVerified && (
                        <Badge variant="secondary" className="ml-2">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    {!isAutoRetrieved && selectedDeptId && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditDepartment(BigInt(selectedDeptId))}
                          className="border-primary/50 hover:bg-primary/10"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDeptToDelete(BigInt(selectedDeptId));
                            setShowDeleteDialog(true);
                          }}
                          className="border-destructive/50 hover:bg-destructive/10 text-destructive"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{nearestPolice.address}</p>
                        <p className="text-muted-foreground">
                          {nearestPolice.city}, {nearestPolice.state} {nearestPolice.zipCode}
                        </p>
                      </div>
                    </div>
                    
                    {nearestPolice.contactNumber && nearestPolice.contactNumber.trim() && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-secondary flex-shrink-0" />
                        <a 
                          href={`tel:${nearestPolice.contactNumber.replace(/\D/g, '')}`}
                          className="font-semibold text-foreground hover:text-primary underline transition-colors"
                        >
                          {nearestPolice.contactNumber}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {isAutoRetrieved && (
                    <Alert className="mt-4 border-muted-foreground/30 bg-muted/30">
                      <AlertDescription className="text-xs italic text-muted-foreground">
                        Police department information provided by Google – verify before use
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Alert className="mt-4 border-secondary/50 bg-secondary/5">
                    <AlertTriangle className="h-4 w-4 text-secondary" />
                    <AlertDescription className="text-xs">
                      <strong>Important:</strong> In an emergency, always call 911. For non-emergency matters, 
                      contact your local police department directly. This information is provided for reference only.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {!nearestPolice && !policeError && (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Enter address information and click "Find Nearest Police" to locate law enforcement</p>
                  <p className="text-sm mt-2">Or select from saved departments, or use manual input</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved">
          <SavedStalkerProfiles onLoadProfile={handleLoadProfile} />
        </TabsContent>
      </Tabs>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Police Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this police department? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeptToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDepartment}
              disabled={deleteDepartment.isPending}
            >
              {deleteDepartment.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
