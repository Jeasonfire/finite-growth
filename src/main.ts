
var GAME_WIDTH = 900;
var GAME_HEIGHT = 600;

class Main {
    private game: Phaser.Game;

    public constructor() {
        this.game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, "game", new GameState());
    }
}

window.onload = () => {
    new Main();
}

document.getElementById("game").oncontextmenu = () => {
    return false; // Prevent context menu from opening in the game window
}
