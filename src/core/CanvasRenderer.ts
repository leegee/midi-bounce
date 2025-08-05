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

    drawPolygon(vertices: { x: number, y: number }[]) {
        if (vertices.length < 3) return;
        this.ctx.beginPath();
        this.ctx.moveTo(vertices[0].x, vertices[0].y);
        this.ctx.strokeStyle = "orange";
        this.ctx.lineWidth = 13;

        for (let i = 1; i < vertices.length; i++) {
            this.ctx.lineTo(vertices[i].x, vertices[i].y);
        }
        this.ctx.closePath();
        this.ctx.stroke();
    }

    drawBall(position: { x: number, y: number }, radius: number = 10) {
        this.ctx.beginPath();
        this.ctx.fillStyle = "#00FFFF";
        this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.closePath();
    }
}
