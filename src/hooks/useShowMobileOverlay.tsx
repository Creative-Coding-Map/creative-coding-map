import { useEffect } from 'react';
import { useIsMobile } from './useIsMobile';
import { useSessionStorageWithDefault } from './useSessionStorage';

export function useShowMobileOverlay(): [boolean, (show: boolean) => void] {
    const { isMobile } = useIsMobile();
    // use session storage to store the value
    const [showMobileOverlay, setShowMobileOverlay] = useSessionStorageWithDefault('mobile-overlay', isMobile);

    useEffect(() => {
        if (isMobile) {
            setShowMobileOverlay(true);
        }
    }, [isMobile]);

    return [showMobileOverlay, setShowMobileOverlay];
}
