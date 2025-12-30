import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Check, ShieldAlert, AlertOctagon } from 'lucide-react';
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

// Symptom severity mapping
const mildSymptoms = ['Hives', 'Rash', 'Vomiting'];
const severeSymptoms = ['Swelling', 'Breathing issues'];
const allSymptoms = [...mildSymptoms, ...severeSymptoms];

export function LogFoodModal({ food, onClose, showSafetyWarning = false }: LogFoodModalProps) {
  const { logFood, profile } = useFoodContext();
  const [step, setStep] = useState<'safety' | 'log'>(showSafetyWarning ? 'safety' : 'log');
  const [hasReaction, setHasReaction] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Reset state when food changes
  useEffect(() => {
    setStep(showSafetyWarning ? 'safety' : 'log');
    setHasReaction(false);
    setSelectedSymptoms([]);
    setNotes('');
  }, [food, showSafetyWarning]);

  // Auto-calculate severity based on selected symptoms
  const autoSeverity = useMemo((): 0 | 1 | 2 => {
    if (!hasReaction || selectedSymptoms.length === 0) return 0;
    const hasSevere = selectedSymptoms.some(s => severeSymptoms.includes(s));
    return hasSevere ? 2 : 1;
  }, [hasReaction, selectedSymptoms]);

  const isSevere = autoSeverity === 2;

  if (!food) return null;

  const handleLog = () => {
    const symptomNotes = selectedSymptoms.length > 0 
      ? `Symptoms: ${selectedSymptoms.join(', ')}. ${notes}` 
      : notes;
    logFood(food.id, hasReaction, autoSeverity, symptomNotes);
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
          className={cn(
            "w-full max-w-md bg-card rounded-3xl card-shadow overflow-hidden transition-all duration-300",
            hasReaction && "ring-4 ring-danger/60"
          )}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className={cn(
            "flex items-center justify-between p-4 border-b transition-colors",
            hasReaction ? "border-danger/30 bg-danger/5" : "border-border"
          )}>
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
                <div className={cn(
                  "flex items-center justify-between p-4 rounded-2xl transition-colors",
                  hasReaction ? "bg-danger/10" : "bg-secondary"
                )}>
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
                      {/* Severe Warning Banner */}
                      {isSevere && (
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center gap-3 p-4 bg-danger rounded-2xl"
                        >
                          <AlertOctagon className="w-6 h-6 text-danger-foreground flex-shrink-0" />
                          <div>
                            <p className="font-bold text-danger-foreground">
                              Seek Immediate Medical Attention
                            </p>
                            <p className="text-sm text-danger-foreground/90">
                              Severe symptoms detected. Call emergency services if breathing is affected.
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {/* Symptoms */}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                          Select Symptoms
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {allSymptoms.map(symptom => {
                            const isSelected = selectedSymptoms.includes(symptom);
                            const isSevereSymptom = severeSymptoms.includes(symptom);
                            return (
                              <Button
                                key={symptom}
                                type="button"
                                size="sm"
                                variant={isSelected ? 'default' : 'outline'}
                                onClick={() => {
                                  setSelectedSymptoms(prev => 
                                    prev.includes(symptom) 
                                      ? prev.filter(s => s !== symptom)
                                      : [...prev, symptom]
                                  );
                                }}
                                className={cn(
                                  "rounded-full transition-all",
                                  isSelected && isSevereSymptom && "bg-danger hover:bg-danger/90",
                                  isSelected && !isSevereSymptom && "bg-warning hover:bg-warning/90 text-warning-foreground",
                                  !isSelected && isSevereSymptom && "border-danger/50 text-danger hover:bg-danger/10"
                                )}
                              >
                                {symptom}
                                {isSevereSymptom && !isSelected && (
                                  <span className="ml-1 text-[10px] opacity-70">⚠️</span>
                                )}
                              </Button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {autoSeverity === 0 && "Select symptoms to auto-determine severity"}
                          {autoSeverity === 1 && "🟡 Mild reaction detected"}
                          {autoSeverity === 2 && "🔴 Severe reaction detected"}
                        </p>
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
                  disabled={hasReaction && selectedSymptoms.length === 0}
                  className={cn(
                    "w-full h-12 rounded-xl font-bold transition-all",
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