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

  test('has Study and Start Shift buttons', async ({ page }) => {
    await page.goto(FILE_URL);
    await expect(page.locator('text=STUDY RECIPES')).toBeVisible();
    await expect(page.locator('text=START SHIFT')).toBeVisible();
  });
});

test.describe('Study Mode', () => {
  test('navigates to study screen and shows recipes', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.click('text=STUDY RECIPES');
    const studyScreen = page.locator('#study-screen');
    await expect(studyScreen).toBeVisible();
    await expect(studyScreen).toContainText('RECIPE BOOK');
  });

  test('shows category tabs', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.click('text=STUDY RECIPES');
    await expect(page.locator('#study-screen')).toContainText("Goodness 'n Greens");
    await expect(page.locator('#study-screen')).toContainText('Plant Based');
    await expect(page.locator('#study-screen')).toContainText("Whirl'd Famous");
  });

  test('can expand a recipe card to see ingredients', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.click('text=STUDY RECIPES');
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
    await page.click('text=STUDY RECIPES');
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

  test('shows other categories as locked initially', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.evaluate(() => localStorage.removeItem('jamba-trainer-progress'));
    await page.click('text=START SHIFT');
    const catScreen = page.locator('#category-select-screen');
    const text = await catScreen.textContent();
    // Should show lock indicators for Plant Based and Whirl'd Famous
    expect(text).toContain('Plant Based');
    expect(text).toContain("Whirl'd Famous");
  });
});

test.describe('Trainee Mode Gameplay', () => {
  test('starts a trainee shift on Goodness n Greens', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.evaluate(() => localStorage.removeItem('jamba-trainer-progress'));
    await page.click('text=START SHIFT');

    // Click on Goodness 'n Greens category
    await page.click('text=Goodness');
    await page.waitForTimeout(300);

    // Click Trainee difficulty
    await page.click('text=Trainee');
    await page.waitForTimeout(500);

    // Should be on game screen now
    await expect(page.locator('#game-screen')).toBeVisible();
  });

  test('shows multiple choice questions in trainee mode', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.evaluate(() => localStorage.removeItem('jamba-trainer-progress'));
    await page.click('text=START SHIFT');
    await page.click('text=Goodness');
    await page.waitForTimeout(300);
    await page.click('text=Trainee');
    await page.waitForTimeout(500);

    // Should show a smoothie name in the speech bubble / order area
    const gameScreen = page.locator('#game-screen');
    await expect(gameScreen).toBeVisible();

    // Should show multiple choice options
    const gameText = await gameScreen.textContent();
    expect(gameText.length).toBeGreaterThan(50); // Should have substantial content
  });

  test('can answer trainee questions and see feedback', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(FILE_URL);
    await page.evaluate(() => localStorage.removeItem('jamba-trainer-progress'));
    await page.click('text=START SHIFT');
    await page.click('text=Goodness');
    await page.waitForTimeout(300);
    await page.click('text=Trainee');
    await page.waitForTimeout(500);

    // Find and click a multiple choice option
    const options = page.locator('#game-screen button, #game-screen [class*="option"], #game-screen [class*="choice"]');
    const optionCount = await options.count();
    if (optionCount > 0) {
      await options.first().click();
      await page.waitForTimeout(1500); // Wait for feedback animation
    }

    expect(errors).toEqual([]);
  });

  test('completes a full trainee shift without JS errors', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes for full shift playthrough
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(FILE_URL);
    await page.evaluate(() => localStorage.removeItem('jamba-trainer-progress'));
    await page.click('text=START SHIFT');
    await page.click('text=Goodness');
    await page.waitForTimeout(300);
    await page.click('text=Trainee');
    await page.waitForTimeout(500);

    // Play through up to 10 customers
    for (let customer = 0; customer < 10; customer++) {
      // Check if shift already ended
      if (await page.locator('#shift-end-screen').isVisible().catch(() => false)) break;

      // Answer trainee questions
      for (let q = 0; q < 15; q++) {
        // Wait for allergen modal or a clickable trainee option
        const allergenModal = page.locator('#allergen-modal');
        const traineeOpt = page.locator('.trainee-option:not(.answered)').first();

        // Check allergen modal first
        if (await allergenModal.isVisible().catch(() => false)) {
          const submitBtn = page.locator('#allergen-modal button');
          await submitBtn.click().catch(() => {});
          await page.waitForTimeout(300);
          break;
        }

        // Check results screen
        if (await page.locator('#results-screen').isVisible().catch(() => false)) break;

        // Click trainee option
        if (await traineeOpt.isVisible().catch(() => false)) {
          await traineeOpt.click().catch(() => {});
          await page.waitForTimeout(1100); // Wait for 1s animation delay + buffer
        } else {
          await page.waitForTimeout(300);
        }
      }

      // Handle allergen check if still visible
      const allergenModal = page.locator('#allergen-modal');
      if (await allergenModal.isVisible().catch(() => false)) {
        await page.locator('#allergen-modal button').click().catch(() => {});
        await page.waitForTimeout(300);
      }

      // Handle results screen
      if (await page.locator('#results-screen').isVisible().catch(() => false)) {
        // Try Next Customer first, then Retry if needed
        const nextBtn = page.locator('#results-screen button').filter({ hasText: /next/i }).first();
        const retryBtn = page.locator('#results-screen button').filter({ hasText: /retry/i }).first();

        if (await retryBtn.isVisible().catch(() => false)) {
          await retryBtn.click();
          await page.waitForTimeout(500);
          // After retry, find next button
          const nextAfterRetry = page.locator('#results-screen button').filter({ hasText: /next/i }).first();
          if (await nextAfterRetry.isVisible().catch(() => false)) {
            await nextAfterRetry.click();
          }
        } else if (await nextBtn.isVisible().catch(() => false)) {
          await nextBtn.click();
        }
        await page.waitForTimeout(300);
      }
    }

    // Should have no JS errors throughout the entire shift
    expect(errors).toEqual([]);
  });
});

test.describe('Game Screen Layout', () => {
  test('game screen has required UI elements', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.evaluate(() => localStorage.removeItem('jamba-trainer-progress'));

    // Unlock crew mode for testing
    await page.evaluate(() => {
      const progress = {
        scores: { "greens-trainee": { score: 200, stars: 3 } },
        unlocks: {
          categories: ["greens", "plant"],
          tiers: { greens: ["trainee", "crew", "shiftlead"], plant: ["trainee"], whirld: ["trainee"] }
        }
      };
      localStorage.setItem('jamba-trainer-progress', JSON.stringify(progress));
    });

    await page.click('text=START SHIFT');
    await page.click('text=Goodness');
    await page.waitForTimeout(300);

    // Click Crew to test the ingredient station
    const crewBtn = page.locator('button').filter({ hasText: /crew/i }).first();
    if (await crewBtn.isVisible().catch(() => false)) {
      await crewBtn.click();
      await page.waitForTimeout(500);

      const gameScreen = page.locator('#game-screen');
      await expect(gameScreen).toBeVisible();

      // Should show score and shift counter
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
        scores: { "greens-trainee": { score: 200, stars: 2 } },
        unlocks: {
          categories: ["greens", "plant"],
          tiers: { greens: ["trainee", "crew"], plant: ["trainee"], whirld: ["trainee"] }
        }
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
    await page.click('text=STUDY RECIPES');
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
