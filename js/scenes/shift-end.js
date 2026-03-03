class ShiftEndScene extends Phaser.Scene {
  constructor() { super('ShiftEnd'); }

  create() {
    var totalScore = GAME_STATE.score - (GAME_STATE.overtimePenalty || 0);
    var totalOrders = GAME_STATE.shiftOrders.length;
    var perfects = GAME_STATE.shiftResults.filter(function(r) { return r.isPerfect; }).length;

    // Calculate max possible score
    var maxScore = 0;
    GAME_STATE.shiftOrders.forEach(function(order) {
      maxScore += (order.recipe.ingredients.length * 10) + 25 + 10;
    });
    maxScore *= 4;

    var pct = maxScore > 0 ? Math.max(0, totalScore) / maxScore : 0;
    var stars = pct >= 0.7 ? 3 : pct >= 0.5 ? 2 : pct >= 0.25 ? 1 : 0;

    // Save progress
    var progress = loadProgress();
    progress.totalShifts++;
    if (totalScore > progress.highScore) progress.highScore = totalScore;
    var scoreKey = GAME_STATE.category + '-' + GAME_STATE.difficulty;
    var existing = progress.scores[scoreKey];
    if (!existing || totalScore > existing.score) {
      progress.scores[scoreKey] = { score: totalScore, stars: stars };
    }
    saveProgress(progress);

    // Background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e, 1);

    // Title
    var title = this.add.text(GAME_WIDTH / 2, 60, 'SHIFT COMPLETE!', {
      fontSize: '36px', fontFamily: 'monospace', fill: '#FFD23F', stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5).setScale(0);

    this.tweens.add({ targets: title, scale: 1, duration: 500, ease: 'Back.easeOut' });

    // Score counter animation
    var scoreDisplay = this.add.text(GAME_WIDTH / 2, 140, '0', {
      fontSize: '48px', fontFamily: 'monospace', fill: '#FFF', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    this.tweens.addCounter({
      from: 0, to: Math.max(0, totalScore), duration: 1500, delay: 600,
      onUpdate: function(t) { scoreDisplay.setText(Math.floor(t.getValue())); }
    });

    this.add.text(GAME_WIDTH / 2, 175, 'points', {
      fontSize: '14px', fontFamily: 'monospace', fill: '#999'
    }).setOrigin(0.5);

    if (GAME_STATE.overtimePenalty > 0) {
      this.add.text(GAME_WIDTH / 2, 200, 'Overtime: -' + GAME_STATE.overtimePenalty, {
        fontSize: '12px', fontFamily: 'monospace', fill: '#F44336'
      }).setOrigin(0.5);
    }

    // Stars (drop in one by one)
    var self = this;
    for (var i = 0; i < 3; i++) {
      (function(idx) {
        var starX = GAME_WIDTH / 2 - 50 + idx * 50;
        var starY = 250;
        var isFilled = idx < stars;
        self.time.delayedCall(2200 + idx * 400, function() {
          var starText = self.add.text(starX, -30, isFilled ? '★' : '☆', {
            fontSize: '40px', fill: isFilled ? '#FFD23F' : '#555'
          }).setOrigin(0.5);
          self.tweens.add({
            targets: starText, y: starY, duration: 400, ease: 'Bounce.easeOut'
          });
          if (isFilled) SFX.ding();
        });
      })(i);
    }

    // Confetti on 3 stars
    if (stars === 3) {
      self.time.delayedCall(3800, function() {
        SFX.fanfare();
        for (var c = 0; c < 50; c++) {
          var colors = [0xFF4081, 0xFFD23F, 0x4CAF50, 0x2196F3, 0xFF9800];
          var conf = self.add.rectangle(
            Phaser.Math.Between(100, GAME_WIDTH - 100), -20,
            Phaser.Math.Between(4, 8), Phaser.Math.Between(8, 16),
            colors[c % colors.length], 1
          );
          self.tweens.add({
            targets: conf,
            y: GAME_HEIGHT + 50,
            x: conf.x + Phaser.Math.Between(-100, 100),
            angle: Phaser.Math.Between(-360, 360),
            duration: Phaser.Math.Between(1500, 3000),
            delay: c * 40,
            onComplete: function() { conf.destroy(); }
          });
        }
      });
    }

    // Order breakdown
    this.add.text(GAME_WIDTH / 2, 310, perfects + '/' + totalOrders + ' Perfect Orders', {
      fontSize: '13px', fontFamily: 'monospace', fill: '#CCC'
    }).setOrigin(0.5);

    var breakdownY = 345;
    GAME_STATE.shiftResults.forEach(function(r, i) {
      var color = r.isPerfect ? '#4CAF50' : '#F44336';
      var txt = (i + 1) + '. ' + r.recipe + ' (' + SIZE_LABELS[r.size] + ') ' + (r.isPerfect ? 'PASS' : 'FAIL') + ' ' + (r.score >= 0 ? '+' : '') + r.score;
      self.add.text(GAME_WIDTH / 2, breakdownY + i * 18, txt, {
        fontSize: '10px', fontFamily: 'monospace', fill: color
      }).setOrigin(0.5);
    });

    // Buttons
    var btnY = breakdownY + GAME_STATE.shiftResults.length * 18 + 30;
    this._makeButton(GAME_WIDTH / 2 - 100, btnY, 'NEW SHIFT', 0x4CAF50, function() {
      self.scene.start('CategorySelect');
    });
    this._makeButton(GAME_WIDTH / 2 + 100, btnY, 'HOME', 0x757575, function() {
      self.scene.start('Menu');
    });
  }

  _makeButton(x, y, label, color, callback) {
    var btn = this.add.rectangle(x, y, 140, 36, color, 1).setInteractive({ useHandCursor: true });
    btn.setStrokeStyle(2, 0x000000);
    this.add.text(x, y, label, {
      fontSize: '12px', fontFamily: 'monospace', fill: '#FFF', fontStyle: 'bold'
    }).setOrigin(0.5);
    btn.on('pointerdown', function() { SFX.scoop(); callback(); });
  }
}
