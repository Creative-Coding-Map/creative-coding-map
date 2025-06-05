'use client';

import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import ForceGraph2D from 'react-force-graph-2d';
import { CCMapController } from './CCMapController';
import type { ForceGraphProps } from 'react-force-graph-2d';
import type { CCMGraphData, CCMGraphLink, CCMGraphNode } from '@/types/ccmap';
import '@/styles/ccmap.css';

interface CCMapProps {
    className?: string;
}

const CCMap: React.FC<CCMapProps> = ({ className }) => {
    const fgRef = useRef<any>(null);
    const controllerRef = useRef<CCMapController | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [graphData, setGraphData] = useState<CCMGraphData | null>(null);
    const [runtimeProps, setRuntimeProps] = useState<ForceGraphProps<CCMGraphNode, CCMGraphLink>>({});

    useEffect(() => {
        const initializeGraph = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Create controller instance
                const controller = new CCMapController();
                controllerRef.current = controller;

                // Listen for graph data updates
                controller.on('graph-data:updated', (newGraphData: CCMGraphData | null) => {
                    setGraphData(newGraphData);
                });

                controller.on('runtime-props:updated', (newRuntimeProps: ForceGraphProps<CCMGraphNode, CCMGraphLink>) => {
                    setRuntimeProps(newRuntimeProps);
                });

                // Initialize data
                await controller.initialize();

                // Set the graph reference in the controller
                if (fgRef.current) {
                    controller.setGraphRef(fgRef.current);
                }

                setIsLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to initialize graph');
                setIsLoading(false);
            }
        };

        initializeGraph();

        // Cleanup on unmount
        return () => {
            if (controllerRef.current) {
                controllerRef.current.unsubscribeAll();
                controllerRef.current.destroy();
            }
        };
    }, []);

    useEffect(() => {
        console.log('graphData', graphData);
    }, [graphData]);

    // Handle graph ready
    const handleEngineStop = () => {
        if (fgRef.current) {
            // fgRef.current.zoomToFit(400);
        }
    };

    if (error) {
        return (
            <div className={clsx('ccmap-error', className)}>
                <div className="error-message">
                    <h3>Error Loading Graph</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (isLoading || !graphData || !controllerRef.current?.isInitialized()) {
        return (
            <div className={clsx('ccmap-container', className)}>
                <div className="ccmap-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading Creative Coding Map...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={clsx('ccmap', className)}>
            <ForceGraph2D
                // @ts-ignore - whiny typescript
                ref={(node: any) => {
                    if (node) {
                        console.log('setting graph ref', node);
                        controllerRef.current?.setGraphRef(node);
                    }
                    fgRef.current = node;
                }}
                graphData={graphData}
                width={typeof window !== 'undefined' ? window.innerWidth : 800}
                height={typeof window !== 'undefined' ? window.innerHeight : 600}
                onEngineStop={handleEngineStop}
                nodeAutoColorBy={controllerRef.current.getNodeAutoColorBy}
                linkVisibility={controllerRef.current.getLinkVisibility}
                onNodeClick={controllerRef.current.getNodeClickHandler}
                nodeCanvasObject={controllerRef.current.getNodeCanvasObject}
                nodePointerAreaPaint={controllerRef.current.getNodePointerAreaPaint}
                backgroundColor="white"
                d3AlphaDecay={0.01}
                {...runtimeProps}
            />
            {/* <div className="ccmap-inspectors">
                    <div id="path-inspector" className="inspector"></div>
                    <div id="item-inspector" className="inspector"></div>
                </div> */}
        </div>
    );
};

export default CCMap;
