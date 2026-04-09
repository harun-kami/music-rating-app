import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // iTunesのトップアルバムチャート（日本）を取得
    const res = await fetch(
      `https://itunes.apple.com/jp/rss/topalbums/limit=50/json`
    );
    const data = await res.json();
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // エントリーの中から、今月リリースのもの、もしくは売れているものから上位10件を抽出
    const entries = data.feed.entry || [];
    const trendingAlbums = entries
      .map((entry: any) => ({
        id: entry.id.attributes['im:id'],
        name: entry['im:name'].label,
        artist: entry['im:artist'].label,
        image: entry['im:image'][2].label.replace('100x100bb', '600x600bb'),
        releaseDate: entry['im:releaseDate'].label,
      }))
      .slice(0, 10); // 上位10個に絞る

    return NextResponse.json(trendingAlbums);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 });
  }
}