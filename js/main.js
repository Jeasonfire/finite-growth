var gui = new dat.GUI();
var GAME_WIDTH = 900;
var GAME_HEIGHT = 600;
var soundLevel = { "Sound effect volume: ": 20 };
gui.add(soundLevel, "Sound effect volume: ", 0, 100).step(1).listen();
var musicLevel = { "Music volume: ": 20 };
gui.add(musicLevel, "Music volume: ", 0, 100).step(1).listen();
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
