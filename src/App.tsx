import { createSignal, onMount } from "solid-js";
import { Renderer } from "./Renderer";
import { HexGrid } from "./HexGrid";
import { Ball } from "./Ball";
import { initMidi, sendMidiNoteOn } from './MIDI';
import { reflectBallIfColliding, type CollisionInfo } from "./collisions";


export default function App() {
    const [animating, setAnimating] = createSignal(true);

    onMount(() => {
        initMidi('loop')
            .then(() => {
                console.log("MIDI initialized");
                main();
            })
            .catch((e) => alert(e))
    })

    function main() {
        const renderer = new Renderer(
            document.getElementById('hexCanvas') as HTMLCanvasElement
        );

        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === ' ') {
                setAnimating(!animating());
                if (animating()) animate();
            }
        });

        const grid = new HexGrid(renderer);
        grid.getCell(0, 0)!.active = true;;

        const ball = new Ball(renderer, 0, 0, 1, 1);

        function onCollision(info: CollisionInfo) {
            const speed = Math.min(127, Math.floor(
                Math.sqrt(info.newVelocity.vx ** 2 + info.newVelocity.vy ** 2) * 10
            ));
            sendMidiNoteOn(speed);
        }

        function animate() {
            ball.move();
            reflectBallIfColliding(ball, grid, onCollision);

            grid.render();
            ball.render();

            if (animating()) {
                requestAnimationFrame(animate);
            }
        }

        animate();
    }
    return (
        <>
            <canvas id="hexCanvas"></canvas>
        </>
    );
}


// {/* <button onClick={() => setAnimating(!animating())}>
//                 {animating() ? "Pause" : "Play"}
//             </button> */}