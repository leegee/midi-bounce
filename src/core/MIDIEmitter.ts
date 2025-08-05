
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
        try {
            // Request access with no SysEx (more browsers allow this by default)
            const midiAccess = await navigator.requestMIDIAccess({ sysex: false });

            // Select first available output device
            // const outputs = Array.from(midiAccess.outputs.values());
            const outputs = Array.from((midiAccess.outputs as Map<string, MIDIOutput>).values());

            if (outputs.length === 0) {
                console.warn('No MIDI output devices found.');
            } else {
                this.midiOut = outputs[0];
                console.log('MIDI output selected:', this.midiOut.name);
            }

            // Listen for device connection/disconnection events (optional)
            midiAccess.onstatechange = (event) => {
                if (!event.port) return;
                console.log(`MIDI device ${event.port.name} ${event.port.state}`);
            };
        } catch (err) {
            console.error('Failed to get MIDI access:', err);
        }
    }

    emitBounceEvent(data: BounceData) {
        if (!this.midiOut) return;

        // Clamp helper
        const clamp7bit = (v: number) => Math.min(127, Math.max(0, Math.floor(v)));

        const velocity = clamp7bit(data.velocity * 10);
        const angleCC = clamp7bit((data.angle / 360) * 127);
        const lightCC = clamp7bit(data.edgeLight * 127);

        // Assuming edgeColor r,g,b are 0-255; scale to 0-127
        const rCC = clamp7bit((data.edgeColor.r / 255) * 127);
        const gCC = clamp7bit((data.edgeColor.g / 255) * 127);
        const bCC = clamp7bit((data.edgeColor.b / 255) * 127);

        try {
            this.midiOut.send([0x90, 60, velocity]); // Note On, middle C

            this.midiOut.send([0xB0, 20, angleCC]);
            this.midiOut.send([0xB0, 21, lightCC]);
            this.midiOut.send([0xB0, 22, rCC]);
            this.midiOut.send([0xB0, 23, gCC]);
            this.midiOut.send([0xB0, 24, bCC]);
        } catch (e) {
            console.error('Failed to send MIDI message:', e);
        }
    }
}
