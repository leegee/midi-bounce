export interface SceneChange {
    description: string;
    apply(): void;
    rollback(): void;
}

export class ChangeHistory {
    private changes: SceneChange[] = [];
    private currentIndex = -1;

    addChange(change: SceneChange) {
        if (this.currentIndex < this.changes.length - 1) {
            this.changes = this.changes.slice(0, this.currentIndex + 1);
        }
        this.changes.push(change);
        this.currentIndex++;
        change.apply();
    }

    undo() {
        if (this.currentIndex >= 0) {
            this.changes[this.currentIndex].rollback();
            this.currentIndex--;
        }
    }

    redo() {
        if (this.currentIndex < this.changes.length - 1) {
            this.currentIndex++;
            this.changes[this.currentIndex].apply();
        }
    }
}
