import { PhysicsEngine } from '../core/PhysicsEngine';
import { MIDIEmitter, type BounceData } from '../core/MIDIEmitter';
import { EventBus } from '../core/EventBus';
import { ExamplePlugin } from '../plugins/ExamplePlugin';
import { CanvasRenderer } from '../core/CanvasRenderer';
import { Ball, Polygon } from '../core/Geometry/';

const BALL_RADIUS = 10;
export class App {
    private physics: PhysicsEngine;
    private midi: MIDIEmitter;
    private plugin: ExamplePlugin;
    private renderer: CanvasRenderer;
    private draggingShape: Polygon | null = null;
    private lastMousePos: { x: number; y: number } = { x: 0, y: 0 };
    private dragOffset: { x: number; y: number } = { x: 0, y: 0 };

    constructor() {
        // Create canvas renderer and append to body
        this.renderer = new CanvasRenderer(document.body);

        this.setupMouseEvents();

        // Initialize the ball at position (100,100) moving at (100, 120) px/s velocity
        const ball = new Ball(
            {
                x: this.renderer.width / 2,
                y: this.renderer.height / 2,
            },
            BALL_RADIUS,
            {
                x: 100,
                y: 120
            }
        );
        this.physics = new PhysicsEngine(ball);

        // Add a sample hexagon shape at center with radius 100
        const hexagon = new Polygon(
            this.createHexagon(
                this.renderer.width / 2,
                this.renderer.height / 2,
                100
            )
        );
        this.physics.addShape(hexagon);

        // Setup MIDI emitter and plugin processor
        this.midi = new MIDIEmitter();
        this.plugin = new ExamplePlugin();

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
            this.renderer.drawPolygon(shape);
        }

        // Draw the ball with radius 10
        this.renderer.drawBall(this.physics.ball.position, BALL_RADIUS);

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

    private setupMouseEvents() {
        const canvas = this.renderer.getCanvas();

        canvas.addEventListener('mousedown', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;

            for (const shape of this.physics.shapes) {
                if (shape.draggable && shape.containsPoint(mouseX, mouseY)) {
                    this.draggingShape = shape;
                    this.lastMousePos = { x: mouseX, y: mouseY };
                    break;
                }
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!this.draggingShape) return;

            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;

            const dx = mouseX - this.lastMousePos.x;
            const dy = mouseY - this.lastMousePos.y;

            // Move each vertex by delta
            for (const v of this.draggingShape.vertices) {
                v.x += dx;
                v.y += dy;
            }

            this.lastMousePos = { x: mouseX, y: mouseY };
            this.update();
        });

        canvas.addEventListener('mouseup', () => {
            this.draggingShape = null;
        });

        canvas.addEventListener('mouseleave', () => {
            this.draggingShape = null;
        });

    }
}
