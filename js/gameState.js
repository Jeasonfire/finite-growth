var TILE_SIZE = 32;
var WORLD_WIDTH = 900;
var MAX_Y_SPEED = 200;
var TileType;
(function (TileType) {
    TileType[TileType["HOUSE"] = 0] = "HOUSE";
    TileType[TileType["GROUND"] = 1] = "GROUND";
    TileType[TileType["FARM"] = 2] = "FARM";
})(TileType || (TileType = {}));
var GameState = (function () {
    function GameState() {
        this.lastReproduction = 0;
        this.averageHunger = 0;
    }
    GameState.prototype.preload = function () {
        this.game.load.image("background", "./res/img/background.png");
        this.game.load.image("backgroundHouse", "./res/img/backgroundHouse.png");
        this.game.load.image("ground", "./res/img/ground.png");
        this.game.load.image("buildProgress", "./res/img/buildProgress.png");
        this.game.load.image("hungerFull", "./res/img/hungerFull.png");
        this.game.load.image("hungerEmpty", "./res/img/hungerEmpty.png");
        this.game.load.image("blood", "./res/img/blood.png");
        this.game.load.image("heart", "./res/img/heart.png");
        this.game.load.spritesheet("house", "./res/img/house.png", 32, 32);
        this.game.load.spritesheet("farm", "./res/img/farm.png", 32, 32);
        this.game.load.spritesheet("person", "./res/img/person.png", 12, 12);
    };
    GameState.prototype.create = function () {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.gravity.y = 900;
        this.game.input.activePointer.leftButton.onDown.add(this.leftClick, this);
        this.game.input.activePointer.rightButton.onDown.add(this.rightClick, this);
        this.backgroundGroup = this.game.add.group();
        this.midgroundGroup = this.game.add.group();
        this.foregroundGroup = this.game.add.group();
        this.backgroundSprite = this.game.make.sprite(0, 0, "background");
        this.backgroundSprite.fixedToCamera = true;
        this.backgroundGroup.add(this.backgroundSprite);
        this.backgroundHouses = [];
        this.ground = this.game.make.group();
        this.midgroundGroup.add(this.ground);
        this.tileElevation = 15;
        for (var i = 0; i < WORLD_WIDTH / TILE_SIZE; i++) {
            this.createGround(i, this.tileElevation);
        }
        this.builds = [];
        this.houses = [];
        this.farms = [];
        var house = this.startConstruction(Math.floor(Math.floor(900 / TILE_SIZE) / 2), this.tileElevation - 1, TileType.HOUSE);
        house.progress = 1;
        var farm = this.startConstruction(Math.floor(Math.floor(900 / TILE_SIZE) / 2) - 1, this.tileElevation - 1, TileType.FARM);
        farm.progress = 1;
        this.fadedHouseSprite = this.game.add.sprite(0, 0, "house");
        this.fadedHouseSprite.anchor.setTo(0.5);
        this.fadedHouseSprite.alpha = 0.4;
        this.fadedHouseSprite.visible = false;
        this.fadedFarmSprite = this.game.add.sprite(0, 0, "farm");
        this.fadedFarmSprite.anchor.setTo(0.5);
        this.fadedFarmSprite.alpha = 0.4;
        this.currentTileType = TileType.FARM;
        this.people = [];
        this.freePeople = [];
        this.createPerson(450, 300);
        this.createPerson(450, 330);
        this.createPerson(450, 270);
        this.reproductionRate = 0.3;
        this.addHouseToBackground();
    };
    GameState.prototype.update = function () {
        var _this = this;
        this.updateMouseSprite();
        if (this.game.input.activePointer.leftButton.isDown) {
            this.leftClick();
        }
        this.updateFreePeople();
        for (var i = 0; i < this.freePeople.length; i++) {
            var person = this.freePeople[i];
            if (person.dead) {
                this.freePeople.splice(i, 1);
            }
            else {
                var hungry = person.getHunger() > Person.MILDLY_HUNGRY;
                person.startWorkingOn(this.getNearestBuild(this.builds.filter(function (build) {
                    var notHungryOrFarm = !hungry || build.getTileType() == TileType.FARM;
                    var isReachable = build.getTileType() != TileType.HOUSE || _this.houseExistsAt(build.getX(), build.getY() + 1) || _this.groundExistsAt(build.getX(), build.getY() + 1);
                    return !build.beingWorkedOn && isReachable && notHungryOrFarm;
                }), person));
            }
        }
        var averageHungerTotal = 0;
        var time = this.game.time.totalElapsedSeconds();
        for (var i = 0; i < this.people.length; i++) {
            if (this.people[i].dead) {
                this.people.splice(i, 1);
            }
            else {
                this.people[i].update(this.farms, this.people);
                if (this.people[i].reproduced) {
                    this.people[i].reproduced = false;
                    this.createPerson(this.people[i].sprite.x, this.people[i].sprite.y - this.people[i].sprite.height);
                }
                if (this.averageHunger < 0.3 && (time - this.lastReproduction) * this.reproductionRate * (0.7 + Math.random() * 0.3) > 1 && this.people.length < this.houses.length) {
                    var reproduced = this.reproduce(this.people[i]);
                    this.lastReproduction = time;
                }
                averageHungerTotal += this.people[i].getHunger();
            }
        }
        this.averageHunger = averageHungerTotal / this.people.length;
        for (var i = 0; i < this.builds.length; i++) {
            if (this.builds[i].isDoneBuilding()) {
                this.finishBuild(this.builds[i]);
                this.builds.splice(i, 1);
            }
        }
        for (var i = 0; i < this.houses.length; i++) {
            this.updateHouse(this.houses[i]);
        }
        if (this.people.length > this.backgroundHouses.length) {
            var len = this.people.length - this.backgroundHouses.length;
            for (var i = 0; i < len; i++) {
                this.addHouseToBackground();
            }
        }
        if (this.people.length < this.backgroundHouses.length) {
            var len = this.backgroundHouses.length - this.people.length;
            for (var i = 0; i < len; i++) {
                this.removeHouseFromBackground();
            }
        }
    };
    GameState.prototype.getNearestBuild = function (builds, person) {
        if (builds.length == 0) {
            return null;
        }
        else {
            function distBetween(build) {
                return Math.abs(build.getX() * TILE_SIZE - person.sprite.x);
            }
            var bestCandidate = builds[0];
            var bestDist = distBetween(bestCandidate);
            for (var i = 1; i < builds.length; i++) {
                var newCandidate = builds[i];
                var newDist = distBetween(newCandidate);
                if (newDist < bestDist) {
                    bestDist = newDist;
                    bestCandidate = newCandidate;
                }
            }
            return bestCandidate;
        }
    };
    GameState.prototype.addHouseToBackground = function () {
        var sprite = this.game.make.sprite(32 + (GAME_WIDTH - 64) * Math.random(), 370 + 50 * Math.random(), "backgroundHouse");
        sprite.alpha = 0;
        this.game.add.tween(sprite).to({ alpha: 1 }, 2000, Phaser.Easing.Default, true);
        this.backgroundGroup.add(sprite);
        this.backgroundHouses.push(sprite);
    };
    GameState.prototype.removeHouseFromBackground = function () {
        var spriteIndex = Math.floor(Math.random() * this.backgroundHouses.length);
        var sprite = this.backgroundHouses[spriteIndex];
        this.backgroundHouses.splice(spriteIndex, 1);
        var tween = this.game.add.tween(sprite);
        tween.to({ alpha: 0, exists: false }, 3000, Phaser.Easing.Default, true);
    };
    GameState.prototype.reproduce = function (person) {
        var index = Math.floor(Math.random() * this.people.length);
        while (this.people[index] == person && this.people.length > 1) {
            index = Math.floor(Math.random() * this.people.length);
        }
        var other = this.people[index];
        if (other !== null) {
            var midPoint = (other.sprite.x + person.sprite.x) / 2;
            other.targetPoint = new Phaser.Point(midPoint);
            person.targetPoint = new Phaser.Point(midPoint);
        }
        return false;
    };
    GameState.prototype.updateFreePeople = function () {
        for (var i = 0; i < this.people.length; i++) {
            var freeIndex = this.freePeople.indexOf(this.people[i]);
            if ((this.people[i].build === null || !this.people[i].build.beingWorkedOn) && freeIndex == -1) {
                this.freePeople.push(this.people[i]);
            }
            if (this.people[i].build !== null && freeIndex != -1) {
                this.freePeople.splice(freeIndex, 1);
            }
        }
    };
    GameState.prototype.updateMouseSprite = function () {
        var x = this.mouseTileX() * TILE_SIZE;
        var y = this.mouseTileY() * TILE_SIZE;
        this.fadedHouseSprite.x = x;
        this.fadedHouseSprite.y = y;
        this.fadedFarmSprite.x = x;
        this.fadedFarmSprite.y = y;
    };
    GameState.prototype.mouseTileX = function () {
        return Math.floor((this.game.input.activePointer.x + TILE_SIZE * 0.5 + this.game.camera.x) / TILE_SIZE);
    };
    GameState.prototype.mouseTileY = function () {
        return Math.floor((this.game.input.activePointer.y + TILE_SIZE * 0.5 + this.game.camera.y) / TILE_SIZE);
    };
    GameState.prototype.startConstruction = function (xTile, yTile, tileType) {
        var build = new Build(xTile, yTile, tileType);
        var groundUnder = this.groundExistsAt(xTile, yTile + 1);
        var tileOver = this.buildExistsAt(xTile, yTile) || this.houseExistsAt(xTile, yTile) || this.farmExistsAt(xTile, yTile) || this.groundExistsAt(xTile, yTile);
        var tileUnder = this.buildExistsAt(xTile, yTile + 1, TileType.HOUSE) || this.houseExistsAt(xTile, yTile + 1) || groundUnder;
        if (!tileOver && tileUnder && (groundUnder || tileType != TileType.FARM)) {
            var sprite = this.game.make.sprite(build.getX() * TILE_SIZE, build.getY() * TILE_SIZE, build.spriteType());
            sprite.anchor.setTo(0.5, 0.5);
            sprite.frame = build.constructionFrame();
            build.setSprite(sprite, this.game);
            this.builds.push(build);
            this.midgroundGroup.add(sprite);
            return build;
        }
        else {
            return null;
        }
    };
    GameState.prototype.finishBuild = function (build) {
        var x = build.getX();
        var y = build.getY();
        build.finish();
        var builtThing = this.game.make.sprite(x * TILE_SIZE, y * TILE_SIZE, build.spriteType());
        builtThing.anchor.setTo(0.5, 0.5);
        if (build.getTileType() == TileType.HOUSE) {
            this.houses.push(builtThing);
        }
        else {
            this.farms.push(builtThing);
        }
        this.midgroundGroup.add(builtThing);
        return builtThing;
    };
    GameState.prototype.createPerson = function (x, y) {
        var person = new Person(x, y, this.game);
        person.sprite.body.velocity.x = Math.sin(Math.random() * Math.PI * 2) * 100;
        person.sprite.body.velocity.y = -500;
        this.people.push(person);
        this.freePeople.push(person);
        this.foregroundGroup.add(person.sprite);
        return person;
    };
    GameState.prototype.updateHouse = function (house) {
        var x = Math.floor(house.x / TILE_SIZE);
        var y = Math.floor(house.y / TILE_SIZE);
        var groundUnder = this.groundExistsAt(x, y + 1);
        var tileUnder = this.buildExistsAt(x, y + 1) || this.houseExistsAt(x, y + 1) || this.farmExistsAt(x, y + 1) || groundUnder;
        var houseOnTop = this.buildExistsAt(x, y - 1) || this.houseExistsAt(x, y - 1) || this.farmExistsAt(x, y - 1);
        var houseUnder = tileUnder && !groundUnder;
        var houseType = 0;
        if (houseUnder && houseOnTop) {
            houseType = 2;
        }
        else if (houseUnder) {
            houseType = 3;
        }
        else if (houseOnTop) {
            houseType = 1;
        }
        if (houseType != house.frame) {
            house.frame = houseType;
        }
    };
    GameState.prototype.createGround = function (xTile, yTile) {
        if (yTile == this.tileElevation && !this.groundExistsAt(xTile, yTile)) {
            var pieceOfGround = this.ground.add(this.game.make.sprite(Math.floor(xTile) * TILE_SIZE, Math.floor(yTile) * TILE_SIZE, "ground"));
            pieceOfGround.anchor.setTo(0.5);
            this.game.physics.p2.enableBody(pieceOfGround, false);
            pieceOfGround.body.kinematic = false;
            pieceOfGround.body.dynamic = false;
        }
    };
    GameState.prototype.buildExistsAt = function (x, y, tileType) {
        for (var i = 0; i < this.builds.length; i++) {
            if (this.builds[i].getX() == x && this.builds[i].getY() == y && (tileType === undefined || this.builds[i].getTileType() == tileType)) {
                return true;
            }
        }
        return false;
    };
    GameState.prototype.houseExistsAt = function (x, y) {
        for (var i = 0; i < this.houses.length; i++) {
            if (Math.floor(this.houses[i].x / TILE_SIZE) == x && Math.floor(this.houses[i].y / TILE_SIZE) == y) {
                return true;
            }
        }
        return false;
    };
    GameState.prototype.farmExistsAt = function (x, y) {
        for (var i = 0; i < this.farms.length; i++) {
            if (Math.floor(this.farms[i].x / TILE_SIZE) == x && Math.floor(this.farms[i].y / TILE_SIZE) == y) {
                return true;
            }
        }
        return false;
    };
    GameState.prototype.groundExistsAt = function (x, y) {
        for (var i = 0; i < this.ground.length; i++) {
            if (Math.floor(this.ground.children[i].x / TILE_SIZE + 0.5) == x && Math.floor(this.ground.children[i].y / TILE_SIZE + 0.5) == y) {
                return true;
            }
        }
        return false;
    };
    GameState.prototype.leftClick = function () {
        var mouseX = this.mouseTileX();
        var mouseY = this.mouseTileY();
        var build = this.startConstruction(mouseX, mouseY, this.currentTileType);
    };
    GameState.prototype.rightClick = function () {
        if (this.currentTileType == TileType.FARM) {
            this.currentTileType = TileType.HOUSE;
            this.fadedFarmSprite.visible = false;
            this.fadedHouseSprite.visible = true;
        }
        else if (this.currentTileType == TileType.HOUSE) {
            this.currentTileType = TileType.FARM;
            this.fadedHouseSprite.visible = false;
            this.fadedFarmSprite.visible = true;
        }
    };
    return GameState;
})();
