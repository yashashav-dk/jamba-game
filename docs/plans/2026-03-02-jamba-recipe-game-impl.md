# Jamba Recipe Learning Game — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:executing-plans to implement this plan task-by-task.

**Goal:** Build a browser-based Jamba Juice counter simulation game that teaches smoothie recipes through progressive difficulty tiers (Trainee → Crew → Shift Lead) with study mode, forced retry on mistakes, and allergen quizzes.

**Architecture:** Single `index.html` file with embedded `<style>` and `<script>` blocks. All recipe data hardcoded as a JS constant. Screen-based navigation using CSS class toggling (show/hide divs). Game state managed by a plain JS object. localStorage for progress persistence.

**Tech Stack:** Vanilla HTML5, CSS3 (flexbox/grid, animations, transitions), ES6+ JavaScript. No dependencies.

---

### Task 0: HTML Skeleton + Recipe Data + Screen Navigation

**Files:**
- Create: `index.html`

**Step 1: Create the base HTML file with recipe data and screen switching**

Create `index.html` with:
- HTML boilerplate with viewport meta for mobile
- 6 screen `<div>`s: `#start-screen`, `#study-screen`, `#category-select-screen`, `#game-screen`, `#results-screen`, `#shift-end-screen`
- CSS: only one screen visible at a time (`.screen { display: none; } .screen.active { display: flex; }`)
- CSS variables for Jamba color palette:
  - `--jamba-orange: #FF6B35`
  - `--jamba-green: #2D8F2D`
  - `--jamba-purple: #7B2D8B`
  - `--jamba-yellow: #FFD23F`
  - `--jamba-pink: #FF69B4`
  - `--jamba-bg: #FFF8F0`
  - `--jamba-dark: #2C1810`
- Base typography (system font stack, sizes)
- Complete `RECIPES` constant — JS object with all 24 smoothies across 3 categories, each with name, category, allergens, and ingredients array (name + s/m/l scoop counts). Use the exact data from the Excel extraction.
- `ALL_INGREDIENTS` constant — flat array of all unique ingredient names, grouped by type (juices, dairy, hardpacks, iqf, extras), for building the ingredient station.
- `showScreen(screenId)` function that toggles `.active` class
- `GAME_STATE` object: `{ currentScreen, category, difficulty, customerIndex, score, timer, blenderContents, shiftResults, missedRecipes }`

```javascript
const CATEGORIES = [
  { id: "greens", name: "Goodness 'n Greens", unlocked: true },
  { id: "plant", name: "Plant Based", unlocked: false },
  { id: "whirld", name: "Whirl'd Famous", unlocked: false }
];

const DIFFICULTIES = [
  { id: "trainee", name: "Trainee", unlocked: true, timer: 0 },
  { id: "crew", name: "Crew", unlocked: false, timer: 45 },
  { id: "shiftlead", name: "Shift Lead", unlocked: false, timer: 35 }
];
```

- `INGREDIENT_GROUPS` constant organizing all ingredients by shelf type:

```javascript
const INGREDIENT_GROUPS = [
  { name: "Juices", color: "#FFA94D", items: ["Orange Juice", "Pineapple Juice", "Passion-Mango Juice Blend", "Lemonade", "Peach Juice", "Peach Juice Blend", "Apple-Strawberry Juice Blend", "Mixed Berry Juice Blend", "Pomegranate Juice Blend"] },
  { name: "Dairy & Milk", color: "#E8D5B7", items: ["2% Milk", "Milk 2%", "Soymilk", "Oatmilk", "Almondmilk", "Vanilla Coconutmilk", "Greek Yogurt"] },
  { name: "Hardpacks & Frozen", color: "#C8A2D4", items: ["Raspberry Hardpack", "Orange Hardpack", "Lime Hardpack", "Pineapple Hardpack", "Frozen Yogurt", "Oatmilk Frozen Dessert"] },
  { name: "IQF Fruits & Veg", color: "#FF9AAB", items: ["IQF Strawberries", "IQF Blueberries", "IQF Mangos", "Mango, IQF", "IQF Peaches", "IQF Bananas", "IQF Kale", "Kale, IQF", "IQF Pineapple", "IQF Pineapples"] },
  { name: "Extras", color: "#98D8AA", items: ["Peanut Butter", "Protein - Choice", "Daily Vitamin & Zinc", "Ginger Puree (scoop)", "Blue Spirulina", "Moo'd Powder*", "Honey Drizzle", "Agave Drizzle", "Matcha Base", "Tropical Greens", "Açaí Concentrate", "Ice"] }
];
```

**Step 2: Verify in browser**

Open `index.html` in browser. Open console. Verify:
- `RECIPES` object has 3 categories with correct smoothie counts (5 + 9 + 10 = 24)
- `showScreen('start-screen')` shows the start screen div
- No console errors

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: scaffold HTML skeleton with recipe data and screen navigation"
```

---

### Task 1: Start Screen UI

**Files:**
- Modify: `index.html`

**Step 1: Build the start screen HTML + CSS**

Inside `#start-screen`, add:
- Game title: "JAMBA SHIFT TRAINER" in large bold text with gradient (orange → purple)
- Subtitle: "Master your recipes before your next shift"
- Three buttons stacked vertically:
  - "STUDY RECIPES" (green) → calls `showScreen('study-screen')`
  - "START SHIFT" (orange) → calls `showScreen('category-select-screen')`
  - High score summary section (small text below buttons)
- CSS: center everything vertically and horizontally. Buttons: large (min 200px wide), rounded corners, bold text, hover scale effect. Background: warm gradient or subtle smoothie pattern.

**Step 2: Build the category/difficulty select screen**

Inside `#category-select-screen`:
- "CHOOSE YOUR STATION" header
- 3 category cards (Goodness 'n Greens, Plant Based, Whirl'd Famous) — each shows:
  - Category name
  - Number of recipes
  - Lock icon + "Get 2 stars on [prev category] to unlock" if locked
  - Best star rating if played
- Below selected category: 3 difficulty tier buttons (Trainee, Crew, Shift Lead) with lock states
- "BACK" button → returns to start screen
- JS: `renderCategorySelect()` reads from `loadProgress()` (stub returning defaults for now) to determine lock states

**Step 3: Verify in browser**

- Start screen shows centered with styled buttons
- Clicking "START SHIFT" shows category select
- First category (Goodness 'n Greens) is clickable, others show locked
- Trainee is clickable, Crew/Shift Lead show locked
- Back button works

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add start screen and category/difficulty select UI"
```

---

### Task 2: Study Mode

**Files:**
- Modify: `index.html`

**Step 1: Build study screen HTML + CSS + JS**

Inside `#study-screen`:
- "RECIPE BOOK" header + back button
- Category tabs (3 tabs, horizontal) — clicking a tab filters recipes
- Recipe list: cards showing smoothie name, click to expand
- Expanded recipe card shows:
  - Smoothie name (large)
  - Allergen badge (color-coded: red for Dairy, yellow for Soy, brown for Nut, green for None)
  - Ingredients table: 4 columns (Ingredient | S | M | L) with scoop counts
- JS: `renderStudyMode()` — builds the UI from `RECIPES` data. Tab click filters by category.

**Step 2: Verify in browser**

- All 3 category tabs work
- All 24 smoothies appear under correct categories
- Expanding a recipe shows correct ingredients and scoop counts
- Allergen badges display correctly
- Back button returns to start screen

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add study mode with recipe browsing by category"
```

---

### Task 3: Game Engine Core

**Files:**
- Modify: `index.html`

**Step 1: Implement game state management and customer generation**

Add JS functions:

- `startShift(categoryId, difficultyId)` — initializes `GAME_STATE`:
  - Picks 10 random smoothies from the selected category (with repeats if category has <10)
  - Each customer gets a random size (S/M/L)
  - Sets score to 0, customerIndex to 0
  - Calls `showScreen('game-screen')` then `showCustomer(0)`

- `showCustomer(index)` — renders current customer:
  - Updates the top bar (shift progress, score)
  - Shows customer with speech bubble containing order (smoothie name + size)
  - Clears the blender cup
  - Starts timer if difficulty has one (countdown interval)
  - Builds the ingredient station

- `GAME_STATE.blenderContents` — array of `{ ingredientName, scoops }` representing what the player has added

- Timer logic:
  - `startTimer(seconds)` — countdown interval, updates timer bar width + color
  - When timer hits 0: auto-submit current blender contents (same as hitting BLEND)
  - Timer bar: CSS `transition` on width for smooth countdown

**Step 2: Build the game screen HTML layout**

Inside `#game-screen`:
- Top bar: `<div class="top-bar">` with shift counter, timer bar, score
- Main area (2 columns):
  - Left: customer area with avatar placeholder + speech bubble
  - Right: blender cup — list of added ingredients with scoop counts + CLEAR/BLEND buttons
- Bottom: ingredient station — grouped shelves of clickable tiles

**Step 3: Build the ingredient station UI**

- Render ingredient tiles grouped by `INGREDIENT_GROUPS`
- Each group has a labeled shelf with colored background
- Each tile: ingredient name, colored by group
- Click a tile → opens a small modal/popup anchored to the tile:
  - Ingredient name
  - Size label showing current order size
  - `−` / scoop count / `+` buttons (default to 1)
  - "ADD" button → adds `{ name, scoops }` to `GAME_STATE.blenderContents`, updates blender cup display, closes popup
- If ingredient already in blender: tile gets a checkmark overlay, clicking opens popup to adjust scoops

**Step 4: Implement blender cup display**

- Lists all added ingredients with name + scoop count
- Each row has a small `×` button to remove it
- "CLEAR" button empties all
- "BLEND" button submits the recipe for grading

**Step 5: Verify in browser**

- Select Goodness 'n Greens → Trainee (even though Trainee will be different — just test the station renders)
- Customer appears with a smoothie name + size
- Ingredient tiles show, organized by group
- Click a tile → popup appears with +/- stepper
- Add ingredient → appears in blender cup
- Remove ingredient works
- Clear works
- Timer counts down (if applicable)

**Step 6: Commit**

```bash
git add index.html
git commit -m "feat: add game engine with customer generation, ingredient station, and blender cup"
```

---

### Task 4: Trainee Mode (Multiple Choice)

**Files:**
- Modify: `index.html`

**Step 1: Implement Trainee difficulty variant**

When difficulty is "trainee", the game screen renders differently:
- Instead of the ingredient station, show a **series of multiple-choice questions**
- For each ingredient in the correct recipe, show a question:
  - "Which of these is in [Smoothie Name]?"
  - 4 options: 1 correct ingredient + 3 wrong ingredients (picked randomly from other recipes, ensuring they're not also in this recipe)
- Player clicks an answer → immediate feedback (green flash correct, red flash wrong)
- After all ingredient questions are answered → auto-submit (no BLEND button needed)
- No timer in Trainee mode
- No scoop counts — just ingredient recognition

JS functions:
- `renderTraineeMode(recipe, size)` — generates the question sequence
- `generateWrongOptions(correctIngredient, recipe)` — picks 3 plausible wrong answers
- `handleTraineeAnswer(questionIndex, selectedAnswer)` — checks answer, shows feedback, advances

**Step 2: Wire into game flow**

- In `showCustomer()`: if difficulty is "trainee", call `renderTraineeMode()` instead of rendering the station
- After all questions answered: call `gradeRecipe()` (from next task) or a simplified Trainee grading

**Step 3: Verify in browser**

- Start Goodness 'n Greens → Trainee
- Customer orders a smoothie
- Multiple choice questions appear one at a time
- Correct/wrong feedback works
- After all questions, moves to next step

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add trainee mode with multiple choice ingredient questions"
```

---

### Task 5: Recipe Grading + Results Screen + Allergen Check

**Files:**
- Modify: `index.html`

**Step 1: Implement recipe grading logic**

```javascript
function gradeRecipe(playerIngredients, correctRecipe, size) {
  const sizeKey = size === 'Small' ? 's' : size === 'Medium' ? 'm' : 'l';
  const results = { correct: [], wrong: [], missing: [], score: 0 };

  // Check each correct ingredient
  for (const ing of correctRecipe.ingredients) {
    const playerIng = playerIngredients.find(p => p.name === ing.name);
    if (!playerIng) {
      results.missing.push({ name: ing.name, expected: ing[sizeKey] });
      results.score -= 5;
    } else if (String(playerIng.scoops) === String(ing[sizeKey])) {
      results.correct.push({ name: ing.name, scoops: ing[sizeKey] });
      results.score += 10;
    } else {
      results.wrong.push({ name: ing.name, expected: ing[sizeKey], got: playerIng.scoops });
      results.score -= 5;
    }
  }

  // Check for extra ingredients player added that aren't in recipe
  for (const p of playerIngredients) {
    if (!correctRecipe.ingredients.find(i => i.name === p.name)) {
      results.wrong.push({ name: p.name, expected: 0, got: p.scoops });
      results.score -= 5;
    }
  }

  // Perfect bonus
  if (results.wrong.length === 0 && results.missing.length === 0) {
    results.score += 25;
  }

  return results;
}
```

For Trainee mode, grading counts correct answers from the multiple choice sequence instead.

**Step 2: Implement allergen check popup**

After BLEND (or after Trainee questions), before showing results:
- Modal popup: "What allergens does [Smoothie] have?"
- Checkboxes: Dairy, Soy, Nut, None
- Submit button
- Grading: parse the recipe's allergen string → compare to player's selection
  - Correct: +10 points
  - Wrong: -10 points

```javascript
function parseAllergens(allergenStr) {
  const result = { dairy: false, soy: false, nut: false, none: false };
  if (allergenStr.includes('No Allergens')) { result.none = true; return result; }
  if (allergenStr.includes('Dairy')) result.dairy = true;
  if (allergenStr.includes('Soy')) result.soy = true;
  if (allergenStr.includes('Nut')) result.nut = true;
  return result;
}
```

**Step 3: Build the results screen**

Inside `#results-screen`:
- Smoothie name + size at top
- Two-column comparison: "Your Recipe" vs "Correct Recipe"
- Each ingredient row: green background if correct, red if wrong/missing, yellow if wrong scoop count
- Allergen result: correct/wrong indicator
- Points earned this round
- If any wrong/missing: "RETRY" button (forced retry — must rebuild correctly)
- If all correct: "NEXT CUSTOMER" button

**Step 4: Implement forced retry**

When player clicks RETRY:
- Return to game screen with the same customer order
- The correct recipe is shown in a semi-transparent overlay on the left side (visible reference)
- Player must rebuild it. This time grading is lenient — just needs correct ingredients, doesn't affect score
- After correct rebuild: "NEXT CUSTOMER" button appears

**Step 5: Implement customer advancement**

- `nextCustomer()` — increments `customerIndex`, stores result in `GAME_STATE.shiftResults`
- If `customerIndex >= 10`: call `showShiftEnd()`
- Otherwise: call `showCustomer(customerIndex)`

**Step 6: Verify in browser**

- Complete a Trainee order → allergen popup appears
- Answer allergen question → results screen shows
- Correct answers show green, wrong show red
- If wrong: RETRY button appears, retry works with reference visible
- If correct: NEXT CUSTOMER advances
- After 10 customers: advances to shift end (next task)

**Step 7: Commit**

```bash
git add index.html
git commit -m "feat: add recipe grading, allergen check, results screen, and forced retry"
```

---

### Task 6: Crew Mode

**Files:**
- Modify: `index.html`

**Step 1: Implement Crew difficulty variant**

When difficulty is "crew":
- Full ingredient station is shown (same as Task 3)
- Player clicks ingredients to add them to the blender
- BUT: scoop counts are auto-filled. When player adds an ingredient, the correct scoop count for the ordered size is automatically set (shown as read-only)
- Timer: 45 seconds per customer
- Player's job: select the RIGHT ingredients, not worry about counts
- BLEND button to submit

Changes to ingredient popup:
- In Crew mode: no +/- stepper. Just "ADD" button. Scoops display as "auto" or the correct value

**Step 2: Wire into game flow**

- In `showCustomer()`: if difficulty is "crew", render station with auto-scoops mode

**Step 3: Verify in browser**

- Start Goodness 'n Greens → Crew
- Timer appears and counts down
- Clicking ingredients adds them with auto-filled scoops
- Grading works (correct = ingredient is present; wrong = ingredient not in recipe added; missing = ingredient in recipe not added)
- Timer expiry auto-submits

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add crew mode with auto-filled scoops and timer"
```

---

### Task 7: Shift Lead Mode (Full Simulation)

**Files:**
- Modify: `index.html`

**Step 1: Implement Shift Lead difficulty variant**

When difficulty is "shiftlead":
- Full ingredient station with +/- stepper (exactly as built in Task 3)
- Timer: 35 seconds per customer
- Player must select correct ingredients AND set correct scoop counts
- This is the default behavior already built — just needs the timer wired up

**Step 2: Verify in browser**

- Start a category → Shift Lead (need to temporarily bypass unlock for testing)
- Full station with scoop steppers
- 35-second timer
- Grading checks both ingredient presence and scoop accuracy

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add shift lead mode with full ingredient + scoop count testing"
```

---

### Task 8: End-of-Shift Scorecard

**Files:**
- Modify: `index.html`

**Step 1: Build shift end screen**

Inside `#shift-end-screen`:
- "SHIFT COMPLETE!" header with animation
- Star rating display (1-3 stars, large, with fill animation):
  - Calculate max possible score: (num_ingredients × 10 + 25 perfect + 10 allergen) × 10 customers
  - 1 star: ≥40% of max
  - 2 stars: ≥70% of max
  - 3 stars: ≥90% of max
- Total score
- Per-smoothie breakdown: list of 10 orders with pass/fail icon and score
- Buttons:
  - "PRACTICE MISTAKES" (only if there were mistakes) → starts mini-shift with just the wrong ones
  - "PLAY AGAIN" → back to category select
  - "HOME" → back to start screen

**Step 2: Implement practice mode**

`startPracticeShift(missedRecipes)`:
- Same as `startShift()` but uses only the missed recipes
- Same difficulty tier
- At end: shows scorecard for just those

**Step 3: Implement `showShiftEnd()` function**

- Calculates star rating from `GAME_STATE.shiftResults`
- Renders the scorecard
- Stores missed recipes in `GAME_STATE.missedRecipes`

**Step 4: Verify in browser**

- Complete a full 10-customer shift
- Scorecard appears with star rating
- Per-smoothie breakdown shows correctly
- "Practice Mistakes" starts a mini-shift with just the wrong ones
- "Play Again" returns to category select

**Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add end-of-shift scorecard with star rating and practice mode"
```

---

### Task 9: Progressive Unlock + localStorage Persistence

**Files:**
- Modify: `index.html`

**Step 1: Implement localStorage save/load**

```javascript
function saveProgress() {
  const progress = {
    scores: GAME_STATE.bestScores,    // { "greens-trainee": { score: 240, stars: 2 }, ... }
    unlocks: GAME_STATE.unlocks       // { categories: ["greens", "plant"], tiers: { greens: ["trainee", "crew"], ... } }
  };
  localStorage.setItem('jamba-trainer-progress', JSON.stringify(progress));
}

function loadProgress() {
  const saved = localStorage.getItem('jamba-trainer-progress');
  if (saved) return JSON.parse(saved);
  return {
    scores: {},
    unlocks: { categories: ["greens"], tiers: { greens: ["trainee"], plant: ["trainee"], whirld: ["trainee"] } }
  };
}
```

**Step 2: Implement unlock logic**

After shift end, check if new unlocks are earned:
- Category unlock: 2+ stars on any tier in current category → unlock next category
- Tier unlock: 2+ stars on current tier → unlock next tier (per category)
- Show unlock notification if something new is unlocked (toast/modal: "Plant Based UNLOCKED!")

**Step 3: Wire into category select screen**

- `renderCategorySelect()` reads from `loadProgress()` to show lock/unlock states
- Locked categories: grayed out with lock icon and requirement text
- Unlocked: full color, clickable
- Show best star rating on each category/tier combo

**Step 4: Wire save into shift end**

- At end of `showShiftEnd()`: call `saveProgress()`
- Update `GAME_STATE.bestScores` if new score beats previous best

**Step 5: Add high score display to start screen**

- Below buttons: "Best Scores" section
- List each played category/tier combo with star rating

**Step 6: Verify in browser**

- Play Goodness 'n Greens → Trainee → get 2+ stars
- Return to category select: Crew should be unlocked, Plant Based should be unlocked
- Refresh page: progress persists
- High scores show on start screen

**Step 7: Commit**

```bash
git add index.html
git commit -m "feat: add progressive unlock system and localStorage persistence"
```

---

### Task 10: Visual Polish + Animations

**Files:**
- Modify: `index.html`

**Step 1: Customer animations**

- Customer avatar: simple CSS-drawn figure (circle head, rounded body) with a colored apron/shirt that varies per customer
- Slide-in from left when new customer appears (`@keyframes slideIn`)
- Speech bubble: fade-in with slight bounce (`@keyframes bubblePop`)
- Happy reaction (correct): bounce + green glow
- Sad reaction (wrong): shake + red tint

**Step 2: Ingredient interactions**

- Tile hover: slight lift + shadow (`transform: translateY(-2px); box-shadow: ...`)
- Tile click: press effect (`transform: scale(0.95)`)
- Adding to blender: ingredient tile briefly flashes, item appears in blender cup with slide-down animation
- Blender cup: subtle gradient fill that rises as more ingredients are added

**Step 3: BLEND button animation**

- When clicked: blender cup shakes/vibrates for 0.5s (`@keyframes shake`)
- Then results screen slides in from right

**Step 4: Star rating animation on scorecard**

- Stars fill in one at a time with a pop effect + gold sparkle
- Score count-up animation (numbers increment from 0 to final)

**Step 5: Timer bar styling**

- Smooth width transition
- Color gradient: green (>50%) → yellow (25-50%) → red (<25%)
- Pulse animation when <10 seconds

**Step 6: General polish**

- Smooth screen transitions (fade or slide)
- Responsive layout: works on phone screens (stack columns vertically on narrow screens)
- Touch-friendly: minimum 44px tap targets for all interactive elements
- Add subtle background pattern or gradient to each screen

**Step 7: Verify in browser (desktop + mobile viewport)**

- All animations play smoothly
- No layout breaks on narrow screens
- Touch interactions work in mobile viewport
- Timer feels appropriately urgent

**Step 8: Commit**

```bash
git add index.html
git commit -m "feat: add visual polish, animations, and responsive layout"
```

---

### Task 11: Final Verification + Edge Cases

**Files:**
- Modify: `index.html` (if needed)

**Step 1: Test all game paths**

Manually test each path:
- Study mode: all 3 categories, all recipes display correctly
- Trainee → all 3 categories (once unlocked)
- Crew → all 3 categories
- Shift Lead → all 3 categories
- Forced retry flow
- Allergen check for smoothies with: No Allergens, single allergen, multiple allergens
- Practice mistakes flow
- Timer expiry (let it run out)

**Step 2: Fix edge cases**

- Recipes with non-numeric scoops: Honey Drizzle ("1x", "1.5x", "2x") and Agave Drizzle (".5") — handle these in the stepper (allow decimal and "x" suffix)
- "Milk 2%" vs "2% Milk" — normalize in data (both refer to same ingredient)
- "IQF Kale" vs "Kale, IQF" and "IQF Mangos" vs "Mango, IQF" — normalize to one form
- Category with only 5 recipes: shift still shows 10 customers (repeats are fine)
- localStorage corrupted/cleared: handle gracefully with defaults

**Step 3: Commit**

```bash
git add index.html
git commit -m "fix: handle edge cases in recipe data and game flow"
```

**Step 4: Final commit with Excel data file**

```bash
git add Jamba_Juice_Complete_Menu.xlsx
git commit -m "chore: add source Excel data file"
```
