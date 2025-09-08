import { seedKeywordPool, rotateKeywords, getActiveKeywordsForDate, dateKey } from '../src/lib/keyword-rotation';

async function main() {
  const seed = ['ai tools', 'machine learning', 'deep learning', 'neural networks', 'artificial intelligence', 'computer vision'];
  console.log('Seeding pool with:', seed);
  await seedKeywordPool(seed);

  // Run rotation for today
  const today = dateKey();
  const r1 = await rotateKeywords({ count: 3, date: today, force: true });
  console.log('Today:', r1);

  // Run rotation for tomorrow (simulate date change)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const r2 = await rotateKeywords({ count: 3, date: tomorrow, force: true });
  console.log('Tomorrow:', r2);

  // Fetch stored daily docs
  const todaySaved = await getActiveKeywordsForDate(today);
  const tomorrowSaved = await getActiveKeywordsForDate(tomorrow);
  console.log('Saved Today Keywords:', todaySaved);
  console.log('Saved Tomorrow Keywords:', tomorrowSaved);
}

main().catch((e) => {
  console.error('Error:', e?.message || e);
  process.exit(1);
});

