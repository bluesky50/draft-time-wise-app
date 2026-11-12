

'use client';

import { useState, useMemo } from 'react';
import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { UtilizationChangeSummary } from '../utilization-change-summary';
import { differenceInMinutes, parse, eachDayOfInterval, format, startOfDay, endOfDay, subDays, getDay } from 'date-fns';
import { calculateTimeSpentInInterval } from '@/lib/utils';
import type { UtilizationChange, SevenDayTimeSeriesData } from '@/lib/types';


const CustomizedDot = (props: any) => {
  const { cx, cy, stroke, payload, dataKey, successKey } = props;

  if (payload[successKey]) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={6} stroke={stroke} strokeWidth={2} fill="#fff" />
        <circle cx={cx} cy={cy} r={3} fill={stroke} />
      </g>
    );
  }

  return null;
};

interface UtilizationTrendChartProps {
    excludedOutcomeIds: string[];
}

export function UtilizationTrendChart({ excludedOutcomeIds }: UtilizationTrendChartProps) {
    const { workHours, personalHours, taskSessions, tasks } = useTimeStore();
    const [trendTimeRange, setTrendTimeRange] = useState<string>('7');

    const { timeSeriesData, utilizationChange } = useMemo(() => {
        const days = parseInt(trendTimeRange);
        const today = new Date();
        const startDate = startOfDay(subDays(today, days - 1));
        const interval = { start: startDate, end: endOfDay(today) };
        const daysInInterval = eachDayOfInterval(interval);

        let previousWorkPercent = 0;
        let previousPersonalPercent = 0;
        
        const workSuccessThreshold = personalHours.workTimeUtilizationSuccessThreshold || 80;
        const personalSuccessThreshold = personalHours.personalTimeUtilizationSuccessThreshold || 20;

        const excludedTaskIds = new Set(
            tasks.filter(t => excludedOutcomeIds.includes(t.outcomeId || '')).map(t => t.id)
        );
        const filteredSessions = taskSessions.filter(s => !excludedTaskIds.has(s.taskId));

        const timeSeries = daysInInterval.map(day => {
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
            const dailyTaskTimeMinutes = Math.round(dailyTaskTimeSeconds / 60);

            const utilizedWorkPercent = dailyWorkMinutes > 0 ? (dailyTaskTimeMinutes / dailyWorkMinutes) * 100 : 0;
            const utilizedPersonalPercent = dailyPersonalMinutesAvailable > 0 ? (dailyTaskTimeMinutes / dailyPersonalMinutesAvailable) * 100 : 0;
            
            const workChange = utilizedWorkPercent - previousWorkPercent;
            const personalChange = utilizedPersonalPercent - previousPersonalPercent;

            previousWorkPercent = utilizedWorkPercent;
            previousPersonalPercent = utilizedPersonalPercent;

            return {
                date: format(day, 'MMM d'),
                utilizedWorkPercent: utilizedWorkPercent > 100 ? 100 : utilizedWorkPercent,
                utilizedPersonalPercent: utilizedPersonalPercent > 100 ? 100 : utilizedPersonalPercent,
                workChange,
                personalChange,
                isWorkSuccess: utilizedWorkPercent >= workSuccessThreshold,
                isPersonalSuccess: utilizedPersonalPercent >= personalSuccessThreshold,
            };
        });

        const firstDay = timeSeries[0];
        const lastDay = timeSeries[timeSeries.length - 1];

        const workChange = lastDay.utilizedWorkPercent - firstDay.utilizedWorkPercent;
        const personalChange = lastDay.utilizedPersonalPercent - firstDay.utilizedPersonalPercent;

        const change: UtilizationChange = {
            work: {
                value: workChange.toFixed(1) + '%',
                type: workChange > 0.1 ? 'increase' : workChange < -0.1 ? 'decrease' : 'neutral',
            },
            personal: {
                value: personalChange.toFixed(1) + '%',
                type: personalChange > 0.1 ? 'increase' : personalChange < -0.1 ? 'decrease' : 'neutral',
            }
        }

        return { timeSeriesData: timeSeries, utilizationChange: change };
    }, [workHours, personalHours, taskSessions, tasks, excludedOutcomeIds, trendTimeRange]);

    return (
        <>
            <Card>
                <CardHeader>
                    <div className='flex justify-between items-center'>
                    <CardTitle>Time Utilization Trend</CardTitle>
                        <Select value={trendTimeRange} onValueChange={setTrendTimeRange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select time range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 Days</SelectItem>
                            <SelectItem value="30">Last 30 Days</SelectItem>
                            <SelectItem value="90">Last 90 Days</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                </CardHeader>
                <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={timeSeriesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} domain={[0, 100]} />
                            <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                            <Legend />
                            <Line type="monotone" dataKey="utilizedWorkPercent" stroke="#0088FE" name="Work Time %" dot={<CustomizedDot successKey="isWorkSuccess" />} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="utilizedPersonalPercent" stroke="#00C49F" name="Personal Time %" dot={<CustomizedDot successKey="isPersonalSuccess" />} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <UtilizationChangeSummary 
                utilizationChange={utilizationChange}
                timeSeriesData={timeSeriesData}
                timeRange={parseInt(trendTimeRange)}
            />
        </>
    );
}
