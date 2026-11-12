
'use client';

import { useTimeStore } from '@/context/time-store-context';
import { Button } from '@/components/ui/button';
import { Pause, Play, CheckCircle2, TimerIcon, Tag, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, TaskSession } from '@/lib/types';
import { formatTime, formatDuration, calculateTimeSpent } from '@/lib/utils';

export function TaskTimeTracker({ task, overrideTimeSpent }: { task: Task; overrideTimeSpent?: number }) {
  const { toggleTaskTracking, topics, outcomes, taskSessions } = useTimeStore();

  const topic = topics.find(t => t.id === task.topicId);
  const outcome = outcomes.find(o => o.id === task.outcomeId);
  const isTracking = taskSessions.some(s => s.taskId === task.id && s.endTime === null);
  
  const timeSpent = overrideTimeSpent !== undefined ? overrideTimeSpent : calculateTimeSpent(task.id, taskSessions);

  return (
    <div className="flex items-center gap-2 text-sm justify-between">
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className={cn("h-4 w-4", task.completed ? "text-green-500" : "text-muted-foreground/50")} />
          <span className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>{task.description}</span>
        </div>
        <div className="flex items-center flex-wrap gap-2 text-xs text-muted-foreground ml-6">
            <div className="flex items-center gap-1">
                <TimerIcon className="h-3 w-3" />
                <span>Est: {formatDuration(task.estimatedTime)}</span>
            </div>
             {topic && (
                <div className="flex items-center gap-1 bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
                    <Tag className="h-3 w-3" />
                    {topic.title}
                </div>
            )}
            {outcome && (
                <div className="flex items-center gap-1 bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 dark:bg-blue-900/50 dark:text-blue-300">
                    <Target className="h-3 w-3" />
                    {outcome.title}
                </div>
            )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="font-mono text-sm bg-muted px-2 py-0.5 rounded-md min-w-[70px] text-center">
            {formatTime(timeSpent)}
        </div>
        <Button
            size="icon"
            variant={isTracking ? 'destructive' : 'ghost'}
            className="h-7 w-7"
            onClick={() => toggleTaskTracking(task.id)}
            disabled={task.completed}
            >
            {isTracking ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
