import { PhysicsEngine } from '../core/PhysicsEngine';
import { MIDIEmitter } from '../core/MIDIEmitter';
import { EventBus } from '../core/EventBus';
import { ExamplePlugin } from '../plugins/ExamplePlugin';
import { CanvasRenderer } from '../core/CanvasRenderer';
import { Ball, findClosestEdge, Polygon, showContextMenu } from '../core/Geometry/';
import { ChangeHistory } from './ChangeHistory';

const BALL_RADIUS = 10;
const INITIAL_VELOCITY = { x: 100, y: 120 };

export class App {
    private physics: PhysicsEngine;
    private midi: MIDIEmitter;
    private plugin: ExamplePlugin;
    private renderer: CanvasRenderer;
    private draggingShape: Polygon | null = null;
    private lastMousePos = { x: 0, y: 0 };
    private history = new ChangeHistory();

    constructor() {
        this.renderer = new CanvasRenderer(document.body);

        this.setupMouseEvents();

        // Initialize ball
        const ball = new Ball(
            {
                x: this.renderer.width / 2,
                y: this.renderer.height / 2,
            },
            BALL_RADIUS,
            { ...INITIAL_VELOCITY }
        );
        this.physics = new PhysicsEngine(ball);

        // Add first draggable hexagon
        const hexagon = new Polygon(this.createHexagon(
            this.renderer.width / 2 - 150, // Offset position
            this.renderer.height / 2,
            100
        ));
        hexagon.draggable = true;
        this.physics.addShape(hexagon);

        const triangle = new Polygon(this.createHexagon(
            this.renderer.width / 2 + 250,
            this.renderer.height / 2 - 150,
            80
        ));
        triangle.draggable = true;
        this.physics.addShape(triangle);

        // MIDI setup
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

    private update() {
        const dt = 0.016; // Fixed timestep

        if (!this.draggingShape) {
            this.physics.update(dt);
        }

        this.renderer.clear();
        for (const shape of this.physics.shapes) {
            this.renderer.drawPolygon(shape);
        }
        this.renderer.drawBall(this.physics.ball.position, BALL_RADIUS);

        requestAnimationFrame(this.update.bind(this));
    }

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

    private calculatePolygonCenter(vertices: { x: number, y: number }[]) {
        let sumX = 0;
        let sumY = 0;
        for (const v of vertices) {
            sumX += v.x;
            sumY += v.y;
        }
        return { x: sumX / vertices.length, y: sumY / vertices.length };
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

            // Move vertices directly
            for (const v of this.draggingShape.vertices) {
                v.x += dx;
                v.y += dy;
            }

            // Snap ball to polygon center
            const center = this.calculatePolygonCenter(this.draggingShape.vertices);
            this.physics.ball.position.x = center.x;
            this.physics.ball.position.y = center.y;

            // During drag, velocity is frozen
            this.physics.ball.velocity.x = 0;
            this.physics.ball.velocity.y = 0;

            this.lastMousePos = { x: mouseX, y: mouseY };
        });

        canvas.addEventListener('mouseup', () => {
            if (this.draggingShape) {
                this.draggingShape = null;

                // On release, reset velocity to initial
                this.physics.ball.velocity = { ...INITIAL_VELOCITY };
            }
        });

        canvas.addEventListener('mouseleave', () => {
            this.draggingShape = null;
        });

        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();

            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;

            const hit = findClosestEdge(this.physics.shapes, { x: mouseX, y: mouseY });
            if (hit) {
                // Show context menu at cursor
                showContextMenu(e.clientX, e.clientY, () => {
                    hit.polygon.addHexagonAtEdge(hit.edgeIndex, 100, this.physics.shapes, this.history);
                });
            }
        });
    }
}

