import { onMount, onCleanup, createSignal, Show } from "solid-js";
import { initMidi } from './MIDI';
import { Game } from './Game';

import styles from './App.module.css';

export default function App() {
    let canvasRef: HTMLCanvasElement | undefined;
    let game: Game | null = null;
    const [showModal, setShowModal] = createSignal(false);

    onMount(() => {
        initMidi('loop')
            .then(() => {
                console.log("MIDI initialized");
                if (canvasRef) {
                    game = new Game(canvasRef);
                    game.setHandleEscapeCallback(() => {
                        setShowModal(!showModal());
                        game!.toggleAnimation();
                    });
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

            <Show when={showModal()}>
                <div class={styles.modal}>
                    <p>Paused. Press Escape again to resume.</p>
                    <button class={styles.resumeButton} onClick={() => {
                        setShowModal(false);
                        game?.start();
                    }}>
                        Resume
                    </button>
                </div>
            </Show>
        </>
    );
}
