class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    // Wood background
    for (var x = 0; x < GAME_WIDTH; x += 16) {
      for (var y = 0; y < GAME_HEIGHT; y += 16) {
        this.add.image(x, y, 'wood-tile').setOrigin(0);
      }
    }

    // Dark overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5);

    // Title
    var title = this.add.text(GAME_WIDTH / 2, 140, 'JAMBA SHIFT\nTRAINER', {
      fontSize: '48px',
      fontFamily: 'monospace',
      fill: '#FFD23F',
      align: 'center',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Title glow animation
    this.tweens.add({
      targets: title,
      alpha: { from: 0.8, to: 1 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 230, 'Master your recipes before your next shift', {
      fontSize: '14px',
      fontFamily: 'monospace',
      fill: '#CCCCCC'
    }).setOrigin(0.5);

    // Buttons
    this._makeMenuButton(320, 'PRACTICE', 0x4CAF50, function() {
      GAME_STATE.mode = 'practice';
      this.scene.start('CategorySelect');
    }.bind(this));

    this._makeMenuButton(380, 'START SHIFT', 0xFF9800, function() {
      GAME_STATE.mode = 'shift';
      this.scene.start('CategorySelect');
    }.bind(this));

    this._makeMenuButton(440, 'RECIPE BOOK', 0x8D6E63, function() {
      this.scene.start('Study');
    }.bind(this));

    // High score
    var progress = loadProgress();
    if (progress.totalShifts > 0) {
      this.add.text(GAME_WIDTH / 2, 520, 'Best Score: ' + progress.highScore + ' | Shifts: ' + progress.totalShifts, {
        fontSize: '12px',
        fontFamily: 'monospace',
        fill: '#999999'
      }).setOrigin(0.5);
    }

    // Init audio on first interaction
    this.input.once('pointerdown', function() {
      SFX.init();
    });
  }

  _makeMenuButton(y, label, color, callback) {
    var bg = this.add.rectangle(GAME_WIDTH / 2, y, 220, 40, color, 1).setInteractive({ useHandCursor: true });
    bg.setStrokeStyle(2, 0x000000);
    var txt = this.add.text(GAME_WIDTH / 2, y, label, {
      fontSize: '18px',
      fontFamily: 'monospace',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    bg.on('pointerover', function() {
      bg.setScale(1.05);
      txt.setScale(1.05);
    });
    bg.on('pointerout', function() {
      bg.setScale(1);
      txt.setScale(1);
    });
    bg.on('pointerdown', function() {
      SFX.scoop();
      callback();
    });
  }
}
