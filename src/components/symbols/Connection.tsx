import React from 'react';
import clsx from 'clsx';

export interface ShapeProps {
    dashed?: boolean;
    filled?: boolean;
}

interface ConnectionProps {
    source?: ShapeProps;
    line?: ShapeProps & { hidden?: boolean };
    destination?: ShapeProps;
    className?: string;
}

const CIRCLE_RADIUS = 3; // px
const CIRCLE_DIAMETER = 10; // px
const LINE_LENGTH = 24; // px
const SVG_WIDTH = 8; // px, for some padding
const SVG_HEIGHT = CIRCLE_DIAMETER * 2 + LINE_LENGTH; // 4 + 24 + 4 = 32px
const STROKE_WIDTH = 1;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
const DASHES = 4;
const DASH_GAP_PAIR = CIRCLE_CIRCUMFERENCE / DASHES;
const DASH_LENGTH = DASH_GAP_PAIR / 2;
const GAP_LENGTH = DASH_GAP_PAIR / 2;
const STROKE_DASHARRAY = `${DASH_LENGTH} ${GAP_LENGTH}`;
const STROKE_DASHOFFSET = `${DASH_GAP_PAIR / 4}`; // To center dashes at cardinal points

const Connection: React.FC<ConnectionProps> = ({ source, line, destination, className }) => {
    // X center
    const cx = SVG_WIDTH / 2;
    // Y positions
    const topY = CIRCLE_RADIUS;
    const bottomY = SVG_HEIGHT - CIRCLE_RADIUS;
    const lineY1 = topY + CIRCLE_RADIUS;
    const lineY2 = bottomY - CIRCLE_RADIUS;
    return (
        <svg
            viewBox={`0 -1 ${SVG_WIDTH} ${SVG_HEIGHT + 2}`}
            className={clsx(className, 'ccm-invert')}
            style={{ display: 'block' }}
        >
            {/* Top Circle */}
            {source && (
                <circle
                    cx={cx}
                    cy={topY}
                    r={CIRCLE_RADIUS}
                    fill={source.filled ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth={STROKE_WIDTH}
                    strokeDasharray={source.dashed ? STROKE_DASHARRAY : undefined}
                    strokeDashoffset={source.dashed ? STROKE_DASHOFFSET : undefined}
                />
            )}
            {/* Line */}
            {line && (
                <line
                    x1={cx}
                    y1={lineY1}
                    x2={cx}
                    y2={lineY2}
                    stroke="currentColor"
                    strokeWidth={STROKE_WIDTH}
                    strokeDasharray={line.dashed ? STROKE_DASHARRAY : undefined}
                />
            )}
            {/* Bottom Circle */}
            {destination && (
                <circle
                    cx={cx}
                    cy={bottomY}
                    r={CIRCLE_RADIUS}
                    fill={destination.filled ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth={STROKE_WIDTH}
                    strokeDasharray={destination.dashed ? STROKE_DASHARRAY : undefined}
                    strokeDashoffset={destination.dashed ? STROKE_DASHOFFSET : undefined}
                />
            )}
        </svg>
    );
};

export default Connection;
