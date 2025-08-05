import { type Vector, GlowComponent } from ".";
import type { ChangeHistory, SceneChange } from "../../app/ChangeHistory";

export class Polygon {
    vertices: { x: number; y: number }[];
    offset: { x: number; y: number } = { x: 0, y: 0 };
    glow: GlowComponent = new GlowComponent();
    draggable: boolean = true;
    lineWidth = 10;

    constructor(vertices: { x: number; y: number }[]) {
        this.vertices = vertices;
    }

    getEdges(): Vector[] {
        const edges: Vector[] = [];
        for (let i = 0; i < this.vertices.length; i++) {
            const next = (i + 1) % this.vertices.length;
            edges.push({
                x: this.vertices[next].x - this.vertices[i].x,
                y: this.vertices[next].y - this.vertices[i].y
            });
        }
        return edges;
    }

    getTransformedVertices(): { x: number; y: number }[] {
        return this.vertices.map(v => ({
            x: v.x + this.offset.x,
            y: v.y + this.offset.y
        }));
    }

    transformedVertices(): { x: number; y: number }[] {
        return this.getTransformedVertices();
    }

    containsPoint(px: number, py: number): boolean {
        const vertices = this.getTransformedVertices();
        let inside = false;
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const xi = vertices[i].x, yi = vertices[i].y;
            const xj = vertices[j].x, yj = vertices[j].y;

            const intersect = ((yi > py) !== (yj > py)) &&
                (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    addHexagonAtEdge(
        edgeIndex: number,
        hexRadius: number,
        scenePolygons: Polygon[],
        history: ChangeHistory
    ) {
        const basePolygon = this;
        const baseVertices = basePolygon.vertices;

        // 1. Base polygon clicked edge points
        const a = baseVertices[edgeIndex];
        const b = baseVertices[(edgeIndex + 1) % baseVertices.length];

        // 2. Edge center
        const edgeCenter = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

        // 3. Polygon center
        const polygonCenter = baseVertices.reduce(
            (acc, v) => {
                acc.x += v.x;
                acc.y += v.y;
                return acc;
            },
            { x: 0, y: 0 }
        );
        polygonCenter.x /= baseVertices.length;
        polygonCenter.y /= baseVertices.length;

        // 4. Vector from polygon center to edge center
        let dir = { x: edgeCenter.x - polygonCenter.x, y: edgeCenter.y - polygonCenter.y };
        const dirLength = Math.hypot(dir.x, dir.y);

        if (dirLength === 0) {
            // Avoid division by zero; pick arbitrary direction (e.g., upward)
            dir = { x: 0, y: -1 };
        } else {
            // Normalize direction vector
            dir.x /= dirLength;
            dir.y /= dirLength;
        }

        const edgeLength = Math.hypot(b.x - a.x, b.y - a.y);

        const moveDistance = edgeLength - (1.5 * this.lineWidth);

        const newHexCenter = {
            x: edgeCenter.x + dir.x * moveDistance,
            y: edgeCenter.y + dir.y * moveDistance,
        }

        const hexVertices: Vector[] = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            hexVertices.push({
                x: hexRadius * Math.cos(angle),
                y: hexRadius * Math.sin(angle),
            });
        }

        // Translate hex vertices to new center position
        const translatedHexVertices = hexVertices.map((v) => ({
            x: v.x + newHexCenter.x,
            y: v.y + newHexCenter.y,
        }));

        const newHex = new Polygon(translatedHexVertices);
        newHex.draggable = true;

        // 10. Create scene change for undo/redo
        const change: SceneChange = {
            description: `Add hexagon at edge ${edgeIndex} of polygon`,

            apply() {
                scenePolygons.push(newHex);
            },

            rollback() {
                const index = scenePolygons.indexOf(newHex);
                if (index !== -1) scenePolygons.splice(index, 1);
            },
        };

        history.addChange(change);
    }


}
