class CounterScene extends Phaser.Scene {
  constructor() { super('Counter'); }

  create() {
    this.scoopHistory = [];
    var order = GAME_STATE.shiftOrders[GAME_STATE.customerIndex];
    GAME_STATE.currentRecipe = order.recipe;
    GAME_STATE.size = order.size;
    GAME_STATE.blenderContents = [];
    this.scoopHistory = [];

    this._drawBackground();
    this._drawTopBar();
    this._drawTicket(order);
    this._drawPowdersShelf();
    this._drawCounterZones();
    this._drawBlender();
    this._drawCustomer(order);

    // Start shift timer if timed mode
    if (GAME_STATE.shiftTimerMax > 0) {
      this._startShiftTimer();
    }
  }

  _drawBackground() {
    for (var x = 0; x < GAME_WIDTH; x += 16) {
      for (var y = 0; y < GAME_HEIGHT; y += 16) {
        this.add.image(x, y, 'wood-tile').setOrigin(0);
      }
    }
  }

  _drawTopBar() {
    // Dark bar at top
    this.add.rectangle(GAME_WIDTH / 2, 18, GAME_WIDTH, 36, 0x000000, 0.7);

    // Order counter
    var total = GAME_STATE.shiftOrders.length;
    var current = GAME_STATE.customerIndex + 1;
    var label = GAME_STATE.mode === 'practice' ? 'Practice' : 'Order ' + current + '/' + total;
    this.add.text(12, 18, label, {
      fontSize: '13px', fontFamily: 'monospace', fill: '#FFF'
    }).setOrigin(0, 0.5);

    // Timer (shift mode only)
    if (GAME_STATE.shiftTimerMax > 0) {
      this.timerBg = this.add.image(GAME_WIDTH / 2, 18, 'timer-bg').setOrigin(0.5);
      this.timerFill = this.add.image(GAME_WIDTH / 2 - 148, 18, 'timer-fill').setOrigin(0, 0.5);
      this.timerFill.setTint(0x4CAF50);
      this.timerText = this.add.text(GAME_WIDTH / 2 + 170, 18, '', {
        fontSize: '13px', fontFamily: 'monospace', fill: '#FFF', fontStyle: 'bold'
      }).setOrigin(0, 0.5);
      this._updateTimerDisplay();
    }

    // Score (shift mode only)
    if (GAME_STATE.mode === 'shift') {
      this.scoreText = this.add.text(GAME_WIDTH - 12, 18, 'Score: ' + GAME_STATE.score, {
        fontSize: '13px', fontFamily: 'monospace', fill: '#FFD23F'
      }).setOrigin(1, 0.5);

      // Combo display
      if (GAME_STATE.combo > 1) {
        this.comboText = this.add.text(GAME_WIDTH - 12, 45, 'x' + GAME_STATE.combo, {
          fontSize: '20px', fontFamily: 'monospace', fill: '#FF9800', stroke: '#000', strokeThickness: 3
        }).setOrigin(1, 0.5);
      }
    }
  }

  _drawTicket(order) {
    var tx = 20, ty = 50;
    this.add.image(tx, ty, 'ticket-bg').setOrigin(0).setAngle(-1.5);
    this.add.text(tx + 10, ty + 6, '#' + String(GAME_STATE.customerIndex + 1).padStart(2, '0') + ' - ' + SIZE_LABELS[order.size], {
      fontSize: '11px', fontFamily: 'monospace', fill: '#333', fontStyle: 'bold'
    });
    this.add.text(tx + 10, ty + 30, order.recipe.name, {
      fontSize: '13px', fontFamily: 'monospace', fill: '#000', fontStyle: 'bold',
      wordWrap: { width: 140 }
    });
  }

  _drawPowdersShelf() {
    var shelfY = 145;
    var shelfX = 200;
    this.add.image(shelfX, shelfY, 'shelf').setOrigin(0);

    this.add.text(shelfX + 200, shelfY - 10, 'Powders & Extras', {
      fontSize: '9px', fontFamily: 'monospace', fill: '#CCC'
    }).setOrigin(0.5);

    var self = this;
    COUNTER_ZONES.powders.forEach(function(name, i) {
      var col = i % 5;
      var row = Math.floor(i / 5);
      var x = shelfX + 10 + col * 62;
      var y = shelfY + 10 + row * 46;
      self._makeTile(x, y, name, 'powders');
    });
  }

  _drawCounterZones() {
    var self = this;
    var baseY = 245;
    var rowH = 42; // tighter spacing to prevent overflow

    // LEFT COLUMN: Juices (3 cols), PB, Dairy
    var leftX = 10;

    // Juices - 3 columns to reduce rows
    this.add.text(leftX + 85, baseY - 12, 'Juices', { fontSize: '9px', fontFamily: 'monospace', fill: '#CCC' }).setOrigin(0.5);
    COUNTER_ZONES.juices.forEach(function(name, i) {
      var col = i % 3;
      var row = Math.floor(i / 3);
      self._makeTile(leftX + col * 60, baseY + row * rowH, name, 'juices');
    });

    // PB + Dairy combined
    var pbDairyY = baseY + Math.ceil(COUNTER_ZONES.juices.length / 3) * rowH + 10;
    this.add.text(leftX + 85, pbDairyY - 12, 'PB & Dairy', { fontSize: '9px', fontFamily: 'monospace', fill: '#CCC' }).setOrigin(0.5);
    var pbDairyItems = COUNTER_ZONES.pb.concat(COUNTER_ZONES.dairy);
    pbDairyItems.forEach(function(name, i) {
      var col = i % 3;
      var row = Math.floor(i / 3);
      var zone = COUNTER_ZONES.pb.indexOf(name) !== -1 ? 'pb' : 'dairy';
      self._makeTile(leftX + col * 60, pbDairyY + row * rowH, name, zone);
    });

    // CENTER-LEFT: IQF
    var iqfX = 200;
    this.add.text(iqfX + 90, baseY - 12, 'IQF Fruits', { fontSize: '9px', fontFamily: 'monospace', fill: '#CCC' }).setOrigin(0.5);
    COUNTER_ZONES.iqf.forEach(function(name, i) {
      var col = i % 3;
      var row = Math.floor(i / 3);
      self._makeTile(iqfX + col * 62, baseY + row * rowH, name, 'iqf');
    });

    // CENTER-RIGHT: Hardpacks
    var hpX = 420;
    this.add.text(hpX + 90, baseY - 12, 'Hardpacks', { fontSize: '9px', fontFamily: 'monospace', fill: '#CCC' }).setOrigin(0.5);
    COUNTER_ZONES.hardpacks.forEach(function(name, i) {
      var col = i % 3;
      var row = Math.floor(i / 3);
      self._makeTile(hpX + col * 62, baseY + row * rowH, name, 'hardpacks');
    });

    // RIGHT: Ice
    var iceX = 700;
    this.add.text(iceX + 28, baseY - 12, 'Ice', { fontSize: '9px', fontFamily: 'monospace', fill: '#CCC' }).setOrigin(0.5);
    COUNTER_ZONES.ice.forEach(function(name, i) {
      self._makeTile(iceX, baseY + i * rowH, name, 'ice');
    });
  }

  _makeTile(x, y, ingredientName, zoneType) {
    var tile = this.add.image(x, y, 'tile-' + zoneType).setOrigin(0).setInteractive({ useHandCursor: true });
    var abbrev = INGREDIENT_ABBREV[ingredientName] || ingredientName.substring(0, 4);
    var textColor = ZONE_COLORS[zoneType].text === 0x000000 ? '#222' : '#FFF';
    this.add.text(x + 28, y + 20, abbrev, {
      fontSize: '9px', fontFamily: 'monospace', fill: textColor, fontStyle: 'bold'
    }).setOrigin(0.5);

    var self = this;
    tile.on('pointerdown', function() {
      self._onScoop(ingredientName, tile);
    });
    tile.on('pointerover', function() {
      tile.setTexture('tile-' + zoneType + '-hover');
    });
    tile.on('pointerout', function() {
      tile.setTexture('tile-' + zoneType);
    });
  }

  _onScoop(name, tileSprite) {
    SFX.scoop();

    // Flash tile
    this.tweens.add({
      targets: tileSprite,
      alpha: { from: 0.5, to: 1 },
      duration: 150
    });

    // "+1" particle
    var plusOne = this.add.text(tileSprite.x + 28, tileSprite.y, '+1', {
      fontSize: '14px', fontFamily: 'monospace', fill: '#FFD23F', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5);
    this.tweens.add({
      targets: plusOne,
      y: plusOne.y - 30,
      alpha: 0,
      duration: 500,
      onComplete: function() { plusOne.destroy(); }
    });

    // Add to blender
    var existing = GAME_STATE.blenderContents.find(function(b) { return b.name === name; });
    if (existing) {
      existing.amount++;
    } else {
      GAME_STATE.blenderContents.push({ name: name, amount: 1 });
    }
    this.scoopHistory.push(name);
    this._updateBlender();
  }

  _drawBlender() {
    this.blenderX = 810;
    this.blenderY = 180;

    this.blenderCup = this.add.image(this.blenderX, this.blenderY, 'blender-cup').setOrigin(0);
    this.blenderFillSprite = this.add.image(this.blenderX + 4, this.blenderY + 110, 'blender-fill')
      .setOrigin(0, 1).setScale(1, 0).setTint(0xFFA94D);

    var self = this;
    var btnX = this.blenderX + 10;

    this._makeBlenderButton(btnX, 310, 'btn-blend', 'BLEND', function() { self._blend(); });
    this._makeBlenderButton(btnX, 342, 'btn-clear', 'CLEAR', function() { self._clear(); });
    this._makeBlenderButton(btnX, 374, 'btn-undo', 'UNDO', function() { self._undo(); });

    // Ingredient list area
    this.blenderListText = this.add.text(this.blenderX, 410, '', {
      fontSize: '9px', fontFamily: 'monospace', fill: '#FFF', lineSpacing: 2
    });
  }

  _makeBlenderButton(x, y, texture, label, callback) {
    var btn = this.add.image(x, y, texture).setOrigin(0).setInteractive({ useHandCursor: true });
    this.add.text(x + 36, y + 14, label, {
      fontSize: '10px', fontFamily: 'monospace', fill: '#FFF', fontStyle: 'bold'
    }).setOrigin(0.5);
    btn.on('pointerdown', function() {
      SFX.scoop();
      callback();
    });
    btn.on('pointerover', function() { btn.setAlpha(0.8); });
    btn.on('pointerout', function() { btn.setAlpha(1); });
  }

  _updateBlender() {
    var totalScoops = 0;
    GAME_STATE.blenderContents.forEach(function(b) { totalScoops += b.amount; });
    var fillPct = Math.min(totalScoops / 20, 1);
    this.blenderFillSprite.setScale(1, fillPct);

    var lines = '';
    GAME_STATE.blenderContents.forEach(function(b) {
      var abbr = INGREDIENT_ABBREV[b.name] || b.name.substring(0, 8);
      lines += abbr + ' x' + b.amount + '\n';
    });
    this.blenderListText.setText(lines);
  }

  _blend() {
    if (GAME_STATE.blenderContents.length === 0) return;

    SFX.blend();

    var self = this;
    this.tweens.add({
      targets: this.blenderCup,
      x: { from: this.blenderX - 3, to: this.blenderX + 3 },
      duration: 50,
      yoyo: true,
      repeat: 10,
      onComplete: function() {
        self.blenderCup.x = self.blenderX;
        // Particle burst from blender
        for (var i = 0; i < 15; i++) {
          var p = self.add.image(self.blenderX + 40, self.blenderY + 20, 'particle').setTint(0xFFA94D);
          self.tweens.add({
            targets: p,
            x: p.x + Phaser.Math.Between(-60, 60),
            y: p.y + Phaser.Math.Between(-40, 40),
            alpha: 0,
            scale: { from: 1, to: 0 },
            duration: 600,
            delay: i * 30,
            onComplete: function() { p.destroy(); }
          });
        }

        self.time.delayedCall(800, function() {
          if (GAME_STATE.mode === 'practice') {
            GAME_STATE.allergenScore = 0;
            self.scene.start('Results', { allergenCorrect: true });
          } else {
            self._showAllergenCheck();
          }
        });
      }
    });
  }

  _clear() {
    GAME_STATE.blenderContents = [];
    this.scoopHistory = [];
    this._updateBlender();
  }

  _undo() {
    if (this.scoopHistory.length === 0) return;
    var lastIng = this.scoopHistory.pop();
    var item = GAME_STATE.blenderContents.find(function(b) { return b.name === lastIng; });
    if (item) {
      item.amount--;
      if (item.amount <= 0) {
        GAME_STATE.blenderContents = GAME_STATE.blenderContents.filter(function(b) { return b.name !== lastIng; });
      }
    }
    this._updateBlender();
  }

  _drawCustomer(order) {
    this.customer = this.add.image(GAME_WIDTH + 50, 560, 'customer').setOrigin(0.5, 1);
    this.tweens.add({
      targets: this.customer,
      x: 500,
      duration: 800,
      ease: 'Power2',
      onComplete: function() {
        this.tweens.add({
          targets: this.customer,
          y: { from: 560, to: 556 },
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }.bind(this)
    });

    this.time.delayedCall(900, function() {
      var bubbleY = 470;
      this.speechBubble = this.add.image(500, bubbleY, 'speech-bubble').setOrigin(0.5, 1).setAlpha(0);
      // Center text in bubble body (bubble is 72px: 60px body + 12px tail triangle)
      this.speechText = this.add.text(500, bubbleY - 42, SIZE_LABELS[order.size] + '\n' + order.recipe.name, {
        fontSize: '11px', fontFamily: 'monospace', fill: '#333', align: 'center',
        wordWrap: { width: 180 }
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({ targets: [this.speechBubble, this.speechText], alpha: 1, duration: 300 });
    }.bind(this));
  }

  _showAllergenCheck() {
    var overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6).setDepth(100);
    var panel = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 320, 280, 0xFFFFFF, 1).setDepth(101);
    panel.setStrokeStyle(2, 0x333333);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 110, 'ALLERGEN CHECK', {
      fontSize: '16px', fontFamily: 'monospace', fill: '#333', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(102);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, 'What allergens does\n' + GAME_STATE.currentRecipe.name + ' have?', {
      fontSize: '12px', fontFamily: 'monospace', fill: '#555', align: 'center'
    }).setOrigin(0.5).setDepth(102);

    var allergens = ['Dairy', 'Soy', 'Nut', 'None'];
    var selected = {};
    var self = this;

    allergens.forEach(function(a, i) {
      var y = GAME_HEIGHT / 2 - 30 + i * 36;
      var box = self.add.rectangle(GAME_WIDTH / 2 - 60, y, 20, 20, 0xFFFFFF, 1).setDepth(102).setInteractive({ useHandCursor: true });
      box.setStrokeStyle(2, 0x666666);
      var checkMark = self.add.text(GAME_WIDTH / 2 - 60, y, '', { fontSize: '14px', fill: '#4CAF50' }).setOrigin(0.5).setDepth(103);
      self.add.text(GAME_WIDTH / 2 - 40, y, a, {
        fontSize: '13px', fontFamily: 'monospace', fill: '#333'
      }).setOrigin(0, 0.5).setDepth(102);

      box.on('pointerdown', function() {
        selected[a] = !selected[a];
        checkMark.setText(selected[a] ? '✓' : '');
        box.fillColor = selected[a] ? 0xC8E6C9 : 0xFFFFFF;
      });
    });

    // Submit button
    var submitBtn = self.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 115, 120, 36, 0xFF9800, 1).setDepth(102).setInteractive({ useHandCursor: true });
    submitBtn.setStrokeStyle(2, 0x000000);
    self.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 115, 'SUBMIT', {
      fontSize: '14px', fontFamily: 'monospace', fill: '#FFF', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(103);

    submitBtn.on('pointerdown', function() {
      var recipeAllergens = GAME_STATE.currentRecipe.allergens.toLowerCase();
      var playerHasDairy = !!selected['Dairy'];
      var playerHasSoy = !!selected['Soy'];
      var playerHasNut = !!selected['Nut'];
      var playerHasNone = !!selected['None'];

      var correctDairy = recipeAllergens.indexOf('dairy') !== -1;
      var correctSoy = recipeAllergens.indexOf('soy') !== -1;
      var correctNut = recipeAllergens.indexOf('nut') !== -1;
      var correctNone = recipeAllergens.indexOf('no allergen') !== -1;

      var allergenCorrect = (playerHasDairy === correctDairy) && (playerHasSoy === correctSoy) && (playerHasNut === correctNut) && (playerHasNone === correctNone);
      GAME_STATE.allergenScore = allergenCorrect ? 10 : -10;

      self.scene.start('Results', { allergenCorrect: allergenCorrect });
    });
  }

  _startShiftTimer() {
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: function() {
        GAME_STATE.timer--;
        if (GAME_STATE.timer < 0) {
          GAME_STATE.overtimePenalty = Math.abs(GAME_STATE.timer) * 5;
        }
        this._updateTimerDisplay();
        if (GAME_STATE.timer <= 30 && GAME_STATE.timer > 0) {
          SFX.tick();
        }
      },
      callbackScope: this,
      loop: true
    });
  }

  _updateTimerDisplay() {
    if (!this.timerFill) return;
    var max = GAME_STATE.shiftTimerMax;
    var current = Math.max(0, GAME_STATE.timer);
    var pct = max > 0 ? current / max : 0;
    this.timerFill.setScale(pct, 1);

    if (pct < 0.2) this.timerFill.setTint(0xF44336);
    else if (pct < 0.4) this.timerFill.setTint(0xFF9800);
    else this.timerFill.setTint(0x4CAF50);

    var displayTime = GAME_STATE.timer;
    var isOvertime = displayTime < 0;
    var absTime = Math.abs(displayTime);
    var mins = Math.floor(absTime / 60);
    var secs = absTime % 60;
    var formatted = (isOvertime ? '-' : '') + mins + ':' + String(secs).padStart(2, '0');
    if (this.timerText) {
      this.timerText.setText(formatted);
      this.timerText.setColor(isOvertime ? '#F44336' : '#FFF');
    }
  }

  shutdown() {
    if (this.timerEvent) {
      this.timerEvent.remove();
      this.timerEvent = null;
    }
  }
}
