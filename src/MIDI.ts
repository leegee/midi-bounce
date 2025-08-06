let midiOutput: MIDIOutput | null = null;

/**
 * Initialize Web MIDI and select the first available output device.
 * Returns a promise that resolves once MIDI is ready.
 */
export function initMidi(): Promise<void> {
    return navigator.requestMIDIAccess()
        .then((midiAccess) => {
            const outputs = Array.from((midiAccess.outputs as Map<string, MIDIOutput>).values());
            if (outputs.length > 0) {
                midiOutput = outputs[0];
                console.log("MIDI Output ready:", midiOutput.name);
            } else {
                console.warn("No MIDI output devices found.");
            }
        })
        .catch((err) => {
            console.error("Failed to get MIDI access", err);
        });
}

/**
 * Send a MIDI Note On message followed by Note Off after 100 ms.
 * @param velocity MIDI velocity 0-127
 * @param note MIDI note number (default 60 = Middle C)
 * @param channel MIDI channel (0-15, default 0)
 */
export function sendMidiNoteOn(
    velocity: number,
    note: number = 60,
    channel: number = 0
): void {
    if (!midiOutput) {
        console.warn("No MIDI output device available.");
        return;
    }

    const noteOnStatus = 0x90 + channel;
    const noteOffStatus = 0x80 + channel;

    console.log('NOTE ON', noteOnStatus, note, velocity);

    midiOutput.send([noteOnStatus, note, velocity]);
    setTimeout(() => {
        midiOutput?.send([noteOffStatus, note, 0]);
    }, 100);
}
