// Geometry/index

import type { Polygon } from './Polygon';

export interface Vector {
    x: number;
    y: number;
}

export { GlowComponent } from './Glow';
export { Ball } from './Ball';
export { Polygon } from './Polygon';

// Edge selection logic
export function findClosestEdge(polygons: Polygon[], clickPos: Vector, threshold = 10): { polygon: Polygon, edgeIndex: number } | null {
    let closest = null;
    let minDist = threshold;

    for (const polygon of polygons) {
        const verts = polygon.vertices;
        for (let i = 0; i < verts.length; i++) {
            const a = verts[i];
            const b = verts[(i + 1) % verts.length];
            const dist = pointToSegmentDistance(clickPos, a, b);
            if (dist < minDist) {
                minDist = dist;
                closest = { polygon, edgeIndex: i };
            }
        }
    }
    return closest;
}

function pointToSegmentDistance(p: Vector, a: Vector, b: Vector): number {
    const ab = { x: b.x - a.x, y: b.y - a.y };
    const ap = { x: p.x - a.x, y: p.y - a.y };
    const abLenSq = ab.x * ab.x + ab.y * ab.y;
    const t = Math.max(0, Math.min(1, (ap.x * ab.x + ap.y * ab.y) / abLenSq));
    const proj = { x: a.x + t * ab.x, y: a.y + t * ab.y };
    return Math.hypot(p.x - proj.x, p.y - proj.y);
}


// On right click


export function showContextMenu(x: number, y: number, onAddHexagon: () => void) {
    const menu = document.createElement('div');
    menu.style.position = 'absolute';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.background = 'white';
    menu.style.border = '1px solid black';
    menu.style.padding = '4px';
    menu.innerText = 'Add Hexagon Here';

    menu.addEventListener('click', () => {
        onAddHexagon();
        document.body.removeChild(menu);
    });

    document.body.appendChild(menu);
}
