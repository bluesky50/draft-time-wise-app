'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import type { Stats } from '@/lib/types';

interface TimeframeCardsProps {
    stats: Stats;
}

export function TimeframeCards({ stats }: TimeframeCardsProps) {
    return (
        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" /> Timelines</CardTitle>
            <CardDescription>An overview of time remaining.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <p className="font-medium">Days Left in Week</p>
                    <span className="font-bold text-primary">{stats.daysLeftInWeek}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <p className="font-medium">Days Left in Month</p>
                    <span className="font-bold text-primary">{stats.daysLeftInMonth}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <p className="font-medium">Days Left in Year</p>
                    <span className="font-bold text-primary">{stats.daysLeftInYear}</span>
                </div>
            </CardContent>
        </Card>
    );
}
