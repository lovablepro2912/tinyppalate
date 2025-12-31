import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface NotificationPreferences {
  allergen_maintenance: boolean;
  allergen_progress: boolean;
  daily_reminder: boolean;
  daily_reminder_time: string;
  milestones: boolean;
  reaction_followup: boolean;
}

const defaultPrefs: NotificationPreferences = {
  allergen_maintenance: true,
  allergen_progress: true,
  daily_reminder: true,
  daily_reminder_time: '18:00:00',
  milestones: true,
  reaction_followup: true
};

const timeOptions = [
  { value: '07:00:00', label: '7:00 AM' },
  { value: '08:00:00', label: '8:00 AM' },
  { value: '09:00:00', label: '9:00 AM' },
  { value: '12:00:00', label: '12:00 PM' },
  { value: '17:00:00', label: '5:00 PM' },
  { value: '18:00:00', label: '6:00 PM' },
  { value: '19:00:00', label: '7:00 PM' },
  { value: '20:00:00', label: '8:00 PM' },
];

export function NotificationSettings() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPreferences>(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchPrefs = async () => {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setPrefs({
          allergen_maintenance: data.allergen_maintenance,
          allergen_progress: data.allergen_progress,
          daily_reminder: data.daily_reminder,
          daily_reminder_time: data.daily_reminder_time,
          milestones: data.milestones,
          reaction_followup: data.reaction_followup
        });
      }
      setLoading(false);
    };

    fetchPrefs();
  }, [user]);

  const updatePref = async (key: keyof NotificationPreferences, value: boolean | string) => {
    if (!user) return;

    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    setSaving(true);

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        ...newPrefs,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    setSaving(false);

    if (error) {
      toast.error('Failed to save preference');
      setPrefs(prefs); // Revert on error
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-3xl p-6 card-shadow animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  const settings = [
    {
      key: 'allergen_maintenance' as const,
      label: 'Allergen Maintenance',
      description: 'Remind when safe allergens need re-exposure'
    },
    {
      key: 'allergen_progress' as const,
      label: 'Allergen Progress',
      description: 'Updates on allergen introduction progress'
    },
    {
      key: 'milestones' as const,
      label: 'Milestone Celebrations',
      description: 'Celebrate food variety achievements'
    },
    {
      key: 'reaction_followup' as const,
      label: 'Reaction Follow-ups',
      description: 'Check-in after logging a reaction'
    }
  ];

  return (
    <motion.div
      className="bg-card rounded-3xl card-shadow overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Bell className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-foreground">Notifications</h3>
        {saving && <span className="text-xs text-muted-foreground ml-auto">Saving...</span>}
      </div>
      
      <div className="divide-y divide-border">
        {settings.map(setting => (
          <div key={setting.key} className="flex items-center justify-between px-4 py-3.5">
            <div className="flex-1 mr-4">
              <Label htmlFor={setting.key} className="font-medium text-foreground cursor-pointer">
                {setting.label}
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">{setting.description}</p>
            </div>
            <Switch
              id={setting.key}
              checked={prefs[setting.key]}
              onCheckedChange={(checked) => updatePref(setting.key, checked)}
            />
          </div>
        ))}

        {/* Daily Reminder with time picker */}
        <div className="px-4 py-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <Label htmlFor="daily_reminder" className="font-medium text-foreground cursor-pointer">
                Daily Logging Reminder
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Reminder to log foods if nothing logged today
              </p>
            </div>
            <Switch
              id="daily_reminder"
              checked={prefs.daily_reminder}
              onCheckedChange={(checked) => updatePref('daily_reminder', checked)}
            />
          </div>
          
          {prefs.daily_reminder && (
            <div className="flex items-center gap-2 pl-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Select
                value={prefs.daily_reminder_time}
                onValueChange={(value) => updatePref('daily_reminder_time', value)}
              >
                <SelectTrigger className="w-32 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
