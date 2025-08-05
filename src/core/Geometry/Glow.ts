
export class GlowComponent {
    glowIntensity: number = 0;

    constructor(initialIntensity: number = 0) {
        this.glowIntensity = initialIntensity;
    }

    update(deltaTime: number = 1 / 60) {
        if (this.glowIntensity > 0) {
            this.glowIntensity = Math.max(0, this.glowIntensity - deltaTime);
        }
    }

    trigger(intensity: number = 1) {
        this.glowIntensity = intensity;
    }

    isGlowing(): boolean {
        return this.glowIntensity > 0;
    }
}

