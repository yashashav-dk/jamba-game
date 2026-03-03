class StudyScene extends Phaser.Scene {
  constructor() { super('Study'); }

  create() {
    this.currentCategory = 'greens';

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x3E2723, 1);

    this.add.text(GAME_WIDTH / 2, 30, 'RECIPE BOOK', {
      fontSize: '24px', fontFamily: 'monospace', fill: '#FFD23F', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    // Category tabs
    this.tabGroup = this.add.group();
    this.recipeGroup = this.add.group();
    this._drawTabs();
    this._drawRecipes();

    // Back button
    var self = this;
    this.add.text(40, 610, '← BACK', {
      fontSize: '14px', fontFamily: 'monospace', fill: '#FFF', stroke: '#000', strokeThickness: 2
    }).setInteractive({ useHandCursor: true }).on('pointerdown', function() {
      self.scene.start('Menu');
    });
  }

  _drawTabs() {
    this.tabGroup.clear(true, true);
    var self = this;
    var tabColors = { greens: 0x4CAF50, plant: 0x66BB6A, whirld: 0xFF9800 };
    CATEGORIES.forEach(function(cat, i) {
      var x = 160 + i * 240;
      var isActive = cat.id === self.currentCategory;
      var btn = self.add.rectangle(x, 70, 180, 30, isActive ? tabColors[cat.id] : 0x555555, 1).setInteractive({ useHandCursor: true });
      btn.setStrokeStyle(isActive ? 2 : 1, 0x000000);
      self.tabGroup.add(btn);
      var txt = self.add.text(x, 70, cat.name, {
        fontSize: '11px', fontFamily: 'monospace', fill: '#FFF'
      }).setOrigin(0.5);
      self.tabGroup.add(txt);
      btn.on('pointerdown', function() {
        self.currentCategory = cat.id;
        self._drawTabs();
        self._drawRecipes();
      });
    });
  }

  _drawRecipes() {
    this.recipeGroup.clear(true, true);
    var smoothies = RECIPES[this.currentCategory].smoothies;
    var self = this;
    var y = 110;

    smoothies.forEach(function(sm) {
      // Recipe card
      var card = self.add.rectangle(GAME_WIDTH / 2, y + 30, 700, 55, 0x4E342E, 1);
      card.setStrokeStyle(1, 0x8D6E63);
      self.recipeGroup.add(card);

      // Name
      var nameTxt = self.add.text(60, y + 15, sm.name, {
        fontSize: '13px', fontFamily: 'monospace', fill: '#FFD23F', fontStyle: 'bold'
      });
      self.recipeGroup.add(nameTxt);

      // Allergen badge
      var allergenColor = sm.allergens.indexOf('No Allergen') !== -1 ? '#4CAF50' : '#F44336';
      var badge = self.add.text(60, y + 35, sm.allergens, {
        fontSize: '9px', fontFamily: 'monospace', fill: allergenColor
      });
      self.recipeGroup.add(badge);

      // Ingredient table: S M L
      var tableX = 320;
      self.recipeGroup.add(self.add.text(tableX, y + 10, 'Ingredient', { fontSize: '8px', fontFamily: 'monospace', fill: '#999' }));
      self.recipeGroup.add(self.add.text(tableX + 130, y + 10, 'S', { fontSize: '8px', fontFamily: 'monospace', fill: '#999' }));
      self.recipeGroup.add(self.add.text(tableX + 160, y + 10, 'M', { fontSize: '8px', fontFamily: 'monospace', fill: '#999' }));
      self.recipeGroup.add(self.add.text(tableX + 190, y + 10, 'L', { fontSize: '8px', fontFamily: 'monospace', fill: '#999' }));

      sm.ingredients.forEach(function(ing, ii) {
        var iy = y + 22 + ii * 10;
        var abbr = INGREDIENT_ABBREV[ing.name] || ing.name.substring(0, 12);
        self.recipeGroup.add(self.add.text(tableX, iy, abbr, { fontSize: '8px', fontFamily: 'monospace', fill: '#CCC' }));
        self.recipeGroup.add(self.add.text(tableX + 130, iy, '' + ing.s, { fontSize: '8px', fontFamily: 'monospace', fill: '#CCC' }));
        self.recipeGroup.add(self.add.text(tableX + 160, iy, '' + ing.m, { fontSize: '8px', fontFamily: 'monospace', fill: '#CCC' }));
        self.recipeGroup.add(self.add.text(tableX + 190, iy, '' + ing.l, { fontSize: '8px', fontFamily: 'monospace', fill: '#CCC' }));
      });

      y += Math.max(60, 25 + sm.ingredients.length * 10 + 10);
    });
  }
}
