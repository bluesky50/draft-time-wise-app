'use client';
import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTimeStore } from '@/context/time-store-context';
import { X, Target, Plus, Check, CheckCircle2, Edit, Save, ArrowUpDown, Trash2, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { format, formatISO, formatDistanceToNow, fromUnixTime, getUnixTime, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Task, Outcome } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const outcomeFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(3, 'Description must be at least 3 characters long.'),
  targetDate: z.string().optional(),
  isOngoing: z.boolean().optional(),
}).refine(data => data.isOngoing || (data.targetDate && !isNaN(Date.parse(data.targetDate))), {
    message: "A valid target date is required unless the outcome is ongoing.",
    path: ["targetDate"],
});

const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
};


function OutcomesPage() {
  const { outcomes, addOutcome, deleteOutcome, toggleOutcome, updateOutcome, tasks, updateTask } = useTimeStore();
  const [editingOutcomeId, setEditingOutcomeId] = useState<string | null>(null);
  const [isCondensed, setIsCondensed] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState<'all' | 'completed' | 'not-completed' | 'ongoing' | 'targeted'>('not-completed');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const storedCondensed = localStorage.getItem('outcomes-condensed-view');
    if (storedCondensed) {
      setIsCondensed(JSON.parse(storedCondensed));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('outcomes-condensed-view', JSON.stringify(isCondensed));
  }, [isCondensed]);
  
  const form = useForm<z.infer<typeof outcomeFormSchema>>({
    resolver: zodResolver(outcomeFormSchema),
    defaultValues: {
      title: '',
      description: '',
      targetDate: formatISO(new Date(), { representation: 'date' }),
      isOngoing: false,
    },
  });
  
  const sortedOutcomes = useMemo(() => {
    const filteredByStatus = outcomes.filter(outcome => {
      if (filter === 'completed') return !!outcome.completedDate;
      if (filter === 'not-completed') return !outcome.completedDate;
      if (filter === 'ongoing') return !!outcome.isOngoing;
      if (filter === 'targeted') return !outcome.isOngoing;
      return true; // 'all'
    });

    const filteredBySearch = filteredByStatus.filter(outcome => 
        outcome.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        outcome.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filteredBySearch.sort((a, b) => {
        if (a.isOngoing && !b.isOngoing) return -1;
        if (!a.isOngoing && b.isOngoing) return 1;
        if (a.isOngoing && b.isOngoing) return 0;
        
        const dateA = a.targetDate || 0;
        const dateB = b.targetDate || 0;

        if (sortOrder === 'asc') {
            return dateA - dateB;
        } else {
            return dateB - dateA;
        }
    });
  }, [outcomes, sortOrder, filter, searchTerm]);


  function onSubmit(values: z.infer<typeof outcomeFormSchema>) {
    const outcomeData = {
      title: values.title,
      description: values.description,
      targetDate: values.isOngoing || !values.targetDate ? undefined : getUnixTime(parseISO(values.targetDate)),
      isOngoing: values.isOngoing,
    };

    if(editingOutcomeId) {
        const existingOutcome = outcomes.find(o => o.id === editingOutcomeId)!;
        updateOutcome({
            ...existingOutcome,
            ...outcomeData,
        });
        setEditingOutcomeId(null);
    } else {
        addOutcome(outcomeData);
    }
    form.reset({ title: '', description: '', targetDate: formatISO(new Date(), { representation: 'date' }), isOngoing: false });
  }

  const handleEdit = (outcome: Outcome) => {
    setEditingOutcomeId(outcome.id);
    form.reset({
        title: outcome.title,
        description: outcome.description,
        targetDate: outcome.targetDate ? formatISO(fromUnixTime(outcome.targetDate), { representation: 'date' }) : undefined,
        isOngoing: outcome.isOngoing,
    });
  }

  const handleCancelEdit = () => {
    setEditingOutcomeId(null);
    form.reset({ title: '', description: '', targetDate: formatISO(new Date(), { representation: 'date' }), isOngoing: false });
  }
  
  const getTasksForOutcome = (outcomeId: string): Task[] => {
    return tasks.filter(task => task.outcomeId === outcomeId);
  }
  
  const getUnassignedTasks = (): Task[] => {
    return tasks.filter(task => !task.outcomeId);
  }
  
  const assignTaskToOutcome = (taskId: string, outcomeId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if(task) {
      updateTask({ ...task, outcomeId: outcomeId });
    }
  }

  const removeTaskFromOutcome = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if(task) {
      updateTask({ ...task, outcomeId: undefined });
    }
  };

  const getTotalTimeForOutcome = (outcomeId: string): number => {
      return tasks
          .filter(task => task.outcomeId === outcomeId)
          .reduce((sum, task) => sum + task.estimatedTime, 0);
  }
  
  const isOngoing = form.watch('isOngoing');

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{editingOutcomeId ? 'Edit Outcome' : 'Add a New Outcome'}</CardTitle>
              <CardDescription>{editingOutcomeId ? 'Modify the details of your outcome.' : 'Define a measurable goal or result.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Launch new website" {...field} />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., A fully functional website with e-commerce." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                    <FormField
                        control={form.control}
                        name="isOngoing"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                            <FormLabel>Ongoing Outcome</FormLabel>
                            <FormDescription>
                                Select this for outcomes without a specific end date.
                            </FormDescription>
                            </div>
                            <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                   {!isOngoing && (
                    <FormField
                        control={form.control}
                        name="targetDate"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Target Date</FormLabel>
                            <FormControl>
                            <Input type="date" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                   )}

                  <div className='flex flex-col gap-2'>
                    <Button type="submit" className="w-full">
                      {editingOutcomeId ? <span><Save className='mr-2 h-4 w-4' /> Update Outcome</span> : <span><Plus className="mr-2 h-4 w-4" /> Add Outcome</span>}
                    </Button>
                    {editingOutcomeId && <Button type="button" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>}
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
                  <CardTitle>Your Outcomes</CardTitle>
                  <CardDescription>Here are all the outcomes you're tracking.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                   <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter outcomes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Outcomes</SelectItem>
                        <SelectItem value="not-completed">Not Completed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="targeted">Targeted</SelectItem>
                      </SelectContent>
                    </Select>
                  <Button variant="outline" size="sm" onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Sort Date
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="condensed-view">Condensed</Label>
                    <Switch id="condensed-view" checked={isCondensed} onCheckedChange={setIsCondensed} />
                  </div>
                </div>
              </div>
               <div className="pt-4">
                <Input placeholder="Search outcomes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              {sortedOutcomes.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
                  <Target className="h-12 w-12 text-muted-foreground/50" />
                  <p className="font-medium">No outcomes match your filter.</p>
                  <p className="text-sm">Try selecting a different filter or search term.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence>
                  {sortedOutcomes.map((outcome, index) => (
                    <motion.li
                      key={outcome.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                      className={cn("border p-4 rounded-lg flex gap-4", outcome.completedDate && "bg-muted/50", editingOutcomeId === outcome.id && "ring-2 ring-primary")}
                    >

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className='flex-1'>
                            <h3 className={cn("font-bold", outcome.completedDate && "line-through text-muted-foreground")}>{outcome.title}</h3>
                             {!isCondensed && (
                              <>
                                <p className="text-sm text-muted-foreground mt-1">{outcome.description}</p>
                                <div className="text-xs text-muted-foreground mt-3 space-y-1">
                                    {outcome.isOngoing ? (
                                        <p className='font-semibold text-primary'>Ongoing</p>
                                    ) : outcome.targetDate ? (
                                        <p>Target: {format(fromUnixTime(outcome.targetDate), "PPP")} ({formatDistanceToNow(fromUnixTime(outcome.targetDate), { addSuffix: true })})</p>
                                    ) : null}
                                  {outcome.completedDate && <p>Completed: {format(fromUnixTime(outcome.completedDate), "PPP")}</p>}
                                </div>
                                
                                <div className='mt-4 pt-4 border-t'>
                                  <h4 className='font-semibold text-sm mb-2'>Assigned Tasks ({getTasksForOutcome(outcome.id).length})</h4>
                                  <div className='flex items-center gap-2 text-sm font-bold text-primary mb-2'>
                                      <Clock className="h-4 w-4" />
                                      Total time: {formatDuration(getTotalTimeForOutcome(outcome.id))}
                                  </div>
                                  {getTasksForOutcome(outcome.id).length > 0 ? (
                                      <ul className='space-y-1 text-sm text-muted-foreground'>
                                          {getTasksForOutcome(outcome.id).map(task => (
                                              <li key={task.id} className={cn('flex items-center justify-between gap-2 p-1 rounded-md hover:bg-muted/50', task.completed && 'line-through')}>
                                                <div className="flex items-center gap-2">
                                                  {task.completed ? <CheckCircle2 className='h-4 w-4 text-green-500' /> : <Clock className='h-4 w-4' />}
                                                  <span>{task.description} ({formatDuration(task.estimatedTime)})</span>
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeTaskFromOutcome(task.id)}><X className="h-4 w-4 text-destructive"/></Button>
                                              </li>
                                          ))}
                                      </ul>
                                  ) : (
                                      <p className='text-xs text-muted-foreground'>No tasks assigned yet.</p>
                                  )}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="sm" className="mt-2" disabled={getUnassignedTasks().length === 0}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Task
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      {getUnassignedTasks().map(task => (
                                        <DropdownMenuItem key={task.id} onSelect={() => assignTaskToOutcome(task.id, outcome.id)}>
                                          {task.description}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex items-center">
                              <Button variant={outcome.completedDate ? 'secondary' : 'ghost'} size="icon" onClick={() => toggleOutcome(outcome.id)} title={outcome.completedDate ? "Mark as not completed" : "Mark as completed"}>
                                  <Check className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(outcome)} title="Edit Outcome">
                                  <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" title="Delete Outcome">
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete this outcome and unassign its tasks.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteOutcome(outcome.id)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                          </div>
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

export default OutcomesPage;
