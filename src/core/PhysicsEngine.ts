// ------------------------ core/PhysicsEngine.ts ------------------------
import { type Vector, Polygon } from './Geometry';
import { MIDIEmitter, type BounceData } from './MIDIEmitter';
import { EventBus } from './EventBus';

export class Ball {
    position: Vector;
    velocity: Vector;

    constructor(position: Vector, velocity: Vector) {
        this.position = position;
        this.velocity = velocity;
    }

    updatePosition(dt: number) {
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    }
}

export class PhysicsEngine {
    shapes: Polygon[] = [];
    ball: Ball;

    constructor(ball: Ball) {
        this.ball = ball;
    }

    addShape(shape: Polygon) {
        this.shapes.push(shape);
    }

    update(dt: number) {
        this.ball.updatePosition(dt);
        this.checkCollisions();
    }

    private checkCollisions() {
        for (const shape of this.shapes) {
            // Placeholder: collision detection logic
            // On collision:
            const bounceData: BounceData = {
                angle: Math.random() * 360,  // Placeholder
                velocity: Math.hypot(this.ball.velocity.x, this.ball.velocity.y),
                edgeMaterial: 'metal',  // Placeholder
                edgeLight: 0.8,         // Placeholder
                edgeColor: { r: 255, g: 0, b: 0 }
            };

            EventBus.emit('bounce', bounceData);
        }
    }
}
