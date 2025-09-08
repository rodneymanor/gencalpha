import { QueryDiversifier } from '../src/lib/query-diversifier';

async function main() {
  const diversifier = new QueryDiversifier();
  const keyword = 'artificial intelligence';
  const queries = await diversifier.generateDiverseQueries(keyword, 20);

  // Output results
  console.log('Keyword:', keyword);
  console.log('Generated queries (count =', queries.length + '):');
  queries.forEach((q, i) => console.log(String(i + 1).padStart(2, '0') + '.', q));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

