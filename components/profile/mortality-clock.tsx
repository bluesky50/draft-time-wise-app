'use client';

import { useMemo, useState, useEffect } from 'react';
import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeartPulse, Calendar, Moon, Sun, Bed, AlertTriangle } from 'lucide-react';
import { differenceInDays, differenceInMonths, differenceInYears, parse, parseISO, differenceInMinutes } from 'date-fns';
import Link from 'next/link';

const StatCard = ({ title, value, icon, unit }: { title: string; value: string | number; icon: React.ReactNode; unit?: string; }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {unit && <p className="text-xs text-muted-foreground">{unit}</p>}
        </CardContent>
    </Card>
);

export function MortalityClock() {
    const { personalHours } = useTimeStore();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const stats = useMemo(() => {
        const now = currentTime;
        let daysLeftMortality = 0, hoursBeforeSleepLeftMortality = 0, monthsLeftMortality = 0, yearsLeftMortality = 0;
        
        if (personalHours.deathDate) {
            const deathDate = parseISO(personalHours.deathDate);
            daysLeftMortality = differenceInDays(deathDate, now);
            monthsLeftMortality = differenceInMonths(deathDate, now);
            yearsLeftMortality = differenceInYears(deathDate, now);

            const wakeTime = parse(personalHours.wake, 'HH:mm', now);
            let sleepTime = parse(personalHours.sleep, 'HH:mm', now);

            if (sleepTime <= wakeTime) {
                sleepTime.setDate(sleepTime.getDate() + 1);
            }

            if (now < sleepTime) {
                const wakeMinutesPerDay = differenceInMinutes(sleepTime, wakeTime);
                const remainingWakeMinutesToday = differenceInMinutes(sleepTime, now);
                const totalRemainingWakeMinutes = (remainingWakeMinutesToday) + ((daysLeftMortality - 1) * wakeMinutesPerDay);
                hoursBeforeSleepLeftMortality = Math.floor(totalRemainingWakeMinutes / 60);
            } else {
                 const wakeMinutesPerDay = differenceInMinutes(sleepTime, wakeTime);
                 const totalRemainingWakeMinutes = (daysLeftMortality - 1) * wakeMinutesPerDay;
                 hoursBeforeSleepLeftMortality = Math.floor(totalRemainingWakeMinutes / 60);
            }
        }

        return { daysLeftMortality, hoursBeforeSleepLeftMortality, monthsLeftMortality, yearsLeftMortality };
    }, [currentTime, personalHours]);

    if (!personalHours.deathDate) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" /> Mortality Clock Inactive</CardTitle>
                    <CardDescription>Set your birth and estimated death dates to activate the clock.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        The mortality clock is a powerful tool for perspective. By setting your estimated end date, you can visualize the time you have left, encouraging you to make every moment count.
                    </p>
                    <Button asChild>
                        <Link href="/parameters">Set Dates in Parameters</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive"><HeartPulse className="h-5 w-5" /> Mortality Clock</CardTitle>
                <CardDescription>Time is finite. Make it count.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <StatCard title="Years Left" value={stats.yearsLeftMortality.toLocaleString()} icon={<Calendar className="h-4 w-4 text-muted-foreground" />} unit="years" />
                <StatCard title="Months Left" value={stats.monthsLeftMortality.toLocaleString()} icon={<Moon className="h-4 w-4 text-muted-foreground" />} unit="months" />
                <StatCard title="Days Left" value={stats.daysLeftMortality.toLocaleString()} icon={<Sun className="h-4 w-4 text-muted-foreground" />} unit="days" />
                <StatCard title="Wake Hours Left" value={stats.hoursBeforeSleepLeftMortality.toLocaleString()} icon={<Bed className="h-4 w-4 text-muted-foreground" />} unit="hours" />
            </CardContent>
        </Card>
    );
}