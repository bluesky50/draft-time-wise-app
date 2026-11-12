'use client';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTimeStore } from '@/context/time-store-context';
import { MessageSquare, Plus, Save, Edit, Trash2, Smile, Frown, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { CheckIn } from '@/lib/types';
import { format } from 'date-fns';
import { MultiSelect } from '@/components/ui/multi-select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const checkInFormSchema = z.object({
  rating: z.number().min(1).max(10),
  type: z.enum(['positive', 'negative']),
  description: z.string().min(3, 'Description must be at least 3 characters long.'),
  sentimentIds: z.array(z.string()).min(1, 'Please select at least one sentiment.'),
});

type CheckInFormData = z.infer<typeof checkInFormSchema>;

function CheckInsPage() {
  const { checkIns, addCheckIn, updateCheckIn, deleteCheckIn, sentiments } = useTimeStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<CheckInFormData>({
    resolver: zodResolver(checkInFormSchema),
    defaultValues: {
      rating: 5,
      type: 'positive',
      description: '',
      sentimentIds: [],
    },
  });

  function onSubmit(values: CheckInFormData) {
    if (editingId) {
      const existing = checkIns.find(c => c.id === editingId);
      if (existing) {
        updateCheckIn({ ...existing, ...values });
      }
      setEditingId(null);
    } else {
      addCheckIn(values);
    }
    form.reset({
      rating: 5,
      type: 'positive',
      description: '',
      sentimentIds: [],
    });
  }

  const handleEdit = (checkIn: CheckIn) => {
    setEditingId(checkIn.id);
    form.reset({
      rating: checkIn.rating,
      type: checkIn.type,
      description: checkIn.description,
      sentimentIds: checkIn.sentimentIds,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    form.reset({
      rating: 5,
      type: 'positive',
      description: '',
      sentimentIds: [],
    });
  };
  
  const sentimentOptions = sentiments.map(s => ({
    value: s.id,
    label: s.title,
    icon: Sparkles
  }));

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Check-in' : 'New Check-in'}</CardTitle>
              <CardDescription>{editingId ? 'Modify your check-in.' : 'Record your current status.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="positive" />
                              </FormControl>
                              <FormLabel className="font-normal flex items-center gap-1"><Smile className='h-4 w-4'/> Positive</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="negative" />
                              </FormControl>
                              <FormLabel className="font-normal flex items-center gap-1"><Frown className='h-4 w-4'/> Negative</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl> <Textarea placeholder="e.g., Feeling good about progress this week." {...field} /> </FormControl> <FormMessage /> </FormItem> )} />

                  <FormField
                    control={form.control}
                    name="sentimentIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Linked Sentiments</FormLabel>
                        <FormControl>
                           <MultiSelect
                            options={sentimentOptions}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            placeholder="Select related sentiments..."
                           />
                        </FormControl>
                        <FormDescription>
                          Select the sentiments related to this check-in.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <div className='flex flex-col gap-2'>
                    <Button type="submit" className="w-full">
                      {editingId ? <span><Save className='mr-2 h-4 w-4' /> Update Check-in</span> : <span><Plus className="mr-2 h-4 w-4" /> Add Check-in</span>}
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
              <CardTitle>Your Check-ins</CardTitle>
              <CardDescription>A log of your recorded check-ins.</CardDescription>
            </CardHeader>
            <CardContent>
              {checkIns.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
                  <p className="font-medium">No check-ins yet.</p>
                  <p className="text-sm">Add one to get started!</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence>
                  {checkIns.map((checkIn) => {
                    const linkedSentiments = sentiments.filter(s => checkIn.sentimentIds.includes(s.id));
                    return (
                        <motion.li
                        key={checkIn.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                        className={cn("border p-4 rounded-lg", editingId === checkIn.id && "ring-2 ring-primary")}
                        >
                        <div className="flex justify-between items-start">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-4">
                                    <span className={cn('font-bold text-lg', checkIn.type === 'positive' ? 'text-green-600' : 'text-red-600')}>
                                        Rating: {checkIn.rating}/10
                                    </span>
                                    <span className='font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-sm capitalize flex items-center gap-1'>
                                        {checkIn.type === 'positive' ? <Smile className='h-4 w-4' /> : <Frown className='h-4 w-4' />}
                                        {checkIn.type}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground pt-1">{checkIn.description}</p>
                                {linkedSentiments.length > 0 && (
                                    <div className="pt-2">
                                        <h4 className="text-xs font-semibold text-muted-foreground">Related Sentiments</h4>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {linkedSentiments.map(s => (
                                                <div key={s.id} className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 dark:bg-blue-900/50 dark:text-blue-300">
                                                    {s.title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground pt-2">Created: {format(checkIn.createdAt, "PPP p")}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(checkIn)} title="Edit Check-in">
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" title="Delete Check-in">
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this check-in.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteCheckIn(checkIn.id)}>Delete</AlertDialogAction>
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

export default CheckInsPage;
