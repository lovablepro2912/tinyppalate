import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Calendar, Clock, AlertOctagon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useFoodContext } from '@/contexts/FoodContext';
import { FoodLog, RefFood } from '@/types/food';
import { cn } from '@/lib/utils';
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

interface LogWithFood extends FoodLog {
  food: RefFood;
}

interface EditLogModalProps {
  log: LogWithFood | null;
  onClose: () => void;
}

// Symptom severity mapping
const mildSymptoms = ['Hives', 'Rash', 'Vomiting'];
const severeSymptoms = ['Swelling', 'Breathing issues'];
const allSymptoms = [...mildSymptoms, ...severeSymptoms];

const reactionOptions = [
  { value: 0 as const, label: 'No Reaction', description: 'Food was tolerated well' },
  { value: 1 as const, label: 'Mild Reaction', description: 'Minor symptoms observed' },
  { value: 2 as const, label: 'Severe Reaction', description: 'Serious symptoms occurred' },
];

// Extract symptoms from notes
function parseSymptoms(notes: string): string[] {
  if (!notes) return [];
  const match = notes.match(/Symptoms: ([^.]+)/);
  if (!match) return [];
  return match[1].split(', ').filter(s => allSymptoms.includes(s));
}

// Extract clean notes (without symptoms prefix)
function parseCleanNotes(notes: string): string {
  if (!notes) return '';
  return notes.replace(/Symptoms: [^.]+\. ?/, '').trim();
}

export function EditLogModal({ log, onClose }: EditLogModalProps) {
  const { updateLog, deleteLog } = useFoodContext();
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState('');
  const [reactionSeverity, setReactionSeverity] = useState<0 | 1 | 2>(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset form when log changes
  useEffect(() => {
    if (log) {
      const logDate = parseISO(log.created_at);
      setDate(logDate);
      setTime(format(logDate, 'HH:mm'));
      setReactionSeverity(log.reaction_severity);
      setSelectedSymptoms(parseSymptoms(log.notes));
      setNotes(parseCleanNotes(log.notes));
    }
  }, [log]);

  // Auto-calculate severity based on selected symptoms
  const autoSeverity = useMemo((): 0 | 1 | 2 => {
    if (selectedSymptoms.length === 0) return 0;
    const hasSevere = selectedSymptoms.some(s => severeSymptoms.includes(s));
    return hasSevere ? 2 : 1;
  }, [selectedSymptoms]);

  // Update reaction severity when symptoms change
  useEffect(() => {
    if (selectedSymptoms.length > 0) {
      setReactionSeverity(autoSeverity);
    }
  }, [autoSeverity, selectedSymptoms.length]);

  const isSevere = reactionSeverity === 2;

  const handleSave = () => {
    if (!log || !date) return;
    
    // Combine date and time
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    
    // Build notes with symptoms
    const symptomNotes = selectedSymptoms.length > 0 
      ? `Symptoms: ${selectedSymptoms.join(', ')}. ${notes}` 
      : notes;
    
    updateLog(log.id, {
      reaction_severity: reactionSeverity,
      notes: symptomNotes,
      created_at: newDate.toISOString(),
    });
    
    onClose();
  };

  const handleDelete = () => {
    if (!log) return;
    deleteLog(log.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleSeverityChange = (value: 0 | 1 | 2) => {
    setReactionSeverity(value);
    // Clear symptoms if switching to no reaction
    if (value === 0) {
      setSelectedSymptoms([]);
    }
  };

  if (!log) return null;

  return (
    <>
      <Sheet open={!!log} onOpenChange={() => onClose()}>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] rounded-t-3xl overflow-hidden select-none" 
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          style={{
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-3">
              <span className="text-3xl">{log.food.emoji}</span>
              <span>Edit Entry: {log.food.name}</span>
            </SheetTitle>
          </SheetHeader>

          <div 
            className="space-y-5 overflow-y-auto pb-6 h-[calc(100%-60px)]"
            style={{ 
              touchAction: 'pan-y',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Reaction Status */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Reaction Status</label>
              <div className="space-y-2">
                {reactionOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSeverityChange(option.value)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all",
                      reactionSeverity === option.value
                        ? option.value === 0
                          ? "border-safe bg-safe/10"
                          : option.value === 1
                          ? "border-warning bg-warning/10"
                          : "border-danger bg-danger/10"
                        : "border-border bg-card hover:bg-accent/50"
                    )}
                  >
                    <p className={cn(
                      "font-medium",
                      reactionSeverity === option.value
                        ? option.value === 0
                          ? "text-safe"
                          : option.value === 1
                          ? "text-warning"
                          : "text-danger"
                        : "text-foreground"
                    )}>
                      {option.label}
                    </p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Symptoms Selector - Show when reaction is selected */}
            <AnimatePresence>
              {reactionSeverity > 0 && (
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
                          Severe Reaction Recorded
                        </p>
                        <p className="text-sm text-danger-foreground/90">
                          This entry indicates a serious allergic event.
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
                      {autoSeverity === 0 && reactionSeverity > 0 && "Select symptoms to record what happened"}
                      {autoSeverity === 1 && "🟡 Mild reaction symptoms"}
                      {autoSeverity === 2 && "🔴 Severe reaction symptoms"}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Notes</label>
              <Textarea
                placeholder="Add any observations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={handleSave}
                className="w-full"
                size="lg"
              >
                Save Changes
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full text-danger hover:text-danger hover:bg-danger/10 border-danger/30"
                size="lg"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Entry
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this log entry for {log.food.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-danger text-danger-foreground hover:bg-danger/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
