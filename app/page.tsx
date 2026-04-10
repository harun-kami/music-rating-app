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

  // ドロップダウンの状態
  const [formatOpen, setFormatOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);

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
  
  // LP（タイトルに EP を含まない）と EP（含む）の切り分け
  const topLPs = sortedByScore.filter(rev => !rev.title.toLowerCase().includes('ep')).slice(0, 10);
  const topEPs = sortedByScore.filter(rev => rev.title.toLowerCase().includes('ep')).slice(0, 10);

  // ジャンル別ランキング（すべてから EP を除外）
  const nonEPReviews = sortedByScore.filter(rev => !rev.title.toLowerCase().includes('ep'));

  const genres = [
    { 
      title: "Hip-Hop", 
      data: nonEPReviews.filter(r => (r.genre?.includes('Hip Hop') || r.genre?.includes('Rap')) && !r.genre?.includes('J-')).slice(0, 5) 
    },
    { 
      title: "Rock", 
      data: nonEPReviews.filter(r => r.genre?.includes('Rock') && !r.genre?.includes('J-')).slice(0, 5) 
    },
    { 
      title: "R&B & Soul", 
      data: nonEPReviews.filter(r => r.genre?.includes('R&B') || r.genre?.includes('Soul')).slice(0, 5) 
    },
    { 
      title: "Electronic", 
      data: nonEPReviews.filter(r => r.genre?.includes('Electronic') || r.genre?.includes('Dance')).slice(0, 5) 
    },
    { title: "J-Hip Hop", data: sortedByScore.filter(r => r.genre === 'J-Hip Hop').slice(0, 5) },
    { title: "J-Rock", data: sortedByScore.filter(r => r.genre === 'J-Rock').slice(0, 5) },
    { title: "J-Pop", data: sortedByScore.filter(r => r.genre === 'J-Pop').slice(0, 5) }
  ];

  if (isLoading) return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="text-orange-500 font-black tracking-[0.3em] animate-pulse italic">SYNCING ARCHIVE...</div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#121212] text-white p-4 md:p-8 font-sans overflow-x-hidden text-left relative pt-24 md:pt-8">
      <div className="max-w-6xl mx-auto space-y-24 md:space-y-32">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-12 relative z-50">
          <div className="text-left">
            <h1 className="text-xl md:text-2xl font-black italic tracking-tighter text-orange-500 uppercase leading-none">MY DIGS.</h1>
            <p className="text-[7px] text-gray-600 font-bold uppercase tracking-[0.3em] mt-1">Micro Archive // 2026</p>
          </div>
          <div className="flex gap-2 md:gap-4">
            <Link href="/ranking" className="flex border border-gray-800 hover:border-orange-500 text-gray-500 hover:text-orange-500 px-3 md:px-4 py-2 rounded-xl font-black text-[8px] md:text-[9px] transition-all items-center italic uppercase tracking-widest leading-none">Ranking</Link>
            <Link href="/review" className="bg-orange-500 hover:bg-white text-black px-3 md:px-4 py-2 rounded-xl font-black text-[8px] md:text-[10px] transition-all leading-none">+ NEW</Link>
          </div>
        </header>

        {reviews.length === 0 && trends.length === 0 ? (
          <div className="border-2 border-dashed border-gray-800 rounded-[3rem] p-20 text-center">
            <p className="text-gray-600 font-black uppercase italic mb-6">Your archive is empty.</p>
            <Link href="/review" className="text-orange-500 font-black uppercase text-xs underline underline-offset-8">Start Digging</Link>
          </div>
        ) : (
          <>
            {/* 一枚目の画像の「BULLY TRACKLIST」の位置。ヘッダー直下に移動。 */}
            <div className="relative pt-12 md:pt-0">
                <Link href="/ranking" className="group flex md:hidden items-center gap-4 bg-[#1a1a1a] border border-gray-800 hover:border-orange-500 p-4 rounded-2xl transition-all shadow-2xl relative">
                    <div className="text-left flex-1 min-w-0">
                        <p className="text-[6px] text-gray-600 font-black uppercase tracking-widest leading-none mb-1">Archive Stats</p>
                        <p className="text-[10px] text-white font-black uppercase italic tracking-tighter group-hover:text-orange-500 transition-colors">View Detailed Ranking →</p>
                    </div>
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-black text-lg flex-none leading-none">📊</div>
                </Link>
            </div>

            {/* 1. Recent Collection */}
            <section className="relative">
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-[10px] font-black border-l-2 border-orange-500 pl-3 uppercase tracking-[0.2em] text-gray-500">Recent Collection</h2>
                <div className="flex gap-2 relative z-10">
                  <button onClick={() => scroll(carouselRef, 'left')} className="p-2 bg-[#1a1a1a] rounded-full hover:bg-orange-500 hover:text-black text-xs">←</button>
                  <button onClick={() => scroll(carouselRef, 'right')} className="p-2 bg-[#1a1a1a] rounded-full hover:bg-orange-500 hover:text-black text-xs">→</button>
                </div>
              </div>
              <div ref={carouselRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-4 relative z-0">
                {recentDigs.map((rev) => (
                  <div key={rev.id} className="flex-none w-[130px] md:w-[140px] group text-left">
                    <Link href={`/review/${rev.id}`}>
                      <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-900 border border-white/5 group-hover:border-orange-500/50 transition-all">
                        <img src={rev.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      </div>
                    </Link>
                    <h3 className="font-bold text-[9px] uppercase italic truncate mb-0.5">{rev.title}</h3>
                    <Link href={`/artist/${rev.artist_id}`} className="text-[8px] text-gray-600 hover:text-orange-500 font-bold uppercase truncate mb-1 transition-colors block leading-none">
                      {rev.artist}
                    </Link>
                    <span className="text-lg font-black text-orange-500 italic leadling-none">{rev.score.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* --- RANKING BANNER (PC表示でのみ、以前の位置に表示) --- */}
            <div className="flex justify-end -mb-24 relative hidden md:flex">
              <Link href="/ranking" className="group flex items-center gap-4 bg-[#1a1a1a] border border-gray-800 hover:border-orange-500 p-4 rounded-2xl transition-all shadow-2xl relative z-10">
                <div className="text-right flex-1 min-w-0">
                  <p className="text-[6px] text-gray-600 font-black uppercase tracking-widest leading-none mb-1">Archive Stats</p>
                  <p className="text-[10px] text-white font-black uppercase italic tracking-tighter group-hover:text-orange-500 transition-colors">View Detailed Ranking →</p>
                </div>
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-black text-lg flex-none leading-none">📊</div>
              </Link>
            </div>

            {/* LP/EP ドロップダウン */}
            <section className="relative z-0">
              <button 
                onClick={() => setFormatOpen(!formatOpen)}
                className="w-full flex justify-between items-center bg-[#1a1a1a] border border-gray-800 p-4 rounded-xl text-left"
              >
                <h2 className="text-[10px] font-black border-l-2 border-orange-500 pl-3 uppercase tracking-[0.2em] text-gray-500">The Grails / LPs & EPs</h2>
                <span className={`text-[8px] text-gray-600 transition-transform ${formatOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              <div className={`space-y-32 transition-all duration-300 ${formatOpen ? 'pt-24 md:pt-32 opacity-100 max-h-[5000px]' : 'pt-0 opacity-0 max-h-0 overflow-hidden'}`}>
                {/* 2. LPs Ranking */}
                <RankingSection title="LPs" data={topLPs} />

                {/* 3. EPs Ranking */}
                <RankingSection title="EPs" data={topEPs} />
              </div>
            </section>

            {/* 4. New Release */}
            <section className="relative z-0">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-[10px] font-black border-l-2 border-orange-500 pl-3 uppercase tracking-[0.2em] text-gray-500 leading-none mb-1">New Release</h2>
                  <p className="text-[6px] text-gray-700 font-bold uppercase ml-3 leading-none">iTunes Trending Now</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => scroll(trendRef, 'left')} className="p-2 bg-[#1a1a1a] rounded-full hover:bg-orange-500 hover:text-black text-xs leading-none">←</button>
                  <button onClick={() => scroll(trendRef, 'right')} className="p-2 bg-[#1a1a1a] rounded-full hover:bg-orange-500 hover:text-black text-xs leading-none">→</button>
                </div>
              </div>
              <div ref={trendRef} className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-4">
                {trends.map((album) => (
                  <Link href={`/review?id=${album.id}`} key={album.id} className="flex-none w-[160px] md:w-[180px] group">
                    <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-900 border border-gray-800 group-hover:border-orange-500 transition-all shadow-2xl relative">
                      <img src={album.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-[7px] text-orange-500 font-black italic uppercase leading-none mb-1">New Entry</p>
                        <h3 className="font-black text-[9px] md:text-[10px] uppercase italic truncate leading-none">{album.name}</h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* ジャンル ドロップダウン */}
            <section className="relative z-0">
              <button 
                onClick={() => setGenreOpen(!genreOpen)}
                className="w-full flex justify-between items-center bg-[#1a1a1a] border border-gray-800 p-4 rounded-xl text-left"
              >
                <h2 className="text-[10px] font-black border-l-2 border-orange-500 pl-3 uppercase tracking-[0.2em] text-gray-500">The Scene / Genres</h2>
                <span className={`text-[8px] text-gray-600 transition-transform ${genreOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              <div className={`space-y-24 md:space-y-32 transition-all duration-300 ${genreOpen ? 'pt-24 md:pt-32 opacity-100 max-h-[10000px]' : 'pt-0 opacity-0 max-h-0 overflow-hidden'}`}>
                {genres.map((g, idx) => (
                  <RankingSection key={idx} title={g.title} data={g.data} />
                ))}
              </div>
            </section>

          </>
        )}

        {/* FOOTER */}
        <footer className="mt-20 border-t border-gray-900 pt-10 flex gap-8 md:gap-12 text-left opacity-50 relative pt-12">
          <div>
            <div className="text-2xl md:text-3xl font-black text-white">{reviews.length}</div>
            <div className="text-[7px] md:text-[8px] text-gray-600 uppercase font-bold tracking-[0.2em] mt-1 leading-none">Total Archive</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-white leading-none">
              {reviews.reduce((acc, curr) => acc + (curr.tracks?.length || 0), 0)}
            </div>
            <div className="text-[7px] md:text-[8px] text-gray-600 uppercase font-bold tracking-[0.2em] mt-1 leading-none">Tracks Logged</div>
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
        {data.map((review, index) => (
          <div key={review.id} className="group relative min-w-0">
            <Link href={`/review/${review.id}`}>
              <div className="relative aspect-square mb-3 md:mb-4 rounded-[1.2rem] md:rounded-[1.5rem] overflow-hidden bg-gray-900 border border-gray-800 transition-all group-hover:border-orange-500 shadow-xl">
                <img src={review.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-black/80 backdrop-blur-md text-white w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full font-black italic text-[8px] md:text-[9px] border border-white/10 leading-none">
                  #{index + 1}
                </div>
                <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-orange-500 text-black font-black italic px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg text-[8px] md:text-[9px] shadow-2xl transition-all leading-none">
                  {review.score.toFixed(1)}
                </div>
              </div>
              <h3 className="px-1 font-black text-[9px] md:text-[10px] uppercase italic truncate mb-0.5 group-hover:text-orange-500 transition-colors leading-tight">{review.title}</h3>
            </Link>
            <Link href={`/artist/${review.artist_id || review.artistId}`} className="px-1 text-[7px] md:text-[8px] text-gray-600 hover:text-orange-500 font-bold uppercase truncate transition-colors leading-none block">
              {review.artist}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}