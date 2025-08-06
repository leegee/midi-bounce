import { onMount } from "solid-js";
import { initMidi } from './MIDI';
import { Game } from './Game';

export default function App() {
    let canvasRef: HTMLCanvasElement | undefined;

    onMount(() => {
        initMidi('loop')
            .then(() => {
                console.log("MIDI initialized");
                if (canvasRef) {
                    const game = new Game(canvasRef);
                    game.start();
                }
            })
            .catch((e) => alert(e));
    });

    return (
        <>
            <canvas
                ref={canvasRef}
                id="hexCanvas"
                style="width: 100vw; height: 100vh; display: block;"
            ></canvas>
        </>
    );
}
