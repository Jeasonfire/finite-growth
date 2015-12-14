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

class Build {
    private static BUILD_HOUSE_PARTS_FREQ = 0.1;
    private static BUILD_FARM_PARTS_FREQ = 0.35;

    private x: number;
    private y: number;
    private sprite: Phaser.Sprite;
    private tileType: TileType;

    public progress: number;
    public beingWorkedOn: boolean;

    public constructor(x: number, y: number, tileType: TileType) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
        this.tileType = tileType;
        this.progress = 0;
        this.beingWorkedOn = false;
    }

    public setSprite(sprite: Phaser.Sprite, game: Phaser.Game): void {
        this.sprite = sprite;
        this.updateSprite();
    }

    public updateTimer(time: Phaser.Time): void {
        if (this.progress < 1) {
            switch (this.tileType) {
            case TileType.HOUSE:
                this.progress += time.physicsElapsed * Build.BUILD_HOUSE_PARTS_FREQ;
                break;
            case TileType.FARM:
                this.progress += time.physicsElapsed * Build.BUILD_FARM_PARTS_FREQ;
                break;
            }
        }
        this.updateSprite();
    }

    private updateSprite(): void {
        var progress = Math.min(1, Math.max(0, this.progress));
        this.sprite.animations.frame = Math.floor(this.constructionFrame() + progress * 6);
    }

    public finish(): void {
        this.sprite.destroy();
        this.progress = 1;
    }

    public constructionFrame(): number {
        return this.tileType == TileType.HOUSE ? 4 : 1;
    }

    public spriteType(): string {
        return this.tileType == TileType.HOUSE ? "house" : "farm";
    }

    public isDoneBuilding(): boolean {
        return this.progress >= 1;
    }

    public getTileType(): TileType {
        return this.tileType;
    }

    public getX(): number {
        return this.x;
    }

    public getY(): number {
        return this.y;
    }
}
