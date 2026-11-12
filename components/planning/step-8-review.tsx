
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import type { PersonalPlan } from '@/lib/types';
import { PlanView } from './plan-view';

interface StepProps {
  planData: Omit<PersonalPlan, 'id' | 'createdAt'>;
  updatePlanData: (data: Partial<Omit<PersonalPlan, 'id' | 'createdAt'>>) => void;
}

export function Step8Review({ planData }: StepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Your Plan: {planData.title || '(Untitled Plan)'}</CardTitle>
        <CardDescription>
          This is a summary of the personal plan you've created. If everything looks correct,
          proceed to create the plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PlanView plan={planData} />
      </CardContent>
    </Card>
  );
}
