import "dotenv/config";
import { db } from "./index.js";
import { categories } from "./schema.js";

// ── Categories ───────────────────────────────────────────────────────
// `icon` is a keyword the client maps to a react-icon (see
// src/Logic/EventsLogic/categoryIcons.js); `color` is the accent hex.
const CATEGORIES = [
  { label: "Music", slug: "music", icon: "music", color: "#8b5cf6" },
  { label: "Technology", slug: "technology", icon: "tech", color: "#f59e0b" },
  { label: "Arts & Culture", slug: "arts-culture", icon: "arts", color: "#ec4899" },
  { label: "Sports", slug: "sports", icon: "sports", color: "#ef4444" },
  { label: "Food & Drink", slug: "food-drink", icon: "food", color: "#f97316" },
  { label: "Literature", slug: "literature", icon: "book", color: "#0ea5e9" },
  { label: "Film", slug: "film", icon: "film", color: "#6366f1" },
  { label: "Wellness", slug: "wellness", icon: "wellness", color: "#14b8a6" },
  { label: "Education", slug: "education", icon: "education", color: "#3b82f6" },
  { label: "Charity", slug: "charity", icon: "charity", color: "#10b981" },
  { label: "Fashion", slug: "fashion", icon: "fashion", color: "#d946ef" },
  { label: "Kids", slug: "kids", icon: "kids", color: "#eab308" },
];

async function seed() {
  for (const c of CATEGORIES) {
    await db.insert(categories).values(c).catch(() => null); // skip on unique clash
  }
  console.log(`Seeded ${CATEGORIES.length} categories.`);
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
