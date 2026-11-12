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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTimeStore } from '@/context/time-store-context';
import { X, Tag, Plus, List } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';

const topicFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(3, 'Description must be at least 3 characters long.'),
  tags: z.array(z.object({ value: z.string().min(1, "Tag cannot be empty.") })),
});

function TopicsPage() {
  const { topics, addTopic, deleteTopic } = useTimeStore();
  
  const form = useForm<z.infer<typeof topicFormSchema>>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: [{ value: 'sample' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tags',
  });

  function onSubmit(values: z.infer<typeof topicFormSchema>) {
    addTopic({
      title: values.title,
      description: values.description,
      tags: values.tags.map(t => t.value),
    });
    form.reset({
      title: '',
      description: '',
      tags: [{ value: 'sample' }],
    });
  }

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add a New Topic</CardTitle>
              <CardDescription>Organize your tasks by creating topics.</CardDescription>
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
                          <Input placeholder="e.g., Marketing" {...field} />
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
                          <Textarea placeholder="e.g., All tasks related to marketing campaigns" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <FormLabel>Tags</FormLabel>
                    <div className="space-y-2 mt-2">
                    {fields.map((field, index) => (
                      <FormField
                        control={form.control}
                        key={field.id}
                        name={`tags.${index}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormControl>
                                <Input {...field} placeholder="e.g., social-media" />
                              </FormControl>
                              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                    </div>
                     <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => append({ value: "" })}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Tag
                      </Button>
                  </div>

                  <Button type="submit" className="w-full">Add Topic</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Topics</CardTitle>
              <CardDescription>Here are all the topics you've created.</CardDescription>
            </CardHeader>
            <CardContent>
              {topics.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
                  <List className="h-12 w-12 text-muted-foreground/50" />
                  <p className="font-medium">No topics yet.</p>
                  <p className="text-sm">Add one to get started!</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence>
                  {topics.map(topic => (
                    <motion.li
                      key={topic.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                      className="border p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold">{topic.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {topic.tags.map(tag => (
                              <div key={tag} className="flex items-center gap-1 text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
                                <Tag className="h-3 w-3" />
                                {tag}
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteTopic(topic.id)}>
                          <X className="h-4 w-4" />
                        </Button>
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

export default TopicsPage;
