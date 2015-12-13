var gui = new dat.GUI();
gui.close();
var GAME_WIDTH = 900;
var GAME_HEIGHT = 600;
var masterText = "Master volume: ";
var masterLevel = { "Master volume: ": 20 };
var collisionText = "Collision volume: ";
var collisionLevel = { "Collision volume: ": 10 };
var otherEffectText = "Other effects' volume: ";
var otherEffectLevel = { "Other effects' volume: ": 80 };
var musicText = "Music volume: ";
var musicLevel = { "Music volume: ": 60 };
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
var Main = (function () {
    function Main() {
        this.game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, "game");
        this.game.state.add("PrePreload", (function () {
            function PrePrLoad() {
            }
            PrePrLoad.prototype.preload = function () {
                this.game.load.image("loadingBar", "./res/img/loadingBar.png");
            };
            PrePrLoad.prototype.create = function () {
                this.game.state.start("Preload");
            };
            return PrePrLoad;
        })());
        this.game.state.add("Preload", PreloadingState);
        this.game.state.add("MainMenu", MainMenu);
        this.game.state.add("Game", GameState);
        this.game.state.start("PrePreload");
    }
    return Main;
})();
window.onload = function () {
    new Main();
};
document.getElementById("game").oncontextmenu = function () {
    return false;
};
