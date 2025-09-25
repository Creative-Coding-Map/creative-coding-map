import { useEffect, useLayoutEffect, useRef } from 'react';
import type { DependencyList, EffectCallback } from 'react';

export function useOnLayoutMount(effect: EffectCallback, deps: DependencyList) {
    const initialized = useRef(false);

    useLayoutEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            effect();
        }
    }, deps);
}

export function useOnMount(effect: EffectCallback, deps: DependencyList) {
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            effect();
        }
    }, deps);
}
