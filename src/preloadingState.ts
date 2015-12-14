class PreloadingState {
    private game: Phaser.Game;

    private loadingBar: Phaser.Sprite;

    public preload(): void {
        this.loadingBar = this.game.add.sprite((GAME_WIDTH - 700) / 2, (GAME_HEIGHT - 100) / 2, "loadingBar");
        this.game.load.setPreloadSprite(this.loadingBar);

        // Images
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

        // Spritesheets
        this.game.load.spritesheet("house", "./res/img/house.png", 32, 32);
        this.game.load.spritesheet("farm", "./res/img/farm.png", 32, 32);
        this.game.load.spritesheet("person", "./res/img/person.png", 12, 12);
        this.game.load.spritesheet("refreshFarm", "./res/img/refreshFarm.png", 64, 64);
        this.game.load.spritesheet("fadedSprites", "./res/img/fadedSprites.png", 32, 32);

        // Sounds
        this.game.load.audio("perish", "./res/sfx/perish.wav");
        this.game.load.audio("life", "./res/sfx/life.wav");
        this.game.load.audio("collision", "./res/sfx/collision.wav");
        this.game.load.audio("mainTheme", "./res/mus/mainTheme.ogg");
        this.game.load.audio("happyTheme", "./res/mus/happyTheme.ogg");
        this.game.load.audio("worryTheme", "./res/mus/worryTheme.ogg");
        this.game.load.audio("dangerTheme", "./res/mus/dangerTheme.ogg");
    }

    public create(): void {
        this.game.add.tween(this.loadingBar).to({alpha: 0}, 500, Phaser.Easing.Default, true).onComplete.add(() => {
            this.toMainMenu();
        }, this);
    }

    private toMainMenu(): void {
        this.game.state.start("MainMenu");
    }
}
