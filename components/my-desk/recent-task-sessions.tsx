'use client';

import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { format, differenceInSeconds, isWithinInterval } from 'date-fns';
import { formatTime, getTimeInterval, type TimeRange } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

export function RecentTaskSessions() {
    const { taskSessions, tasks } = useTimeStore();
    const [timeRange, setTimeRange] = useState<TimeRange>('day');

    const filteredSessions = useMemo(() => {
        const interval = getTimeInterval(timeRange);
        return taskSessions
            .filter(session => isWithinInterval(new Date(session.startTime), interval))
            .sort((a, b) => b.startTime - a.startTime)
            .slice(0, 10);
    }, [taskSessions, timeRange]);

    return (
        <Card>
            <CardHeader>
                <div className='flex justify-between items-start'>
                    <div>
                        <CardTitle className='flex items-center gap-2'><History /> Recent Task Sessions</CardTitle>
                        <CardDescription>Your most recent time tracking activities.</CardDescription>
                    </div>
                    <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Day</SelectItem>
                            <SelectItem value="week">Week</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                 <Accordion type="single" collapsible className="w-full" defaultValue='item-1'>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>
                            <span className='font-semibold'>
                                {filteredSessions.length > 0 ? `View ${filteredSessions.length} sessions` : 'No task sessions for this period'}
                            </span>
                        </AccordionTrigger>
                        <AccordionContent>
                           {filteredSessions.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No time tracking sessions in this period.</p>
                            ) : (
                                <ul className="space-y-4 pt-2">
                                    {filteredSessions.map(session => {
                                        const task = tasks.find(t => t.id === session.taskId);
                                        const now = Date.now();
                                        const endTime = session.endTime ?? now;
                                        const duration = differenceInSeconds(endTime, session.startTime);

                                        return (
                                            <li key={session.id} className="border-b pb-3 last:border-b-0">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">{task?.description || 'Unknown Task'}</span>
                                                    <Badge variant="outline" className="font-mono">{formatTime(duration)}</Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {format(session.startTime, 'p')} - {session.endTime ? format(session.endTime, 'p') : 'Now'}
                                                </p>
                                                <p className='text-xs text-muted-foreground/70 font-mono mt-1'>
                                                    Session ID: {session.id}
                                                </p>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                 <Button asChild variant="outline" className="w-full mt-6">
                    <Link href="/tracking">View All Tracking Data <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </CardContent>
        </Card>
    );
}
