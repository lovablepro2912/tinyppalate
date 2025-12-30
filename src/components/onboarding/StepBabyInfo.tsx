import { User, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface StepBabyInfoProps {
  babyName: string;
  setBabyName: (name: string) => void;
  birthDate: string;
  setBirthDate: (date: string) => void;
}

export function StepBabyInfo({ babyName, setBabyName, birthDate, setBirthDate }: StepBabyInfoProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <span className="text-5xl">👶</span>
        <h2 className="text-xl font-bold text-foreground mt-3">Tell us about your little one</h2>
        <p className="text-muted-foreground text-sm mt-1">We'll personalize their food journey</p>
      </div>

      <div className="space-y-4">
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
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Helps us track milestones and suggest age-appropriate foods
          </p>
        </div>
      </div>
    </div>
  );
}
