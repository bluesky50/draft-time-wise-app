
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTimeStore } from '@/context/time-store-context';
import { X, Gavel, Plus, Trash2, Edit, Save, Tag, Check, XCircle, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import type { Rule } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const ruleFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(3, 'Description must be at least 3 characters long.'),
  tags: z.array(z.object({ value: z.string().min(1, "Tag cannot be empty.") })),
  type: z.string().min(1, 'Type is required.'),
  topicId: z.string().optional(),
  category: z.string().min(1, 'Category is required.'),
});

type RuleFormData = z.infer<typeof ruleFormSchema>;

function RulesPage() {
  const { rules, addRule, updateRule, deleteRule, topics, ruleEvents, addRuleEvent } = useTimeStore();
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCondensed, setIsCondensed] = useState(false);

  useEffect(() => {
    const storedCondensed = localStorage.getItem('rules-condensed-view');
    if (storedCondensed) {
      setIsCondensed(JSON.parse(storedCondensed));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rules-condensed-view', JSON.stringify(isCondensed));
  }, [isCondensed]);
  
  const form = useForm<RuleFormData>({
    resolver: zodResolver(ruleFormSchema),
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

  function onSubmit(values: RuleFormData) {
    const ruleData = {
        ...values,
        topicId: values.topicId === 'none' ? undefined : values.topicId,
        tags: values.tags.map(t => t.value),
    };

    if(editingRuleId) {
        updateRule({
            id: editingRuleId,
            createdAt: rules.find(n => n.id === editingRuleId)!.createdAt,
            ...ruleData,
        });
        setEditingRuleId(null);
    } else {
        addRule(ruleData);
    }

    form.reset({
      title: '',
      description: '',
      tags: [],
      type: '',
      topicId: undefined,
      category: '',
    });
  }

  const handleEdit = (rule: Rule) => {
    setEditingRuleId(rule.id);
    form.reset({
        ...rule,
        topicId: rule.topicId || undefined,
        tags: rule.tags.map(t => ({value: t})),
    });
  }

  const handleCancelEdit = () => {
    setEditingRuleId(null);
    form.reset({
      title: '',
      description: '',
      tags: [],
      type: '',
      topicId: undefined,
      category: '',
    });
  }

  const filteredRules = useMemo(() => {
    return rules.filter(rule => 
      rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [rules, searchTerm]);

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{editingRuleId ? 'Edit Rule' : 'Create a New Rule'}</CardTitle>
              <CardDescription>{editingRuleId ? 'Modify the details of your rule.' : 'Define a new rule.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Naming Conventions" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="e.g., All components must be..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="type" render={({ field }) => (
                        <FormItem><FormLabel>Type</FormLabel><FormControl><Input placeholder="e.g., Best Practice" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="e.g., Code Style" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="topicId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || 'none'}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a topic" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Topic</SelectItem>
                          {topics.map((topic) => (<SelectItem key={topic.id} value={topic.id}>{topic.title}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div>
                    <FormLabel>Tags</FormLabel>
                    <div className="space-y-2 mt-2">
                    {fields.map((field, index) => (
                      <FormField control={form.control} key={field.id} name={`tags.${index}.value`} render={({ field }) => (
                        <FormItem><div className="flex items-center gap-2"><FormControl><Input {...field} placeholder="e.g., frontend" /></FormControl><Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><X className="h-4 w-4" /></Button></div><FormMessage /></FormItem>
                      )} />
                    ))}
                    </div>
                     <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: "" })}>
                        <Plus className="mr-2 h-4 w-4" /> Add Tag
                     </Button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button type="submit" className="w-full">
                      {editingRuleId ? <span><Save className="mr-2 h-4 w-4" /> Update Rule</span> : <span><Plus className="mr-2 h-4 w-4" /> Create Rule</span>}
                    </Button>
                    {editingRuleId && <Button type="button" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>}
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
                  <CardTitle>Your Rules</CardTitle>
                  <CardDescription>Search and browse your rules.</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="condensed-view">Condensed</Label>
                  <Switch id="condensed-view" checked={isCondensed} onCheckedChange={setIsCondensed} />
                </div>
              </div>
              <div className="pt-4">
                <Input placeholder="Search rules by title, content, or tag..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              {filteredRules.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
                  <Gavel className="h-12 w-12 text-muted-foreground/50" />
                  <p className="font-medium">{rules.length === 0 ? 'No rules yet.' : 'No rules found.'}</p>
                  <p className="text-sm">{rules.length === 0 ? 'Create one to get started!' : 'Try a different search term.'}</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence>
                  {filteredRules.map(rule => {
                    const topic = topics.find(t => t.id === rule.topicId);
                    const events = ruleEvents.filter(e => e.ruleId === rule.id).sort((a,b) => b.createdAt - a.createdAt);
                    return (
                      <motion.li
                        key={rule.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                        className={cn("border p-4 rounded-lg", editingRuleId === rule.id && "ring-2 ring-primary")}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 space-y-4">
                            <div>
                              <h3 className="font-bold">{rule.title}</h3>
                              {!isCondensed && (
                                <>
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{rule.description}</p>
                                  <div className="text-xs text-muted-foreground mt-3">
                                    <p>Created: {format(new Date(rule.createdAt), "PPP p")}</p>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
                                      <span className='font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full'>Type: {rule.type}</span>
                                      <span className='font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full'>Cat: {rule.category}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    {topic && (
                                      <div className="flex items-center gap-1 text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
                                        <Tag className="h-3 w-3" />
                                        {topic.title}
                                      </div>
                                    )}
                                    {rule.tags.map(tag => (
                                      <div key={tag} className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 dark:bg-blue-900/50 dark:text-blue-300">
                                        # {tag}
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                             
                            {!isCondensed && events.length > 0 && (
                              <div className='pt-4 border-t'>
                                <h4 className='font-semibold text-sm mb-2 flex items-center gap-2'><History className='h-4 w-4' /> Recent History</h4>
                                <ul className='space-y-2'>
                                  {events.slice(0, 5).map(event => (
                                    <li key={event.id} className='flex items-center gap-2 text-xs'>
                                      {event.status === 'success' ? <Check className='h-4 w-4 text-green-500' /> : <XCircle className='h-4 w-4 text-red-500'/>}
                                      <span className='text-muted-foreground'>{formatDistanceToNow(new Date(event.createdAt), {addSuffix: true})}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                             <div className='flex gap-2'>
                                <Button size="sm" variant="outline" onClick={() => addRuleEvent({ruleId: rule.id, status: 'success'})} className="text-green-600 border-green-600 hover:bg-green-100/50 hover:text-green-700">
                                  <Check className="mr-2 h-4 w-4" /> Success
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => addRuleEvent({ruleId: rule.id, status: 'fail'})} className="text-red-600 border-red-600 hover:bg-red-100/50 hover:text-red-700">
                                  <XCircle className="mr-2 h-4 w-4" /> Fail
                                </Button>
                            </div>

                          </div>
                          <div className="flex gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)} title="Edit Rule">
                                  <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete this rule and all its events.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteRule(rule.id)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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

export default RulesPage;
