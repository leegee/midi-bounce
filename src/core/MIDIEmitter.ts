
// ------------------------ core/MIDIEmitter.ts ------------------------
export interface BounceData {
    angle: number;
    velocity: number;
    edgeMaterial: string;
    edgeLight: number;
    edgeColor: { r: number; g: number; b: number };
}

export class MIDIEmitter {
    private midiOut: MIDIOutput | null = null;

    async init() {
        const midiAccess = await navigator.requestMIDIAccess();
        if (midiAccess.outputs) {
            const outputs = Array.from((midiAccess.outputs as Map<string, MIDIOutput>).values());
            if (outputs.length > 0) {
                this.midiOut = outputs[0];
            }
        }
    }

    emitBounceEvent(data: BounceData) {
        if (!this.midiOut) return;

        // Example: Send a Note On (channel 1, middle C, velocity proportional to bounce velocity)
        const velocity = Math.min(127, Math.floor(data.velocity * 10));
        this.midiOut.send([0x90, 60, velocity]);

        // Send CC values for other parameters
        this.midiOut.send([0xB0, 20, Math.floor((data.angle / 360) * 127)]);  // CC 20 = Angle
        this.midiOut.send([0xB0, 21, Math.floor(data.edgeLight * 127)]);      // CC 21 = Light
        this.midiOut.send([0xB0, 22, data.edgeColor.r]);                     // CC 22 = Red
        this.midiOut.send([0xB0, 23, data.edgeColor.g]);                     // CC 23 = Green
        this.midiOut.send([0xB0, 24, data.edgeColor.b]);                     // CC 24 = Blue
    }
}
