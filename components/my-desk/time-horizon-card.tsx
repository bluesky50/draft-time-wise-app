'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock, Briefcase } from 'lucide-react';
import type { Stats } from '@/lib/types';
import { Separator } from '../ui/separator';

interface TimeHorizonCardProps {
    stats: Stats;
}

export function TimeHorizonCard({ stats }: TimeHorizonCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Time Horizons</CardTitle>
                <CardDescription>An overview of your available time for the week and month.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Briefcase className='h-4 w-4 text-muted-foreground' /> Work Time</h4>
                    <div className="flex justify-between items-center text-sm">
                        <p className="font-medium">Left This Week</p>
                        <span className="font-bold text-primary">{stats.workHoursLeftWeek}h ({stats.workHoursLeftWeekPercent.toFixed(0)}%)</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <p className="font-medium">Left This Month</p>
                        <span className="font-bold text-primary">{stats.workHoursLeftMonth}h ({stats.workHoursLeftMonthPercent.toFixed(0)}%)</span>
                    </div>
                </div>
                <Separator />
                 <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Clock className='h-4 w-4 text-muted-foreground' /> Personal Time</h4>
                    <div className="flex justify-between items-center text-sm">
                        <p className="font-medium">Wake Hours Left in Week</p>
                        <span className="font-bold text-primary">{stats.personalHoursLeftWeek}h ({stats.personalHoursLeftWeekPercent.toFixed(0)}%)</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <p className="font-medium">Wake Hours Left in Month</p>
                        <span className="font-bold text-primary">{stats.personalHoursLeftMonth}h ({stats.personalHoursLeftMonthPercent.toFixed(0)}%)</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
