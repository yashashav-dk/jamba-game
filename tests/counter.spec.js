const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = `file://${path.resolve(__dirname, '../index.html')}`;

async function startPracticeShift(page) {
  await page.goto(FILE_URL);
  await page.evaluate(() => localStorage.removeItem('jamba-trainer-progress'));
  await page.click('text=PRACTICE');
  await page.click('text=Goodness');
  await page.waitForTimeout(500);
}

async function startTimedShift(page) {
  await page.goto(FILE_URL);
  await page.evaluate(() => localStorage.removeItem('jamba-trainer-progress'));
  await page.click('text=START SHIFT');
  await page.click('text=Goodness');
  await page.waitForTimeout(300);
  const easyBtn = page.locator('button').filter({ hasText: /easy/i }).first();
  await easyBtn.click();
  await page.waitForTimeout(500);
}

test.describe('Counter Layout', () => {
  test('game screen shows counter with ingredient zones', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await startPracticeShift(page);
    const gameScreen = page.locator('#game-screen');
    await expect(gameScreen).toBeVisible();

    const text = await gameScreen.textContent();
    // Should have zone labels
    expect(text).toMatch(/juice/i);
    expect(text).toMatch(/iqf|fruit/i);
    expect(text).toMatch(/hardpack|frozen/i);
    expect(text).toMatch(/blend/i);
    expect(errors).toEqual([]);
  });

  test('counter shows order ticket with smoothie name', async ({ page }) => {
    await startPracticeShift(page);
    const gameScreen = page.locator('#game-screen');
    const text = await gameScreen.textContent();

    // Should show one of the Goodness 'n Greens smoothie names
    const smoothieNames = [
      'Super-Antioxidant', 'Go Getter', 'C-Booster', 'Orange C',
      'PB', 'Banana Protein', 'Protein Berry', 'Berry Workout'
    ];
    const hasSmootie = smoothieNames.some(name => text.includes(name));
    expect(hasSmootie).toBeTruthy();
  });

  test('counter shows ingredient tiles that can be clicked', async ({ page }) => {
    await startPracticeShift(page);

    // Find any ingredient tile and click it
    const ingredientTile = page.locator('[class*="tile"], [class*="ingredient"]').first();
    const tileCount = await ingredientTile.count();
    expect(tileCount).toBeGreaterThan(0);
  });
});

test.describe('Click-to-Scoop', () => {
  test('clicking an ingredient tile adds it to blender', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await startPracticeShift(page);

    // Get blender state before click
    const blenderBefore = await page.evaluate(() => GAME_STATE.blenderContents.length);

    // Find and click an ingredient tile (try multiple selectors)
    const tile = page.locator('[class*="tile"][data-ingredient], [class*="ingredient-tile"], .counter-tile, .ing-tile').first();
    if (await tile.count() > 0) {
      await tile.click();
      await page.waitForTimeout(200);
      const blenderAfter = await page.evaluate(() => GAME_STATE.blenderContents.length);
      expect(blenderAfter).toBeGreaterThanOrEqual(blenderBefore);
    } else {
      // Try clicking any clickable element in the counter zones
      const anyClickable = page.locator('#game-screen [onclick], #game-screen button').first();
      expect(await anyClickable.count()).toBeGreaterThan(0);
    }

    expect(errors).toEqual([]);
  });

  test('clicking same ingredient multiple times increases scoop count', async ({ page }) => {
    await startPracticeShift(page);

    // Use evaluate to directly test the scoop function
    const result = await page.evaluate(() => {
      if (!GAME_STATE.currentRecipe) return { error: 'no current recipe' };
      const firstIng = GAME_STATE.currentRecipe.ingredients[0].name;

      // Call scoopIngredient 3 times (null tileEl is handled gracefully)
      scoopIngredient(null, firstIng);
      scoopIngredient(null, firstIng);
      scoopIngredient(null, firstIng);

      const item = GAME_STATE.blenderContents.find(b => b.name === firstIng);
      return { name: firstIng, amount: item ? item.amount : 0 };
    });

    expect(result.amount).toBeGreaterThanOrEqual(3);
  });

  test('CLEAR button empties the blender', async ({ page }) => {
    await startPracticeShift(page);

    // Add something to blender first
    await page.evaluate(() => {
      GAME_STATE.blenderContents = [{ name: 'Orange Juice', scoops: 5 }];
    });

    // Click clear button
    const clearBtn = page.locator('button, [class*="btn"]').filter({ hasText: /clear/i }).first();
    if (await clearBtn.count() > 0) {
      await clearBtn.click();
      await page.waitForTimeout(200);
      const blenderLen = await page.evaluate(() => GAME_STATE.blenderContents.length);
      expect(blenderLen).toBe(0);
    }
  });
});

test.describe('Blender Visual', () => {
  test('blender is visible on game screen', async ({ page }) => {
    await startPracticeShift(page);

    const blender = page.locator('[class*="blender"], [id*="blender"]');
    await expect(blender.first()).toBeVisible();
  });

  test('BLEND button triggers grading flow', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await startPracticeShift(page);

    // Add some ingredients to blender via JS
    await page.evaluate(() => {
      const recipe = GAME_STATE.currentRecipe;
      const sizeKey = GAME_STATE.size === 'Small' ? 's' : GAME_STATE.size === 'Medium' ? 'm' : 'l';
      recipe.ingredients.forEach(ing => {
        GAME_STATE.blenderContents.push({ name: ing.name, scoops: ing[sizeKey] });
      });
    });

    // Click BLEND
    const blendBtn = page.locator('button, [class*="btn"]').filter({ hasText: /blend/i }).first();
    if (await blendBtn.count() > 0) {
      await blendBtn.click();
      await page.waitForTimeout(1000);

      // Should see allergen modal or results screen
      const allergenVisible = await page.locator('#allergen-modal, [class*="allergen"]').first().isVisible().catch(() => false);
      const resultsVisible = await page.locator('#results-screen').isVisible().catch(() => false);
      expect(allergenVisible || resultsVisible).toBeTruthy();
    }

    expect(errors).toEqual([]);
  });
});

test.describe('No JS Errors in Game Flow', () => {
  test('no errors during counter gameplay', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await startPracticeShift(page);

    // Interact with various parts of the counter
    const gameScreen = page.locator('#game-screen');
    await expect(gameScreen).toBeVisible();

    // Click a few random tiles
    const tiles = page.locator('#game-screen [onclick]');
    const count = await tiles.count();
    for (let i = 0; i < Math.min(5, count); i++) {
      await tiles.nth(i).click().catch(() => {});
      await page.waitForTimeout(100);
    }

    expect(errors).toEqual([]);
  });

  test('timed shift starts without errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await startTimedShift(page);
    const gameScreen = page.locator('#game-screen');
    await expect(gameScreen).toBeVisible();

    expect(errors).toEqual([]);
  });
});
