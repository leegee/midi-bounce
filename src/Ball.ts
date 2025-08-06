import type { Renderer } from "./Renderer";

export class Ball {
    renderer: Renderer;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number = 8;

    constructor(renderer: Renderer, x: number, y: number, vx: number, vy: number) {
        this.renderer = renderer;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
    }

    move() {
        this.x += this.vx;
        this.y += this.vy;
    }

    render() {
        this.renderer.ctx.beginPath();
        this.renderer.ctx.arc(
            this.x + this.renderer.canvas.width / 2,
            this.y + this.renderer.canvas.height / 2,
            this.radius, 0,
            Math.PI * 2
        );
        this.renderer.ctx.fillStyle = "lime";
        this.renderer.ctx.fill();
    }
}

