import type { Ball } from "./Ball";
import type { HexGrid } from "./HexGrid";
import { hexRadius } from "./constants";

export function reflectBallIfColliding(ball: Ball, grid: HexGrid) {
    const futureX = ball.x + ball.vx;
    const futureY = ball.y + ball.vy;

    for (const cell of grid.cells.values()) {
        if (!cell.active) continue;

        const center = cell.center();
        const angles = [0, Math.PI / 3, 2 * Math.PI / 3, Math.PI, -2 * Math.PI / 3, -Math.PI / 3];

        for (let i = 0; i < 6; i++) {
            const neighborCoords = cell.neighbor(i);
            const neighbor = grid.getCell(neighborCoords.q, neighborCoords.r);
            if (neighbor && neighbor.active) continue; // skip shared edge

            const angleA = angles[i];
            const angleB = angles[(i + 1) % 6];

            const x1 = center.x + hexRadius * Math.cos(angleA);
            const y1 = center.y + hexRadius * Math.sin(angleA);
            const x2 = center.x + hexRadius * Math.cos(angleB);
            const y2 = center.y + hexRadius * Math.sin(angleB);

            // Closest point on edge to ball future position
            const edgeDx = x2 - x1;
            const edgeDy = y2 - y1;
            const lenSquared = edgeDx * edgeDx + edgeDy * edgeDy;
            const t = Math.max(0, Math.min(1, ((futureX - x1) * edgeDx + (futureY - y1) * edgeDy) / lenSquared));
            const closestX = x1 + t * edgeDx;
            const closestY = y1 + t * edgeDy;

            const distSquared = (futureX - closestX) ** 2 + (futureY - closestY) ** 2;

            if (distSquared <= ball.radius ** 2) {
                // Reflect velocity vector around edge normal
                const edgeNormalX = -(y2 - y1);
                const edgeNormalY = x2 - x1;
                const normalLen = Math.hypot(edgeNormalX, edgeNormalY);
                const nx = edgeNormalX / normalLen;
                const ny = edgeNormalY / normalLen;

                const dot = ball.vx * nx + ball.vy * ny;
                ball.vx = ball.vx - 2 * dot * nx;
                ball.vy = ball.vy - 2 * dot * ny;

                // Move ball outside the edge
                const pushBack = ball.radius - Math.sqrt(distSquared);
                ball.x += nx * pushBack;
                ball.y += ny * pushBack;
                return;
            }
        }
    }
}
