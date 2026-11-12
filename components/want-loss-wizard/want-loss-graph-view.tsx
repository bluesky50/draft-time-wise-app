'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { CornerRightDown } from 'lucide-react';
import type { WantLossGraph, WantLossNode } from '@/lib/types';
import { Button } from '../ui/button';

interface WantLossGraphViewProps {
    graph: WantLossGraph;
}

const NodeComponent: React.FC<{ node: WantLossNode, allNodes: WantLossNode[] }> = ({ node, allNodes }) => {
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
                 <p className={`font-medium py-1 ${children.length === 0 ? 'ml-10' : ''}`}>
                    {node.value}
                </p>
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


export function WantLossGraphView({ graph }: WantLossGraphViewProps) {
    const rootNode = useMemo(() => graph.nodes.find(n => n.parentId === null), [graph.nodes]);

    if (!rootNode) {
        return <p>This graph has no root node.</p>;
    }

    return (
       <div className="space-y-2">
            <h3 className="text-lg font-semibold">Loss exploration for: <span className="text-primary">{graph.rootWant}</span></h3>
            <NodeComponent node={rootNode} allNodes={graph.nodes} />
       </div>
    );
}
