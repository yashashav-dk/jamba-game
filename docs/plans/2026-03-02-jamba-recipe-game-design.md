# Jamba Recipe Learning Game — Design Doc

## Goal

A browser-based simulation game to memorize Jamba Juice smoothie recipes (ingredients, scoop counts per size, and allergens) for shift preparation. Covers 3 categories (~26 smoothies), excluding Kids and LTO.

## Tech Stack

Single-file vanilla HTML/CSS/JS (`index.html`). No frameworks, no build tools. localStorage for progress/scores.

## Recipe Data

Hardcoded JSON from `Jamba_Juice_Complete_Menu.xlsx`. Three categories:

- **Goodness 'n Greens** (6 smoothies): Acai Super-Antioxidant, The Go Getter, Orange-C Booster, PB + Banana Protein, Protein Berry Workout
- **Plant Based** (10 smoothies): Amazing Greens, Apple 'N Greens, Greens 'N Ginger, Mega Mango, Peach Perfection, Pomegranate Paradise, Smooth Talkin' Mango, Strawberry Whirl, Vanilla Blue Sky
- **Whirl'd Famous** (10 smoothies): Aloha Pineapple, Caribbean Passion, Mango-A-Go-Go, Orange Dream Machine, PB Chocolate Love, Peanut Butter Moo'd, Razzmatazz, Strawberries Wild, Strawberry Surf Rider, White Gummi

Each recipe: name, category, ingredients (name + S/M/L scoop counts), allergen info. Blend settings excluded.

## Game Screens

### 1. Start Screen
- Game title + Jamba-inspired branding
- **Study** button — browse recipes by category
- **Play** button — pick a category (progressive unlock) and difficulty tier
- High scores display

### 2. Study Mode
- Browse recipes by category
- Each recipe shows: all ingredients, scoop counts for S/M/L, allergen info
- No scoring, just reference browsing

### 3. Game Screen (Shift Simulation)

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  Shift: 3/10    ⏱ 0:32    Score: 240            │
├──────────────────────┬──────────────────────────┤
│   CUSTOMER AREA      │   YOUR BLENDER CUP       │
│   [Customer avatar]  │   Added ingredients list  │
│   "Large Acai        │   with scoop counts       │
│    Super-Antioxidant" │                          │
│                      │   [ CLEAR ] [ BLEND ]    │
├──────────────────────┴──────────────────────────┤
│  INGREDIENT STATION (grouped shelves)            │
│  Clickable ingredient tiles organized by type    │
│  Click → popup with +/- stepper → Add           │
└─────────────────────────────────────────────────┘
```

**Ingredient groups on the station:**
- Juices: OJ, Pineapple, Passion-Mango, Lemonade, Peach, Apple-Strawberry, Mixed Berry, Pomegranate, Blackberry
- Dairy/Milk: 2% Milk, Soymilk, Oatmilk, Almondmilk, Vanilla Coconutmilk, Greek Yogurt
- Hardpacks/Frozen: Raspberry, Orange, Lime, Pineapple, Frozen Yogurt, Oatmilk Frozen Dessert
- IQF Fruits/Veg: Strawberries, Blueberries, Mango, Peaches, Bananas, Kale, Pineapple
- Extras: Peanut Butter, Protein Choice, Daily Vitamin & Zinc, Ginger Puree, Blue Spirulina, Moo'd Powder, Honey Drizzle, Agave Drizzle, Matcha Base, Tropical Greens, Ice

### 4. Results Screen (per customer)
- Side-by-side: your recipe vs correct recipe
- Green checkmarks for correct, red X for wrong/missing
- Shows allergen info

### 5. End-of-Shift Score Card
- Star rating (1-3 stars)
- Per-smoothie breakdown
- "Practice mistakes" button for targeted retry

## Difficulty Tiers (Progressive)

### Trainee
- Multiple choice per ingredient: "Which of these is in [Smoothie]?" (pick from 4 options)
- Teaches ingredient recognition
- No scoop counts, no timer

### Crew
- Pick correct ingredients from the full station
- Scoop counts are pre-filled (shown after you select the ingredient)
- Timer: 45 seconds per customer
- Teaches which ingredients belong to which smoothie

### Shift Lead
- Full simulation: pick ingredients AND set scoop counts
- Timer: 35 seconds per customer
- Tests complete recipe knowledge

**Unlock progression:** 2+ stars on Trainee → unlocks Crew. 2+ stars on Crew → unlocks Shift Lead. Per category.

**Category unlock:** First category (Goodness 'n Greens) available immediately. Unlock Plant Based after 2+ stars on any tier in Goodness 'n Greens. Unlock Whirl'd Famous after 2+ stars on any tier in Plant Based.

## Learning Reinforcement Features

### Forced Retry on Mistakes
When you get a recipe wrong, you must rebuild it correctly before the next customer. The correct recipe stays visible on screen while you rebuild. Every mistake becomes a learning rep.

### Mandatory Allergen Check
After hitting BLEND, a popup asks: "What allergens does this smoothie have?" with checkboxes (Dairy, Soy, Nut, None). Must answer correctly for full points.

### Practice Mode
End-of-shift score card offers "Practice these" for missed recipes — starts a mini-shift with only the smoothies you got wrong.

## Scoring

- Correct ingredient + correct scoop count: **+10 points**
- Wrong or missing ingredient: **-5 points**
- Time bonus (>50% time remaining): **+15 points**
- Perfect recipe (all correct): **+25 bonus**
- Correct allergen answer: **+10 points**
- Wrong allergen answer: **-10 points**

**Star thresholds (per 10-customer shift):**
- 1 star: 40%+ of max possible score
- 2 stars: 70%+ of max possible score
- 3 stars: 90%+ of max possible score

## Visual Design

- Color scheme: Jamba-inspired warm oranges, greens, purples
- Customer: simple CSS avatar with animated speech bubble (slide-in)
- Timer: countdown bar, green → yellow → red
- Ingredient tiles: color-coded by group
- Animations: ingredient add to blender, blend shake, customer reactions (happy/sad)

## Persistence (localStorage)

- Best score per category per difficulty
- Unlock state (categories + tiers)
- Missed recipe tracking for targeted practice
