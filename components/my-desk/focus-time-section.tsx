'use client';
import { useState, useMemo } from 'react';
import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TaskTimeTracker } from '@/components/task-time-tracker';
import { Timer } from 'lucide-react';
import { formatTime, calculateTimeSpentInInterval, getTimeInterval, type TimeRange } from '@/lib/utils';
import type { Task } from '@/lib/types';

type FocusTaskFilter = 'all' | 'focused';

export function FocusTimeSection() {
    const { tasks, taskSessions, desk } = useTimeStore();
    const [focusTimeRange, setFocusTimeRange] = useState<TimeRange>('day');
    const [focusTaskFilter, setFocusTaskFilter] = useState<FocusTaskFilter>('focused');
    
    const timeInterval = useMemo((): Interval => {
        return getTimeInterval(focusTimeRange);
    }, [focusTimeRange]);

    const focusTasksWithTime = useMemo(() => {
         const allTasksWithTime = tasks.map(task => {
            const timeInInterval = calculateTimeSpentInInterval(task.id, taskSessions, timeInterval);
            return { task, timeInInterval };
        }).filter(item => item.timeInInterval > 0);

        if (focusTaskFilter === 'focused' && desk.selectedOutcomes.length > 0) {
            return allTasksWithTime.filter(item => 
                item.task.outcomeId && desk.selectedOutcomes.includes(item.task.outcomeId)
            );
        }
        
        return allTasksWithTime;
    }, [tasks, taskSessions, timeInterval, focusTaskFilter, desk.selectedOutcomes]);

    const focusTimeTracked = useMemo(() => {
        return focusTasksWithTime.reduce((total, item) => total + item.timeInInterval, 0);
    }, [focusTasksWithTime]);

    return (
        <Card className="bg-primary/10 border-primary/50">
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <CardTitle className='flex items-center gap-2'><Timer /> Focus Time</CardTitle>
                    <CardDescription>Total time tracked for your tasks based on current filters.</CardDescription>
                </div>
                <div className='flex flex-col sm:flex-row gap-4'>
                    <Select value={focusTaskFilter} onValueChange={(value) => setFocusTaskFilter(value as FocusTaskFilter)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter tasks" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="focused" disabled={desk.selectedOutcomes.length === 0}>Focused Tasks</SelectItem>
                        <SelectItem value="all">All Tasks</SelectItem>
                    </SelectContent>
                    </Select>
                    <Select value={focusTimeRange} onValueChange={(value) => setFocusTimeRange(value as TimeRange)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="year">Year</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold text-primary">{formatTime(focusTimeTracked)}</div>
                {focusTasksWithTime.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full mt-4">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Show Breakdown</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-2 pt-2">
                                    {focusTasksWithTime.map(({ task, timeInInterval }) => (
                                        <div key={task.id} className='p-2 bg-background/50 rounded-md'>
                                            <TaskTimeTracker task={task} overrideTimeSpent={timeInInterval} />
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                ) : (
                    <p className="text-sm text-muted-foreground mt-2">No time tracked for the selected filters.</p>
                )}
            </CardContent>
        </Card>
    );
}
