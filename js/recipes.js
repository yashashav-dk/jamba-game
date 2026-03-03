const RECIPES = {
  "greens": {
    name: "Goodness 'n Greens",
    smoothies: [
      {
        name: "Acai Super-Antioxidant",
        allergens: "Dairy + Soy Allergen",
        ingredients: [
          { name: "Acai Concentrate", s: 3, m: 4, l: 5 },
          { name: "Soymilk", s: 6, m: 7, l: 9 },
          { name: "Daily Vitamin & Zinc", s: 1, m: 1, l: 1 },
          { name: "Raspberry Hardpack", s: 1, m: 1, l: 1 },
          { name: "IQF Strawberries", s: 2, m: 2, l: 2 },
          { name: "IQF Blueberries", s: 1, m: 1, l: 1 },
          { name: "Ice", s: 1, m: 1, l: 2 }
        ]
      },
      {
        name: "The Go Getter",
        allergens: "No Allergens",
        ingredients: [
          { name: "Tropical Greens", s: 4, m: 5, l: 6 },
          { name: "Matcha Base", s: 5, m: 6, l: 8 },
          { name: "Orange Juice", s: 3, m: 3, l: 4 },
          { name: "IQF Kale", s: 3, m: 3, l: 4 },
          { name: "IQF Mango", s: 2, m: 2, l: 2 }
        ]
      },
      {
        name: "Orange C-Booster",
        allergens: "Nut Allergen",
        ingredients: [
          { name: "Orange Juice", s: 8, m: 10, l: 14 },
          { name: "Daily Vitamin & Zinc", s: 1, m: 1, l: 1 },
          { name: "Orange Hardpack", s: 2, m: 2, l: 2 },
          { name: "IQF Peaches", s: 2, m: 2, l: 2 },
          { name: "IQF Bananas", s: 1, m: 1, l: 1 },
          { name: "Ice", s: 1, m: 1, l: 1 }
        ]
      },
      {
        name: "PB + Banana Protein",
        allergens: "Nut Allergen",
        ingredients: [
          { name: "2% Milk", s: 6, m: 8, l: 10 },
          { name: "Peanut Butter", s: 2, m: 2, l: 3 },
          { name: "Protein - Choice", s: 2, m: 2, l: 2 },
          { name: "IQF Bananas", s: 2, m: 2, l: 2 },
          { name: "Honey Drizzle", s: "1x", m: "1.5x", l: "2x" },
          { name: "Ice", s: 2, m: 2, l: 3 }
        ]
      },
      {
        name: "Protein Berry Workout",
        allergens: "Dairy + Soy Allergen",
        ingredients: [
          { name: "Soymilk", s: 10, m: 13, l: 14 },
          { name: "Protein - Choice", s: 1, m: 1, l: 1 },
          { name: "IQF Strawberries", s: 2, m: 2, l: 2 },
          { name: "IQF Bananas", s: 2, m: 2, l: 2 },
          { name: "Ice", s: 1, m: 1, l: 2 }
        ]
      }
    ]
  },
  "plant": {
    name: "Plant Based",
    smoothies: [
      {
        name: "Amazing Greens",
        allergens: "No Allergens",
        ingredients: [
          { name: "Lemonade", s: 3, m: 4, l: 5 },
          { name: "Peach Juice", s: 6, m: 8, l: 10 },
          { name: "IQF Kale", s: 2, m: 2, l: 3 },
          { name: "IQF Peaches", s: 2, m: 2, l: 2 },
          { name: "IQF Bananas", s: 1, m: 1, l: 1 },
          { name: "Ice", s: 1, m: 1, l: 1 }
        ]
      },
      {
        name: "Apple 'N Greens",
        allergens: "No Allergens",
        ingredients: [
          { name: "Apple-Strawberry Juice Blend", s: 10, m: 13, l: 17 },
          { name: "IQF Kale", s: 3, m: 3, l: 4 },
          { name: "IQF Peaches", s: 1, m: 1, l: 1 },
          { name: "IQF Bananas", s: 1, m: 1, l: 1 },
          { name: "IQF Mango", s: 1, m: 1, l: 1 }
        ]
      },
      {
        name: "Greens 'N Ginger",
        allergens: "No Allergens",
        ingredients: [
          { name: "Lemonade", s: 10, m: 12, l: 16 },
          { name: "Ginger Puree", s: 2, m: 3, l: 4 },
          { name: "IQF Kale", s: 2, m: 2, l: 3 },
          { name: "IQF Mango", s: 1, m: 1, l: 3 },
          { name: "IQF Peaches", s: 2, m: 2, l: 2 },
          { name: "Ice", s: 1, m: 1, l: 1 }
        ]
      },
      {
        name: "Mega Mango",
        allergens: "No Allergens",
        ingredients: [
          { name: "Orange Juice", s: 4, m: 6, l: 8 },
          { name: "Pineapple Juice", s: 4, m: 6, l: 6 },
          { name: "IQF Mango", s: 3, m: 3, l: 3 },
          { name: "IQF Strawberries", s: 2, m: 2, l: 2 },
          { name: "Ice", s: 1, m: 1, l: 1 }
        ]
      },
      {
        name: "Peach Perfection",
        allergens: "No Allergens",
        ingredients: [
          { name: "Peach Juice Blend", s: 6, m: 10, l: 10 },
          { name: "Apple-Strawberry Juice Blend", s: 2, m: 2, l: 4 },
          { name: "IQF Mango", s: 2, m: 2, l: 2 },
          { name: "IQF Peaches", s: 2, m: 2, l: 2 },
          { name: "IQF Strawberries", s: 1, m: 1, l: 1 },
          { name: "Ice", s: 1, m: 1, l: 1 }
        ]
      },
      {
        name: "Pomegranate Paradise",
        allergens: "No Allergens",
        ingredients: [
          { name: "Pomegranate Juice Blend", s: 6, m: 12, l: 14 },
          { name: "IQF Strawberries", s: 2, m: 2, l: 2 },
          { name: "IQF Mango", s: 2, m: 2, l: 2 },
          { name: "IQF Peaches", s: 1, m: 1, l: 1 },
          { name: "Ice", s: 1, m: 1, l: 1 }
        ]
      },
      {
        name: "Smooth Talkin' Mango",
        allergens: "No Allergens",
        ingredients: [
          { name: "Oatmilk", s: 8, m: 12, l: 14 },
          { name: "IQF Mango", s: 4, m: 4, l: 4 },
          { name: "IQF Pineapple", s: 2, m: 2, l: 2 },
          { name: "Agave Drizzle", s: 0.5, m: 0.5, l: 0.5 }
        ]
      },
      {
        name: "Strawberry Whirl",
        allergens: "No Allergens",
        ingredients: [
          { name: "Apple-Strawberry Juice Blend", s: 8, m: 12, l: 14 },
          { name: "IQF Strawberries", s: 3, m: 3, l: 3 },
          { name: "IQF Bananas", s: 2, m: 2, l: 2 },
          { name: "Ice", s: 1, m: 1, l: 1 }
        ]
      },
      {
        name: "Vanilla Blue Sky",
        allergens: "Dairy + Soy Allergen",
        ingredients: [
          { name: "Almondmilk", s: 5, m: 6, l: 7 },
          { name: "Vanilla Coconutmilk", s: 4, m: 6, l: 7 },
          { name: "Blue Spirulina", s: 1, m: 2, l: 2 },
          { name: "IQF Pineapple", s: 3, m: 3, l: 5 },
          { name: "IQF Bananas", s: 3, m: 3, l: 3 }
        ]
      }
    ]
  },
  "whirld": {
    name: "Whirl'd Famous",
    smoothies: [
      {
        name: "Aloha Pineapple",
        allergens: "Dairy Allergen",
        ingredients: [
          { name: "Pineapple Juice", s: 8, m: 10, l: 14 },
          { name: "Greek Yogurt", s: 1, m: 1, l: 2 },
          { name: "Pineapple Hardpack", s: 2, m: 2, l: 1 },
          { name: "IQF Strawberries", s: 2, m: 2, l: 1 },
          { name: "IQF Bananas", s: 1, m: 1, l: 1 },
          { name: "Ice", s: 1, m: 1, l: 1 }
        ]
      },
      {
        name: "Caribbean Passion",
        allergens: "Dairy Allergen",
        ingredients: [
          { name: "Passion-Mango Juice Blend", s: 9, m: 11, l: 14 },
          { name: "Orange Hardpack", s: 2, m: 2, l: 2 },
          { name: "IQF Strawberries", s: 2, m: 2, l: 1 },
          { name: "IQF Peaches", s: 1, m: 1, l: 1 },
          { name: "Ice", s: 1, m: 1, l: 1 }
        ]
      },
      {
        name: "Mango-A-Go-Go",
        allergens: "Dairy Allergen",
        ingredients: [
          { name: "Passion-Mango Juice Blend", s: 9, m: 11, l: 15 },
          { name: "Pineapple Hardpack", s: 2, m: 2, l: 2 },
          { name: "IQF Mango", s: 3, m: 3, l: 3 },
          { name: "Ice", s: 1, m: 1, l: 1 }
        ]
      },
      {
        name: "Orange Dream Machine",
        allergens: "No Allergens",
        ingredients: [
          { name: "Orange Juice", s: 4, m: 6, l: 7 },
          { name: "Soymilk", s: 4, m: 4, l: 6 },
          { name: "Orange Hardpack", s: 3, m: 3, l: 2 },
          { name: "Frozen Yogurt", s: 2, m: 1, l: 1 },
          { name: "Ice", s: 1, m: 1, l: 1 }
        ]
      },
      {
        name: "PB Chocolate Love",
        allergens: "Dairy Allergen",
        ingredients: [
          { name: "2% Milk", s: 8, m: 10, l: 12 },
          { name: "Peanut Butter", s: 1, m: 2, l: 3 },
          { name: "Moo'd Powder", s: 2, m: 3, l: 3 },
          { name: "IQF Bananas", s: 3, m: 3, l: 3 },
          { name: "Ice", s: 2, m: 3, l: 5 }
        ]
      },
      {
        name: "Peanut Butter Moo'd",
        allergens: "Dairy Allergen",
        ingredients: [
          { name: "2% Milk", s: 2, m: 4, l: 4 },
          { name: "Soymilk", s: 4, m: 4, l: 6 },
          { name: "Peanut Butter", s: 1, m: 2, l: 3 },
          { name: "Moo'd Powder", s: 1, m: 2, l: 2 },
          { name: "Frozen Yogurt", s: 4, m: 4, l: 4 },
          { name: "IQF Bananas", s: 1, m: 1, l: 1 },
          { name: "Ice", s: 1, m: 1, l: 2 }
        ]
      },
      {
        name: "Razzmatazz",
        allergens: "Dairy Allergen",
        ingredients: [
          { name: "Mixed Berry Juice Blend", s: 8, m: 10, l: 14 },
          { name: "Orange Hardpack", s: 2, m: 2, l: 2 },
          { name: "IQF Strawberries", s: 2, m: 2, l: 1 },
          { name: "IQF Bananas", s: 1, m: 1, l: 1 },
          { name: "Ice", s: 1, m: 1, l: 1 }
        ]
      },
      {
        name: "Strawberries Wild",
        allergens: "Dairy Allergen",
        ingredients: [
          { name: "Apple-Strawberry Juice Blend", s: 8, m: 10, l: 14 },
          { name: "Frozen Yogurt", s: 2, m: 2, l: 1 },
          { name: "IQF Strawberries", s: 2, m: 2, l: 1 },
          { name: "IQF Bananas", s: 1, m: 1, l: 1 },
          { name: "Ice", s: 1, m: 1, l: 1 }
        ]
      },
      {
        name: "Strawberry Surf Rider",
        allergens: "Dairy Allergen",
        ingredients: [
          { name: "Lemonade", s: 9, m: 12, l: 15 },
          { name: "Lime Hardpack", s: 2, m: 2, l: 1 },
          { name: "IQF Strawberries", s: 2, m: 2, l: 1 },
          { name: "IQF Peaches", s: 1, m: 1, l: 1 },
          { name: "Ice", s: 1, m: 1, l: 1 }
        ]
      },
      {
        name: "White Gummi",
        allergens: "No Allergens",
        ingredients: [
          { name: "Peach Juice Blend", s: 4, m: 6, l: 8 },
          { name: "Soymilk", s: 2, m: 2, l: 4 },
          { name: "Pineapple Hardpack", s: 2, m: 2, l: 2 },
          { name: "Lime Hardpack", s: 1, m: 1, l: 2 },
          { name: "Orange Hardpack", s: 1, m: 1, l: 1 },
          { name: "Raspberry Hardpack", s: 1, m: 1, l: 1 },
          { name: "IQF Mango", s: 1, m: 1, l: 1 },
          { name: "Ice", s: 1, m: 2, l: 2 }
        ]
      }
    ]
  }
};
