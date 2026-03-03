const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = `file://${path.resolve(__dirname, '../index.html')}`;

test.describe('Game Boot', () => {
  test('loads without JS errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(FILE_URL);
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });

  test('canvas element exists', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2000);
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('Phaser game initializes with correct dimensions', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2000);
    const dims = await page.evaluate(() => ({
      width: game.config.width,
      height: game.config.height,
      pixelArt: game.config.pixelArt
    }));
    expect(dims.width).toBe(960);
    expect(dims.height).toBe(640);
    expect(dims.pixelArt).toBe(true);
  });

  test('all scenes are registered', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2000);
    const sceneKeys = await page.evaluate(() => {
      return game.scene.scenes.map(s => s.sys.settings.key);
    });
    expect(sceneKeys).toContain('Boot');
    expect(sceneKeys).toContain('Menu');
    expect(sceneKeys).toContain('CategorySelect');
    expect(sceneKeys).toContain('Counter');
    expect(sceneKeys).toContain('Results');
    expect(sceneKeys).toContain('ShiftEnd');
    expect(sceneKeys).toContain('Study');
  });

  test('starts on Menu scene after boot', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2000);
    const activeScene = await page.evaluate(() => {
      var active = game.scene.scenes.filter(s => s.sys.isActive());
      return active.map(s => s.sys.settings.key);
    });
    expect(activeScene).toContain('Menu');
  });
});

test.describe('Game State', () => {
  test('GAME_STATE initializes with correct defaults', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2000);
    const state = await page.evaluate(() => ({
      mode: GAME_STATE.mode,
      score: GAME_STATE.score,
      combo: GAME_STATE.combo,
      timer: GAME_STATE.timer
    }));
    expect(state.mode).toBeNull();
    expect(state.score).toBe(0);
    expect(state.combo).toBe(1);
    expect(state.timer).toBe(0);
  });

  test('RECIPES data is loaded with all categories', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2000);
    const categories = await page.evaluate(() => Object.keys(RECIPES));
    expect(categories).toContain('greens');
    expect(categories).toContain('plant');
    expect(categories).toContain('whirld');
  });

  test('each category has smoothies', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2000);
    const counts = await page.evaluate(() => ({
      greens: RECIPES.greens.smoothies.length,
      plant: RECIPES.plant.smoothies.length,
      whirld: RECIPES.whirld.smoothies.length
    }));
    expect(counts.greens).toBe(5);
    expect(counts.plant).toBe(9);
    expect(counts.whirld).toBe(10);
  });
});

test.describe('Grading Function', () => {
  test('gradeRecipe returns perfect for correct ingredients', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2000);
    const result = await page.evaluate(() => {
      var recipe = RECIPES.greens.smoothies[0]; // Acai Super-Antioxidant
      var player = recipe.ingredients.map(ing => ({ name: ing.name, amount: ing.s }));
      return gradeRecipe(player, recipe, 's');
    });
    expect(result.isPerfect).toBe(true);
    expect(result.wrong.length).toBe(0);
    expect(result.missing.length).toBe(0);
    expect(result.extra.length).toBe(0);
  });

  test('gradeRecipe detects wrong amounts', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2000);
    const result = await page.evaluate(() => {
      var recipe = RECIPES.greens.smoothies[0];
      var player = recipe.ingredients.map(ing => ({ name: ing.name, amount: ing.s + 1 }));
      return gradeRecipe(player, recipe, 's');
    });
    expect(result.isPerfect).toBe(false);
    expect(result.wrong.length).toBeGreaterThan(0);
  });

  test('gradeRecipe detects missing ingredients', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2000);
    const result = await page.evaluate(() => {
      var recipe = RECIPES.greens.smoothies[0];
      var player = [{ name: recipe.ingredients[0].name, amount: recipe.ingredients[0].s }];
      return gradeRecipe(player, recipe, 's');
    });
    expect(result.isPerfect).toBe(false);
    expect(result.missing.length).toBeGreaterThan(0);
  });

  test('gradeRecipe detects extra ingredients', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2000);
    const result = await page.evaluate(() => {
      var recipe = RECIPES.greens.smoothies[0];
      var player = recipe.ingredients.map(ing => ({ name: ing.name, amount: ing.s }));
      player.push({ name: 'Fake Ingredient', amount: 3 });
      return gradeRecipe(player, recipe, 's');
    });
    expect(result.isPerfect).toBe(false);
    expect(result.extra.length).toBe(1);
  });
});

test.describe('localStorage Persistence', () => {
  test('saves and loads progress', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2000);

    const result = await page.evaluate(() => {
      var progress = { scores: { 'greens-easy': { score: 200, stars: 2 } }, totalShifts: 1, highScore: 200 };
      saveProgress(progress);
      var loaded = loadProgress();
      return loaded;
    });

    expect(result.totalShifts).toBe(1);
    expect(result.highScore).toBe(200);
    expect(result.scores['greens-easy'].score).toBe(200);
  });

  test('handles corrupted localStorage gracefully', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(FILE_URL);
    await page.evaluate(() => {
      localStorage.setItem('jamba-trainer-progress', 'not valid json!!!');
    });

    await page.goto(FILE_URL);
    await page.waitForTimeout(2000);

    const result = await page.evaluate(() => loadProgress());
    expect(result.scores).toEqual({});
    expect(result.totalShifts).toBe(0);
    expect(errors).toEqual([]);
  });
});

test.describe('Sprite Factory', () => {
  test('all textures are generated at boot', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2000);
    const textures = await page.evaluate(() => {
      var tm = game.textures;
      return {
        woodTile: tm.exists('wood-tile'),
        blenderCup: tm.exists('blender-cup'),
        customer: tm.exists('customer'),
        particle: tm.exists('particle'),
        ticketBg: tm.exists('ticket-bg'),
        tileJuices: tm.exists('tile-juices'),
        tileIqf: tm.exists('tile-iqf'),
        btnBlend: tm.exists('btn-blend'),
        speechBubble: tm.exists('speech-bubble')
      };
    });
    expect(textures.woodTile).toBe(true);
    expect(textures.blenderCup).toBe(true);
    expect(textures.customer).toBe(true);
    expect(textures.particle).toBe(true);
    expect(textures.ticketBg).toBe(true);
    expect(textures.tileJuices).toBe(true);
    expect(textures.tileIqf).toBe(true);
    expect(textures.btnBlend).toBe(true);
    expect(textures.speechBubble).toBe(true);
  });
});
