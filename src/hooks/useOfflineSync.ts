import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OfflineAction {
  id: string;
  type: 'LOG_FOOD' | 'UPDATE_LOG' | 'DELETE_LOG';
  payload: any;
  timestamp: number;
}

const OFFLINE_QUEUE_KEY = 'tinypalate-offline-queue';

export function useOfflineSync(userId: string | undefined, onSyncComplete?: () => void) {
  // Get pending actions from localStorage
  const getPendingActions = useCallback((): OfflineAction[] => {
    try {
      return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    } catch {
      return [];
    }
  }, []);

  // Save action to offline queue
  const queueAction = useCallback((action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
    const actions = getPendingActions();
    const newAction: OfflineAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    actions.push(newAction);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(actions));
    return newAction.id;
  }, [getPendingActions]);

  // Remove action from queue
  const removeAction = useCallback((actionId: string) => {
    const actions = getPendingActions();
    const filtered = actions.filter(a => a.id !== actionId);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
  }, [getPendingActions]);

  // Process a single action
  const processAction = useCallback(async (action: OfflineAction) => {
    if (!userId) return false;

    try {
      switch (action.type) {
        case 'LOG_FOOD': {
          const { foodId, stateId, status, exposureCount, severity, notes, lastEaten, isNewState } = action.payload;
          
          if (isNewState) {
            const { data } = await supabase
              .from('user_food_states')
              .insert({
                user_id: userId,
                food_id: foodId,
                status,
                exposure_count: exposureCount,
                last_eaten: lastEaten,
              })
              .select()
              .single();
            
            if (data) {
              await supabase.from('food_logs').insert({
                user_id: userId,
                user_food_state_id: data.id,
                reaction_severity: severity,
                notes,
              });
            }
          } else {
            await supabase
              .from('user_food_states')
              .update({
                status,
                exposure_count: exposureCount,
                last_eaten: lastEaten,
              })
              .eq('id', stateId);
            
            await supabase.from('food_logs').insert({
              user_id: userId,
              user_food_state_id: stateId,
              reaction_severity: severity,
              notes,
            });
          }
          break;
        }
        
        case 'UPDATE_LOG': {
          const { logId, updates } = action.payload;
          await supabase
            .from('food_logs')
            .update(updates)
            .eq('id', logId);
          break;
        }
        
        case 'DELETE_LOG': {
          const { logId } = action.payload;
          await supabase
            .from('food_logs')
            .delete()
            .eq('id', logId);
          break;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to process offline action:', error);
      return false;
    }
  }, [userId]);

  // Sync all pending actions
  const syncPendingActions = useCallback(async () => {
    const actions = getPendingActions();
    if (actions.length === 0) return;

    let successCount = 0;
    let failCount = 0;

    for (const action of actions) {
      const success = await processAction(action);
      if (success) {
        removeAction(action.id);
        successCount++;
      } else {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Synced ${successCount} offline change${successCount > 1 ? 's' : ''}`);
      onSyncComplete?.();
    }
    
    if (failCount > 0) {
      toast.error(`Failed to sync ${failCount} change${failCount > 1 ? 's' : ''}`);
    }
  }, [getPendingActions, processAction, removeAction, onSyncComplete]);

  // Auto-sync when coming back online
  useEffect(() => {
    const handleOnline = () => {
      syncPendingActions();
    };

    window.addEventListener('online', handleOnline);
    
    // Also sync on mount if online
    if (navigator.onLine) {
      syncPendingActions();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncPendingActions]);

  return {
    queueAction,
    getPendingActions,
    syncPendingActions,
    hasPendingActions: getPendingActions().length > 0,
  };
}
