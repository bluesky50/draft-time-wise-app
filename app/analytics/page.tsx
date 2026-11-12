
'use client';

import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format, getDay, isAfter, isBefore, parseISO } from 'date-fns';
import { ArrowUpDown } from 'lucide-react';
import type { Task } from '@/lib/types';
import { calculateTimeSpent } from '@/lib/utils';

const formatSeconds = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

type SortKey = 'createdAt' | 'totalTimeSpent' | 'description';
type SortDirection = 'asc' | 'desc';

interface TaskWithTime extends Task {
    totalTimeSpent: number;
}

export default function AnalyticsPage() {
    const { tasks, outcomes, topics, taskSessions } = useTimeStore();
    
    const [topicFilter, setTopicFilter] = useState('all');
    const [outcomeFilter, setOutcomeFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const timeTrackingEntries = useMemo((): TaskWithTime[] => {
        return tasks
            .map(task => ({
                ...task,
                totalTimeSpent: calculateTimeSpent(task.id, taskSessions)
            }))
            .filter(task => task.totalTimeSpent > 0);
    }, [tasks, taskSessions]);
    
    const filteredEntries = useMemo(() => {
        let filtered = timeTrackingEntries;

        if (topicFilter !== 'all') {
            filtered = filtered.filter(t => t.topicId === topicFilter);
        }
        if (outcomeFilter !== 'all') {
            filtered = filtered.filter(t => t.outcomeId === outcomeFilter);
        }
        if (startDate) {
            filtered = filtered.filter(t => isAfter(new Date(t.createdAt), parseISO(startDate)));
        }
        if (endDate) {
            filtered = filtered.filter(t => isBefore(new Date(t.createdAt), parseISO(endDate)));
        }

        return filtered.sort((a, b) => {
            let comparison = 0;
            const valA = a[sortKey];
            const valB = b[sortKey];

            if (valA < valB) {
                comparison = -1;
            } else if (valA > valB) {
                comparison = 1;
            }
            return sortDirection === 'desc' ? comparison * -1 : comparison;
        });

    }, [timeTrackingEntries, topicFilter, outcomeFilter, startDate, endDate, sortKey, sortDirection]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('desc');
        }
    };


    const timeByOutcome = useMemo(() => {
        const data: { [key: string]: number } = {};
        filteredEntries.forEach(task => {
            if (task.totalTimeSpent > 0 && task.outcomeId) {
                const outcome = outcomes.find(o => o.id === task.outcomeId);
                const name = outcome?.title || 'Unassigned';
                data[name] = (data[name] || 0) + task.totalTimeSpent;
            }
        });
        return Object.entries(data).map(([name, seconds]) => ({ name, seconds }));
    }, [filteredEntries, outcomes]);

    const timeByTopic = useMemo(() => {
        const data: { [key: string]: number } = {};
        filteredEntries.forEach(task => {
            if (task.totalTimeSpent > 0 && task.topicId) {
                const topic = topics.find(t => t.id === task.topicId);
                const name = topic?.title || 'Unassigned';
                data[name] = (data[name] || 0) + task.totalTimeSpent;
            }
        });
        return Object.entries(data).map(([name, seconds]) => ({ name, seconds }));
    }, [filteredEntries, topics]);

    const timeByDayOfWeek = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data = days.map(day => ({ name: day, seconds: 0 }));

        filteredEntries.forEach(task => {
            if (task.totalTimeSpent > 0) {
                const dayIndex = getDay(new Date(task.createdAt));
                data[dayIndex].seconds += task.totalTimeSpent;
            }
        });
        return data;
    }, [filteredEntries]);

    return (
        <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Time Analytics</CardTitle>
                    <CardDescription>Visualize your time tracking data.</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Time by Outcome</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {timeByOutcome.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={timeByOutcome} dataKey="seconds" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                        {timeByOutcome.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatSeconds(value)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-muted-foreground text-center py-10">No time tracked for outcomes yet.</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Time by Topic</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {timeByTopic.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={timeByTopic} dataKey="seconds" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                        {timeByTopic.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatSeconds(value)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-muted-foreground text-center py-10">No time tracked for topics yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle>Total Time per Day of Week</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={timeByDayOfWeek}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => formatSeconds(value)} />
                            <Tooltip formatter={(value: number) => [formatSeconds(value), 'Time']} />
                            <Legend />
                            <Bar dataKey="seconds" fill="#8884d8" name="Time Tracked" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Time Tracking Entries</CardTitle>
                    <CardDescription>A detailed log of your time spent on tasks.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <Select value={topicFilter} onValueChange={setTopicFilter}>
                            <SelectTrigger className="md:w-[180px]">
                                <SelectValue placeholder="Filter by topic" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Topics</SelectItem>
                                {topics.map(topic => (
                                    <SelectItem key={topic.id} value={topic.id}>{topic.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                            <SelectTrigger className="md:w-[180px]">
                                <SelectValue placeholder="Filter by outcome" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Outcomes</SelectItem>
                                {outcomes.map(outcome => (
                                    <SelectItem key={outcome.id} value={outcome.id}>{outcome.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                           <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                           <span>-</span>
                           <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('description')}>
                                            Task
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Topic</TableHead>
                                    <TableHead>Outcome</TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('totalTimeSpent')}>
                                            Time Spent
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('createdAt')}>
                                            Date
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEntries.length > 0 ? (
                                    filteredEntries.map(task => {
                                        const topic = topics.find(t => t.id === task.topicId);
                                        const outcome = outcomes.find(o => o.id === task.outcomeId);
                                        return (
                                            <TableRow key={task.id}>
                                                <TableCell className="font-medium">{task.description}</TableCell>
                                                <TableCell>{topic?.title || 'N/A'}</TableCell>
                                                <TableCell>{outcome?.title || 'N/A'}</TableCell>
                                                <TableCell>{formatSeconds(task.totalTimeSpent)}</TableCell>
                                                <TableCell>{format(new Date(task.createdAt), 'PPP')}</TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No time tracking entries found for the selected filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
