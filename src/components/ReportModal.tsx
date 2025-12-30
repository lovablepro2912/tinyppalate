import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Download, Loader2, Calendar } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, parseISO, isWithinInterval } from 'date-fns';
import { pdf } from '@react-pdf/renderer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useFoodContext } from '@/contexts/FoodContext';
import { DoctorReportPDF } from '@/components/reports/DoctorReportPDF';
import { cn } from '@/lib/utils';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const presetRanges = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'All time', days: -1 },
];

export function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const { profile, logs, userFoodStates, foods, getAllergenFoods } = useFoodContext();
  const [selectedPreset, setSelectedPreset] = useState(1); // Default to 30 days
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustom, setShowCustom] = useState(false);

  const handlePresetSelect = (index: number, days: number) => {
    setSelectedPreset(index);
    setShowCustom(false);
    if (days === -1) {
      // All time - find earliest log
      const allDates = logs.map(l => new Date(l.created_at));
      const earliest = allDates.length > 0 
        ? new Date(Math.min(...allDates.map(d => d.getTime())))
        : subDays(new Date(), 365);
      setStartDate(startOfDay(earliest));
    } else {
      setStartDate(startOfDay(subDays(new Date(), days)));
    }
    setEndDate(endOfDay(new Date()));
  };

  // Calculate report data
  const reportData = useMemo(() => {
    const start = startOfDay(startDate);
    const end = endOfDay(endDate);

    // Get logs within date range
    const filteredLogs = logs.filter(log => {
      const logDate = parseISO(log.created_at);
      return isWithinInterval(logDate, { start, end });
    });

    // Get safe foods
    const safeFoods = foods
      .filter(food => {
        const state = userFoodStates.find(s => s.food_id === food.id);
        return state?.status === 'SAFE';
      })
      .map(f => f.name);

    // Get ALL logs with food info (for complete feeding history)
    const allLogs = filteredLogs
      .map(log => {
        const state = userFoodStates.find(s => s.id === log.user_food_state_id);
        const food = foods.find(f => f.id === state?.food_id);
        return {
          id: log.id,
          created_at: log.created_at,
          reaction_severity: log.reaction_severity as 0 | 1 | 2,
          notes: log.notes || '',
          foodName: food?.name || 'Unknown',
          foodEmoji: food?.emoji || '🍽️',
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Get reaction logs only (for reaction details section)
    const reactionLogs = allLogs.filter(log => log.reaction_severity > 0);

    // Get allergen statuses
    const allergenStatuses = getAllergenFoods().map(allergen => ({
      name: allergen.name,
      emoji: allergen.emoji,
      status: (allergen.state?.status || 'TO_TRY') as 'SAFE' | 'TRYING' | 'REACTION' | 'TO_TRY',
      exposureCount: allergen.state?.exposure_count || 0,
    }));

    return { safeFoods, allLogs, reactionLogs, allergenStatuses };
  }, [logs, foods, userFoodStates, startDate, endDate, getAllergenFoods]);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      const doc = (
        <DoctorReportPDF
          babyName={profile?.baby_name || 'Baby'}
          startDate={startDate}
          endDate={endDate}
          safeFoods={reportData.safeFoods}
          allLogs={reportData.allLogs}
          reactionLogs={reportData.reactionLogs}
          allergenStatuses={reportData.allergenStatuses}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `${profile.baby_name}-allergy-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Generate Doctor's Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Date Range Presets */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Select Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              {presetRanges.map((preset, index) => (
                <motion.button
                  key={preset.label}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePresetSelect(index, preset.days)}
                  className={cn(
                    "p-3 rounded-xl border-2 text-sm font-medium transition-all",
                    selectedPreset === index && !showCustom
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:bg-accent/50"
                  )}
                >
                  {preset.label}
                </motion.button>
              ))}
            </div>
            
            {/* Custom Range Toggle */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCustom(!showCustom)}
              className={cn(
                "w-full p-3 rounded-xl border-2 text-sm font-medium transition-all",
                showCustom
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card hover:bg-accent/50"
              )}
            >
              Custom Range
            </motion.button>
          </div>

          {/* Custom Date Pickers */}
          {showCustom && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(startDate, 'MMM d')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(endDate, 'MMM d')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && setEndDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </motion.div>
          )}

          {/* Report Preview Summary */}
          <div className="p-4 bg-secondary/50 rounded-xl space-y-2">
            <p className="text-sm font-medium text-foreground">Report Summary</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>📅 {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}</p>
              <p>📋 {reportData.allLogs.length} feeding entries</p>
              <p>✅ {reportData.safeFoods.length} safe foods</p>
              <p>⚠️ {reportData.reactionLogs.length} reaction events</p>
              <p>🥜 {reportData.allergenStatuses.length} allergens tracked</p>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="w-full h-12"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download PDF Report
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
