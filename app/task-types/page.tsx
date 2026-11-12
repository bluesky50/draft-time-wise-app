
'use client';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
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
import { useTimeStore } from '@/context/time-store-context';
import { X, Save, Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import type { TaskType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const taskTypeFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
});

type TaskTypeFormData = z.infer<typeof taskTypeFormSchema>;

function TaskTypesPage() {
  const { taskTypes, addTaskType, updateTaskType, deleteTaskType } = useTimeStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<TaskTypeFormData>({
    resolver: zodResolver(taskTypeFormSchema),
    defaultValues: {
      title: '',
    },
  });

  function onSubmit(values: TaskTypeFormData) {
    if (editingId) {
      const existing = taskTypes.find(t => t.id === editingId);
      if (existing) {
        updateTaskType({ ...existing, ...values });
      }
      setEditingId(null);
    } else {
      addTaskType(values);
    }
    form.reset({ title: '' });
  }

  const handleEdit = (taskType: TaskType) => {
    setEditingId(taskType.id);
    form.reset({
      title: taskType.title,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    form.reset({ title: '' });
  };

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Task Type' : 'New Task Type'}</CardTitle>
              <CardDescription>{editingId ? 'Modify your task type.' : 'Create a new category for your tasks.'}</CardDescription>
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
                          <Input placeholder="e.g., Coding, Writing, Meeting" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className='flex flex-col gap-2'>
                    <Button type="submit" className="w-full">
                      {editingId ? <span><Save className='mr-2 h-4 w-4' /> Update Task Type</span> : <span><Plus className="mr-2 h-4 w-4" /> Add Task Type</span>}
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
              <CardTitle>Your Task Types</CardTitle>
              <CardDescription>A list of all your task categories.</CardDescription>
            </CardHeader>
            <CardContent>
              {!taskTypes ? (
                <div className="text-center text-muted-foreground py-10">Loading...</div>
              ) : taskTypes.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
                  <Tag className="h-12 w-12 text-muted-foreground/50" />
                  <p className="font-medium">No task types yet.</p>
                  <p className="text-sm">Add one to get started!</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence>
                  {taskTypes.map((taskType) => (
                    <motion.li
                      key={taskType.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                      className={cn("border p-4 rounded-lg", editingId === taskType.id && "ring-2 ring-primary")}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2">
                          <h3 className="font-bold">{taskType.title}</h3>
                          <p className="text-xs text-muted-foreground pt-2">Created: {format(taskType.createdAt, "PPP p")}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(taskType)} title="Edit Task Type">
                                <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="Delete Task Type">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this task type and remove it from all tasks.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteTaskType(taskType.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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

export default TaskTypesPage;
