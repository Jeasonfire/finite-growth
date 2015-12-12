var TILE_SIZE = 32;
var WORLD_WIDTH = 900;
var CAMERA_MOVEMENT_MARGIN = 100;
var TileType;
(function (TileType) {
    TileType[TileType["HOUSE"] = 0] = "HOUSE";
    TileType[TileType["GROUND"] = 1] = "GROUND";
})(TileType || (TileType = {}));
var GameState = (function () {
    function GameState() {
    }
    GameState.prototype.preload = function () {
        this.game.load.image("background", "./res/img/background.png");
        this.game.load.image("ground", "./res/img/ground.png");
        this.game.load.image("buildProgress", "./res/img/buildProgress.png");
        this.game.load.spritesheet("house", "./res/img/house.png", 32, 32);
        this.game.load.spritesheet("person", "./res/img/person.png", 8, 8);
    };
    GameState.prototype.create = function () {
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.gravity.y = 900;
        this.game.input.activePointer.leftButton.onDown.add(this.leftClick, this);
        this.game.input.activePointer.rightButton.onDown.add(this.rightClick, this);
        var background = this.game.add.sprite(0, 0, "background");
        background.fixedToCamera = true;
        this.ground = this.game.add.group();
        this.tileElevation = 15;
        for (var i = 0; i < WORLD_WIDTH / TILE_SIZE; i++) {
            this.createGround(i, this.tileElevation);
        }
        this.builds = [];
        this.houses = [];
        var build = this.startConstruction(Math.floor(Math.floor(900 / TILE_SIZE) / 2), this.tileElevation - 1);
        this.finishBuild(build);
        this.fadedGroundSprite = this.game.add.sprite(0, 0, "ground");
        this.fadedGroundSprite.anchor.setTo(0.5);
        this.fadedGroundSprite.alpha = 0.4;
        this.fadedGroundSprite.visible = false;
        this.fadedHouseSprite = this.game.add.sprite(0, 0, "house");
        this.fadedHouseSprite.anchor.setTo(0.5);
        this.fadedHouseSprite.alpha = 0.4;
        this.fadedHouseSprite.visible = true;
        this.currentFaded = TileType.HOUSE;
        this.personSpriteTemplate = this.game.add.sprite(0, 0, "person");
        this.personSpriteTemplate.anchor.setTo(0.5);
    };
    GameState.prototype.update = function () {
        this.updateMouseSprite();
        if (this.game.input.activePointer.leftButton.isDown) {
            this.leftClick();
        }
        for (var i = 0; i < this.builds.length; i++) {
            this.builds[i].updateTimer(this.game.time);
            if (this.builds[i].isDoneBuilding()) {
                this.finishBuild(this.builds[i]);
                this.builds.splice(i, 1);
            }
        }
        for (var i = 0; i < this.houses.length; i++) {
            this.updateHouse(this.houses[i]);
        }
        this.updateCamera();
    };
    GameState.prototype.updateCamera = function () {
    };
    GameState.prototype.updateMouseSprite = function () {
        var x = this.mouseTileX() * TILE_SIZE;
        var y = this.mouseTileY() * TILE_SIZE;
        switch (this.currentFaded) {
            case TileType.HOUSE:
                this.fadedHouseSprite.x = x;
                this.fadedHouseSprite.y = y;
                break;
            case TileType.GROUND:
                this.fadedGroundSprite.x = x;
                this.fadedGroundSprite.y = y;
                break;
        }
    };
    GameState.prototype.mouseTileX = function () {
        return Math.floor((this.game.input.activePointer.x + TILE_SIZE * 0.5 + this.game.camera.x) / TILE_SIZE);
    };
    GameState.prototype.mouseTileY = function () {
        return Math.floor((this.game.input.activePointer.y + TILE_SIZE * 0.5 + this.game.camera.y) / TILE_SIZE);
    };
    GameState.prototype.startConstruction = function (xTile, yTile) {
        var build = new Build(xTile, yTile);
        var groundUnder = this.groundExistsAt(xTile, yTile + 1);
        var tileOver = this.buildExistsAt(xTile, yTile) || this.houseExistsAt(xTile, yTile) || this.groundExistsAt(xTile, yTile);
        var tileUnder = this.buildExistsAt(xTile, yTile + 1) || this.houseExistsAt(xTile, yTile + 1) || groundUnder;
        if (!tileOver && tileUnder) {
            build.sprite = this.game.add.sprite(build.getX() * TILE_SIZE, build.getY() * TILE_SIZE, "house");
            build.sprite.anchor.setTo(0.5);
            build.sprite.frame = 0;
            this.builds.push(build);
            return build;
        }
        else {
            return null;
        }
    };
    GameState.prototype.finishBuild = function (build) {
        var x = build.getX();
        var y = build.getY();
        build.sprite.destroy();
        var house = this.game.add.sprite(x * TILE_SIZE, y * TILE_SIZE, "house");
        house.anchor.setTo(0.5, 0.5);
        this.houses.push(house);
        return house;
    };
    GameState.prototype.updateHouse = function (house) {
        var x = Math.floor(house.x / TILE_SIZE);
        var y = Math.floor(house.y / TILE_SIZE);
        var groundUnder = this.groundExistsAt(x, y + 1);
        var tileUnder = this.buildExistsAt(x, y + 1) || this.houseExistsAt(x, y + 1) || groundUnder;
        var houseOnTop = this.buildExistsAt(x, y - 1) || this.houseExistsAt(x, y - 1);
        var houseUnder = tileUnder && !groundUnder;
        var houseType = 1;
        if (houseUnder && houseOnTop) {
            houseType = 3;
        }
        else if (houseUnder) {
            houseType = 4;
        }
        else if (houseOnTop) {
            houseType = 2;
        }
        if (houseType != house.frame) {
            house.frame = houseType;
        }
    };
    GameState.prototype.createGround = function (xTile, yTile) {
        if (yTile == this.tileElevation && !this.groundExistsAt(xTile, yTile)) {
            var pieceOfGround = this.ground.add(this.game.add.sprite(Math.floor(xTile) * TILE_SIZE, Math.floor(yTile) * TILE_SIZE, "ground"));
            pieceOfGround.anchor.setTo(0.5);
            this.game.physics.p2.enableBody(pieceOfGround, false);
            pieceOfGround.body.kinematic = false;
            pieceOfGround.body.dynamic = false;
        }
    };
    GameState.prototype.buildExistsAt = function (x, y) {
        for (var i = 0; i < this.builds.length; i++) {
            if (this.builds[i].getX() == x && this.builds[i].getY() == y) {
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
        if (this.currentFaded == TileType.HOUSE) {
            this.startConstruction(mouseX, mouseY);
        }
        else if (this.currentFaded == TileType.GROUND) {
            this.createGround(mouseX, mouseY);
        }
    };
    GameState.prototype.rightClick = function () {
        if (this.currentFaded == TileType.HOUSE) {
            this.currentFaded = TileType.GROUND;
            this.fadedGroundSprite.visible = true;
            this.fadedHouseSprite.visible = false;
        }
        else if (this.currentFaded == TileType.GROUND) {
            this.currentFaded = TileType.HOUSE;
            this.fadedHouseSprite.visible = true;
            this.fadedGroundSprite.visible = false;
        }
    };
    return GameState;
})();
