const canvas = document.getElementById('hexCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const hexRadius = 30;

// Flat-topped hexagon neighbor directions (q, r offsets)
const neighborDirections = [
    { q: +1, r: 0 },  // East
    { q: 0, r: -1 },  // NorthEast
    { q: -1, r: -1 }, // NorthWest
    { q: -1, r: 0 },  // West
    { q: 0, r: +1 },  // SouthWest
    { q: +1, r: +1 }  // SouthEast
];

// Flat-topped hexagon corner angles
const cornerAngles = [0, Math.PI / 3, 2 * Math.PI / 3, Math.PI, -2 * Math.PI / 3, -Math.PI / 3];

class HexCell {
    q: number;
    r: number;
    x: number;
    y: number;
    active: boolean = false;

    constructor(q: number, r: number, x: number, y: number) {
        this.q = q;
        this.r = r;
        this.x = x;
        this.y = y;
    }
}

class HexGrid {
    radius: number;
    cells: Map<string, HexCell>;

    constructor(radius: number, widthPx: number, heightPx: number) {
        this.radius = radius;
        this.cells = new Map();

        const dx = radius * 3 / 2;
        const dy = Math.sqrt(3) * radius;

        const qMin = Math.floor(-widthPx / dx) - 2;
        const qMax = Math.ceil(widthPx / dx) + 2;
        const rMin = Math.floor(-heightPx / dy) - 2;
        const rMax = Math.ceil(heightPx / dy) + 2;

        for (let q = qMin; q <= qMax; q++) {
            for (let r = rMin; r <= rMax; r++) {
                const x = dx * q;
                const y = dy * (r + q / 2);
                this.cells.set(`${q},${r}`, new HexCell(q, r, x, y));
            }
        }
    }

    getCell(q: number, r: number): HexCell | undefined {
        return this.cells.get(`${q},${r}`);
    }
}

function pixelToHex(x: number, y: number, radius: number): { q: number; r: number } {
    const qf = (2 / 3 * x) / radius;
    const rf = ((-1 / 3 * x) + (Math.sqrt(3) / 3 * y)) / radius;

    let q = Math.round(qf);
    let r = Math.round(rf);
    const s = -qf - rf;

    const dq = Math.abs(q - qf);
    const dr = Math.abs(r - rf);
    const ds = Math.abs(-q - r - s);

    if (dq > dr && dq > ds) {
        q = -r - Math.round(s);
    } else if (dr > ds) {
        r = -q - Math.round(s);
    }

    return { q, r };
}

function renderGrid(ctx: CanvasRenderingContext2D, grid: HexGrid) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.lineWidth = 2;
    const R = grid.radius;

    for (const cell of grid.cells.values()) {
        if (!cell.active) continue;

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const neighbor = grid.getCell(cell.q + neighborDirections[i].q, cell.r + neighborDirections[i].r);
            if (neighbor && neighbor.active) continue;

            const angleA = cornerAngles[i];
            const angleB = cornerAngles[(i + 1) % 6];

            const x1 = cell.x + R * Math.cos(angleA);
            const y1 = cell.y + R * Math.sin(angleA);
            const x2 = cell.x + R * Math.cos(angleB);
            const y2 = cell.y + R * Math.sin(angleB);

            ctx.moveTo(x1 + ctx.canvas.width / 2, y1 + ctx.canvas.height / 2);
            ctx.lineTo(x2 + ctx.canvas.width / 2, y2 + ctx.canvas.height / 2);
        }
        ctx.strokeStyle = "orange";
        ctx.stroke();
    }
}

const grid = new HexGrid(hexRadius, canvas.width, canvas.height);
renderGrid(ctx, grid);

canvas.addEventListener("click", (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvas.width / 2;
    const y = e.clientY - rect.top - canvas.height / 2;

    const { q, r } = pixelToHex(x, y, hexRadius);
    const cell = grid.getCell(q, r);
    if (cell) {
        cell.active = !cell.active;
        renderGrid(ctx, grid);
    }
});
