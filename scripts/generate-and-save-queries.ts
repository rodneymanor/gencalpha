import { QueryDiversifier } from '../src/lib/query-diversifier';
import { saveKeywordQuery } from '../src/lib/keyword-queries';

async function main() {
  const keyword = process.argv[2] || 'artificial intelligence';
  const diversifier = new QueryDiversifier();
  const queries = await diversifier.generateDiverseQueries(keyword, 20);

  console.log('Generated', queries.length, 'queries for', `'${keyword}'`);

  const results = [] as Array<{ id: string; generatedQuery: string }>;
  for (const q of queries) {
    const saved = await saveKeywordQuery({
      primaryKeyword: keyword,
      generatedQuery: q,
      queryType: 'auto',
    });
    results.push({ id: saved.id, generatedQuery: q });
    console.log('Saved:', saved.id, '=>', q);
  }

  console.log('\nSummary:', JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error('Error:', e?.message || e);
  process.exit(1);
});

