
'use client';
import { useState, useMemo, useEffect } from 'react';
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
import { X, Eye, Plus, Trash2, Edit, Save, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import type { Observation } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const observationFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(3, 'Description must be at least 3 characters long.'),
  tags: z.array(z.object({ value: z.string().min(1, "Tag cannot be empty.") })),
  type: z.string().min(1, 'Type is required.'),
  category: z.string().min(1, 'Category is required.'),
});

type ObservationFormData = z.infer<typeof observationFormSchema>;

function ObservationsPage() {
  const { observations, addObservation, updateObservation, deleteObservation } = useTimeStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCondensed, setIsCondensed] = useState(false);

  useEffect(() => {
    const storedCondensed = localStorage.getItem('observations-condensed-view');
    if (storedCondensed) {
      setIsCondensed(JSON.parse(storedCondensed));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('observations-condensed-view', JSON.stringify(isCondensed));
  }, [isCondensed]);
  
  const form = useForm<ObservationFormData>({
    resolver: zodResolver(observationFormSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: [],
      type: '',
      category: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tags',
  });

  function onSubmit(values: ObservationFormData) {
    const observationData = {
        ...values,
        tags: values.tags.map(t => t.value),
    };

    if(editingId) {
        updateObservation({
            id: editingId,
            createdAt: observations.find(n => n.id === editingId)!.createdAt,
            ...observationData,
        });
        setEditingId(null);
    } else {
        addObservation(observationData);
    }

    form.reset({
      title: '',
      description: '',
      tags: [],
      type: '',
      category: '',
    });
  }

  const handleEdit = (observation: Observation) => {
    setEditingId(observation.id);
    form.reset({
        ...observation,
        tags: observation.tags.map(t => ({value: t})),
    });
  }

  const handleCancelEdit = () => {
    setEditingId(null);
    form.reset({
      title: '',
      description: '',
      tags: [],
      type: '',
      category: '',
    });
  }

  const filteredObservations = useMemo(() => {
    return observations.filter(observation => 
      observation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      observation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      observation.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [observations, searchTerm]);

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Observation' : 'Create a New Observation'}</CardTitle>
              <CardDescription>{editingId ? 'Modify the details of your observation.' : 'Capture your thoughts and ideas.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Interesting pattern" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="e.g., I noticed that..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="type" render={({ field }) => (
                        <FormItem><FormLabel>Type</FormLabel><FormControl><Input placeholder="e.g., Work, Personal" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="e.g., Behavioral" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <div>
                    <FormLabel>Tags</FormLabel>
                    <div className="space-y-2 mt-2">
                    {fields.map((field, index) => (
                      <FormField control={form.control} key={field.id} name={`tags.${index}.value`} render={({ field }) => (
                        <FormItem><div className="flex items-center gap-2"><FormControl><Input {...field} placeholder="e.g., productivity" /></FormControl><Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><X className="h-4 w-4" /></Button></div><FormMessage /></FormItem>
                      )} />
                    ))}
                    </div>
                     <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: "" })}>
                        <Plus className="mr-2 h-4 w-4" /> Add Tag
                     </Button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button type="submit" className="w-full">
                      {editingId ? <span><Save className="mr-2 h-4 w-4" /> Update Observation</span> : <span><Plus className="mr-2 h-4 w-4" /> Create Observation</span>}
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
                  <CardTitle>Your Observations</CardTitle>
                  <CardDescription>Search and browse your observations.</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="condensed-view">Condensed</Label>
                  <Switch id="condensed-view" checked={isCondensed} onCheckedChange={setIsCondensed} />
                </div>
              </div>
              <div className="pt-4">
                <Input placeholder="Search observations by title, content, or tag..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              {filteredObservations.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
                  <Eye className="h-12 w-12 text-muted-foreground/50" />
                  <p className="font-medium">{observations.length === 0 ? 'No observations yet.' : 'No observations found.'}</p>
                  <p className="text-sm">{observations.length === 0 ? 'Create one to get started!' : 'Try a different search term.'}</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence>
                  {filteredObservations.map(observation => {
                    return (
                      <motion.li
                        key={observation.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                        className={cn("border p-4 rounded-lg", editingId === observation.id && "ring-2 ring-primary")}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <Link href={`/observations/${observation.id}`} className="hover:underline">
                              <h3 className="font-bold">{observation.title}</h3>
                            </Link>
                            {!isCondensed && (
                              <>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{observation.description}</p>
                                <div className="text-xs text-muted-foreground mt-3">
                                  <p>Created: {format(new Date(observation.createdAt), "PPP p")}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
                                    <span className='font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full'>Type: {observation.type}</span>
                                    <span className='font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full'>Cat: {observation.category}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {observation.tags.map(tag => (
                                    <div key={tag} className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 dark:bg-blue-900/50 dark:text-blue-300">
                                      # {tag}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(observation)} title="Edit Observation">
                                  <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteObservation(observation.id)}>
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                        </div>
                      </motion.li>
                    )
                  })}
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

export default ObservationsPage;
