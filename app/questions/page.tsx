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
import { X, HelpCircle, Plus, Trash2, Edit, Save, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import type { Question } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const questionFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(3, 'Description must be at least 3 characters long.'),
  tags: z.array(z.object({ value: z.string().min(1, "Tag cannot be empty.") })),
  type: z.string().min(1, 'Type is required.'),
  topicId: z.string().optional(),
  category: z.string().min(1, 'Category is required.'),
});

type QuestionFormData = z.infer<typeof questionFormSchema>;

function QuestionsPage() {
  const { questions, addQuestion, updateQuestion, deleteQuestion, topics } = useTimeStore();
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCondensed, setIsCondensed] = useState(false);

  useEffect(() => {
    const storedCondensed = localStorage.getItem('questions-condensed-view');
    if (storedCondensed) {
      setIsCondensed(JSON.parse(storedCondensed));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('questions-condensed-view', JSON.stringify(isCondensed));
  }, [isCondensed]);
  
  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
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

  function onSubmit(values: QuestionFormData) {
    const questionData = {
        ...values,
        topicId: values.topicId === 'none' ? undefined : values.topicId,
        tags: values.tags.map(t => t.value),
    };

    if(editingQuestionId) {
        updateQuestion({
            id: editingQuestionId,
            createdAt: questions.find(n => n.id === editingQuestionId)!.createdAt,
            ...questionData,
        });
        setEditingQuestionId(null);
    } else {
        addQuestion(questionData);
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

  const handleEdit = (question: Question) => {
    setEditingQuestionId(question.id);
    form.reset({
        ...question,
        topicId: question.topicId || undefined,
        tags: question.tags.map(t => ({value: t})),
    });
  }

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    form.reset({
      title: '',
      description: '',
      tags: [],
      type: '',
      topicId: undefined,
      category: '',
    });
  }

  const filteredQuestions = useMemo(() => {
    return questions.filter(question => 
      question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [questions, searchTerm]);

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{editingQuestionId ? 'Edit Question' : 'Ask a New Question'}</CardTitle>
              <CardDescription>{editingQuestionId ? 'Modify the details of your question.' : 'Capture your questions and ideas.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., How does X work?" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="e.g., I'm trying to understand..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="type" render={({ field }) => (
                        <FormItem><FormLabel>Type</FormLabel><FormControl><Input placeholder="e.g., Work, Personal" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="e.g., Technical" {...field} /></FormControl><FormMessage /></FormItem>
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
                        <FormItem><div className="flex items-center gap-2"><FormControl><Input {...field} placeholder="e.g., important" /></FormControl><Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><X className="h-4 w-4" /></Button></div><FormMessage /></FormItem>
                      )} />
                    ))}
                    </div>
                     <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: "" })}>
                        <Plus className="mr-2 h-4 w-4" /> Add Tag
                     </Button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button type="submit" className="w-full">
                      {editingQuestionId ? <span><Save className="mr-2 h-4 w-4" /> Update Question</span> : <span><Plus className="mr-2 h-4 w-4" /> Create Question</span>}
                    </Button>
                    {editingQuestionId && <Button type="button" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>}
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
                  <CardTitle>Your Questions</CardTitle>
                  <CardDescription>Search and browse your questions.</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="condensed-view">Condensed</Label>
                  <Switch id="condensed-view" checked={isCondensed} onCheckedChange={setIsCondensed} />
                </div>
              </div>
              <div className="pt-4">
                <Input placeholder="Search questions by title, content, or tag..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              {filteredQuestions.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
                  <HelpCircle className="h-12 w-12 text-muted-foreground/50" />
                  <p className="font-medium">{questions.length === 0 ? 'No questions yet.' : 'No questions found.'}</p>
                  <p className="text-sm">{questions.length === 0 ? 'Create one to get started!' : 'Try a different search term.'}</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence>
                  {filteredQuestions.map(question => {
                    const topic = topics.find(t => t.id === question.topicId);
                    return (
                      <motion.li
                        key={question.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                        className={cn("border p-4 rounded-lg", editingQuestionId === question.id && "ring-2 ring-primary")}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <Link href={`/questions/${question.id}`} className="hover:underline">
                              <h3 className="font-bold">{question.title}</h3>
                            </Link>
                            {!isCondensed && (
                              <>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{question.description}</p>
                                <div className="text-xs text-muted-foreground mt-3">
                                  <p>Created: {format(new Date(question.createdAt), "PPP p")}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
                                    <span className='font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full'>Type: {question.type}</span>
                                    <span className='font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full'>Cat: {question.category}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {topic && (
                                    <div className="flex items-center gap-1 text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
                                      <Tag className="h-3 w-3" />
                                      {topic.title}
                                    </div>
                                  )}
                                  {question.tags.map(tag => (
                                    <div key={tag} className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 dark:bg-blue-900/50 dark:text-blue-300">
                                      # {tag}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                              <Button variant="ghost" size="icon" onClick={() => deleteQuestion(question.id)}>
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(question)} title="Edit Question">
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

export default QuestionsPage;
