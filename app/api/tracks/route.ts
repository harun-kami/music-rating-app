import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ tracks: [] });

  try {
    const res = await fetch(`https://itunes.apple.com/lookup?id=${id}&entity=song`);
    const data = await res.json();
    // 最初の要素はアルバム情報なので除外して曲名だけ抽出
    const tracks = data.results.slice(1).map((song: any) => song.trackName);
    return NextResponse.json({ tracks });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tracks" }, { status: 500 });
  }
}