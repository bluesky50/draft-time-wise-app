'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTimeStore } from '@/context/time-store-context';
import { Clock, Calendar, Sun, Moon } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { differenceInDays, endOfWeek, endOfMonth, endOfYear, parse } from 'date-fns';

const StatCard = ({ title, value, icon, unit }: { title: string, value: string, icon: React.ReactNode, unit: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{unit}</p>
    </CardContent>
  </Card>
);

export function TaskStats() {
  const { tasks, workHours } = useTimeStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const totalTaskTimeMinutes = useMemo(() => 
    tasks.filter(t => !t.completed).reduce((sum, task) => sum + task.estimatedTime, 0),
    [tasks]
  );
  
  const stats = useMemo(() => {
    const now = currentTime;
    const workStartTime = parse(workHours.start, 'HH:mm', now);
    const workEndTime = parse(workHours.end, 'HH:mm', now);

    let hoursLeftToday = 0;
    if (now >= workStartTime && now <= workEndTime) {
      const totalWorkMinutes = (workEndTime.getTime() - workStartTime.getTime()) / (1000 * 60);
      const elapsedMinutes = (now.getTime() - workStartTime.getTime()) / (1000 * 60);
      const remainingWorkMinutes = totalWorkMinutes - elapsedMinutes;
      const availableMinutes = remainingWorkMinutes - totalTaskTimeMinutes;
      hoursLeftToday = availableMinutes > 0 ? availableMinutes / 60 : 0;
    } else if (now < workStartTime) {
      const totalWorkMinutes = (workEndTime.getTime() - workStartTime.getTime()) / (1000 * 60);
      const availableMinutes = totalWorkMinutes - totalTaskTimeMinutes;
      hoursLeftToday = availableMinutes > 0 ? availableMinutes / 60 : 0;
    }

    const daysLeftInWeek = differenceInDays(endOfWeek(now, { weekStartsOn: 1 }), now);
    const daysLeftInMonth = differenceInDays(endOfMonth(now), now);
    const daysLeftInYear = differenceInDays(endOfYear(now), now);
    
    return {
      hoursLeftToday: hoursLeftToday.toFixed(1),
      daysLeftInWeek,
      daysLeftInMonth,
      daysLeftInYear,
    }
  }, [currentTime, workHours, totalTaskTimeMinutes]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Hours Left in Work Day" 
        value={stats.hoursLeftToday} 
        unit="Available hours for new tasks"
        icon={<Clock className="h-4 w-4 text-muted-foreground" />} 
      />
      <StatCard 
        title="Days Left in Week" 
        value={String(stats.daysLeftInWeek)} 
        unit="Days remaining"
        icon={<Calendar className="h-4 w-4 text-muted-foreground" />} 
      />
      <StatCard 
        title="Days Left in Month" 
        value={String(stats.daysLeftInMonth)} 
        unit="Days remaining"
        icon={<Moon className="h-4 w-4 text-muted-foreground" />} 
      />
      <StatCard 
        title="Days Left in Year" 
        value={String(stats.daysLeftInYear)} 
        unit="Days remaining"
        icon={<Sun className="h-4 w-4 text-muted-foreground" />} 
      />
    </div>
  );
}
