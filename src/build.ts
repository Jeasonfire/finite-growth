class Build {
    private static BUILD_PARTS_FREQ = 0.2;

    private x: number;
    private y: number;

    public sprite: Phaser.Sprite;
    public progress: number;

    public constructor(x: number, y: number) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
        this.progress = 0;
    }

    public getX(): number {
        return this.x;
    }

    public getY(): number {
        return this.y;
    }

    public updateTimer(time: Phaser.Time): void {
        if (this.progress < 1) {
            this.progress += time.physicsElapsed * Build.BUILD_PARTS_FREQ;
        }
    }

    public isDoneBuilding(): boolean {
        return this.progress >= 1;
    }
}
