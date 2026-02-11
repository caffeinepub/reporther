import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface ProfileDeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileName: string;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export default function ProfileDeleteConfirmDialog({
  open,
  onOpenChange,
  profileName,
  onConfirm,
  isDeleting,
}: ProfileDeleteConfirmDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  };

  const disabled = isDeleting || isProcessing;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Saved Profile</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to permanently delete the profile for{' '}
              <span className="font-semibold text-foreground">{profileName}</span>?
            </p>
            <p className="text-sm">
              This action cannot be undone. The profile will be removed from your saved profiles list.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={disabled}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={disabled}
            className="bg-destructive hover:bg-destructive/90"
          >
            {disabled ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Profile'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
