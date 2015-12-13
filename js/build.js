var Build = (function () {
    function Build(x, y, tileType) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
        this.tileType = tileType;
        this.progress = 0;
        this.beingWorkedOn = false;
    }
    Build.prototype.setSprite = function (sprite, game) {
        this.sprite = sprite;
        this.updateSprite();
    };
    Build.prototype.updateTimer = function (time) {
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
    };
    Build.prototype.updateSprite = function () {
        var progress = Math.min(1, Math.max(0, this.progress));
        this.sprite.animations.frame = Math.floor(this.constructionFrame() + progress * 6);
    };
    Build.prototype.finish = function () {
        this.sprite.destroy();
        this.progress = 1;
    };
    Build.prototype.constructionFrame = function () {
        return this.tileType == TileType.HOUSE ? 4 : 1;
    };
    Build.prototype.spriteType = function () {
        return this.tileType == TileType.HOUSE ? "house" : "farm";
    };
    Build.prototype.isDoneBuilding = function () {
        return this.progress >= 1;
    };
    Build.prototype.getTileType = function () {
        return this.tileType;
    };
    Build.prototype.getX = function () {
        return this.x;
    };
    Build.prototype.getY = function () {
        return this.y;
    };
    Build.BUILD_HOUSE_PARTS_FREQ = 0.1;
    Build.BUILD_FARM_PARTS_FREQ = 0.35;
    return Build;
})();
