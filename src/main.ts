var gui = new dat.GUI();
gui.close();

var GAME_WIDTH = 900;
var GAME_HEIGHT = 600;

var masterText = "Master volume: ";
var masterLevel = {"Master volume: ": 20};
var collisionText = "Collision volume: ";
var collisionLevel = {"Collision volume: ": 10};
var otherEffectText = "Other effects' volume: ";
var otherEffectLevel = {"Other effects' volume: ": 80};
var musicText = "Music volume: ";
var musicLevel = {"Music volume: ": 60};
gui.add(masterLevel, masterText, 0, 100).step(1).listen();
gui.add(collisionLevel, collisionText, 0, 100).step(1).listen();
gui.add(otherEffectLevel, otherEffectText, 0, 100).step(1).listen();
gui.add(musicLevel, musicText, 0, 100).step(1).listen();

function getMasterLevel() {
    return masterLevel[masterText] / 100.0;
}
function getCollisionLevel() {
    return collisionLevel[collisionText] / 100.0;
}
function getOtherEffectLevel() {
    return otherEffectLevel[otherEffectText] / 100.0;
}
function getMusicLevel() {
    return musicLevel[musicText] / 100.0;
}

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
