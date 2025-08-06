let midiOutput: MIDIOutput | null = null;


/**
 * Initialize Web MIDI and select the first available output device.
 * Returns a promise that resolves once MIDI is ready.
 */
export function initMidi(matchDeviceName: string): Promise<void> {
    console.log('Init MIDI device ', matchDeviceName);
    return navigator.requestMIDIAccess()
        .then((midiAccess) => {
            const outputs = Array.from((midiAccess.outputs as Map<string, MIDIOutput>).values());
            console.log(outputs)
            if (outputs.length > 0) {
                midiOutput = outputs.find(o => o.name?.includes(matchDeviceName)) || null;
                if (!midiOutput) {
                    throw new Error(`Could not find an output containing "${matchDeviceName}".`);
                } else {
                    console.log("MIDI Output ready:", midiOutput.name);
                }
            } else {
                throw new Error("No MIDI output devices found.");
            }
        })
        .catch((err) => {
            console.error("Failed to get MIDI access", err);
            throw new Error(err);
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

    // console.log('NOTE ON', noteOnStatus, note, velocity);

    midiOutput.send([noteOnStatus, note, velocity]);
    setTimeout(() => {
        midiOutput?.send([noteOffStatus, note, 0]);
    }, 100);
}
