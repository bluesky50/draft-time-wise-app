'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDuration } from '@/lib/utils';
import { AlertTriangle, Bed, Briefcase, CheckCircle2, Clock } from 'lucide-react';
import type { Stats } from '@/lib/types';

const StatCard = ({ title, value, icon, unit, progress, totalDuration, warning }: { title: string; value: string | number; icon: React.ReactNode; unit?: string; progress?: number, totalDuration?: string, warning?: string }) => (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{unit}{totalDuration && ` of ${totalDuration}`}</p>
        {progress !== undefined && <Progress value={progress} className="mt-2 h-2" />}
      </CardContent>
       {warning && (
          <TooltipProvider>
              <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute top-2 right-2 p-1 bg-amber-500/20 text-amber-500 rounded-full">
                        <AlertTriangle className="h-4 w-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                      <p className="font-semibold">{warning}</p>
                  </TooltipContent>
              </Tooltip>
           </TooltipProvider>
        )}
    </Card>
  );

interface DeskStatsGridProps {
    stats: Stats;
}

export function DeskStatsGrid({ stats }: DeskStatsGridProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            title="Time Left in Work Day" 
            value={stats.isPastWorkTime ? "0h" : formatDuration(stats.minutesLeftWork)}
            icon={<Briefcase className="h-4 w-4 text-muted-foreground" />} 
            unit="remaining" 
            progress={stats.workProgress} 
            totalDuration={stats.totalWorkDuration}
            warning={stats.isPastWorkTime ? "Work day has ended" : undefined}
        />
        <StatCard 
            title="Time Before Sleep" 
            value={stats.isPastSleepTime ? "0h" : formatDuration(stats.minutesBeforeSleep)}
            icon={<Bed className="h-4 w-4 text-muted-foreground" />} 
            unit="remaining"
            progress={stats.personalProgress} 
            totalDuration={stats.totalPersonalDuration}
            warning={stats.isPastSleepTime ? "It's past your bedtime" : undefined}
        />
        <StatCard title="Task Time Tracked Today" value={stats.timeSpentToday} icon={<Clock className="h-4 w-4 text-muted-foreground" />} />
        <div className="relative">
          <StatCard title="Remaining Task Time" value={stats.remainingTaskTime} icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />} />
          {stats.isOverloaded && (
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute top-2 right-2 p-1 bg-destructive/20 text-destructive rounded-full">
                          <AlertTriangle className="h-4 w-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="font-semibold">Workload Warning</p>
                        <p>Remaining task time ({formatDuration(stats.remainingTaskTimeMinutes)}) exceeds your threshold of {formatDuration(Math.round(stats.workDayCapacityMinutes))}.</p>
                    </TooltipContent>
                </Tooltip>
             </TooltipProvider>
          )}
        </div>
      </div>
    )
}
