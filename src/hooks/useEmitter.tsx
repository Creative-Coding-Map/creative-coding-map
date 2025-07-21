import React, { useContext } from 'react';
import Emittery from 'emittery';
import type { CCMEvents } from '@/types/events';

export const emitter = new Emittery<CCMEvents>();

export interface EmitterContextType {
    emitter: Emittery<CCMEvents>;
}

const EmitterContext = React.createContext<EmitterContextType>({ emitter });

export const EmitterProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    return <EmitterContext.Provider value={{ emitter }}>{children}</EmitterContext.Provider>;
};

export const useEmitter = (): EmitterContextType => useContext(EmitterContext);
