'use client';

import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import type { PersonalPlan } from '@/lib/types';
import { format, fromUnixTime } from 'date-fns';
import { Badge } from '../ui/badge';

interface StepProps {
  planData: Omit<PersonalPlan, 'id' | 'createdAt'>;
  updatePlanData: (data: Partial<Omit<PersonalPlan, 'id' | 'createdAt'>>) => void;
}

export function Step2Outcomes({ planData, updatePlanData }: StepProps) {
  const { outcomes } = useTimeStore();

  const handleToggleOutcome = (outcomeId: string) => {
    const newOutcomeIds = planData.outcomeIds.includes(outcomeId)
        ? planData.outcomeIds.filter(id => id !== outcomeId)
        : [...planData.outcomeIds, outcomeId];
    updatePlanData({ outcomeIds: newOutcomeIds });
  };
  
  const incompleteOutcomes = outcomes.filter(o => !o.completedDate);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Outcomes for this Plan</CardTitle>
          <CardDescription>
            Choose which of your existing, uncompleted outcomes you want to include in this plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incompleteOutcomes.length === 0 ? (
                <p className="text-muted-foreground text-center">You have no uncompleted outcomes. Go to the Outcomes page to create some first.</p>
            ) : (
                <div className="space-y-2">
                {incompleteOutcomes.map(outcome => (
                    <div key={outcome.id} className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 border">
                        <Checkbox
                            id={`outcome-${outcome.id}`}
                            checked={planData.outcomeIds.includes(outcome.id)}
                            onCheckedChange={() => handleToggleOutcome(outcome.id)}
                            className="mt-1"
                        />
                        <div className="grid gap-1.5 leading-none">
                            <label htmlFor={`outcome-${outcome.id}`} className="font-medium cursor-pointer">
                                {outcome.title}
                            </label>
                            <p className="text-sm text-muted-foreground">{outcome.description}</p>
                            {outcome.isOngoing ? (
                                <Badge variant="secondary" className="w-fit">Ongoing</Badge>
                            ) : outcome.targetDate ? (
                                <p className="text-xs text-muted-foreground">Target: {format(fromUnixTime(outcome.targetDate), 'PPP')}</p>
                            ) : null}
                        </div>
                    </div>
                ))}
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
