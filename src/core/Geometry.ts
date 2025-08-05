

// ------------------------ core/Geometry.ts ------------------------
export interface Vector {
    x: number;
    y: number;
}

export class Polygon {
    vertices: Vector[];

    constructor(vertices: Vector[]) {
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
}

