import type { Polygon } from "./Geometry/";

export class CanvasRenderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    public width = 800;
    public height = 600;

    constructor(container: HTMLElement) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        container.appendChild(this.canvas);

        const context = this.canvas.getContext('2d');
        if (!context) throw new Error('Canvas context not available');
        this.ctx = context;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawPolygon(shape: Polygon) {
        if (shape.vertices.length < 3) return;

        shape.transformedVertices();

        if (shape.glow.glowIntensity > 0) {
            shape.glow.update();
            const glowAlpha = shape.glow.glowIntensity * 0.5;  // Max opacity 0.5
            const glowSize = 20 * shape.glow.glowIntensity;    // Glow blur radius

            this.ctx.save();  // Save state before applying glow
            this.ctx.shadowColor = `rgba(255, 255, 0, ${glowAlpha})`;  // Yellow glow
            this.ctx.shadowBlur = glowSize;
        }

        this.ctx.beginPath();
        this.ctx.strokeStyle = "orange";
        this.ctx.lineWidth = 13;
        this.ctx.moveTo(shape.vertices[0].x, shape.vertices[0].y);
        for (let i = 1; i < shape.vertices.length; i++) {
            this.ctx.lineTo(shape.vertices[i].x, shape.vertices[i].y);
        }
        this.ctx.closePath();
        this.ctx.stroke();

        if (shape.glow.glowIntensity > 0) {
            this.ctx.restore();
        }
    }

    drawBall(position: { x: number, y: number }, radius: number = 10) {
        this.ctx.beginPath();
        this.ctx.fillStyle = "#00FFFF";
        this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.closePath();
    }

    getCanvas() {
        return this.canvas;
    }
}
