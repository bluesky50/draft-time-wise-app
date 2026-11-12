'use client';
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTimeStore } from '@/context/time-store-context';
import { ShieldAlert, Plus, Save, Edit, Trash2, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Risk } from '@/lib/types';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const riskFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(3, 'Description must be at least 3 characters long.'),
  category: z.string().min(1, 'Category is required.'),
  tags: z.array(z.object({ value: z.string().min(1, "Tag cannot be empty.") })),
});

type RiskFormData = z.infer<typeof riskFormSchema>;

function RisksPage() {
  const { risks, addRisk, updateRisk, deleteRisk } = useTimeStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCondensed, setIsCondensed] = useState(false);

  useEffect(() => {
    const storedCondensed = localStorage.getItem('risks-condensed-view');
    if (storedCondensed) {
      setIsCondensed(JSON.parse(storedCondensed));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('risks-condensed-view', JSON.stringify(isCondensed));
  }, [isCondensed]);
  
  const form = useForm<RiskFormData>({
    resolver: zodResolver(riskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      tags: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tags',
  });

  function onSubmit(values: RiskFormData) {
    const riskData = {
        ...values,
        tags: values.tags.map(t => t.value),
    };

    if(editingId) {
      const existing = risks.find(s => s.id === editingId);
      if (existing) {
        updateRisk({ ...existing, ...riskData });
      }
      setEditingId(null);
    } else {
      addRisk(riskData);
    }
    form.reset({ title: '', description: '', category: '', tags: [] });
  }

  const handleEdit = (risk: Risk) => {
    setEditingId(risk.id);
    form.reset({
      title: risk.title,
      description: risk.description,
      category: risk.category,
      tags: risk.tags.map(value => ({ value })),
    });
  }

  const handleCancelEdit = () => {
    setEditingId(null);
    form.reset({ title: '', description: '', category: '', tags: [] });
  }

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Risk' : 'Add a New Risk'}</CardTitle>
              <CardDescription>{editingId ? 'Modify your risk.' : 'Record a potential risk.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>Title</FormLabel> <FormControl> <Input placeholder="e.g., Server downtime" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl> <Textarea placeholder="e.g., Potential for server to go offline during peak hours." {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="category" render={({ field }) => ( <FormItem> <FormLabel>Category</FormLabel> <FormControl> <Input placeholder="e.g., Technical" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  
                  <div>
                    <FormLabel>Tags</FormLabel>
                    <div className="space-y-2 mt-2">
                    {fields.map((field, index) => (
                      <FormField control={form.control} key={field.id} name={`tags.${index}.value`} render={({ field }) => (
                        <FormItem><div className="flex items-center gap-2"><FormControl><Input {...field} placeholder="e.g., critical" /></FormControl><Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><X className="h-4 w-4" /></Button></div><FormMessage /></FormItem>
                      )} />
                    ))}
                    </div>
                     <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: "" })}>
                        <Plus className="mr-2 h-4 w-4" /> Add Tag
                     </Button>
                  </div>

                  <div className='flex flex-col gap-2'>
                    <Button type="submit" className="w-full">
                      <span className="flex items-center">
                        {editingId ? <Save className='mr-2 h-4 w-4' /> : <Plus className="mr-2 h-4 w-4" />}
                        {editingId ? 'Update Risk' : 'Add Risk'}
                      </span>
                    </Button>
                    {editingId && <Button type="button" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Risks</CardTitle>
                  <CardDescription>A log of your recorded risks.</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="condensed-view">Condensed</Label>
                  <Switch id="condensed-view" checked={isCondensed} onCheckedChange={setIsCondensed} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {risks.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
                  <ShieldAlert className="h-12 w-12 text-muted-foreground/50" />
                  <p className="font-medium">No risks yet.</p>
                  <p className="text-sm">Add one to get started!</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence>
                  {risks.map((risk) => (
                    <motion.li
                      key={risk.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                      className={cn("border p-4 rounded-lg", editingId === risk.id && "ring-2 ring-primary")}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2">
                          <h3 className="font-bold">{risk.title}</h3>
                           {!isCondensed && (
                            <>
                              <p className="text-sm text-muted-foreground">{risk.description}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
                                  <span className='font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full'>Cat: {risk.category}</span>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {risk.tags.map(tag => (
                                    <div key={tag} className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 dark:bg-blue-900/50 dark:text-blue-300">
                                    # {tag}
                                    </div>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground pt-2">Created: {format(risk.createdAt, "PPP p")}</p>
                            </>
                           )}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(risk)} title="Edit Risk">
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteRisk(risk.id)} title="Delete Risk">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                  </AnimatePresence>
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default RisksPage;
