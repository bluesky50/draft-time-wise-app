'use client';
import { useState, useMemo } from 'react';
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
import { X, Notebook, Plus, Trash2, Edit, Save, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import type { Note } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const noteFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(3, 'Description must be at least 3 characters long.'),
  tags: z.array(z.object({ value: z.string().min(1, "Tag cannot be empty.") })),
  type: z.string().min(1, 'Type is required.'),
  topicId: z.string().optional(),
  category: z.string().min(1, 'Category is required.'),
  domain: z.string().min(1, 'Domain is required.'),
  subdomain: z.string().min(1, 'Subdomain is required.'),
});

type NoteFormData = z.infer<typeof noteFormSchema>;

function NotesPage() {
  const { notes, addNote, updateNote, deleteNote, topics } = useTimeStore();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: [],
      type: '',
      category: '',
      domain: '',
      subdomain: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tags',
  });

  function onSubmit(values: NoteFormData) {
    const noteData = {
        ...values,
        topicId: values.topicId === 'none' ? undefined : values.topicId,
        tags: values.tags.map(t => t.value),
    };

    if(editingNoteId) {
        updateNote({
            id: editingNoteId,
            createdAt: notes.find(n => n.id === editingNoteId)!.createdAt,
            ...noteData,
        });
        setEditingNoteId(null);
    } else {
        addNote(noteData);
    }

    form.reset({
      title: '',
      description: '',
      tags: [],
      type: '',
      topicId: undefined,
      category: '',
      domain: '',
      subdomain: '',
    });
  }

  const handleEdit = (note: Note) => {
    setEditingNoteId(note.id);
    form.reset({
        ...note,
        topicId: note.topicId || undefined,
        tags: note.tags.map(t => ({value: t})),
    });
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    form.reset({
      title: '',
      description: '',
      tags: [],
      type: '',
      topicId: undefined,
      category: '',
      domain: '',
      subdomain: '',
    });
  }

  const filteredNotes = useMemo(() => {
    return notes.filter(note => 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [notes, searchTerm]);

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{editingNoteId ? 'Edit Note' : 'Create a New Note'}</CardTitle>
              <CardDescription>{editingNoteId ? 'Modify the details of your note.' : 'Capture your thoughts and ideas.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Idea for new project" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="e.g., A new app to manage..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="type" render={({ field }) => (
                        <FormItem><FormLabel>Type</FormLabel><FormControl><Input placeholder="e.g., Work, Personal" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="e.g., Research" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="domain" render={({ field }) => (
                        <FormItem><FormLabel>Domain</FormLabel><FormControl><Input placeholder="e.g., Software Dev" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="subdomain" render={({ field }) => (
                        <FormItem><FormLabel>Subdomain</FormLabel><FormControl><Input placeholder="e.g., Frontend" {...field} /></FormControl><FormMessage /></FormItem>
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
                      {editingNoteId ? <span><Save className="mr-2 h-4 w-4" /> Update Note</span> : <span><Plus className="mr-2 h-4 w-4" /> Create Note</span>}
                    </Button>
                    {editingNoteId && <Button type="button" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Notes</CardTitle>
              <CardDescription>Search and browse your notes.</CardDescription>
              <div className="pt-4">
                <Input placeholder="Search notes by title, content, or tag..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              {filteredNotes.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
                  <Notebook className="h-12 w-12 text-muted-foreground/50" />
                  <p className="font-medium">{notes.length === 0 ? 'No notes yet.' : 'No notes found.'}</p>
                  <p className="text-sm">{notes.length === 0 ? 'Create one to get started!' : 'Try a different search term.'}</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence>
                  {filteredNotes.map(note => {
                    const topic = topics.find(t => t.id === note.topicId);
                    return (
                      <motion.li
                        key={note.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                        className={cn("border p-4 rounded-lg", editingNoteId === note.id && "ring-2 ring-primary")}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <Link href={`/notes/${note.id}`} className="hover:underline">
                              <h3 className="font-bold">{note.title}</h3>
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{note.description}</p>
                            <div className="text-xs text-muted-foreground mt-3">
                              <p>Created: {format(new Date(note.createdAt), "PPP p")}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
                                <span className='font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full'>Type: {note.type}</span>
                                <span className='font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full'>Cat: {note.category}</span>
                                <span className='font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full'>Dom: {note.domain}</span>
                                <span className='font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full'>Sub: {note.subdomain}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {topic && (
                                <div className="flex items-center gap-1 text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
                                  <Tag className="h-3 w-3" />
                                  {topic.title}
                                </div>
                              )}
                              {note.tags.map(tag => (
                                <div key={tag} className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 dark:bg-blue-900/50 dark:text-blue-300">
                                  # {tag}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(note)} title="Edit Note">
                                <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="Delete Note">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this note.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteNote(note.id)}>Delete</AlertDialogAction>
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

export default NotesPage;
