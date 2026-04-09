"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LibraryPage() {
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [topGrails, setTopGrails] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // 1. 最近のコレクション（更新順）
      const { data: recent } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (recent) setRecentReviews(recent);

      // 2. THE GRAILS / TOP 10（スコア順）
      const { data: grails } = await supabase
        .from('reviews')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
      if (grails) setTopGrails(grails);

      // 3. HOT DIGS（トレンド）
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
      <div className="max-w-[1400px] mx-auto">
        
        {/* --- 1. RECENT COLLECTION (横スクロール) --- */}
        <section className="mb-24">
          <header className="flex items-center gap-3 mb-10">
            <div className="w-1 h-6 bg-orange-500"></div> {/* オレンジの垂直バー */}
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Recent Collection</h2>
          </header>
          
          <div className="flex overflow-x-auto gap-8 scrollbar-hide snap-x">
            {recentReviews.map((rev) => (
              <Link key={rev.id} href={`/review/${rev.id}`} className="flex-none w-44 group snap-start">
                <div className="aspect-square mb-6 overflow-hidden rounded-xl border border-gray-800 transition-all duration-500 group-hover:border-orange-500 shadow-2xl">
                  <img src={rev.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                </div>
                <h3 className="font-black italic uppercase text-[11px] leading-tight truncate mb-1">{rev.title}</h3>
                <p className="text-gray-600 text-[9px] font-bold uppercase truncate mb-3">{rev.artist}</p>
                <div className="text-4xl font-black text-orange-500 italic leading-none">
                  {rev.score.toFixed(1)}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* --- 2. THE GRAILS / TOP 10 --- */}
        <section className="mb-24">
          <header className="flex items-center gap-3 mb-10">
            <div className="w-1 h-6 bg-orange-500"></div>
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">The Grails / Top 10</h2>
          </header>
          
          <div className="flex overflow-x-auto gap-8 scrollbar-hide snap-x">
            {topGrails.map((rev, i) => (
              <Link key={rev.id} href={`/review/${rev.id}`} className="flex-none w-64 group snap-start relative">
                <div className="aspect-square overflow-hidden rounded-[2.5rem] border border-gray-800 transition-all duration-500 group-hover:border-orange-500 shadow-2xl">
                  <img src={rev.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" alt="" />
                  {/* 画像内の順位バッジ */}
                  <div className="absolute top-6 left-6 w-12 h-12 bg-black rounded-full flex items-center justify-center border border-gray-800">
                    <span className="text-xs font-black italic">#{i + 1}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* --- 3. HOT DIGS (新設：あなたのスタイルを完全に継承) --- */}
        {trending.length > 0 && (
          <section className="mb-20">
            <header className="flex items-center gap-3 mb-10">
              <div className="w-1 h-6 bg-orange-500"></div>
              <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Hot Digs / Trending</h2>
            </header>
            
            <div className="flex overflow-x-auto gap-8 scrollbar-hide snap-x">
              {trending.map((album) => (
                <Link key={album.id} href={`/review?id=${album.id}`} className="flex-none w-44 group snap-start">
                  <div className="aspect-square mb-6 overflow-hidden rounded-xl border border-gray-800 transition-all duration-500 group-hover:border-orange-500 shadow-2xl">
                    <img src={album.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  </div>
                  <h3 className="font-black italic uppercase text-[11px] leading-tight truncate mb-1 group-hover:text-orange-500 transition-colors">{album.name}</h3>
                  <p className="text-gray-600 text-[9px] font-bold uppercase truncate tracking-widest">{album.artist}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}