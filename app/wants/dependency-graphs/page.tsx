'use client';
import { useTimeStore } from '@/context/time-store-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';

export default function WantDependencyGraphsPage() {
    const { wantDependencyGraphs } = useTimeStore();

    return (
        <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2"><Star /> Want Dependency Graphs</h1>
                    <p className="text-muted-foreground">An overview of all your want explorations.</p>
                </div>
                <Button asChild>
                    <Link href="/want-dependency-wizard"><Plus className="mr-2 h-4 w-4" /> Explore a New Want</Link>
                </Button>
            </div>

            {wantDependencyGraphs.length === 0 ? (
                <Card>
                    <CardContent className="text-center text-muted-foreground py-20">
                        <Star className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">No Graphs Created Yet</h3>
                        <p className="text-sm">Use the Want Dependency Wizard to explore what gives you your desires.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {wantDependencyGraphs.map(graph => (
                            <motion.div
                                key={graph.id}
                                layout
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="h-full flex flex-col">
                                    <CardHeader>
                                        <CardTitle>{graph.title}</CardTitle>
                                        <CardDescription>
                                            Created {format(new Date(graph.createdAt), 'PPP')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow space-y-3">
                                        <p className="text-sm italic">"{graph.description}"</p>
                                        <p className="text-sm text-muted-foreground pt-2">
                                            Exploring the want: <span className="font-semibold text-primary">{graph.rootWant}</span>
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            This graph contains {graph.nodes.length} interconnected wants.
                                        </p>
                                    </CardContent>
                                    <CardContent>
                                        <Button asChild className="w-full">
                                            <Link href={`/wants/dependency-graphs/${graph.id}`}>View Graph <ArrowRight className="ml-2 h-4 w-4" /></Link>
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
