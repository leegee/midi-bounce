import { onMount } from "solid-js";
import { initMidi } from './MIDI';
import { Game } from './Game';

export default function App() {
    onMount(() => {
        initMidi('loop')
            .then(() => {
                console.log("MIDI initialized");
                const canvas = document.getElementById('hexCanvas') as HTMLCanvasElement;
                const game = new Game(canvas);
                game.start();
            })
            .catch((e) => alert(e));
    });

    return (
        <>
            <canvas id="hexCanvas" style="width: 100vw; height: 100vh; display: block;"></canvas>
        </>
    );
}
