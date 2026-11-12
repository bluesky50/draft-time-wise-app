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
import { X, Heart, Plus, Trash2, Edit, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import type { Want } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const wantFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(3, 'Description must be at least 3 characters long.'),
  tags: z.array(z.object({ value: z.string().min(1, "Tag cannot be empty.") })),
  category: z.string().min(1, 'Category is required.'),
});

type WantFormData = z.infer<typeof wantFormSchema>;

function WantsPage() {
  const { wants, addWant, updateWant, deleteWant } = useTimeStore();
  const [editingWantId, setEditingWantId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCondensed, setIsCondensed] = useState(false);

  useEffect(() => {
    const storedCondensed = localStorage.getItem('wants-condensed-view');
    if (storedCondensed) {
      setIsCondensed(JSON.parse(storedCondensed));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wants-condensed-view', JSON.stringify(isCondensed));
  }, [isCondensed]);
  
  const form = useForm<WantFormData>({
    resolver: zodResolver(wantFormSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: [],
      category: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tags',
  });

  function onSubmit(values: WantFormData) {
    const wantData = {
        ...values,
        tags: values.tags.map(t => t.value),
    };

    if(editingWantId) {
        updateWant({
            id: editingWantId,
            createdAt: wants.find(n => n.id === editingWantId)!.createdAt,
            ...wantData,
        });
        setEditingWantId(null);
    } else {
        addWant(wantData);
    }

    form.reset({
      title: '',
      description: '',
      tags: [],
      category: '',
    });
  }

  const handleEdit = (want: Want) => {
    setEditingWantId(want.id);
    form.reset({
        ...want,
        tags: want.tags.map(t => ({value: t})),
    });
  }

  const handleCancelEdit = () => {
    setEditingWantId(null);
    form.reset({
      title: '',
      description: '',
      tags: [],
      category: '',
    });
  }

  const filteredWants = useMemo(() => {
    return wants.filter(want => 
      want.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      want.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      want.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [wants, searchTerm]);

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{editingWantId ? 'Edit Want' : 'Add a New Want'}</CardTitle>
              <CardDescription>{editingWantId ? 'Modify the details of your want.' : 'Capture your wants and desires.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., A new laptop" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="e.g., A new Macbook Pro for work." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="e.g., Technology" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div>
                    <FormLabel>Tags</FormLabel>
                    <div className="space-y-2 mt-2">
                    {fields.map((field, index) => (
                      <FormField control={form.control} key={field.id} name={`tags.${index}.value`} render={({ field }) => (
                        <FormItem><div className="flex items-center gap-2"><FormControl><Input {...field} placeholder="e.g., expensive" /></FormControl><Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><X className="h-4 w-4" /></Button></div><FormMessage /></FormItem>
                      )} />
                    ))}
                    </div>
                     <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: "" })}>
                        <Plus className="mr-2 h-4 w-4" /> Add Tag
                     </Button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button type="submit" className="w-full">
                      {editingWantId ? <span><Save className="mr-2 h-4 w-4" /> Update Want</span> : <span><Plus className="mr-2 h-4 w-4" /> Create Want</span>}
                    </Button>
                    {editingWantId && <Button type="button" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>}
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
                  <CardTitle>Your Wants</CardTitle>
                  <CardDescription>Search and browse your wants.</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="condensed-view">Condensed</Label>
                  <Switch id="condensed-view" checked={isCondensed} onCheckedChange={setIsCondensed} />
                </div>
              </div>
              <div className="pt-4">
                <Input placeholder="Search wants by title, content, or tag..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              {filteredWants.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
                  <Heart className="h-12 w-12 text-muted-foreground/50" />
                  <p className="font-medium">{wants.length === 0 ? 'No wants yet.' : 'No wants found.'}</p>
                  <p className="text-sm">{wants.length === 0 ? 'Create one to get started!' : 'Try a different search term.'}</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence>
                  {filteredWants.map(want => {
                    return (
                      <motion.li
                        key={want.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                        className={cn("border p-4 rounded-lg", editingWantId === want.id && "ring-2 ring-primary")}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <Link href={`/wants/${want.id}`} className="hover:underline">
                              <h3 className="font-bold">{want.title}</h3>
                            </Link>
                            {!isCondensed && (
                              <>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{want.description}</p>
                                <div className="text-xs text-muted-foreground mt-3">
                                  <p>Created: {format(new Date(want.createdAt), "PPP p")}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
                                    <span className='font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full'>Cat: {want.category}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {want.tags.map(tag => (
                                    <div key={tag} className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 dark:bg-blue-900/50 dark:text-blue-300">
                                      # {tag}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex gap-2">
                              <Button variant="ghost" size="icon" onClick={() => deleteWant(want.id)}>
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(want)} title="Edit Want">
                                  <Edit className="h-4 w-4" />
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

export default WantsPage;
