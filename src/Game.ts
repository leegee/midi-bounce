import { Renderer } from "./Renderer";
import { HexGrid } from "./HexGrid";
import { Ball } from "./Ball";
import { reflectBallIfColliding, type CollisionInfo } from "./collisions";
import { sendMidiNoteOn } from "./MIDI";


export class Game {
    private animationFrameId: number | null = null;
    renderer: Renderer;
    grid: HexGrid;
    ball: Ball;
    animating: boolean = true;
    handleEscapeCallback?: () => void;

    constructor(canvas: HTMLCanvasElement, handleEscape?: () => void) {
        if (handleEscape) this.handleEscapeCallback = handleEscape;
        this.renderer = new Renderer(canvas);
        this.grid = new HexGrid(this.renderer);

        this.grid.getCell(0, 0)!.active = true;
        this.grid.getCell(0, 1)!.active = true;
        this.grid.getCell(1, 1)!.active = true;
        this.grid.getCell(1, 0)!.active = true;
        this.grid.getCell(1, -1)!.active = true;
        this.grid.getCell(1, -1)!.active = true;
        this.grid.getCell(0, -1)!.active = true;

        this.ball = new Ball(this.renderer, 0, 0, 1, 1);

        // todo tidy & remove
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === ' ') {
                this.toggleAnimation();
                return;
            }
            if (e.key === 'Escape' && this.handleEscapeCallback) {
                this.handleEscapeCallback();
                return;
            }
        });
    }

    setHandleEscapeCallback(callback: () => void) {
        this.handleEscapeCallback = callback;
    }

    start() {
        this.animate();
    }

    stop() {
        if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
    }

    toggleAnimation() {
        this.animating = !this.animating;
        if (this.animating) {
            this.start();
        } else if (this.animationFrameId !== null) {
            this.stop();
        }
    }

    // Could use RGB from CollisionInfo.edgeColor as three dims for sound
    private onCollision(info: CollisionInfo) {
        if (!this.animating) return;

        // Clamp speed to velocity
        const speed = Math.min(127, Math.floor(
            Math.sqrt(info.newVelocity.vx ** 2 + info.newVelocity.vy ** 2) * 10
        ));

        sendMidiNoteOn(speed, info.edgeNote);
    }

    private animate() {
        if (!this.animating) return;

        this.ball.move();
        reflectBallIfColliding(this.ball, this.grid, (info) => this.onCollision(info));

        this.grid.render();
        this.ball.render();

        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }
}
