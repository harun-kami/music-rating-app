"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // TypeScriptのエラーを回避するため、Refの型に | null を許容します
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const trendRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Reviews Fetch
      const { data: revData } = await supabase.from('reviews').select('*');
      setReviews(revData || []);

      // Trends Fetch
      try {
        const res = await fetch('/api/trends');
        const trendData = await res.json();
        setTrends(trendData);
      } catch (e) { 
        console.error("Trends fetch error:", e); 
      }
      
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // 引数の型を React.RefObject<HTMLDivElement | null> に変更してエラーを解消
  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      ref.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  // --- フィルタリングロジック ---
  const sortedByScore = [...reviews].sort((a, b) => b.score - a.score);
  const recentDigs = [...reviews].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  const topLPs = sortedByScore.filter(rev => !rev.title.toLowerCase().includes('ep')).slice(0, 10);
  const topEPs = sortedByScore.filter(rev => rev.title.toLowerCase().includes('ep')).slice(0, 10);

  const genres = [
    { title: "The Scene / Hip-Hop", data: sortedByScore.filter(r => r.genre?.includes('Hip Hop') || r.genre?.includes('Rap')).slice(0, 5) },
    { title: "The Scene / Rock", data: sortedByScore.filter(r => r.genre?.includes('Rock')).slice(0, 5) },
    { title: "The Scene / R&B & Soul", data: sortedByScore.filter(r => r.genre?.includes('R&B') || r.genre?.includes('Soul')).slice(0, 5) },
    { title: "The Scene / Electronic", data: sortedByScore.filter(r => r.genre?.includes('Electronic') || r.genre?.includes('Dance')).slice(0, 5) },
    { title: "The Scene / Domestic", data: sortedByScore.filter(r => r.genre?.includes('J-Pop') || r.genre?.includes('Japanese')).slice(0, 5) }
  ];

  if (isLoading) return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="text-orange-500 font-black tracking-[0.3em] animate-pulse italic">SYNCING ARCHIVE...</div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#121212] text-white p-4 md:p-8 font-sans overflow-x-hidden text-left">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-12">
          <div className="text-left">
            <h1 className="text-2xl font-black italic tracking-tighter text-orange-500 uppercase leading-none">MY DIGS.</h1>
            <p className="text-[7px] text-gray-600 font-bold uppercase tracking-[0.3em] mt-1">Micro Archive // 2026</p>
          </div>
          <Link href="/review" className="bg-orange-500 hover:bg-white text-black px-4 py-2 rounded-xl font-black text-[10px] transition-all">+ NEW DIG</Link>
        </header>

        {reviews.length === 0 && trends.length === 0 ? (
          <div className="border-2 border-dashed border-gray-800 rounded-[3rem] p-20 text-center">
            <p className="text-gray-600 font-black uppercase italic mb-6">Your archive is empty.</p>
            <Link href="/review" className="text-orange-500 font-black uppercase text-xs underline underline-offset-8">Start Digging</Link>
          </div>
        ) : (
          <div className="space-y-32">
            
            {/* 1. Recent Collection */}
            <section className="relative">
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-[10px] font-black border-l-2 border-orange-500 pl-3 uppercase tracking-[0.2em] text-gray-500">Recent Collection</h2>
                <div className="flex gap-2">
                  <button onClick={() => scroll(carouselRef, 'left')} className="p-2 bg-[#1a1a1a] rounded-full hover:bg-orange-500 hover:text-black text-xs">←</button>
                  <button onClick={() => scroll(carouselRef, 'right')} className="p-2 bg-[#1a1a1a] rounded-full hover:bg-orange-500 hover:text-black text-xs">→</button>
                </div>
              </div>
              <div ref={carouselRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                {recentDigs.map((rev) => (
                  <div key={rev.id} className="flex-none w-[140px] group text-left">
                    <Link href={`/review/${rev.id}`}>
                      <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-900 border border-white/5 group-hover:border-orange-500/50 transition-all">
                        <img src={rev.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      </div>
                    </Link>
                    <h3 className="font-bold text-[9px] uppercase italic truncate mb-0.5">{rev.title}</h3>
                    <p className="text-[8px] text-gray-600 font-bold uppercase truncate">{rev.artist}</p>
                    <span className="text-lg font-black text-orange-500 italic">{rev.score.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. LPs Ranking */}
            <RankingSection title="The Grails / LPs" data={topLPs} />

            {/* 3. EPs Ranking */}
            <RankingSection title="Short Archive / EPs" data={topEPs} />

            {/* 4. New Release (Trends) */}
            <section className="relative">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-[10px] font-black border-l-2 border-orange-500 pl-3 uppercase tracking-[0.2em] text-gray-500 leading-none mb-1">New Release</h2>
                  <p className="text-[6px] text-gray-700 font-bold uppercase ml-3">iTunes Trending Now</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => scroll(trendRef, 'left')} className="p-2 bg-[#1a1a1a] rounded-full hover:bg-orange-500 hover:text-black text-xs">←</button>
                  <button onClick={() => scroll(trendRef, 'right')} className="p-2 bg-[#1a1a1a] rounded-full hover:bg-orange-500 hover:text-black text-xs">→</button>
                </div>
              </div>
              <div ref={trendRef} className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
                {trends.map((album) => (
                  <Link href={`/review?id=${album.id}`} key={album.id} className="flex-none w-[180px] group">
                    <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-900 border border-gray-800 group-hover:border-orange-500 transition-all shadow-2xl relative">
                      <img src={album.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-[7px] text-orange-500 font-black italic uppercase leading-none mb-1">New Entry</p>
                        <h3 className="font-black text-[10px] uppercase italic truncate leading-none">{album.name}</h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* 5. Genre Ranking (Top 5) */}
            <div className="space-y-24">
              {genres.map((g, idx) => (
                <RankingSection key={idx} title={g.title} data={g.data} />
              ))}
            </div>

          </div>
        )}

        {/* FOOTER */}
        <footer className="mt-20 border-t border-gray-900 pt-10 flex gap-12 text-left opacity-50">
          <div>
            <div className="text-3xl font-black text-white">{reviews.length}</div>
            <div className="text-[8px] text-gray-600 uppercase font-bold tracking-[0.2em] mt-1">Total Archive</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">
              {reviews.reduce((acc, curr) => acc + (curr.tracks?.length || 0), 0)}
            </div>
            <div className="text-[8px] text-gray-600 uppercase font-bold tracking-[0.2em] mt-1">Tracks Logged</div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function RankingSection({ title, data }: { title: string, data: any[] }) {
  if (data.length === 0) return null;
  return (
    <section>
      <h2 className="text-[10px] font-black border-l-2 border-orange-500 pl-3 uppercase tracking-[0.2em] text-gray-500 mb-8 text-left">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {data.map((review, index) => (
          <Link href={`/review/${review.id}`} key={review.id} className="group relative">
            <div className="relative aspect-square mb-4 rounded-[1.5rem] overflow-hidden bg-gray-900 border border-gray-800 transition-all group-hover:border-orange-500 shadow-xl">
              <img src={review.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white w-7 h-7 flex items-center justify-center rounded-full font-black italic text-[9px] border border-white/10">
                #{index + 1}
              </div>
              <div className="absolute bottom-3 right-3 bg-orange-500 text-black font-black italic px-2 py-1 rounded-lg text-[9px] shadow-2xl translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                {review.score.toFixed(1)}
              </div>
            </div>
            <div className="px-2 text-left">
              <h3 className="font-black text-[10px] uppercase italic truncate mb-1 group-hover:text-orange-500 transition-colors">{review.title}</h3>
              <p className="text-[8px] text-gray-600 font-bold uppercase truncate">{review.artist}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}