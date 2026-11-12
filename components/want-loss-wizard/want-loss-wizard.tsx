'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { useTimeStore } from '@/context/time-store-context';
import type { WantLossNode } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Home, Plus, ArrowRight, CheckCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

export function WantLossWizard() {
  const { wantLossGraphs, addWantLossGraph, addWantLossGraphNode } = useTimeStore();
  const router = useRouter();
  
  const [activeGraphId, setActiveGraphId] = useState<string | null>(null);
  const [currentDrilldownId, setCurrentDrilldownId] = useState<string | null>(null);
  const [initialWant, setInitialWant] = useState('');
  const [graphInfo, setGraphInfo] = useState({ title: '', description: '' });
  const [newAnswers, setNewAnswers] = useState<{ [key: string]: string }>({});

  const activeGraph = useMemo(() => {
    if (!activeGraphId) return null;
    return wantLossGraphs.find(g => g.id === activeGraphId);
  }, [activeGraphId, wantLossGraphs]);

  const startWizard = () => {
    if (initialWant.trim() && graphInfo.title.trim()) {
      const newGraph = addWantLossGraph(graphInfo.title, graphInfo.description, initialWant);
      setActiveGraphId(newGraph.id);
      setCurrentDrilldownId(newGraph.nodes[0].id);
    }
  };

  const currentItem = useMemo(() => {
    if (!activeGraph || !currentDrilldownId) return null;
    return activeGraph.nodes.find(n => n.id === currentDrilldownId);
  }, [activeGraph, currentDrilldownId]);

  const children = useMemo(() => {
    if (!activeGraph || !currentDrilldownId) return [];
    return activeGraph.nodes.filter(n => n.parentId === currentDrilldownId);
  }, [activeGraph, currentDrilldownId]);
  
  const breadcrumbs = useMemo(() => {
    if (!activeGraph || !currentItem) return [];
    const path: WantLossNode[] = [];
    let node: WantLossNode | undefined = currentItem;
    while(node) {
        path.unshift(node);
        node = activeGraph.nodes.find(n => n.id === node!.parentId);
    }
    return path;
  }, [activeGraph, currentItem]);

  const handleAddAnswer = () => {
    if (!activeGraph || !currentDrilldownId) return;
    const value = newAnswers[currentDrilldownId];
    if (value && value.trim()) {
      addWantLossGraphNode(activeGraph.id, value, currentDrilldownId);
      setNewAnswers(prev => ({...prev, [currentDrilldownId]: ''}));
    }
  };
  
  const resetWizard = () => {
    setActiveGraphId(null);
    setCurrentDrilldownId(null);
    setInitialWant('');
    setGraphInfo({ title: '', description: '' });
  }
  
  const finishAndGoToGraph = () => {
    if (activeGraphId) {
        router.push(`/want-loss-graphs/${activeGraphId}`);
    }
  }

  if (!activeGraph) {
    return (
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create a Want Loss Graph</CardTitle>
          <CardDescription>Explore what reduces your wants. Start by giving your analysis a name and defining the initial want.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label htmlFor="graph-title">Graph Title</Label>
                <Input
                    id="graph-title"
                    value={graphInfo.title}
                    onChange={(e) => setGraphInfo(prev => ({...prev, title: e.target.value}))}
                    placeholder="e.g., Obstacles to Fitness"
                />
            </div>
            <div>
                <Label htmlFor="graph-desc">Graph Description</Label>
                <Textarea
                    id="graph-desc"
                    value={graphInfo.description}
                    onChange={(e) => setGraphInfo(prev => ({...prev, description: e.target.value}))}
                    placeholder="e.g., An exploration of things that make me less healthy."
                />
            </div>
             <div>
                 <Label htmlFor="initial-want">Initial Want</Label>
                <div className="flex gap-2">
                    <Input
                        id="initial-want"
                        value={initialWant}
                        onChange={(e) => setInitialWant(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && startWizard()}
                        placeholder="e.g., To be healthy"
                        autoFocus
                    />
                    <Button onClick={startWizard} disabled={!initialWant.trim() || !graphInfo.title.trim()}>Start</Button>
                </div>
            </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle>{activeGraph.title}</CardTitle>
            <Button variant="ghost" size="icon" onClick={resetWizard}>
                <Home className="h-5 w-5"/>
            </Button>
        </div>
        <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.id}>
                    <button 
                        onClick={() => setCurrentDrilldownId(crumb.id)} 
                        className="hover:text-primary transition-colors disabled:hover:text-muted-foreground disabled:cursor-default"
                        disabled={index === breadcrumbs.length - 1}
                    >
                        {crumb.value}
                    </button>
                    {index < breadcrumbs.length - 1 && <span className="mx-1">/</span>}
                </React.Fragment>
            ))}
        </div>
      </CardHeader>
      <CardContent>
        {currentItem && (
            <motion.div 
                key={currentItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h2 className="text-xl font-semibold mb-4">
                    What reduces <span className="text-destructive font-bold">"{currentItem.value}"</span>?
                </h2>

                <div className="space-y-3 mb-6">
                    <AnimatePresence>
                    {children.map(child => (
                        <motion.div 
                            key={child.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border"
                        >
                            <span className='flex-1 font-medium'>{child.value}</span>
                            <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={() => setCurrentDrilldownId(child.id)}
                            >
                                Explore <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </motion.div>
                    ))}
                    </AnimatePresence>
                </div>

                <div className="flex gap-2">
                    <Input
                        value={newAnswers[currentItem.id] || ''}
                        onChange={e => setNewAnswers(prev => ({...prev, [currentItem.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleAddAnswer()}
                        placeholder="Add something that reduces it..."
                    />
                    <Button onClick={handleAddAnswer}><Plus className="h-4 w-4 mr-2"/> Add</Button>
                </div>
            </motion.div>
        )}
         <div className='mt-8 flex justify-between'>
            <Button onClick={() => setCurrentDrilldownId(currentItem?.parentId || null)} disabled={!currentItem?.parentId} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2"/> Back
            </Button>
             <Button onClick={finishAndGoToGraph}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Finish & View Graph
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
