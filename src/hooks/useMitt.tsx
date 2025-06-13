import React, { useContext } from 'react';
import mitt from 'mitt';
import type { Emitter } from 'mitt';
import type { CCMEvents } from '@/types/events';

export const emitter = mitt<CCMEvents>();

export interface MittContextType {
    emitter: Emitter<CCMEvents>;
}

const MittContext = React.createContext<MittContextType>({ emitter });

export const MittProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    return <MittContext.Provider value={{ emitter }}>{children}</MittContext.Provider>;
};

export const useMitt = (): MittContextType => useContext(MittContext);
