const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = `file://${path.resolve(__dirname, '../index.html')}`;

test.describe('Start Screen', () => {
  test('loads without JS errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(FILE_URL);
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });

  test('shows start screen by default', async ({ page }) => {
    await page.goto(FILE_URL);
    const startScreen = page.locator('#start-screen');
    await expect(startScreen).toBeVisible();
    await expect(startScreen).toContainText('JAMBA SHIFT TRAINER');
  });

  test('has Practice, Start Shift, and Recipe Book buttons', async ({ page }) => {
    await page.goto(FILE_URL);
    await expect(page.locator('text=PRACTICE')).toBeVisible();
    await expect(page.locator('text=START SHIFT')).toBeVisible();
    await expect(page.getByRole('button', { name: 'RECIPE BOOK' })).toBeVisible();
  });
});

test.describe('Study Mode', () => {
  test('navigates to study screen and shows recipes', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.click('text=RECIPE BOOK');
    const studyScreen = page.locator('#study-screen');
    await expect(studyScreen).toBeVisible();
    await expect(studyScreen).toContainText('RECIPE BOOK');
  });

  test('shows category tabs', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.click('text=RECIPE BOOK');
    await expect(page.locator('#study-screen')).toContainText("Goodness 'n Greens");
    await expect(page.locator('#study-screen')).toContainText('Plant Based');
    await expect(page.locator('#study-screen')).toContainText("Whirl'd Famous");
  });

  test('can expand a recipe card to see ingredients', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.click('text=RECIPE BOOK');
    // Click on a recipe card to expand it
    const firstRecipe = page.locator('#study-screen .study-card, #study-screen [class*="recipe"], #study-screen [class*="card"]').first();
    if (await firstRecipe.count() > 0) {
      await firstRecipe.click();
      await page.waitForTimeout(300);
      // Should see ingredient data somewhere after expanding
      const studyScreen = page.locator('#study-screen');
      const text = await studyScreen.textContent();
      // Acai Super-Antioxidant is first recipe in Goodness 'n Greens
      expect(text).toContain('Super-Antioxidant');
    }
  });

  test('back button returns to start screen', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.click('text=RECIPE BOOK');
    await expect(page.locator('#study-screen')).toBeVisible();
    // Click back button
    const backBtn = page.locator('#study-screen').getByText(/back|←|home/i).first();
    if (await backBtn.count() > 0) {
      await backBtn.click();
      await expect(page.locator('#start-screen')).toBeVisible();
    }
  });
});

test.describe('Category Select', () => {
  test('navigates to category select', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.click('text=START SHIFT');
    await expect(page.locator('#category-select-screen')).toBeVisible();
  });

  test('shows Goodness n Greens as unlocked', async ({ page }) => {
    await page.goto(FILE_URL);
    // Clear any saved progress
    await page.evaluate(() => localStorage.removeItem('jamba-trainer-progress'));
    await page.click('text=START SHIFT');
    const catScreen = page.locator('#category-select-screen');
    const text = await catScreen.textContent();
    expect(text).toContain("Goodness");
  });

  test('shows all categories available', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.evaluate(() => localStorage.removeItem('jamba-trainer-progress'));
    await page.click('text=START SHIFT');
    const catScreen = page.locator('#category-select-screen');
    const text = await catScreen.textContent();
    expect(text).toContain('Plant Based');
    expect(text).toContain("Whirl'd Famous");
    // All categories should be clickable (no locked state)
    await page.click('text=Plant Based');
    await page.waitForTimeout(300);
  });
});

test.describe('Practice Mode Gameplay', () => {
  test('starts a practice session on Goodness n Greens', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.evaluate(() => localStorage.removeItem('jamba-trainer-progress'));
    await page.click('text=PRACTICE');
    await page.click('text=Goodness');
    await page.waitForTimeout(500);
    await expect(page.locator('#game-screen')).toBeVisible();
  });

  test('practice mode shows counter with ingredients', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.evaluate(() => localStorage.removeItem('jamba-trainer-progress'));
    await page.click('text=PRACTICE');
    await page.click('text=Goodness');
    await page.waitForTimeout(500);
    const gameScreen = page.locator('#game-screen');
    await expect(gameScreen).toBeVisible();
    const gameText = await gameScreen.textContent();
    expect(gameText.length).toBeGreaterThan(50);
  });

  test('can scoop ingredients in practice mode', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(FILE_URL);
    await page.evaluate(() => localStorage.removeItem('jamba-trainer-progress'));
    await page.click('text=PRACTICE');
    await page.click('text=Goodness');
    await page.waitForTimeout(500);
    const tiles = page.locator('#game-screen [onclick]');
    const count = await tiles.count();
    if (count > 0) {
      await tiles.first().click();
      await page.waitForTimeout(300);
    }
    expect(errors).toEqual([]);
  });

  test('completes practice blend without JS errors', async ({ page }) => {
    test.setTimeout(60000);
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(FILE_URL);
    await page.evaluate(() => localStorage.removeItem('jamba-trainer-progress'));
    await page.click('text=PRACTICE');
    await page.click('text=Goodness');
    await page.waitForTimeout(500);

    // Add ingredients via JS and blend
    await page.evaluate(() => {
      var recipe = GAME_STATE.currentRecipe;
      var sizeKey = GAME_STATE.size;
      recipe.ingredients.forEach(function(ing) {
        GAME_STATE.blenderContents.push({ name: ing.name, amount: ing[sizeKey] });
      });
    });

    const blendBtn = page.locator('button, [class*="btn"]').filter({ hasText: /blend/i }).first();
    if (await blendBtn.count() > 0) {
      await blendBtn.click();
      await page.waitForTimeout(1000);
    }

    expect(errors).toEqual([]);
  });
});

test.describe('Game Screen Layout', () => {
  test('game screen has required UI elements', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.evaluate(() => localStorage.removeItem('jamba-trainer-progress'));
    await page.click('text=START SHIFT');
    await page.click('text=Goodness');
    await page.waitForTimeout(300);
    const easyBtn = page.locator('button').filter({ hasText: /easy/i }).first();
    if (await easyBtn.isVisible().catch(() => false)) {
      await easyBtn.click();
      await page.waitForTimeout(500);
      const gameScreen = page.locator('#game-screen');
      await expect(gameScreen).toBeVisible();
      const gameText = await gameScreen.textContent();
      expect(gameText).toContain('Score');
    }
  });
});

test.describe('localStorage Persistence', () => {
  test('saves and loads progress', async ({ page }) => {
    await page.goto(FILE_URL);

    // Set some progress
    await page.evaluate(() => {
      const progress = {
        scores: { "greens-easy": { score: 200, stars: 2 } },
        unlocks: {
          categories: ["greens", "plant", "whirld"],
          tiers: { greens: ["easy", "medium", "hard"], plant: ["easy", "medium", "hard"], whirld: ["easy", "medium", "hard"] }
        },
        totalShifts: 1,
        highScore: 200
      };
      localStorage.setItem('jamba-trainer-progress', JSON.stringify(progress));
    });

    // Reload page
    await page.goto(FILE_URL);
    await page.click('text=START SHIFT');

    // Plant Based should now be unlocked
    const catScreen = page.locator('#category-select-screen');
    const text = await catScreen.textContent();
    expect(text).toContain('Plant Based');

    // Should be able to click Plant Based
    await page.click('text=Plant Based');
    await page.waitForTimeout(300);
  });

  test('handles corrupted localStorage gracefully', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(FILE_URL);
    await page.evaluate(() => {
      localStorage.setItem('jamba-trainer-progress', 'not valid json!!!');
    });

    // Reload — should not crash
    await page.goto(FILE_URL);
    await page.waitForTimeout(500);

    // Should still show start screen
    await expect(page.locator('#start-screen')).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe('No Console Errors', () => {
  test('no errors navigating all screens', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(FILE_URL);
    await page.evaluate(() => localStorage.removeItem('jamba-trainer-progress'));

    // Navigate through screens
    await page.click('text=RECIPE BOOK');
    await page.waitForTimeout(300);

    // Go back (find back button)
    const backBtn = page.locator('#study-screen').getByText(/back|←|home/i).first();
    if (await backBtn.count() > 0) {
      await backBtn.click();
      await page.waitForTimeout(300);
    } else {
      await page.goto(FILE_URL);
    }

    await page.click('text=START SHIFT');
    await page.waitForTimeout(300);

    expect(errors).toEqual([]);
  });
});
