import { hexRadius } from "./constants";
import type { AxialCoord, PixelCoord } from "./types";

export type HexTypeId = string;

export interface HexTypeStyle {
    name: string;
    edgeColors: string[]; // array of 6 colors, one per edge
    fillColor?: string;
}

const neighborDirs: AxialCoord[] = [
    { q: 1, r: 0 }, { q: 0, r: 1 }, { q: -1, r: 1 },
    { q: -1, r: 0 }, { q: 0, r: -1 }, { q: 1, r: -1 }
];

export class HexCell {
    q: number;
    r: number;
    active: boolean = false;
    typeId: HexTypeId;

    constructor(
        q: number,
        r: number,
        typeId: HexTypeId = 'default',
    ) {
        this.q = q;
        this.r = r;
        this.typeId = typeId;
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
