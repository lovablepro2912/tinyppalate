import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Calendar, Clock } from 'lucide-react';
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

const reactionOptions = [
  { value: 0 as const, label: 'No Reaction', description: 'Food was tolerated well' },
  { value: 1 as const, label: 'Mild Reaction', description: 'Minor symptoms observed' },
  { value: 2 as const, label: 'Severe Reaction', description: 'Serious symptoms occurred' },
];

export function EditLogModal({ log, onClose }: EditLogModalProps) {
  const { updateLog, deleteLog } = useFoodContext();
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState('');
  const [reactionSeverity, setReactionSeverity] = useState<0 | 1 | 2>(0);
  const [notes, setNotes] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset form when log changes
  useEffect(() => {
    if (log) {
      const logDate = parseISO(log.created_at);
      setDate(logDate);
      setTime(format(logDate, 'HH:mm'));
      setReactionSeverity(log.reaction_severity);
      setNotes(log.notes || '');
    }
  }, [log]);

  const handleSave = () => {
    if (!log || !date) return;
    
    // Combine date and time
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    
    updateLog(log.id, {
      reaction_severity: reactionSeverity,
      notes,
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

  if (!log) return null;

  return (
    <>
      <Sheet open={!!log} onOpenChange={() => onClose()}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-3">
              <span className="text-3xl">{log.food.emoji}</span>
              <span>Edit Entry: {log.food.name}</span>
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6 overflow-y-auto pb-6">
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
                    onClick={() => setReactionSeverity(option.value)}
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

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Notes</label>
              <Textarea
                placeholder="Add any observations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
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
