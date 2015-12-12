var TILE_SIZE = 16;
var CAMERA_MOVEMENT_MARGIN = 100;

enum TileType {
    HOUSE, GROUND
}

class GameState {
    private game: Phaser.Game;
    private ground: Phaser.Group;
    private tileElevation: number;

    private currentFaded: number;
    private fadedGroundSprite: Phaser.Sprite;
    private fadedHouseSprite: Phaser.Sprite;

    private builds: Build[];
    private houses: Phaser.Sprite[];

    public preload(): void {
        this.game.load.image("background", "./res/img/background.png");
        this.game.load.image("ground", "./res/img/ground.png");
        this.game.load.spritesheet("house", "./res/img/house.png", 16, 16);
        this.game.load.image("buildProgress", "./res/img/buildProgress.png");
    }

    public create(): void {
        this.game.input.activePointer.leftButton.onDown.add(this.leftClick, this);
        this.game.input.activePointer.rightButton.onDown.add(this.rightClick, this);

        var background = this.game.add.sprite(0, 0, "background");
        background.fixedToCamera = true;

        this.ground = this.game.add.group();
        this.tileElevation = 30;
        var startingBlocks = 5;
        for (var i = 0; i < startingBlocks; i++) {
            this.createGround(Math.floor((Math.floor(900 / TILE_SIZE) - startingBlocks) / 2) + i, this.tileElevation);
        }

        this.builds = [];

        this.houses = [];
        var build = this.startConstruction(Math.floor(Math.floor(900 / TILE_SIZE) / 2), this.tileElevation - 1);
        this.finishBuild(build);

        this.fadedGroundSprite = this.game.add.sprite(0, 0, "ground");
        this.fadedGroundSprite.alpha = 0.4;
        this.fadedGroundSprite.visible = false;

        this.fadedHouseSprite = this.game.add.sprite(0, 0, "house");
        this.fadedHouseSprite.alpha = 0.4;
        this.fadedHouseSprite.visible = true;

        this.currentFaded = TileType.HOUSE;
    }

    public update(): void {
        this.updateMouseSprite();
        if (this.game.input.activePointer.leftButton.isDown) {
            this.leftClick();
        }
        for (var i = 0; i < this.builds.length; i++) {
            this.builds[i].updateTimer(this.game.time);
            if (this.builds[i].isDoneBuilding()) {
                this.finishBuild(this.builds[i]);
                this.builds.splice(i, 1);
            }
        }
        for (var i = 0; i < this.houses.length; i++) {
            this.updateHouse(this.houses[i]);
        }
    }

    private updateMouseSprite(): void {
        var x = Math.floor((this.game.input.activePointer.x - this.game.camera.x) / TILE_SIZE) * TILE_SIZE;
        var y = Math.floor((this.game.input.activePointer.y - this.game.camera.y) / TILE_SIZE) * TILE_SIZE;
        switch (this.currentFaded) {
        case TileType.HOUSE:
            this.fadedHouseSprite.x = x;
            this.fadedHouseSprite.y = y;
            break;
        case TileType.GROUND:
            this.fadedGroundSprite.x = x;
            this.fadedGroundSprite.y = y;
            break;
        }
    }

    private startConstruction(xTile: number, yTile: number): Build {
        var build = new Build(xTile, yTile);
        var groundUnder = this.groundExistsAt(xTile, yTile + 1);
        var tileOver = this.buildExistsAt(xTile, yTile) || this.houseExistsAt(xTile, yTile) || this.groundExistsAt(xTile, yTile);
        var tileUnder = this.buildExistsAt(xTile, yTile + 1) || this.houseExistsAt(xTile, yTile + 1) || groundUnder;
        if (!tileOver && tileUnder) {
            build.sprite = this.game.add.sprite(build.getX() * TILE_SIZE, build.getY() * TILE_SIZE, "house");
            build.sprite.frame = 0;
            this.builds.push(build);
            return build;
        } else {
            return null;
        }
    }

    private finishBuild(build: Build): Phaser.Sprite {
        var x = build.getX();
        var y = build.getY();
        build.sprite.destroy();
        var house = this.game.add.sprite(x * TILE_SIZE, y * TILE_SIZE, "house");
        this.houses.push(house);
        return house;
    }

    private updateHouse(house: Phaser.Sprite): void {
        var x = Math.floor(house.x / TILE_SIZE);
        var y = Math.floor(house.y / TILE_SIZE);
        var groundUnder = this.groundExistsAt(x, y + 1);
        var tileUnder = this.buildExistsAt(x, y + 1) || this.houseExistsAt(x, y + 1) || groundUnder;
        var houseOnTop = this.buildExistsAt(x, y - 1) || this.houseExistsAt(x, y - 1);
        var houseUnder = tileUnder && !groundUnder;
        var houseType = 1;
        if (houseUnder && houseOnTop) {
            houseType = 3;
        } else if (houseUnder) {
            houseType = 4;
        } else if (houseOnTop) {
            houseType = 2;
        }
        if (houseType != house.frame) {
            house.frame = houseType;
        }
    }

    private createGround(xTile: number, yTile: number): void {
        if (yTile == this.tileElevation && !this.groundExistsAt(xTile, yTile)) {
            this.ground.add(this.game.add.sprite(Math.floor(xTile) * TILE_SIZE, Math.floor(yTile) * TILE_SIZE, "ground"));
        }
    }

    private buildExistsAt(x: number, y: number): boolean {
        for (var i = 0; i < this.builds.length; i++) {
            if (this.builds[i].getX() == x && this.builds[i].getY() == y) {
                return true;
            }
        }
        return false;
    }

    private houseExistsAt(x: number, y: number): boolean {
        for (var i = 0; i < this.houses.length; i++) {
            if (Math.floor(this.houses[i].x / TILE_SIZE) == x && Math.floor(this.houses[i].y / TILE_SIZE) == y) {
                return true;
            }
        }
        return false;
    }

    private groundExistsAt(x: number, y: number): boolean {
        for (var i = 0; i < this.ground.length; i++) {
            if (Math.floor(this.ground.children[i].x / TILE_SIZE) == x && Math.floor(this.ground.children[i].y / TILE_SIZE) == y) {
                return true;
            }
        }
        return false;
    }

    private leftClick(): void {
        var mouseX = Math.floor(this.game.input.activePointer.x / TILE_SIZE);
        var mouseY = Math.floor(this.game.input.activePointer.y / TILE_SIZE);

        if (this.currentFaded == TileType.HOUSE) {
            this.startConstruction(mouseX, mouseY);
        } else if (this.currentFaded == TileType.GROUND) {
            this.createGround(mouseX, mouseY);
        }
    }

    private rightClick(): void {
        if (this.currentFaded == TileType.HOUSE) {
            this.currentFaded = TileType.GROUND;
            this.fadedGroundSprite.visible = true;
            this.fadedHouseSprite.visible = false;
        } else if (this.currentFaded == TileType.GROUND) {
            this.currentFaded = TileType.HOUSE;
            this.fadedHouseSprite.visible = true;
            this.fadedGroundSprite.visible = false;
        }
    }
}
