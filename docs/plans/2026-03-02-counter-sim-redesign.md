# Jamba Counter Simulation Redesign

## Goal

Replace the abstract quiz-style game screen with an immersive top-down counter simulation that mirrors the actual Jamba station layout. Click-to-scoop interaction, visual blender fill, spatial ingredient placement matching the real counter.

## What Changes

**Completely replaced:** The entire `#game-screen` — new spatial counter layout, click-to-scoop interaction, new trainee/crew/shift-lead mode behaviors.

**Stays unchanged:** Start screen, study mode, category select, progressive unlock, scoring system, end-of-shift scorecard, localStorage persistence, recipe data, allergen check, forced retry, results screen.

## Station Layout (Employee POV)

```
                    ┌────────────────────────┐
                    │  POWDERS & EXTRAS      │
                    │  (shelf above IQF/HP)  │
                    │ Protein │ Moo'd │Matcha│   ┌─────┐ ┌──────┐
                    │ Trop.Grn│ Vit&Zn│Spiru│   │     │ │BLNDR │
                    │ Ginger  │ Honey │ Açaí│   │     │ │┌────┐│
  ┌─────────┐      │ Agave   │       │     │   │     │ ││fill││
  │JUICES   │      └────────────────────────┘   │     │ ││    ││
  │  OJ     │  ┌──────────┐  ┌──────────┐      │ ICE │ │└────┘│
  │  Pine   │  │IQF FRUITS│  │HARDPACKS │      │     │ │      │
  │  Pass-M │  │ & VEG    │  │& FROZEN  │      │     │ │[BLND]│
  │  Lemon  │  │Strawbry  │  │Raspberry │      │     │ │[CLR] │
  │  Peach  │  │Bluebry   │  │Orange    │      │     │ │[UNDO]│
  │  App-SB │  │Mango     │  │Lime      │      │     │ │      │
  │  MxBery │  │Peaches   │  │Pineapple │      │     │ │Added:│
  │  Pomgrn │  │Bananas   │  │Froz Yogrt│      │     │ │OJ: 4 │
  │  PchJcBl│  │Kale      │  │          │      └─────┘ │Rasp:2│
  ├─────────┤  │Pineappl  │  │          │               │...   │
  │  PB     │  └──────────┘  └──────────┘               └──────┘
  ├─────────┤
  │DAIRY/MLK│
  │ 2% Milk │
  │ Soymilk │
  │ Oatmilk │
  │Almondmlk│
  │VanCoco  │
  │Greek Yg │
  └─────────┘
```

**Spatial zones (left to right):**
1. LEFT column: Juices (top) → PB → Dairy/Milk (bottom)
2. CENTER-LEFT: IQF Fruits & Veg
3. CENTER-RIGHT: Hardpacks & Frozen
4. ABOVE center (shelf): Powders & Extras (Protein, Moo'd Powder, Matcha Base, Tropical Greens, Daily Vitamin & Zinc, Blue Spirulina, Ginger Puree, Honey Drizzle, Agave Drizzle, Açaí Concentrate)
5. RIGHT: Ice bin
6. FAR-RIGHT: Blender cup + controls + ingredient list

## Interaction: Click-to-Scoop

- Each ingredient = a visual tile/container on the counter
- **Single click** = +1 scoop added to blender
- Rapid clicks = rapid scoops
- Each click: tile pulses + "+1" floats up as animation
- Blender fill level rises with each scoop, color blends based on contents
- Below blender cup: scrollable text list showing `Ingredient × count`

**Blender controls:**
- BLEND button — grades recipe (triggers shake animation first)
- CLEAR button — dumps everything, resets fill
- UNDO button — removes last scoop added

## Difficulty Tiers (Redesigned)

### Trainee (spatial learning)
- Same counter layout, NO multiple choice
- Ingredient tiles that belong in the current recipe get a subtle **glow/highlight border**
- No timer
- Teaches: where ingredients are on the station + which go in each smoothie

### Crew
- No highlights on tiles
- 45-second timer per customer
- Order ticket shows ingredient names AND scoop counts for the ordered size
- Teaches: making the recipe with a reference (like having the recipe card taped up)

### Shift Lead
- No highlights, no scoop counts on ticket
- Ticket only shows smoothie name + size
- 35-second timer
- Tests: complete recipe knowledge from memory

## Order Ticket

- Pinned top-left of the screen
- White rectangle, slight tilt (2deg rotation), drop shadow, monospace font
- Shows: order number, size, smoothie name
- Crew mode: also shows ingredient list with scoop counts
- Trainee mode: also shows ingredient list with scoop counts

## Visual Style

- **Background**: warm wood/laminate texture (CSS gradient, no images)
- **Ingredient tiles**: rounded rectangles, colored by group:
  - Juices: warm orange (#FFA94D)
  - Dairy: cream/white (#E8D5B7)
  - IQF: pink (#FF9AAB)
  - Hardpacks: purple (#C8A2D4)
  - Powders/Extras: green (#98D8AA)
  - Ice: light blue (#B3E5FC)
- **Tile size**: ~70×50px, bold short ingredient name, click feedback (pulse + scale)
- **Blender cup**: tall rounded rectangle, gradient fill that rises. Color computed from ingredients:
  - Orange base (juices), pink (berries), green (kale/matcha), brown (PB/chocolate), blue (spirulina), yellow (mango)
  - Blends toward the dominant ingredient color
- **Order ticket**: white bg, black text, monospace, drop shadow, pinned with slight rotation
- **Timer bar**: horizontal bar below ticket, green → yellow → red

## After BLEND

1. Blender shakes for 0.5s (CSS animation)
2. Allergen check popup (same as v1)
3. Results overlay on counter: side-by-side your recipe vs correct, green/red highlighting
4. Forced retry if wrong (correct recipe visible, rebuild on same counter)
5. Next customer or shift end

## Responsive

- On screens < 700px wide: scale down tile sizes, stack some sections
- Touch-friendly: min 44px tap targets on all tiles
