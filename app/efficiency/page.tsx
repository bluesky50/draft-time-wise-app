'use client';

import { useState, useMemo } from 'react';
import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTimeInterval, type TimeRange } from '@/lib/utils';
import { differenceInMinutes, parse, eachDayOfInterval, startOfDay, endOfDay, getDay } from 'date-fns';
import { AlertCircle, Bed, Briefcase, CheckCircle, PieChart as PieChartIcon, Target } from 'lucide-react';
import { calculateTimeSpentInInterval } from '@/lib/utils';
import { StatCard } from '@/components/efficiency/stat-card';
import { UtilizationTrendChart } from '@/components/efficiency/charts/utilization-trend-chart';
import { UtilizationPieChart } from '@/components/efficiency/charts/utilization-pie-chart';
import { UtilizationDistributionChart } from '@/components/efficiency/charts/utilization-distribution-chart';
import { MultiSelect } from '@/components/ui/multi-select';

export default function EfficiencyPage() {
  const { workHours, personalHours, taskSessions, tasks, outcomes, desk, updateDesk } = useTimeStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  
  const outcomeOptions = useMemo(() => {
    return outcomes
      .filter(o => !o.completedDate)
      .map(o => ({
        value: o.id,
        label: o.title,
        icon: Target,
      }));
  }, [outcomes]);
  
  const { efficiencyStats } = useMemo(() => {
    const interval = getTimeInterval(timeRange);
    const daysInInterval = eachDayOfInterval(interval);

    let totalWorkMinutes = 0;
    let totalPersonalMinutesAvailable = 0;
    
    const excludedTaskIds = new Set(
        tasks.filter(t => desk.excludedOutcomeIdsForEfficiency.includes(t.outcomeId || '')).map(t => t.id)
    );

    const filteredSessions = taskSessions.filter(s => !excludedTaskIds.has(s.taskId));
    
    let totalTaskTimeSeconds = 0;
    
    daysInInterval.forEach(day => {
        const dayInterval = { start: startOfDay(day), end: endOfDay(day) };
        const isBusinessDay = workHours.workDays.includes(getDay(day));
        
        const dailyWorkMinutes = isBusinessDay ? differenceInMinutes(parse(workHours.end, 'HH:mm', day), parse(workHours.start, 'HH:mm', day)) : 0;
        
        let wakeTime = parse(personalHours.wake, 'HH:mm', day);
        let sleepTime = parse(personalHours.sleep, 'HH:mm', day);
        if (sleepTime <= wakeTime) {
            sleepTime.setDate(sleepTime.getDate() + 1);
        }
        const dailyPersonalMinutesAvailable = differenceInMinutes(sleepTime, wakeTime);

        const dailyTaskTimeSeconds = filteredSessions.reduce((total, session) => {
            return total + calculateTimeSpentInInterval(session.taskId, [session], dayInterval);
        }, 0);

        totalWorkMinutes += dailyWorkMinutes > 0 ? dailyWorkMinutes : 0;
        totalPersonalMinutesAvailable += dailyPersonalMinutesAvailable > 0 ? dailyPersonalMinutesAvailable : 0;
        totalTaskTimeSeconds += dailyTaskTimeSeconds;
    });

    const totalTaskTimeMinutes = Math.round(totalTaskTimeSeconds / 60);
    const workTimeNotUtilized = Math.max(0, totalWorkMinutes - totalTaskTimeMinutes);
    const personalTimeNotUtilized = Math.max(0, totalPersonalMinutesAvailable - totalTaskTimeMinutes);

    const workTimeUtilizedPercent = totalWorkMinutes > 0 ? (totalTaskTimeMinutes / totalWorkMinutes) * 100 : 0;
    
    const personalTimeUtilizedPercent = totalPersonalMinutesAvailable > 0 ? (totalTaskTimeMinutes / totalPersonalMinutesAvailable) * 100 : 0;

    const stats = {
      totalWorkMinutes,
      totalPersonalMinutes: totalPersonalMinutesAvailable,
      totalTaskTimeMinutes,
      workTimeNotUtilized,
      personalTimeNotUtilized,
      workTimeUtilizedPercent,
      personalTimeUtilizedPercent,
    };

    return { efficiencyStats: stats };
  }, [timeRange, workHours, personalHours, taskSessions, tasks, desk.excludedOutcomeIdsForEfficiency]);


  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PieChartIcon /> Efficiency Analysis</CardTitle>
          <CardDescription>Analyze how your tracked time compares to your available time.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <TabsList className="grid w-full max-w-lg grid-cols-4">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
              <div className='w-full max-w-sm'>
                <MultiSelect
                    options={outcomeOptions}
                    onValueChange={(ids) => updateDesk({ excludedOutcomeIdsForEfficiency: ids })}
                    defaultValue={desk.excludedOutcomeIdsForEfficiency}
                    placeholder="Exclude outcomes from calculation..."
                />
              </div>
            </div>
            <TabsContent value={timeRange} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <StatCard title="Total Work Time" value={`${Math.round(efficiencyStats.totalWorkMinutes / 60)}h`} icon={<Briefcase className="h-4 w-4 text-muted-foreground" />} description="Total available work hours in period" />
                    <StatCard title="Total Personal Time" value={`${Math.round(efficiencyStats.totalPersonalMinutes / 60)}h`} icon={<Bed className="h-4 w-4 text-muted-foreground" />} description="Total available wake hours in period" />
                    <StatCard title="Total Task Time" value={`${Math.round(efficiencyStats.totalTaskTimeMinutes / 60)}h`} icon={<CheckCircle className="h-4 w-4 text-green-500" />} description="Time tracked for tasks in period" />
                </div>
                
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <UtilizationPieChart
                        title="Work Time Utilization"
                        totalTimeMinutes={efficiencyStats.totalTaskTimeMinutes}
                        notUtilizedMinutes={efficiencyStats.workTimeNotUtilized}
                        utilizedPercent={efficiencyStats.workTimeUtilizedPercent}
                        successThreshold={personalHours.workTimeUtilizationSuccessThreshold}
                    />
                    <UtilizationPieChart
                        title="Personal Time Utilization"
                        description="Compares all your available waking hours to time spent on tasks."
                        totalTimeMinutes={efficiencyStats.totalTaskTimeMinutes}
                        notUtilizedMinutes={efficiencyStats.personalTimeNotUtilized}
                        utilizedPercent={efficiencyStats.personalTimeUtilizedPercent}
                        successThreshold={personalHours.personalTimeUtilizationSuccessThreshold}
                    />
                 </div>

                 <div className="grid grid-cols-1 gap-8 mt-8">
                    <UtilizationTrendChart excludedOutcomeIds={desk.excludedOutcomeIdsForEfficiency} />
                 </div>
                 
                 <div className="grid grid-cols-1 gap-8 mt-8">
                    <UtilizationDistributionChart excludedOutcomeIds={desk.excludedOutcomeIdsForEfficiency} />
                 </div>

                 <Card className="mt-8 bg-muted/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><AlertCircle className="h-5 w-5" /> A Note on "Unutilized" Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            "Unutilized" time simply means time that wasn't tracked against a specific task in this app. It could include breaks, meals, meetings, spontaneous activities, or anything else that's not logged as a task. It's not necessarily "wasted" time, but this visualization can help you see where your tracked efforts are going in relation to your total available time.
                        </p>
                    </CardContent>
                 </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
