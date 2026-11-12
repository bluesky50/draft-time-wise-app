'use client';

import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import type { PersonalPlan, Blocker } from '@/lib/types';
import { useMemo } from 'react';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Plus, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface StepProps {
  planData: Omit<PersonalPlan, 'id' | 'createdAt'>;
  updatePlanData: (data: Partial<Omit<PersonalPlan, 'id' | 'createdAt'>>) => void;
}

export function Step4Blockers({ planData, updatePlanData }: StepProps) {
  const { outcomes, tasks } = useTimeStore();

  const handleBlockerChange = (id: string, description: string) => {
    const updatedBlockers = planData.blockers.map(b => b.id === id ? { ...b, description } : b);
    updatePlanData({ blockers: updatedBlockers });
  };
  
  const handleAddBlocker = (outcomeId: string, taskId?: string) => {
    const newBlocker: Blocker = { id: crypto.randomUUID(), outcomeId, taskId, description: '' };
    updatePlanData({ blockers: [...planData.blockers, newBlocker] });
  };

  const handleRemoveBlocker = (id: string) => {
    updatePlanData({ blockers: planData.blockers.filter(b => b.id !== id) });
  };
  
  const relevantOutcomes = useMemo(() => {
    return outcomes.filter(o => planData.outcomeIds.includes(o.id));
  }, [outcomes, planData.outcomeIds]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identify Potential Blockers</CardTitle>
          <CardDescription>
            For each outcome and its tasks, what might stand in your way? Identifying potential blockers early can help you prepare for them.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="space-y-6">
            {relevantOutcomes.length === 0 ? (
                <p className="text-muted-foreground text-center">No outcomes selected in a previous step.</p>
            ) : (
                relevantOutcomes.map(outcome => {
                    const associatedTasks = tasks.filter(t => t.outcomeId === outcome.id);
                    return (
                        <div key={outcome.id} className="p-4 border rounded-lg space-y-4">
                            <h3 className="font-semibold text-lg">{outcome.title}</h3>
                            {associatedTasks.map(task => {
                                const taskBlockers = planData.blockers.filter(b => b.taskId === task.id);
                                return (
                                <div key={task.id} className="p-3 border rounded-md bg-muted/50 ml-4">
                                    <h4 className="font-medium">{task.description}</h4>
                                    <div className="space-y-3 mt-2">
                                        <AnimatePresence>
                                        {taskBlockers.map((blocker, index) => (
                                            <motion.div
                                                key={blocker.id}
                                                layout
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, height: 0, margin: 0, padding: 0, transition: { duration: 0.2 } }}
                                                className="space-y-2 relative pr-10"
                                            >
                                                <Label htmlFor={`blocker-${blocker.id}`} className="text-xs">Blocker #{index + 1}</Label>
                                                <Textarea 
                                                    id={`blocker-${blocker.id}`}
                                                    value={blocker.description}
                                                    onChange={(e) => handleBlockerChange(blocker.id, e.target.value)}
                                                    placeholder="e.g., Unexpected work commitments..."
                                                />
                                                <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0" onClick={() => handleRemoveBlocker(blocker.id)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </motion.div>
                                        ))}
                                        </AnimatePresence>
                                        <Button type="button" variant="outline" size="sm" onClick={() => handleAddBlocker(outcome.id, task.id)}>
                                            <Plus className="mr-2 h-4 w-4" /> Add Blocker to Task
                                        </Button>
                                    </div>
                                </div>
                                )
                            })}
                             {associatedTasks.length === 0 && <p className="text-sm text-muted-foreground ml-4">No tasks for this outcome.</p>}
                        </div>
                    )
                })
            )}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
