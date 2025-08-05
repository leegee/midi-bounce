import { type Vector, GlowComponent } from ".";
import type { ChangeHistory, SceneChange } from "../../app/ChangeHistory";

function pointsEqual(p1: Vector, p2: Vector, tol = 0.5): boolean {
    return Math.abs(p1.x - p2.x) < tol && Math.abs(p1.y - p2.y) < tol;
}

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

        const a = baseVertices[edgeIndex];
        const b = baseVertices[(edgeIndex + 1) % baseVertices.length];

        const edgeCenter = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

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

        let dir = { x: edgeCenter.x - polygonCenter.x, y: edgeCenter.y - polygonCenter.y };
        const dirLength = Math.hypot(dir.x, dir.y);
        if (dirLength === 0) {
            dir = { x: 0, y: -1 };
        } else {
            dir.x /= dirLength;
            dir.y /= dirLength;
        }

        const edgeLength = Math.hypot(b.x - a.x, b.y - a.y);
        const apothem = hexRadius * Math.cos(Math.PI / 6);

        const moveDistance = apothem + (edgeLength / 2) - (this.lineWidth * 5);

        const newHexCenter = {
            x: edgeCenter.x + dir.x * moveDistance,
            y: edgeCenter.y + dir.y * moveDistance,
        };

        const hexVertices: Vector[] = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            hexVertices.push({
                x: hexRadius * Math.cos(angle),
                y: hexRadius * Math.sin(angle),
            });
        }

        const translatedHexVertices = hexVertices.map((v) => ({
            x: v.x + newHexCenter.x,
            y: v.y + newHexCenter.y,
        }));

        const newHex = new Polygon(translatedHexVertices);
        newHex.draggable = true;

        let matchingEdgeIndex = -1;
        const tolerance = 1.8;
        for (let i = 0; i < newHex.vertices.length; i++) {
            const next = (i + 1) % newHex.vertices.length;
            const v1 = newHex.vertices[i];
            const v2 = newHex.vertices[next];

            const distStartToEnd = Math.hypot(v1.x - b.x, v1.y - b.y);
            const distEndToStart = Math.hypot(v2.x - a.x, v2.y - a.y);

            if (distStartToEnd < tolerance && distEndToStart < tolerance) {
                matchingEdgeIndex = i;
                break;
            }
        }

        if (matchingEdgeIndex === -1) {
            console.warn("No matching edge found between base polygon and new hexagon.");
            scenePolygons.push(newHex);
            return;
        }

        const change: SceneChange = {
            description: `Add and merge hexagon at edge ${edgeIndex} of polygon`,

            apply() {
                const baseIndex = scenePolygons.indexOf(basePolygon);
                if (baseIndex !== -1) scenePolygons.splice(baseIndex, 1);

                const hexIndex = scenePolygons.indexOf(newHex);
                if (hexIndex !== -1) scenePolygons.splice(hexIndex, 1);

                const mergedPolygon = basePolygon.mergeWithPolygonOnSharedEdge(
                    newHex,
                    edgeIndex,
                    matchingEdgeIndex
                );

                scenePolygons.push(mergedPolygon);
            },

            rollback() {
                const merged = scenePolygons.find(
                    (p) => p.vertices.length === basePolygon.vertices.length + newHex.vertices.length - 2
                );
                if (merged) {
                    const idx = scenePolygons.indexOf(merged);
                    if (idx !== -1) scenePolygons.splice(idx, 1);
                }

                scenePolygons.push(basePolygon);
                scenePolygons.push(newHex);
            },
        };

        history.addChange(change);
    }

    mergeWithPolygonOnSharedEdge(other: Polygon, sharedEdgeThis: number, sharedEdgeOther: number): Polygon {
        const vertsA = this.vertices;
        const vertsB = other.vertices;

        const nextA = (sharedEdgeThis + 1) % vertsA.length;
        const nextB = (sharedEdgeOther + 1) % vertsB.length;

        if (!(
            pointsEqual(vertsA[sharedEdgeThis], vertsB[(nextB)]) &&
            pointsEqual(vertsA[nextA], vertsB[sharedEdgeOther])
        )) {
            console.error("Base edge:", vertsA[sharedEdgeThis], vertsA[nextA]);
            console.error("Other edge:", vertsB[(nextB)], vertsB[sharedEdgeOther]);
            throw new Error("Shared edges do not match for merging.");
        }

        const partA1 = vertsA.slice(0, sharedEdgeThis + 1);

        const partB: Vector[] = [];
        let i = nextB;
        while (true) {
            partB.push(vertsB[i]);
            if (i === sharedEdgeOther) break;
            i = (i + 1) % vertsB.length;
        }

        const partA2 = vertsA.slice(nextA);

        const mergedVertices = [...partA1, ...partB, ...partA2];

        return new Polygon(mergedVertices);
    }
}
