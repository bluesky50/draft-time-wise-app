'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import type { PersonalPlan } from '@/lib/types';
import { format, getUnixTime, fromUnixTime } from 'date-fns';
import { useEffect } from 'react';

const timelineFormSchema = z.object({
  title: z.string().min(3, 'Plan title is required.'),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  celebration: z.string().min(3, 'Celebration description is required.'),
}).refine(data => new Date(data.startDate) < new Date(data.endDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});


interface StepProps {
  planData: Omit<PersonalPlan, 'id' | 'createdAt'>;
  updatePlanData: (data: Partial<Omit<PersonalPlan, 'id' | 'createdAt'>>) => void;
}

export function Step5Timeline({ planData, updatePlanData }: StepProps) {
  
  const form = useForm<z.infer<typeof timelineFormSchema>>({
    resolver: zodResolver(timelineFormSchema),
    defaultValues: {
      title: planData.title || '',
      startDate: format(fromUnixTime(planData.timeline.startDate), 'yyyy-MM-dd'),
      endDate: format(fromUnixTime(planData.timeline.endDate), 'yyyy-MM-dd'),
      celebration: planData.celebration || '',
    },
  });
  
  useEffect(() => {
    const subscription = form.watch((values) => {
      const { title, startDate, endDate, celebration } = values;
      if (form.formState.isValid) {
        updatePlanData({
          title,
          timeline: {
            startDate: getUnixTime(new Date(startDate as string)),
            endDate: getUnixTime(new Date(endDate as string)),
          },
          celebration,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, updatePlanData]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Set a Timeline and a Reward</CardTitle>
          <CardDescription>
            Give your plan a name, define its duration, and decide how you'll celebrate its completion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>Plan Title</FormLabel> <FormControl> <Input {...field} placeholder="e.g., Q3 Health & Fitness Push" /> </FormControl> <FormMessage /> </FormItem> )} />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="startDate" render={({ field }) => ( <FormItem> <FormLabel>Start Date</FormLabel> <FormControl> <Input type="date" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="endDate" render={({ field }) => ( <FormItem> <FormLabel>End Date</FormLabel> <FormControl> <Input type="date" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
              </div>
              
              <FormField control={form.control} name="celebration" render={({ field }) => ( <FormItem> <FormLabel>Celebration / Reward</FormLabel> <FormControl> <Textarea {...field} placeholder="How will you celebrate achieving this plan? e.g., A weekend trip to the mountains." /> </FormControl> <FormMessage /> </FormItem> )} />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
