
'use client';

import { useState, useMemo } from 'react';
import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gavel, BarChart2 } from 'lucide-react';
import { isWithinInterval } from 'date-fns';
import { getTimeInterval, type TimeRange } from '@/lib/utils';
import { CheckInFilters, type TypeFilter } from '@/components/check-in-summary/check-in-filters';
import { CheckInStatCards } from '@/components/check-in-summary/check-in-stat-cards';
import { CheckInCharts } from '@/components/check-in-summary/check-in-charts';
import { RecentCheckInsTable } from '@/components/check-in-summary/recent-check-ins-table';
import type { CheckIn } from '@/lib/types';


export default function CheckInSummaryPage() {
  const { checkIns, sentiments } = useTimeStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [ratingFilter, setRatingFilter] = useState({ min: 1, max: 10 });
  const [sentimentFilter, setSentimentFilter] = useState<string[]>([]);

  const filteredCheckIns = useMemo(() => {
    const interval = getTimeInterval(timeRange);

    return checkIns
      .filter(c => {
        const sentimentMatch = sentimentFilter.length === 0 || c.sentimentIds.some(sid => sentimentFilter.includes(sid));

        return isWithinInterval(new Date(c.createdAt), interval) &&
        (typeFilter === 'all' || c.type === typeFilter) &&
        (c.rating >= ratingFilter.min && c.rating <= ratingFilter.max) &&
        sentimentMatch;
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [timeRange, checkIns, typeFilter, ratingFilter, sentimentFilter]);

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Check-in Summary</CardTitle>
          <CardDescription>Analyze your check-in trends and sentiments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
            <TabsContent value={timeRange} className="mt-6">
                
                <CheckInFilters 
                    typeFilter={typeFilter}
                    onTypeFilterChange={setTypeFilter}
                    ratingFilter={ratingFilter}
                    onRatingFilterChange={setRatingFilter}
                    sentiments={sentiments}
                    sentimentFilter={sentimentFilter}
                    onSentimentFilterChange={setSentimentFilter}
                />

                {filteredCheckIns.length === 0 ? (
                    <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
                        <BarChart2 className="h-16 w-16 text-muted-foreground/30" />
                        <p className="font-medium">No check-ins found for the selected filters.</p>
                    </div>
                ) : (
                <div className="space-y-8 mt-8">
                    <CheckInStatCards filteredCheckIns={filteredCheckIns} />

                    <CheckInCharts
                        filteredCheckIns={filteredCheckIns}
                        sentiments={sentiments}
                        timeRange={timeRange}
                    />

                    <RecentCheckInsTable filteredCheckIns={filteredCheckIns} />
                </div>
                )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
