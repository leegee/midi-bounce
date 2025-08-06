import { Renderer } from "./Renderer";
import { HexGrid } from "./HexGrid";
import { Ball } from "./Ball";
import { reflectBallIfColliding, type CollisionInfo } from "./collisions";
import { sendMidiNoteOn } from "./MIDI";

export class Game {
    renderer: Renderer;
    grid: HexGrid;
    ball: Ball;
    animating: boolean = true;

    constructor(canvas: HTMLCanvasElement) {
        this.renderer = new Renderer(canvas);
        this.grid = new HexGrid(this.renderer);
        this.grid.getCell(0, 0)!.active = true;

        this.ball = new Ball(this.renderer, 0, 0, 1, 1);

        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === ' ') {
                this.toggleAnimation();
            }
        });
    }

    start() {
        this.animate();
    }

    toggleAnimation() {
        this.animating = !this.animating;
        if (this.animating) this.animate();
    }

    private onCollision(info: CollisionInfo) {
        if (!this.animating) return;
        const speed = Math.min(127, Math.floor(
            Math.sqrt(info.newVelocity.vx ** 2 + info.newVelocity.vy ** 2) * 10
        ));
        sendMidiNoteOn(speed);
    }

    private animate() {
        this.ball.move();
        reflectBallIfColliding(this.ball, this.grid, (info) => this.onCollision(info));

        this.grid.render();
        this.ball.render();

        if (this.animating) {
            requestAnimationFrame(() => this.animate());
        }
    }
}
