var Person = (function () {
    function Person(x, y, game) {
        this.hunger = 0;
        this.directionChangeTimeCurrent = 0;
        this.directionChangeTime = 1;
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
        this.sprite.animations.add("dead", [5], 1, false);
        this.moveSpeed = 100;
        this.currentlyWorking = false;
        this.build = null;
        this.dead = false;
    }
    Person.prototype.startWorkingOn = function (build) {
        build.beingWorkedOn = true;
        this.build = build;
    };
    Person.prototype.updateHunger = function (farms, people) {
        if (this.targetPoint !== null) {
            return;
        }
        if (this.hunger > 0.67 && people.length > 1 && farms.length == 0) {
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
            else if (this.targetPerson.sprite.x - this.sprite.x > TILE_SIZE) {
                this.sprite.body.moveRight(this.moveSpeed * 1.5);
            }
            else if (this.targetPerson.sprite.x - this.sprite.x < -TILE_SIZE) {
                this.sprite.body.moveLeft(this.moveSpeed * 1.5);
            }
            else if (this.targetPerson !== null) {
                this.hunger -= 0.67;
                this.targetPerson.die();
                this.targetPerson = null;
            }
        }
        else if (this.hunger > 0.5 && farms.length > 0) {
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
                this.hunger -= 0.5;
                farms.splice(farms.indexOf(this.targetFarm), 1);
                this.targetFarm.kill();
                this.targetFarm = null;
            }
        }
    };
    Person.prototype.update = function () {
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
        if (Math.abs(this.sprite.body.velocity.y) < 5) {
            this.sprite.body.velocity.x = 0;
        }
        if (this.targetPoint !== null) {
            if (this.targetPoint.x - this.sprite.x > this.sprite.width) {
                this.sprite.body.moveRight(this.moveSpeed * 1.2);
            }
            else if (this.targetPoint.x - this.sprite.x < -this.sprite.width) {
                this.sprite.body.moveLeft(this.moveSpeed * 1.2);
            }
            else {
                this.targetPoint = null;
                this.newPerson = new Person(this.sprite.x, this.sprite.y, this.game);
                this.newPerson.sprite.body.moveUp(400);
            }
        }
        else if (this.build !== null && (this.hunger < 0.5 || (this.targetFarm === null && this.targetPerson === null))) {
            this.currentlyWorking = false;
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
                this.sprite.body.velocity.x = 0;
            }
        }
        else if (this.targetPerson === null && this.targetFarm === null) {
            var time = this.game.time.totalElapsedSeconds();
            if (time - this.directionChangeTimeCurrent > this.directionChangeTime) {
                this.directionChangeTimeCurrent = time;
                this.direction = Math.round(Math.random() * 3 - 1.5);
            }
        }
        this.updateAnimations();
        if (this.sprite.body.velocity.y > MAX_Y_SPEED) {
            this.sprite.body.velocity.y = MAX_Y_SPEED;
        }
    };
    Person.prototype.die = function () {
        this.sprite.kill();
        if (this.build !== null) {
            this.build.beingWorkedOn = false;
        }
        this.dead = true;
    };
    Person.prototype.updateAnimations = function () {
        if (this.build !== null && this.currentlyWorking) {
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
    Person.prototype.getHunger = function () {
        return this.hunger;
    };
    Person.HUNGER_INCREASE_FREQ = 0.025;
    return Person;
})();
