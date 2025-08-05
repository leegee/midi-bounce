import { PhysicsEngine, Ball } from '../core/PhysicsEngine';
import { MIDIEmitter, type BounceData } from '../core/MIDIEmitter';
import { EventBus } from '../core/EventBus';
import { ExamplePlugin } from '../plugins/ExamplePlugin';
import { CanvasRenderer } from '../core/CanvasRenderer';
import { Polygon } from '../core/Geometry';

export class App {
    private physics: PhysicsEngine;
    private midi: MIDIEmitter;
    private plugin: ExamplePlugin;
    private renderer: CanvasRenderer;

    constructor() {
        // Initialize the ball at position (100,100) moving at (100, 120) px/s velocity
        const ball = new Ball({ x: 100, y: 100 }, { x: 100, y: 120 });
        this.physics = new PhysicsEngine(ball);

        // Add a sample hexagon shape at (200,200) with radius 50
        const hexagon = new Polygon(this.createHexagon(200, 200, 50));
        this.physics.addShape(hexagon);

        // Setup MIDI emitter and plugin processor
        this.midi = new MIDIEmitter();
        this.plugin = new ExamplePlugin();

        // Create canvas renderer and append to body
        this.renderer = new CanvasRenderer(document.body);

        // Listen for bounce events, process via plugin, then send MIDI
        EventBus.on('bounce', (data) => {
            const processed = this.plugin.processBounce(data);
            this.midi.emitBounceEvent(processed);
        });
    }

    async init() {
        await this.midi.init();
        requestAnimationFrame(this.update.bind(this));
    }

    private update(timestamp?: number) {
        const dt = 0.016; // Fixed timestep ~60fps

        this.physics.update(dt);

        this.renderer.clear();

        // Draw all shapes
        for (const shape of this.physics.shapes) {
            this.renderer.drawPolygon(shape.vertices);
        }

        // Draw the ball with radius 10
        this.renderer.drawBall(this.physics.ball.position, 10);

        requestAnimationFrame(this.update.bind(this));
    }

    // Helper to generate vertices of a hexagon centered at (cx, cy)
    private createHexagon(cx: number, cy: number, radius: number) {
        const vertices = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            vertices.push({
                x: cx + radius * Math.cos(angle),
                y: cy + radius * Math.sin(angle),
            });
        }
        return vertices;
    }
}
