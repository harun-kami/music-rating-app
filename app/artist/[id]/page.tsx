"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ArtistPage() {
  const { id } = useParams();
  const router = useRouter();
  const [artist, setArtist] = useState<any>(null);
  const [albums, setAlbums] = useState<any[]>([]);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArtistData = async () => {
      setIsLoading(true);

      // ログインユーザーの取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // 1. アーティスト情報とアルバム一覧をiTunesから取得
        const res = await fetch(`https://itunes.apple.com/lookup?id=${id}&entity=album&limit=50&lang=ja_jp`);
        const data = await res.json();
        
        if (data.results && data.results.length > 0) {
          setArtist(data.results[0]);
          // アルバムのみを抽出（1番目はアーティスト情報なので除外）
          setAlbums(data.results.slice(1).sort((a: any, b: any) => 
            new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
          ));
        }

        // 2. このアーティストに対して「自分が」書いたレビューのみを取得
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('*')
          .eq('artist_id', id)
          .eq('user_id', user.id); // 自分のデータのみに絞り込み

        setUserReviews(reviewData || []);
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    };

    if (id) fetchArtistData();
  }, [id, router]);

  if (isLoading) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-orange-500 font-black italic animate-pulse px-6 text-center text-xs tracking-[0.3em]">SYNCING ARTIST...</div>;
  if (!artist) return <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center font-black italic uppercase">ARTIST NOT FOUND</div>;

  return (
    <main className="min-h-screen bg-[#121212] text-white p-4 md:p-12 font-sans text-left pt-12 md:pt-8">
      <div className="max-w-6xl mx-auto space-y-12 md:space-y-20">
        
        {/* HEADER: スマホ対応 (文字サイズ調整と縦並び許可) */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 md:border-b-4 border-orange-500 pb-6 gap-4">
          <div className="space-y-2 w-full">
            <Link href="/" className="text-gray-600 hover:text-orange-500 text-[10px] font-bold uppercase transition-colors tracking-widest block mb-4">← Back to Archive</Link>
            <p className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] italic leading-none">The Artist</p>
            <h1 className="text-3xl md:text-7xl font-black italic tracking-tighter uppercase leading-none break-words min-w-0">
              {artist.artistName}
            </h1>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-6xl font-black text-gray-900 italic leading-none select-none">DIGS.</div>
          </div>
        </header>

        {/* 自分の評価済みアルバム */}
        {userReviews.length > 0 && (
          <section className="space-y-6 md:space-y-8">
            <h2 className="text-[10px] font-black border-l-2 border-orange-500 pl-3 uppercase tracking-[0.2em] text-gray-500">Your Graded Archive</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-8">
              {userReviews.map((rev) => (
                <Link href={`/review/${rev.id}`} key={rev.id} className="group">
                  <div className="relative aspect-square mb-3 rounded-xl overflow-hidden bg-gray-900 border border-gray-800 group-hover:border-orange-500 transition-all shadow-xl">
                    <img src={rev.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" alt="" />
                    <div className="absolute top-2 left-2 bg-orange-500 text-black font-black italic px-1.5 py-0.5 rounded-lg text-[8px] md:text-[10px] shadow-lg">
                      {rev.score.toFixed(1)}
                    </div>
                  </div>
                  <h3 className="font-black text-[9px] md:text-[10px] uppercase italic truncate group-hover:text-orange-500 transition-colors px-1">{rev.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ディスコグラフィ（未評価含む） */}
        <section className="space-y-6 md:space-y-8">
          <h2 className="text-[10px] font-black border-l-2 border-gray-800 pl-3 uppercase tracking-[0.2em] text-gray-500">Discography</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5 md:gap-10">
            {albums.map((album) => {
              const alreadyDigged = userReviews.some(r => String(r.id) === String(album.collectionId));
              return (
                <Link 
                  href={`/review?id=${album.collectionId}`} 
                  key={album.collectionId} 
                  className={`group relative ${alreadyDigged ? 'opacity-30 hover:opacity-100 transition-opacity' : ''}`}
                >
                  <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-900 border border-gray-800 group-hover:border-white transition-all shadow-lg">
                    <img src={album.artworkUrl100.replace('100x100bb', '600x600bb')} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt="" />
                  </div>
                  <h3 className="font-bold text-[8px] md:text-[9px] text-gray-400 uppercase italic truncate leading-tight mb-1 px-1">{album.collectionName}</h3>
                  <p className="text-[7px] text-gray-700 font-black italic uppercase px-1">{new Date(album.releaseDate).getFullYear()}</p>
                  {alreadyDigged && (
                    <div className="absolute top-2 right-2 text-[7px] font-black italic text-orange-500 bg-black/60 px-1.5 py-0.5 rounded">
                      GRADED
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

      </div>
    </main>
  );
}