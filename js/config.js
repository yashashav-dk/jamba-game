// Game constants
const GAME_WIDTH = 960;
const GAME_HEIGHT = 640;

const DIFFICULTIES = [
  { id: 'easy', name: 'Easy', timer: 300 },
  { id: 'medium', name: 'Medium', timer: 240 },
  { id: 'hard', name: 'Hard', timer: 180 }
];

const SIZES = ['s', 'm', 'l'];
const SIZE_LABELS = { s: 'Small', m: 'Medium', l: 'Large' };

const CATEGORIES = [
  { id: 'greens', name: "Goodness 'n Greens" },
  { id: 'plant', name: 'Plant Based' },
  { id: 'whirld', name: "Whirl'd Famous" }
];

// Counter zone layout
const COUNTER_ZONES = {
  juices: ["Orange Juice", "Pineapple Juice", "Passion-Mango Juice Blend", "Lemonade", "Peach Juice", "Peach Juice Blend", "Apple-Strawberry Juice Blend", "Mixed Berry Juice Blend", "Pomegranate Juice Blend"],
  pb: ["Peanut Butter"],
  dairy: ["2% Milk", "Soymilk", "Oatmilk", "Almondmilk", "Vanilla Coconutmilk", "Greek Yogurt"],
  iqf: ["IQF Strawberries", "IQF Blueberries", "IQF Mango", "IQF Peaches", "IQF Bananas", "IQF Kale", "IQF Pineapple"],
  hardpacks: ["Raspberry Hardpack", "Orange Hardpack", "Lime Hardpack", "Pineapple Hardpack", "Frozen Yogurt"],
  powders: ["Protein - Choice", "Moo'd Powder", "Matcha Base", "Tropical Greens", "Daily Vitamin & Zinc", "Blue Spirulina", "Ginger Puree", "Acai Concentrate", "Honey Drizzle", "Agave Drizzle"],
  ice: ["Ice"]
};

// Color scheme for zones
const ZONE_COLORS = {
  juices: { bg: 0xFFA94D, text: 0x000000 },
  pb: { bg: 0x8B6914, text: 0xFFFFFF },
  dairy: { bg: 0xE8D5B7, text: 0x000000 },
  iqf: { bg: 0xFF9AAB, text: 0x000000 },
  hardpacks: { bg: 0xC8A2D4, text: 0x000000 },
  powders: { bg: 0x98D8AA, text: 0x000000 },
  ice: { bg: 0xB3E5FC, text: 0x000000 }
};

// Ingredient abbreviations for tile labels
const INGREDIENT_ABBREV = {
  "Orange Juice": "OJ",
  "Pineapple Juice": "Pine",
  "Passion-Mango Juice Blend": "PM",
  "Lemonade": "Lem",
  "Peach Juice": "Peach",
  "Peach Juice Blend": "PJB",
  "Apple-Strawberry Juice Blend": "ASB",
  "Mixed Berry Juice Blend": "MxBy",
  "Pomegranate Juice Blend": "Pom",
  "Peanut Butter": "PB",
  "2% Milk": "2%",
  "Soymilk": "Soy",
  "Oatmilk": "Oat",
  "Almondmilk": "Alm",
  "Vanilla Coconutmilk": "VCo",
  "Greek Yogurt": "GkYg",
  "IQF Strawberries": "Strw",
  "IQF Blueberries": "Blue",
  "IQF Mango": "Mang",
  "IQF Peaches": "Pch",
  "IQF Bananas": "Bana",
  "IQF Kale": "Kale",
  "IQF Pineapple": "Pine",
  "Raspberry Hardpack": "Rasp",
  "Orange Hardpack": "OrgH",
  "Lime Hardpack": "Lime",
  "Pineapple Hardpack": "PinH",
  "Frozen Yogurt": "FrYg",
  "Protein - Choice": "Prot",
  "Moo'd Powder": "Mood",
  "Matcha Base": "Mtch",
  "Tropical Greens": "TrGn",
  "Daily Vitamin & Zinc": "VitZ",
  "Blue Spirulina": "Spir",
  "Ginger Puree": "Gngr",
  "Acai Concentrate": "Acai",
  "Honey Drizzle": "Hny",
  "Agave Drizzle": "Agav",
  "Ice": "Ice"
};

// Game state (shared across scenes)
const GAME_STATE = {
  mode: null,           // 'practice' or 'shift'
  category: null,
  difficulty: null,
  size: null,
  customerIndex: 0,
  score: 0,
  timer: 0,
  shiftTimerMax: 0,
  overtimePenalty: 0,
  blenderContents: [],
  shiftResults: [],
  currentRecipe: null,
  shiftOrders: [],
  isRetry: false,
  combo: 1,
  allergenScore: 0
};

// Progress persistence
function loadProgress() {
  try {
    var saved = localStorage.getItem('jamba-trainer-progress');
    if (saved) {
      var parsed = JSON.parse(saved);
      if (!parsed || !parsed.scores) return defaultProgress();
      if (typeof parsed.totalShifts !== 'number') parsed.totalShifts = 0;
      if (typeof parsed.highScore !== 'number') parsed.highScore = 0;
      return parsed;
    }
  } catch (e) {}
  return defaultProgress();
}

function defaultProgress() {
  return { scores: {}, totalShifts: 0, highScore: 0 };
}

function saveProgress(progress) {
  localStorage.setItem('jamba-trainer-progress', JSON.stringify(progress));
}

// Grading function
function gradeRecipe(playerIngredients, recipe, sizeKey) {
  var correct = [], wrong = [], missing = [], extra = [];
  var score = 0;
  var recipeMap = {};
  recipe.ingredients.forEach(function(ing) { recipeMap[ing.name] = ing[sizeKey]; });
  var playerMap = {};
  playerIngredients.forEach(function(p) { playerMap[p.name] = p.amount; });

  Object.keys(recipeMap).forEach(function(name) {
    var expected = recipeMap[name];
    if (playerMap[name] !== undefined) {
      if (String(playerMap[name]) === String(expected)) {
        correct.push({ name: name, expected: expected, got: playerMap[name] });
        score += 10;
      } else {
        wrong.push({ name: name, expected: expected, got: playerMap[name] });
        score -= 5;
      }
    } else {
      missing.push({ name: name, expected: expected });
      score -= 5;
    }
  });

  Object.keys(playerMap).forEach(function(name) {
    if (recipeMap[name] === undefined) {
      extra.push({ name: name, got: playerMap[name] });
      score -= 5;
    }
  });

  var isPerfect = wrong.length === 0 && missing.length === 0 && extra.length === 0 && correct.length > 0;
  if (isPerfect) score += 25;
  return { correct: correct, wrong: wrong, missing: missing, extra: extra, score: score, isPerfect: isPerfect };
}
