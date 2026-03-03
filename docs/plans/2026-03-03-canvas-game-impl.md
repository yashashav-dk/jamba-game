# Jamba Canvas Game Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:executing-plans to implement this plan task-by-task.

**Goal:** Convert the DOM-based Jamba Shift Trainer into a full 2D pixel art canvas game using Phaser 3, with animated customers, synthesized sound effects, combo system, and particle effects.

**Architecture:** Phaser 3 loaded via CDN. Multi-file JS modules loaded with `<script>` tags (no bundler). BootScene generates all pixel art sprites programmatically into Phaser's texture manager. Six gameplay scenes handle the full flow. Web Audio API generates all sound effects.

**Tech Stack:** Phaser 3 (CDN), vanilla JS, Web Audio API, HTML5 Canvas, GitHub Pages

---

### Task 0: Project Scaffolding

**Files:**
- Create: `index.html` (replace existing)
- Create: `js/recipes.js`
- Create: `js/config.js`

**Step 1: Create index.html with Phaser bootstrap**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jamba Shift Trainer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #1a1a2e; display: flex; justify-content: center; align-items: center; min-height: 100vh; overflow: hidden; }
    #game-container { width: 100%; max-width: 960px; }
  </style>
</head>
<body>
  <div id="game-container"></div>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
  <script src="js/config.js"></script>
  <script src="js/recipes.js"></script>
  <script src="js/sprite-factory.js"></script>
  <script src="js/sfx.js"></script>
  <script src="js/scenes/boot.js"></script>
  <script src="js/scenes/menu.js"></script>
  <script src="js/scenes/category-select.js"></script>
  <script src="js/scenes/counter.js"></script>
  <script src="js/scenes/results.js"></script>
  <script src="js/scenes/shift-end.js"></script>
  <script src="js/scenes/study.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

**Step 2: Create js/config.js with game constants**

```javascript
// Game constants
const GAME_WIDTH = 960;
const GAME_HEIGHT = 640;

const DIFFICULTIES = [
  { id: 'easy', name: 'Easy', timer: 300 },
  { id: 'medium', name: 'Medium', timer: 240 },
  { id: 'hard', name: 'Hard', timer: 180 }
];

const SIZES = ['s', 'm', 'l'];
const SIZE_LABELS = { s: 'Small', m: 'Medium', l: 'Large' };

const CATEGORIES = [
  { id: 'greens', name: "Goodness 'n Greens" },
  { id: 'plant', name: 'Plant Based' },
  { id: 'whirld', name: "Whirl'd Famous" }
];

// Counter zone layout
const COUNTER_ZONES = {
  juices: ["Orange Juice", "Pineapple Juice", "Passion-Mango Juice Blend", "Lemonade", "Peach Juice", "Peach Juice Blend", "Apple-Strawberry Juice Blend", "Mixed Berry Juice Blend", "Pomegranate Juice Blend"],
  pb: ["Peanut Butter"],
  dairy: ["2% Milk", "Soymilk", "Oatmilk", "Almondmilk", "Vanilla Coconutmilk", "Greek Yogurt"],
  iqf: ["IQF Strawberries", "IQF Blueberries", "IQF Mango", "IQF Peaches", "IQF Bananas", "IQF Kale", "IQF Pineapple"],
  hardpacks: ["Raspberry Hardpack", "Orange Hardpack", "Lime Hardpack", "Pineapple Hardpack", "Frozen Yogurt"],
  powders: ["Protein - Choice", "Moo'd Powder", "Matcha Base", "Tropical Greens", "Daily Vitamin & Zinc", "Blue Spirulina", "Ginger Puree", "Acai Concentrate", "Honey Drizzle", "Agave Drizzle"],
  ice: ["Ice"]
};

// Color scheme for zones
const ZONE_COLORS = {
  juices: { bg: 0xFFA94D, text: 0x000000 },
  pb: { bg: 0x8B6914, text: 0xFFFFFF },
  dairy: { bg: 0xE8D5B7, text: 0x000000 },
  iqf: { bg: 0xFF9AAB, text: 0x000000 },
  hardpacks: { bg: 0xC8A2D4, text: 0x000000 },
  powders: { bg: 0x98D8AA, text: 0x000000 },
  ice: { bg: 0xB3E5FC, text: 0x000000 }
};

// Ingredient abbreviations for tile labels
const INGREDIENT_ABBREV = {
  "Orange Juice": "OJ",
  "Pineapple Juice": "Pine",
  "Passion-Mango Juice Blend": "PM",
  "Lemonade": "Lem",
  "Peach Juice": "Peach",
  "Peach Juice Blend": "PJB",
  "Apple-Strawberry Juice Blend": "ASB",
  "Mixed Berry Juice Blend": "MxBy",
  "Pomegranate Juice Blend": "Pom",
  "Peanut Butter": "PB",
  "2% Milk": "2%",
  "Soymilk": "Soy",
  "Oatmilk": "Oat",
  "Almondmilk": "Alm",
  "Vanilla Coconutmilk": "VCo",
  "Greek Yogurt": "GkYg",
  "IQF Strawberries": "Strw",
  "IQF Blueberries": "Blue",
  "IQF Mango": "Mang",
  "IQF Peaches": "Pch",
  "IQF Bananas": "Bana",
  "IQF Kale": "Kale",
  "IQF Pineapple": "Pine",
  "Raspberry Hardpack": "Rasp",
  "Orange Hardpack": "OrgH",
  "Lime Hardpack": "Lime",
  "Pineapple Hardpack": "PinH",
  "Frozen Yogurt": "FrYg",
  "Protein - Choice": "Prot",
  "Moo'd Powder": "Mood",
  "Matcha Base": "Mtch",
  "Tropical Greens": "TrGn",
  "Daily Vitamin & Zinc": "VitZ",
  "Blue Spirulina": "Spir",
  "Ginger Puree": "Gngr",
  "Acai Concentrate": "Acai",
  "Honey Drizzle": "Hny",
  "Agave Drizzle": "Agav",
  "Ice": "Ice"
};

// Game state (shared across scenes)
const GAME_STATE = {
  mode: null,           // 'practice' or 'shift'
  category: null,
  difficulty: null,
  size: null,
  customerIndex: 0,
  score: 0,
  timer: 0,
  shiftTimerMax: 0,
  overtimePenalty: 0,
  blenderContents: [],
  shiftResults: [],
  currentRecipe: null,
  shiftOrders: [],
  isRetry: false,
  combo: 1,
  allergenScore: 0
};

// Progress persistence
function loadProgress() {
  try {
    var saved = localStorage.getItem('jamba-trainer-progress');
    if (saved) {
      var parsed = JSON.parse(saved);
      if (!parsed || !parsed.scores) return defaultProgress();
      if (typeof parsed.totalShifts !== 'number') parsed.totalShifts = 0;
      if (typeof parsed.highScore !== 'number') parsed.highScore = 0;
      return parsed;
    }
  } catch (e) {}
  return defaultProgress();
}

function defaultProgress() {
  return { scores: {}, totalShifts: 0, highScore: 0 };
}

function saveProgress(progress) {
  localStorage.setItem('jamba-trainer-progress', JSON.stringify(progress));
}

// Grading function
function gradeRecipe(playerIngredients, recipe, sizeKey) {
  var correct = [], wrong = [], missing = [], extra = [];
  var score = 0;
  var recipeMap = {};
  recipe.ingredients.forEach(function(ing) { recipeMap[ing.name] = ing[sizeKey]; });
  var playerMap = {};
  playerIngredients.forEach(function(p) { playerMap[p.name] = p.amount; });

  Object.keys(recipeMap).forEach(function(name) {
    var expected = recipeMap[name];
    if (playerMap[name] !== undefined) {
      if (String(playerMap[name]) === String(expected)) {
        correct.push({ name: name, expected: expected, got: playerMap[name] });
        score += 10;
      } else {
        wrong.push({ name: name, expected: expected, got: playerMap[name] });
        score -= 5;
      }
    } else {
      missing.push({ name: name, expected: expected });
      score -= 5;
    }
  });

  Object.keys(playerMap).forEach(function(name) {
    if (recipeMap[name] === undefined) {
      extra.push({ name: name, got: playerMap[name] });
      score -= 5;
    }
  });

  var isPerfect = wrong.length === 0 && missing.length === 0 && extra.length === 0 && correct.length > 0;
  if (isPerfect) score += 25;
  return { correct: correct, wrong: wrong, missing: missing, extra: extra, score: score, isPerfect: isPerfect };
}
```

**Step 3: Create js/recipes.js**

Extract the full RECIPES object from the existing `index.html` (lines 1106-1397). Copy it verbatim into `js/recipes.js` as:

```javascript
const RECIPES = {
  "greens": { ... },
  "plant": { ... },
  "whirld": { ... }
};
```

This is a direct copy of the existing recipe data.

**Step 4: Create js/main.js as Phaser game launcher**

```javascript
const gameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  pixelArt: true,
  backgroundColor: '#2d1b0e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, MenuScene, CategorySelectScene, CounterScene, ResultsScene, ShiftEndScene, StudyScene]
};

const game = new Phaser.Game(gameConfig);
```

**Step 5: Create stub scenes so the game boots without errors**

Create each scene file with a minimal stub:

`js/scenes/boot.js`:
```javascript
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() { this.scene.start('Menu'); }
}
```

`js/scenes/menu.js`:
```javascript
class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'JAMBA SHIFT TRAINER', { fontSize: '32px', fill: '#FFD23F' }).setOrigin(0.5);
  }
}
```

Create similar stubs for `category-select.js`, `counter.js`, `results.js`, `shift-end.js`, `study.js` — each just shows the scene name as text.

Also create empty stubs:
- `js/sprite-factory.js`: `const SpriteFactory = {};`
- `js/sfx.js`: `const SFX = {};`

**Step 6: Test**

Open `index.html` in browser. Should see "JAMBA SHIFT TRAINER" text on a dark brown background. No console errors.

Run: `npx playwright test` — existing tests will fail (expected, the old DOM game is replaced). We'll write new tests later.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Phaser 3 canvas game with stub scenes"
```

---

### Task 1: Sprite Factory — Pixel Art Generator

**Files:**
- Create: `js/sprite-factory.js`

**What this does:** Generates all pixel art textures programmatically at boot time using Phaser's Graphics object, then stores them as textures that can be used as sprites throughout the game.

**Step 1: Implement SpriteFactory**

```javascript
const SpriteFactory = {
  generate(scene) {
    this.makeIngredientTiles(scene);
    this.makeBlender(scene);
    this.makeButtons(scene);
    this.makeCustomer(scene);
    this.makeCounterBg(scene);
    this.makeTicket(scene);
    this.makeTimerBar(scene);
    this.makeParticles(scene);
  },

  // Helper: draw a rounded rect
  roundRect(graphics, x, y, w, h, r, color) {
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(x, y, w, h, r);
  },

  makeIngredientTiles(scene) {
    // Generate one tile texture per zone type
    var zones = ['juices', 'pb', 'dairy', 'iqf', 'hardpacks', 'powders', 'ice'];
    zones.forEach(function(zone) {
      var color = ZONE_COLORS[zone].bg;
      var g = scene.make.graphics({ add: false });
      // Tile: 56x40 rounded rect with 2px dark border
      g.fillStyle(0x000000, 1);
      g.fillRoundedRect(0, 0, 56, 40, 4);
      g.fillStyle(color, 1);
      g.fillRoundedRect(2, 2, 52, 36, 3);
      // Add small highlight at top
      g.fillStyle(0xFFFFFF, 0.3);
      g.fillRect(4, 4, 48, 6);
      g.generateTexture('tile-' + zone, 56, 40);
      g.destroy();

      // Hover/pressed state
      var gh = scene.make.graphics({ add: false });
      gh.fillStyle(0xFFFFFF, 1);
      gh.fillRoundedRect(0, 0, 56, 40, 4);
      gh.fillStyle(color, 1);
      gh.fillRoundedRect(1, 1, 54, 38, 3);
      gh.fillStyle(0xFFFFFF, 0.5);
      gh.fillRect(4, 4, 48, 8);
      gh.generateTexture('tile-' + zone + '-hover', 56, 40);
      gh.destroy();
    });
  },

  makeBlender(scene) {
    // Blender cup: 80x120 tall container
    var g = scene.make.graphics({ add: false });
    // Cup body (light gray)
    g.fillStyle(0xDDDDDD, 1);
    g.fillRoundedRect(0, 20, 80, 100, 6);
    // Cup rim (darker)
    g.fillStyle(0xAAAAAA, 1);
    g.fillRoundedRect(0, 15, 80, 12, 4);
    // Lid
    g.fillStyle(0x888888, 1);
    g.fillRoundedRect(10, 0, 60, 18, 4);
    g.generateTexture('blender-cup', 80, 120);
    g.destroy();

    // Blender liquid fill (solid color, will be tinted at runtime)
    var gl = scene.make.graphics({ add: false });
    gl.fillStyle(0xFFFFFF, 1);
    gl.fillRoundedRect(4, 0, 72, 90, 4);
    gl.generateTexture('blender-fill', 80, 90);
    gl.destroy();
  },

  makeButtons(scene) {
    // BLEND button (green)
    this._makeButton(scene, 'btn-blend', 0x4CAF50, 'BLEND');
    // CLEAR button (red)
    this._makeButton(scene, 'btn-clear', 0xF44336, 'CLEAR');
    // UNDO button (gray)
    this._makeButton(scene, 'btn-undo', 0x757575, 'UNDO');
  },

  _makeButton(scene, key, color, label) {
    var g = scene.make.graphics({ add: false });
    g.fillStyle(0x000000, 1);
    g.fillRoundedRect(0, 0, 72, 28, 4);
    g.fillStyle(color, 1);
    g.fillRoundedRect(1, 1, 70, 26, 3);
    g.fillStyle(0xFFFFFF, 0.2);
    g.fillRect(3, 3, 66, 8);
    g.generateTexture(key, 72, 28);
    g.destroy();
  },

  makeCustomer(scene) {
    // Simple pixel character: 48x64
    var g = scene.make.graphics({ add: false });
    // Body (shirt)
    g.fillStyle(0x4A90D9, 1);
    g.fillRect(12, 24, 24, 24);
    // Head
    g.fillStyle(0xFFCC99, 1);
    g.fillCircle(24, 16, 12);
    // Jamba visor (green)
    g.fillStyle(0x4CAF50, 1);
    g.fillRect(12, 8, 24, 6);
    // Arms
    g.fillStyle(0x4A90D9, 1);
    g.fillRect(6, 28, 8, 16);
    g.fillRect(34, 28, 8, 16);
    // Legs
    g.fillStyle(0x333333, 1);
    g.fillRect(14, 48, 8, 16);
    g.fillRect(26, 48, 8, 16);
    g.generateTexture('customer', 48, 64);
    g.destroy();

    // Happy customer (with smile line)
    var gh = scene.make.graphics({ add: false });
    gh.fillStyle(0x4A90D9, 1);
    gh.fillRect(12, 24, 24, 24);
    gh.fillStyle(0xFFCC99, 1);
    gh.fillCircle(24, 16, 12);
    gh.fillStyle(0x4CAF50, 1);
    gh.fillRect(12, 8, 24, 6);
    gh.fillStyle(0x333333, 1);
    gh.fillCircle(19, 14, 2); // left eye
    gh.fillCircle(29, 14, 2); // right eye
    // Smile arc
    gh.lineStyle(2, 0x333333, 1);
    gh.beginPath();
    gh.arc(24, 18, 6, 0.2, Math.PI - 0.2, false);
    gh.strokePath();
    gh.fillStyle(0x4A90D9, 1);
    gh.fillRect(6, 28, 8, 16);
    gh.fillRect(34, 28, 8, 16);
    gh.fillStyle(0x333333, 1);
    gh.fillRect(14, 48, 8, 16);
    gh.fillRect(26, 48, 8, 16);
    gh.generateTexture('customer-happy', 48, 64);
    gh.destroy();

    // Sad customer
    var gs = scene.make.graphics({ add: false });
    gs.fillStyle(0x4A90D9, 1);
    gs.fillRect(12, 24, 24, 24);
    gs.fillStyle(0xFFCC99, 1);
    gs.fillCircle(24, 16, 12);
    gs.fillStyle(0x4CAF50, 1);
    gs.fillRect(12, 8, 24, 6);
    gs.fillStyle(0x333333, 1);
    gs.fillCircle(19, 14, 2);
    gs.fillCircle(29, 14, 2);
    // Frown
    gs.lineStyle(2, 0x333333, 1);
    gs.beginPath();
    gs.arc(24, 24, 5, Math.PI + 0.3, -0.3, false);
    gs.strokePath();
    gs.fillStyle(0x4A90D9, 1);
    gs.fillRect(6, 28, 8, 16);
    gs.fillRect(34, 28, 8, 16);
    gs.fillStyle(0x333333, 1);
    gs.fillRect(14, 48, 8, 16);
    gs.fillRect(26, 48, 8, 16);
    gs.generateTexture('customer-sad', 48, 64);
    gs.destroy();
  },

  makeCounterBg(scene) {
    // Wood grain tile 16x16
    var g = scene.make.graphics({ add: false });
    g.fillStyle(0x5D4037, 1);
    g.fillRect(0, 0, 16, 16);
    g.fillStyle(0x4E342E, 0.3);
    g.fillRect(0, 3, 16, 1);
    g.fillRect(0, 7, 16, 1);
    g.fillRect(0, 12, 16, 1);
    g.generateTexture('wood-tile', 16, 16);
    g.destroy();

    // Shelf (metal gray bar)
    var gs = scene.make.graphics({ add: false });
    gs.fillStyle(0x9E9E9E, 1);
    gs.fillRect(0, 0, 400, 8);
    gs.fillStyle(0xBDBDBD, 1);
    gs.fillRect(0, 0, 400, 3);
    gs.generateTexture('shelf', 400, 8);
    gs.destroy();

    // Zone label background
    var gl = scene.make.graphics({ add: false });
    gl.fillStyle(0x000000, 0.4);
    gl.fillRoundedRect(0, 0, 100, 18, 3);
    gl.generateTexture('zone-label-bg', 100, 18);
    gl.destroy();
  },

  makeTicket(scene) {
    var g = scene.make.graphics({ add: false });
    g.fillStyle(0xFFFDE7, 1);
    g.fillRoundedRect(0, 0, 160, 80, 4);
    g.lineStyle(1, 0xCCCCCC, 1);
    g.strokeRoundedRect(0, 0, 160, 80, 4);
    // Dashed line
    for (var i = 4; i < 156; i += 8) {
      g.fillStyle(0xBBBBBB, 1);
      g.fillRect(i, 24, 4, 1);
    }
    g.generateTexture('ticket-bg', 160, 80);
    g.destroy();
  },

  makeTimerBar(scene) {
    // Timer background
    var g = scene.make.graphics({ add: false });
    g.fillStyle(0x333333, 1);
    g.fillRoundedRect(0, 0, 300, 12, 3);
    g.generateTexture('timer-bg', 300, 12);
    g.destroy();

    // Timer fill (white, will be tinted)
    var gf = scene.make.graphics({ add: false });
    gf.fillStyle(0xFFFFFF, 1);
    gf.fillRoundedRect(0, 0, 296, 8, 2);
    gf.generateTexture('timer-fill', 296, 8);
    gf.destroy();
  },

  makeParticles(scene) {
    // Small circle for particles
    var g = scene.make.graphics({ add: false });
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('particle', 8, 8);
    g.destroy();

    // Star particle
    var gs = scene.make.graphics({ add: false });
    gs.fillStyle(0xFFD23F, 1);
    // Simple 5-point star approximation
    gs.fillTriangle(8, 0, 10, 6, 16, 6);
    gs.fillTriangle(8, 0, 6, 6, 0, 6);
    gs.fillTriangle(2, 14, 8, 10, 14, 14);
    gs.fillRect(4, 6, 8, 4);
    gs.generateTexture('star-particle', 16, 16);
    gs.destroy();

    // Heart particle
    var gh = scene.make.graphics({ add: false });
    gh.fillStyle(0xFF4081, 1);
    gh.fillCircle(5, 4, 4);
    gh.fillCircle(11, 4, 4);
    gh.fillTriangle(1, 6, 15, 6, 8, 14);
    gh.generateTexture('heart-particle', 16, 16);
    gh.destroy();

    // Speech bubble
    var gb = scene.make.graphics({ add: false });
    gb.fillStyle(0xFFFFFF, 1);
    gb.fillRoundedRect(0, 0, 200, 60, 8);
    // Tail
    gb.fillTriangle(30, 58, 50, 58, 40, 72);
    gb.generateTexture('speech-bubble', 200, 72);
    gb.destroy();
  }
};
```

**Step 2: Update BootScene to call sprite factory**

```javascript
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    SpriteFactory.generate(this);
    this.scene.start('Menu');
  }
}
```

**Step 3: Test**

Open in browser. Should boot without errors and show Menu text. Check browser console — no texture errors.

**Step 4: Commit**

```bash
git add js/sprite-factory.js js/scenes/boot.js
git commit -m "feat: add sprite factory with programmatic pixel art generation"
```

---

### Task 2: Sound Effect Synthesizer

**Files:**
- Create: `js/sfx.js`

**Step 1: Implement SFX module**

```javascript
const SFX = {
  ctx: null,

  init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  },

  _ensureCtx() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },

  // Short pop for scooping
  scoop() {
    this._ensureCtx();
    var ctx = this.ctx;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  },

  // Low buzz for wrong ingredient
  wrong() {
    this._ensureCtx();
    var ctx = this.ctx;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  },

  // Blender whir (white noise + filter)
  blend() {
    this._ensureCtx();
    var ctx = this.ctx;
    var bufferSize = ctx.sampleRate * 1;
    var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    var noise = ctx.createBufferSource();
    noise.buffer = buffer;
    var filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(2000, ctx.currentTime + 0.8);
    filter.Q.value = 2;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1.0);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 1.0);
  },

  // Cheerful ding for order complete
  ding() {
    this._ensureCtx();
    var ctx = this.ctx;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523, ctx.currentTime);
    osc.frequency.setValueAtTime(784, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  },

  // Perfect order fanfare (C-E-G arpeggio)
  fanfare() {
    this._ensureCtx();
    var ctx = this.ctx;
    var notes = [523, 659, 784];
    notes.forEach(function(freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
  },

  // Combo up (rising pitch)
  comboUp() {
    this._ensureCtx();
    var ctx = this.ctx;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  },

  // Timer tick
  tick() {
    this._ensureCtx();
    var ctx = this.ctx;
    var bufferSize = ctx.sampleRate * 0.02;
    var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    var src = ctx.createBufferSource();
    src.buffer = buffer;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.02);
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start(ctx.currentTime);
  }
};
```

**Step 2: Commit**

```bash
git add js/sfx.js
git commit -m "feat: add Web Audio sound effect synthesizer"
```

---

### Task 3: Menu Scene

**Files:**
- Modify: `js/scenes/menu.js`

**Step 1: Implement MenuScene with animated title and buttons**

```javascript
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
```

**Step 2: Test**

Open in browser. Should see wood background, animated title, three clickable buttons.

**Step 3: Commit**

```bash
git add js/scenes/menu.js
git commit -m "feat: implement menu scene with animated title and buttons"
```

---

### Task 4: Category Select Scene

**Files:**
- Modify: `js/scenes/category-select.js`

**Step 1: Implement CategorySelectScene**

```javascript
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
```

**Step 2: Commit**

```bash
git add js/scenes/category-select.js
git commit -m "feat: implement category select scene with difficulty picker"
```

---

### Task 5: Counter Scene — Main Gameplay

This is the biggest task. The counter scene renders the full station layout, handles click-to-scoop, blender management, customer animation, timer, and blend triggering.

**Files:**
- Modify: `js/scenes/counter.js`

**Step 1: Implement CounterScene**

The CounterScene is large. Key sections:

1. **create()** — lays out the counter zones, blender, ticket, customer, timer
2. **_layoutZone()** — positions ingredient tiles in a zone area
3. **_onScoop()** — handles ingredient click, adds to blender, shows +1 particle
4. **_updateBlender()** — refreshes blender fill and ingredient list
5. **_blend()** — triggers blend animation, then results
6. **_clear()** / **_undo()** — blender controls
7. **update()** — ticks shift timer (if in timed mode)
8. **_showCustomer()** — animates customer walk-in with speech bubble

Full implementation:

```javascript
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

    // Start shift timer if timed mode (only on first customer)
    if (GAME_STATE.shiftTimerMax > 0 && !this.timerEvent) {
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
    // Ticket positioned top-left
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
    // Shelf bar
    var shelfY = 145;
    var shelfX = 200;
    this.add.image(shelfX, shelfY, 'shelf').setOrigin(0);

    // Zone label
    this.add.text(shelfX + 200, shelfY - 10, 'Powders & Extras', {
      fontSize: '9px', fontFamily: 'monospace', fill: '#CCC'
    }).setOrigin(0.5);

    // Powder tiles
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

    // LEFT COLUMN: Juices, PB, Dairy
    var leftX = 10;

    // Juices
    this.add.text(leftX + 50, baseY - 12, 'Juices', { fontSize: '9px', fontFamily: 'monospace', fill: '#CCC' }).setOrigin(0.5);
    COUNTER_ZONES.juices.forEach(function(name, i) {
      var col = i % 2;
      var row = Math.floor(i / 2);
      self._makeTile(leftX + col * 62, baseY + row * 46, name, 'juices');
    });

    // PB
    var pbY = baseY + Math.ceil(COUNTER_ZONES.juices.length / 2) * 46 + 10;
    this.add.text(leftX + 50, pbY - 12, 'PB', { fontSize: '9px', fontFamily: 'monospace', fill: '#CCC' }).setOrigin(0.5);
    COUNTER_ZONES.pb.forEach(function(name, i) {
      self._makeTile(leftX, pbY + i * 46, name, 'pb');
    });

    // Dairy
    var dairyY = pbY + COUNTER_ZONES.pb.length * 46 + 10;
    this.add.text(leftX + 50, dairyY - 12, 'Dairy', { fontSize: '9px', fontFamily: 'monospace', fill: '#CCC' }).setOrigin(0.5);
    COUNTER_ZONES.dairy.forEach(function(name, i) {
      var col = i % 2;
      var row = Math.floor(i / 2);
      self._makeTile(leftX + col * 62, dairyY + row * 46, name, 'dairy');
    });

    // CENTER-LEFT: IQF
    var iqfX = 200;
    this.add.text(iqfX + 100, baseY - 12, 'IQF Fruits', { fontSize: '9px', fontFamily: 'monospace', fill: '#CCC' }).setOrigin(0.5);
    COUNTER_ZONES.iqf.forEach(function(name, i) {
      var col = i % 3;
      var row = Math.floor(i / 3);
      self._makeTile(iqfX + col * 62, baseY + row * 46, name, 'iqf');
    });

    // CENTER-RIGHT: Hardpacks
    var hpX = 420;
    this.add.text(hpX + 90, baseY - 12, 'Hardpacks', { fontSize: '9px', fontFamily: 'monospace', fill: '#CCC' }).setOrigin(0.5);
    COUNTER_ZONES.hardpacks.forEach(function(name, i) {
      var col = i % 3;
      var row = Math.floor(i / 3);
      self._makeTile(hpX + col * 62, baseY + row * 46, name, 'hardpacks');
    });

    // RIGHT: Ice
    var iceX = 700;
    this.add.text(iceX + 28, baseY - 12, 'Ice', { fontSize: '9px', fontFamily: 'monospace', fill: '#CCC' }).setOrigin(0.5);
    COUNTER_ZONES.ice.forEach(function(name, i) {
      self._makeTile(iceX, baseY + i * 46, name, 'ice');
    });
  }

  _makeTile(x, y, ingredientName, zoneType) {
    var tile = this.add.image(x, y, 'tile-' + zoneType).setOrigin(0).setInteractive({ useHandCursor: true });
    var abbrev = INGREDIENT_ABBREV[ingredientName] || ingredientName.substring(0, 4);
    var textColor = ZONE_COLORS[zoneType].text === 0x000000 ? '#222' : '#FFF';
    var label = this.add.text(x + 28, y + 20, abbrev, {
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
    // Blender area (far right)
    this.blenderX = 810;
    this.blenderY = 180;

    this.blenderCup = this.add.image(this.blenderX, this.blenderY, 'blender-cup').setOrigin(0);
    this.blenderFillSprite = this.add.image(this.blenderX + 4, this.blenderY + 110, 'blender-fill')
      .setOrigin(0, 1).setScale(1, 0).setTint(0xFFA94D);

    // Buttons
    var self = this;
    var btnX = this.blenderX + 10;

    this._makeBlenderButton(btnX, 310, 'btn-blend', function() { self._blend(); });
    this._makeBlenderButton(btnX, 342, 'btn-clear', function() { self._clear(); });
    this._makeBlenderButton(btnX, 374, 'btn-undo', function() { self._undo(); });

    // Ingredient list area
    this.blenderListText = this.add.text(this.blenderX, 410, '', {
      fontSize: '9px', fontFamily: 'monospace', fill: '#FFF', lineSpacing: 2
    });
  }

  _makeBlenderButton(x, y, texture, callback) {
    var btn = this.add.image(x, y, texture).setOrigin(0).setInteractive({ useHandCursor: true });
    btn.on('pointerdown', function() {
      SFX.scoop();
      callback();
    });
    btn.on('pointerover', function() { btn.setAlpha(0.8); });
    btn.on('pointerout', function() { btn.setAlpha(1); });
  }

  _updateBlender() {
    // Update fill level
    var totalScoops = 0;
    GAME_STATE.blenderContents.forEach(function(b) { totalScoops += b.amount; });
    var fillPct = Math.min(totalScoops / 20, 1); // Max 20 scoops = full
    this.blenderFillSprite.setScale(1, fillPct);

    // Update ingredient list
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

    // Shake animation
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

        // Proceed to allergen check or results
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
    // Customer walks in from right
    this.customer = this.add.image(GAME_WIDTH + 50, 500, 'customer').setOrigin(0.5, 1);
    this.tweens.add({
      targets: this.customer,
      x: 500,
      duration: 800,
      ease: 'Power2',
      onComplete: function() {
        // Idle bob
        this.tweens.add({
          targets: this.customer,
          y: { from: 500, to: 496 },
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }.bind(this)
    });

    // Speech bubble (appears after walk-in)
    this.time.delayedCall(900, function() {
      this.speechBubble = this.add.image(500, 420, 'speech-bubble').setOrigin(0.5, 1).setAlpha(0);
      this.speechText = this.add.text(500, 400, SIZE_LABELS[order.size] + '\n' + order.recipe.name, {
        fontSize: '11px', fontFamily: 'monospace', fill: '#333', align: 'center',
        wordWrap: { width: 180 }
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({ targets: [this.speechBubble, this.speechText], alpha: 1, duration: 300 });
    }.bind(this));
  }

  _showAllergenCheck() {
    // Simple overlay for allergen check
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
      // Grade allergen
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
    // Clean up timer when leaving scene
    if (this.timerEvent) {
      this.timerEvent.remove();
      this.timerEvent = null;
    }
  }
}
```

**Step 2: Test**

Open in browser. Click PRACTICE → Goodness. Should see the full counter with ingredient tiles, blender, customer walking in, speech bubble. Click tiles to scoop, see +1 particles, blender fills. BLEND triggers animation.

**Step 3: Commit**

```bash
git add js/scenes/counter.js
git commit -m "feat: implement counter scene with full gameplay mechanics"
```

---

### Task 6: Results Scene

**Files:**
- Modify: `js/scenes/results.js`

**Step 1: Implement ResultsScene**

```javascript
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
          // Combo break — screen shake
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
      // Star burst particles
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

    // Your recipe column
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
```

**Step 2: Commit**

```bash
git add js/scenes/results.js
git commit -m "feat: implement results scene with grading, combo, and particles"
```

---

### Task 7: Shift End Scene

**Files:**
- Modify: `js/scenes/shift-end.js`

**Step 1: Implement ShiftEndScene with score animation, stars, and confetti**

```javascript
class ShiftEndScene extends Phaser.Scene {
  constructor() { super('ShiftEnd'); }

  create() {
    // Stop any running timer
    var totalScore = GAME_STATE.score - (GAME_STATE.overtimePenalty || 0);
    var totalOrders = GAME_STATE.shiftOrders.length;
    var perfects = GAME_STATE.shiftResults.filter(function(r) { return r.isPerfect; }).length;

    // Calculate max possible score
    var maxScore = 0;
    GAME_STATE.shiftOrders.forEach(function(order) {
      maxScore += (order.recipe.ingredients.length * 10) + 25 + 10;
    });
    maxScore *= 4; // Max combo

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
```

**Step 2: Commit**

```bash
git add js/scenes/shift-end.js
git commit -m "feat: implement shift end scene with score animation, stars, confetti"
```

---

### Task 8: Study Scene (Recipe Book)

**Files:**
- Modify: `js/scenes/study.js`

**Step 1: Implement StudyScene**

```javascript
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

    // Scroll
    this.scrollY = 0;
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

    smoothies.forEach(function(sm, idx) {
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
```

**Step 2: Commit**

```bash
git add js/scenes/study.js
git commit -m "feat: implement recipe book study scene"
```

---

### Task 9: Integration, Timer Persistence, and Polish

**Files:**
- Modify: `js/scenes/counter.js` (timer persistence across scene switches)
- Modify: `js/main.js`

**Step 1: Fix timer persistence**

The shift timer must persist when switching between Counter → Results → Counter scenes. In `js/main.js`, use Phaser's registry to store timer state:

The timer already persists via GAME_STATE (global object). However, CounterScene's `_startShiftTimer` should only start on first customer. Add a check:

In CounterScene.create(), change the timer start to:
```javascript
if (GAME_STATE.shiftTimerMax > 0 && GAME_STATE.customerIndex === 0 && !GAME_STATE.isRetry) {
  this._startShiftTimer();
} else if (GAME_STATE.shiftTimerMax > 0) {
  // Resuming — just restart the timer event (the time value is already in GAME_STATE)
  this._startShiftTimer();
}
```

**Step 2: Test full game flow**

Open in browser. Test:
1. Practice mode: pick a category, scoop ingredients, blend, see results, try again, next smoothie, home
2. Timed shift: pick category, pick Easy, play through 10 orders, see shift end
3. Recipe book: browse categories, view recipes
4. Timer: runs across orders, shows overtime penalty
5. Combo: consecutive perfects show x2/x3/x4

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: integrate all scenes, fix timer persistence"
```

---

### Task 10: Update Tests and Deploy

**Files:**
- Modify: `tests/counter.spec.js`
- Modify: `tests/game.spec.js`

**Step 1: Update Playwright tests for canvas game**

Canvas games are harder to test with Playwright (no DOM selectors). Update tests to:
- Check the canvas element exists
- Check for JS errors during gameplay
- Use `page.evaluate()` to check GAME_STATE values
- Click at specific canvas coordinates for interactions

Replace tests with canvas-appropriate versions. Key tests:
1. Game loads without errors
2. GAME_STATE initializes correctly
3. Can navigate to Practice via clicks
4. Scoop function works (via evaluate)
5. Grade function works (via evaluate)

**Step 2: Deploy**

```bash
git add -A
git commit -m "test: update Playwright tests for canvas game"
git push
```

The game auto-deploys to GitHub Pages.
