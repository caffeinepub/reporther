import { useState } from 'react';
import { useGetStalkerProfiles, useGetStalkerProfileById, useUpdateStalkerProfile, useDeleteStalkerProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { User, Edit, Trash2, Eye, Download, AlertTriangle, MapPin, Phone, Car, Home, UserCircle, Share2, Calendar } from 'lucide-react';
import type { StalkerProfile } from '../types';

interface SavedStalkerProfilesProps {
  onLoadProfile: (profile: StalkerProfile) => void;
}

export default function SavedStalkerProfiles({ onLoadProfile }: SavedStalkerProfilesProps) {
  const { data: profileIds = [], isLoading } = useGetStalkerProfiles();
  const updateProfile = useUpdateStalkerProfile();
  const deleteProfile = useDeleteStalkerProfile();

  const [selectedProfileId, setSelectedProfileId] = useState<bigint | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<bigint | null>(null);

  const { data: selectedProfile } = useGetStalkerProfileById(selectedProfileId);

  const [editFormData, setEditFormData] = useState<{
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

  const handleView = (profileId: string) => {
    setSelectedProfileId(BigInt(profileId));
    setViewDialogOpen(true);
  };

  const handleEdit = (profileId: string, profile: StalkerProfile) => {
    setSelectedProfileId(BigInt(profileId));
    setEditFormData({
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
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (profileId: string) => {
    setProfileToDelete(BigInt(profileId));
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!profileToDelete) return;

    try {
      await deleteProfile.mutateAsync(profileToDelete);
      toast.success('Stalker profile deleted successfully');
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
    } catch (error: any) {
      console.error('Error deleting profile:', error);
      toast.error(error.message || 'Failed to delete profile');
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedProfileId) return;

    if (!editFormData.name.trim()) {
      toast.error('Please enter the stalker\'s name (required field)');
      return;
    }

    // Validate age if provided
    if (editFormData.age.trim()) {
      const age = parseInt(editFormData.age);
      if (isNaN(age) || age < 0 || age > 150) {
        toast.error('Please enter a valid age (0-150)');
        return;
      }
    }

    try {
      const updatedProfile: StalkerProfile = {
        name: editFormData.name.trim(),
        age: editFormData.age.trim() ? BigInt(parseInt(editFormData.age)) : undefined,
        phoneNumber: editFormData.phoneNumber.trim() || undefined,
        city: editFormData.city.trim() || undefined,
        state: editFormData.state.trim() || undefined,
        zipCode: editFormData.zipCode.trim() || undefined,
        fullAddress: editFormData.fullAddress.trim() || undefined,
        vehicleDescription: editFormData.vehicleDescription.trim() || undefined,
        vehiclePlate: editFormData.vehiclePlate.trim() || undefined,
        suspectDescription: editFormData.suspectDescription.trim() || undefined,
        socialMediaLinks: editFormData.socialMediaLinks.trim() || undefined,
      };

      await updateProfile.mutateAsync({ profileId: selectedProfileId, profile: updatedProfile });
      toast.success('Profile updated successfully');
      setEditDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleLoad = (profile: StalkerProfile) => {
    onLoadProfile(profile);
    setViewDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading saved profiles...</p>
        </div>
      </div>
    );
  }

  if (profileIds.length === 0) {
    return (
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-12 pb-12">
          <div className="text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-bold mb-2">No Saved Profiles</h3>
            <p className="text-muted-foreground mb-6">
              You haven't saved any stalker profiles yet. Use the "Save as Profile" button on the Current Record tab to save profiles for future reference.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <Alert className="border-primary/50 bg-primary/5">
          <User className="h-5 w-5 text-primary" />
          <AlertDescription className="font-medium text-foreground">
            <strong className="text-primary">Manage Your Profiles:</strong> View, edit, or delete saved stalker profiles. 
            Load any profile into the form to use for incident reports or police submissions.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2">
          {profileIds.map((profileId) => (
            <ProfileCard
              key={profileId}
              profileId={profileId}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary" />
              Profile Details
            </DialogTitle>
            <DialogDescription>
              Complete information for this stalker profile
            </DialogDescription>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">Name</Label>
                  <p className="text-base font-medium">{selectedProfile.name}</p>
                </div>
                {selectedProfile.age && (
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground">Age</Label>
                    <p className="text-base font-medium">{selectedProfile.age.toString()}</p>
                  </div>
                )}
                {selectedProfile.phoneNumber && (
                  <div className="md:col-span-2">
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Phone Number
                    </Label>
                    <p className="text-base font-medium">{selectedProfile.phoneNumber}</p>
                  </div>
                )}
                {selectedProfile.city && (
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> City
                    </Label>
                    <p className="text-base font-medium">{selectedProfile.city}</p>
                  </div>
                )}
                {selectedProfile.state && (
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground">State</Label>
                    <p className="text-base font-medium">{selectedProfile.state}</p>
                  </div>
                )}
                {selectedProfile.zipCode && (
                  <div className="md:col-span-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Zip Code</Label>
                    <p className="text-base font-medium">{selectedProfile.zipCode}</p>
                  </div>
                )}
                {selectedProfile.fullAddress && (
                  <div className="md:col-span-2">
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                      <Home className="w-3 h-3" /> Full Address
                    </Label>
                    <p className="text-base font-medium">{selectedProfile.fullAddress}</p>
                  </div>
                )}
                {selectedProfile.vehicleDescription && (
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                      <Car className="w-3 h-3" /> Vehicle Description
                    </Label>
                    <p className="text-base font-medium">{selectedProfile.vehicleDescription}</p>
                  </div>
                )}
                {selectedProfile.vehiclePlate && (
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                      <Car className="w-3 h-3" /> Vehicle Plate
                    </Label>
                    <p className="text-base font-medium">{selectedProfile.vehiclePlate}</p>
                  </div>
                )}
                {selectedProfile.suspectDescription && (
                  <div className="md:col-span-2">
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                      <UserCircle className="w-3 h-3" /> Suspect Description
                    </Label>
                    <p className="text-base font-medium whitespace-pre-wrap">{selectedProfile.suspectDescription}</p>
                  </div>
                )}
                {selectedProfile.socialMediaLinks && (
                  <div className="md:col-span-2">
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                      <Share2 className="w-3 h-3" /> Social Media Links
                    </Label>
                    <p className="text-base font-medium whitespace-pre-wrap">{selectedProfile.socialMediaLinks}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            {selectedProfile && (
              <Button onClick={() => handleLoad(selectedProfile)} className="bg-primary hover:bg-primary/90">
                <Download className="w-4 h-4 mr-2" />
                Load into Form
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Edit className="w-6 h-6 text-primary" />
              Edit Profile
            </DialogTitle>
            <DialogDescription>
              Update stalker profile information. Only name is required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="editName" className="font-semibold">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="editName"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Enter stalker's name (required)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editAge" className="font-semibold">Age</Label>
                <Input
                  id="editAge"
                  type="number"
                  value={editFormData.age}
                  onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                  placeholder="Enter age (optional)"
                  min="0"
                  max="150"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="editPhone" className="font-semibold">Phone Number</Label>
                <Input
                  id="editPhone"
                  value={editFormData.phoneNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                  placeholder="Enter phone number (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCity" className="font-semibold">City</Label>
                <Input
                  id="editCity"
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                  placeholder="Enter city (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editState" className="font-semibold">State</Label>
                <Input
                  id="editState"
                  value={editFormData.state}
                  onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                  placeholder="Enter state (optional)"
                  maxLength={2}
                  className="uppercase"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="editZip" className="font-semibold">Zip Code</Label>
                <Input
                  id="editZip"
                  value={editFormData.zipCode}
                  onChange={(e) => setEditFormData({ ...editFormData, zipCode: e.target.value })}
                  placeholder="Enter zip code (optional)"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="editAddress" className="font-semibold">Full Address</Label>
                <Input
                  id="editAddress"
                  value={editFormData.fullAddress}
                  onChange={(e) => setEditFormData({ ...editFormData, fullAddress: e.target.value })}
                  placeholder="Enter full address (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editVehicle" className="font-semibold">Vehicle Description</Label>
                <Input
                  id="editVehicle"
                  value={editFormData.vehicleDescription}
                  onChange={(e) => setEditFormData({ ...editFormData, vehicleDescription: e.target.value })}
                  placeholder="Enter vehicle description (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPlate" className="font-semibold">Vehicle Plate</Label>
                <Input
                  id="editPlate"
                  value={editFormData.vehiclePlate}
                  onChange={(e) => setEditFormData({ ...editFormData, vehiclePlate: e.target.value })}
                  placeholder="Enter license plate (optional)"
                  className="uppercase"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="editDescription" className="font-semibold">Suspect Description</Label>
                <Textarea
                  id="editDescription"
                  value={editFormData.suspectDescription}
                  onChange={(e) => setEditFormData({ ...editFormData, suspectDescription: e.target.value })}
                  placeholder="Physical description (optional)"
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="editSocial" className="font-semibold">Social Media Links</Label>
                <Textarea
                  id="editSocial"
                  value={editFormData.socialMediaLinks}
                  onChange={(e) => setEditFormData({ ...editFormData, socialMediaLinks: e.target.value })}
                  placeholder="Social media profiles (optional)"
                  className="min-h-[60px]"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateProfile.isPending} className="bg-primary hover:bg-primary/90">
              {updateProfile.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stalker Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this stalker profile? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteProfile.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface ProfileCardProps {
  profileId: string;
  onView: (profileId: string) => void;
  onEdit: (profileId: string, profile: StalkerProfile) => void;
  onDelete: (profileId: string) => void;
}

function ProfileCard({ profileId, onView, onEdit, onDelete }: ProfileCardProps) {
  const { data: profile, isLoading } = useGetStalkerProfileById(BigInt(profileId));

  if (isLoading || !profile) {
    return (
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          {profile.name}
        </CardTitle>
        <CardDescription className="text-sm">
          {profile.age && `Age: ${profile.age.toString()}`}
          {profile.age && (profile.city || profile.state) && ' • '}
          {profile.city && profile.state && `${profile.city}, ${profile.state}`}
          {!profile.age && !profile.city && !profile.state && 'Limited information available'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {profile.phoneNumber && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Phone className="w-3 h-3" />
            {profile.phoneNumber}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(profileId)}
            className="flex-1"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(profileId, profile)}
            className="flex-1"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(profileId)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
