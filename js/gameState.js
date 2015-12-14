var TILE_SIZE = 32;
var WORLD_WIDTH = 900;
var MAX_Y_SPEED = 200;
var TileType;
(function (TileType) {
    TileType[TileType["HOUSE"] = 0] = "HOUSE";
    TileType[TileType["GROUND"] = 1] = "GROUND";
    TileType[TileType["FARM"] = 2] = "FARM";
    TileType[TileType["REMOVE"] = 3] = "REMOVE";
})(TileType || (TileType = {}));
var GameState = (function () {
    function GameState() {
        this.lastReproduction = 0;
        this.averageHunger = 0;
        this.houseBuildingCooldown = 0.1;
        this.lastHouseBuilt = 0;
        this.changingVolume = false;
    }
    GameState.prototype.create = function () {
        gui.close();
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.gravity.y = 900;
        this.game.input.activePointer.rightButton.onDown.add(this.rightClick, this);
        this.happyMusic = this.game.add.sound("happyTheme", 0, true);
        this.happyMusic.play();
        this.worryMusic = this.game.add.sound("worryTheme", 0, true);
        this.worryMusic.play();
        this.dangerMusic = this.game.add.sound("dangerTheme", 0, true);
        this.dangerMusic.play();
        this.backgroundGroup = this.game.add.group();
        this.midgroundGroup = this.game.add.group();
        this.midgroundGroup.alpha = 0;
        this.foregroundGroup = this.game.add.group();
        this.foregroundGroup.alpha = 0;
        this.game.add.tween(this.midgroundGroup).to({ alpha: 1 }, 1000, Phaser.Easing.Cubic.In, true);
        this.game.add.tween(this.foregroundGroup).to({ alpha: 1 }, 1000, Phaser.Easing.Cubic.In, true);
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
        this.fadedSprite = this.game.make.sprite(0, 0, "fadedSprites");
        this.fadedSprite.anchor.setTo(0.5);
        this.fadedSprite.alpha = 0.4;
        this.fadedSprite.animations.frame = 0;
        this.midgroundGroup.add(this.fadedSprite);
        this.currentTileType = TileType.FARM;
        this.people = [];
        this.freePeople = [];
        this.createPerson(420, 300, 0);
        this.createPerson(450, 330, 0);
        this.createPerson(480, 270, 0);
        this.reproductionRate = 0.3;
        this.addHouseToBackground();
        this.gui = new GameGUI(this.game, this.foregroundGroup);
    };
    GameState.prototype.update = function () {
        var _this = this;
        this.game.sound.volume = getMasterLevel();
        this.updateSound(getMusicLevel());
        this.gui.update(this.people.length, this.freePeople.length, this.houses.length, this.currentTileType, this.averageHunger);
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
            var person = this.people[i];
            if (person.dead) {
                this.people.splice(i, 1);
            }
            else {
                person.update(this.farms, this.people);
                if (person.justConsumedAFarm !== null && this.gui.autoFarm()) {
                    this.startConstruction(Math.floor(person.justConsumedAFarm.x / TILE_SIZE), Math.floor(person.justConsumedAFarm.y / TILE_SIZE), TileType.FARM);
                }
                if (person.reproduced) {
                    person.reproduced = false;
                    this.createPerson(person.sprite.x, person.sprite.y - person.sprite.height);
                }
                if (this.averageHunger < 0.3 && (time - this.lastReproduction) * this.reproductionRate * (0.7 + Math.random() * 0.3) > 1 && this.people.length < this.houses.length) {
                    var reproduced = this.reproduce(person);
                    this.lastReproduction = time;
                }
                averageHungerTotal += person.getHunger();
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
        if (this.people.length > this.backgroundHouses.length && this.people.length > 1) {
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
    GameState.prototype.updateSound = function (vol) {
        var _this = this;
        if (this.averageHunger < Person.MILDLY_HUNGRY) {
            if (this.happyMusic.volume == 0 && !this.changingVolume) {
                this.changingVolume = true;
                this.game.add.tween(this.happyMusic).to({ volume: vol }, 500, Phaser.Easing.Default, true).onComplete.add(function () { _this.changingVolume = false; }, this);
                this.game.add.tween(this.worryMusic).to({ volume: 0 }, 500, Phaser.Easing.Default, true);
                this.game.add.tween(this.dangerMusic).to({ volume: 0 }, 500, Phaser.Easing.Default, true);
            }
        }
        else if (this.averageHunger < Person.VERY_HUNGRY) {
            if (this.worryMusic.volume == 0 && !this.changingVolume) {
                this.changingVolume = true;
                this.game.add.tween(this.happyMusic).to({ volume: 0 }, 500, Phaser.Easing.Default, true);
                this.game.add.tween(this.worryMusic).to({ volume: vol }, 500, Phaser.Easing.Default, true).onComplete.add(function () { _this.changingVolume = false; }, this);
                this.game.add.tween(this.dangerMusic).to({ volume: 0 }, 500, Phaser.Easing.Default, true);
            }
        }
        else {
            if (this.dangerMusic.volume == 0 && !this.changingVolume) {
                this.changingVolume = true;
                this.game.add.tween(this.happyMusic).to({ volume: 0 }, 500, Phaser.Easing.Default, true);
                this.game.add.tween(this.worryMusic).to({ volume: 0 }, 500, Phaser.Easing.Default, true);
                this.game.add.tween(this.dangerMusic).to({ volume: vol }, 500, Phaser.Easing.Default, true).onComplete.add(function () { _this.changingVolume = false; }, this);
            }
        }
        if (!this.changingVolume) {
            if (this.happyMusic.volume != 0) {
                this.happyMusic.volume = vol;
            }
            if (this.worryMusic.volume != 0) {
                this.worryMusic.volume = vol;
            }
            if (this.dangerMusic.volume != 0) {
                this.dangerMusic.volume = vol;
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
        var sprite = this.game.make.sprite(0, 0, "backgroundHouse");
        sprite.alpha = 0;
        function overlapping(backgroundHouses) {
            for (var i = 0; i < backgroundHouses.length; i++) {
                if (backgroundHouses[i].overlap(sprite)) {
                    return true;
                }
            }
            return false;
        }
        var limit = 100;
        do {
            sprite.position.setTo(GAME_WIDTH * Math.random(), 370 + 50 * Math.random());
            limit--;
        } while (overlapping(this.backgroundHouses) && limit > 0);
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
        if (this.people.length < 2) {
            return;
        }
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
        this.fadedSprite.x = x;
        this.fadedSprite.y = y;
    };
    GameState.prototype.mouseTileX = function () {
        return Math.floor(this.game.input.activePointer.x / TILE_SIZE + 0.5);
    };
    GameState.prototype.mouseTileY = function () {
        var x = this.mouseTileX();
        var mouseY = Math.floor(this.game.input.activePointer.y / TILE_SIZE + 0.5);
        switch (this.currentTileType) {
            case TileType.HOUSE:
                var viableHeight = this.tileElevation - 1;
                while (viableHeight > mouseY && (this.houseExistsAt(x, viableHeight) || (this.buildExistsAt(x, viableHeight) && this.buildAt(x, viableHeight).getTileType() == TileType.HOUSE))) {
                    viableHeight--;
                }
                return Math.max(viableHeight, 1);
            case TileType.FARM:
                return this.tileElevation - 1;
            default:
                return Math.floor((this.game.input.activePointer.y + TILE_SIZE * 0.5 + this.game.camera.y) / TILE_SIZE);
        }
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
    GameState.prototype.createPerson = function (x, y, startingHunger) {
        if (startingHunger === void 0) { startingHunger = 0.5; }
        var person = new Person(x, y, this.game, startingHunger);
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
    GameState.prototype.buildAt = function (x, y, tileType) {
        for (var i = 0; i < this.builds.length; i++) {
            if (this.builds[i].getX() == x && this.builds[i].getY() == y && (tileType === undefined || this.builds[i].getTileType() == tileType)) {
                return this.builds[i];
            }
        }
        return null;
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
        if (this.currentTileType != TileType.REMOVE) {
            var time = this.game.time.totalElapsedSeconds();
            if (this.currentTileType != TileType.HOUSE || time - this.lastHouseBuilt > this.houseBuildingCooldown) {
                var build = this.startConstruction(mouseX, mouseY, this.currentTileType);
                this.lastHouseBuilt = time;
            }
        }
        else {
            var build = this.buildAt(mouseX, mouseY);
            if (build !== null) {
                build.finish();
                this.builds.splice(this.builds.indexOf(build), 1);
            }
        }
    };
    GameState.prototype.rightClick = function () {
        if (this.currentTileType == TileType.FARM) {
            this.currentTileType = TileType.HOUSE;
            this.fadedSprite.animations.frame = 1;
        }
        else if (this.currentTileType == TileType.HOUSE) {
            this.currentTileType = TileType.REMOVE;
            this.fadedSprite.animations.frame = 2;
        }
        else if (this.currentTileType == TileType.REMOVE) {
            this.currentTileType = TileType.FARM;
            this.fadedSprite.animations.frame = 0;
        }
    };
    return GameState;
})();
