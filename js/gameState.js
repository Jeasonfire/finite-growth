var TILE_SIZE = 64;
var GameState = (function () {
    function GameState() {
    }
    GameState.prototype.preload = function () {
        this.game.load.image("background", "./res/img/background.png");
        this.game.load.image("ground", "./res/img/ground.png");
        this.game.load.image("house", "./res/img/house.png");
    };
    GameState.prototype.create = function () {
        this.game.input.activePointer.leftButton.onDown.add(this.leftClick, this);
        this.game.input.activePointer.rightButton.onDown.add(this.rightClick, this);
        var background = this.game.add.sprite(0, 0, "background");
        background.fixedToCamera = true;
        this.ground = this.game.add.group();
        this.tileElevation = 7;
        var startingBlocks = 5;
        for (var i = 0; i < startingBlocks; i++) {
            var block = this.game.add.sprite(Math.floor((Math.floor(900 / TILE_SIZE) - startingBlocks) / 2) * TILE_SIZE + i * TILE_SIZE, this.tileElevation * TILE_SIZE, "ground");
            this.ground.add(block);
        }
        this.fadedGroundSprite = this.game.add.sprite(0, 0, "ground");
        this.fadedGroundSprite.alpha = 0.4;
        this.fadedGroundSprite.visible = false;
        this.fadedHouseSprite = this.game.add.sprite(0, 0, "house");
        this.fadedHouseSprite.alpha = 0.4;
        this.fadedHouseSprite.visible = true;
        this.currentFaded = GameState.FADED_HOUSE;
    };
    GameState.prototype.update = function () {
        this.updateMouseSprite();
    };
    GameState.prototype.leftClick = function () {
    };
    GameState.prototype.rightClick = function () {
        if (this.currentFaded == GameState.FADED_HOUSE) {
            this.currentFaded = GameState.FADED_GROUND;
            this.fadedGroundSprite.visible = true;
            this.fadedHouseSprite.visible = false;
        }
        else if (this.currentFaded == GameState.FADED_GROUND) {
            this.currentFaded = GameState.FADED_HOUSE;
            this.fadedHouseSprite.visible = true;
            this.fadedGroundSprite.visible = false;
        }
    };
    GameState.prototype.updateMouseSprite = function () {
        var x = Math.floor((this.game.input.activePointer.position.x - this.game.camera.x) / TILE_SIZE) * TILE_SIZE;
        var y = Math.floor((this.game.input.activePointer.position.y - this.game.camera.y) / TILE_SIZE) * TILE_SIZE;
        switch (this.currentFaded) {
            case GameState.FADED_HOUSE:
                this.fadedHouseSprite.x = x;
                this.fadedHouseSprite.y = y;
                break;
            case GameState.FADED_GROUND:
                this.fadedGroundSprite.x = x;
                this.fadedGroundSprite.y = y;
                break;
        }
    };
    GameState.FADED_HOUSE = 0;
    GameState.FADED_GROUND = 1;
    return GameState;
})();
