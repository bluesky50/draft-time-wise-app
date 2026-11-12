'use client';
import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';

export default function FoodSessionsPage() {
    const { foodSessions, foods } = useTimeStore();
    
    const sortedSessions = [...foodSessions].sort((a,b) => b.eatDate - a.eatDate);

    return (
        <main className="flex-1 container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold flex items-center gap-2 mb-6"><Utensils /> Food Sessions</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Session History</CardTitle>
                    <CardDescription>A log of all your logged food sessions.</CardDescription>
                </CardHeader>
                <CardContent>
                     {sortedSessions.length === 0 ? (
                        <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
                            <Utensils className="h-16 w-16 text-muted-foreground/30" />
                            <p className="font-medium">No food sessions recorded yet.</p>
                            <p className="text-sm">Log a food session from the Foods page.</p>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            <AnimatePresence>
                            {sortedSessions.map(session => {
                                const food = foods.find(t => t.id === session.foodId);
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
                                                <p className="font-semibold">{food?.title || 'Unknown Food'}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Eaten {format(new Date(session.eatDate), 'PPP p')} ({formatDistanceToNow(new Date(session.eatDate), { addSuffix: true })})
                                                </p>
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
