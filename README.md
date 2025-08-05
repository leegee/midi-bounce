# midi-bounce

To install dependencies:

```bash
bun install
```

To run:

```bash
bun dev
```

This project was created using `bun init` in bun v1.1.32. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.


Project Structure Outline:

    src/
    ├── core/
    │   ├── Geometry.ts                Shapes and collision detection
    │   ├── PhysicsEngine.ts           Motion, collisions, response
    │   ├── MIDIEmitter.ts             WebMIDI I/O and event sending
    │   └── EventBus.ts                Simple pub/sub for events
    ├── plugins/
    │   └── ExamplePlugin.ts           Example MIDI Plugin
    ├── components/
    │   └── PluginSlot.ts              WebComponent wrapper for plugin GUIs
    ├── app/
    │   └── App.ts                     Main App bootstrap
    └── main.ts                        Vite entry point
