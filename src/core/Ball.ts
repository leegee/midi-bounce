import { type Vector } from './Geometry';

export class Ball {
    position: Vector;
    radius: number;
    velocity: Vector;

    constructor(position: Vector, radius: number, velocity: Vector,) {
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
    }

    updatePosition(dt: number) {
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    }
}
