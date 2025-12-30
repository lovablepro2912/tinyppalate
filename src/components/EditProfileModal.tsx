import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFoodContext } from '@/contexts/FoodContext';
import { useHaptics } from '@/hooks/useHaptics';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  const { profile, updateProfile } = useFoodContext();
  const { success, error: hapticError } = useHaptics();
  const { toast } = useToast();
  
  const [babyName, setBabyName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && profile) {
      setBabyName(profile.baby_name);
      setBirthDate(format(new Date(profile.birth_date), 'yyyy-MM-dd'));
    }
  }, [open, profile]);

  const handleSave = async () => {
    if (!babyName.trim()) {
      hapticError();
      toast({
        title: "Name required",
        description: "Please enter a name for your baby.",
        variant: "destructive",
      });
      return;
    }

    const selectedDate = new Date(birthDate);
    if (selectedDate > new Date()) {
      hapticError();
      toast({
        title: "Invalid date",
        description: "Birth date cannot be in the future.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        baby_name: babyName.trim(),
        birth_date: birthDate,
      });
      success();
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
      onClose();
    } catch {
      hapticError();
      toast({
        title: "Update failed",
        description: "Could not save your changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md bg-card rounded-3xl card-shadow overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-bold text-lg text-foreground">Edit Profile</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="babyName">Baby's Name</Label>
              <Input
                id="babyName"
                value={babyName}
                onChange={e => setBabyName(e.target.value)}
                placeholder="Enter baby's name"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="rounded-xl"
              />
            </div>

            <Button 
              onClick={handleSave}
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
