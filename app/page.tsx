"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('reviews').select('*');
      if (error) {
        console.error("Error fetching reviews:", error);
      } else {
        setReviews(data || []);
      }
      setIsLoading(false);
    };
    fetchReviews();
  }, []);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  // --- ランキング・ロジック ---
  
  // 1. Recent Digs (日付順に最新)
  const recentDigs = [...reviews]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // 2. スコア順のベース
  const sortedByScore = [...reviews].sort((a, b) => b.score - a.score);

  // 3. THE GRAILS / LPs (タイトルに "EP" を含まない)
  const topLPs = sortedByScore
    .filter(rev => !rev.title.toLowerCase().includes('ep'))
    .slice(0, 10);

  // 4. SHORT ARCHIVE / EPs (タイトルに "EP" を含む)
  const topEPs = sortedByScore
    .filter(rev => rev.title.toLowerCase().includes('ep'))
    .slice(0, 10);

  // --- ジャンル別フィルター (THE SCENE シリーズ) ---

  const topHiphop = sortedByScore
    .filter(rev => rev.genre?.includes('Hip Hop') || rev.genre?.includes('Rap'))
    .slice(0, 10);

  const topRock = sortedByScore
    .filter(rev => rev.genre?.includes('Rock'))
    .slice(0, 10);

  const topRnB = sortedByScore
    .filter(rev => rev.genre?.includes('R&B') || rev.genre?.includes('Soul'))
    .slice(0, 10);

  const topElectronic = sortedByScore
    .filter(rev => rev.genre?.includes('Electronic') || rev.genre?.includes('Dance'))
    .slice(0, 10);

  const topJazz = sortedByScore
    .filter(rev => rev.genre?.includes('Jazz'))
    .slice(0, 10);

  const topPop = sortedByScore
    .filter(rev => rev.genre?.includes('Pop') && !rev.genre?.includes('J-Pop'))
    .slice(0, 10);

  const topJapanese = sortedByScore
    .filter(rev => rev.genre?.includes('J-Pop') || rev.genre?.includes('Anime') || rev.genre?.includes('Japanese'))
    .slice(0, 10);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-orange-500 font-black tracking-[0.3em] animate-pulse italic">SYNCING ARCHIVE...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#121212] text-white p-4 md:p-8 font-sans overflow-x-hidden text-left">
      <div className="max-w-6xl mx-auto">
        
        {/* --- ORIGINAL HEADER --- */}
        <header className="flex justify-between items-center mb-12">
          <div className="text-left">
            <h1 className="text-2xl font-black italic tracking-tighter text-orange-500 uppercase leading-none">MY DIGS.</h1>
            <p className="text-[7px] text-gray-600 font-bold uppercase tracking-[0.3em] mt-1">Micro Archive // 2026</p>
          </div>
          <Link href="/review" className="bg-orange-500 hover:bg-white text-black px-4 py-2 rounded-xl font-black text-[10px] transition-all">+ NEW DIG</Link>
        </header>

        {reviews.length === 0 ? (
          <div className="border-2 border-dashed border-gray-800 rounded-[3rem] p-20 text-center">
            <p className="text-gray-600 font-black uppercase italic mb-6">Your archive is empty.</p>
            <Link href="/review" className="text-orange-500 font-black uppercase text-xs underline underline-offset-8">Start Digging</Link>
          </div>
        ) : (
          <div className="space-y-32">
            
            {/* --- SECTION 1: RECENT COLLECTION --- */}
            <section className="relative">
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-[10px] font-black border-l-2 border-orange-500 pl-3 uppercase tracking-[0.2em] text-gray-500">Recent Collection</h2>
                <div className="flex gap-2">
                  <button onClick={() => scrollCarousel('left')} className="p-2 bg-[#1a1a1a] rounded-full hover:bg-orange-500 hover:text-black transition-all text-xs">←</button>
                  <button onClick={() => scrollCarousel('right')} className="p-2 bg-[#1a1a1a] rounded-full hover:bg-orange-500 hover:text-black transition-all text-xs">→</button>
                </div>
              </div>
              <div ref={carouselRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                {recentDigs.map((rev) => (
                  <div key={rev.id} className="flex-none w-[140px] group text-left">
                    <Link href={`/review/${rev.id}`}>
                      <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-900 shadow-xl relative border border-white/5 group-hover:border-orange-500/50 transition-all">
                        <img src={rev.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      </div>
                    </Link>
                    <h3 className="font-bold text-[9px] uppercase italic truncate mb-0.5">{rev.title}</h3>
                    <Link href={`/artist/${rev.artist_id}`}>
                      <p className="text-[8px] text-gray-600 hover:text-orange-500 font-bold uppercase truncate mb-1 transition-colors">
                        {rev.artist}
                      </p>
                    </Link>
                    <span className="text-lg font-black text-orange-500 italic leading-none">{rev.score.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* --- RANKING SECTIONS --- */}
            <RankingSection title="The Grails / LPs" data={topLPs} />
            <RankingSection title="Short Archive / EPs" data={topEPs} />
            
            {/* ジャンル別セクション */}
            <RankingSection title="The Scene / Hip-Hop" data={topHiphop} />
            <RankingSection title="The Scene / Rock" data={topRock} />
            <RankingSection title="The Scene / R&B & Soul" data={topRnB} />
            <RankingSection title="The Scene / Electronic" data={topElectronic} />
            <RankingSection title="The Scene / Jazz" data={topJazz} />
            <RankingSection title="The Scene / Pop" data={topPop} />
            <RankingSection title="The Scene / Domestic" data={topJapanese} />

          </div>
        )}

        <footer className="mt-20 border-t border-gray-900 pt-10 flex gap-12 text-left">
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
            <div className="relative aspect-square mb-4 rounded-[1.5rem] overflow-hidden bg-gray-900 border border-gray-800 transition-all group-hover:border-orange-500">
              <img src={review.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white w-8 h-8 flex items-center justify-center rounded-full font-black italic text-[10px] border border-white/10">
                #{index + 1}
              </div>
              <div className="absolute bottom-3 right-3 bg-orange-500 text-black font-black italic px-2 py-1 rounded-lg text-[9px] shadow-2xl translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                {review.score.toFixed(1)}
              </div>
            </div>
            <div className="px-2 text-left">
              <h3 className="font-black text-[10px] md:text-xs uppercase italic truncate mb-1 group-hover:text-orange-500 transition-colors">
                {review.title}
              </h3>
              <p className="text-[9px] text-gray-600 font-bold uppercase truncate">
                {review.artist}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}