'use client';
import { useState, useEffect } from 'react';
import { useTimeStore } from '@/context/time-store-context';
import { LifeInputSetForm } from '@/components/life-inputs/life-input-set-form';
import { Button } from '@/components/ui/button';
import { Zap, Plus, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function LifeInputSetsPage() {
  const { lifeInputSets, addLifeInputSet, updateLifeInputSet } = useTimeStore();
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);

  useEffect(() => {
    // If there are sets but none is selected, select the first one.
    if (!selectedSetId && lifeInputSets.length > 0) {
      setSelectedSetId(lifeInputSets[0].id);
    }
    // If the selected set is deleted, deselect it.
    if (selectedSetId && !lifeInputSets.find(s => s.id === selectedSetId)) {
        setSelectedSetId(lifeInputSets.length > 0 ? lifeInputSets[0].id : null);
    }
  }, [lifeInputSets, selectedSetId]);

  const handleCreateNew = () => {
    const newSet = addLifeInputSet({
      title: 'New Life Input Set',
      description: '',
      inputs: [],
    });
    setSelectedSetId(newSet.id);
  };

  const selectedSet = lifeInputSets.find(s => s.id === selectedSetId);

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap /> Life Input Sets
        </h1>
        <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" /> Create New Set
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Your Sets</CardTitle>
                    <CardDescription>Select a set to view or edit.</CardDescription>
                </CardHeader>
                <CardContent>
                    {lifeInputSets.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No sets created yet.</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[60vh] pr-4">
                            <div className="space-y-3">
                                {lifeInputSets.map(set => (
                                    <button
                                        key={set.id}
                                        onClick={() => setSelectedSetId(set.id)}
                                        className={cn(
                                            "w-full text-left p-3 rounded-lg border transition-colors",
                                            selectedSetId === set.id 
                                                ? "bg-primary/10 border-primary ring-2 ring-primary" 
                                                : "hover:bg-muted/50"
                                        )}
                                    >
                                        <p className="font-semibold">{set.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {set.inputs.length} inputs &middot; Created {format(set.createdAt, 'PP')}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2">
            {selectedSet ? (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedSet.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <LifeInputSetForm
                            initialSet={selectedSet}
                            onSave={updateLifeInputSet}
                        />
                    </motion.div>
                </AnimatePresence>
            ) : (
                <Card className="flex items-center justify-center h-full min-h-[400px]">
                    <div className="text-center text-muted-foreground p-8">
                        <Zap className="mx-auto h-12 w-12" />
                        <h3 className="mt-4 text-lg font-medium">Select a set</h3>
                        <p className="mt-1 text-sm">
                            Choose a set from the list on the left to view its details, or create a new one.
                        </p>
                    </div>
                </Card>
            )}
        </div>
      </div>
    </main>
  );
}
