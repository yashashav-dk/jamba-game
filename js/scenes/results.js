class ResultsScene extends Phaser.Scene {
  constructor() { super('Results'); }

  create(data) {
    var allergenCorrect = data ? data.allergenCorrect : true;
    var recipe = GAME_STATE.currentRecipe;
    var sizeKey = GAME_STATE.size;
    var isRetry = GAME_STATE.isRetry;
    var isPractice = GAME_STATE.mode === 'practice';

    var grade = gradeRecipe(GAME_STATE.blenderContents, recipe, sizeKey);
    var hasErrors = grade.wrong.length > 0 || grade.missing.length > 0 || grade.extra.length > 0;
    var pointsEarned = 0;

    if (!isRetry && !isPractice) {
      pointsEarned = (grade.score + GAME_STATE.allergenScore) * GAME_STATE.combo;
      GAME_STATE.score += pointsEarned;

      // Update combo
      if (grade.isPerfect && allergenCorrect) {
        GAME_STATE.combo = Math.min(GAME_STATE.combo + 1, 4);
        SFX.fanfare();
      } else {
        if (GAME_STATE.combo > 1) {
          this.cameras.main.shake(200, 0.005);
        }
        GAME_STATE.combo = 1;
        if (!grade.isPerfect) SFX.wrong();
      }

      GAME_STATE.shiftResults.push({
        recipe: recipe.name,
        size: sizeKey,
        score: pointsEarned,
        isPerfect: grade.isPerfect && allergenCorrect,
        hadErrors: hasErrors
      });
    }

    // Dark overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);

    // Title
    var titleColor = (grade.isPerfect && allergenCorrect) ? '#4CAF50' : '#F44336';
    var titleText = (grade.isPerfect && allergenCorrect) ? 'PERFECT!' : 'CHECK YOUR RECIPE';
    this.add.text(GAME_WIDTH / 2, 40, titleText, {
      fontSize: '28px', fontFamily: 'monospace', fill: titleColor, stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    if (grade.isPerfect && allergenCorrect) {
      for (var i = 0; i < 10; i++) {
        var star = this.add.image(GAME_WIDTH / 2, 40, 'star-particle');
        this.tweens.add({
          targets: star,
          x: star.x + Phaser.Math.Between(-150, 150),
          y: star.y + Phaser.Math.Between(-30, 60),
          alpha: 0,
          angle: Phaser.Math.Between(-180, 180),
          duration: 800,
          delay: i * 50,
          onComplete: function() { star.destroy(); }
        });
      }
    }

    // Recipe name + size
    this.add.text(GAME_WIDTH / 2, 80, recipe.name + ' (' + SIZE_LABELS[sizeKey] + ')', {
      fontSize: '14px', fontFamily: 'monospace', fill: '#FFF'
    }).setOrigin(0.5);

    // Two columns: Your Recipe vs Correct
    var colLeftX = GAME_WIDTH / 2 - 140;
    var colRightX = GAME_WIDTH / 2 + 140;
    var rowY = 120;

    this.add.text(colLeftX, rowY, 'YOUR RECIPE', {
      fontSize: '12px', fontFamily: 'monospace', fill: '#FFD23F', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.text(colRightX, rowY, 'CORRECT', {
      fontSize: '12px', fontFamily: 'monospace', fill: '#FFD23F', fontStyle: 'bold'
    }).setOrigin(0.5);

    rowY += 25;

    grade.correct.forEach(function(item) {
      this.add.text(colLeftX, rowY, item.name + ' x' + item.got, {
        fontSize: '10px', fontFamily: 'monospace', fill: '#4CAF50'
      }).setOrigin(0.5);
      rowY += 16;
    }.bind(this));

    grade.wrong.forEach(function(item) {
      this.add.text(colLeftX, rowY, item.name + ' x' + item.got + ' (need ' + item.expected + ')', {
        fontSize: '10px', fontFamily: 'monospace', fill: '#F44336'
      }).setOrigin(0.5);
      rowY += 16;
    }.bind(this));

    grade.extra.forEach(function(item) {
      this.add.text(colLeftX, rowY, item.name + ' x' + item.got + ' (extra!)', {
        fontSize: '10px', fontFamily: 'monospace', fill: '#FF9800'
      }).setOrigin(0.5);
      rowY += 16;
    }.bind(this));

    grade.missing.forEach(function(item) {
      this.add.text(colLeftX, rowY, 'MISSING: ' + item.name, {
        fontSize: '10px', fontFamily: 'monospace', fill: '#F44336'
      }).setOrigin(0.5);
      rowY += 16;
    }.bind(this));

    // Correct recipe column
    var correctY = 145;
    recipe.ingredients.forEach(function(ing) {
      this.add.text(colRightX, correctY, ing.name + ' x' + ing[sizeKey], {
        fontSize: '10px', fontFamily: 'monospace', fill: '#CCC'
      }).setOrigin(0.5);
      correctY += 16;
    }.bind(this));

    // Score + allergen (shift only)
    var bottomY = 480;
    if (!isPractice) {
      if (!isRetry) {
        this.add.text(GAME_WIDTH / 2, bottomY, 'Allergen: ' + (allergenCorrect ? '✓ +10' : '✗ -10'), {
          fontSize: '12px', fontFamily: 'monospace', fill: allergenCorrect ? '#4CAF50' : '#F44336'
        }).setOrigin(0.5);
        bottomY += 22;
        this.add.text(GAME_WIDTH / 2, bottomY, (pointsEarned >= 0 ? '+' : '') + pointsEarned + ' pts' + (GAME_STATE.combo > 1 ? ' (x' + GAME_STATE.combo + ' combo)' : ''), {
          fontSize: '16px', fontFamily: 'monospace', fill: '#FFD23F', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);
        bottomY += 30;
      } else {
        this.add.text(GAME_WIDTH / 2, bottomY, 'Retry - no points', {
          fontSize: '12px', fontFamily: 'monospace', fill: '#999'
        }).setOrigin(0.5);
        bottomY += 30;
      }
    }

    // Buttons
    var self = this;
    if (isPractice) {
      this._makeResultButton(GAME_WIDTH / 2 - 90, bottomY + 20, 'TRY AGAIN', 0xFF9800, function() {
        GAME_STATE.isRetry = true;
        GAME_STATE.blenderContents = [];
        self.scene.start('Counter');
      });
      this._makeResultButton(GAME_WIDTH / 2 + 90, bottomY + 20, 'NEXT', 0x4CAF50, function() {
        var smoothies = RECIPES[GAME_STATE.category].smoothies;
        GAME_STATE.shiftOrders = [{ recipe: smoothies[Math.floor(Math.random() * smoothies.length)], size: SIZES[Math.floor(Math.random() * 3)] }];
        GAME_STATE.customerIndex = 0;
        GAME_STATE.isRetry = false;
        GAME_STATE.blenderContents = [];
        self.scene.start('Counter');
      });
      this._makeResultButton(GAME_WIDTH / 2, bottomY + 70, 'HOME', 0x757575, function() {
        self.scene.start('Menu');
      });
    } else if (hasErrors && !isRetry) {
      this._makeResultButton(GAME_WIDTH / 2, bottomY + 20, 'RETRY', 0xFF9800, function() {
        GAME_STATE.isRetry = true;
        GAME_STATE.blenderContents = [];
        self.scene.start('Counter');
      });
    } else {
      var isLast = GAME_STATE.customerIndex >= GAME_STATE.shiftOrders.length - 1;
      this._makeResultButton(GAME_WIDTH / 2, bottomY + 20, isLast ? 'FINISH SHIFT' : 'NEXT CUSTOMER', 0x4CAF50, function() {
        GAME_STATE.isRetry = false;
        GAME_STATE.blenderContents = [];
        GAME_STATE.customerIndex++;
        if (GAME_STATE.customerIndex >= GAME_STATE.shiftOrders.length) {
          self.scene.start('ShiftEnd');
        } else {
          self.scene.start('Counter');
        }
      });
    }
  }

  _makeResultButton(x, y, label, color, callback) {
    var btn = this.add.rectangle(x, y, 150, 36, color, 1).setInteractive({ useHandCursor: true });
    btn.setStrokeStyle(2, 0x000000);
    this.add.text(x, y, label, {
      fontSize: '13px', fontFamily: 'monospace', fill: '#FFF', fontStyle: 'bold'
    }).setOrigin(0.5);
    btn.on('pointerdown', function() {
      SFX.scoop();
      callback();
    });
  }
}
