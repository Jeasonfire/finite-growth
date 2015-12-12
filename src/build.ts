class Build {
    private static BUILD_PARTS_FREQ = 0.2;

    private x: number;
    private y: number;
    private sprite: Phaser.Sprite;

    public progress: number;
    public beingWorkedOn: boolean;

    public constructor(x: number, y: number) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
        this.progress = 0;
        this.beingWorkedOn = false;
    }

    public setSprite(sprite: Phaser.Sprite, game: Phaser.Game): void {
        this.sprite = sprite;
        this.updateSprite();
    }

    public updateTimer(time: Phaser.Time): void {
        if (this.progress < 1) {
            this.progress += time.physicsElapsed * Build.BUILD_PARTS_FREQ;
        }
        this.updateSprite();
    }

    private updateSprite(): void {
        var progress = Math.min(1, Math.max(0, this.progress));
        this.sprite.animations.frame = Math.floor(4 + progress * 6);
    }

    public finish(): void {
        this.sprite.destroy();
        this.progress = 1;
    }

    public isDoneBuilding(): boolean {
        return this.progress >= 1;
    }

    public getX(): number {
        return this.x;
    }

    public getY(): number {
        return this.y;
    }
}
