import mitt from 'mitt';
import type { Emitter, EventHandlerMap, EventType, Handler } from 'mitt';

export type Arguments<T> = [T] extends [(...args: infer U) => any] ? U : [T] extends [void] ? [] : [T];

export interface TypedEventEmitter<TEvents> {
    on: <TEvent extends keyof TEvents>(event: TEvent, listener: TEvents[TEvent]) => void;
    off: <TEvent extends keyof TEvents>(event: TEvent, listener: TEvents[TEvent]) => void;
    emit: <TEvent extends keyof TEvents>(event: TEvent, ...args: Arguments<TEvents[TEvent]>) => void;
    unsubscribeAll: () => void;
}

/**
 * A wrapper class for the mitt event emitter that provides type-safe event handling.
 * @template Events - A record type mapping event names to their handler function types
 * @example
 * interface WebSocketEvents {
 * 	open: (event: Event) => void;
 * 	message: (event: MessageEvent) => void;
 * 	close: (event: CloseEvent) => void;
 * 	error: (event: Event) => void;
 * 	reconnect: (tries: number) => void;
 * 	ping: () => void;
 * 	pong: () => void;
 * }
 * export class WebSocket extends (EventEmitter as new () => TypedEventEmitter<WebSocketEvents>) {}
 */
export class EventEmitter<TEvents extends Record<EventType, unknown>> {
    /** The underlying mitt event emitter instance */
    private mitt: Emitter<TEvents>;

    /**
     * Creates a new EventEmitter instance
     * @param e - Optional initial event handler map
     */
    constructor(e?: EventHandlerMap<TEvents>) {
        this.mitt = mitt(e);
    }

    /**
     * Gets all registered event handlers
     * @returns A map of all event handlers
     */
    get all(): EventHandlerMap<TEvents> {
        return this.mitt.all;
    }

    /**
     * Registers an event handler for a specific event type
     * @param type - The event type to listen for
     * @param handler - The handler function to call when the event occurs
     */
    on<TKey extends keyof TEvents>(type: TKey, handler: Handler<TEvents[TKey]>): void {
        this.mitt.on(type, handler);
    }

    /**
     * Removes an event handler for a specific event type
     * @param type - The event type to remove the handler from
     * @param handler - Optional specific handler to remove. If not provided, removes all handlers for the type
     */
    off<TKey extends keyof TEvents>(type: TKey, handler?: Handler<TEvents[TKey]>): void {
        this.mitt.off(type, handler);
    }

    /**
     * Emits an event of the specified type
     * @param type - The event type to emit
     * @param event - Optional event data to pass to handlers
     */
    emit<TEvent extends keyof TEvents>(type: TEvent, event?: TEvents[TEvent]): void;
    emit(type: '*', event?: any): void {
        this.mitt.emit(type, event);
    }

    /**
     * Unsubscribes from all events
     */
    unsubscribeAll(): void {
        this.mitt.off('*');
    }
}
