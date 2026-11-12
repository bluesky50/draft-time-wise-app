'use client';

import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import type { PersonalPlan } from '@/lib/types';
import { format, fromUnixTime } from 'date-fns';
import { CheckCircle2, Star, Calendar, Gift, ShieldAlert, AlertTriangle } from 'lucide-react';

interface StepProps {
  planData: Omit<PersonalPlan, 'id' | 'createdAt'>;
  updatePlanData: (data: Partial<Omit<PersonalPlan, 'id' | 'createdAt'>>) => void;
}

export function Step7Review({ planData }: StepProps) {
  const { outcomes, values, tasks } = useTimeStore();

  const selectedOutcomes = outcomes.filter(o => planData.outcomeIds.includes(o.id));
  const selectedValues = values.filter(v => planData.valueIds.includes(v.id));
  const selectedTasks = tasks.filter(t => planData.highCertaintyTaskIds.includes(t.id));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Your Plan: {planData.title || '(Untitled Plan)'}</CardTitle>
          <CardDescription>
            This is a summary of the personal plan you've created. If everything looks correct,
            proceed to create the plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <section>
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-3"><Calendar className="h-5 w-5" /> Timeline & Celebration</h3>
            <div className="p-4 bg-muted/50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                <p className="font-semibold">{format(fromUnixTime(planData.timeline.startDate), 'PPP')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">End Date</p>
                <p className="font-semibold">{format(fromUnixTime(planData.timeline.endDate), 'PPP')}</p>
              </div>
              <div className="md:col-span-3">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Gift className="h-4 w-4"/> Celebration</p>
                <p className="font-semibold">{planData.celebration || 'Not specified'}</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-3"><CheckCircle2 className="h-5 w-5" /> Selected Outcomes ({selectedOutcomes.length})</h3>
            <div className="space-y-2">
              {selectedOutcomes.length > 0 ? (
                selectedOutcomes.map(o => (
                  <div key={o.id} className="p-3 border rounded-md">
                    <p className="font-medium">{o.title}</p>
                    <p className="text-sm text-muted-foreground">{o.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No outcomes selected.</p>
              )}
            </div>
          </section>

           <section>
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-3"><Star className="h-5 w-5" /> High-Certainty Tasks ({selectedTasks.length})</h3>
            <div className="space-y-2">
              {selectedTasks.length > 0 ? (
                selectedTasks.map(t => (
                  <div key={t.id} className="p-3 border rounded-md">
                    <p className="font-medium">{t.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No high-certainty tasks selected.</p>
              )}
            </div>
          </section>

           <section>
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-3"><AlertTriangle className="h-5 w-5" /> Potential Blockers ({planData.blockers.length})</h3>
            <div className="space-y-2">
              {planData.blockers.filter(b => b.description).length > 0 ? (
                planData.blockers.filter(b => b.description).map(b => {
                  const outcome = outcomes.find(o => o.id === b.outcomeId);
                  return (
                    <div key={b.id} className="p-3 border rounded-md">
                      <p className="font-medium">For: <span className='text-primary'>{outcome?.title}</span></p>
                      <p className="text-sm text-muted-foreground">{b.description}</p>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground">No blockers identified.</p>
              )}
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-3"><Star className="h-5 w-5" /> Guiding Values ({selectedValues.length})</h3>
             <div className="space-y-2">
              {selectedValues.length > 0 ? (
                selectedValues.map(v => (
                  <div key={v.id} className="p-3 border rounded-md">
                    <p className="font-medium">{v.title}</p>
                     <p className="text-xs text-muted-foreground font-semibold">{v.domain}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No values selected.</p>
              )}
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-3"><ShieldAlert className="h-5 w-5" /> Risks & Mitigations ({planData.risks.length})</h3>
             <div className="space-y-2">
              {planData.risks.filter(r => r.description).length > 0 ? (
                planData.risks.filter(r => r.description).map((r, i) => (
                  <div key={i} className="p-3 border rounded-md">
                    <p className="font-medium text-destructive/80">Risk: <span className="text-foreground">{r.description}</span></p>
                    <p className="font-medium text-green-600/80 mt-1">Mitigation: <span className="text-foreground">{r.mitigation}</span></p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No risks identified.</p>
              )}
            </div>
          </section>

        </CardContent>
      </Card>
    </div>
  );
}
