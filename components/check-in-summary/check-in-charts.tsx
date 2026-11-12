
'use client';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';
import type { CheckIn, Sentiment } from '@/lib/types';
import type { TimeRange } from '@/lib/utils';

const POSITIVE_COLOR = '#22c55e'; // green-500
const NEGATIVE_COLOR = '#ef4444'; // red-500
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface CheckInChartsProps {
    filteredCheckIns: CheckIn[];
    sentiments: Sentiment[];
    timeRange: TimeRange;
}

export function CheckInCharts({ filteredCheckIns, sentiments, timeRange }: CheckInChartsProps) {

    const ratingTrendChartData = useMemo(() => {
        return filteredCheckIns.map(c => ({
          name: format(new Date(c.createdAt), 'MMM d'),
          rating: c.rating,
          type: c.type,
        }));
    }, [filteredCheckIns]);

    const sentimentChartData = useMemo(() => {
        const sentimentCounts: { [key: string]: number } = {};
        filteredCheckIns.forEach(c => {
          c.sentimentIds.forEach(sid => {
            const sentiment = sentiments.find(s => s.id === sid);
            if (sentiment) {
              sentimentCounts[sentiment.title] = (sentimentCounts[sentiment.title] || 0) + 1;
            }
          });
        });
        return Object.entries(sentimentCounts)
          .map(([name, value]) => ({ name, value }))
          .sort((a,b) => a.value - b.value);
    }, [filteredCheckIns, sentiments]);

    const checkInCountTrendData = useMemo(() => {
        const formatStr = timeRange === 'day' ? 'HH:00' : 'MMM d';
        const trendDataMap: { [key: string]: { positive: number, negative: number } } = {};
        filteredCheckIns.forEach(e => {
            const dateKey = format(new Date(e.createdAt), formatStr);
            if (!trendDataMap[dateKey]) {
                trendDataMap[dateKey] = { positive: 0, negative: 0 };
            }
            if (e.type === 'positive') {
              trendDataMap[dateKey].positive++;
            } else {
              trendDataMap[dateKey].negative++;
            }
        });
        return Object.entries(trendDataMap).map(([name, values]) => ({ name, ...values }));
    }, [filteredCheckIns, timeRange]);

    const ratingDistributionChartData = useMemo(() => {
        const data = Array.from({ length: 10 }, (_, i) => ({ rating: i + 1, positive: 0, negative: 0 }));
        filteredCheckIns.forEach(c => {
          if (c.rating >= 1 && c.rating <= 10) {
            if (c.type === 'positive') {
              data[c.rating - 1].positive++;
            } else {
              data[c.rating - 1].negative++;
            }
          }
        });
        return data;
    }, [filteredCheckIns]);


    return (
        <div className='space-y-8'>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Rating Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={ratingTrendChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis domain={[0, 10]} />
                            <Tooltip contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                            <Bar dataKey="rating" radius={[4, 4, 0, 0]}>
                                {ratingTrendChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.type === 'positive' ? POSITIVE_COLOR : NEGATIVE_COLOR} />
                                ))}
                            </Bar>
                        </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                    <Card>
                    <CardHeader>
                        <CardTitle>Most Common Sentiments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sentimentChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={sentimentChartData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={80} fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                            <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]}>
                                {sentimentChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        ) : (
                        <p className="text-muted-foreground text-center py-10">No sentiments recorded for this period.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Check-in Count Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={checkInCountTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis allowDecimals={false} />
                        <Tooltip contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                        <Legend />
                        <Line type="monotone" dataKey="positive" stroke={POSITIVE_COLOR} strokeWidth={2} name="Positive" />
                        <Line type="monotone" dataKey="negative" stroke={NEGATIVE_COLOR} strokeWidth={2} name="Negative" />
                    </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Rating Distribution</CardTitle>
                    <CardDescription>
                        Count of positive and negative check-ins for each rating level.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={ratingDistributionChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="rating" name="Rating" />
                            <YAxis />
                            <Tooltip contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                            <Legend />
                            <Bar dataKey="positive" fill={POSITIVE_COLOR} name="Positive" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="negative" fill={NEGATIVE_COLOR} name="Negative" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
