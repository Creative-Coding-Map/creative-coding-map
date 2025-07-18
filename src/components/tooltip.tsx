import clsx from 'clsx';
import { createContext, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { Dispatch, ElementType, ReactNode, SetStateAction } from 'react';

export default function Tooltip({
    as: Component = 'div',
    className,
    tooltipClassName,
    message,
    children,
    forceShow = false,
    ...props
}: {
    as?: ElementType;
    className?: string;
    tooltipClassName?: string;
    message: React.ReactNode;
    children: React.ReactNode;
    forceShow?: boolean;
    [key: string]: any;
}) {
    const containerRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const updatePosition = () => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
            top: rect.top + window.scrollY,
            left: rect.right + window.scrollX + 8, // 8px offset to the right
        });
    };

    useLayoutEffect(() => {
        const handleMouseEnter = () => {
            updatePosition();
            setIsVisible(true);
        };

        const hideTooltip = () => {
            // should hide the tooltip
            setIsVisible(false);
        };

        const container = containerRef.current;

        if (container) {
            container.addEventListener('mouseenter', handleMouseEnter);
            container.addEventListener('mouseleave', hideTooltip);
            window.addEventListener('scroll', hideTooltip);
            window.addEventListener('resize', hideTooltip);

            return () => {
                container.removeEventListener('mouseenter', handleMouseEnter);
                container.removeEventListener('mouseleave', hideTooltip);
                window.removeEventListener('scroll', hideTooltip);
                window.removeEventListener('resize', hideTooltip);
            };
        }
    }, [isVisible, setIsVisible]);

    const tooltipPortal = createPortal(
        <AnimatePresence>
            {(isVisible || forceShow) && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={clsx('fixed min-w-max z-50 pointer-events-none', tooltipClassName)}
                    style={{
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                    }}
                >
                    <div className="flex max-w-xs flex-col items-center ccm-border ccm-rounded ccm-colors p-2">{message}</div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );

    return (
        <>
            <Component
                ref={containerRef}
                className={clsx('group/tooltip relative', isVisible || (forceShow && 'show-content'), className)}
                {...props}
            >
                {children}
            </Component>
            {tooltipPortal}
        </>
    );
}

// Global context to manage which Details is currently open
export const TooltipContext = createContext<{
    openId: string | null;
    setOpenId: Dispatch<SetStateAction<string | null>>;
} | null>(null);

// Provider for managing global Details state
export function TooltipProvider({ children }: { children: ReactNode }) {
    const [openId, setOpenId] = useState<string | null>(null);

    return <TooltipContext.Provider value={{ openId, setOpenId }}>{children}</TooltipContext.Provider>;
}
