# Jamba Game Revamp Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:executing-plans to implement this plan task-by-task.

**Goal:** Revamp the game into Practice Mode + Timed Shift (Easy/Medium/Hard), remove hints and ingredient lists from tickets, replace per-order timer with shift-wide timer, and unlock everything from the start.

**Architecture:** All changes in a single `index.html` file (vanilla HTML/CSS/JS). The counter layout and click-to-scoop mechanics stay unchanged. We modify the difficulty system, timer, ticket rendering, start screen, category select, and study/practice flow.

**Tech Stack:** Vanilla HTML/CSS/JS, Playwright for testing

---

### Task 1: Remove Trainee Highlights

**Files:**
- Modify: `index.html:632-641` (CSS)
- Modify: `index.html:1809-1823` (JS)

**Step 1: Remove trainee highlight CSS**

Delete the `.ing-tile.trainee-highlight` rule and `@keyframes glowPulse` at lines 632-641:

```css
/* DELETE these lines entirely */
.ing-tile.trainee-highlight {
  border: 2.5px solid #00E676;
  box-shadow: 0 0 8px rgba(0,230,118,0.5);
  animation: glowPulse 1.5s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 6px rgba(0,230,118,0.4); }
  50% { box-shadow: 0 0 14px rgba(0,230,118,0.7); }
}
```

**Step 2: Remove isTraineeHighlight function and simplify buildTile**

Replace `isTraineeHighlight` function (lines 1809-1817) and `buildTile` (lines 1819-1823):

```javascript
// DELETE the isTraineeHighlight function entirely

// Simplify buildTile — remove the highlight check on line 1821
function buildTile(name) {
  var cls = 'ing-tile ' + getTileClass(name);
  return '<div class="' + cls + '" data-ing="' + name.replace(/"/g, '&quot;') + '" onclick="scoopIngredient(this, \'' + escapeQuote(name) + '\')">' + name + '</div>';
}
```

**Step 3: Run tests**

Run: `npx playwright test tests/counter.spec.js`
Expected: The "trainee mode highlights recipe ingredients" test will FAIL (expected, we'll fix tests in Task 7). All other tests should pass.

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: remove trainee highlights from ingredient tiles"
```

---

### Task 2: Remove Ingredients from Order Ticket

**Files:**
- Modify: `index.html:1848` (isShiftLead variable)
- Modify: `index.html:1865-1874` (ticket rendering)

**Step 1: Remove the ingredient list from the ticket**

In `showCustomer()`, find the ticket rendering at lines 1865-1874. Remove the `if (!isShiftLead)` block that renders ingredients. Also remove the `isShiftLead` variable at line 1848 since it's no longer needed for this.

Replace lines 1864-1874:

```javascript
      // Order ticket
      html += '<div class="order-ticket">';
      html += '<div class="ticket-header">#' + String(index + 1).padStart(2, '0') + ' - ' + SIZE_LABELS[order.size] + '</div>';
      html += '<div style="font-weight:700;margin-bottom:4px;">' + order.recipe.name + '</div>';
      html += '</div>';
```

Also remove line 1848: `var isShiftLead = GAME_STATE.difficulty === 'shiftlead';`

**Step 2: Reduce ticket max-height since it's shorter now**

In CSS (around line 466), change `max-height: 260px` to `max-height: 80px`:

```css
.order-ticket {
  /* ... */
  max-height: 80px;
  overflow-y: auto;
}
```

**Step 3: Run tests**

Run: `npx playwright test tests/counter.spec.js`
Expected: "counter shows order ticket with smoothie name" should still PASS. Other tests pass.

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: show only smoothie name and size on order ticket"
```

---

### Task 3: Replace Difficulty Tiers and Remove Progressive Unlock

**Files:**
- Modify: `index.html:1424-1428` (DIFFICULTIES array)
- Modify: `index.html:1464-1478` (defaultProgress)
- Modify: `index.html:1570-1631` (renderCategorySelect, selectCategory)
- Modify: `index.html:2536-2562` (saveShiftProgress unlock logic)

**Step 1: Replace DIFFICULTIES array**

Replace lines 1424-1428:

```javascript
const DIFFICULTIES = [
  { id: "easy", name: "Easy", timer: 300 },
  { id: "medium", name: "Medium", timer: 240 },
  { id: "hard", name: "Hard", timer: 180 }
];
```

Note: timer is now total shift seconds (300=5min, 240=4min, 180=3min), NOT per-order.

**Step 2: Update defaultProgress — unlock everything**

Replace lines 1464-1478:

```javascript
function defaultProgress() {
  return {
    scores: {},
    unlocks: {
      categories: ["greens", "plant", "whirld"],
      tiers: {
        greens: ["easy", "medium", "hard"],
        plant: ["easy", "medium", "hard"],
        whirld: ["easy", "medium", "hard"]
      }
    },
    totalShifts: 0,
    highScore: 0
  };
}
```

**Step 3: Simplify renderCategorySelect — remove lock checks**

In `renderCategorySelect()` (around line 1570), remove the unlock check. All categories are always available:

Replace the category card rendering to remove lock logic. The `unlocked` var is always true, so remove the locked class and lock icon logic. Replace:

```javascript
var unlocked = progress.unlocks.categories.indexOf(cat.id) !== -1;
```

With:

```javascript
var unlocked = true;
```

**Step 4: Simplify selectCategory — remove lock checks on difficulties**

In `selectCategory()` (around line 1618), remove the tierUnlocks check. All difficulties always available:

Replace:

```javascript
var diffUnlocked = tierUnlocks.indexOf(diff.id) !== -1;
```

With:

```javascript
var diffUnlocked = true;
```

Update the difficulty button label to show total time instead of per-order seconds:

```javascript
if (diff.timer > 0) html += ' <small>(' + Math.floor(diff.timer / 60) + 'min)</small>';
```

**Step 5: Remove unlock logic from saveShiftProgress**

In `saveShiftProgress()` (lines 2536-2562), remove the entire unlock section (tier unlock + category unlock + unlock messages). Keep only the score saving. Replace lines 2536-2571 with:

```javascript
      // No unlock logic needed — everything is available from the start

      saveProgress(progress);

      // Update start screen
      updateStartScreenScores();
```

**Step 6: Run tests**

Run: `npx playwright test`
Expected: Some tests may fail due to changed difficulty IDs (trainee→easy, crew→medium). We'll fix in Task 7.

**Step 7: Commit**

```bash
git add index.html
git commit -m "feat: replace difficulty tiers with Easy/Medium/Hard, remove progressive unlock"
```

---

### Task 4: Replace Per-Order Timer with Shift-Wide Timer

**Files:**
- Modify: `index.html:1733-1753` (startShift)
- Modify: `index.html:1833-1916` (showCustomer)
- Modify: `index.html:2148-2182` (startTimer, updateTimerBar)
- Modify: `index.html:1431-1449` (GAME_STATE)

**Step 1: Add shift timer fields to GAME_STATE**

Add these fields to GAME_STATE (around line 1431):

```javascript
const GAME_STATE = {
  currentScreen: "start-screen",
  category: null,
  difficulty: null,
  size: null,
  customerIndex: 0,
  score: 0,
  timer: 0,
  timerInterval: null,
  shiftTimerMax: 0,
  overtimePenalty: 0,
  blenderContents: [],
  shiftResults: [],
  missedRecipes: [],
  currentRecipe: null,
  shiftOrders: [],
  traineeState: null,
  isRetry: false,
  allergenScore: 0,
  isPracticeShift: false
};
```

**Step 2: Start the shift-wide timer in startShift**

In `startShift()` (line 1733), after setting up orders and showing first customer, start the shift timer. Add after `showCustomer(0)`:

```javascript
  // Start shift-wide timer
  var diff = DIFFICULTIES.find(function(d) { return d.id === difficultyId; });
  if (diff && diff.timer > 0) {
    GAME_STATE.shiftTimerMax = diff.timer;
    GAME_STATE.timer = diff.timer;
    GAME_STATE.overtimePenalty = 0;
    startShiftTimer();
  }
```

**Step 3: Replace startTimer with startShiftTimer**

Replace the `startTimer` function (lines 2148-2169) with:

```javascript
function startShiftTimer() {
  if (GAME_STATE.timerInterval) {
    clearInterval(GAME_STATE.timerInterval);
  }

  updateShiftTimerDisplay();

  GAME_STATE.timerInterval = setInterval(function() {
    GAME_STATE.timer--;
    updateShiftTimerDisplay();

    if (GAME_STATE.timer <= 0 && GAME_STATE.overtimePenalty === 0) {
      // Timer just hit zero — switch to overtime mode
      // Don't stop the interval, keep counting for penalty
    }

    if (GAME_STATE.timer < 0) {
      GAME_STATE.overtimePenalty = Math.abs(GAME_STATE.timer) * 5;
    }
  }, 1000);
}
```

**Step 4: Replace updateTimerBar with updateShiftTimerDisplay**

Replace `updateTimerBar` (lines 2171-2182) with:

```javascript
function updateShiftTimerDisplay() {
  var bar = document.getElementById('timer-bar');
  var timeText = document.getElementById('timer-text');
  if (!bar) return;

  var max = GAME_STATE.shiftTimerMax;
  var current = Math.max(0, GAME_STATE.timer);
  var pct = max > 0 ? (current / max) * 100 : 0;

  bar.style.width = pct + '%';
  bar.className = 'timer-bar';

  if (pct < 20) {
    bar.classList.add('red');
  } else if (pct < 40) {
    bar.classList.add('yellow');
  }

  if (current <= 30 && current > 0) {
    bar.classList.add('pulsing');
  }

  // Format MM:SS
  var displayTime = GAME_STATE.timer;
  var isOvertime = displayTime < 0;
  var absTime = Math.abs(displayTime);
  var mins = Math.floor(absTime / 60);
  var secs = absTime % 60;
  var formatted = (isOvertime ? '-' : '') + mins + ':' + String(secs).padStart(2, '0');

  if (timeText) {
    timeText.textContent = formatted;
    timeText.style.color = isOvertime ? '#D32F2F' : '';
  }
}
```

**Step 5: Update showCustomer — don't restart timer per order**

In `showCustomer()` (line 1833), remove the per-order timer start. Replace lines 1834-1836 (clearing timer interval):

```javascript
// Remove these lines — don't clear shift timer between orders:
// if (GAME_STATE.timerInterval) {
//   clearInterval(GAME_STATE.timerInterval);
//   GAME_STATE.timerInterval = null;
// }
```

Also update the top bar rendering (lines 1854-1860) to always show timer in timed shifts:

```javascript
      // Top bar
      html += '<div class="counter-top-bar">';
      html += '<span>' + (GAME_STATE.isPracticeShift ? 'Practice ' : 'Order ') + (index + 1) + '/' + totalOrders + '</span>';
      var diff = DIFFICULTIES.find(function(d) { return d.id === GAME_STATE.difficulty; });
      if (diff && diff.timer > 0) {
        html += '<div class="timer-bar-container"><div class="timer-bar" id="timer-bar"></div></div>';
        html += '<span id="timer-text" style="min-width:50px;text-align:center;font-weight:700;font-family:monospace;"></span>';
      } else {
        html += '<div style="flex:1;"></div>';
      }
      html += '<span id="score-display">Score: ' + GAME_STATE.score + '</span>';
      html += '</div>';
```

Remove the per-order timer start at lines 1914-1916:

```javascript
// DELETE these lines:
// if (diff.timer > 0) {
//   startTimer(diff.timer);
// }
```

After setting `wrap.innerHTML = html;`, call `updateShiftTimerDisplay()` to sync the bar:

```javascript
      wrap.innerHTML = html;

      // Sync shift timer display to the new DOM
      if (GAME_STATE.timer !== 0) {
        updateShiftTimerDisplay();
      }
```

**Step 6: Stop shift timer in showShiftEnd**

In `showShiftEnd()` (around line 2434), add at the top:

```javascript
function showShiftEnd() {
  // Stop shift timer
  if (GAME_STATE.timerInterval) {
    clearInterval(GAME_STATE.timerInterval);
    GAME_STATE.timerInterval = null;
  }
```

**Step 7: Apply overtime penalty to final score**

In `showShiftEnd()`, after calculating `totalScore`, subtract overtime:

```javascript
  var totalScore = GAME_STATE.score;
  var overtimePenalty = GAME_STATE.overtimePenalty || 0;
  totalScore -= overtimePenalty;
```

And display it in the scorecard if there was overtime:

```javascript
  if (overtimePenalty > 0) {
    html += '<p style="color:#D32F2F;">Overtime Penalty: -' + overtimePenalty + '</p>';
  }
```

**Step 8: Run tests**

Run: `npx playwright test tests/counter.spec.js`
Expected: Tests should pass (timer changes don't break counter mechanics).

**Step 9: Commit**

```bash
git add index.html
git commit -m "feat: replace per-order timer with shift-wide countdown"
```

---

### Task 5: Add Practice Mode

**Files:**
- Modify: `index.html:1066-1075` (start screen HTML)
- Modify: `index.html:1733-1753` (add startPractice function)
- Modify: `index.html:2310-2396` (showResults — add practice flow)

**Step 1: Add PRACTICE button to start screen**

Replace the start buttons section (around line 1070):

```html
<div class="start-buttons">
  <button class="btn btn-green" onclick="showScreen('category-select-screen'); renderCategorySelect('practice');">PRACTICE</button>
  <button class="btn btn-orange" onclick="showScreen('category-select-screen'); renderCategorySelect('shift');">START SHIFT</button>
  <button class="btn" onclick="showScreen('study-screen'); renderStudyMode();" style="background:#8D6E63;color:#fff;">RECIPE BOOK</button>
</div>
```

**Step 2: Update renderCategorySelect to accept mode parameter**

Add a `selectedMode` variable and update `renderCategorySelect` to store the mode:

```javascript
var selectedMode = 'shift'; // 'practice' or 'shift'

function renderCategorySelect(mode) {
  selectedMode = mode || 'shift';
  // ... rest of rendering
  // Update header text based on mode
  var headerEl = document.querySelector('#category-select-screen h2');
  if (headerEl) headerEl.textContent = selectedMode === 'practice' ? 'CHOOSE A MENU TO PRACTICE' : 'CHOOSE YOUR STATION';
```

**Step 3: Update selectCategory — show difficulty only for shifts, start practice directly**

In `selectCategory()`, if mode is practice, skip difficulty selection and start practice immediately:

```javascript
function selectCategory(catId, unlocked) {
  selectedCategory = catId;

  document.querySelectorAll('.category-card').forEach(function(el) {
    el.classList.toggle('selected', el.dataset.cat === catId);
  });

  if (selectedMode === 'practice') {
    // Start practice immediately — no difficulty selection
    startPractice(catId);
    return;
  }

  // Show difficulty section for timed shifts
  var diffSection = document.getElementById('difficulty-section');
  diffSection.style.display = 'flex';
  // ... render difficulty buttons as before
}
```

**Step 4: Add startPractice function**

Add after `startShift`:

```javascript
function startPractice(categoryId) {
  var smoothies = RECIPES[categoryId].smoothies;
  var sm = smoothies[Math.floor(Math.random() * smoothies.length)];
  var sz = SIZES[Math.floor(Math.random() * 3)];

  GAME_STATE.category = categoryId;
  GAME_STATE.difficulty = 'practice';
  GAME_STATE.customerIndex = 0;
  GAME_STATE.score = 0;
  GAME_STATE.shiftResults = [];
  GAME_STATE.shiftOrders = [{ recipe: sm, size: sz }];
  GAME_STATE.isRetry = false;
  GAME_STATE.isPracticeShift = true;
  GAME_STATE.timer = 0;
  GAME_STATE.shiftTimerMax = 0;
  GAME_STATE.overtimePenalty = 0;

  showScreen('game-screen');
  showCustomer(0);
}
```

**Step 5: Update showResults for practice mode**

In `showResults()`, when in practice mode:
- Skip allergen check (already handled by calling `showResults(true)` directly)
- Show "Try Again" and "Next Smoothie" buttons instead of "RETRY" / "NEXT CUSTOMER"

Add at the button section of `showResults()` (around line 2390):

```javascript
      if (GAME_STATE.isPracticeShift) {
        // Practice mode buttons
        html += '<button class="btn btn-orange" onclick="practiceTryAgain()" style="margin-top:12px;">TRY AGAIN</button>';
        html += '<button class="btn btn-green" onclick="practiceNextSmoothie()" style="margin-top:8px;">NEXT SMOOTHIE</button>';
        html += '<button class="btn" onclick="showScreen(\'start-screen\');" style="margin-top:8px;background:#888;color:#fff;">HOME</button>';
      } else if (hasErrors && !isRetry) {
        html += '<button class="btn btn-orange" onclick="forceRetry()" style="margin-top:12px;">RETRY</button>';
      } else {
        var isLastCustomer = GAME_STATE.customerIndex >= totalOrders - 1;
        html += '<button class="btn btn-green" onclick="nextCustomer()" style="margin-top:12px;">' + (isLastCustomer ? 'FINISH SHIFT' : 'NEXT CUSTOMER') + '</button>';
      }
```

**Step 6: Add practice helper functions**

```javascript
function practiceTryAgain() {
  GAME_STATE.isRetry = true;
  showScreen('game-screen');
  showCustomer(0);
}

function practiceNextSmoothie() {
  var smoothies = RECIPES[GAME_STATE.category].smoothies;
  var sm = smoothies[Math.floor(Math.random() * smoothies.length)];
  var sz = SIZES[Math.floor(Math.random() * 3)];
  GAME_STATE.shiftOrders = [{ recipe: sm, size: sz }];
  GAME_STATE.customerIndex = 0;
  GAME_STATE.isRetry = false;
  GAME_STATE.blenderContents = [];
  showScreen('game-screen');
  showCustomer(0);
}
```

**Step 7: Skip allergen check in practice mode**

In the `blendRecipe()` function, when practice mode, skip allergen check and go straight to results:

Find where `showAllergenCheck()` is called and add a check:

```javascript
if (GAME_STATE.isPracticeShift) {
  GAME_STATE.allergenScore = 0;
  showResults(true);
} else {
  showAllergenCheck();
}
```

**Step 8: Update showCustomer — hide score display in practice mode**

In the top bar of showCustomer, replace the score display:

```javascript
if (!GAME_STATE.isPracticeShift) {
  html += '<span id="score-display">Score: ' + GAME_STATE.score + '</span>';
}
```

**Step 9: Run tests**

Run: `npx playwright test`

**Step 10: Commit**

```bash
git add index.html
git commit -m "feat: add practice mode with try-again and next-smoothie flow"
```

---

### Task 6: Update showResults to hide score/allergen in practice

**Files:**
- Modify: `index.html` (showResults function)

**Step 1: Conditionally hide allergen and score in practice results**

In `showResults()`, wrap the allergen result display and points display:

```javascript
if (!GAME_STATE.isPracticeShift) {
  // Allergen result
  html += '<div class="results-allergen" style="background:' + (allergenCorrect ? '#C8E6C9' : '#FFCDD2') + ';">';
  html += 'Allergen Check: ' + (allergenCorrect ? '✓ Correct (+10)' : '✗ Wrong (-10)') + '</div>';

  // Points
  if (!isRetry) {
    html += '<div class="results-score">' + (pointsEarned >= 0 ? '+' : '') + pointsEarned + ' pts</div>';
  } else {
    html += '<div style="color:#888;font-weight:600;">Retry - no points</div>';
  }
}
```

**Step 2: Commit**

```bash
git add index.html
git commit -m "feat: hide score and allergen check in practice mode results"
```

---

### Task 7: Update Playwright Tests

**Files:**
- Modify: `tests/counter.spec.js`
- Modify: `tests/game.spec.js`

**Step 1: Update test helpers to use new difficulty IDs**

In `counter.spec.js`, update `startTraineeShift` to use the practice/easy flow:

```javascript
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
```

**Step 2: Remove the trainee highlights test**

Delete the `Trainee Mode Highlights` test block since highlights no longer exist.

**Step 3: Update all tests that reference old difficulty names**

- Replace `startTraineeShift` calls with `startPracticeShift`
- Replace `startCrewShift` calls with `startTimedShift`
- Remove tests that check for ingredients on the ticket
- Update the "crew mode starts without errors" test to reference "easy" mode

**Step 4: Run all tests**

Run: `npx playwright test`
Expected: All tests PASS.

**Step 5: Commit**

```bash
git add tests/counter.spec.js tests/game.spec.js
git commit -m "test: update tests for new practice/timed-shift modes"
```

---

### Task 8: Clean Up Dead Code and Final Polish

**Files:**
- Modify: `index.html`

**Step 1: Remove the traineeState from GAME_STATE**

The `traineeState` field is no longer used. Remove it.

**Step 2: Clean up localStorage migration**

In `loadProgress()`, handle old save data that has old tier IDs (trainee/crew/shiftlead). Map them to new IDs or just reset:

```javascript
// In loadProgress, after parsing:
// Migrate old tier IDs
var tierMap = { trainee: 'easy', crew: 'medium', shiftlead: 'hard' };
catKeys.forEach(function(k) {
  if (parsed.unlocks.tiers[k]) {
    parsed.unlocks.tiers[k] = parsed.unlocks.tiers[k].map(function(t) {
      return tierMap[t] || t;
    });
  }
});
// Migrate old score keys
var newScores = {};
Object.keys(parsed.scores).forEach(function(key) {
  var newKey = key;
  Object.keys(tierMap).forEach(function(old) {
    newKey = newKey.replace('-' + old, '-' + tierMap[old]);
  });
  newScores[newKey] = parsed.scores[key];
});
parsed.scores = newScores;
```

**Step 3: Remove any remaining references to "trainee", "crew", "shiftlead"**

Search for these strings and remove/replace as needed.

**Step 4: Run all tests**

Run: `npx playwright test`
Expected: All tests PASS.

**Step 5: Commit and push**

```bash
git add index.html
git commit -m "chore: clean up dead code, migrate old save data"
git push
```
