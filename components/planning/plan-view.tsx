'use client';

import { useTimeStore } from '@/context/time-store-context';
import type { PersonalPlan } from '@/lib/types';
import { format, fromUnixTime } from 'date-fns';
import { ShieldAlert, Star, Calendar, Gift, BrainCircuit, AlignStartHorizontal, ThumbsUp } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface PlanViewProps {
  plan: Omit<PersonalPlan, 'id' | 'createdAt'> | PersonalPlan;
}

export function PlanView({ plan }: PlanViewProps) {
  const { outcomes, values, tasks } = useTimeStore();

  const selectedOutcomes = outcomes.filter(o => plan.outcomeIds.includes(o.id));
  const selectedValues = values.filter(v => plan.valueIds.includes(v.id));
  const highCertaintyTaskIds = plan.highCertaintyTaskIds || [];
  const planBlockers = plan.blockers || [];
  const planRisks = plan.risks || [];


  return (
    <div className="space-y-8">
      <section>
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-3"><Calendar className="h-5 w-5" /> Timeline & Celebration</h3>
        <div className="p-4 bg-muted/50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Start Date</p>
            <p className="font-semibold">{format(fromUnixTime(plan.timeline.startDate), 'PPP')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">End Date</p>
            <p className="font-semibold">{format(fromUnixTime(plan.timeline.endDate), 'PPP')}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Gift className="h-4 w-4"/> Celebration</p>
            <p className="font-semibold">{plan.celebration || 'Not specified'}</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-3"><ThumbsUp className="h-5 w-5" /> What to do</h3>
        <div className="space-y-4">
          {selectedOutcomes.length > 0 ? (
            selectedOutcomes.map(outcome => {
              const associatedTasks = tasks.filter(t => t.outcomeId === outcome.id);
              const highConfidenceCount = associatedTasks.filter(t => highCertaintyTaskIds.includes(t.id)).length;
              const lowConfidenceCount = associatedTasks.length - highConfidenceCount;
              const totalTime = associatedTasks.reduce((sum, task) => sum + task.estimatedTime, 0);
              const blockerCount = planBlockers.filter(b => b.outcomeId === outcome.id && b.description).length;

              return (
                <div key={outcome.id} className="p-4 border rounded-md">
                  <div className='flex justify-between items-start'>
                    <p className="font-medium text-primary">{outcome.title}</p>
                    {blockerCount > 0 && <Badge variant="destructive">{blockerCount} Blockers</Badge>}
                  </div>

                  <p className="text-sm text-muted-foreground mt-1 mb-3">{outcome.description}</p>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-2 text-center text-sm'>
                      <div className='p-2 bg-muted/50 rounded-md'>
                          <p className='font-semibold'>{formatDuration(totalTime)}</p>
                          <p className='text-xs text-muted-foreground'>Total Est. Time</p>
                      </div>
                        <div className='p-2 bg-muted/50 rounded-md'>
                          <p className='font-semibold'>{highConfidenceCount}</p>
                          <p className='text-xs text-muted-foreground'>High Certainty</p>
                      </div>
                        <div className='p-2 bg-muted/50 rounded-md'>
                          <p className='font-semibold'>{lowConfidenceCount}</p>
                          <p className='text-xs text-muted-foreground'>Low Certainty</p>
                      </div>
                  </div>
                  {associatedTasks.length > 0 && (
                      <Accordion type="single" collapsible className="w-full mt-4">
                        <AccordionItem value="tasks">
                          <AccordionTrigger>
                            <h4 className='font-semibold text-sm'>Associated Tasks ({associatedTasks.length})</h4>
                          </AccordionTrigger>
                          <AccordionContent>
                             <ul className='space-y-2 text-sm text-muted-foreground pt-2'>
                                {associatedTasks.map(task => {
                                    const taskBlockers = planBlockers.filter(b => b.taskId === task.id && b.description);
                                    const isHighCertainty = highCertaintyTaskIds.includes(task.id);
                                    return (
                                        <li key={task.id} className='p-3 rounded-md bg-muted/20 border'>
                                            <div className='flex justify-between items-start'>
                                                <span className='flex-1 flex items-center gap-2'>
                                                    {task.description}
                                                </span>
                                                <div className='flex items-center gap-2'>
                                                    {isHighCertainty && <Badge variant="secondary" className='bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'>High Confidence</Badge>}
                                                    <Badge variant="outline" className='font-mono text-xs'>{formatDuration(task.estimatedTime)}</Badge>
                                                </div>
                                            </div>
                                            {taskBlockers.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-muted-foreground/10">
                                                    <h5 className="text-xs font-semibold text-muted-foreground">Blockers:</h5>
                                                    <ul className="list-disc list-inside pl-2 mt-1 space-y-1">
                                                        {taskBlockers.map(blocker => (
                                                            <li key={blocker.id} className="text-xs text-destructive/90 italic">
                                                                {blocker.description}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </li>
                                    )
                                })}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                  )}
                </div>
              )
            })
          ) : (
            <p className="text-sm text-muted-foreground">No outcomes selected.</p>
          )}
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-3"><BrainCircuit className="h-5 w-5" /> How to do it</h3>
        <div className="space-y-2">
          {plan.prioritizationApproaches.length > 0 ? (
            plan.prioritizationApproaches.map(approach => (
              <div key={approach} className="p-3 border rounded-md bg-muted/50">
                <p className="font-medium flex items-center gap-2"><AlignStartHorizontal className='h-4 w-4'/> {approach}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No prioritization approaches selected.</p>
          )}
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-3"><Star className="h-5 w-5" /> Why to do it</h3>
          <div className="space-y-2">
          {selectedValues.length > 0 ? (
            selectedValues.map(v => (
              <div key={v.id} className="p-3 border rounded-md bg-muted/50">
                <p className="font-medium">{v.title}</p>
                  <p className="text-xs text-muted-foreground font-semibold">{v.domain}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No guiding values selected.</p>
          )}
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-3"><ShieldAlert className="h-5 w-5" /> What to watch out for</h3>
          <div className="space-y-3">
          {planRisks.filter(r => r.description).length > 0 ? (
            planRisks.filter(r => r.description).map((r, i) => (
              <div key={r.id} className="p-3 border rounded-md bg-muted/50">
                <p className="font-medium text-destructive/80">Risk: <span className="text-foreground">{r.description}</span></p>
                <p className="font-medium text-green-600/80 mt-1">Mitigation: <span className="text-foreground">{r.mitigation}</span></p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No risks identified.</p>
          )}
        </div>
      </section>
    </div>
  );
}
