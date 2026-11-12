'use client';
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { X, Layers, Plus, Copy, Trash2, Clock, Edit, Save, Tag, Target as TargetIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import type { TaskSet, TaskSetTask } from '@/lib/types';
import { cn } from '@/lib/utils';

const taskSetFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(3, 'Description must be at least 3 characters long.'),
  tasks: z.array(z.object({ 
      description: z.string().min(3, 'Task description must be at least 3 characters.'),
      estimatedTime: z.coerce.number().positive('Must be a positive number.'),
      topicId: z.string().optional(),
      outcomeId: z.string().optional(),
  })).min(1, "You must add at least one task to the set."),
});

type TaskSetFormData = z.infer<typeof taskSetFormSchema>;

const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
};


function TaskSetsPage() {
  const { taskSets, addTaskSet, deleteTaskSet, applyTaskSet, updateTaskSet, topics, outcomes } = useTimeStore();
  const [editingTaskSetId, setEditingTaskSetId] = useState<string | null>(null);
  
  const form = useForm<TaskSetFormData>({
    resolver: zodResolver(taskSetFormSchema),
    defaultValues: {
      title: '',
      description: '',
      tasks: [{ description: '', estimatedTime: 30, topicId: undefined, outcomeId: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tasks',
  });

  function onSubmit(values: TaskSetFormData) {
    const tasksWithCleanedIds = values.tasks.map(task => ({
        ...task,
        topicId: task.topicId === 'none' ? undefined : task.topicId,
        outcomeId: task.outcomeId === 'none' ? undefined : task.outcomeId,
    }));

    if(editingTaskSetId) {
        updateTaskSet({
            id: editingTaskSetId,
            title: values.title,
            description: values.description,
            tasks: tasksWithCleanedIds,
        });
        setEditingTaskSetId(null);
    } else {
        addTaskSet({
          title: values.title,
          description: values.description,
          tasks: tasksWithCleanedIds,
        });
    }

    form.reset({
      title: '',
      description: '',
      tasks: [{ description: '', estimatedTime: 30, topicId: undefined, outcomeId: undefined }],
    });
  }

  const handleEdit = (taskSet: TaskSet) => {
    setEditingTaskSetId(taskSet.id);
    form.reset({
        title: taskSet.title,
        description: taskSet.description,
        tasks: taskSet.tasks.map(t => ({...t, topicId: t.topicId || undefined, outcomeId: t.outcomeId || undefined })),
    });
  }

  const handleCancelEdit = () => {
    setEditingTaskSetId(null);
    form.reset({
        title: '',
        description: '',
        tasks: [{ description: '', estimatedTime: 30, topicId: undefined, outcomeId: undefined }],
    });
  }

  const getTotalTimeForSet = (tasks: { estimatedTime: number }[]): number => {
    return tasks.reduce((sum, task) => sum + (Number(task.estimatedTime) || 0), 0);
  }

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{editingTaskSetId ? 'Edit Task Set' : 'Create a New Task Set'}</CardTitle>
              <CardDescription>{editingTaskSetId ? 'Modify the details of your task set.' : 'A reusable template of tasks.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Set Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Morning Routine" {...field} />
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
                        <FormLabel>Set Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., Tasks to start the day right." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <FormLabel>Tasks in this Set</FormLabel>
                    <div className="space-y-4 mt-2 border p-4 rounded-md bg-muted/20">
                    <AnimatePresence>
                    {fields.map((field, index) => (
                      <motion.div
                        key={field.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                        className="p-3 bg-muted/50 rounded-md relative space-y-2"
                      >
                          <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => remove(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                          <FormField
                            control={form.control}
                            name={`tasks.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-xs'>Task Description</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="e.g., Meditate" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`tasks.${index}.estimatedTime`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-xs'>Est. Time (minutes)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} placeholder="15" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name={`tasks.${index}.topicId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-xs'>Topic</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || 'none'}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a topic" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="none">No Topic</SelectItem>
                                    {topics.map((topic) => (
                                      <SelectItem key={topic.id} value={topic.id}>
                                        {topic.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name={`tasks.${index}.outcomeId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-xs'>Outcome</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || 'none'}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select an outcome" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="none">No Outcome</SelectItem>
                                    {outcomes.filter(o => !o.completedDate).map((outcome) => (
                                      <SelectItem key={outcome.id} value={outcome.id}>
                                        {outcome.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                      </motion.div>
                    ))}
                    </AnimatePresence>
                    </div>
                     <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => append({ description: "", estimatedTime: 15 })}
                      >
                       <span>
                         <Plus className="mr-2 h-4 w-4" />
                        Add Another Task to Template
                       </span>
                      </Button>
                      <FormMessage>{form.formState.errors.tasks?.message}</FormMessage>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button type="submit" className="w-full">
                      {editingTaskSetId ? <span><Save className="mr-2 h-4 w-4" /> Update Task Set</span> : <span><Plus className="mr-2 h-4 w-4" /> Create Task Set</span>}
                    </Button>
                    {editingTaskSetId && <Button type="button" variant="ghost" onClick={handleCancelEdit}>Cancel Editing</Button>}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Task Sets</CardTitle>
              <CardDescription>Here are all your task templates.</CardDescription>
            </CardHeader>
            <CardContent>
              {taskSets.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
                  <Layers className="h-12 w-12 text-muted-foreground/50" />
                  <p className="font-medium">No task sets yet.</p>
                  <p className="text-sm">Create one to get started!</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence>
                  {taskSets.map(taskSet => (
                    <motion.li
                      key={taskSet.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                      className={cn("border p-4 rounded-lg", editingTaskSetId === taskSet.id && "ring-2 ring-primary")}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold">{taskSet.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{taskSet.description}</p>
                          <div className='mt-4 pt-4 border-t'>
                            <h4 className='font-semibold text-sm mb-2'>Tasks ({taskSet.tasks.length})</h4>
                            <div className='flex items-center gap-2 text-sm font-bold text-primary mb-2'>
                                <Clock className="h-4 w-4" />
                                Total time: {formatDuration(getTotalTimeForSet(taskSet.tasks))}
                            </div>
                            <ul className='space-y-1 text-sm text-muted-foreground'>
                                {taskSet.tasks.map((task, index) => {
                                  const topic = topics.find(t => t.id === task.topicId);
                                  const outcome = outcomes.find(o => o.id === task.outcomeId);
                                  return (
                                    <li key={index} className='flex items-center gap-2'>
                                        <Layers className='h-4 w-4' />
                                        <span>{task.description} ({formatDuration(task.estimatedTime)})</span>
                                        {topic && (
                                            <div className="flex items-center gap-1 text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
                                                <Tag className="h-3 w-3" />
                                                {topic.title}
                                            </div>
                                        )}
                                        {outcome && (
                                             <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 dark:bg-blue-900/50 dark:text-blue-300">
                                                 <TargetIcon className="h-3 w-3" />
                                                 {outcome.title}
                                             </div>
                                        )}
                                    </li>
                                  )
                                })}
                            </ul>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button variant="ghost" size="icon" onClick={() => deleteTaskSet(taskSet.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(taskSet)} title="Edit Task Set">
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => applyTaskSet(taskSet.id)} title="Apply Task Set">
                                <Copy className="h-4 w-4" />
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

export default TaskSetsPage;
