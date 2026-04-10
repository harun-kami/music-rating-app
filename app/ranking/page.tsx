"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function RankingPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // フィルター用ステート
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [selectedGenre, setSelectedGenre] = useState<string>("ALL");

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      const { data } = await supabase.from('reviews').select('*').order('score', { ascending: false });
      setReviews(data || []);
      setFilteredReviews(data || []);
      setIsLoading(false);
    };
    fetchAll();
  }, []);

  // フィルター処理
  useEffect(() => {
    let result = [...reviews];
    if (selectedYear !== "ALL") {
      result = result.filter(r => r.release_year === selectedYear);
    }
    if (selectedGenre !== "ALL") {
      result = result.filter(r => r.genre === selectedGenre);
    }
    setFilteredReviews(result);
  }, [selectedYear, selectedGenre, reviews]);

  // フィルターの選択肢をデータから自動生成
  const years = ["ALL", ...Array.from(new Set(reviews.map(r => r.release_year).filter(Boolean))).sort().reverse()];
  const genres = ["ALL", ...Array.from(new Set(reviews.map(r => r.genre).filter(Boolean))).sort()];

  if (isLoading) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-orange-500 font-black italic animate-pulse">SYNCING RANKING...</div>;

  return (
    <main className="min-h-screen bg-[#121212] text-white p-4 md:p-12 font-sans overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-16">
          <Link href="/" className="text-gray-500 hover:text-orange-500 text-xs font-bold uppercase transition-colors">← Back to Library</Link>
          <div className="text-right">
            <h1 className="text-3xl font-black italic tracking-tighter text-orange-500 uppercase leading-none">DETAIL RANKING.</h1>
            <p className="text-[7px] text-gray-600 font-bold uppercase tracking-[0.3em] mt-1">Sorted by score // {filteredReviews.length} items</p>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-12">
          
          {/* LEFT SIDEBAR: FILTERS */}
          <aside className="w-full md:w-48 space-y-10 flex-none">
            <div>
              <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4 italic">Release Year</h3>
              <div className="flex flex-wrap md:flex-col gap-2">
                {years.map(year => (
                  <button 
                    key={year} 
                    onClick={() => setSelectedYear(year)}
                    className={`text-left text-[11px] font-black uppercase italic transition-all ${selectedYear === year ? 'text-white border-l-2 border-orange-500 pl-3' : 'text-gray-700 hover:text-gray-400 pl-0'}`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4 italic">Genre</h3>
              <div className="flex flex-wrap md:flex-col gap-2">
                {genres.map(genre => (
                  <button 
                    key={genre} 
                    onClick={() => setSelectedGenre(genre)}
                    className={`text-left text-[11px] font-black uppercase italic transition-all ${selectedGenre === genre ? 'text-white border-l-2 border-orange-500 pl-3' : 'text-gray-700 hover:text-gray-400 pl-0'}`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* RIGHT CONTENT: VERTICAL RANKING LIST */}
          <div className="flex-1 space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-gray-900 rounded-[2rem]">
                <p className="text-gray-700 font-black italic uppercase text-xs">No digs matched your filter.</p>
              </div>
            ) : (
              filteredReviews.map((rev, index) => (
                <Link 
                  href={`/review/${rev.id}`} 
                  key={rev.id}
                  className="group flex items-center bg-[#1a1a1a] rounded-2xl p-4 border border-gray-800 hover:border-orange-500 transition-all gap-6 shadow-2xl"
                >
                  {/* RANK NUMBER */}
                  <div className="text-3xl md:text-5xl font-black italic text-gray-800 group-hover:text-orange-500 transition-colors w-12 md:w-20 flex-none text-center">
                    #{index + 1}
                  </div>

                  {/* ALBUM ART */}
                  <img src={rev.image} className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover shadow-xl flex-none border border-white/5" alt="" />

                  {/* INFO */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-sm md:text-xl uppercase italic truncate leading-tight group-hover:text-orange-500 transition-colors">{rev.title}</h3>
                    <div className="flex gap-4 items-center mt-1">
                      <p className="text-[10px] text-gray-600 font-bold uppercase truncate">{rev.artist}</p>
                      <span className="text-[8px] bg-gray-900 text-gray-500 px-2 py-0.5 rounded italic font-black">{rev.release_year}</span>
                    </div>
                  </div>

                  {/* SCORE */}
                  <div className="text-right flex-none">
                    <div className="text-2xl md:text-4xl font-black text-orange-500 italic leading-none">
                      {rev.score.toFixed(1)}
                    </div>
                    <div className="text-[7px] text-gray-700 font-bold uppercase mt-1">Archive Score</div>
                  </div>
                </Link>
              ))
            )}
          </div>

        </div>
      </div>
    </main>
  );
}