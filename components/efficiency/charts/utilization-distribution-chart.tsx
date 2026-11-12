

'use client';
import { useState, useMemo } from 'react';
import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from 'recharts';
import { differenceInMinutes, parse, eachDayOfInterval, startOfDay, endOfDay, subDays, getDay } from 'date-fns';
import { calculateTimeSpentInInterval } from '@/lib/utils';

interface UtilizationDistributionChartProps {
    excludedOutcomeIds: string[];
}

export function UtilizationDistributionChart({ excludedOutcomeIds }: UtilizationDistributionChartProps) {
    const { workHours, personalHours, taskSessions, tasks } = useTimeStore();
    const [distributionType, setDistributionType] = useState<'work' | 'personal'>('work');
    const [distributionTimeRange, setDistributionTimeRange] = useState<string>('30');
    
    const monthlyUtilizationDistribution = useMemo(() => {
        const today = new Date();
        const days = parseInt(distributionTimeRange);
        const startDate = startOfDay(subDays(today, days - 1));
        const interval = { start: startDate, end: endOfDay(today) };
        const daysInInterval = eachDayOfInterval(interval);

        const bins = Array.from({ length: 20 }, (_, i) => ({
            name: `${i * 5}-${i * 5 + 5}%`,
            days: 0,
            binStart: i*5,
        }));
        
        const excludedTaskIds = new Set(
            tasks.filter(t => excludedOutcomeIds.includes(t.outcomeId || '')).map(t => t.id)
        );
        const filteredSessions = taskSessions.filter(s => !excludedTaskIds.has(s.taskId));

        daysInInterval.forEach(day => {
            const dayInterval = { start: startOfDay(day), end: endOfDay(day) };
            
            let totalAvailableMinutes: number;
            if (distributionType === 'work') {
                if (!workHours.workDays.includes(getDay(day))) return; // Skip non-workdays for work
                totalAvailableMinutes = differenceInMinutes(parse(workHours.end, 'HH:mm', day), parse(workHours.start, 'HH:mm', day));
            } else {
                let wakeTime = parse(personalHours.wake, 'HH:mm', day);
                let sleepTime = parse(personalHours.sleep, 'HH:mm', day);
                if (sleepTime <= wakeTime) {
                    sleepTime.setDate(sleepTime.getDate() + 1);
                }
                totalAvailableMinutes = differenceInMinutes(sleepTime, wakeTime);
            }

            if (totalAvailableMinutes <= 0) return;

            const dailyTaskTimeSeconds = filteredSessions.reduce((total, session) => {
                return total + calculateTimeSpentInInterval(session.taskId, [session], dayInterval);
            }, 0);
            const dailyTaskTimeMinutes = Math.round(dailyTaskTimeSeconds / 60);
            const utilizationPercent = (dailyTaskTimeMinutes / totalAvailableMinutes) * 100;

            const binIndex = Math.min(Math.floor(utilizationPercent / 5), 19);
            if (bins[binIndex]) {
                bins[binIndex].days++;
            }
        });

        return bins;
    }, [workHours, personalHours, taskSessions, tasks, excludedOutcomeIds, distributionType, distributionTimeRange]);

    const successThreshold = distributionType === 'work' 
    ? personalHours.workTimeUtilizationSuccessThreshold || 80
    : personalHours.personalTimeUtilizationSuccessThreshold || 20;

    return (
        <Card>
            <CardHeader>
                <div className='flex justify-between items-center gap-4'>
                    <div>
                    <CardTitle>{distributionType === 'work' ? 'Work' : 'Personal'} Time Utilization Distribution (Last {distributionTimeRange} Days)</CardTitle>
                    <CardDescription>Number of days spent in each utilization percentage bracket. Bars above your success threshold ({successThreshold}%) are highlighted.</CardDescription>
                    </div>
                    <div className='flex gap-2'>
                    <Select value={distributionTimeRange} onValueChange={setDistributionTimeRange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select time range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 Days</SelectItem>
                            <SelectItem value="30">Last 30 Days</SelectItem>
                            <SelectItem value="90">Last 90 Days</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={distributionType} onValueChange={(value) => setDistributionType(value as 'work' | 'personal')}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select data type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="work">Work Time</SelectItem>
                            <SelectItem value="personal">Personal Time</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyUtilizationDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis allowDecimals={false} label={{ value: 'Number of Days', angle: -90, position: 'insideLeft' }} />
                        <Tooltip contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                        <Bar dataKey="days" name="Days" radius={[4, 4, 0, 0]}>
                            {monthlyUtilizationDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.binStart >= successThreshold ? 'hsl(var(--primary))' : '#8884d8'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
