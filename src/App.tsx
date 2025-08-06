import { onMount, onCleanup } from "solid-js";
import { initMidi } from './MIDI';
import { Game } from './Game';

export default function App() {
    let canvasRef: HTMLCanvasElement | undefined;
    let game: Game | null = null;

    onMount(() => {
        initMidi('loop')
            .then(() => {
                console.log("MIDI initialized");
                if (canvasRef) {
                    game = new Game(canvasRef);
                    game.start();
                }
            })
            .catch((e) => alert(e));
    });

    onCleanup(() => {
        if (game) {
            console.log("Cleaning up Game instance...");
            game.stop();
            game = null;
        }
    });

    return (
        <>
            <canvas ref={canvasRef}></canvas>
        </>
    );
}
