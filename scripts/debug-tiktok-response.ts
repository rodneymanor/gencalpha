import { searchTikTok } from '../src/lib/tiktok/search';

async function main() {
  const keyword = 'Artificial intelligence tips';
  const resp = await searchTikTok(keyword, 0, 0);
  const items = (resp.data || []).map((d: any) => d.item).filter(Boolean);
  console.log('items:', items.length);
  for (const it of items.slice(0, 5)) {
    console.log({ id: it.id, createTime: it.createTime, duration: it?.video?.duration, stats: it.stats });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

