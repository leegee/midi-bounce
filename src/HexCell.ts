import { hexRadius } from "./constants";
import type { AxialCoord, PixelCoord } from "./types";

const neighborDirs: AxialCoord[] = [
    { q: 1, r: 0 }, { q: 0, r: 1 }, { q: -1, r: 1 },
    { q: -1, r: 0 }, { q: 0, r: -1 }, { q: 1, r: -1 }
];

export class HexCell {
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
