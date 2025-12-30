import { Home, BookOpen, Calendar, Shield } from 'lucide-react';

interface StepWelcomeProps {
  babyName: string;
}

export function StepWelcome({ babyName }: StepWelcomeProps) {
  const features = [
    { icon: Home, label: 'Home', description: 'Daily tips & progress', color: 'text-primary' },
    { icon: BookOpen, label: 'Food Dex', description: 'Browse 100+ foods', color: 'text-orange-500' },
    { icon: Calendar, label: 'Journal', description: 'Track meals & logs', color: 'text-blue-500' },
    { icon: Shield, label: 'Allergen', description: 'Safe introduction', color: 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-5xl">🎉</span>
        <h2 className="text-xl font-bold text-foreground mt-3">
          Welcome{babyName ? `, ${babyName}'s family` : ''}!
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Let's explore what you can do with this app
        </p>
      </div>

      <div className="bg-primary/10 rounded-2xl p-4 text-center">
        <p className="text-lg font-semibold text-foreground">🎯 Your Goal</p>
        <p className="text-sm text-muted-foreground mt-1">
          Introduce <span className="font-bold text-primary">100 foods</span> before age 1
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {features.map(({ icon: Icon, label, description, color }) => (
          <div
            key={label}
            className="bg-secondary/50 rounded-xl p-4 text-center border border-border/30"
          >
            <Icon className={`w-8 h-8 ${color} mx-auto mb-2`} />
            <p className="font-semibold text-foreground text-sm">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
