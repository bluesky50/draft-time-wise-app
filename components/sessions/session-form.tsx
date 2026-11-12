'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { format, parseISO, getUnixTime } from 'date-fns';
import type { TaskSession } from '@/lib/types';
import { Save, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const sessionFormSchema = z.object({
    taskId: z.string({ required_error: 'Please select a task.' }),
    startDate: z.string().min(1, 'Start date is required.'),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
    endDate: z.string().min(1, 'End date is required.'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
}).refine(data => {
    const startDateTime = parseISO(`${data.startDate}T${data.startTime}`);
    const endDateTime = parseISO(`${data.endDate}T${data.endTime}`);
    return endDateTime > startDateTime;
}, {
    message: "End time must be after start time.",
    path: ["endTime"],
});

type SessionFormData = z.infer<typeof sessionFormSchema>;

interface SessionFormProps {
    session: TaskSession | null;
    onClose: () => void;
}

export function SessionForm({ session, onClose }: SessionFormProps) {
    const { tasks, addSession, updateSession } = useTimeStore();
    const { toast } = useToast();
    
    const form = useForm<SessionFormData>({
        resolver: zodResolver(sessionFormSchema),
        defaultValues: {
            taskId: session?.taskId || '',
            startDate: session ? format(new Date(session.startTime), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            startTime: session ? format(new Date(session.startTime), 'HH:mm') : '09:00',
            endDate: session && session.endTime ? format(new Date(session.endTime), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            endTime: session && session.endTime ? format(new Date(session.endTime), 'HH:mm') : '10:00',
        }
    });

    const onSubmit = (values: SessionFormData) => {
        const startDateTime = parseISO(`${values.startDate}T${values.startTime}`);
        const endDateTime = parseISO(`${values.endDate}T${values.endTime}`);

        const sessionData = {
            taskId: values.taskId,
            startTime: getUnixTime(startDateTime) * 1000,
            endTime: getUnixTime(endDateTime) * 1000,
        }

        if (session) {
            updateSession({ ...session, ...sessionData });
            toast({ title: "Session Updated" });
        } else {
            addSession(sessionData);
            toast({ title: "Session Added" });
        }
        onClose();
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>{session ? 'Edit Session' : 'Add New Session'}</CardTitle>
                        <CardDescription>{session ? 'Modify the details of the time entry.' : 'Manually add a new time entry.'}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
                </div>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="taskId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Task</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a task..." /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {tasks.map(task => (
                                                <SelectItem key={task.id} value={task.id}>{task.description}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="startDate" render={({ field }) => ( <FormItem> <FormLabel>Start Date</FormLabel> <FormControl> <Input type="date" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="startTime" render={({ field }) => ( <FormItem> <FormLabel>Start Time</FormLabel> <FormControl> <Input type="time" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="endDate" render={({ field }) => ( <FormItem> <FormLabel>End Date</FormLabel> <FormControl> <Input type="date" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="endTime" render={({ field }) => ( <FormItem> <FormLabel>End Time</FormLabel> <FormControl> <Input type="time" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                        </div>
                        <Button type="submit" className="w-full">
                            {session ? <><Save className="mr-2 h-4 w-4" /> Update Session</> : <><Plus className="mr-2 h-4 w-4" /> Add Session</>}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
