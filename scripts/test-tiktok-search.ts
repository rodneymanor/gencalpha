import { pickSmallest540PerItem, searchTikTok } from '../src/lib/tiktok/search';

async function main() {
  const keyword = 'Artificial intelligence tips';
  const resp = await searchTikTok(keyword, 0, 0);
  const videos = pickSmallest540PerItem(resp);
  console.log(JSON.stringify({ keyword, count: videos.length, sample: videos.slice(0, 3) }, null, 2));
}

main().catch((e) => {
  console.error('Error:', e?.message || e);
  process.exit(1);
});
