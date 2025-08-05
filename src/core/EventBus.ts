
// ------------------------ core/EventBus.ts ------------------------
type Callback<T> = (data: T) => void;

export class EventBus {
    private static listeners: { [event: string]: Callback<any>[] } = {};

    static on<T>(event: string, callback: Callback<T>) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    static emit<T>(event: string, data: T) {
        const callbacks = this.listeners[event];
        if (callbacks) {
            callbacks.forEach(cb => cb(data));
        }
    }
}

