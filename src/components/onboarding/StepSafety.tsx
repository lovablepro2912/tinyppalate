import { Eye, Scissors, Clock, Baby, Phone, AlertTriangle } from 'lucide-react';
import { PoisonControlBanner } from '@/components/PoisonControlBanner';

export function StepSafety() {
  const tips = [
    {
      icon: Eye,
      title: 'Always Supervise',
      description: 'Never leave baby alone during meals',
      color: 'text-blue-500',
    },
    {
      icon: Scissors,
      title: 'Cut Foods Safely',
      description: 'Cut round foods lengthwise, avoid hard chunks',
      color: 'text-orange-500',
    },
    {
      icon: Clock,
      title: 'One at a Time',
      description: 'Wait 3-5 days between new foods',
      color: 'text-purple-500',
    },
    {
      icon: Baby,
      title: 'Know the Difference',
      description: 'Gagging is normal (learning), choking is silent',
      color: 'text-green-500',
    },
    {
      icon: Phone,
      title: 'Emergency Ready',
      description: 'Keep pediatrician & poison control numbers handy',
      color: 'text-red-500',
    },
    {
      icon: AlertTriangle,
      title: 'No Honey Before 1',
      description: 'Risk of infant botulism under 12 months',
      color: 'text-amber-500',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="text-center">
        <span className="text-5xl">🛡️</span>
        <h2 className="text-xl font-bold text-foreground mt-3">Safety First</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Keep these important tips in mind
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tips.map(({ icon: Icon, title, description, color }) => (
          <div
            key={title}
            className="bg-secondary/50 rounded-xl p-3 border border-border/30"
          >
            <Icon className={`w-6 h-6 ${color} mb-2`} />
            <p className="font-semibold text-foreground text-sm">{title}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
        ))}
      </div>

      <PoisonControlBanner />
    </div>
  );
}
