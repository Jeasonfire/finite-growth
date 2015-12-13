var GameGUI = (function () {
    function GameGUI(game) {
        this.game = game;
        this.autoFarmRefresh = false;
        this.buttonAutoFarm = this.game.add.button(15, 495, "refreshFarm", this.toggleAutoFarmRefresh, this, 5, 4, 6, 7);
        this.buttonAutoFarm.alpha = 0;
        this.showAutoFarmButton();
        this.font = "18px DefaultFont";
        this.workingPeople = this.game.add.text(100, 503, "Working people: 0/0", { font: this.font });
        this.amountOfHouses = this.game.add.text(100, 533, "Amount of houses: 0", { font: this.font });
        this.currentTool = this.game.add.text(350, 503, "Currently placing: Farm", { font: this.font });
        this.game.add.text(350, 530, "Avg. hunger: ", { font: this.font });
        this.averageHungerEmpty = this.game.add.sprite(475, 528, "hungerEmpty");
        this.averageHungerEmpty.smoothed = false;
        this.averageHungerEmpty.scale.setTo(8, 8);
        this.averageHungerFull = this.game.add.sprite(475, 528, "hungerFull");
        this.averageHungerFull.smoothed = false;
        this.averageHungerFull.scale.setTo(8, 8);
    }
    GameGUI.prototype.update = function (peopleAmt, freePeopleAmt, housesAmt, toolType, averageHunger) {
        this.workingPeople.setText("Working people: " + (peopleAmt - freePeopleAmt) + "/" + peopleAmt);
        this.amountOfHouses.setText("Amount of houses: " + housesAmt);
        var textStart = "Clicking now would.. ";
        switch (toolType) {
            case TileType.HOUSE:
                this.currentTool.setText(textStart + "place a house");
                break;
            case TileType.FARM:
                this.currentTool.setText(textStart + "place a farm");
                break;
            case TileType.REMOVE:
                this.currentTool.setText(textStart + "remove a build");
                break;
        }
        this.averageHungerFull.crop(new Phaser.Rectangle(0, 0, this.averageHungerEmpty.width * (1 - averageHunger) / 8, this.averageHungerEmpty.height / 8), false);
    };
    GameGUI.prototype.showAutoFarmButton = function () {
        this.game.add.tween(this.buttonAutoFarm).to({ alpha: 1 }, 2000, Phaser.Easing.Default, true);
    };
    GameGUI.prototype.autoFarm = function () {
        return this.autoFarmRefresh;
    };
    GameGUI.prototype.toggleAutoFarmRefresh = function () {
        this.autoFarmRefresh = !this.autoFarmRefresh;
        if (this.autoFarmRefresh) {
            this.buttonAutoFarm.setFrames(1, 0, 2, 3);
        }
        else {
            this.buttonAutoFarm.setFrames(5, 4, 6, 7);
        }
    };
    return GameGUI;
})();
