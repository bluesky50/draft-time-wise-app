'use client';
import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useTimeStore } from '@/context/time-store-context';
import { CalendarDays, Plus, CalendarIcon, Edit, Save, Trash2, Clock, Tag as TagIcon, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { format, fromUnixTime, getUnixTime, setHours, setMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Event } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const eventFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(3, 'Description must be at least 3 characters long.'),
  startDate: z.date({ required_error: "A start date is required."}),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  endDate: z.date({ required_error: "An end date is required."}),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  tags: z.array(z.object({ value: z.string().min(1, "Tag cannot be empty.") })),
  category: z.string().min(1, 'Category is required.'),
  type: z.string().min(1, 'Type is required.'),
});

type EventFormData = z.infer<typeof eventFormSchema>;

function EventsPage() {
  const { events, addEvent, updateEvent, deleteEvent } = useTimeStore();
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isCondensed, setIsCondensed] = useState(false);

  useEffect(() => {
    const storedCondensed = localStorage.getItem('events-condensed-view');
    if (storedCondensed) {
      setIsCondensed(JSON.parse(storedCondensed));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('events-condensed-view', JSON.stringify(isCondensed));
  }, [isCondensed]);
  
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: new Date(),
      startTime: '09:00',
      endDate: new Date(),
      endTime: '10:00',
      tags: [],
      category: '',
      type: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  function onSubmit(values: EventFormData) {
    const [startHours, startMinutes] = values.startTime.split(':').map(Number);
    const [endHours, endMinutes] = values.endTime.split(':').map(Number);
    
    let startDateWithTime = setMinutes(setHours(values.startDate, startHours), startMinutes);
    let endDateWithTime = setMinutes(setHours(values.endDate, endHours), endMinutes);

    const eventData = {
      title: values.title,
      description: values.description,
      startTime: getUnixTime(startDateWithTime),
      endTime: getUnixTime(endDateWithTime),
      tags: values.tags.map(t => t.value),
      category: values.category,
      type: values.type,
    };

    if (editingEventId) {
        const existingEvent = events.find(e => e.id === editingEventId)!;
        updateEvent({
            ...existingEvent,
            ...eventData,
        });
        setEditingEventId(null);
    } else {
        addEvent(eventData);
    }
    form.reset({
      title: '',
      description: '',
      startDate: new Date(),
      startTime: '09:00',
      endDate: new Date(),
      endTime: '10:00',
      tags: [],
      category: '',
      type: '',
    });
  }

  const handleEdit = (event: Event) => {
    setEditingEventId(event.id);
    form.reset({
        title: event.title,
        description: event.description,
        startDate: fromUnixTime(event.startTime),
        startTime: format(fromUnixTime(event.startTime), 'HH:mm'),
        endDate: fromUnixTime(event.endTime),
        endTime: format(fromUnixTime(event.endTime), 'HH:mm'),
        tags: event.tags.map(value => ({ value })),
        category: event.category,
        type: event.type,
    });
  }

  const handleCancelEdit = () => {
    setEditingEventId(null);
    form.reset({
      title: '',
      description: '',
      startDate: new Date(),
      startTime: '09:00',
      endDate: new Date(),
      endTime: '10:00',
      tags: [],
      category: '',
      type: '',
    });
  }

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{editingEventId ? 'Edit Event' : 'Create a New Event'}</CardTitle>
              <CardDescription>{editingEventId ? 'Modify the details of your event.' : 'Add an event to your timeline.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>Title</FormLabel> <FormControl> <Input placeholder="e.g., Project Deadline" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl> <Textarea placeholder="e.g., Final submission for the Q2 report." {...field} /> </FormControl> <FormMessage /> </FormItem> )} />

                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => field.onChange(date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="startTime" render={({ field }) => ( <FormItem> <FormLabel>Start Time</FormLabel> <FormControl> <Input type="time" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => field.onChange(date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="endTime" render={({ field }) => ( <FormItem> <FormLabel>End Time</FormLabel> <FormControl> <Input type="time" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  </div>

                   <div className='grid grid-cols-2 gap-4'>
                    <FormField control={form.control} name="type" render={({ field }) => ( <FormItem> <FormLabel>Type</FormLabel> <FormControl> <Input placeholder="e.g. Meeting" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="category" render={({ field }) => ( <FormItem> <FormLabel>Category</FormLabel> <FormControl> <Input placeholder="e.g. Work" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  </div>
                  <div>
                    <FormLabel>Tags</FormLabel>
                    <div className="space-y-2 mt-2">
                    {fields.map((field, index) => (
                      <FormField control={form.control} key={field.id} name={`tags.${index}.value`} render={({ field }) => (
                        <FormItem><div className="flex items-center gap-2"><FormControl><Input {...field} placeholder="e.g., project-alpha" /></FormControl><Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><X className="h-4 w-4" /></Button></div><FormMessage /></FormItem>
                      )} />
                    ))}
                    </div>
                     <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: "" })}><Plus className="mr-2 h-4 w-4" /> Add Tag</Button>
                  </div>

                  <div className='flex flex-col gap-2'>
                    <Button type="submit" className="w-full">
                      {editingEventId ? <span><Save className='mr-2 h-4 w-4' /> Update Event</span> : <span><Plus className="mr-2 h-4 w-4" /> Create Event</span>}
                    </Button>
                    {editingEventId && <Button type="button" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>}
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
                  <CardTitle>Your Events</CardTitle>
                  <CardDescription>Here are all your upcoming and past events.</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="condensed-view">Condensed</Label>
                  <Switch id="condensed-view" checked={isCondensed} onCheckedChange={setIsCondensed} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
                  <CalendarDays className="h-12 w-12 text-muted-foreground/50" />
                  <p className="font-medium">No events yet.</p>
                  <p className="text-sm">Add one to get started!</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence>
                  {events.map((event) => (
                    <motion.li
                      key={event.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                      className={cn("border p-4 rounded-lg", editingEventId === event.id && "ring-2 ring-primary")}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2">
                          <h3 className="font-bold">{event.title}</h3>
                          {!isCondensed && (
                            <>
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                              <div className="text-sm text-muted-foreground flex items-center gap-4">
                                <div className='flex items-center gap-2'>
                                    <CalendarIcon className="h-4 w-4" />
                                    <span>{format(fromUnixTime(event.startTime), "PPP")}</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Clock className="h-4 w-4" />
                                    <span>{format(fromUnixTime(event.startTime), "p")} - {format(fromUnixTime(event.endTime), "p")}</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className='font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full'>Type: {event.type}</span>
                                    <span className='font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full'>Cat: {event.category}</span>
                                </div>
                              <div className="flex flex-wrap gap-2">
                                {event.tags.map(tag => (
                                  <div key={tag} className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 dark:bg-blue-900/50 dark:text-blue-300">
                                    <TagIcon className="h-3 w-3" />
                                    {tag}
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground pt-2">Created: {format(event.createdAt, "PPP p")}</p>
                            </>
                          )}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(event)} title="Edit Event">
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteEvent(event.id)} title="Delete Event">
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

export default EventsPage;
