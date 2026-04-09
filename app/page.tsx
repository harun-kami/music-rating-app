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
      // 1. RECENT COLLECTION
      const { data: recent } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (recent) setRecentReviews(recent);

      // 2. THE GRAILS / TOP 10
      const { data: grails } = await supabase
        .from('reviews')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
      if (grails) setTopGrails(grails);

      // 3. HOT DIGS
      try {
        const res = await fetch('/api/monthly-trending');
        const trendData = await res.json();
        if (Array.isArray(trendData)) setTrending(trendData);
      } catch (e) { console.error(e); }
      
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-[#ff5c00] font-black tracking-[0.3em] animate-pulse italic">DIGGING...</div>;

  return (
    <main className="min-h-screen bg-[#121212] text-white p-8 md:p-16 font-sans overflow-x-hidden text-left">
      <div className="max-w-[1600px] mx-auto">
        
        {/* --- GLOBAL HEADER --- */}
        <header className="flex justify-between items-start mb-24">
          <div>
            <h1 className="text-5xl font-black italic text-[#ff5c00] uppercase tracking-tighter leading-none mb-2">MY DIGS.</h1>
            <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em]">Micro Archive // 2026</p>
          </div>
          <Link href="/review" className="bg-[#ff5c00] text-black px-10 py-4 rounded-full font-black italic text-xs hover:scale-105 transition-all uppercase shadow-[0_0_30px_rgba(255,92,0,0.3)]">
            + NEW DIG
          </Link>
        </header>

        {/* --- 1. RECENT COLLECTION (画像1枚目を再現) --- */}
        <section className="mb-32">
          <header className="flex items-center gap-4 mb-12">
            <div className="w-1.5 h-6 bg-[#ff5c00]"></div>
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] italic">Recent Collection</h2>
          </header>
          
          <div className="flex overflow-x-auto gap-12 scrollbar-hide snap-x">
            {recentReviews.map((rev) => (
              <Link key={rev.id} href={`/review/${rev.id}`} className="flex-none w-52 group snap-start">
                <div className="aspect-square mb-8 overflow-hidden rounded-[1.5rem] border border-gray-900 transition-all duration-700 group-hover:border-[#ff5c00] shadow-2xl">
                  <img src={rev.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                </div>
                <h3 className="font-black italic uppercase text-[12px] leading-tight truncate mb-1">{rev.title}</h3>
                <p className="text-gray-600 text-[9px] font-black uppercase truncate mb-5 tracking-tighter">{rev.artist}</p>
                <div className="text-[48px] font-black text-[#ff5c00] italic leading-none tracking-tighter">
                  {rev.score.toFixed(1)}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* --- 2. THE GRAILS / TOP 10 (画像2枚目を再現) --- */}
        <section className="mb-32">
          <header className="flex items-center gap-4 mb-12">
            <div className="w-1.5 h-6 bg-[#ff5c00]"></div>
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] italic">The Grails / Top 10</h2>
          </header>
          
          <div className="flex overflow-x-auto gap-10 scrollbar-hide snap-x">
            {topGrails.map((rev, i) => (
              <Link key={rev.id} href={`/review/${rev.id}`} className="flex-none w-72 group snap-start relative">
                <div className="aspect-square overflow-hidden rounded-[2.8rem] border border-gray-900 transition-all duration-700 group-hover:border-[#ff5c00] shadow-2xl relative">
                  <img src={rev.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" alt="" />
                  {/* 画像内の黒丸バッジ */}
                  <div className="absolute top-6 left-6 w-14 h-14 bg-black rounded-full flex items-center justify-center border border-white/5 shadow-2xl">
                    <span className="text-[14px] font-black italic">#{i + 1}</span>
                  </div>
                  {/* 右下の小さなスコア表示 */}
                  <div className="absolute bottom-6 right-6 bg-[#ff5c00] text-black text-[10px] font-black px-2 py-1 rounded-md italic">
                    {rev.score.toFixed(1)}
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className={`font-black italic uppercase text-[13px] truncate mb-1 ${i === 0 ? 'text-[#ff5c00]' : ''}`}>
                    {rev.title}
                  </h3>
                  <p className="text-gray-700 text-[10px] font-black uppercase tracking-widest">{rev.artist}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* --- 3. HOT DIGS (あなたのトーンを完全に継承した新設枠) --- */}
        {trending.length > 0 && (
          <section className="mb-20">
            <header className="flex items-center gap-4 mb-12">
              <div className="w-1.5 h-6 bg-[#ff5c00]"></div>
              <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] italic">Hot Digs / Trending</h2>
            </header>
            
            <div className="flex overflow-x-auto gap-12 scrollbar-hide snap-x">
              {trending.map((album) => (
                <Link key={album.id} href={`/review?id=${album.id}`} className="flex-none w-52 group snap-start">
                  <div className="aspect-square mb-8 overflow-hidden rounded-[1.5rem] border border-gray-900 transition-all duration-700 group-hover:border-[#ff5c00] shadow-2xl">
                    <img src={album.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  </div>
                  <h3 className="font-black italic uppercase text-[12px] leading-tight truncate mb-1 group-hover:text-[#ff5c00] transition-colors">{album.name}</h3>
                  <p className="text-gray-700 text-[9px] font-black uppercase truncate tracking-[0.2em]">{album.artist}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}