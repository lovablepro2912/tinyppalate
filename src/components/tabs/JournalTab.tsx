import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Check, AlertTriangle, Siren, Search, X, FileText, ShieldAlert } from 'lucide-react';
import { useFoodContext } from '@/contexts/FoodContext';
import { FoodLog, RefFood } from '@/types/food';
import { EditLogModal } from '@/components/EditLogModal';
import { ReportModal } from '@/components/ReportModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LogWithFood extends FoodLog {
  food: RefFood;
}

interface GroupedLogs {
  [date: string]: LogWithFood[];
}

function formatDateHeader(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEE, MMM d');
}

function formatTime(dateStr: string): string {
  return format(parseISO(dateStr), 'h:mm a');
}

export function JournalTab() {
  const { logs, userFoodStates, foods } = useFoodContext();
  const [selectedLog, setSelectedLog] = useState<LogWithFood | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  // Get all logs with food data
  const logsWithFood = useMemo(() => {
    return logs
      .map(log => {
        const state = userFoodStates.find(s => s.id === log.user_food_state_id);
        const food = foods.find(f => f.id === state?.food_id);
        if (!food) return null;
        return { ...log, food };
      })
      .filter((log): log is LogWithFood => log !== null)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [logs, userFoodStates, foods]);

  // Filter logs by search query
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logsWithFood;
    const query = searchQuery.toLowerCase().trim();
    return logsWithFood.filter(log => 
      log.food.name.toLowerCase().includes(query)
    );
  }, [logsWithFood, searchQuery]);

  // Group filtered logs by date
  const groupedLogs = useMemo(() => {
    return filteredLogs.reduce<GroupedLogs>((groups, log) => {
      const dateKey = format(parseISO(log.created_at), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(log);
      return groups;
    }, {});
  }, [filteredLogs]);

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="pb-24 pt-4">
      {/* Header */}
      <div className="px-4 mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Food Journal</h1>
          <p className="text-muted-foreground text-sm">
            {logsWithFood.length} {logsWithFood.length === 1 ? 'entry' : 'entries'} logged
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowReportModal(true)}
          className="rounded-full"
          title="Generate Report"
        >
          <FileText className="w-5 h-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search foods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
            maxLength={100}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4">
        {sortedDates.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? (
              <>
                <p className="text-lg">No results for "{searchQuery}"</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </>
            ) : (
              <>
                <p className="text-lg">No entries yet</p>
                <p className="text-sm mt-1">Start logging foods to see your journal</p>
              </>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {sortedDates.map((dateKey, dateIndex) => (
              <motion.div
                key={dateKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dateIndex * 0.05 }}
                className="mb-6"
              >
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-semibold text-foreground">
                    {formatDateHeader(dateKey)}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Log Cards */}
                <div className="space-y-2">
                  {groupedLogs[dateKey].map((log, logIndex) => (
                    <motion.button
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: dateIndex * 0.05 + logIndex * 0.03 }}
                      onClick={() => setSelectedLog(log)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-xl transition-all",
                        "bg-card border border-border hover:bg-accent/50",
                        log.reaction_severity === 1 && "bg-warning/10 border-warning/30",
                        log.reaction_severity === 2 && "bg-danger/20 border-danger/50"
                      )}
                    >
                      {/* Food Icon */}
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                        {log.food.emoji}
                      </div>

                      {/* Food Name & Time */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{log.food.name}</p>
                          {log.food.is_allergen && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                              <ShieldAlert className="w-2.5 h-2.5" />
                              Allergen
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{formatTime(log.created_at)}</p>
                      </div>

                      {/* Status Badge - Dynamic based on reaction_severity */}
                      <div>
                        {log.reaction_severity === 2 ? (
                          // Severe - Dominant filled red badge
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-danger text-white shadow-md">
                            <Siren className="w-3.5 h-3.5" />
                            Severe
                          </span>
                        ) : log.reaction_severity === 1 ? (
                          // Mild - Yellow/Orange badge
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning border border-warning/30">
                            <AlertTriangle className="w-3 h-3" />
                            Mild
                          </span>
                        ) : (
                          // Safe - Subtle green badge
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-safe border border-safe/30 bg-safe/10">
                            <Check className="w-3 h-3" />
                            Safe
                          </span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Edit Log Modal */}
      <EditLogModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
}
