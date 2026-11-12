'use client';

import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import type { PersonalPlan, Task } from '@/lib/types';
import { useMemo } from 'react';
import { formatDuration } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface StepProps {
  planData: Omit<PersonalPlan, 'id' | 'createdAt'>;
  updatePlanData: (data: Partial<Omit<PersonalPlan, 'id' | 'createdAt'>>) => void;
}

export function Step3TaskCertainty({ planData, updatePlanData }: StepProps) {
  const { outcomes, tasks } = useTimeStore();

  const handleToggleTask = (taskId: string) => {
    const newIds = planData.highCertaintyTaskIds.includes(taskId)
      ? planData.highCertaintyTaskIds.filter((id) => id !== taskId)
      : [...planData.highCertaintyTaskIds, taskId];
    updatePlanData({ highCertaintyTaskIds: newIds });
  };
  
  const relevantOutcomes = useMemo(() => {
    return outcomes.filter(o => planData.outcomeIds.includes(o.id));
  }, [outcomes, planData.outcomeIds]);

  const tasksByOutcome = useMemo(() => {
    const grouped: { [outcomeId: string]: Task[] } = {};
    tasks.forEach(task => {
        if(task.outcomeId && planData.outcomeIds.includes(task.outcomeId)) {
            if (!grouped[task.outcomeId]) {
                grouped[task.outcomeId] = [];
            }
            grouped[task.outcomeId].push(task);
        }
    });
    return grouped;
  }, [tasks, planData.outcomeIds]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assess Task Certainty</CardTitle>
          <CardDescription>
            For each selected outcome, review the associated tasks. Check the ones you have a high certainty of completing within the estimated time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {relevantOutcomes.length === 0 ? (
                <p className="text-muted-foreground text-center">No outcomes selected in the previous step.</p>
            ) : (
                <AnimatePresence>
                {relevantOutcomes.map(outcome => {
                    const associatedTasks = tasksByOutcome[outcome.id] || [];
                    return (
                        <motion.div 
                            key={outcome.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-4 border rounded-lg"
                        >
                            <h3 className="font-semibold text-lg mb-3">{outcome.title}</h3>
                            {associatedTasks.length > 0 ? (
                                <div className="space-y-3">
                                {associatedTasks.map(task => (
                                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50">
                                        <Checkbox
                                            id={`task-certainty-${task.id}`}
                                            checked={planData.highCertaintyTaskIds.includes(task.id)}
                                            onCheckedChange={() => handleToggleTask(task.id)}
                                            className="mt-1"
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <label htmlFor={`task-certainty-${task.id}`} className="font-medium cursor-pointer">
                                                {task.description}
                                            </label>
                                            <p className="text-sm text-muted-foreground">Estimated Time: {formatDuration(task.estimatedTime)}</p>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground pl-3">No tasks are associated with this outcome yet.</p>
                            )}
                        </motion.div>
                    )
                })}
                </AnimatePresence>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}