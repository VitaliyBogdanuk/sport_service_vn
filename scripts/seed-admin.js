/**
 * Seed default admin, sample org, team, coach.
 * Run: npm run seed-admin
 * Or enable RUN_DB_SEED=true on Vercel (runs on app boot after DB connect).
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { runSeed } from '../src/lib/runSeed.js';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-service');
  await runSeed();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
