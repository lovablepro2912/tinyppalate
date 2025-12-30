import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Check, ShieldAlert } from 'lucide-react';
import { FoodWithState } from '@/types/food';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useFoodContext } from '@/contexts/FoodContext';
import { cn } from '@/lib/utils';

interface LogFoodModalProps {
  food: FoodWithState | null;
  onClose: () => void;
  showSafetyWarning?: boolean;
}

const symptoms = ['Hives', 'Vomiting', 'Swelling', 'Rash', 'Breathing issues'];

export function LogFoodModal({ food, onClose, showSafetyWarning = false }: LogFoodModalProps) {
  const { logFood, profile } = useFoodContext();
  const [step, setStep] = useState<'safety' | 'log'>(showSafetyWarning ? 'safety' : 'log');
  const [hasReaction, setHasReaction] = useState(false);
  const [severity, setSeverity] = useState<0 | 1 | 2>(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  if (!food) return null;

  const handleLog = () => {
    const symptomNotes = selectedSymptoms.length > 0 
      ? `Symptoms: ${selectedSymptoms.join(', ')}. ${notes}` 
      : notes;
    logFood(food.id, hasReaction, severity, symptomNotes);
    onClose();
  };

  const exposureText = food.is_allergen && food.state?.status === 'TRYING'
    ? `Exposure ${(food.state?.exposure_count || 0) + 1}/3`
    : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="w-full max-w-md bg-card rounded-3xl card-shadow overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{food.emoji}</span>
              <div>
                <h2 className="font-bold text-lg text-foreground">{food.name}</h2>
                {exposureText && (
                  <span className="text-sm text-warning font-medium">{exposureText}</span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4">
            {step === 'safety' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-3 p-4 bg-warning/10 rounded-2xl border border-warning/30">
                  <ShieldAlert className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-foreground">Safety Reminder</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Only introduce this allergen if <span className="font-semibold">{profile.baby_name}</span> is healthy. 
                      Wait 2 hours after feeding to monitor for symptoms.
                    </p>
                  </div>
                </div>
                <Button 
                  className="w-full h-12 rounded-xl font-bold"
                  onClick={() => setStep('log')}
                >
                  I Understand, Log Exposure
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                {/* Reaction Toggle */}
                <div className="flex items-center justify-between p-4 bg-secondary rounded-2xl">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={cn(
                      "w-5 h-5 transition-colors",
                      hasReaction ? "text-danger" : "text-muted-foreground"
                    )} />
                    <span className="font-medium text-foreground">Any Reaction?</span>
                  </div>
                  <Switch
                    checked={hasReaction}
                    onCheckedChange={setHasReaction}
                  />
                </div>

                {/* Reaction Details */}
                <AnimatePresence>
                  {hasReaction && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      {/* Severity */}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                          Severity
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant={severity === 1 ? 'default' : 'outline'}
                            onClick={() => setSeverity(1)}
                            className={cn(
                              "rounded-xl",
                              severity === 1 && "bg-warning hover:bg-warning/90 text-warning-foreground"
                            )}
                          >
                            Mild
                          </Button>
                          <Button
                            type="button"
                            variant={severity === 2 ? 'default' : 'outline'}
                            onClick={() => setSeverity(2)}
                            className={cn(
                              "rounded-xl",
                              severity === 2 && "bg-danger hover:bg-danger/90 text-danger-foreground"
                            )}
                          >
                            Severe
                          </Button>
                        </div>
                      </div>

                      {/* Symptoms */}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                          Symptoms
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {symptoms.map(symptom => (
                            <Button
                              key={symptom}
                              type="button"
                              size="sm"
                              variant={selectedSymptoms.includes(symptom) ? 'default' : 'outline'}
                              onClick={() => {
                                setSelectedSymptoms(prev => 
                                  prev.includes(symptom) 
                                    ? prev.filter(s => s !== symptom)
                                    : [...prev, symptom]
                                );
                              }}
                              className={cn(
                                "rounded-full",
                                selectedSymptoms.includes(symptom) && "bg-danger hover:bg-danger/90"
                              )}
                            >
                              {symptom}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Notes (optional)
                  </label>
                  <Textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="How did they like it?"
                    className="rounded-xl resize-none"
                    rows={2}
                  />
                </div>

                {/* Submit */}
                <Button 
                  onClick={handleLog}
                  className={cn(
                    "w-full h-12 rounded-xl font-bold",
                    hasReaction 
                      ? "bg-danger hover:bg-danger/90" 
                      : "bg-success hover:bg-success/90"
                  )}
                >
                  <Check className="w-5 h-5 mr-2" />
                  {hasReaction ? 'Log Reaction' : 'Log as Safe'}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
