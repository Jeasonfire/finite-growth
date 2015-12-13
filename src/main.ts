var gui = new dat.GUI();

var GAME_WIDTH = 900;
var GAME_HEIGHT = 600;

var soundLevel = {"Sound effect volume: ": 20};
gui.add(soundLevel, "Sound effect volume: ", 0, 100).step(1).listen();
var musicLevel = {"Music volume: ": 20};
gui.add(musicLevel, "Music volume: ", 0, 100).step(1).listen();

class Main {
    private game: Phaser.Game;

    public constructor() {
        this.game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, "game");
        this.game.state.add("PrePreload", class PrePrLoad {
            private game: Phaser.Game;
            public preload(): void {
                this.game.load.image("loadingBar", "./res/img/loadingBar.png");
            }
            public create(): void {
                this.game.state.start("Preload");
            }
        });
        this.game.state.add("Preload", PreloadingState);
        this.game.state.add("MainMenu", MainMenu);
        this.game.state.add("Game", GameState);
        this.game.state.start("PrePreload");
    }
}

window.onload = () => {
    new Main();
}

document.getElementById("game").oncontextmenu = () => {
    return false; // Prevent context menu from opening in the game window
}
