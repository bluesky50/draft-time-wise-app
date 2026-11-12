

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
  Gavel,
  TrendingUp,
  TrendingDown,
  Check,
  XCircle,
  History,
  Percent,
} from 'lucide-react';
import { isWithinInterval, format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { RuleEvent, Rule } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { getTimeInterval, type TimeRange } from '@/lib/utils';

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

const SUCCESS_COLOR = '#22c55e'; // green-500
const FAIL_COLOR = '#ef4444'; // red-500
const OTHER_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];


export default function RuleSummaryPage() {
  const { ruleEvents, rules } = useTimeStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [ruleFilter, setRuleFilter] = useState('all');

  const filteredEvents = useMemo(() => {
    const interval = getTimeInterval(timeRange);

    return ruleEvents
      .filter(e => 
        isWithinInterval(new Date(e.createdAt), interval) &&
        (ruleFilter === 'all' || e.ruleId === ruleFilter)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [timeRange, ruleEvents, ruleFilter]);

  const {
    stats,
    trendChartData,
    ruleStats,
    statusPieChartData,
    successPieChartData,
    failPieChartData,
  } = useMemo(() => {
    const successCount = filteredEvents.filter(e => e.status === 'success').length;
    const failCount = filteredEvents.length - successCount;
    const totalEvents = filteredEvents.length;
    const successRate = totalEvents > 0 ? ((successCount / totalEvents) * 100).toFixed(0) : '0';
    
    const stats = {
      totalEvents,
      successCount,
      failCount,
      successRate: `${successRate}%`,
    };

    const formatStr = 
      timeRange === 'day' ? 'HH:00' : 
      timeRange === 'year' ? 'MMM' : 'MMM d';
      
    const trendDataMap: { [key: string]: { success: number, fail: number } } = {};
    filteredEvents.forEach(e => {
        const dateKey = format(new Date(e.createdAt), formatStr);
        if (!trendDataMap[dateKey]) {
            trendDataMap[dateKey] = { success: 0, fail: 0 };
        }
        trendDataMap[dateKey][e.status]++;
    });
    const trendChartData = Object.entries(trendDataMap).map(([name, values]) => ({ name, ...values }));

    const ruleStatsMap: Record<string, {success: number, fail: number}> = {};
    rules.forEach(rule => {
      ruleStatsMap[rule.id] = { success: 0, fail: 0 };
    });
    filteredEvents.forEach(event => {
      if (ruleStatsMap[event.ruleId]) {
        ruleStatsMap[event.ruleId][event.status]++;
      }
    });
    const ruleStats = rules.map(rule => {
      const { success, fail } = ruleStatsMap[rule.id] || { success: 0, fail: 0 };
      const total = success + fail;
      const successRate = total > 0 ? (success / total) * 100 : 0;
      return { ...rule, success, fail, total, successRate };
    }).sort((a,b) => (b.total) - (a.total));

    const statusPieChartData = [
      { name: 'Success', value: successCount, fill: SUCCESS_COLOR },
      { name: 'Fail', value: failCount, fill: FAIL_COLOR },
    ];

    const successPieChartData = ruleStats
        .filter(r => r.success > 0)
        .map(rule => ({ name: rule.title, value: rule.success }));

    const failPieChartData = ruleStats
        .filter(r => r.fail > 0)
        .map(rule => ({ name: rule.title, value: rule.fail }));

    return { stats, trendChartData, ruleStats, statusPieChartData, successPieChartData, failPieChartData };

  }, [filteredEvents, rules, timeRange]);

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Rule Summary</CardTitle>
          <CardDescription>Analyze your adherence to your personal rules.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <div className='flex justify-between items-center'>
              <TabsList className="grid w-full max-w-md grid-cols-4">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
              <Select value={ruleFilter} onValueChange={setRuleFilter}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Filter by rule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rules</SelectItem>
                  {rules.map(rule => (
                    <SelectItem key={rule.id} value={rule.id}>{rule.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <TabsContent value={timeRange} className="mt-6">
                {filteredEvents.length === 0 ? (
                    <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
                        <Gavel className="h-16 w-16 text-muted-foreground/30" />
                        <p className="font-medium">No rule events found for this period.</p>
                        <p className="text-sm">Go to the rules page and log your successes and failures!</p>
                    </div>
                ) : (
                <div className="space-y-8">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard title="Total Events" value={stats.totalEvents} icon={<History className="h-4 w-4 text-muted-foreground" />} />
                        <StatCard title="Successes" value={stats.successCount} icon={<TrendingUp className="h-4 w-4 text-green-500" />} />
                        <StatCard title="Failures" value={stats.failCount} icon={<TrendingDown className="h-4 w-4 text-red-500" />} />
                        <StatCard title="Success Rate" value={stats.successRate} icon={<Percent className="h-4 w-4 text-muted-foreground" />} />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Rule Adherence Over Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis />
                                <Tooltip contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                <Legend />
                                <Line type="monotone" dataKey="success" stroke={SUCCESS_COLOR} strokeWidth={2} name="Success" />
                                <Line type="monotone" dataKey="fail" stroke={FAIL_COLOR} strokeWidth={2} name="Fail" />
                            </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Success vs. Fail</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={statusPieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                            {statusPieChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
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
                                <CardTitle>Success Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={successPieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                            {successPieChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={OTHER_COLORS[index % OTHER_COLORS.length]} />
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
                                <CardTitle>Failure Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={failPieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                            {failPieChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={OTHER_COLORS[index % OTHER_COLORS.length]} />
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
                        <CardTitle>Rule Breakdown</CardTitle>
                        <CardDescription>Success and failure counts for each rule in this period.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Rule</TableHead>
                              <TableHead className="text-center">Success</TableHead>
                              <TableHead className="text-center">Fail</TableHead>
                              <TableHead className="w-[150px]">Success Rate</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {ruleStats.map((rule) => (
                              <TableRow key={rule.id}>
                                <TableCell className="font-medium">{rule.title}</TableCell>
                                <TableCell className="text-center font-semibold text-green-600">{rule.success}</TableCell>
                                <TableCell className="text-center font-semibold text-red-600">{rule.fail}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Progress value={rule.successRate} className="h-2" />
                                    <span className="text-xs text-muted-foreground w-12 text-right">{rule.successRate.toFixed(0)}%</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Rule Events</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Rule</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredEvents.slice(-10).reverse().map((event: RuleEvent) => {
                                const rule = rules.find(r => r.id === event.ruleId);
                                return (
                                  <TableRow key={event.id}>
                                    <TableCell className="font-medium">{rule?.title || 'Unknown Rule'}</TableCell>
                                    <TableCell>
                                      <Badge variant={event.status === 'success' ? 'secondary' : 'destructive'} className='capitalize'>
                                        {event.status === 'success' ? <Check className='mr-1 h-3 w-3'/> : <XCircle className='mr-1 h-3 w-3'/>}
                                        {event.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{format(new Date(event.createdAt), 'PP p')}</TableCell>
                                  </TableRow>
                                )
                            })}
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
