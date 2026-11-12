'use client';
import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { format, formatDistance, fromUnixTime } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';

export default function PlansPage() {
    const { personalPlans } = useTimeStore();

    return (
        <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2"><ClipboardList /> Personal Plans</h1>
                    <p className="text-muted-foreground">An overview of all your long-term plans.</p>
                </div>
                <Button asChild>
                    <Link href="/planning"><Plus className="mr-2 h-4 w-4" /> Create New Plan</Link>
                </Button>
            </div>

            {personalPlans.length === 0 ? (
                <Card>
                    <CardContent className="text-center text-muted-foreground py-20">
                        <ClipboardList className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">No Plans Created Yet</h3>
                        <p className="text-sm">Use the wizard to create your first personal plan.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {personalPlans.map(plan => (
                            <motion.div
                                key={plan.id}
                                layout
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="h-full flex flex-col">
                                    <CardHeader>
                                        <CardTitle>{plan.title}</CardTitle>
                                        <CardDescription>
                                            Created {format(new Date(plan.createdAt), 'PPP')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow space-y-3">
                                        <p className="text-sm text-muted-foreground">
                                            A {formatDistance(fromUnixTime(plan.timeline.endDate), fromUnixTime(plan.timeline.startDate))} plan to achieve {plan.outcomeIds.length} outcomes.
                                        </p>
                                        <div className='text-xs'>
                                            <p><span className='font-semibold'>Start:</span> {format(fromUnixTime(plan.timeline.startDate), 'PPP')}</p>
                                            <p><span className='font-semibold'>End:</span> {format(fromUnixTime(plan.timeline.endDate), 'PPP')}</p>
                                        </div>
                                        <p className="text-sm">
                                            <span className="font-semibold">Celebration:</span> {plan.celebration}
                                        </p>
                                    </CardContent>
                                    <CardContent>
                                        <Button asChild className="w-full">
                                            <Link href={`/plans/${plan.id}`}>View Details <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </main>
    );
}
