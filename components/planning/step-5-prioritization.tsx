'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import type { PersonalPlan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface StepProps {
  planData: Omit<PersonalPlan, 'id' | 'createdAt'>;
  updatePlanData: (data: Partial<Omit<PersonalPlan, 'id' | 'createdAt'>>) => void;
}

const prioritizationApproaches = [
    "Prioritize outcomes by closest deadline",
    "Prioritize outcomes by fewest blockers",
    "Prioritize outcomes by highest percentage of tasks with high certainty",
    "Prioritize outcomes by least time needed to complete",
    "Prioritize outcomes by personal choice",
    "Prioritize outcomes by highest time to complete",
    "Prioritize outcomes with lowest percentage of tasks with high certainty",
];

export function Step5Prioritization({ planData, updatePlanData }: StepProps) {
  const { toast } = useToast();

  const handleToggleApproach = (approach: string) => {
    const currentSelection = planData.prioritizationApproaches;
    if (currentSelection.includes(approach)) {
        const newApproaches = currentSelection.filter(item => item !== approach);
        updatePlanData({ prioritizationApproaches: newApproaches });
    } else {
        if(currentSelection.length < 3) {
            const newApproaches = [...currentSelection, approach];
            updatePlanData({ prioritizationApproaches: newApproaches });
        } else {
            toast({
                title: "Limit Reached",
                description: "You can select a maximum of 3 prioritization approaches.",
                variant: "destructive"
            });
        }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Choose Prioritization Approaches</CardTitle>
          <CardDescription>
            How will you decide what to work on first? Select your top 3 approaches to prioritize your outcomes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prioritizationApproaches.map(approach => (
              <div key={approach} className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 border">
                <Checkbox
                  id={`approach-${approach.replace(/\s+/g, '-')}`}
                  checked={planData.prioritizationApproaches.includes(approach)}
                  onCheckedChange={() => handleToggleApproach(approach)}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor={`approach-${approach.replace(/\s+/g, '-')}`} className="font-medium cursor-pointer">
                    {approach}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
