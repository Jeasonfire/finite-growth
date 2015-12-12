class Person {
    private game: Phaser.Game;
    private currentlyWorking: boolean;

    public sprite: Phaser.Sprite;
    public build: Build;


    public constructor(x: number, y: number, game: Phaser.Game) {
        this.game = game;
        this.sprite = this.game.add.sprite(x, y, "person");
        this.game.physics.p2.enableBody(this.sprite, false);
        this.sprite.body.setRectangle(1, 1);
        this.sprite.body.addCircle(5);
        this.sprite.body.fixedRotation = true;

        this.sprite.animations.add("idle", [0], 1, false);
        this.sprite.animations.add("walk", [0, 1, 0, 2], 24, true);
        this.sprite.animations.add("work", [3, 4], 24, true);

        this.currentlyWorking = false;
        this.build = null;
    }

    public startWorkingOn(build: Build): void {
        build.beingWorkedOn = true;
        this.build = build;
    }

    public update(): void {
        if (this.build !== null) {
            console.log("Building!");
            if (this.build.getX() * TILE_SIZE - this.sprite.x > TILE_SIZE) {
                this.sprite.body.moveRight(100);
            } else if (this.build.getX() * TILE_SIZE - this.sprite.x < -TILE_SIZE) {
                this.sprite.body.moveLeft(100);
            } else {
                this.sprite.body.velocity.x = 0;
                this.build.updateTimer(this.game.time);
            }
            if (this.build.isDoneBuilding()) {
                this.build = null;
                this.sprite.body.velocity.x = 0;
            }
        }
        this.updateAnimations();
    }

    public updateAnimations(): void {
        if (this.sprite.body.velocity.x != 0) {
            this.sprite.animations.play("walk");
        } else {
            this.sprite.animations.play("idle");
        }
        if (this.build !== null && this.currentlyWorking) {
            this.sprite.animations.play("work");
        }
    }
}