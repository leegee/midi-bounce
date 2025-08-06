import { Renderer } from "./Renderer";
import { HexGrid } from "./HexGrid";
import { Ball } from "./Ball";
import { reflectBallIfColliding } from "./collisions";

export const renderer = new Renderer(
    document.getElementById('hexCanvas') as HTMLCanvasElement
);

export const grid = new HexGrid(renderer);
grid.getCell(0, 0)!.active = true;;

export const ball = new Ball(renderer, 0, 0, 3, 2);

function animate() {
    ball.move();
    reflectBallIfColliding(ball, grid);

    grid.render();
    ball.render();

    requestAnimationFrame(animate);
}

animate();
