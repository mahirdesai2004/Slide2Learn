'use client';

import React, { useMemo } from 'react';
import { ReactFlow, Background, Controls, Node, Edge, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Slide } from '@/store/useSlideStore';
import { Network, Sparkles, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import dagre from 'dagre';

interface VisualizationModeProps {
    slide: Slide;
}

const nodeWidth = 280;
const nodeHeight = 100;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Set direction to Top-Bottom (TB)
    dagreGraph.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 40 });

    nodes.forEach((node) => {
        // We use a broader width for layout to prevent overlap
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

        return {
            ...node,
            position: {
                // Shift position so dagre center matches ReactFlow top-left anchor
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
            targetPosition: Position.Top,
            sourcePosition: Position.Bottom,
        };
    });

    return { nodes: layoutedNodes, edges };
};

export default function VisualizationMode({ slide }: VisualizationModeProps) {
    const { nodes, edges } = useMemo(() => { // Removed useNodesState/useEdgesState for static view stability
        if (!slide || !slide.title) return { nodes: [], edges: [] };

        const initialNodes: Node[] = [];
        const initialEdges: Edge[] = [];

        // Root Node
        initialNodes.push({
            id: 'root',
            position: { x: 0, y: 0 },
            data: { label: slide.title },
            // ... styling ...
            style: {
                background: '#1e1b4b',
                color: '#e0e7ff',
                border: '2px solid #6366f1',
                borderRadius: '16px',
                padding: '20px',
                width: 250, // Display width
                fontSize: '16px',
                fontWeight: 700,
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
            },
            type: 'default', // Changed from 'input' to 'default'
        });

        // Child Nodes
        slide.points.forEach((point, i) => {
            initialNodes.push({
                id: `p-${i}`,
                position: { x: 0, y: 0 },
                data: { label: point },
                style: {
                    background: '#27272a',
                    color: '#f4f4f5',
                    border: '1px solid #3f3f46',
                    borderRadius: '12px',
                    padding: '16px',
                    width: 250,
                    fontSize: '14px',
                },
                type: 'default',
            });

            initialEdges.push({
                id: `e-${i}`,
                source: 'root',
                target: `p-${i}`,
                type: 'smoothstep', // Better looking edges
                animated: true,
                style: { stroke: '#6366f1', strokeWidth: 2 },
            });
        });

        return getLayoutedElements(initialNodes, initialEdges);
    }, [slide]);

    // Force re-render key when slide changes to reset state completely
    // This fixes the "empty" issue by remounting ReactFlow on slide change

    if (nodes.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground border border-border rounded-3xl bg-zinc-950">
                <p>No content to visualize for this slide.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[600px] border border-border rounded-3xl overflow-hidden relative group bg-zinc-950">
            {/* ... Header ... */}
            <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 pointer-events-none">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20 w-fit backdrop-blur-md">
                    <Network className="w-3.5 h-3.5" />
                    <span>Mind Map View</span>
                </div>
                <h3 className="text-2xl font-bold ml-1 text-white shadow-black drop-shadow-md">{slide.title}</h3>
            </div>

            <ReactFlow
                key={slide.slide_no} // CRITICAL: This forces re-creation of the graph on slide change
                nodes={nodes}
                edges={edges}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.1}
                maxZoom={2}
                className="bg-zinc-950"
            // Removed onNodesChange/onEdgesChange to keep it read-only but interactive (draggable)
            >
                <Background color="#3f3f46" gap={25} size={1.5} />
                <Controls className="bg-zinc-900 border-zinc-800 fill-zinc-400" />
            </ReactFlow>

            {/* ... Footer ... */}
            <div className="absolute bottom-6 right-6 z-10 pointer-events-none">
                <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-950/50 backdrop-blur-md px-4 py-2 rounded-full border border-indigo-500/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    Generated from AI analysis
                </div>
            </div>
        </div>
    );
}
