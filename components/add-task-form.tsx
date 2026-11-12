'use client';

import { useState, useEffect } from 'react';
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
import { Sparkles, Loader2, Save, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { suggestTaskCompletionTime } from '@/ai/flows/suggest-task-completion-time';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Task } from '@/lib/types';

const formSchema = z.object({
  description: z.string().min(3, 'Description must be at least 3 characters.'),
  estimatedTime: z.coerce.number().positive('Estimated time must be a positive number.'),
  topicId: z.string().optional(),
  outcomeId: z.string().optional(),
  typeId: z.string().optional(),
});

interface AddTaskFormProps {
  editingTask: Task | null;
  onDoneEditing: () => void;
}

export function AddTaskForm({ editingTask, onDoneEditing }: AddTaskFormProps) {
  const { addTask, updateTask, tasks, topics, outcomes, taskTypes } = useTimeStore();
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionReasoning, setSuggestionReasoning] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      estimatedTime: 30,
      topicId: undefined,
      outcomeId: undefined,
      typeId: undefined,
    },
  });

  useEffect(() => {
    if (editingTask) {
      form.reset({
        description: editingTask.description,
        estimatedTime: editingTask.estimatedTime,
        topicId: editingTask.topicId || undefined,
        outcomeId: editingTask.outcomeId || undefined,
        typeId: editingTask.typeId || undefined,
      });
    } else {
        form.reset({
            description: '',
            estimatedTime: 30,
            topicId: undefined,
            outcomeId: undefined,
            typeId: undefined,
        });
    }
  }, [editingTask, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    const taskData = {
        description: values.description,
        estimatedTime: values.estimatedTime,
        topicId: values.topicId === 'none' ? undefined : values.topicId,
        outcomeId: values.outcomeId === 'none' ? undefined : values.outcomeId,
        typeId: values.typeId === 'none' ? undefined : values.typeId,
    }
    
    if (editingTask) {
      updateTask({
        ...editingTask,
        ...taskData,
      });
      toast({ title: 'Task updated' });
      onDoneEditing();
    } else {
      addTask(taskData);
      toast({ title: 'Task added' });
    }
    form.reset({ description: '', estimatedTime: 30, topicId: undefined, outcomeId: undefined, typeId: undefined });
    setSuggestionReasoning(null);
  }
  
  const handleCancel = () => {
    onDoneEditing();
    form.reset({ description: '', estimatedTime: 30, topicId: undefined, outcomeId: undefined, typeId: undefined });
    setSuggestionReasoning(null);
  }

  const handleSuggestTime = async () => {
    const description = form.getValues('description');
    if (!description || description.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Cannot suggest time',
        description: 'Please provide a more detailed task description (at least 10 characters).',
      });
      return;
    }

    setSuggestionReasoning(null);
    setIsSuggesting(true);
    try {
      const pastTasksData = JSON.stringify(
        tasks.map(t => ({
          description: t.description,
          completionTime: t.estimatedTime,
        }))
      );
      
      const result = await suggestTaskCompletionTime({
        taskDescription: description,
        pastTasksData: pastTasksData,
      });

      if (result.estimatedCompletionTimeMinutes) {
        form.setValue('estimatedTime', result.estimatedCompletionTimeMinutes, { shouldValidate: true });
        setSuggestionReasoning(result.reasoning);
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'AI Suggestion Failed',
        description: 'Could not get a time suggestion. Please try again.',
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{editingTask ? 'Edit Task' : 'Add a New Task'}</CardTitle>
        <CardDescription>{editingTask ? 'Modify the details of your task.' : 'Fill in the details for your new task.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Finalize quarterly report" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="typeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || 'none'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Type</SelectItem>
                      {taskTypes && taskTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.title}
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
              name="topicId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || 'none'}>
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
              name="outcomeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outcome</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || 'none'}>
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
                   <FormDescription>
                    Optionally link this task to a larger outcome.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estimatedTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Time (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="30" {...field} />
                  </FormControl>
                  {suggestionReasoning && <FormDescription className="text-accent-foreground italic mt-2">{suggestionReasoning}</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-2 pt-2">
                <Button type="submit" className="w-full">
                  {editingTask ? (
                    <>
                      <Save className="mr-2" /> Update Task
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2" /> Add Task
                    </>
                  )}
                </Button>

                {editingTask && (
                  <Button type="button" variant="ghost" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}

                {!editingTask && (
                   <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleSuggestTime}
                    disabled={isSuggesting}
                  >
                    {isSuggesting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4 text-accent" />
                    )}
                    Suggest Time with AI
                  </Button>
                )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}