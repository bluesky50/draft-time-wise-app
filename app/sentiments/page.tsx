'use client';
import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useTimeStore } from '@/context/time-store-context';
import { Smile, Plus, Save, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Sentiment } from '@/lib/types';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const sentimentFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(3, 'Description must be at least 3 characters long.'),
});

type SentimentFormData = z.infer<typeof sentimentFormSchema>;

function SentimentsPage() {
  const { sentiments, addSentiment, updateSentiment, deleteSentiment } = useTimeStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCondensed, setIsCondensed] = useState(false);

  useEffect(() => {
    const storedCondensed = localStorage.getItem('sentiments-condensed-view');
    if (storedCondensed) {
      setIsCondensed(JSON.parse(storedCondensed));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sentiments-condensed-view', JSON.stringify(isCondensed));
  }, [isCondensed]);
  
  const form = useForm<SentimentFormData>({
    resolver: zodResolver(sentimentFormSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  function onSubmit(values: SentimentFormData) {
    if(editingId) {
      const existing = sentiments.find(s => s.id === editingId);
      if (existing) {
        updateSentiment({ ...existing, ...values });
      }
      setEditingId(null);
    } else {
      addSentiment(values);
    }
    form.reset({ title: '', description: '' });
  }

  const handleEdit = (sentiment: Sentiment) => {
    setEditingId(sentiment.id);
    form.reset({
      title: sentiment.title,
      description: sentiment.description,
    });
  }

  const handleCancelEdit = () => {
    setEditingId(null);
    form.reset({ title: '', description: '' });
  }

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Sentiment' : 'Add a New Sentiment'}</CardTitle>
              <CardDescription>{editingId ? 'Modify your sentiment.' : 'Record how you are feeling.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>Title</FormLabel> <FormControl> <Input placeholder="e.g., Feeling Productive" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl> <Textarea placeholder="e.g., Had a great session, finished a lot of tasks." {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  <div className='flex flex-col gap-2'>
                    <Button type="submit" className="w-full">
                      {editingId ? <span><Save className='mr-2 h-4 w-4' /> Update Sentiment</span> : <span><Plus className="mr-2 h-4 w-4" /> Add Sentiment</span>}
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
                  <CardTitle>Your Sentiments</CardTitle>
                  <CardDescription>A log of your recorded sentiments.</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="condensed-view">Condensed</Label>
                  <Switch id="condensed-view" checked={isCondensed} onCheckedChange={setIsCondensed} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {sentiments.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
                  <Smile className="h-12 w-12 text-muted-foreground/50" />
                  <p className="font-medium">No sentiments yet.</p>
                  <p className="text-sm">Add one to get started!</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence>
                  {sentiments.map((sentiment) => (
                    <motion.li
                      key={sentiment.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                      className={cn("border p-4 rounded-lg", editingId === sentiment.id && "ring-2 ring-primary")}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2">
                          <h3 className="font-bold">{sentiment.title}</h3>
                          {!isCondensed && (
                            <>
                              <p className="text-sm text-muted-foreground">{sentiment.description}</p>
                              <p className="text-xs text-muted-foreground pt-2">Created: {format(sentiment.createdAt, "PPP p")}</p>
                            </>
                          )}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(sentiment)} title="Edit Sentiment">
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteSentiment(sentiment.id)} title="Delete Sentiment">
                                <Trash2 className="h-4 w-4 text-destructive" />
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

export default SentimentsPage;
