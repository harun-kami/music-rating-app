"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function RankingPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [selectedGenre, setSelectedGenre] = useState<string>("ALL");
  const [selectedFormat, setSelectedFormat] = useState<string>("ALL");
  const [openFilter, setOpenFilter] = useState<string | null>(null);

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

  useEffect(() => {
    let result = [...reviews];
    if (selectedYear !== "ALL") result = result.filter(r => r.release_year === selectedYear);
    if (selectedGenre !== "ALL") result = result.filter(r => r.genre === selectedGenre);
    if (selectedFormat === "EP") result = result.filter(r => r.title.toLowerCase().includes('ep'));
    else if (selectedFormat === "LP") result = result.filter(r => !r.title.toLowerCase().includes('ep'));
    setFilteredReviews(result);
  }, [selectedYear, selectedGenre, selectedFormat, reviews]);

  const years = ["ALL", ...Array.from(new Set(reviews.map(r => r.release_year).filter(Boolean))).sort().reverse()];
  const genres = ["ALL", ...Array.from(new Set(reviews.map(r => r.genre).filter(Boolean))).sort()];
  const formats = ["ALL", "LP", "EP"];

  const toggleDropdown = (name: string) => setOpenFilter(openFilter === name ? null : name);
  const resetAllFilters = () => { setSelectedYear("ALL"); setSelectedGenre("ALL"); setSelectedFormat("ALL"); setOpenFilter(null); };

  if (isLoading) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-orange-500 font-black italic animate-pulse">SYNCING RANKING...</div>;

  return (
    <main className="min-h-screen bg-[#121212] text-white p-4 md:p-12 font-sans text-left pt-12 md:pt-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        <header className="flex justify-between items-center mb-10">
          <Link href="/" className="text-gray-500 text-[10px] font-bold uppercase transition-colors hover:text-orange-500">← Back</Link>
          <div className="text-right">
            <h1 className="text-xl md:text-3xl font-black italic text-orange-500 uppercase leading-none">DETAIL RANKING.</h1>
            <p className="text-[6px] text-gray-600 font-bold uppercase mt-1">Sorted by score // {filteredReviews.length} items</p>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* SIDEBAR FILTER: PCでは縦並び固定 / スマホではドロップダウン */}
          <aside className="w-full md:w-48 space-y-4 flex-none md:sticky md:top-12">
            
            {(selectedYear !== "ALL" || selectedGenre !== "ALL" || selectedFormat !== "ALL") && (
              <button onClick={resetAllFilters} className="w-full mb-6 bg-orange-500 text-black py-2 rounded-xl font-black text-[9px] uppercase italic tracking-widest hover:bg-white transition-all shadow-lg">
                × Clear All
              </button>
            )}

            {[ {label: "Year", state: selectedYear, key: 'year', items: years, set: setSelectedYear},
               {label: "Genre", state: selectedGenre, key: 'genre', items: genres, set: setSelectedGenre},
               {label: "Format", state: selectedFormat, key: 'format', items: formats, set: setSelectedFormat}
            ].map(f => (
              <div key={f.key} className="border-b border-gray-900 pb-2">
                <button 
                  onClick={() => toggleDropdown(f.key)} 
                  className="w-full flex justify-between items-center text-[10px] font-black text-orange-500 uppercase italic py-2 md:cursor-default"
                >
                  <span>{f.label}: {f.state}</span>
                  <span className="md:hidden">▼</span>
                </button>
                {/* Fix: md:flex md:flex-col を指定することで、PCでの横重なりを解消。
                  スマホでは開いている時だけ flex、PCでは常に flex-col で表示。
                */}
                <div className={`${openFilter === f.key ? 'flex' : 'hidden'} md:flex flex-col gap-1 no-scrollbar overflow-y-auto max-h-60 pt-2`}>
                  {f.items.map(item => (
                    <button 
                      key={item} 
                      onClick={() => { f.set(item); setOpenFilter(null); }} 
                      className={`text-left text-[11px] font-black uppercase italic py-1 transition-colors ${f.state === item ? 'text-white border-l-2 border-orange-500 pl-3' : 'text-gray-700 hover:text-gray-400 pl-0'}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </aside>

          {/* RANKING LIST */}
          <div className="flex-1 w-full space-y-3">
            {filteredReviews.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-gray-900 rounded-[2rem]">
                <p className="text-gray-700 font-black italic uppercase text-xs">No digs matched your filter.</p>
              </div>
            ) : (
              filteredReviews.map((rev, index) => (
                <Link href={`/review/${rev.id}`} key={rev.id} className="group flex items-center bg-[#1a1a1a] rounded-2xl p-3 border border-gray-800 gap-3 md:gap-6 shadow-xl transition-all hover:border-orange-500">
                  {/* Rank number: スマホで縮めるために min-w を調整 */}
                  <div className="text-xl md:text-4xl font-black italic text-gray-800 min-w-[2.5rem] md:min-w-[4rem] flex-none text-center leading-none">
                    #{index + 1}
                  </div>
                  
                  <img src={rev.image} className="w-12 h-12 md:w-20 md:h-20 rounded-lg object-cover flex-none border border-white/5" alt="" />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-xs md:text-xl uppercase italic truncate leading-tight group-hover:text-orange-500 transition-colors">{rev.title}</h3>
                    <div className="flex gap-2 items-center mt-1">
                      <p className="text-[8px] md:text-[10px] text-gray-600 font-bold uppercase truncate">{rev.artist}</p>
                      <span className="text-[7px] md:text-[8px] bg-gray-900 text-gray-500 px-1.5 py-0.5 rounded italic font-black flex-none leading-none">{rev.release_year}</span>
                    </div>
                  </div>
                  
                  <div className="text-right flex-none">
                    <div className="text-xl md:text-4xl font-black text-orange-500 italic leading-none">
                      {rev.score.toFixed(1)}
                    </div>
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