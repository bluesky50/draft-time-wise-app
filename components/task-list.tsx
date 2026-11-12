'use client';

import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ClipboardList, Tag, Target, Edit } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TaskListProps {
  onEdit: (task: Task) => void;
  editingTaskId: string | null;
}

export function TaskList({ onEdit, editingTaskId }: TaskListProps) {
  const { tasks, deleteTask, topics, outcomes, toggleTask, taskTypes } = useTimeStore();

  const totalTime = tasks.filter(t => !t.completed).reduce((sum, task) => sum + task.estimatedTime, 0);
  const completedTasks = tasks.filter(t => t.completed).length;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Today's Tasks</CardTitle>
                <CardDescription>
                You have {tasks.length} tasks. {completedTasks} completed.
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto pr-3">
        {tasks.length === 0 ? (
          <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
            <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
            <p className="font-medium">No tasks yet.</p>
            <p className="text-sm">Add one to get started!</p>
          </div>
        ) : (
          <motion.ul layout className="space-y-3">
            <AnimatePresence>
              {tasks.map(task => {
                const topic = topics.find(t => t.id === task.topicId);
                const outcome = outcomes.find(o => o.id === task.outcomeId);
                const taskType = taskTypes && taskTypes.find(t => t.id === task.typeId);
                return (
                  <motion.li
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                      task.completed ? 'bg-muted/50' : 'bg-card',
                      editingTaskId === task.id && "ring-2 ring-primary"
                    )}
                  >
                    <div className="flex-1">
                      <div
                        onClick={() => toggleTask(task.id)}
                        className={`font-medium transition-colors cursor-pointer ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {task.description}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center flex-wrap gap-2 mt-1">
                        <span>{formatDuration(task.estimatedTime)}</span>
                        {taskType && (
                          <>
                            <span className="text-muted-foreground/50">|</span>
                            <div className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
                                <Tag className="h-3 w-3" />
                                {taskType.title}
                            </div>
                          </>
                        )}
                        {topic && (
                          <>
                            <span className="text-muted-foreground/50">|</span>
                            <div className="flex items-center gap-1 text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
                                <Tag className="h-3 w-3" />
                                {topic.title}
                            </div>
                          </>
                        )}
                        {outcome && (
                           <>
                             <span className="text-muted-foreground/50">|</span>
                             <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 dark:bg-blue-900/50 dark:text-blue-300">
                                 <Target className="h-3 w-3" />
                                 {outcome.title}
                             </div>
                           </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                       <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full shrink-0"
                        onClick={() => onEdit(task)}
                        aria-label={`Edit task ${task.description}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full shrink-0"
                        onClick={() => deleteTask(task.id)}
                        aria-label={`Delete task ${task.description}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>
        )}
      </CardContent>
      {tasks.length > 0 && (
        <CardFooter className="border-t pt-4">
            <div className="w-full text-right font-bold text-primary">
                Total remaining time: {formatDuration(totalTime)}
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
