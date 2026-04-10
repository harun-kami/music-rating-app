import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const albumId = searchParams.get('id');

  if (!albumId) return NextResponse.json({ error: 'No Album ID' }, { status: 400 });

  try {
    // entity=song をつけることで、アルバム情報 + 曲目リストが一度に取れます
    const res = await fetch(
      `https://itunes.apple.com/lookup?id=${albumId}&entity=song&lang=ja_jp`
    );
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    // 1番目のデータがアルバム本体、2番目以降が曲のリスト
    const albumInfo = data.results[0];
    const trackList = data.results.slice(1).map((track: any) => track.trackName);

    return NextResponse.json({
      id: String(albumInfo.collectionId),
      name: albumInfo.collectionName,
      artistName: albumInfo.artistName,
      artistId: String(albumInfo.artistId),
      image: albumInfo.artworkUrl100.replace('100x100bb', '600x600bb'),
      tracks: trackList,
      genre: albumInfo.primaryGenreName, // ← これを追加
      release_year: albumInfo.releaseDate ? albumInfo.releaseDate.substring(0, 4) : "Unknown"
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}