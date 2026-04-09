"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LibraryPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // 1. 自分のランキング（既存機能）
      const { data } = await supabase.from('reviews').select('*').order('score', { ascending: false });
      if (data) setReviews(data);

      // 2. 今月のトレンド（新機能）
      const res = await fetch('/api/monthly-trending');
      const trendData = await res.json();
      if (Array.isArray(trendData)) setTrending(trendData);
      
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-orange-500 font-black animate-pulse italic">DIGGING...</div>;

  return (
    <main className="min-h-screen bg-[#121212] text-white p-6 md:p-12 font-sans overflow-x-hidden text-left">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-2xl font-black italic text-orange-500 uppercase tracking-tighter">MY DIGS.</h1>
          <Link href="/review" className="bg-orange-500 text-black px-6 py-2 rounded-full font-black italic text-xs hover:scale-105 transition-all">SEARCH ALBUM</Link>
        </header>

        {/* --- 1. 既存のランキング（ここがメイン） --- */}
        <section className="mb-24">
          <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] mb-8 pb-4 border-b border-gray-900">Your Rankings</h2>
          {reviews.length > 0 ? (
            <div className="grid gap-4">
              {reviews.map((rev, i) => (
                <Link key={rev.id} href={`/review/${rev.id}`} className="flex items-center bg-[#1e1e1e] p-4 rounded-3xl border border-gray-800 hover:border-orange-500/50 transition-all">
                   {/* ...あなたの既存のランキング行のデザイン... */}
                   <span className="text-2xl font-black italic text-orange-500/20 mr-4">#{i+1}</span>
                   <img src={rev.image} className="w-12 h-12 rounded-lg mr-4" alt="" />
                   <div className="flex-1 truncate">
                     <p className="font-black uppercase italic truncate">{rev.title}</p>
                     <p className="text-[8px] text-gray-500 font-bold">{rev.artist}</p>
                   </div>
                   <div className="text-xl font-black text-orange-500 ml-4">{rev.score.toFixed(1)}</div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-700 italic font-bold">No digs yet. Start by searching.</p>
          )}
        </section>

        {/* --- 2. 新規：HOT DIGS (トレンド) --- */}
        {trending.length > 0 && (
          <section className="mb-20">
            <header className="flex items-end gap-4 mb-8">
              <h2 className="text-4xl font-black italic text-orange-500 uppercase tracking-tighter leading-none">HOT DIGS.</h2>
              <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1 italic">World Trending Now</p>
            </header>

            <div className="flex overflow-x-auto gap-6 pb-8 scrollbar-hide snap-x">
              {trending.map((album) => (
                <Link key={album.id} href={`/review?id=${album.id}`} className="flex-none w-40 md:w-48 group snap-start">
                  <div className="relative aspect-square mb-4 overflow-hidden rounded-[2rem] border border-gray-800 group-hover:border-orange-500 transition-all duration-500 shadow-2xl">
                    <img src={album.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <h3 className="text-[10px] font-black italic uppercase truncate mb-1 group-hover:text-orange-500 transition-colors">{album.name}</h3>
                  <p className="text-[8px] text-gray-600 font-bold uppercase truncate">{album.artist}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}