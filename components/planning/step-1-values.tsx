'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Trash2 } from 'lucide-react';
import type { PersonalPlan, Value } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';

const valueFormSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  domain: z.string().min(1),
});

const domains = [
  "Physiological Needs (Health, Fitness)",
  "Safety Needs (Security, Stability)",
  "Love & Belonging (Relationships, Community)",
  "Esteem Needs (Accomplishment, Respect)",
  "Self-Actualization (Growth, Creativity)",
];

interface StepProps {
  planData: Omit<PersonalPlan, 'id' | 'createdAt'>;
  updatePlanData: (data: Partial<Omit<PersonalPlan, 'id' | 'createdAt'>>) => void;
}

export function Step1Values({ planData, updatePlanData }: StepProps) {
  const { values, addValue, deleteValue, updateValue } = useTimeStore();
  const [showForm, setShowForm] = useState(false);

  const form = useForm<z.infer<typeof valueFormSchema>>({
    resolver: zodResolver(valueFormSchema),
    defaultValues: { title: '', description: '', domain: '' },
  });

  const onSubmit = (data: z.infer<typeof valueFormSchema>) => {
    addValue(data);
    form.reset();
    setShowForm(false);
  };
  
  const handleToggleValue = (valueId: string) => {
    const newValueIds = planData.valueIds.includes(valueId)
        ? planData.valueIds.filter(id => id !== valueId)
        : [...planData.valueIds, valueId];
    updatePlanData({ valueIds: newValueIds });
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Define Your Core Values</CardTitle>
          <CardDescription>
            What principles are most important to you across different areas of your life?
            Select existing values or add new ones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {values.length === 0 && !showForm ? (
                <p className="text-muted-foreground text-center">No values defined yet. Add one to get started.</p>
            ) : (
                <AnimatePresence>
                {domains.map(domain => {
                    const domainValues = values.filter(v => v.domain === domain);
                    if (domainValues.length === 0) return null;
                    return (
                        <motion.div key={domain} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <h3 className="font-semibold text-lg mb-2">{domain}</h3>
                            <div className="space-y-2 pl-4 border-l-2">
                            {domainValues.map(value => (
                                <div key={value.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50">
                                    <Checkbox
                                        id={`value-${value.id}`}
                                        checked={planData.valueIds.includes(value.id)}
                                        onCheckedChange={() => handleToggleValue(value.id)}
                                        className="mt-1"
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <label htmlFor={`value-${value.id}`} className="font-medium cursor-pointer">
                                            {value.title}
                                        </label>
                                        <p className="text-sm text-muted-foreground">{value.description}</p>
                                    </div>
                                    <Button size="icon" variant="ghost" className="ml-auto" onClick={() => deleteValue(value.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                            </div>
                        </motion.div>
                    )
                })}
                </AnimatePresence>
            )}
          </div>
          
          <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 pt-6 border-t overflow-hidden">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>Value Title</FormLabel> <FormControl> <Input {...field} placeholder="e.g., Lifelong Learning" /> </FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl> <Textarea {...field} placeholder="e.g., Actively seeking new knowledge and skills." /> </FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="domain" render={({ field }) => ( <FormItem> <FormLabel>Life Domain</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select a domain"/></SelectTrigger></FormControl> <SelectContent> {domains.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                        <div className="flex gap-2">
                            <Button type="submit">Save Value</Button>
                            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                        </div>
                    </form>
                </Form>
            </motion.div>
          )}
          </AnimatePresence>

          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="mt-6">
              <Plus className="mr-2 h-4 w-4" /> Add New Value
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
