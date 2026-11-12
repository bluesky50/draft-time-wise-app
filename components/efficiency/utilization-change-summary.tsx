
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from './stat-card';
import { Briefcase, Bed, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { DailyChange } from './daily-change';
import type { UtilizationChange, SevenDayTimeSeriesData } from '@/lib/types';

interface UtilizationChangeSummaryProps {
    utilizationChange: UtilizationChange;
    timeSeriesData: SevenDayTimeSeriesData[];
    timeRange: number;
}

export function UtilizationChangeSummary({ utilizationChange, timeSeriesData, timeRange }: UtilizationChangeSummaryProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Time Utilization Over Last {timeRange} Days</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <StatCard
                        title="Work Utilization Change"
                        value={utilizationChange.work.value}
                        icon={<Briefcase className="h-4 w-4" />}
                        change={utilizationChange.work.value}
                        changeType={utilizationChange.work.type}
                    />
                    <StatCard
                        title="Personal Utilization Change"
                        value={utilizationChange.personal.value}
                        icon={<Bed className="h-4 w-4" />}
                        change={utilizationChange.personal.value}
                        changeType={utilizationChange.personal.type}
                    />
                </div>
                <Separator className="my-6" />
                <div>
                    <h4 className="font-semibold mb-4">Daily Changes</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {timeSeriesData.map((day, index) => (
                        <div key={index} className="p-3 bg-muted/50 rounded-lg text-center">
                            <p className="text-sm font-bold">{day.date}</p>
                            <Separator className="my-2" />
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                        Work Util.
                                        {day.isWorkSuccess && <Star className="h-3 w-3 text-amber-400" />}
                                    </p>
                                    <p className="font-semibold">{day.utilizedWorkPercent.toFixed(1)}%</p>
                                    {index > 0 && <DailyChange change={day.workChange} type="work" />}
                                </div>
                                 <div>
                                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                       Personal Util.
                                       {day.isPersonalSuccess && <Star className="h-3 w-3 text-amber-400" />}
                                    </p>
                                    <p className="font-semibold">{day.utilizedPersonalPercent.toFixed(1)}%</p>
                                    {index > 0 && <DailyChange change={day.personalChange} type="personal" />}
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
