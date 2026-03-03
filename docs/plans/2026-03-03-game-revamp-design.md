# Jamba Game Revamp Design

## Goal

Simplify the game into two meaningful modes (Practice + Timed Shift), remove training wheels (hints, ingredient lists on tickets), add a shift-wide timer, and unlock everything from the start.

## What Changes

**Removed:**
- Trainee highlight/glow on ingredient tiles
- Ingredient list from order ticket (all modes)
- Per-order timer
- Progressive unlock / lock gates
- Trainee / Crew / Shift Lead tier names

**Added:**
- Practice Mode (learn on the counter, no pressure)
- Shift-wide fixed timer (replaces per-order timer)
- Easy / Medium / Hard difficulty (timer speeds)

**Unchanged:**
- Counter spatial layout (juices, dairy, PB, IQF, hardpacks, powders, ice, blender)
- Click-to-scoop interaction
- Blender visual fill + ingredient list
- Recipe data
- Allergen check (timed shift only)
- Forced retry on wrong recipe (timed shift only)
- Scoring and star system (timed shift only)
- Shift end scorecard
- Recipe Book (study mode)

## Three Modes

### 1. Practice Mode
- Pick any category (all unlocked)
- Counter loads with random smoothie name + size on ticket
- No timer, no score
- Build from memory, hit BLEND
- Results overlay: your build vs correct recipe (green/red diff)
- "Try Again" (same smoothie) or "Next Smoothie" buttons
- No allergen check
- Optional "Peek" button to reveal recipe card as learning aid

### 2. Timed Shift
- Pick any category, then difficulty:
  - Easy: 5 minutes for 10 orders
  - Medium: 4 minutes for 10 orders
  - Hard: 3 minutes for 10 orders
- Ticket shows ONLY smoothie name + size (no ingredients ever)
- One countdown timer for entire shift
- If timer hits 0: -5 points per second over time, shift continues
- Allergen check after each blend
- Forced retry on wrong recipe (costs shift time)
- Scoring + stars at shift end

### 3. Recipe Book
- Same as current study mode
- Expandable cards with S/M/L scoop counts
- Category tabs
- Accessible from main menu

## Order Ticket (All Modes)

```
#01 - Small
Orange C-Booster
```

Order number, size, smoothie name. Nothing else.

## Shift-Wide Timer

- Horizontal bar at top of game screen
- Shows `MM:SS` text + shrinking bar
- Green → Yellow (under 40%) → Red (under 20%) → Pulsing red (under 30s)
- Not shown in Practice Mode

## Timeout Behavior

When shift timer reaches 0:
- Timer shows `0:00` in red
- Each second over: -5 point penalty accumulates
- Player can still finish current and remaining orders
- Overtime penalty shown on scorecard

## Progression

None. All categories and difficulties unlocked from the start. No gates, no locks.

## Start Screen

Three buttons:
- **PRACTICE** → category select → counter (no timer)
- **START SHIFT** → category select → difficulty select → counter (timed)
- **RECIPE BOOK** → browse recipes

## After BLEND (Practice)

1. Blend animation (0.5s)
2. Results overlay on counter: side-by-side your recipe vs correct
3. Green = correct ingredient + amount, Red = wrong/missing
4. "Try Again" or "Next Smoothie" buttons

## After BLEND (Timed Shift)

1. Blend animation (0.5s)
2. Allergen check popup
3. Results overlay: your build vs correct
4. If wrong: forced retry (rebuild on same counter, clock keeps ticking)
5. If right: "Next Customer" button
6. After 10th order: shift end scorecard
