"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LibraryPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 10点満点計算ロジック（既存の計算式を維持）
  const calculateScore = (ratings: any, tracks: any[]) => {
    if (!ratings || !tracks || tracks.length === 0) return "0.0";
    const rankMap: { [key: string]: number } = { "S": 5, "A": 4, "B": 3, "C": 2, "D": 1 };
    let totalPoints = 0, validTrackCount = 0;
    Object.values(ratings).forEach((rank: any) => {
      if (rank !== "-" && rankMap[rank]) {
        totalPoints += rankMap[rank];
        validTrackCount++;
      }
    });
    if (validTrackCount === 0) return "0.0";
    return ((totalPoints / (validTrackCount * 5)) * 10).toFixed(1);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // 1. 自分のランキングを取得
      const { data } = await supabase.from('reviews').select('*').order('score', { ascending: false });
      if (data) setReviews(data);

      // 2. トレンドを取得
      try {
        const res = await fetch('/api/monthly-trending');
        const trendData = await res.json();
        if (Array.isArray(trendData)) setTrending(trendData);
      } catch (e) { console.error(e); }
      
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-orange-500 font-black tracking-widest animate-pulse italic">DIGGING...</div>;

  return (
    <main className="min-h-screen bg-[#121212] text-white p-6 md:p-12 font-sans overflow-x-hidden text-left">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-16">
          <h1 className="text-xl font-black italic text-orange-500 uppercase tracking-tighter leading-none">MY DIGS.</h1>
          <Link href="/review" className="bg-orange-500 text-black px-6 py-2 rounded-full font-black italic text-[10px] hover:scale-105 transition-all uppercase">
            Search Album
          </Link>
        </header>

        {/* --- 1. あなたのオリジナルランキング（ここを元通りに修復） --- */}
        <section className="mb-24">
          <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] mb-10 pb-4 border-b border-gray-900">Your Rankings</h2>
          <div className="grid gap-6">
            {reviews.map((rev, i) => (
              <Link key={rev.id} href={`/review/${rev.id}`} className="group flex items-center bg-[#1a1a1a] p-4 rounded-3xl border border-gray-800 hover:border-orange-500/50 transition-all shadow-xl">
                {/* 番号のスタイルを ArtistPage と統一 */}
                <div className="flex-none w-14 text-4xl font-black italic text-orange-500/20 group-hover:text-orange-500 transition-colors -ml-4 mr-2 flex items-center justify-center">
                  #{i + 1}
                </div>
                <img src={rev.image} className="w-16 h-16 rounded-xl object-cover mr-6 shadow-xl flex-none border border-white/5" alt="" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-lg uppercase italic truncate group-hover:text-orange-500 transition-colors">
                    {rev.title}
                  </h3>
                  <p className="text-[10px] text-gray-600 font-bold uppercase truncate mt-1">
                    {rev.artist}
                  </p>
                </div>
                <div className="text-right ml-4 flex-none">
                  <div className="text-3xl font-black text-orange-500 italic">
                    {rev.score.toFixed(1)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* --- 2. HOT DIGS (既存のランキングの下に新設) --- */}
        {trending.length > 0 && (
          <section className="mb-20">
            <header className="flex items-end gap-4 mb-8">
              <h2 className="text-4xl font-black italic text-orange-500 uppercase tracking-tighter leading-none">HOT DIGS.</h2>
              <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1 italic">World Trending</p>
            </header>

            <div className="flex overflow-x-auto gap-6 pb-12 scrollbar-hide snap-x">
              {trending.map((album) => (
                <Link key={album.id} href={`/review?id=${album.id}`} className="flex-none w-40 md:w-48 group snap-start">
                  <div className="relative aspect-square mb-4 overflow-hidden rounded-[2rem] border border-gray-800 group-hover:border-orange-500 transition-all duration-500 shadow-2xl">
                    <img src={album.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  </div>
                  <h3 className="text-[10px] font-black italic uppercase truncate mb-1 group-hover:text-orange-500 transition-colors">{album.name}</h3>
                  <p className="text-[8px] text-gray-600 font-bold uppercase truncate tracking-widest">{album.artist}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}