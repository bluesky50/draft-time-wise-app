'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Notebook,
  CheckCircle2,
  Target,
  CalendarDays,
  MessageSquare,
  Paintbrush,
  ShieldAlert,
  ClipboardCheck,
  HelpCircle,
  Heart,
  Gavel,
  Utensils,
  MapPin,
  CheckSquare as ProtocolIcon,
} from 'lucide-react';
import { isWithinInterval } from 'date-fns';
import { getTimeInterval, type TimeRange } from '@/lib/utils';

const StatCard = ({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) => (
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

export default function ActivitySummaryPage() {
  const { 
    notes, tasks, outcomes, events, checkIns, themes, risks, createActivity, questions, wants,
    rules, ruleEvents, foods, foodSessions, locations, locationSessions, protocols,
  } = useTimeStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('day');

  useEffect(() => {
    createActivity({
        type: 'ACTIVITY_SUMMARY_CREATED',
        description: 'Viewed Activity Summary page',
        link: '/activity-summary'
    });
  }, [createActivity]);

  const stats = useMemo(() => {
    const interval = getTimeInterval(timeRange);

    const filterByInterval = (items: { createdAt: number }[]) => 
      items.filter(item => isWithinInterval(new Date(item.createdAt), interval)).length;
    
    const filterSessionsByInterval = (items: { createdAt: number }[]) => 
      items.filter(item => isWithinInterval(new Date(item.createdAt), interval)).length;

    return {
      notesCreated: filterByInterval(notes),
      tasksCompleted: tasks.filter(t => t.completed && isWithinInterval(new Date(t.createdAt), interval)).length,
      outcomesCompleted: outcomes.filter(o => o.completedDate && isWithinInterval(new Date(o.completedDate), interval)).length,
      eventsCreated: filterByInterval(events),
      checkInsCreated: filterByInterval(checkIns),
      themesCreated: filterByInterval(themes),
      risksCreated: filterByInterval(risks),
      questionsCreated: filterByInterval(questions),
      wantsCreated: filterByInterval(wants),
      rulesCreated: filterByInterval(rules),
      ruleEventsLogged: filterByInterval(ruleEvents),
      foodsCreated: filterByInterval(foods),
      foodSessionsCreated: filterSessionsByInterval(foodSessions),
      locationsCreated: filterByInterval(locations),
      locationSessionsCreated: filterSessionsByInterval(locationSessions),
      protocolsCreated: filterByInterval(protocols),
    };
  }, [timeRange, notes, tasks, outcomes, events, checkIns, themes, risks, questions, wants, rules, ruleEvents, foods, foodSessions, locations, locationSessions, protocols]);

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>Metrics for your activities across different time periods.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
            <TabsContent value={timeRange}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
                <StatCard title="Notes Created" value={stats.notesCreated} icon={<Notebook className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title="Tasks Completed" value={stats.tasksCompleted} icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title="Outcomes Completed" value={stats.outcomesCompleted} icon={<Target className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title="Events Created" value={stats.eventsCreated} icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title="Check-ins Created" value={stats.checkInsCreated} icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title="Themes Created" value={stats.themesCreated} icon={<Paintbrush className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title="Risks Created" value={stats.risksCreated} icon={<ShieldAlert className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title="Questions Created" value={stats.questionsCreated} icon={<HelpCircle className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title="Wants Created" value={stats.wantsCreated} icon={<Heart className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title="Rules Created" value={stats.rulesCreated} icon={<Gavel className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title="Rule Events Logged" value={stats.ruleEventsLogged} icon={<ClipboardCheck className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title="Foods Created" value={stats.foodsCreated} icon={<Utensils className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title="Food Sessions" value={stats.foodSessionsCreated} icon={<Utensils className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title="Locations Created" value={stats.locationsCreated} icon={<MapPin className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title="Location Sessions" value={stats.locationSessionsCreated} icon={<MapPin className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title="Protocols Created" value={stats.protocolsCreated} icon={<ProtocolIcon className="h-4 w-4 text-muted-foreground" />} />
              </div>
              {Object.values(stats).every(val => val === 0) && (
                <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
                  <ClipboardCheck className="h-16 w-16 text-muted-foreground/30" />
                  <p className="font-medium">No activity recorded for this period.</p>
                  <p className="text-sm">Get started by creating tasks, notes, or events!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
