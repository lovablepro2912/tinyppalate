import { Plus, Search, CheckCircle, Save } from 'lucide-react';

export function StepLogging() {
  const steps = [
    { icon: Plus, text: 'Tap the + button or select a food card', color: 'bg-primary' },
    { icon: Search, text: 'Find the food from your library', color: 'bg-orange-500' },
    { icon: CheckCircle, text: 'Note any reactions (if any)', color: 'bg-blue-500' },
    { icon: Save, text: 'Save to track progress automatically', color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-5xl">📝</span>
        <h2 className="text-xl font-bold text-foreground mt-3">Logging is Easy!</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Here's how to track your baby's food adventures
        </p>
      </div>

      <div className="space-y-3">
        {steps.map(({ icon: Icon, text, color }, index) => (
          <div
            key={index}
            className="flex items-center gap-4 bg-secondary/50 rounded-xl p-4 border border-border/30"
          >
            <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{text}</p>
            </div>
            <span className="text-lg font-bold text-muted-foreground">{index + 1}</span>
          </div>
        ))}
      </div>

      <div className="bg-accent/50 rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          💡 <span className="font-medium">Pro tip:</span> Log foods right after meals while it's fresh in your memory!
        </p>
      </div>
    </div>
  );
}
