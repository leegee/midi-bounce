import { PhysicsEngine } from '../core/PhysicsEngine';
import { MIDIEmitter, type BounceData } from '../core/MIDIEmitter';
import { EventBus } from '../core/EventBus';
import { ExamplePlugin } from '../plugins/ExamplePlugin';
import { CanvasRenderer } from '../core/CanvasRenderer';
import { Ball, Polygon, type Vector } from '../core/Geometry/';

const BALL_RADIUS = 10;
const INITIAL_VELOCITY = { x: 100, y: 120 };

export class App {
    private physics: PhysicsEngine;
    private midi: MIDIEmitter;
    private plugin: ExamplePlugin;
    private renderer: CanvasRenderer;
    private draggingShape: Polygon | null = null;
    private dragOffset: { x: number; y: number } = { x: 0, y: 0 };

    constructor() {
        this.renderer = new CanvasRenderer(document.body);
        this.setupMouseEvents();

        const ball = new Ball(
            { x: this.renderer.width / 2, y: this.renderer.height / 2 },
            BALL_RADIUS,
            { ...INITIAL_VELOCITY }
        );
        this.physics = new PhysicsEngine(ball);

        const hexagon = new Polygon(this.createHexagon(
            this.renderer.width / 2,
            this.renderer.height / 2,
            100
        ));
        hexagon.draggable = true;
        this.physics.addShape(hexagon);

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
        const dt = 0.016;

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

    private calculatePolygonCenter(vertices: { x: number, y: number }[]): { x: number, y: number } {
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
                    const center = this.calculatePolygonCenter(shape.vertices);
                    this.dragOffset = { x: mouseX - center.x, y: mouseY - center.y };
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

            const newCenterX = mouseX - this.dragOffset.x;
            const newCenterY = mouseY - this.dragOffset.y;

            const oldCenter = this.calculatePolygonCenter(this.draggingShape.vertices);
            const dx = newCenterX - oldCenter.x;
            const dy = newCenterY - oldCenter.y;

            // Move vertices by absolute delta
            for (const v of this.draggingShape.vertices) {
                v.x += dx;
                v.y += dy;
            }

            // Snap ball to polygon center
            this.physics.ball.position.x = newCenterX;
            this.physics.ball.position.y = newCenterY;

            // While dragging, ball velocity is zero
            this.physics.ball.velocity.x = 0;
            this.physics.ball.velocity.y = 0;

            this.update();
        });

        canvas.addEventListener('mouseup', () => {
            if (this.draggingShape) {
                const center = this.calculatePolygonCenter(this.draggingShape.vertices);
                this.physics.ball.position.x = center.x;
                this.physics.ball.position.y = center.y;
                this.physics.ball.velocity = { ...INITIAL_VELOCITY };
            }
            this.draggingShape = null;
        });

        canvas.addEventListener('mouseleave', () => {
            this.draggingShape = null;
        });
    }
}
