'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { CornerRightDown, Star } from 'lucide-react';
import type { WantDependencyGraph, WantDependencyNode } from '@/lib/types';
import { Button } from '../ui/button';

interface WantDependencyGraphViewProps {
    graph: WantDependencyGraph;
}

const NodeComponent: React.FC<{ node: WantDependencyNode, allNodes: WantDependencyNode[] }> = ({ node, allNodes }) => {
    const children = useMemo(() => allNodes.filter(n => n.parentId === node.id), [allNodes, node.id]);
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="ml-6 pl-4 border-l">
            <div className="flex items-center gap-2">
                {children.length > 0 && (
                     <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="h-6 w-6">
                        <CornerRightDown className={`h-4 w-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                     </Button>
                )}
                 <div className={`flex items-center gap-2 py-1 ${children.length === 0 ? 'ml-10' : ''}`}>
                    {node.rating && (
                        <div className="flex items-center gap-1 font-bold text-amber-500 text-sm">
                            <Star className="h-4 w-4" />
                            <span>{node.rating}</span>
                        </div>
                    )}
                    <p className="font-medium">
                        {node.value}
                    </p>
                 </div>
            </div>
            
            {isExpanded && children.length > 0 && (
                <div className="space-y-1 mt-1">
                    {children.map(child => (
                        <NodeComponent key={child.id} node={child} allNodes={allNodes} />
                    ))}
                </div>
            )}
        </div>
    );
};


export function WantDependencyGraphView({ graph }: WantDependencyGraphViewProps) {
    const rootNode = useMemo(() => graph.nodes.find(n => n.parentId === null), [graph.nodes]);

    if (!rootNode) {
        return <p>This graph has no root node.</p>;
    }

    return (
       <div className="space-y-2">
            <NodeComponent node={rootNode} allNodes={graph.nodes} />
       </div>
    );
}
