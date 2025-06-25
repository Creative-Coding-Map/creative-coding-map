import React, { useMemo, useState } from 'react';
import clsx from 'clsx';

export type ConnectionItem = { type: 'node' | 'link'; style: 'filled' | 'dashed' };
export type Shape = ConnectionItem & { y0: number; y1: number };

export interface ConnectionPathProps {
    connections: ConnectionItem[];
    className?: string;
}

const CIRCLE_RADIUS = 3; // px
const SVG_WIDTH = 8; // px, for some padding

const SVG_CX = SVG_WIDTH / 2;
const STROKE_WIDTH = 1;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
const DASHES = 4;
const DASH_GAP_PAIR = CIRCLE_CIRCUMFERENCE / DASHES;
const DASH_LENGTH = DASH_GAP_PAIR / 2;
const GAP_LENGTH = DASH_GAP_PAIR / 2;
const STROKE_DASHARRAY = `${DASH_LENGTH} ${GAP_LENGTH}`;
const STROKE_DASHOFFSET = `${DASH_GAP_PAIR / 4}`; // To center dashes at cardinal points

// This is the vertical distance between the centers of two consecutive circles.

export const ConnectionPath: React.FC<ConnectionPathProps> = ({ connections, className = '' }) => {
    const [height, setHeight] = useState<number>(0);

    const shapes = useMemo(() => {
        if (height === 0) return [];

        const gap = 8;
        const elementHeight = 24;
        const minY = elementHeight / 2;
        let cursor = minY - CIRCLE_RADIUS / 2;

        return connections.map((conn) => {
            const shape: Shape = {
                ...conn,
                y0: 0,
                y1: 0,
            };

            if (conn.type === 'node') {
                shape.y0 = cursor;
            } else {
                shape.y0 = cursor;
                shape.y1 = cursor + elementHeight + gap;
                cursor += elementHeight + gap;
            }
            return shape;
        });
    }, [height, connections]);

    if (connections.length === 0) {
        return null;
    }

    return (
        <div
            className={clsx(className, 'relative w-4 overflow-hidden')}
            ref={(node) => {
                if (node && height === 0) {
                    const newHeight = node.parentElement?.getBoundingClientRect().height;
                    setHeight(newHeight ?? 0);
                }
            }}
        >
            <svg viewBox={`0 -${CIRCLE_RADIUS / 2} ${SVG_WIDTH} ${height}`} className={clsx('ccm-invert')} height={height}>
                {shapes.map((shape) => {
                    const isFilled = shape.style === 'filled';
                    if (shape.type === 'node') {
                        return (
                            <circle
                                key={`${shape.type}-${shape.y0}${shape.y1}`}
                                cx={SVG_CX}
                                cy={shape.y0}
                                r={CIRCLE_RADIUS}
                                fill={isFilled ? 'currentColor' : 'none'}
                                stroke="currentColor"
                                strokeWidth={STROKE_WIDTH}
                                strokeDasharray={!isFilled ? STROKE_DASHARRAY : undefined}
                                strokeDashoffset={!isFilled ? STROKE_DASHOFFSET : undefined}
                            />
                        );
                    } else {
                        return (
                            <line
                                key={`${shape.type}-${shape.y0}${shape.y1}`}
                                x1={SVG_CX}
                                y1={shape.y0}
                                x2={SVG_CX}
                                y2={shape.y1}
                                stroke="currentColor"
                                strokeWidth={STROKE_WIDTH}
                                strokeDasharray={!isFilled ? STROKE_DASHARRAY : undefined}
                            />
                        );
                    }
                })}
            </svg>
        </div>
    );
};
