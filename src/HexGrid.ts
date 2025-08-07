import { hexRadius } from "./constants";
import { HexCell } from "./HexCell";
import { hexTypeRegistry } from "./hexTypeRegistry";
import type { Renderer } from "./Renderer";
import type { AxialCoord } from "./types";

const angles = [0, Math.PI / 3, 2 * Math.PI / 3, Math.PI, -2 * Math.PI / 3, -Math.PI / 3];

function hexRound(qf: number, rf: number): AxialCoord {
    let q = Math.round(qf);
    let r = Math.round(rf);
    const s = -qf - rf;
    const sRounded = -q - r;

    const dq = Math.abs(q - qf);
    const dr = Math.abs(r - rf);
    const ds = Math.abs(sRounded - s);

    if (dq > dr && dq > ds) q = -r - sRounded;
    else if (dr > ds) r = -q - sRounded;

    return { q, r };
}

export class HexGrid {
    cells = new Map<string, HexCell>();
    renderer: Renderer;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        const qRange = Math.ceil(this.renderer.canvas.width / (hexRadius * 1.5)) + 2;
        const rRange = Math.ceil(this.renderer.canvas.height / (hexRadius * Math.sqrt(3))) + 2;
        for (let q = -qRange; q <= qRange; q++) {
            for (let r = -rRange; r <= rRange; r++) {
                const cell = new HexCell(q, r);
                this.cells.set(cell.key(), cell);
            }
        }

        renderer.canvas.addEventListener("click", (e) => {
            const rect = renderer.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left - renderer.canvas.width / 2;
            const y = e.clientY - rect.top - renderer.canvas.height / 2;
            const { q, r } = this.pixelToHex(x, y);
            const cell = this.getCell(q, r);
            if (cell) {
                cell.active = !cell.active;
                this.render();
            }
        });
    }

    getCell(q: number, r: number): HexCell | undefined {
        return this.cells.get(`${q},${r}`);
    }

    pixelToHex(x: number, y: number): AxialCoord {
        const q = (2 / 3 * x) / hexRadius;
        const r = (-1 / 3 * x + Math.sqrt(3) / 3 * y) / hexRadius;
        return hexRound(q, r);
    }

    render() {
        this.renderer.ctx.clearRect(0, 0, this.renderer.canvas.width, this.renderer.canvas.height);
        this.renderer.ctx.strokeStyle = "orange";
        this.renderer.ctx.lineWidth = 4;

        this.renderer.ctx.beginPath();
        for (const cell of this.cells.values()) {
            if (cell.active) {
                this.drawHexEdges(cell);
            }
        }
        this.renderer.ctx.stroke();
    }

    drawHexEdges(cell: HexCell) {
        const center = cell.center();
        const style = hexTypeRegistry.get(cell.typeId) || hexTypeRegistry.get("default")!;
        const colors = style.edgeColors;

        for (let i = 0; i < 6; i++) {
            const neighborCoords = cell.neighbor(i);
            const neighbor = this.getCell(neighborCoords.q, neighborCoords.r);

            if (neighbor && neighbor.active) continue; // Skip shared edge

            const angleA = angles[i];
            const angleB = angles[(i + 1) % 6];

            const x1 = center.x + hexRadius * Math.cos(angleA);
            const y1 = center.y + hexRadius * Math.sin(angleA);
            const x2 = center.x + hexRadius * Math.cos(angleB);
            const y2 = center.y + hexRadius * Math.sin(angleB);

            this.renderer.ctx.beginPath();
            this.renderer.ctx.strokeStyle = colors[i];
            this.renderer.ctx.moveTo(x1 + this.renderer.canvas.width / 2, y1 + this.renderer.canvas.height / 2);
            this.renderer.ctx.lineTo(x2 + this.renderer.canvas.width / 2, y2 + this.renderer.canvas.height / 2);
            this.renderer.ctx.stroke();
        }
    }

    renderLargeHexagonGrid(radius: number) {
        for (let q = -radius; q <= radius; q++) {
            const r1 = Math.max(-radius, -q - radius);
            const r2 = Math.min(radius, -q + radius);
            for (let r = r1; r <= r2; r++) {
                const cell = this.getCell(q, r);
                if (cell) cell.active = true;
            }
        }
    }

}    
