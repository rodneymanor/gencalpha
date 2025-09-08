import { saveKeywordQuery } from '../src/lib/keyword-queries';

async function main() {
  const doc = await saveKeywordQuery({
    primaryKeyword: 'artificial intelligence',
    generatedQuery: 'artificial intelligence tutorial 2025 trending',
    queryType: 'tutorial',
    performanceScore: 0.875,
    timesUsed: 15,
  });
  console.log('Saved keyword query:', JSON.stringify(doc, null, 2));
}

main().catch((e) => {
  console.error('Error:', e?.message || e);
  process.exit(1);
});

