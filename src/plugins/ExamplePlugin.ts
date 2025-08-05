// ------------------------ plugins/ExamplePlugin.ts ------------------------
import { type BounceData } from '../core/MIDIEmitter';

export class ExamplePlugin {
    processBounce(data: BounceData): BounceData {
        return {
            ...data,
            velocity: data.velocity * 1.2
        };
    }
}

