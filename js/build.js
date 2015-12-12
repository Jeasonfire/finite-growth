var Build = (function () {
    function Build(x, y) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
        this.progress = 0;
    }
    Build.prototype.getX = function () {
        return this.x;
    };
    Build.prototype.getY = function () {
        return this.y;
    };
    Build.prototype.updateTimer = function (time) {
        if (this.progress < 1) {
            this.progress += time.physicsElapsed * Build.BUILD_PARTS_FREQ;
        }
    };
    Build.prototype.isDoneBuilding = function () {
        return this.progress >= 1;
    };
    Build.BUILD_PARTS_FREQ = 0.2;
    return Build;
})();
