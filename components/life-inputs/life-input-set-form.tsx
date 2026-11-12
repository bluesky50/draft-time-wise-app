'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTimeStore } from '@/context/time-store-context';
import { LifeInput, LifeInputSet } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Save } from 'lucide-react';
import { LifeInputCard } from './life-input-card';
import { AnimatePresence, motion } from 'framer-motion';

const lifeInputSetSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string(),
});

interface LifeInputSetFormProps {
  initialSet: LifeInputSet;
  onSave: (updatedSet: LifeInputSet) => void;
}

export function LifeInputSetForm({ initialSet, onSave }: LifeInputSetFormProps) {
  const [localSet, setLocalSet] = useState<LifeInputSet>(initialSet);

  const form = useForm<z.infer<typeof lifeInputSetSchema>>({
    resolver: zodResolver(lifeInputSetSchema),
    defaultValues: {
      title: initialSet.title,
      description: initialSet.description,
    },
  });
  
  const handleUpdateInput = (updatedInput: LifeInput) => {
    const newInputs = localSet.inputs.map(input => input.id === updatedInput.id ? updatedInput : input);
    setLocalSet(prev => ({ ...prev, inputs: newInputs }));
  };

  const handleAddInput = () => {
    const newInput: LifeInput = {
      id: crypto.randomUUID(),
      name: 'New Input',
      criticality: 5,
      stability: 5,
      maintenanceIdeas: [],
      increaseIdeas: [],
      risks: [],
    };
    setLocalSet(prev => ({ ...prev, inputs: [...prev.inputs, newInput] }));
  };
  
  const handleDeleteInput = (id: string) => {
    setLocalSet(prev => ({ ...prev, inputs: prev.inputs.filter(input => input.id !== id) }));
  };

  function onSubmit(values: z.infer<typeof lifeInputSetSchema>) {
    const updatedSet = {
        ...localSet,
        ...values,
    };
    setLocalSet(updatedSet);
    onSave(updatedSet);
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} className="text-2xl font-bold border-0 shadow-none p-0 focus-visible:ring-0" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea {...field} placeholder="Add a description for this set..." className="text-sm border-0 shadow-none p-0 focus-visible:ring-0" />
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">Life Inputs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                  {localSet.inputs.map(input => (
                    <motion.div key={input.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                      <LifeInputCard 
                          input={input}
                          onUpdate={handleUpdateInput}
                          onDelete={handleDeleteInput}
                      />
                    </motion.div>
                  ))}
                  </AnimatePresence>
                </div>
                <Button type="button" variant="outline" onClick={handleAddInput} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" /> Add Life Input
                </Button>
            </div>
             <Button type="submit" className="w-full">
                <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </CardContent>
        </form>
      </Form>
    </Card>
  );
}
