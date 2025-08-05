// ------------------------ core/PhysicsEngine.ts ------------------------
import { Ball, Polygon } from './Geometry';
import { type BounceData } from './MIDIEmitter';
import { EventBus } from './EventBus';


export class PhysicsEngine {
    shapes: Polygon[] = [];
    ball: Ball;

    constructor(ball: Ball) {
        this.ball = ball;
    }

    addShape(shape: Polygon) {
        this.shapes.push(shape);
    }

    update(deltaTime: number) {
        this.checkCollisions();
        this.ball.updatePosition(deltaTime);
        this.ball.glow.update(deltaTime);
        for (const shape of this.shapes) {
            shape.glow.update(deltaTime);
        }
    }

    private checkCollisions() {
        for (const shape of this.shapes) {
            const vertices = shape.vertices;
            const numVertices = vertices.length;

            for (let i = 0; i < numVertices; i++) {
                const a = vertices[i];
                const b = vertices[(i + 1) % numVertices];  // Wrap around to close polygon

                // Collision detected
                if (this.circleLineCollision(this.ball.position, this.ball.radius, a, b)) {
                    // Reflect ball velocity
                    const edgeNormal = this.calculateEdgeNormal(a, b);
                    const dot = this.ball.velocity.x * edgeNormal.x + this.ball.velocity.y * edgeNormal.y;

                    this.ball.velocity.x -= 2 * dot * edgeNormal.x;
                    this.ball.velocity.y -= 2 * dot * edgeNormal.y;

                    shape.glow.trigger(1);
                    this.ball.glow.trigger(1);

                    //  Push ball slightly away to avoid "sticking"
                    this.ball.position.x += edgeNormal.x * 0.5;
                    this.ball.position.y += edgeNormal.y * 0.5;

                    // Emit MIDI Bounce Event with realistic values
                    const bounceData: BounceData = {
                        angle: Math.atan2(this.ball.velocity.y, this.ball.velocity.x) * (180 / Math.PI),
                        velocity: Math.hypot(this.ball.velocity.x, this.ball.velocity.y),
                        edgeMaterial: 'metal',              // TODO parametrize this per edge
                        edgeLight: 0.8,                     // "" ""
                        edgeColor: { r: 255, g: 0, b: 0 }   // "" ""
                    };

                    EventBus.emit('bounce', bounceData);
                    return;  // Exit after first collision this frame
                }
            }
        }
    }

    private circleLineCollision(circlePos: { x: number, y: number }, radius: number, a: { x: number, y: number }, b: { x: number, y: number }): boolean {
        const ab = { x: b.x - a.x, y: b.y - a.y };
        const ac = { x: circlePos.x - a.x, y: circlePos.y - a.y };

        const abLengthSq = ab.x * ab.x + ab.y * ab.y;
        const projection = (ac.x * ab.x + ac.y * ab.y) / abLengthSq;

        const closest = {
            x: a.x + projection * ab.x,
            y: a.y + projection * ab.y,
        };

        const distSq = (circlePos.x - closest.x) ** 2 + (circlePos.y - closest.y) ** 2;
        return distSq <= radius * radius;
    }

    private calculateEdgeNormal(a: { x: number, y: number }, b: { x: number, y: number }) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;

        // Perpendicular vector (swap & negate)
        const normal = { x: -dy, y: dx };

        // Normalize
        const length = Math.hypot(normal.x, normal.y);
        return { x: normal.x / length, y: normal.y / length };
    }

}
