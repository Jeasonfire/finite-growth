class MainMenu {
    private game: Phaser.Game;

    private everything: Phaser.Group;
    private playSound: Phaser.Sound;
    private playButton: Phaser.Button;
    private playButtonUnderline: Phaser.Sprite;

    public create(): void {
        gui.open();
        this.game.add.sprite(0, 0, "mainMenuBackground")
        this.everything = this.game.add.group();
        this.everything.alpha = 1;
        this.everything.add(this.game.make.sprite(50, 50, "title"));
        this.playSound = this.game.add.sound("perish");
        this.playButton = this.game.make.button(56, 250, "playButton", this.closeMainMenu, this);
        this.everything.add(this.playButton);
        this.playButtonUnderline = this.game.make.sprite(56, 250 + 39, "playButtonUnderline");
        this.everything.add(this.playButtonUnderline);
        this.playButtonUnderline.alpha = 0;
        this.playButton.onInputOver.add(() => {
            this.game.add.tween(this.playButtonUnderline).to({alpha: 1}, 750, Phaser.Easing.Bounce.In, true);
        }, this);
        this.playButton.onInputOut.add(() => {
            this.game.add.tween(this.playButtonUnderline).to({alpha: 0}, 750, Phaser.Easing.Bounce.Out, true);
        }, this);
    }

    private closeMainMenu(): void {
        this.game.sound.volume = getMasterLevel();
        this.playSound.volume = getOtherEffectLevel();
        this.playSound.play();
        this.game.add.tween(this.everything).to({alpha: 0}, 250, Phaser.Easing.Default, true).onComplete.add(this.startGame, this);
    }

    private startGame(): void {
        this.game.state.start("Game");
    }
}
