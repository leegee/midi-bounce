const hexRadius = 40;
const canvas = document.getElementById('hexCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

type AxialCoord = { q: number; r: number };
type PixelCoord = { x: number; y: number };

const neighborDirs: AxialCoord[] = [
    { q: 1, r: 0 }, { q: 0, r: 1 }, { q: -1, r: 1 },
    { q: -1, r: 0 }, { q: 0, r: -1 }, { q: 1, r: -1 }
];

class HexCell {
    q: number;
    r: number;
    active: boolean = false;
    constructor(q: number, r: number) {
        this.q = q;
        this.r = r;
    }

    center(): PixelCoord {
        const x = hexRadius * 3 / 2 * this.q;
        const y = hexRadius * Math.sqrt(3) * (this.r + this.q / 2);
        return { x, y };
    }

    neighbor(direction: number): AxialCoord {
        const dir = neighborDirs[direction];
        return { q: this.q + dir.q, r: this.r + dir.r };
    }

    key(): string {
        return `${this.q},${this.r}`;
    }
}

class HexGrid {
    cells = new Map<string, HexCell>();

    constructor(widthPx: number, heightPx: number) {
        const qRange = Math.ceil(widthPx / (hexRadius * 1.5)) + 2;
        const rRange = Math.ceil(heightPx / (hexRadius * Math.sqrt(3))) + 2;
        for (let q = -qRange; q <= qRange; q++) {
            for (let r = -rRange; r <= rRange; r++) {
                const cell = new HexCell(q, r);
                this.cells.set(cell.key(), cell);
            }
        }
    }

    getCell(q: number, r: number): HexCell | undefined {
        return this.cells.get(`${q},${r}`);
    }

    pixelToHex(x: number, y: number): AxialCoord {
        const q = (2 / 3 * x) / hexRadius;
        const r = (-1 / 3 * x + Math.sqrt(3) / 3 * y) / hexRadius;
        return hexRound(q, r);
    }
}

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

function drawHexEdges(cell: HexCell, grid: HexGrid) {
    const center = cell.center();
    const angles = [0, Math.PI / 3, 2 * Math.PI / 3, Math.PI, -2 * Math.PI / 3, -Math.PI / 3];

    for (let i = 0; i < 6; i++) {
        const neighborCoords = cell.neighbor(i);
        const neighbor = grid.getCell(neighborCoords.q, neighborCoords.r);

        if (neighbor && neighbor.active) continue; // Skip shared edge

        const angleA = angles[i];
        const angleB = angles[(i + 1) % 6];

        const x1 = center.x + hexRadius * Math.cos(angleA);
        const y1 = center.y + hexRadius * Math.sin(angleA);
        const x2 = center.x + hexRadius * Math.cos(angleB);
        const y2 = center.y + hexRadius * Math.sin(angleB);

        ctx.moveTo(x1 + canvas.width / 2, y1 + canvas.height / 2);
        ctx.lineTo(x2 + canvas.width / 2, y2 + canvas.height / 2);
    }
}

function render(grid: HexGrid) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#EEF";
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (const cell of grid.cells.values()) {
        if (cell.active) {
            drawHexEdges(cell, grid);
        }
    }
    ctx.stroke();
}

const grid = new HexGrid(canvas.width, canvas.height);

const centerCell = grid.getCell(0, 0);
if (centerCell) {
    centerCell.active = true;
}

render(grid);

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvas.width / 2;
    const y = e.clientY - rect.top - canvas.height / 2;
    const { q, r } = grid.pixelToHex(x, y);
    const cell = grid.getCell(q, r);
    if (cell) {
        cell.active = !cell.active;
        render(grid);
    }
});
