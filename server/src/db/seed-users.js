// seed-users.js
// Run: cd server && node src/db/seed-users.js

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';

const SEED_USERS = [
  {
    name: 'Admin User',
    email: 'admin@mahotsav.com',
    password: 'password123',
    role: 'admin',
  },
  {
    name: 'Srijana Dahal',
    email: 'srijana@mahotsav.com',
    password: 'organizer123',
    role: 'organizer',
  },
];

async function seed() {
  console.log('Seeding users...\n');

  for (const u of SEED_USERS) {
    const hashed = await bcrypt.hash(u.password, 10);

    const [result] = await db
      .insert(users)
      .values({
        name: u.name,
        email: u.email,
        password: hashed,
        role: u.role,
      })
      .catch((err) => {
        console.log(`  ✗ ${u.email} — ${err.code === 'ER_DUP_ENTRY' ? 'Already exists' : err.message}`);
        return [];
      });

    if (result?.insertId) {
      console.log(`  ✓ ${u.name} <${u.email}> — ${u.role} (password: ${u.password})`);
    }
  }

  console.log('\nDone.');
  process.exit(0);
}

seed();
