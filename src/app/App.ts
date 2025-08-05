
// ------------------------ app/App.ts ------------------------
import { PhysicsEngine, Ball } from '../core/PhysicsEngine';
import { MIDIEmitter } from '../core/MIDIEmitter';
import { EventBus } from '../core/EventBus';
import { ExamplePlugin } from '../plugins/ExamplePlugin';

export class App {
    private physics: PhysicsEngine;
    private midi: MIDIEmitter;
    private plugin: ExamplePlugin;

    constructor() {
        const ball = new Ball({ x: 100, y: 100 }, { x: 1, y: 1 });
        this.physics = new PhysicsEngine(ball);
        this.midi = new MIDIEmitter();
        this.plugin = new ExamplePlugin();

        EventBus.on('bounce', (data) => {
            const processed = this.plugin.processBounce(data);
            this.midi.emitBounceEvent(processed);
        });
    }

    async init() {
        await this.midi.init();
        requestAnimationFrame(this.update.bind(this));
    }

    private update(timestamp: number) {
        this.physics.update(0.016);  // Assuming 60 FPS fixed timestep
        requestAnimationFrame(this.update.bind(this));
    }
}

