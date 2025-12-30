import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Loader2, Sparkles, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Onboarding() {
  const [babyName, setBabyName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signOut, checkOnboardingStatus } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!babyName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your baby's name",
        variant: "destructive",
      });
      return;
    }

    if (!birthDate) {
      toast({
        title: "Date of birth required",
        description: "Please enter your baby's date of birth",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Use upsert in case profile doesn't exist yet
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          baby_name: babyName.trim(),
          birth_date: birthDate,
        }, { onConflict: 'id' });

      if (error) throw error;

      toast({
        title: `Welcome, ${babyName}! 🎉`,
        description: "Let's start your food adventure!",
      });
      
      // Refresh onboarding status and navigate
      await checkOnboardingStatus();
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent via-background to-primary/10 flex items-center justify-center p-4 safe-area-all">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-card/95 backdrop-blur-sm rounded-3xl p-8 card-shadow border border-border/50">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div 
              className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center mx-auto mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-4xl">👶</span>
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">Tell us about your little one</h1>
            <p className="text-muted-foreground mt-2">
              We'll personalize their food journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span>👶</span> Baby's Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Emma"
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                  className="pl-12 h-12 rounded-xl bg-secondary/50 border-border/50 focus:bg-card transition-colors"
                  maxLength={50}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span>🎂</span> Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="pl-12 h-12 rounded-xl bg-secondary/50 border-border/50 focus:bg-card transition-colors"
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Helps us track milestones and suggest age-appropriate foods
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-xl text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-xl mt-6"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Start Food Journey <Sparkles className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-3">
          <p className="text-sm text-muted-foreground">
            Track 100 foods before age 1 🥕🍎🥦
          </p>
          <button
            type="button"
            onClick={signOut}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mx-auto"
          >
            <LogOut className="w-3 h-3" />
            Use a different account
          </button>
        </div>
      </motion.div>
    </div>
  );
}
