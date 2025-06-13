import React from 'react';
import clsx from 'clsx';
import Connection from './Connection';
import type { ShapeProps } from './Connection';

type NodeStyle = { type?: 'filled' | 'dashed' };
type LinkStyle = { type?: 'dashed' };

export type ConnectionItem = { node: NodeStyle } | { link: LinkStyle };

export interface ConnectionPathProps {
    connections: ConnectionItem[];
    className?: string;
}

const mapNodeStyleToProps = (style?: NodeStyle): ShapeProps => ({
    filled: style?.type === 'filled',
    dashed: style?.type === 'dashed',
});

const mapLinkStyleToProps = (style?: LinkStyle) => ({
    dashed: style?.type === 'dashed',
});

// These constants are copied from Connection.tsx to calculate layout.
const CIRCLE_RADIUS = 3; // px
const CIRCLE_DIAMETER = 10; // px
const LINE_LENGTH = 24; // px
const SVG_HEIGHT = CIRCLE_DIAMETER * 2 + LINE_LENGTH; // 44px

// This is the vertical distance between the centers of two consecutive circles.
const Y_OFFSET = SVG_HEIGHT - 2 * CIRCLE_RADIUS; // 44 - 6 = 38px

const ConnectionPath: React.FC<ConnectionPathProps> = ({ connections, className = '' }) => {
    if (connections.length === 0) {
        return null;
    }

    const nodes: ShapeProps[] = [];
    const lines: { dashed?: boolean }[] = [];

    connections.forEach((item) => {
        if ('node' in item) {
            nodes.push(mapNodeStyleToProps(item.node));
        } else if ('link' in item) {
            lines.push(mapLinkStyleToProps(item.link));
        }
    });

    if (nodes.length === 0) {
        return null;
    }

    if (nodes.length === 1) {
        return (
            <div className={className}>
                <Connection source={nodes[0]} />
            </div>
        );
    }

    if (nodes.length !== lines.length + 1) {
        console.warn('ConnectionPath: The connections must alternate between nodes and links, starting and ending with a node.');
        return null;
    }

    const totalHeight = (lines.length - 1) * Y_OFFSET + SVG_HEIGHT - 4;

    return (
        <div className={clsx(className, 'relative w-4')} style={{ height: totalHeight }}>
            {lines.map((line, i) => (
                <div key={i} style={{ position: 'absolute', top: i * Y_OFFSET }}>
                    <Connection
                        className="w-2 h-10 ccm-invert"
                        source={i === 0 ? nodes[i] : undefined}
                        line={line}
                        destination={nodes[i + 1]}
                    />
                </div>
            ))}
        </div>
    );
};

export default ConnectionPath;
