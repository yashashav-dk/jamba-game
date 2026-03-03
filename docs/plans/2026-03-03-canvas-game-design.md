# Jamba Canvas Game — Full 2D Pixel Art Redesign

## Goal

Convert the DOM-based Jamba Shift Trainer into a full 2D pixel art canvas game using Phaser 3, with animated customers, synthesized sound effects, combo system, particle effects, and arcade-style gameplay.

## Tech Stack

- **Phaser 3** via CDN (no bundler)
- **Web Audio API** for synthesized sound effects (no audio files)
- **Programmatic pixel art** sprites generated at boot (no external image files)
- **GitHub Pages** deployment (static files only)

## File Structure

```
index.html              — Phaser config, canvas mount, CDN script tags
js/
  boot.js               — BootScene: generate all sprites into texture atlas
  menu.js               — MenuScene: animated title, buttons
  category-select.js    — CategorySelectScene: pick category + mode/difficulty
  counter.js            — CounterScene: main gameplay
  results.js            — ResultsScene: grade overlay
  shift-end.js          — ShiftEndScene: scorecard with confetti
  study.js              — StudyScene: recipe book browser
  recipes.js            — Recipe data (24 smoothies, 3 categories)
  sprite-factory.js     — Programmatic pixel art sprite generator
  sfx.js                — Web Audio sound effect synthesizer
```

## Canvas Config

- Resolution: 960×640px
- Scale mode: Phaser.Scale.FIT (fills screen, maintains aspect ratio)
- Pixel art mode: true (crisp scaling, no antialiasing)
- No physics engine (not needed)

## Pixel Art Sprites (All Generated in Code)

### Ingredient Tiles (~45 unique)
- Size: 32×24px each
- Color-coded by zone:
  - Juices: orange containers (#FFA94D)
  - Dairy: white cartons (#E8D5B7)
  - IQF Fruits: pink bins (#FF9AAB)
  - Hardpacks: purple tubs (#C8A2D4)
  - Powders/Extras: green jars (#98D8AA)
  - Ice: blue bucket (#B3E5FC)
  - PB: brown jar
- Each tile has a 2-3 letter abbreviation + icon hint

### Blender Cup
- Size: 48×80px
- Fill level: gradient that rises from bottom (0-100%)
- Fill color: computed from ingredients (orange for juices, pink for berries, green for kale, etc.)
- Animations: idle bob, shake (horizontal wobble during blend)

### Customer Character
- Size: 48×64px
- Frames: walk (4 frames), idle (2 frames), happy (3 frames), sad (2 frames)
- Design: simple pixel person with Jamba visor/apron
- Colors vary per customer (randomized shirt/hair)

### Counter Surface
- 16×16px repeating wood-grain tile
- Metal shelf sprite for powders area

### UI Elements
- Order ticket: white pixel rectangle with bitmap font
- Buttons (BLEND/CLEAR/UNDO): 64×24px pixel art buttons with press states
- Timer bar: green/yellow/red gradient bar
- Combo badge: big bold pixel text "x2", "x3", "x4"

## Counter Layout (In-Game)

```
┌──────────────────────────────────────────────────────────────┐
│ [TICKET]              [TIMER ████████░░ 3:42]      [SCORE]  │
├──────────────────────────────────────────────────────────────┤
│           ┌── POWDERS SHELF ──────────────┐                 │
│           │ green tiles                    │                 │
│           └───────────────────────────────┘                 │
│ ┌JUICES─┐ ┌──IQF FRUITS──┐ ┌─HARDPACKS──┐ ┌ICE┐ ┌BLNDR──┐│
│ │orange │ │pink tiles     │ │purple tiles │ │blue│ │       ││
│ │tiles  │ │               │ │             │ │    │ │ cup   ││
│ │       │ │               │ │             │ │    │ │ fill  ││
│ ├─PB────┤ └───────────────┘ └─────────────┘ │    │ │       ││
│ │brown  │                                   │    │ │[BLEND]││
│ ├DAIRY──┤                                   └────┘ │[CLEAR]││
│ │white  │     🧑 Customer (pixel art)              │[UNDO] ││
│ │tiles  │     speech bubble: "Caribbean..."         │ list  ││
│ └───────┘                                           └───────┘│
└──────────────────────────────────────────────────────────────┘
```

## Animations

| Animation | Description | Duration |
|-----------|-------------|----------|
| Scoop | Tile flashes white, "+1" floats up | 0.4s |
| Blender fill | Liquid level tweens up, color shifts | 0.2s |
| Blend | Blender wobbles L-R, particles burst | 1.0s |
| Customer walk-in | Slides from right to center | 0.8s |
| Customer happy | Jumps, heart particles | 0.6s |
| Customer sad | Head shakes side to side | 0.5s |
| Customer walk-out | Slides left and exits | 0.6s |
| Combo increment | Badge scales up with glow | 0.3s |
| Screen shake | Camera offset 2-4px | 0.2s |
| Star drop | Stars fall in one by one | 0.3s each |
| Confetti | Particle burst (3-star finish) | 2.0s |

## Sound Effects (Web Audio Synthesized)

| Sound | Technique |
|-------|-----------|
| Scoop pop | Short oscillator burst (sine, 880Hz, 50ms decay) |
| Wrong buzz | Low saw wave (220Hz, 200ms) |
| Blend whir | White noise + bandpass filter sweep (500→2000Hz, 1s) |
| Order ding | Sine 523→784Hz slide (300ms) |
| Perfect fanfare | C-E-G chord arpeggiated (100ms each) |
| Combo up | Rising pitch (400→1200Hz, 150ms) |
| Timer tick | Click (noise burst, 10ms) |
| Timer alarm | Square wave 440Hz pulsing (on/off 100ms) |

## Combo System

- Consecutive perfect orders increment combo: x1 → x2 → x3 → x4 (max)
- Score formula: `(ingredient_score + perfect_bonus + allergen_bonus) × combo_multiplier`
- Combo breaks on any imperfect order (reset to x1)
- Visual: big pixel badge shows current multiplier, scales up on change
- Audio: rising pitch on combo up, low thud on combo break

## Game Modes (Unchanged from Previous Design)

### Practice Mode
- No timer, no score, no allergen check
- Customer walks up, shows order
- Build from memory, blend, see corrections
- "Try Again" or "Next Smoothie"

### Timed Shift
- Easy (5min) / Medium (4min) / Hard (3min) for 10 orders
- Shift-wide timer
- Overtime: -5pts/sec penalty
- Allergen check after each blend
- Combo multiplier active

### Recipe Book
- Browse all recipes, category tabs
- No gameplay, just reference

## Scene Flow

```
BootScene → MenuScene → CategorySelectScene → CounterScene ↔ ResultsScene
                ↘ StudyScene                       ↓ (after 10 orders)
                                              ShiftEndScene → MenuScene
```

## Customer Character Details

- Randomized appearance: 4 hair colors × 4 shirt colors = 16 combinations
- Walks in from right side of canvas
- Speech bubble appears above them with smoothie name + size
- Idle animation: subtle vertical bob (2px)
- Reaction: happy (jump + hearts) or sad (shake + sweat drop)
- Walks out left after result acknowledged

## Responsive / Mobile

- Phaser Scale.FIT handles canvas sizing
- Touch input works natively (Phaser handles pointer events)
- Minimum target size for ingredient tiles: 32×24px at base resolution (scales up on larger screens)

## What Stays the Same

- 24 recipes across 3 categories
- Click-to-scoop mechanic
- Blender contents tracking
- Grading algorithm (correct/wrong/missing/extra)
- Allergen check system
- localStorage progress persistence
- Easy/Medium/Hard difficulty with shift-wide timer
- All categories/difficulties unlocked from start

## What's New

- Full canvas rendering (no DOM elements for gameplay)
- Pixel art sprites for everything
- Animated customer characters
- Synthesized sound effects
- Combo multiplier system
- Particle effects (scoop, blend, perfect, confetti)
- Screen shake feedback
- Score counting animation
- Star drop animation at shift end
