import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const floatingFoods = ['🥕', '🍎', '🥦', '🍌', '🥑', '🍓', '🥬', '🍊'];

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) throw error;
        toast({
          title: "Account created! 🎉",
          description: "Let's set up your baby's profile.",
        });
        navigate('/onboarding');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({
          title: "Welcome back! 👋",
          description: "Let's continue tracking.",
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Oops!",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent via-background to-primary/10 flex items-center justify-center p-4 relative overflow-hidden safe-area-all">
      {/* Floating Food Emojis */}
      {floatingFoods.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl pointer-events-none select-none opacity-60"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
          style={{
            left: `${10 + (i * 10)}%`,
            top: `${10 + (i * 8)}%`,
          }}
        >
          {emoji}
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="bg-card/95 backdrop-blur-sm rounded-3xl p-8 card-shadow border border-border/50">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div 
              className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center mx-auto mb-4 relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-5xl">👶</span>
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-6 h-6 text-warning" />
              </motion.div>
            </motion.div>
            <h1 className="text-3xl font-bold text-foreground">TinyPalate</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              {isSignUp ? "Start your baby's delicious journey 🍼" : "Welcome back, foodie! 🥄"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span>📧</span> Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="parent@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 rounded-xl bg-secondary/50 border-border/50 focus:bg-card transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span>🔐</span> Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-12 rounded-xl bg-secondary/50 border-border/50 focus:bg-card transition-colors"
                  required
                  minLength={6}
                />
              </div>
              {isSignUp && (
                <p className="text-xs text-muted-foreground">At least 6 characters</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-xl text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isSignUp ? (
                <span className="flex items-center gap-2">
                  Create Account <span className="text-xl">🚀</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <span className="text-xl">👋</span>
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-4 text-sm text-muted-foreground">
                {isSignUp ? "Already tracking?" : "New here?"}
              </span>
            </div>
          </div>

          {/* Toggle */}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-primary/30 text-primary font-medium hover:bg-primary/5 transition-colors"
          >
            {isSignUp ? (
              <span>Sign in to your account →</span>
            ) : (
              <span>Create a new account →</span>
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Track first foods, discover allergies, celebrate milestones 🎉
        </p>
      </motion.div>
    </div>
  );
}
