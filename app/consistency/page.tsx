
'use client';
import { useMemo } from 'react';
import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { eachDayOfInterval, startOfWeek, endOfWeek, format, isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, differenceInSeconds } from 'date-fns';
import { cn } from '@/lib/utils';
import { GitCommitVertical, Calendar, Clock, Flame, Activity } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Task } from '@/lib/types';
import { calculateTimeSpentInInterval } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0 || hours === 0) result += `${minutes}m`;
    return result.trim() || '0m';
};

const getColorClass = (value: number, threshold: number) => {
  if (value === 0) return 'bg-muted/50';
  if (value < threshold / 4) return 'bg-green-200 dark:bg-green-900';
  if (value < threshold / 2) return 'bg-green-300 dark:bg-green-800';
  if (value < threshold) return 'bg-green-400 dark:bg-green-700';
  if (value < threshold * 1.5) return 'bg-green-500 dark:bg-green-600';
  return 'bg-green-600 dark:bg-green-500';
};

const StatCard = ({ title, value, unit, icon, description }: { title: string; value: number; unit: string; icon: React.ReactNode, description: string }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center justify-between">
          <span>{title}</span>
          {icon}
        </CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
);

export default function ConsistencyPage() {
  const { tasks, personalHours, taskSessions } = useTimeStore();

  const thresholdSeconds = useMemo(() => {
    // This is a simplified threshold for display. A more robust solution might consider daily variations.
    // For now, we'll use a fixed daily goal for consistency visualization.
    const averageWorkDayHours = 8;
    const thresholdPercent = personalHours.taskTimeWarningThreshold || 80;
    return (averageWorkDayHours * 3600) * (thresholdPercent / 100);
  }, [personalHours]);
  
  const allTimeData = useMemo(() => {
    if (taskSessions.length === 0) return [];
    
    const timeByDay: { [key: string]: number } = {};
    
    taskSessions.forEach(session => {
        const sessionStart = new Date(session.startTime);
        const sessionEnd = new Date(session.endTime || Date.now());

        const daysSpanned = eachDayOfInterval({ start: startOfDay(sessionStart), end: startOfDay(sessionEnd) });

        daysSpanned.forEach(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayInterval = { start: startOfDay(day), end: endOfDay(day) };
            const durationOnDay = calculateTimeSpentInInterval(session.taskId, [session], dayInterval);
            timeByDay[dayKey] = (timeByDay[dayKey] || 0) + durationOnDay;
        });
    });

    return Object.entries(timeByDay).map(([date, totalValue]) => ({
      date,
      totalValue,
      exceededThreshold: totalValue > thresholdSeconds
    }));

  }, [taskSessions, thresholdSeconds]);
  
  const summaryStats = useMemo(() => {
    const today = new Date();
    const weekInterval = { start: startOfWeek(today, { weekStartsOn: 1 }), end: endOfWeek(today, { weekStartsOn: 1 }) };
    const monthInterval = { start: startOfMonth(today), end: endOfMonth(today) };
    const yearInterval = { start: startOfYear(today), end: endOfYear(today) };

    const daysOverInWeek = allTimeData.filter(d => isWithinInterval(new Date(d.date), weekInterval) && d.exceededThreshold).length;
    const daysOverInMonth = allTimeData.filter(d => isWithinInterval(new Date(d.date), monthInterval) && d.exceededThreshold).length;
    
    const activeDaysInWeek = allTimeData.filter(d => isWithinInterval(new Date(d.date), weekInterval) && d.totalValue > 0).length;
    const activeDaysInYear = allTimeData.filter(d => isWithinInterval(new Date(d.date), yearInterval) && d.totalValue > 0).length;
    
    return { daysOverInWeek, daysOverInMonth, activeDaysInWeek, activeDaysInYear };
  }, [allTimeData]);

  const weekData = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
    const weekDays = eachDayOfInterval({ start, end });

    return weekDays.map(day => {
        const dayInterval = { start: startOfDay(day), end: endOfDay(day) };
        
        const tasksWithTimeOnDay = tasks
            .map(task => {
                const timeOnDay = calculateTimeSpentInInterval(task.id, taskSessions, dayInterval);
                return { ...task, timeSpentOnDay: timeOnDay };
            })
            .filter(task => task.timeSpentOnDay > 0);
        
        const totalValue = tasksWithTimeOnDay.reduce((sum, task) => sum + task.timeSpentOnDay, 0);

        return {
            date: format(day, 'yyyy-MM-dd'),
            dayName: format(day, 'E'),
            value: totalValue,
            tasks: tasksWithTimeOnDay,
            exceededThreshold: totalValue > thresholdSeconds,
        };
    });
  }, [tasks, taskSessions, thresholdSeconds]);

  const totalWeekTime = useMemo(() => weekData.reduce((sum, day) => sum + day.value, 0), [weekData]);

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Consistency</CardTitle>
          <CardDescription>Your time tracking activity and consistency over time.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            {tasks.length > 0 ? (
                <div className='w-full space-y-8'>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Active Days" value={summaryStats.activeDaysInWeek} unit="this week" description="Days with any tracked time." icon={<Activity className="h-4 w-4 text-muted-foreground" />} />
                        <StatCard title="Hot Streak" value={summaryStats.daysOverInWeek} unit="days this week" description="Days exceeding your time goal." icon={<Flame className="h-4 w-4 text-muted-foreground" />} />
                        <StatCard title="Monthly Goal" value={summaryStats.daysOverInMonth} unit="days this month" description="Days exceeding goal this month." icon={<Calendar className="h-4 w-4 text-muted-foreground" />} />
                        <StatCard title="Yearly Active Days" value={summaryStats.activeDaysInYear} unit="in total" description="All days with activity this year." icon={<GitCommitVertical className="h-4 w-4 text-muted-foreground" />} />
                    </div>

                    <Separator />
                    
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                            <h3 className="text-lg font-semibold">This Week's Activity</h3>
                             <div className="text-center sm:text-right">
                                <p className="text-sm text-muted-foreground">Total time tracked this week</p>
                                <p className="text-2xl font-bold text-primary">{formatDuration(totalWeekTime)}</p>
                            </div>
                        </div>
                        <TooltipProvider>
                            <div className="flex justify-around items-end gap-2 p-4 rounded-lg bg-muted/30">
                                {weekData.map(day => (
                                    <Tooltip key={day.date} delayDuration={100}>
                                    <TooltipTrigger asChild>
                                        <div className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                                            <div className="relative w-full h-10 rounded bg-muted overflow-hidden">
                                                <div 
                                                    className={cn('h-full rounded transition-all duration-500', getColorClass(day.value, thresholdSeconds))} 
                                                    style={{ width: `${Math.min(100, (day.value / thresholdSeconds) * 100)}%`}}
                                                />
                                            </div>
                                            <p className="text-xs font-medium text-muted-foreground group-hover:text-primary">{day.dayName}</p>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-sm font-medium">{format(new Date(day.date), 'PPP')}</p>
                                        <p className="text-xs text-muted-foreground">{formatDuration(day.value)} tracked</p>
                                        {day.exceededThreshold && <p className="text-xs text-amber-500 font-semibold mt-1">Goal exceeded!</p>}
                                    </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </TooltipProvider>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4 self-start">
                            <span>Less</span>
                            <div className="h-3 w-3 rounded-sm bg-muted/50" />
                            <div className="h-3 w-3 rounded-sm bg-green-200 dark:bg-green-900" />
                            <div className="h-3 w-3 rounded-sm bg-green-400 dark:bg-green-700" />
                            <div className="h-3 w-3 rounded-sm bg-green-600 dark:bg-green-500" />
                            <span>More</span>
                        </div>
                    </div>
                    
                    <Accordion type="single" collapsible className="w-full">
                       <AccordionItem value="item-1">
                            <AccordionTrigger>
                                <h3 className='font-semibold'>Daily Task Breakdown</h3>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-6 pt-4">
                                {weekData.filter(day => day.tasks.length > 0).map(day => (
                                    <div key={day.date}>
                                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                                            <Calendar className='h-4 w-4 text-muted-foreground' />
                                            {format(new Date(day.date), 'EEEE, MMMM d')}
                                            {day.exceededThreshold && (
                                                <span className="flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">
                                                    <Flame className="h-3 w-3"/>
                                                    <span>Goal Exceeded</span>
                                                </span>
                                            )}
                                        </h4>
                                        <ul className="space-y-2 pl-4 border-l-2 ml-2">
                                        {(day.tasks as (Task & { timeSpentOnDay: number })[]).map(task => (
                                            <li key={task.id} className="flex justify-between items-center text-sm py-1">
                                                <span className="text-muted-foreground">{task.description}</span>
                                                <div className="font-semibold flex items-center gap-2">
                                                    <Clock className='h-4 w-4 text-primary/70' />
                                                    {formatDuration(task.timeSpentOnDay)}
                                                </div>
                                            </li>
                                        ))}
                                        </ul>
                                    </div>
                                ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            ) : (
                 <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
                  <GitCommitVertical className="h-16 w-16 text-muted-foreground/30" />
                  <p className="font-medium">No time tracked yet.</p>
                  <p className="text-sm">Start tracking tasks to see your consistency.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </main>
  );
}
