var GAME_WIDTH = 900;
var GAME_HEIGHT = 600;
var Main = (function () {
    function Main() {
        this.game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, "game", new GameState());
    }
    return Main;
})();
window.onload = function () {
    new Main();
};
document.getElementById("game").oncontextmenu = function () {
    return false;
};
