import type { BounceData } from "./MIDIEmitter";

type Callback<T> = (data: T) => void;

interface EventMap {
    bounce: BounceData;
}

export class EventBus {
    private static listeners: {
        [K in keyof EventMap]?: Callback<EventMap[K]>[];
    } = {};

    static on<K extends keyof EventMap>(event: K, callback: Callback<EventMap[K]>) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event]!.push(callback);
    }

    static emit<K extends keyof EventMap>(event: K, data: EventMap[K]) {
        const callbacks = this.listeners[event];
        if (callbacks) {
            callbacks.forEach((cb) => cb(data));
        }
    }
}
