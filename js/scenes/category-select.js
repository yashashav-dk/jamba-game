class CategorySelectScene extends Phaser.Scene {
  constructor() { super('CategorySelect'); }

  create() {
    // Background
    for (var x = 0; x < GAME_WIDTH; x += 16) {
      for (var y = 0; y < GAME_HEIGHT; y += 16) {
        this.add.image(x, y, 'wood-tile').setOrigin(0);
      }
    }
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.4);

    // Header
    var headerText = GAME_STATE.mode === 'practice' ? 'CHOOSE A MENU TO PRACTICE' : 'CHOOSE YOUR STATION';
    this.add.text(GAME_WIDTH / 2, 40, headerText, {
      fontSize: '24px', fontFamily: 'monospace', fill: '#FFD23F', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    // Category cards
    var icons = { greens: '🥬', plant: '🌱', whirld: '🌎' };
    var colors = { greens: 0x4CAF50, plant: 0x66BB6A, whirld: 0xFF9800 };
    var self = this;

    CATEGORIES.forEach(function(cat, i) {
      var x = 160 + i * 240;
      var y = 200;

      var card = self.add.rectangle(x, y, 180, 200, colors[cat.id], 1).setInteractive({ useHandCursor: true });
      card.setStrokeStyle(3, 0x000000);

      self.add.text(x, y - 60, icons[cat.id] || '', { fontSize: '40px' }).setOrigin(0.5);
      self.add.text(x, y, cat.name, {
        fontSize: '14px', fontFamily: 'monospace', fill: '#FFF', stroke: '#000', strokeThickness: 2,
        align: 'center', wordWrap: { width: 150 }
      }).setOrigin(0.5);

      var count = RECIPES[cat.id].smoothies.length;
      self.add.text(x, y + 40, count + ' recipes', {
        fontSize: '11px', fontFamily: 'monospace', fill: '#DDD'
      }).setOrigin(0.5);

      // Best score
      var progress = loadProgress();
      var bestScore = 0;
      DIFFICULTIES.forEach(function(d) {
        var key = cat.id + '-' + d.id;
        if (progress.scores[key] && progress.scores[key].score > bestScore) {
          bestScore = progress.scores[key].score;
        }
      });
      if (bestScore > 0) {
        self.add.text(x, y + 60, 'Best: ' + bestScore, {
          fontSize: '10px', fontFamily: 'monospace', fill: '#FFD23F'
        }).setOrigin(0.5);
      }

      card.on('pointerover', function() { card.setScale(1.05); });
      card.on('pointerout', function() { card.setScale(1); });
      card.on('pointerdown', function() {
        SFX.scoop();
        GAME_STATE.category = cat.id;
        if (GAME_STATE.mode === 'practice') {
          self._startPractice(cat.id);
        } else {
          self._showDifficulty(cat.id);
        }
      });
    });

    // Difficulty section (hidden initially)
    this.diffGroup = this.add.group();

    // Back button
    this.add.text(40, 590, '← BACK', {
      fontSize: '14px', fontFamily: 'monospace', fill: '#FFF', stroke: '#000', strokeThickness: 2
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true }).on('pointerdown', function() {
      self.scene.start('Menu');
    });
  }

  _showDifficulty(catId) {
    this.diffGroup.clear(true, true);
    var self = this;

    this.add.text(GAME_WIDTH / 2, 420, 'SELECT DIFFICULTY', {
      fontSize: '16px', fontFamily: 'monospace', fill: '#FFF', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5);

    var diffColors = { easy: 0x4CAF50, medium: 0xFF9800, hard: 0xF44336 };

    DIFFICULTIES.forEach(function(diff, i) {
      var x = 240 + i * 200;
      var y = 490;
      var btn = self.add.rectangle(x, y, 160, 50, diffColors[diff.id], 1).setInteractive({ useHandCursor: true });
      btn.setStrokeStyle(2, 0x000000);
      self.diffGroup.add(btn);

      var mins = Math.floor(diff.timer / 60);
      var txt = self.add.text(x, y, diff.name + '\n' + mins + ' min', {
        fontSize: '14px', fontFamily: 'monospace', fill: '#FFF', stroke: '#000', strokeThickness: 2, align: 'center'
      }).setOrigin(0.5);
      self.diffGroup.add(txt);

      btn.on('pointerover', function() { btn.setScale(1.05); });
      btn.on('pointerout', function() { btn.setScale(1); });
      btn.on('pointerdown', function() {
        SFX.scoop();
        self._startShift(catId, diff.id);
      });
    });
  }

  _startPractice(catId) {
    var smoothies = RECIPES[catId].smoothies;
    var sm = smoothies[Math.floor(Math.random() * smoothies.length)];
    var sz = SIZES[Math.floor(Math.random() * 3)];

    GAME_STATE.category = catId;
    GAME_STATE.difficulty = 'practice';
    GAME_STATE.customerIndex = 0;
    GAME_STATE.score = 0;
    GAME_STATE.shiftResults = [];
    GAME_STATE.shiftOrders = [{ recipe: sm, size: sz }];
    GAME_STATE.isRetry = false;
    GAME_STATE.timer = 0;
    GAME_STATE.shiftTimerMax = 0;
    GAME_STATE.overtimePenalty = 0;
    GAME_STATE.combo = 1;
    GAME_STATE.blenderContents = [];

    this.scene.start('Counter');
  }

  _startShift(catId, diffId) {
    var smoothies = RECIPES[catId].smoothies;
    var orders = [];
    for (var i = 0; i < 10; i++) {
      orders.push({
        recipe: smoothies[Math.floor(Math.random() * smoothies.length)],
        size: SIZES[Math.floor(Math.random() * 3)]
      });
    }

    var diff = DIFFICULTIES.find(function(d) { return d.id === diffId; });
    GAME_STATE.category = catId;
    GAME_STATE.difficulty = diffId;
    GAME_STATE.customerIndex = 0;
    GAME_STATE.score = 0;
    GAME_STATE.shiftResults = [];
    GAME_STATE.shiftOrders = orders;
    GAME_STATE.isRetry = false;
    GAME_STATE.timer = diff.timer;
    GAME_STATE.shiftTimerMax = diff.timer;
    GAME_STATE.overtimePenalty = 0;
    GAME_STATE.combo = 1;
    GAME_STATE.blenderContents = [];

    this.scene.start('Counter');
  }
}
