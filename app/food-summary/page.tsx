
'use client';

import { useState, useMemo } from 'react';
import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Utensils,
  TrendingUp,
  Pizza,
  History,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { isWithinInterval, format } from 'date-fns';
import { getTimeInterval, type TimeRange } from '@/lib/utils';
import type { Food, FoodSession } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];


export default function FoodSummaryPage() {
  const { foodSessions, foods } = useTimeStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const filteredSessions = useMemo(() => {
    const interval = getTimeInterval(timeRange);

    return foodSessions
      .filter(e => isWithinInterval(new Date(e.eatDate), interval))
      .sort((a, b) => new Date(a.eatDate).getTime() - new Date(b.eatDate).getTime());
  }, [timeRange, foodSessions]);

  const {
    stats,
    trendChartData,
    categoryChartData,
    typeChartData,
    topFoods
  } = useMemo(() => {
    const totalSessions = filteredSessions.length;
    
    const foodCounts: Record<string, number> = {};
    filteredSessions.forEach(session => {
        foodCounts[session.foodId] = (foodCounts[session.foodId] || 0) + 1;
    });

    const uniqueFoods = Object.keys(foodCounts).length;
    
    const mostEatenFoodId = Object.keys(foodCounts).reduce((a, b) => foodCounts[a] > foodCounts[b] ? a : b, '');
    const mostEatenFood = foods.find(f => f.id === mostEatenFoodId)?.title || 'N/A';
    
    const stats = {
      totalSessions,
      uniqueFoods,
      mostEatenFood,
    };

    const formatStr = 'HH:00';
    const trendDataMap: { [key: string]: number } = {};
    filteredSessions.forEach(e => {
        const dateKey = format(new Date(e.eatDate), formatStr);
        trendDataMap[dateKey] = (trendDataMap[dateKey] || 0) + 1;
    });
    const trendChartData = Object.entries(trendDataMap).map(([name, count]) => ({ name, count })).sort((a,b) => a.name.localeCompare(b.name));

    const categoryCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};

    filteredSessions.forEach(session => {
        const food = foods.find(f => f.id === session.foodId);
        if (food) {
            categoryCounts[food.category] = (categoryCounts[food.category] || 0) + 1;
            typeCounts[food.type] = (typeCounts[food.type] || 0) + 1;
        }
    });

    const categoryChartData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
    const typeChartData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
    
    const topFoods = Object.entries(foodCounts).map(([foodId, count]) => {
        const food = foods.find(f => f.id === foodId);
        return {
            id: foodId,
            title: food?.title || 'Unknown Food',
            count
        }
    }).sort((a,b) => b.count - a.count).slice(0, 10);


    return { stats, trendChartData, categoryChartData, typeChartData, topFoods };

  }, [filteredSessions, foods, timeRange]);

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Food Summary</CardTitle>
          <CardDescription>Analyze your eating habits over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <div className='flex justify-between items-center'>
              <TabsList className="grid w-full max-w-sm grid-cols-3">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value={timeRange} className="mt-6">
                {filteredSessions.length === 0 ? (
                    <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
                        <Utensils className="h-16 w-16 text-muted-foreground/30" />
                        <p className="font-medium">No food sessions found for this period.</p>
                        <p className="text-sm">Log some food sessions to see your summary!</p>
                    </div>
                ) : (
                <div className="space-y-8">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <StatCard title="Total Sessions" value={stats.totalSessions} icon={<History className="h-4 w-4 text-muted-foreground" />} />
                        <StatCard title="Unique Foods" value={stats.uniqueFoods} icon={<TrendingUp className="h-4 w-4 text-green-500" />} />
                        <StatCard title="Most Eaten" value={stats.mostEatenFood} icon={<Pizza className="h-4 w-4 text-muted-foreground" />} />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Food Sessions by Hour</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis />
                                <Tooltip contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                <Legend />
                                <Line type="monotone" dataKey="count" stroke={COLORS[0]} strokeWidth={2} name="Sessions" />
                            </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Distribution by Category</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={categoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                            {categoryChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => value.toLocaleString()} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Distribution by Type</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={typeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                            {typeChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => value.toLocaleString()} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Top Eaten Foods</CardTitle>
                        <CardDescription>Your most frequently logged foods in this period.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Food</TableHead>
                              <TableHead className="text-right">Count</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {topFoods.map((food) => (
                              <TableRow key={food.id}>
                                <TableCell className="font-medium">{food.title}</TableCell>
                                <TableCell className="text-right font-semibold">{food.count}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                </div>
                )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
