var PreloadingState = (function () {
    function PreloadingState() {
    }
    PreloadingState.prototype.preload = function () {
        this.loadingBar = this.game.add.sprite((GAME_WIDTH - 700) / 2, (GAME_HEIGHT - 100) / 2, "loadingBar");
        this.game.load.setPreloadSprite(this.loadingBar);
        this.game.load.image("background", "./res/img/background.png");
        this.game.load.image("backgroundHouse", "./res/img/backgroundHouse.png");
        this.game.load.image("ground", "./res/img/ground.png");
        this.game.load.image("buildProgress", "./res/img/buildProgress.png");
        this.game.load.image("hungerFull", "./res/img/hungerFull.png");
        this.game.load.image("hungerEmpty", "./res/img/hungerEmpty.png");
        this.game.load.image("blood", "./res/img/blood.png");
        this.game.load.image("heart", "./res/img/heart.png");
        this.game.load.image("title", "./res/img/title.png");
        this.game.load.image("playButton", "./res/img/playButton.png");
        this.game.load.image("playButtonUnderline", "./res/img/playButtonUnderline.png");
        this.game.load.image("mainMenuBackground", "./res/img/mainMenuBackground.png");
        this.game.load.spritesheet("house", "./res/img/house.png", 32, 32);
        this.game.load.spritesheet("farm", "./res/img/farm.png", 32, 32);
        this.game.load.spritesheet("person", "./res/img/person.png", 12, 12);
        this.game.load.spritesheet("refreshFarm", "./res/img/refreshFarm.png", 64, 64);
        this.game.load.spritesheet("fadedSprites", "./res/img/fadedSprites.png", 32, 32);
        this.game.load.audio("perish", "./res/sfx/perish.wav");
        this.game.load.audio("life", "./res/sfx/life.wav");
        this.game.load.audio("collision", "./res/sfx/collision.wav");
        this.game.load.audio("mainTheme", "./res/mus/mainTheme.ogg");
        this.game.load.audio("happyTheme", "./res/mus/happyTheme.ogg");
        this.game.load.audio("worryTheme", "./res/mus/worryTheme.ogg");
        this.game.load.audio("dangerTheme", "./res/mus/dangerTheme.ogg");
    };
    PreloadingState.prototype.create = function () {
        var _this = this;
        this.game.add.tween(this.loadingBar).to({ alpha: 0 }, 500, Phaser.Easing.Default, true).onComplete.add(function () {
            _this.toMainMenu();
        }, this);
    };
    PreloadingState.prototype.toMainMenu = function () {
        this.game.state.start("MainMenu");
    };
    return PreloadingState;
})();
