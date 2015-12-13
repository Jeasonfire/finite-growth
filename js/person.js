var Person = (function () {
    function Person(x, y, game) {
        this.hunger = 0;
        this.eating = false;
        this.directionChangeTimeCurrent = 0;
        this.directionChangeTime = 5;
        this.direction = 0;
        this.game = game;
        this.targetFarm = null;
        this.targetPerson = null;
        this.targetPoint = null;
        this.newPerson = null;
        this.sprite = this.game.add.sprite(x, y, "person");
        this.game.physics.p2.enableBody(this.sprite, false);
        this.sprite.body.setRectangle(1, 1);
        this.sprite.body.addCircle(7);
        this.sprite.body.fixedRotation = true;
        this.sprite.body.onBeginContact.add(function (other) {
            if (other !== null && other.dynamic) {
                this.sprite.body.velocity.y = -100;
                this.sprite.body.velocity.x = (Math.random() * 2 - 1) * 100;
            }
        }, this);
        this.sprite.animations.add("idle", [0], 1, false);
        this.sprite.animations.add("walk", [0, 1, 0, 2], 12, true);
        this.sprite.animations.add("work", [3, 4], 12, true);
        this.sprite.animations.add("eat", [5, 0], 14, false);
        this.hungerBarEmpty = this.game.add.sprite(-this.sprite.width / 2, -10, "hungerEmpty");
        this.hungerBarEmpty.parent = this.sprite;
        this.hungerBarFull = this.game.add.sprite(-this.sprite.width / 2, -10, "hungerFull");
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
    }
    Person.prototype.startWorkingOn = function (build) {
        build.beingWorkedOn = true;
        this.build = build;
    };
    Person.prototype.update = function (farms, people) {
        if (this.dead) {
            return;
        }
        if (this.sprite === null) {
            console.log("found a null sprite?");
            this.die();
        }
        this.hunger += Person.HUNGER_INCREASE_FREQ * this.game.time.physicsElapsed;
        if (this.hunger >= 1) {
            this.die();
        }
        this.currentlyWorking = false;
        if (Math.abs(this.sprite.body.velocity.y) < 10) {
            this.sprite.body.velocity.x = 0;
        }
        if (this.targetPoint !== null) {
            if (this.targetPoint.x - this.sprite.x > this.sprite.width / 1.8) {
                this.sprite.body.moveRight(this.moveSpeed * 1.2);
            }
            else if (this.targetPoint.x - this.sprite.x < -this.sprite.width / 1.8) {
                this.sprite.body.moveLeft(this.moveSpeed * 1.2);
            }
            else {
                this.targetPoint = null;
                this.heartEmitter.start(true, this.heartDuration, null, this.heartAmount);
                this.newPerson = new Person(this.sprite.x, this.sprite.y, this.game);
                this.newPerson.sprite.body.moveUp(400);
            }
        }
        else if (this.hunger > Person.VERY_HUNGRY && people.length > 1 && farms.length == 0) {
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
            }
            else if (this.targetPerson.sprite.x - this.sprite.x > this.sprite.width / 1.5) {
                this.sprite.body.moveRight(this.moveSpeed * 1.5);
                this.eating = true;
            }
            else if (this.targetPerson.sprite.x - this.sprite.x < -this.sprite.width / 1.5) {
                this.sprite.body.moveLeft(this.moveSpeed * 1.5);
                this.eating = true;
            }
            else if (this.targetPerson !== null) {
                this.hunger -= 1 - this.targetPerson.hunger;
                this.targetPerson.hunger = 1;
                this.targetPerson = null;
                this.eating = false;
            }
        }
        else if (this.hunger > Person.MILDLY_HUNGRY && farms.length > 0) {
            if (this.build !== null && this.build.getTileType() == TileType.HOUSE) {
                this.build.beingWorkedOn = false;
                this.build = null;
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
            }
            else if (this.targetFarm.x - this.sprite.x > TILE_SIZE) {
                this.sprite.body.moveRight(this.moveSpeed);
            }
            else if (this.targetFarm.x - this.sprite.x < -TILE_SIZE) {
                this.sprite.body.moveLeft(this.moveSpeed);
            }
            else {
                this.hunger -= Person.MILDLY_HUNGRY;
                this.targetFarm.destroy();
                farms.splice(farms.indexOf(this.targetFarm), 1);
                this.targetFarm = null;
            }
        }
        else if (this.build !== null && (this.hunger < Person.MILDLY_HUNGRY || (this.targetFarm === null && this.targetPerson === null))) {
            if (this.build.getX() * TILE_SIZE - this.sprite.x > TILE_SIZE) {
                this.sprite.body.moveRight(this.moveSpeed);
            }
            else if (this.build.getX() * TILE_SIZE - this.sprite.x < -TILE_SIZE) {
                this.sprite.body.moveLeft(this.moveSpeed);
            }
            else {
                this.sprite.body.velocity.x = 0;
                this.currentlyWorking = true;
                this.build.updateTimer(this.game.time);
            }
            if (this.build.isDoneBuilding()) {
                this.build = null;
            }
        }
        else if (this.targetPerson === null && this.targetFarm === null) {
            var time = this.game.time.totalElapsedSeconds();
            if (time - this.directionChangeTimeCurrent > this.directionChangeTime) {
                this.directionChangeTimeCurrent = time;
                this.direction = Math.round(Math.random() * 3 - 1.5);
            }
            this.sprite.body.velocity.x = this.direction * this.moveSpeed / 3;
        }
        this.updateAnimations();
        this.updateHungerBarPosition();
        this.bloodEmitter.position = this.sprite.position;
        this.heartEmitter.position = this.sprite.position;
        if (this.sprite.body.velocity.y > MAX_Y_SPEED) {
            this.sprite.body.velocity.y = MAX_Y_SPEED;
        }
    };
    Person.prototype.die = function () {
        this.bloodEmitter.start(true, this.bloodDuration, null, this.bloodAmount);
        this.sprite.kill();
        this.hungerBarFull.kill();
        this.hungerBarEmpty.kill();
        if (this.build !== null) {
            this.build.beingWorkedOn = false;
        }
        this.dead = true;
    };
    Person.prototype.updateAnimations = function () {
        if (this.eating) {
            this.sprite.animations.play("eat");
        }
        else if (this.build !== null && this.currentlyWorking) {
            this.sprite.animations.play("work");
        }
        else {
            if (this.sprite.body.velocity.x != 0) {
                this.sprite.animations.play("walk");
            }
            else {
                this.sprite.animations.play("idle");
            }
        }
    };
    Person.prototype.updateHungerBarPosition = function () {
        this.hungerBarFull.crop(new Phaser.Rectangle(0, 0, this.sprite.width * (1 - this.hunger), this.hungerBarFull.height), false);
    };
    Person.prototype.setHungerBarVisible = function (visible) {
        if (visible === void 0) { visible = true; }
        this.hungerBarFull.visible = visible;
        this.hungerBarEmpty.visible = visible;
    };
    Person.prototype.getHunger = function () {
        return this.hunger;
    };
    Person.HUNGER_INCREASE_FREQ = 0.03;
    Person.MILDLY_HUNGRY = 0.6;
    Person.VERY_HUNGRY = 0.25;
    return Person;
})();
