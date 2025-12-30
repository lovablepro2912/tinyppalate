import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFoodContext } from '@/contexts/FoodContext';
import { Baby, Calendar, Trophy, TrendingUp, BookOpen } from 'lucide-react';
import { differenceInMonths, differenceInDays, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { OnboardingGuideSheet } from '@/components/onboarding/OnboardingGuideSheet';

export function ProfileTab() {
  const [guideOpen, setGuideOpen] = useState(false);
  const { profile, getTriedCount, getAllergenFoods, logs } = useFoodContext();
  
  const birthDate = new Date(profile.birth_date);
  const now = new Date();
  const monthsOld = differenceInMonths(now, birthDate);
  const daysOld = differenceInDays(now, birthDate);
  
  const triedCount = getTriedCount();
  const allergens = getAllergenFoods();
  const safeAllergens = allergens.filter(f => f.state?.status === 'SAFE').length;

  const stats = [
    { label: 'Foods Tried', value: triedCount, icon: Trophy, color: 'text-primary' },
    { label: 'Safe Allergens', value: `${safeAllergens}/9`, icon: TrendingUp, color: 'text-success' },
    { label: 'Total Logs', value: logs.length, icon: Calendar, color: 'text-warning' },
  ];

  return (
    <div className="pb-24 px-4">
      {/* Header */}
      <motion.div 
        className="pt-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
      </motion.div>

      {/* Baby Card */}
      <motion.div
        className="bg-card rounded-3xl p-6 card-shadow mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Baby className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{profile.baby_name}</h2>
            <p className="text-muted-foreground">
              {monthsOld} months old ({daysOld} days)
            </p>
            <p className="text-sm text-muted-foreground">
              Born {format(birthDate, 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-3 gap-3 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="bg-card rounded-2xl p-4 card-shadow text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Progress Summary */}
      <motion.div
        className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-bold text-foreground mb-2">Journey Progress</h3>
        <div className="relative h-4 bg-chart-background rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(triedCount / 100) * 100}%` }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {100 - triedCount} more foods until the 100 Foods milestone! 🎉
        </p>
      </motion.div>

      {/* View Guide Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <Button
          variant="outline"
          onClick={() => setGuideOpen(true)}
          className="w-full h-12 rounded-xl gap-2"
        >
          <BookOpen className="w-4 h-4" />
          View App Guide
        </Button>
      </motion.div>

      <OnboardingGuideSheet 
        open={guideOpen} 
        onOpenChange={setGuideOpen} 
        babyName={profile.baby_name}
      />
    </div>
  );
}
