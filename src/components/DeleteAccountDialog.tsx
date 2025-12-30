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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHaptics } from '@/hooks/useHaptics';
import { useToast } from '@/hooks/use-toast';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const { user, deleteAccount } = useAuth();
  const { error: hapticError, heavy } = useHaptics();
  const { toast } = useToast();
  
  const [confirmEmail, setConfirmEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const userEmail = user?.email || '';
  const isConfirmed = confirmEmail.toLowerCase() === userEmail.toLowerCase();

  const handleDelete = async () => {
    if (!isConfirmed) {
      hapticError();
      return;
    }

    heavy();
    setLoading(true);
    
    try {
      await deleteAccount();
      toast({
        title: "Account deleted",
        description: "Your account and all data have been permanently deleted.",
      });
    } catch {
      hapticError();
      toast({
        title: "Deletion failed",
        description: "Could not delete your account. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      setConfirmEmail('');
      onOpenChange(newOpen);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="rounded-3xl max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mb-2">
            <AlertTriangle className="w-6 h-6 text-danger" />
          </div>
          <AlertDialogTitle className="text-center">Delete Account?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            This action is <span className="font-bold text-danger">permanent</span> and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-danger/5 border border-danger/20 rounded-xl p-3 text-sm">
            <p className="font-medium text-foreground mb-2">This will permanently delete:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Your baby's profile</li>
              <li>• All food logs and history</li>
              <li>• All allergen tracking data</li>
              <li>• Your account credentials</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmEmail" className="text-sm">
              Type <span className="font-mono bg-secondary px-1 rounded">{userEmail}</span> to confirm
            </Label>
            <Input
              id="confirmEmail"
              value={confirmEmail}
              onChange={e => setConfirmEmail(e.target.value)}
              placeholder="Enter your email"
              className="rounded-xl"
              disabled={loading}
            />
          </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            disabled={loading}
            className="rounded-xl"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmed || loading}
            className="bg-danger hover:bg-danger/90 rounded-xl"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Delete My Account'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
