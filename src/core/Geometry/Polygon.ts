import { type Vector, GlowComponent } from ".";
export class Polygon {
    vertices: { x: number; y: number }[];
    offset: { x: number; y: number } = { x: 0, y: 0 };  // For dragging
    glow: GlowComponent = new GlowComponent();
    draggable: boolean = true;  // Optional flag to control draggability

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

    // SAT (Separating Axis Theorem) based collision detection would be here.
    // Placeholder for collision logic.


    // Get transformed vertices (with offset applied)
    getTransformedVertices(): { x: number; y: number }[] {
        return this.vertices.map(v => ({
            x: v.x + this.offset.x,
            y: v.y + this.offset.y
        }));
    }

    // Simple point-in-polygon hit-test
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
}
