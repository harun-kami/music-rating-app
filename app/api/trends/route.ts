import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // iTunesのトップアルバムチャート（日本）を取得
    const res = await fetch(
      `https://itunes.apple.com/jp/rss/topalbums/limit=50/json`,
      { next: { revalidate: 3600 } } // 1時間ごとにキャッシュを更新
    );
    
    if (!res.ok) throw new Error('iTunes API response was not ok');
    
    const data = await res.json();
    const entries = data.feed.entry || [];

    // エントリーの中から上位10件を整形して抽出
    const trendingAlbums = entries.slice(0, 10).map((entry: any) => ({
      id: entry.id.attributes['im:id'],
      name: entry['im:name'].label,
      artist: entry['im:artist'].label,
      image: entry['im:image'][2].label.replace('100x100bb', '600x600bb'),
      releaseDate: entry['im:releaseDate'].label,
    }));

    return NextResponse.json(trendingAlbums);
  } catch (error) {
    console.error("Trends API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 });
  }
}