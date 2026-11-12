'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { useTimeStore } from '@/context/time-store-context';
import type { WantDependencyNode } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Home, Plus, ArrowRight, CheckCheck, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

export function WantDependencyWizard() {
  const { wantDependencyGraphs, addWantDependencyGraph, addWantDependencyGraphNode } = useTimeStore();
  const router = useRouter();
  
  const [activeGraphId, setActiveGraphId] = useState<string | null>(null);
  const [currentDrilldownId, setCurrentDrilldownId] = useState<string | null>(null);
  const [initialWant, setInitialWant] = useState('');
  const [graphInfo, setGraphInfo] = useState({ title: '', description: '' });
  const [newAnswers, setNewAnswers] = useState<{ [key: string]: { value: string, rating: number } }>({});

  const activeGraph = useMemo(() => {
    if (!activeGraphId) return null;
    return wantDependencyGraphs.find(g => g.id === activeGraphId);
  }, [activeGraphId, wantDependencyGraphs]);

  const startWizard = () => {
    if (initialWant.trim() && graphInfo.title.trim()) {
      const newGraph = addWantDependencyGraph(graphInfo.title, graphInfo.description, initialWant);
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
    const path: WantDependencyNode[] = [];
    let node: WantDependencyNode | undefined = currentItem;
    while(node) {
        path.unshift(node);
        node = activeGraph.nodes.find(n => n.id === node!.parentId);
    }
    return path;
  }, [activeGraph, currentItem]);

  const handleAddAnswer = () => {
    if (!activeGraph || !currentDrilldownId) return;
    const { value, rating } = newAnswers[currentDrilldownId] || { value: '', rating: 5 };
    if (value && value.trim()) {
      addWantDependencyGraphNode(activeGraph.id, value, currentDrilldownId, rating);
      setNewAnswers(prev => ({...prev, [currentDrilldownId]: { value: '', rating: 5 }}));
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
        router.push(`/wants/dependency-graphs/${activeGraphId}`);
    }
  }

  if (!activeGraph) {
    return (
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create a Want Dependency Graph</CardTitle>
          <CardDescription>Explore what gives you your wants. Start by giving your analysis a name and defining the initial want.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label htmlFor="graph-title">Graph Title</Label>
                <Input
                    id="graph-title"
                    value={graphInfo.title}
                    onChange={(e) => setGraphInfo(prev => ({...prev, title: e.target.value}))}
                    placeholder="e.g., My Career Motivations"
                />
            </div>
            <div>
                <Label htmlFor="graph-desc">Graph Description</Label>
                <Textarea
                    id="graph-desc"
                    value={graphInfo.description}
                    onChange={(e) => setGraphInfo(prev => ({...prev, description: e.target.value}))}
                    placeholder="e.g., An exploration of why I want to switch careers."
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
                        placeholder="e.g., A fulfilling job"
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
                    {index < breadcrumbs.length - 1 && <span>/</span>}
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
                    What gives you <span className="text-primary font-bold">"{currentItem.value}"</span>?
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
                            <div className='flex-1 flex items-center gap-2'>
                              <div className="flex items-center gap-1 font-bold text-amber-500">
                                <Star className="h-4 w-4" />
                                <span>{child.rating || 'N/A'}</span>
                              </div>
                              <span className='font-medium'>{child.value}</span>
                            </div>
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
                
                <div className="p-4 border rounded-lg space-y-4">
                    <div className="space-y-2">
                        <Label>New Answer</Label>
                        <Input
                            value={newAnswers[currentItem.id]?.value || ''}
                            onChange={e => setNewAnswers(prev => ({...prev, [currentItem.id]: { ...(prev[currentItem.id] || { rating: 5 }), value: e.target.value } }))}
                            onKeyDown={e => e.key === 'Enter' && handleAddAnswer()}
                            placeholder="Add an answer..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Rating: {newAnswers[currentItem.id]?.rating || 5}</Label>
                        <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[newAnswers[currentItem.id]?.rating || 5]}
                            onValueChange={(vals) => setNewAnswers(prev => ({...prev, [currentItem.id]: { ...(prev[currentItem.id] || { value: '' }), rating: vals[0]} }))}
                        />
                    </div>
                    <Button onClick={handleAddAnswer} className="w-full"><Plus className="h-4 w-4 mr-2"/> Add</Button>
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
