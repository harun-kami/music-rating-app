"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const trendRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { data: revData } = await supabase.from('reviews').select('*');
      setReviews(revData || []);

      try {
        const res = await fetch('/api/trends');
        const trendData = await res.json();
        setTrends(trendData);
      } catch (e) { console.error(e); }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      ref.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  const sortedByScore = [...reviews].sort((a, b) => b.score - a.score);
  const recentDigs = [...reviews].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  const topLPs = sortedByScore.filter(rev => !rev.title.toLowerCase().includes('ep')).slice(0, 10);
  const topEPs = sortedByScore.filter(rev => rev.title.toLowerCase().includes('ep')).slice(0, 10);

  const genreFilteredLPs = sortedByScore.filter(rev => {
    const lowerTitle = rev.title.toLowerCase();
    return !lowerTitle.endsWith('-ep') && !lowerTitle.endsWith(' - ep');
  });

  const genres = [
    { title: "The Scene / Hip-Hop", data: genreFilteredLPs.filter(r => (r.genre?.includes('Hip Hop') || r.genre?.includes('Rap')) && !r.genre?.includes('J-')).slice(0, 5) },
    { title: "The Scene / Rock", data: genreFilteredLPs.filter(r => r.genre?.includes('Rock') && !r.genre?.includes('J-')).slice(0, 5) },
    { title: "The Scene / R&B & Soul", data: genreFilteredLPs.filter(r => r.genre?.includes('R&B') || r.genre?.includes('Soul')).slice(0, 5) },
    { title: "The Scene / Electronic", data: genreFilteredLPs.filter(r => r.genre?.includes('Electronic') || r.genre?.includes('Dance')).slice(0, 5) },
    { title: "The Scene / J-Hip Hop", data: genreFilteredLPs.filter(r => r.genre === 'J-Hip Hop').slice(0, 5) },
    { title: "The Scene / J-Rock", data: genreFilteredLPs.filter(r => r.genre === 'J-Rock').slice(0, 5) },
    { title: "The Scene / J-Pop", data: genreFilteredLPs.filter(r => r.genre === 'J-Pop').slice(0, 5) }
  ];

  if (isLoading) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-orange-500 font-black italic animate-pulse">SYNCING ARCHIVE...</div>;

  return (
    <main className="min-h-screen bg-[#121212] text-white p-4 md:p-8 font-sans overflow-x-hidden text-left">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex justify-between items-center mb-12">
          <div className="text-left">
            <h1 className="text-xl md:text-2xl font-black italic tracking-tighter text-orange-500 uppercase leading-none">MY DIGS.</h1>
            <p className="text-[7px] text-gray-600 font-bold uppercase tracking-[0.3em] mt-1">Micro Archive // 2026</p>
          </div>
          <div className="flex gap-2 md:gap-4">
            <Link href="/ranking" className="flex border border-gray-800 hover:border-orange-500 text-gray-500 hover:text-orange-500 px-3 md:px-4 py-2 rounded-xl font-black text-[8px] md:text-[9px] transition-all items-center italic uppercase tracking-widest">Ranking</Link>
            <Link href="/review" className="bg-orange-500 hover:bg-white text-black px-3 md:px-4 py-2 rounded-xl font-black text-[8px] md:text-[10px] transition-all">+ NEW</Link>
          </div>
        </header>

        <div className="space-y-20 md:space-y-32">
          
          <section className="relative">
            <h2 className="text-[10px] font-black border-l-2 border-orange-500 pl-3 uppercase tracking-[0.2em] text-gray-500 mb-6">Recent Collection</h2>
            <div ref={carouselRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
              {recentDigs.map((rev) => (
                <div key={rev.id} className="flex-none w-[130px] md:w-[140px] group text-left">
                  <Link href={`/review/${rev.id}`}>
                    <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-900 border border-white/5 group-hover:border-orange-500/50 transition-all">
                      <img src={rev.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                    </div>
                  </Link>
                  <h3 className="font-bold text-[9px] uppercase italic truncate mb-0.5">{rev.title}</h3>
                  <Link href={`/artist/${rev.artist_id}`} className="text-[8px] text-gray-600 hover:text-orange-500 font-bold uppercase truncate mb-1 transition-colors block">{rev.artist}</Link>
                  <span className="text-lg font-black text-orange-500 italic leading-none">{rev.score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* --- RANKING BANNER (スマホではスタック表示) --- */}
          <div className="flex justify-center md:justify-end">
            <Link href="/ranking" className="group flex items-center gap-4 bg-[#1a1a1a] border border-gray-800 hover:border-orange-500 p-4 rounded-2xl transition-all shadow-2xl w-full md:w-auto">
              <div className="text-left md:text-right flex-1 md:flex-none">
                <p className="text-[6px] text-gray-600 font-black uppercase tracking-widest leading-none mb-1">Archive Stats</p>
                <p className="text-[10px] text-white font-black uppercase italic tracking-tighter group-hover:text-orange-500 transition-colors">View Detailed Ranking →</p>
              </div>
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-black text-lg flex-none">📊</div>
            </Link>
          </div>

          <RankingSection title="The Grails / LPs" data={topLPs} />
          <RankingSection title="Short Archive / EPs" data={topEPs} />

          <section className="relative">
            <h2 className="text-[10px] font-black border-l-2 border-orange-500 pl-3 uppercase tracking-[0.2em] text-gray-500 mb-6">New Release</h2>
            <div ref={trendRef} className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-4">
              {trends.map((album) => (
                <Link href={`/review?id=${album.id}`} key={album.id} className="flex-none w-[160px] md:w-[180px] group">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-900 border border-gray-800 group-hover:border-orange-500 transition-all shadow-2xl relative">
                    <img src={album.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-[7px] text-orange-500 font-black italic uppercase mb-1">New Entry</p>
                      <h3 className="font-black text-[9px] md:text-[10px] uppercase italic truncate leading-none">{album.name}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <div className="space-y-24 md:space-y-32">
            {genres.map((g, idx) => (
              <RankingSection key={idx} title={g.title} data={g.data} />
            ))}
          </div>

        </div>

        <footer className="mt-20 border-t border-gray-900 pt-10 flex gap-8 md:gap-12 text-left opacity-50">
          <div><div className="text-2xl md:text-3xl font-black text-white">{reviews.length}</div><div className="text-[7px] md:text-[8px] text-gray-600 uppercase font-bold tracking-[0.2em] mt-1">Total Archive</div></div>
          <div><div className="text-2xl md:text-3xl font-black text-white">{reviews.reduce((acc, curr) => acc + (curr.tracks?.length || 0), 0)}</div><div className="text-[7px] md:text-[8px] text-gray-600 uppercase font-bold tracking-[0.2em] mt-1">Tracks Logged</div></div>
        </footer>
      </div>
    </main>
  );
}

function RankingSection({ title, data }: { title: string, data: any[] }) {
  if (data.length === 0) return null;
  return (
    <section>
      <h2 className="text-[10px] font-black border-l-2 border-orange-500 pl-3 uppercase tracking-[0.2em] text-gray-500 mb-8">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
        {data.map((review, index) => (
          <div key={review.id} className="group relative min-w-0">
            <Link href={`/review/${review.id}`}>
              <div className="relative aspect-square mb-3 md:mb-4 rounded-[1.2rem] md:rounded-[1.5rem] overflow-hidden bg-gray-900 border border-gray-800 transition-all group-hover:border-orange-500 shadow-xl">
                <img src={review.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-black/80 backdrop-blur-md text-white w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full font-black italic text-[8px] md:text-[9px] border border-white/10">#{index + 1}</div>
                <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-orange-500 text-black font-black italic px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg text-[8px] md:text-[9px] shadow-2xl transition-all">{review.score.toFixed(1)}</div>
              </div>
              <h3 className="px-1 font-black text-[9px] md:text-[10px] uppercase italic truncate mb-0.5 group-hover:text-orange-500 transition-colors">{review.title}</h3>
            </Link>
            <Link href={`/artist/${review.artist_id || review.artistId}`} className="px-1 text-[7px] md:text-[8px] text-gray-600 hover:text-orange-500 font-bold uppercase truncate transition-colors leading-none block">{review.artist}</Link>
          </div>
        ))}
      </div>
    </section>
  );
}