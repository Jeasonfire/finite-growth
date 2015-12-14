var MainMenu = (function () {
    function MainMenu() {
    }
    MainMenu.prototype.create = function () {
        var _this = this;
        gui.open();
        this.game.add.sprite(0, 0, "mainMenuBackground");
        this.music = this.game.add.sound("mainTheme", getMusicLevel(), true);
        this.music.play();
        this.everything = this.game.add.group();
        this.everything.alpha = 1;
        this.everything.add(this.game.make.sprite(50, 50, "title"));
        this.playSound = this.game.add.sound("perish");
        this.playButton = this.game.make.button(56, 250, "playButton", this.closeMainMenu, this);
        this.everything.add(this.playButton);
        this.playButtonUnderline = this.game.make.sprite(56, 250 + 39, "playButtonUnderline");
        this.everything.add(this.playButtonUnderline);
        this.playButtonUnderline.alpha = 0;
        this.playButton.onInputOver.add(function () {
            _this.game.add.tween(_this.playButtonUnderline).to({ alpha: 1 }, 750, Phaser.Easing.Bounce.In, true);
        }, this);
        this.playButton.onInputOut.add(function () {
            _this.game.add.tween(_this.playButtonUnderline).to({ alpha: 0 }, 750, Phaser.Easing.Bounce.Out, true);
        }, this);
    };
    MainMenu.prototype.update = function () {
        this.game.sound.volume = getMasterLevel();
        this.playSound.volume = getOtherEffectLevel();
        this.music.volume = getMusicLevel();
    };
    MainMenu.prototype.closeMainMenu = function () {
        this.playSound.play();
        this.music.fadeTo(200, 0);
        this.game.add.tween(this.everything).to({ alpha: 0 }, 250, Phaser.Easing.Default, true).onComplete.add(this.startGame, this);
    };
    MainMenu.prototype.startGame = function () {
        this.music.destroy();
        this.playSound.destroy();
        this.game.state.start("Game");
    };
    return MainMenu;
})();
