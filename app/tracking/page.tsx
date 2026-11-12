'use client';

import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Timer as TimerIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { TaskTimeTracker } from '@/components/task-time-tracker';
import { calculateTimeSpent, formatTime } from '@/lib/utils';

export default function TrackingPage() {
  const { tasks, outcomes, topics, resetTaskTime, taskSessions } = useTimeStore();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { filteredTasks, totalTimeTracked } = useMemo(() => {
    let totalTime = 0;
    const filtered = tasks.filter(task => {
      const statusFilter = 
        filter === 'active' ? !task.completed :
        filter === 'completed' ? task.completed :
        true;
      
      const outcomeIdFilter = 
        outcomeFilter === 'all' ? true :
        outcomeFilter === 'none' ? !task.outcomeId :
        task.outcomeId === outcomeFilter;

      const topicIdFilter =
        topicFilter === 'all' ? true :
        topicFilter === 'none' ? !task.topicId :
        task.topicId === topicFilter;
      
      const searchFilter =
        searchTerm === '' ? true :
        task.description.toLowerCase().includes(searchTerm.toLowerCase());

      const shouldInclude = statusFilter && outcomeIdFilter && topicIdFilter && searchFilter;

      if (shouldInclude) {
        totalTime += calculateTimeSpent(task.id, taskSessions);
      }

      return shouldInclude;
    });

    return { filteredTasks: filtered, totalTimeTracked: totalTime };
  }, [tasks, filter, outcomeFilter, topicFilter, searchTerm, taskSessions]);


  return (
    <main className="flex-1 container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <CardTitle>Time Tracking</CardTitle>
                <CardDescription>Track time spent on your tasks.</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <Button variant={filter === 'all' ? 'secondary' : 'ghost'} onClick={() => setFilter('all')}>All</Button>
                <Button variant={filter === 'active' ? 'secondary' : 'ghost'} onClick={() => setFilter('active')}>Active</Button>
                <Button variant={filter === 'completed' ? 'secondary' : 'ghost'} onClick={() => setFilter('completed')}>Completed</Button>
            </div>
          </div>
           <div className="flex flex-col md:flex-row gap-4 pt-4">
                <Input placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
                <Select value={topicFilter} onValueChange={setTopicFilter}>
                    <SelectTrigger className="md:w-[180px]">
                        <SelectValue placeholder="Filter by topic" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Topics</SelectItem>
                        <SelectItem value="none">No Topic</SelectItem>
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
                        <SelectItem value="none">No Outcome</SelectItem>
                        {outcomes.map(outcome => (
                            <SelectItem key={outcome.id} value={outcome.id}>{outcome.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             <div className="p-4 bg-muted/50 rounded-lg flex justify-between items-center">
                <h3 className="font-semibold text-lg">Total Time for Filter</h3>
                <div className="text-2xl font-bold font-mono text-primary">{formatTime(totalTimeTracked)}</div>
            </div>
            {filteredTasks.length > 0 ? (
                <ul className="space-y-4">
                    <AnimatePresence>
                        {filteredTasks.map(task => 
                            <motion.li
                              key={task.id}
                              layout
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                              className={cn(
                                'border rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center gap-4 transition-all',
                                taskSessions.some(s => s.taskId === task.id && s.endTime === null) ? 'ring-2 ring-primary shadow-lg' : '',
                                task.completed ? 'bg-muted/50' : ''
                              )}
                            >
                                <div className='flex-1 w-full'>
                                    <TaskTimeTracker task={task} />
                                </div>
                            </motion.li>
                        )}
                    </AnimatePresence>
                </ul>
            ) : (
              <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
                <TimerIcon className="h-12 w-12 text-muted-foreground/50" />
                <p className="font-medium">No tasks found for this filter.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
