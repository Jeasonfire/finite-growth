var Build = (function () {
    function Build(x, y) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
        this.progress = 0;
        this.beingWorkedOn = false;
    }
    Build.prototype.setSprite = function (sprite, game) {
        this.sprite = sprite;
        this.updateSprite();
    };
    Build.prototype.updateTimer = function (time) {
        if (this.progress < 1) {
            this.progress += time.physicsElapsed * Build.BUILD_PARTS_FREQ;
        }
        this.updateSprite();
    };
    Build.prototype.updateSprite = function () {
        var progress = Math.min(1, Math.max(0, this.progress));
        this.sprite.animations.frame = Math.floor(4 + progress * 6);
    };
    Build.prototype.finish = function () {
        this.sprite.destroy();
        this.progress = 1;
    };
    Build.prototype.isDoneBuilding = function () {
        return this.progress >= 1;
    };
    Build.prototype.getX = function () {
        return this.x;
    };
    Build.prototype.getY = function () {
        return this.y;
    };
    Build.BUILD_PARTS_FREQ = 0.2;
    return Build;
})();
