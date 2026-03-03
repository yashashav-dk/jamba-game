const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = `file://${path.resolve(__dirname, '../index.html')}`;
const SS_DIR = '/tmp/jamba-screenshots';

function gc(box, gx, gy) {
  // Convert game coordinates (960x640) to page coordinates
  var scaleX = box.width / 960;
  var scaleY = box.height / 640;
  return { x: box.x + gx * scaleX, y: box.y + gy * scaleY };
}

test.beforeAll(async () => {
  const fs = require('fs');
  if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });
});

test.describe('Visual Validation', () => {
  test('01 - Menu screen', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${SS_DIR}/01-menu.png` });
  });

  test('02 - Category Select (Practice)', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2500);
    var canvas = await page.locator('canvas');
    var box = await canvas.boundingBox();
    var pt = gc(box, 480, 320); // PRACTICE button
    await page.mouse.click(pt.x, pt.y);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SS_DIR}/02-category-select-practice.png` });
  });

  test('03 - Counter (Practice) fresh', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2500);
    var canvas = await page.locator('canvas');
    var box = await canvas.boundingBox();
    // Click PRACTICE
    await page.mouse.click(gc(box, 480, 320).x, gc(box, 480, 320).y);
    await page.waitForTimeout(500);
    // Click first category
    await page.mouse.click(gc(box, 160, 200).x, gc(box, 160, 200).y);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS_DIR}/03-counter-fresh.png` });
  });

  test('04 - Counter after scooping ingredients', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2500);
    var canvas = await page.locator('canvas');
    var box = await canvas.boundingBox();
    // Practice -> Goodness
    await page.mouse.click(gc(box, 480, 320).x, gc(box, 480, 320).y);
    await page.waitForTimeout(500);
    await page.mouse.click(gc(box, 160, 200).x, gc(box, 160, 200).y);
    await page.waitForTimeout(2000);

    // Scoop some ingredients via evaluate for reliability
    await page.evaluate(() => {
      var recipe = GAME_STATE.currentRecipe;
      var sz = GAME_STATE.size;
      recipe.ingredients.forEach(function(ing) {
        var existing = GAME_STATE.blenderContents.find(b => b.name === ing.name);
        if (existing) { existing.amount += ing[sz]; }
        else { GAME_STATE.blenderContents.push({ name: ing.name, amount: ing[sz] }); }
      });
    });

    // Need to update blender display - get the active counter scene
    await page.evaluate(() => {
      var counterScene = game.scene.getScene('Counter');
      if (counterScene && counterScene._updateBlender) {
        counterScene._updateBlender();
      }
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SS_DIR}/04-counter-scooped.png` });

    // Log blender state
    var state = await page.evaluate(() => JSON.stringify(GAME_STATE.blenderContents, null, 2));
    console.log('Blender contents:', state);
  });

  test('05 - Results screen (Practice)', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2500);
    var canvas = await page.locator('canvas');
    var box = await canvas.boundingBox();
    await page.mouse.click(gc(box, 480, 320).x, gc(box, 480, 320).y);
    await page.waitForTimeout(500);
    await page.mouse.click(gc(box, 160, 200).x, gc(box, 160, 200).y);
    await page.waitForTimeout(2000);

    // Add perfect ingredients and blend
    await page.evaluate(() => {
      var recipe = GAME_STATE.currentRecipe;
      var sz = GAME_STATE.size;
      GAME_STATE.blenderContents = [];
      recipe.ingredients.forEach(function(ing) {
        GAME_STATE.blenderContents.push({ name: ing.name, amount: ing[sz] });
      });
    });

    // Click BLEND (blenderX+10=820, y=310)
    await page.mouse.click(gc(box, 846, 324).x, gc(box, 846, 324).y);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SS_DIR}/05-results-practice.png` });
  });

  test('06 - Category Select (Shift) with difficulty', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2500);
    var canvas = await page.locator('canvas');
    var box = await canvas.boundingBox();
    // START SHIFT at y=380
    await page.mouse.click(gc(box, 480, 380).x, gc(box, 480, 380).y);
    await page.waitForTimeout(1000);
    // Click a category
    await page.mouse.click(gc(box, 160, 200).x, gc(box, 160, 200).y);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SS_DIR}/06-difficulty-picker.png` });
  });

  test('07 - Counter (Timed Shift) with timer and score', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2500);
    var canvas = await page.locator('canvas');
    var box = await canvas.boundingBox();
    // START SHIFT
    await page.mouse.click(gc(box, 480, 380).x, gc(box, 480, 380).y);
    await page.waitForTimeout(500);
    // Category
    await page.mouse.click(gc(box, 160, 200).x, gc(box, 160, 200).y);
    await page.waitForTimeout(500);
    // Easy (x=240, y=490)
    await page.mouse.click(gc(box, 240, 490).x, gc(box, 240, 490).y);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS_DIR}/07-counter-timed.png` });
  });

  test('08 - Recipe Book / Study', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2500);
    var canvas = await page.locator('canvas');
    var box = await canvas.boundingBox();
    // RECIPE BOOK at y=440
    await page.mouse.click(gc(box, 480, 440).x, gc(box, 480, 440).y);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SS_DIR}/08-recipe-book.png` });
  });

  test('09 - Allergen check overlay', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2500);
    var canvas = await page.locator('canvas');
    var box = await canvas.boundingBox();
    // START SHIFT -> Category -> Easy
    await page.mouse.click(gc(box, 480, 380).x, gc(box, 480, 380).y);
    await page.waitForTimeout(500);
    await page.mouse.click(gc(box, 160, 200).x, gc(box, 160, 200).y);
    await page.waitForTimeout(500);
    await page.mouse.click(gc(box, 240, 490).x, gc(box, 240, 490).y);
    await page.waitForTimeout(2000);

    // Add ingredients and blend
    await page.evaluate(() => {
      var recipe = GAME_STATE.currentRecipe;
      var sz = GAME_STATE.size;
      GAME_STATE.blenderContents = [];
      recipe.ingredients.forEach(function(ing) {
        GAME_STATE.blenderContents.push({ name: ing.name, amount: ing[sz] });
      });
    });

    await page.mouse.click(gc(box, 846, 324).x, gc(box, 846, 324).y);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${SS_DIR}/09-allergen-check.png` });
  });

  test('10 - Shift end screen', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForTimeout(2500);

    // Set up a completed shift via evaluate
    await page.evaluate(() => {
      GAME_STATE.mode = 'shift';
      GAME_STATE.category = 'greens';
      GAME_STATE.difficulty = 'easy';
      GAME_STATE.score = 350;
      GAME_STATE.overtimePenalty = 0;
      GAME_STATE.combo = 2;
      GAME_STATE.shiftOrders = [];
      GAME_STATE.shiftResults = [];
      var sm = RECIPES.greens.smoothies;
      for (var i = 0; i < 10; i++) {
        GAME_STATE.shiftOrders.push({ recipe: sm[i % sm.length], size: ['s','m','l'][i%3] });
        GAME_STATE.shiftResults.push({
          recipe: sm[i % sm.length].name,
          size: ['s','m','l'][i%3],
          score: i < 7 ? 45 : -10,
          isPerfect: i < 7,
          hadErrors: i >= 7
        });
      }
      game.scene.start('ShiftEnd');
    });

    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${SS_DIR}/10-shift-end.png` });
  });
});
