class Person {
    private static HUNGER_INCREASE_FREQ = 0.025;
    public static MILDLY_HUNGRY = 0.45;
    public static VERY_HUNGRY = 0.75;

    private game: Phaser.Game;
    private currentlyWorking: boolean;
    private hunger: number;

    private eating: boolean = false;
    private directionChangeTimeCurrent: number = 0;
    private directionChangeTime: number = 5;
    private direction: number = 0;

    private hungerBarFull: Phaser.Sprite;
    private hungerBarEmpty: Phaser.Sprite;

    private bloodEmitter: Phaser.Particles.Arcade.Emitter;
    private bloodDuration: number;
    private bloodAmount: number;
    private heartEmitter: Phaser.Particles.Arcade.Emitter;
    private heartDuration: number;
    private heartAmount: number;

    private collisionSound: Phaser.Sound;
    private deathSound: Phaser.Sound;
    private lifeSound: Phaser.Sound;

    public sprite: Phaser.Sprite;
    public build: Build;
    public moveSpeed: number;
    public dead: boolean;
    public targetFarm: Phaser.Sprite;
    public targetPerson: Person;
    public targetPoint: Phaser.Point;
    public reproduced: boolean = false;
    public justConsumedAFarm: Phaser.Point = null;

    public status: string;
    //public guiController: dat.GUIController;

    public constructor(x: number, y: number, game: Phaser.Game, startingHunger: number) {
        this.game = game;
        this.targetFarm = null;
        this.targetPerson = null;
        this.targetPoint = null;
        this.collisionSound = this.game.add.audio("collision");
        this.deathSound = this.game.add.audio("perish");
        this.lifeSound = this.game.add.audio("life");
        this.sprite = this.game.make.sprite(x, y, "person");
        this.game.physics.p2.enableBody(this.sprite, false);
        this.sprite.body.setRectangle(1, 1);
        this.sprite.body.addCircle(7);
        this.sprite.body.fixedRotation = true;
        this.sprite.body.onBeginContact.add(function(other: Phaser.Physics.P2.Body) {
            if (other !== null && other.dynamic) {
                this.collisionSound.play();
                this.sprite.body.velocity.y = -100;
                this.sprite.body.velocity.x = (Math.random() * 2 - 1) * 100;
            }
        }, this);

        this.sprite.animations.add("idle", [0], 1, false);
        this.sprite.animations.add("walk", [0, 1, 0, 2], 12, true);
        this.sprite.animations.add("work", [3, 4], 12, true);
        this.sprite.animations.add("eat", [5, 0], 14, false);

        this.hunger = startingHunger;
        this.hungerBarEmpty = this.game.add.sprite(-this.sprite.width / 2, -12, "hungerEmpty");
        this.hungerBarEmpty.parent = this.sprite;
        this.hungerBarFull = this.game.add.sprite(-this.sprite.width / 2, -12, "hungerFull");
        this.hungerBarFull.parent = this.sprite;
        this.updateHungerBarPosition();

        this.bloodEmitter = this.game.add.emitter();
        this.bloodEmitter.makeParticles("blood");
        this.bloodAmount = 50;
        this.bloodDuration = 500;

        this.heartEmitter = this.game.add.emitter();
        this.heartEmitter.makeParticles("heart");
        this.heartEmitter.gravity = -300;
        this.heartAmount = 5;
        this.heartDuration = 2000;

        this.moveSpeed = 150;
        this.currentlyWorking = false;
        this.build = null;
        this.dead = false;

        this.status = "just created";
        //this.guiController = gui.add(this, "status").listen();
    }

    public startWorkingOn(build: Build): void {
        if (build === null) {
            return;
        }
        build.beingWorkedOn = true;
        this.build = build;
    }

    public update(farms: Phaser.Sprite[], people: Person[]): void {
        if (this.dead) {
            return;
        }
        if (this.sprite === null) {
            this.die();
        }

        this.hunger += Person.HUNGER_INCREASE_FREQ * this.game.time.physicsElapsed;
        if (this.hunger >= 1) {
            this.die();
        }

        this.justConsumedAFarm = null;
        this.currentlyWorking = false;
        if (this.build !== null) {
            this.build.beingWorkedOn = false;
        }
        if (Math.abs(this.sprite.body.velocity.y) < 10) {
            this.sprite.body.velocity.x = 0;
        }
        this.status = "not even idling!";
        if (this.targetPoint !== null) {
            if (this.targetPoint.x - this.sprite.x > this.sprite.width / 1.8) {
                this.sprite.body.moveRight(this.moveSpeed * 1.2);
            } else if (this.targetPoint.x - this.sprite.x < -this.sprite.width / 1.8) {
                this.sprite.body.moveLeft(this.moveSpeed * 1.2);
            } else {
                this.targetPoint = null;
                this.heartEmitter.start(true, this.heartDuration, null, this.heartAmount);
                this.reproduced = Math.random() < 0.65;
                this.lifeSound.play();
            }
            this.status = "searching for target";
        } else if (this.hunger > Person.VERY_HUNGRY && people.length > 1 && farms.length == 0) {
            if (this.build !== null) {
                this.build.beingWorkedOn = false;
                this.build = null;
            }
            if (this.targetPerson === null) {
                var dist = 1000;
                var bestPerson = null;
                for (var i = 0; i < people.length; i++) {
                    var person = people[i];
                    var newDist = Math.abs(person.sprite.x - this.sprite.x);
                    if (newDist < dist && newDist > 1) {
                        dist = newDist;
                        bestPerson = person;
                    }
                }
                this.targetPerson = bestPerson;
            } else if (this.targetPerson.sprite.x - this.sprite.x > this.sprite.width / 1.5) {
                this.sprite.body.moveRight(this.moveSpeed * 1.5);
                this.eating = true;
            } else if (this.targetPerson.sprite.x - this.sprite.x < -this.sprite.width / 1.5) {
                this.sprite.body.moveLeft(this.moveSpeed * 1.5);
                this.eating = true;
            } else if (this.targetPerson !== null) {
                this.hunger -= 1 - this.targetPerson.hunger;
                this.targetPerson.hunger = 1;
                this.targetPerson = null;
                this.eating = false;
            }
            this.status = "eating people";
        } else if (this.hunger > Person.VERY_HUNGRY && people.length == 1 && farms.length == 0 && this.targetPerson !== null) {
            this.targetPerson = null;
            this.status = "forgetting about target";
        } else if (this.hunger > Person.MILDLY_HUNGRY && farms.length > 0) {
            if (this.build !== null && this.build.getTileType() == TileType.HOUSE) {
                this.build.beingWorkedOn = false;
                this.build = null;
            }
            if (this.targetFarm !== null && !this.targetFarm.alive) {
                this.targetFarm = null;
            }
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
                this.hunger -= Person.MILDLY_HUNGRY;
                this.justConsumedAFarm = new Phaser.Point(this.targetFarm.x, this.targetFarm.y);
                this.targetFarm.destroy();
                farms.splice(farms.indexOf(this.targetFarm), 1);
                this.targetFarm = null;
            }
            this.status = "finding a farm";
        } else if (this.hunger > Person.MILDLY_HUNGRY && farms.length == 0 && this.targetFarm !== null) {
            this.targetFarm = null;
            this.status = "forgetting about a farm";
        } else if (this.build !== null && (this.hunger < Person.MILDLY_HUNGRY || (this.targetFarm === null && this.targetPerson === null))) {
            this.build.beingWorkedOn = true;
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
            }
            this.status = "building";
        } else if (this.targetPerson === null && this.targetFarm === null) {
            var time = this.game.time.totalElapsedSeconds();
            if (time - this.directionChangeTimeCurrent > this.directionChangeTime) {
                this.directionChangeTimeCurrent = time;
                this.direction = Math.round(Math.random() * 3 - 1.5);
            }
            this.sprite.body.velocity.x = this.direction * this.moveSpeed / 3;
            this.status = "idling";
        }
        this.updateAnimations();
        this.updateHungerBarPosition();
        this.bloodEmitter.position = this.sprite.position;
        this.heartEmitter.position = this.sprite.position;
        this.collisionSound.volume = getCollisionLevel();
        this.deathSound.volume = getOtherEffectLevel();
        this.lifeSound.volume = getOtherEffectLevel();

        if (this.sprite.body.velocity.y > MAX_Y_SPEED) {
            this.sprite.body.velocity.y = MAX_Y_SPEED;
        }
    }

    public die(): void {
        this.deathSound.play();
        this.bloodEmitter.start(true, this.bloodDuration, null, this.bloodAmount);
        this.sprite.kill();
        this.hungerBarFull.kill();
        this.hungerBarEmpty.kill();
        if (this.build !== null) {
            this.build.beingWorkedOn = false;
        }
        this.dead = true;
    }

    private updateAnimations(): void {
        if (this.eating) {
            this.sprite.animations.play("eat");
        } else if (this.build !== null && this.currentlyWorking) {
            this.sprite.animations.play("work");
        } else {
            if (this.sprite.body.velocity.x != 0) {
                this.sprite.animations.play("walk");
            } else {
                this.sprite.animations.play("idle");
            }
        }
    }

    private updateHungerBarPosition(): void {
        this.hungerBarFull.crop(new Phaser.Rectangle(0, 0, this.sprite.width * (1 - this.hunger), this.hungerBarFull.height), false);
    }

    public setHungerBarVisible(visible: boolean = true): void {
        this.hungerBarFull.visible = visible;
        this.hungerBarEmpty.visible = visible;
    }

    public getHunger(): number {
        return this.hunger;
    }
}
