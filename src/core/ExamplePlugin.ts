// ------------------------ plugins/ExamplePlugin.ts ------------------------
import { BounceData } from '../core/MIDIEmitter';

export class ExamplePlugin {
    processBounce(data: BounceData): BounceData {
        // Modify bounce data as a plugin (e.g., scale velocity)
        return {
            ...data,
            velocity: data.velocity * 1.2
        };
    }
}

