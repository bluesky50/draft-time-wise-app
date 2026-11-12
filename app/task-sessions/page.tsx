'use client';
import { useState } from 'react';
import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Plus, Edit, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { SessionForm } from '@/components/task-sessions/session-form';
import type { TaskSession } from '@/lib/types';
import { formatTime, formatDuration } from '@/lib/utils';
import { format, differenceInSeconds } from 'date-fns';

export default function TaskSessionsPage() {
    const { taskSessions, tasks, deleteSession } = useTimeStore();
    const [editingSession, setEditingSession] = useState<TaskSession | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleEdit = (session: TaskSession) => {
        setEditingSession(session);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingSession(null);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingSession(null);
    };
    
    const sortedSessions = [...taskSessions].sort((a,b) => b.startTime - a.startTime);

    return (
        <main className="flex-1 container mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-2"><Timer /> Task Sessions</h1>
                <Button onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4"/> Add Task Session
                </Button>
            </div>

            {isFormOpen && (
                <div className="mb-8">
                    <SessionForm
                        session={editingSession}
                        onClose={handleCloseForm}
                    />
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Task Session History</CardTitle>
                    <CardDescription>A complete log of all your time tracking sessions.</CardDescription>
                </CardHeader>
                <CardContent>
                     {sortedSessions.length === 0 ? (
                        <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
                            <Timer className="h-16 w-16 text-muted-foreground/30" />
                            <p className="font-medium">No task sessions recorded yet.</p>
                            <p className="text-sm">Start tracking time on a task or add a task session manually.</p>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            <AnimatePresence>
                            {sortedSessions.map(session => {
                                const task = tasks.find(t => t.id === session.taskId);
                                const duration = session.endTime ? differenceInSeconds(session.endTime, session.startTime) : 0;
                                return (
                                    <motion.li
                                        key={session.id}
                                        layout
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                                        className="border p-4 rounded-lg"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1 space-y-1">
                                                <p className="font-semibold">{task?.description || 'Unknown Task'}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(new Date(session.startTime), 'PPP p')} - {session.endTime ? format(new Date(session.endTime), 'p') : 'Ongoing'}
                                                </p>
                                                <p className="text-xs text-primary font-mono">Duration: {formatTime(duration)}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(session)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => deleteSession(session.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
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
        </main>
    );
}
