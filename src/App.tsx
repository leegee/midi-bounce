import { onMount, onCleanup, createSignal, Show } from "solid-js";
import { initMidi } from './MIDI';
import { Game } from './Game';

import styles from './App.module.css';

function velocityToAngleSpeed(vx: number, vy: number) {
    const speed = Math.sqrt(vx * vx + vy * vy);
    const angle = (Math.atan2(vy, vx) * 180) / Math.PI;
    return { speed, angle: (angle + 360) % 360 }; // normalize angle to 0-360
}

function angleSpeedToVelocity(angle: number, speed: number) {
    const rad = (angle * Math.PI) / 180;
    return {
        vx: speed * Math.cos(rad),
        vy: speed * Math.sin(rad),
    };
}

interface AppProps {
    deviceMatch: string;
}

export default function App(props: AppProps) {
    let canvasRef: HTMLCanvasElement | undefined;
    let game: Game | null = null;

    const [showModal, setShowModal] = createSignal(false);
    const [angle, setAngle] = createSignal(45); // Degrees
    const [speed, setSpeed] = createSignal(1);

    onMount(() => {
        initMidi(props.deviceMatch || 'loop')
            .then(() => {
                console.log("MIDI initialized");
                if (canvasRef) {
                    game = new Game(canvasRef);

                    game.setHandleEscapeCallback(() => {
                        if (!game) return;

                        if (!showModal()) {
                            const { speed, angle } = velocityToAngleSpeed(game.ball.vx, game.ball.vy);
                            setSpeed(speed);
                            setAngle(angle);
                        }
                        setShowModal(!showModal());
                        game.toggleAnimation();
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

    function applyVelocityChange() {
        const { vx, vy } = angleSpeedToVelocity(angle(), speed());
        if (game) {
            game.setBallVelocity(vx, vy);
        }
        setShowModal(false);
        game?.start();
    }

    return (
        <>
            <canvas ref={canvasRef}></canvas>

            <Show when={showModal()}>
                <aside class={styles.modal}>
                    <header>
                        <h2>Adjust Ball Direction</h2>
                    </header>

                    <label>Angle (degrees):
                        <input
                            type="range"
                            min={0}
                            max={360}
                            value={angle()}
                            onInput={(e) => setAngle(parseFloat(e.currentTarget.value))}
                        />
                    </label>
                    <label>Speed:
                        <input
                            type="range"
                            min={0}
                            max={20}
                            step={0.1}
                            value={speed()}
                            onInput={(e) => setSpeed(parseFloat(e.currentTarget.value))}
                        />
                    </label>

                    <footer>
                        <button class={styles.resumeButton} onClick={applyVelocityChange}>
                            Apply & Resume
                        </button>
                    </footer>
                </aside>
            </Show >
        </>
    );
}
