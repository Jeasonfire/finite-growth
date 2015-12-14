/* See README.md for more info.
 * Copyright (C) 2015  Jens (@Jeasonfire)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
