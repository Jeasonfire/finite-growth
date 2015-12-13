class Person {
    private static HUNGER_INCREASE_FREQ = 0.02;

    private game: Phaser.Game;
    private currentlyWorking: boolean;
    private hunger: number = 0;

    public sprite: Phaser.Sprite;
    public build: Build;
    public moveSpeed: number;
    public dead: boolean;
    public reallyHungry: boolean;
    public targetFarm: Phaser.Sprite;

    public directionChangeTimeCurrent: number = 0;
    public directionChangeTime: number = 1;
    public direction: number = 0;

    public constructor(x: number, y: number, game: Phaser.Game) {
        this.game = game;
        this.targetFarm = null;
        this.sprite = this.game.add.sprite(x, y, "person");
        this.game.physics.p2.enableBody(this.sprite, false);
        this.sprite.body.setRectangle(1, 1);
        this.sprite.body.addCircle(7);
        this.sprite.body.fixedRotation = true;
        this.sprite.body.onBeginContact.add(function(other: Phaser.Physics.P2.Body) {
            if (other !== null && other.dynamic) {
                this.velocity.y = -100;
                this.velocity.x = (Math.random() * 2 - 1) * 100;
            }
        }, this.sprite.body);

        this.sprite.animations.add("idle", [0], 1, false);
        this.sprite.animations.add("walk", [0, 1, 0, 2], 16, true);
        this.sprite.animations.add("work", [3, 4], 16, true);
        this.sprite.animations.add("dead", [5], 1, false);

        this.moveSpeed = 100;
        this.currentlyWorking = false;
        this.build = null;
        this.dead = false;
    }

    public startWorkingOn(build: Build): void {
        build.beingWorkedOn = true;
        this.build = build;
    }

    public updateHunger(farms: Phaser.Sprite[]): void {
        if (this.hunger > 0.5) {
            if (this.targetFarm === null) {
                var dist = 1000;
                var bestFarm = null;
                for (var i = 0; i < farms.length; i++) {
                    var farm = farms[i];
                    var newDist = Math.abs(farm.x - this.sprite.x);
                    if (newDist < dist) {
                        dist = newDist;
                        bestFarm = farm;
                    }
                }
                this.targetFarm = bestFarm;
            } else if (this.targetFarm.x - this.sprite.x > TILE_SIZE) {
                this.sprite.body.moveRight(this.moveSpeed);
            } else if (this.targetFarm.x - this.sprite.x < -TILE_SIZE) {
                this.sprite.body.moveLeft(this.moveSpeed);
            } else {
                this.hunger -= 0.5;
                farms.splice(farms.indexOf(this.targetFarm), 1);
                this.targetFarm.destroy();
                this.targetFarm = null;
            }
        }
    }

    public update(): void {
        if (this.dead) {
            return;
        }

        this.hunger += Person.HUNGER_INCREASE_FREQ * this.game.time.physicsElapsed;
        if (this.hunger >= 1) {
            this.die();
        }

        if (this.build !== null && this.hunger < 0.5) {
            this.currentlyWorking = false;
            if (this.build.getX() * TILE_SIZE - this.sprite.x > TILE_SIZE) {
                this.sprite.body.moveRight(this.moveSpeed);
            } else if (this.build.getX() * TILE_SIZE - this.sprite.x < -TILE_SIZE) {
                this.sprite.body.moveLeft(this.moveSpeed);
            } else {
                this.sprite.body.velocity.x = 0;
                this.currentlyWorking = true;
                this.build.updateTimer(this.game.time);
            }
            if (this.build.isDoneBuilding()) {
                this.build = null;
                this.sprite.body.velocity.x = 0;
            }
        } else {
            var time = this.game.time.totalElapsedSeconds();
            if (time - this.directionChangeTimeCurrent > this.directionChangeTime) {
                this.directionChangeTimeCurrent = time;
                this.direction = Math.round(Math.random() * 3 - 1.5);
            }
            this.sprite.body.velocity.x = this.direction * this.moveSpeed;
        }
        this.updateAnimations();

        if (this.sprite.body.velocity.y > MAX_Y_SPEED) {
            this.sprite.body.velocity.y = MAX_Y_SPEED;
        }
    }

    public die(): void {
        this.sprite.kill();
        this.dead = true;
    }

    public updateAnimations(): void {
        if (this.build !== null && this.currentlyWorking) {
            this.sprite.animations.play("work");
        } else {
            if (this.sprite.body.velocity.x != 0) {
                this.sprite.animations.play("walk");
            } else {
                this.sprite.animations.play("idle");
            }
        }
    }

    public getHunger(): number {
        return this.hunger;
    }
}
