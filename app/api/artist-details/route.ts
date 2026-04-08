import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get('id');

  if (!artistId || artistId === "undefined") {
    return NextResponse.json({ error: 'Invalid Artist ID' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://itunes.apple.com/lookup?id=${artistId}&entity=album&limit=200&lang=ja_jp`
    );
    
    if (!res.ok) throw new Error('iTunes Network Error');
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({ artist: { name: "Unknown Artist", images: [] }, albums: [] });
    }

    const artistInfo = data.results[0];
    const seenCollectionIds = new Set();
    
    const albumList = data.results.slice(1)
      .filter((item: any) => {
        const lowerName = item.collectionName?.toLowerCase() || "";
        
        // 1. iTunesが公式に「cleaned（クリーン版）」とマークしてるものは除外
        const isExplicitlyClean = item.collectionExplicitness === 'cleaned';
        
        // 2. タイトルに "Clean" と入っているものを除外（Deluxeは残る）
        const isCleanTitle = lowerName.includes('clean');
        
        // 3. 完全に同じIDの重複を避ける（iTunesのデータ重複対策）
        const isDuplicate = seenCollectionIds.has(item.collectionId);

        if (!isExplicitlyClean && !isCleanTitle && !isDuplicate) {
          seenCollectionIds.add(item.collectionId);
          return true;
        }
        return false;
      })
      .map((item: any) => ({
        id: String(item.collectionId),
        name: item.collectionName,
        images: [{ url: item.artworkUrl100?.replace('100x100bb', '600x600bb') || "" }],
        release_date: item.releaseDate,
      }))
      .sort((a: any, b: any) => 
        new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
      );

    return NextResponse.json({
      artist: {
        name: artistInfo.artistName,
        images: [{ url: albumList[0]?.images[0]?.url || "" }] 
      },
      albums: albumList
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ artist: { name: "Error", images: [] }, albums: [] }, { status: 500 });
  }
}