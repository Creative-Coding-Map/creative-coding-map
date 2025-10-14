'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import ForceGraph2D from 'react-force-graph-2d';
import throttle from 'just-throttle';
import { fetchCCMData } from './fetch-data';
import { CCMapController } from './CCMapController';
import type { ForceGraphProps } from 'react-force-graph-2d';
import type { CCMGraphData, CCMGraphLink, CCMGraphNode } from '@/types/ccmap';
import { useRouter } from '@/lib/router';
import '@/styles/ccmap.css';
import { useEmitter } from '@/hooks/useEmitter';

interface CCMapProps {
    className?: string;
}

const CCMap: React.FC<CCMapProps> = ({ className }) => {
    const fgRef = useRef<any>(null);
    const { navigate } = useRouter();
    const controllerRef = useRef<CCMapController | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [graphData, setGraphData] = useState<CCMGraphData | null>(null);
    const [runtimeProps, setRuntimeProps] = useState<ForceGraphProps<CCMGraphNode, CCMGraphLink>>({});
    const { emitter } = useEmitter();
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

    useLayoutEffect(() => {
        const onGraphDataUpdated = (newGraphData: CCMGraphData | null) => {
            setGraphData(newGraphData);
        };
        const onRuntimePropsUpdated = (newRuntimeProps: ForceGraphProps<CCMGraphNode, CCMGraphLink>) => {
            setRuntimeProps(newRuntimeProps);
        };

        const onSelectedNodeChanged = (nodeId: string | null) => {
            if (nodeId) {
                const params = new URLSearchParams({ node: nodeId });
                console.log('navigating to', `//?${params.toString()}`);
                navigate(`/?${params.toString()}`);
            }
        };

        const resizeCanvas = throttle(
            () => {
                console.log('onResize');
                setDimensions({ width: window.innerWidth, height: window.innerHeight });
            },
            300,
            { leading: true, trailing: false }
        );

        const resizeObserver = new ResizeObserver(resizeCanvas);

        resizeObserver.observe(document.body);

        const initializeGraph = async () => {
            try {
                console.log('CCMap initializing');
                setError(null);

                // Create controller instance
                const controller = new CCMapController();

                controllerRef.current = controller;

                // Listen for graph data updates
                emitter.on('map:graph-data:updated', onGraphDataUpdated);
                emitter.on('map:runtime-props:updated', onRuntimePropsUpdated);
                emitter.on('map:selected-node:changed', onSelectedNodeChanged);

                const data = await fetchCCMData();

                controller.initialize(data);
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : 'Failed to initialize graph');
            }
        };

        initializeGraph();

        console.log('CCMap useOnLayoutMount');

        // Cleanup on unmount
        return () => {
            resizeObserver.disconnect();

            if (controllerRef.current) {
                // unbind event listeners
                emitter.off('map:graph-data:updated', onGraphDataUpdated);
                emitter.off('map:runtime-props:updated', onRuntimePropsUpdated);
                emitter.off('map:selected-node:changed', onSelectedNodeChanged);

                // destroy controller
                controllerRef.current.destroy();

                console.log('CCMap unmounted');
            }
        };
    }, [fgRef, emitter, navigate]);

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

    if (!controllerRef.current?.isInitialized()) {
        return (
            <div className={clsx('ccmap', className)}>
                <div className="ccmap-loading">
                    <div className="ccm-spinner-light"></div>
                    <p className="text-white dunkel:text-black">Loading Creative Coding Map...</p>
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
                        controllerRef.current?.setGraphRef(node);
                    }
                    fgRef.current = node;
                }}
                graphData={graphData!}
                width={dimensions.width}
                height={dimensions.height}
                // onEngineStop={handleEngineStop}
                nodeAutoColorBy={controllerRef.current.getNodeAutoColorBy}
                linkVisibility={controllerRef.current.getLinkVisibility}
                linkLineDash={controllerRef.current.getLinkLineDash}
                linkWidth={controllerRef.current.getLinkWidth}
                linkCanvasObject={controllerRef.current.getLinkCanvasObject}
                onNodeClick={controllerRef.current.getNodeClickHandler}
                onNodeHover={controllerRef.current.getNodeHoverHandler}
                enableNodeDrag={true}
                nodeCanvasObject={controllerRef.current.getNodeCanvasObject}
                nodePointerAreaPaint={controllerRef.current.getNodePointerAreaPaint}
                onZoom={controllerRef.current.onZoom}
                // backgroundColor="#f9f6fd"
                autoPauseRedraw={false}
                d3AlphaDecay={0.01}
                showPointerCursor
                {...runtimeProps}
            />
        </div>
    );
};

export default CCMap;
