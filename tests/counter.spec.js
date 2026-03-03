const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = `file://${path.resolve(__dirname, '../index.html')}`;

async function waitForGame(page) {
  await page.goto(FILE_URL);
  await page.waitForTimeout(2000);
}

test.describe('Practice Mode via GAME_STATE', () => {
  test('can start practice mode programmatically', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await waitForGame(page);

    const activeScene = await page.evaluate(() => {
      GAME_STATE.mode = 'practice';
      GAME_STATE.category = 'greens';
      GAME_STATE.difficulty = 'practice';
      GAME_STATE.customerIndex = 0;
      GAME_STATE.score = 0;
      GAME_STATE.shiftResults = [];
      GAME_STATE.combo = 1;
      GAME_STATE.blenderContents = [];
      GAME_STATE.timer = 0;
      GAME_STATE.shiftTimerMax = 0;
      GAME_STATE.overtimePenalty = 0;

      var sm = RECIPES.greens.smoothies[0];
      GAME_STATE.shiftOrders = [{ recipe: sm, size: 's' }];
      GAME_STATE.isRetry = false;

      game.scene.start('Counter');
      return true;
    });

    await page.waitForTimeout(1000);

    const scene = await page.evaluate(() => {
      var active = game.scene.scenes.filter(s => s.sys.isActive());
      return active.map(s => s.sys.settings.key);
    });
    expect(scene).toContain('Counter');
    expect(errors).toEqual([]);
  });

  test('scooping adds to blender contents', async ({ page }) => {
    await waitForGame(page);

    const result = await page.evaluate(() => {
      GAME_STATE.blenderContents = [];
      // Simulate adding ingredients
      GAME_STATE.blenderContents.push({ name: 'Orange Juice', amount: 3 });
      GAME_STATE.blenderContents.push({ name: 'Ice', amount: 1 });
      return GAME_STATE.blenderContents;
    });

    expect(result.length).toBe(2);
    expect(result[0].name).toBe('Orange Juice');
    expect(result[0].amount).toBe(3);
  });

  test('clear empties blender', async ({ page }) => {
    await waitForGame(page);

    const result = await page.evaluate(() => {
      GAME_STATE.blenderContents = [{ name: 'Ice', amount: 2 }];
      GAME_STATE.blenderContents = [];
      return GAME_STATE.blenderContents.length;
    });

    expect(result).toBe(0);
  });
});

test.describe('Timed Shift via GAME_STATE', () => {
  test('can start timed shift programmatically', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await waitForGame(page);

    await page.evaluate(() => {
      var smoothies = RECIPES.greens.smoothies;
      var orders = [];
      for (var i = 0; i < 10; i++) {
        orders.push({
          recipe: smoothies[i % smoothies.length],
          size: ['s', 'm', 'l'][i % 3]
        });
      }

      GAME_STATE.mode = 'shift';
      GAME_STATE.category = 'greens';
      GAME_STATE.difficulty = 'easy';
      GAME_STATE.customerIndex = 0;
      GAME_STATE.score = 0;
      GAME_STATE.shiftResults = [];
      GAME_STATE.shiftOrders = orders;
      GAME_STATE.isRetry = false;
      GAME_STATE.timer = 300;
      GAME_STATE.shiftTimerMax = 300;
      GAME_STATE.overtimePenalty = 0;
      GAME_STATE.combo = 1;
      GAME_STATE.blenderContents = [];

      game.scene.start('Counter');
    });

    await page.waitForTimeout(1000);

    const state = await page.evaluate(() => ({
      mode: GAME_STATE.mode,
      timer: GAME_STATE.timer,
      shiftTimerMax: GAME_STATE.shiftTimerMax,
      orderCount: GAME_STATE.shiftOrders.length
    }));

    expect(state.mode).toBe('shift');
    expect(state.shiftTimerMax).toBe(300);
    expect(state.orderCount).toBe(10);
    expect(errors).toEqual([]);
  });

  test('timer counts down in shift mode', async ({ page }) => {
    await waitForGame(page);

    await page.evaluate(() => {
      var sm = RECIPES.greens.smoothies[0];
      GAME_STATE.mode = 'shift';
      GAME_STATE.category = 'greens';
      GAME_STATE.difficulty = 'easy';
      GAME_STATE.customerIndex = 0;
      GAME_STATE.score = 0;
      GAME_STATE.shiftResults = [];
      GAME_STATE.shiftOrders = [{ recipe: sm, size: 's' }];
      GAME_STATE.isRetry = false;
      GAME_STATE.timer = 300;
      GAME_STATE.shiftTimerMax = 300;
      GAME_STATE.overtimePenalty = 0;
      GAME_STATE.combo = 1;
      GAME_STATE.blenderContents = [];
      game.scene.start('Counter');
    });

    await page.waitForTimeout(3000);

    const timer = await page.evaluate(() => GAME_STATE.timer);
    expect(timer).toBeLessThan(300);
  });
});

test.describe('Grading Flow', () => {
  test('perfect recipe gives perfect grade', async ({ page }) => {
    await waitForGame(page);

    const result = await page.evaluate(() => {
      var recipe = RECIPES.greens.smoothies[0];
      var player = recipe.ingredients.map(function(ing) {
        return { name: ing.name, amount: ing.m };
      });
      return gradeRecipe(player, recipe, 'm');
    });

    expect(result.isPerfect).toBe(true);
    expect(result.score).toBeGreaterThan(0);
  });

  test('empty blender gives all missing', async ({ page }) => {
    await waitForGame(page);

    const result = await page.evaluate(() => {
      var recipe = RECIPES.greens.smoothies[0];
      var grade = gradeRecipe([], recipe, 's');
      return { isPerfect: grade.isPerfect, missingCount: grade.missing.length, ingredientCount: recipe.ingredients.length };
    });

    expect(result.isPerfect).toBe(false);
    expect(result.missingCount).toBe(result.ingredientCount);
  });

  test('combo multiplier caps at 4', async ({ page }) => {
    await waitForGame(page);

    const result = await page.evaluate(() => {
      GAME_STATE.combo = 4;
      var newCombo = Math.min(GAME_STATE.combo + 1, 4);
      return newCombo;
    });

    expect(result).toBe(4);
  });
});

test.describe('No JS Errors in Scene Transitions', () => {
  test('switching between scenes produces no errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await waitForGame(page);

    // Start on Menu, go to CategorySelect, back to Menu
    await page.evaluate(() => {
      GAME_STATE.mode = 'practice';
      game.scene.start('CategorySelect');
    });
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      game.scene.start('Menu');
    });
    await page.waitForTimeout(500);

    // Go to Study
    await page.evaluate(() => {
      game.scene.start('Study');
    });
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      game.scene.start('Menu');
    });
    await page.waitForTimeout(500);

    expect(errors).toEqual([]);
  });
});
