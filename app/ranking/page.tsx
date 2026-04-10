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
  const [selectedFormat, setSelectedFormat] = useState<string>("ALL");

  // どのドロップダウンが開いているか管理
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

  // フィルターロジック
  useEffect(() => {
    let result = [...reviews];
    
    if (selectedYear !== "ALL") {
      result = result.filter(r => r.release_year === selectedYear);
    }
    
    if (selectedGenre !== "ALL") {
      result = result.filter(r => r.genre === selectedGenre);
    }

    if (selectedFormat === "EP") {
      result = result.filter(r => r.title.toLowerCase().includes('ep'));
    } else if (selectedFormat === "LP") {
      result = result.filter(r => !r.title.toLowerCase().includes('ep'));
    }

    setFilteredReviews(result);
  }, [selectedYear, selectedGenre, selectedFormat, reviews]);

  const years = ["ALL", ...Array.from(new Set(reviews.map(r => r.release_year).filter(Boolean))).sort().reverse()];
  const genres = ["ALL", ...Array.from(new Set(reviews.map(r => r.genre).filter(Boolean))).sort()];
  const formats = ["ALL", "LP", "EP"];

  const toggleDropdown = (name: string) => {
    setOpenFilter(openFilter === name ? null : name);
  };

  const resetAllFilters = () => {
    setSelectedYear("ALL");
    setSelectedGenre("ALL");
    setSelectedFormat("ALL");
    setOpenFilter(null);
  };

  if (isLoading) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-orange-500 font-black italic animate-pulse">SYNCING RANKING...</div>;

  return (
    <main className="min-h-screen bg-[#121212] text-white p-4 md:p-12 font-sans overflow-x-hidden text-left relative pt-24 md:pt-12">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-16 relative z-50">
          <Link href="/" className="text-gray-500 hover:text-orange-500 text-[10px] md:text-xs font-bold uppercase transition-colors leading-none">← Back to Library</Link>
          <div className="text-right">
            <h1 className="text-xl md:text-3xl font-black italic tracking-tighter text-orange-500 uppercase leading-none">DETAIL RANKING.</h1>
            <p className="text-[6px] md:text-[7px] text-gray-600 font-bold uppercase tracking-[0.3em] mt-1 leading-none">Sorted by score // {filteredReviews.length} items</p>
          </div>
        </header>

        {/* スマホ用フィルター */}
        <div className="md:hidden space-y-4 pt-12 relative z-10">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl relative z-20">
                <button onClick={() => toggleDropdown('year')} className="w-full flex justify-between items-center p-4 text-left leading-none">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest italic">Year: {selectedYear}</span>
                    <span className={`text-[8px] text-gray-600 transition-transform ${openFilter === 'year' ? 'rotate-180' : ''}`}>▼</span>
                </button>
                <div className={`overflow-y-auto flex flex-col gap-1 transition-all duration-300 no-scrollbar ${openFilter === 'year' ? 'max-h-60 pt-0 pb-4 px-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {years.map(year => (
                        <button key={year} onClick={() => { setSelectedYear(year); setOpenFilter(null); }} className={`text-left text-[11px] font-black uppercase italic py-1 leading-none ${selectedYear === year ? 'text-white border-l-2 border-orange-500 pl-3' : 'text-gray-700 pl-0'}`}>{year}</button>
                    ))}
                </div>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl relative z-10">
                <button onClick={() => toggleDropdown('genre')} className="w-full flex justify-between items-center p-4 text-left leading-none">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest italic">Genre: {selectedGenre}</span>
                    <span className={`text-[8px] text-gray-600 transition-transform ${openFilter === 'genre' ? 'rotate-180' : ''}`}>▼</span>
                </button>
                <div className={`overflow-y-auto flex flex-col gap-1 transition-all duration-300 no-scrollbar ${openFilter === 'genre' ? 'max-h-60 pt-0 pb-4 px-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {genres.map(genre => (
                        <button key={genre} onClick={() => { setSelectedGenre(genre); setOpenFilter(null); }} className={`text-left text-[11px] font-black uppercase italic py-1 leading-none ${selectedGenre === genre ? 'text-white border-l-2 border-orange-500 pl-3' : 'text-gray-700 pl-0'}`}>{genre}</button>
                    ))}
                </div>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl relative z-0">
                <button onClick={() => toggleDropdown('format')} className="w-full flex justify-between items-center p-4 text-left leading-none">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest italic">Format: {selectedFormat}</span>
                    <span className={`text-[8px] text-gray-600 transition-transform ${openFilter === 'format' ? 'rotate-180' : ''}`}>▼</span>
                </button>
                <div className={`overflow-hidden flex flex-col gap-1 transition-all duration-300 ${openFilter === 'format' ? 'max-h-60 pt-0 pb-4 px-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {formats.map(format => (
                        <button key={format} onClick={() => { setSelectedFormat(format); setOpenFilter(null); }} className={`text-left text-[11px] font-black uppercase italic py-1 leading-none ${selectedFormat === format ? 'text-white border-l-2 border-orange-500 pl-3' : 'text-gray-700 pl-0'}`}>{format}</button>
                    ))}
                </div>
            </div>

            {(selectedYear !== "ALL" || selectedGenre !== "ALL" || selectedFormat !== "ALL") && (
                <button onClick={resetAllFilters} className="w-full bg-[#1a1a1a] border border-gray-800 p-4 rounded-xl text-[10px] font-black text-orange-500 hover:text-orange-500 uppercase tracking-widest transition-colors text-center italic leading-none">× Clear Filters</button>
            )}
        </div>

        <div className="flex flex-col md:flex-row gap-12 items-start pt-12 md:pt-0 relative z-0">
          
          {/* LEFT SIDEBAR: FILTERS */}
          <aside className="w-full md:w-56 space-y-2 flex-none md:sticky md:top-12 hidden md:block">
            {(selectedYear !== "ALL" || selectedGenre !== "ALL" || selectedFormat !== "ALL") && (
              <button 
                onClick={resetAllFilters}
                className="w-full mb-6 bg-orange-500 text-black py-3 rounded-xl font-black text-[10px] uppercase italic tracking-widest hover:bg-white transition-all shadow-lg active:scale-95 leading-none"
              >
                × Clear All Filters
              </button>
            )}

            <div className="border-b border-gray-900 pb-2">
              <button onClick={() => toggleDropdown('year')} className="w-full flex justify-between items-center text-[10px] font-black text-orange-500 uppercase tracking-widest italic py-2 leading-none">
                <span>Year: {selectedYear}</span>
                <span className={`transition-transform duration-300 ${openFilter === 'year' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              <div className={`overflow-y-auto transition-all duration-300 flex flex-col gap-1 no-scrollbar ${openFilter === 'year' ? 'max-h-60 py-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                {years.map(year => (
                  <button key={year} onClick={() => { setSelectedYear(year); setOpenFilter(null); }} className={`text-left text-[11px] font-black uppercase italic py-1 leading-none ${selectedYear === year ? 'text-white border-l-2 border-orange-500 pl-3' : 'text-gray-700 hover:text-gray-400 pl-0'}`}>{year}</button>
                ))}
              </div>
            </div>

            <div className="border-b border-gray-900 pb-2">
              <button onClick={() => toggleDropdown('genre')} className="w-full flex justify-between items-center text-[10px] font-black text-orange-500 uppercase tracking-widest italic py-2 leading-none">
                <span>Genre: {selectedGenre}</span>
                <span className={`transition-transform duration-300 ${openFilter === 'genre' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              <div className={`overflow-y-auto transition-all duration-300 flex flex-col gap-1 no-scrollbar ${openFilter === 'genre' ? 'max-h-60 py-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                {genres.map(genre => (
                  <button key={genre} onClick={() => { setSelectedGenre(genre); setOpenFilter(null); }} className={`text-left text-[11px] font-black uppercase italic py-1 leading-none ${selectedGenre === genre ? 'text-white border-l-2 border-orange-500 pl-3' : 'text-gray-700 hover:text-gray-400 pl-0'}`}>{genre}</button>
                ))}
              </div>
            </div>

            <div className="border-b border-gray-900 pb-2">
              <button onClick={() => toggleDropdown('format')} className="w-full flex justify-between items-center text-[10px] font-black text-orange-500 uppercase tracking-widest italic py-2 leading-none">
                <span>Format: {selectedFormat}</span>
                <span className={`transition-transform duration-300 ${openFilter === 'format' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 flex flex-col gap-1 ${openFilter === 'format' ? 'max-h-60 py-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                {formats.map(format => (
                  <button key={format} onClick={() => { setSelectedFormat(format); setOpenFilter(null); }} className={`text-left text-[11px] font-black uppercase italic py-1 leading-none ${selectedFormat === format ? 'text-white border-l-2 border-orange-500 pl-3' : 'text-gray-700 hover:text-gray-400 pl-0'}`}>{format}</button>
                ))}
              </div>
            </div>
          </aside>

          {/* RIGHT CONTENT: RANKING LIST */}
          <div className="flex-1 space-y-3 md:space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-gray-800 rounded-[2rem]">
                <p className="text-gray-700 font-black italic uppercase text-xs leading-none">No digs matched your filter.</p>
                <button onClick={resetAllFilters} className="mt-4 text-orange-500 font-black uppercase text-[10px] underline underline-offset-8 leading-none">Clear filters</button>
              </div>
            ) : (
              filteredReviews.map((rev, index) => (
                <Link 
                  href={`/review/${rev.id}`} 
                  key={rev.id}
                  className="group flex items-center bg-[#1a1a1a] rounded-2xl p-3 md:p-4 border border-gray-800 hover:border-orange-500 transition-all gap-4 md:gap-6 shadow-2xl relative"
                >
                  <div className="text-xl md:text-5xl font-black italic text-gray-800 group-hover:text-orange-500 transition-colors w-8 md:w-20 flex-none text-center leading-none">
                    #{index + 1}
                  </div>
                  <img src={rev.image} className="w-14 h-14 md:w-20 md:h-20 rounded-xl object-cover shadow-xl flex-none border border-white/5" alt="" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-xs md:text-xl uppercase italic truncate leading-tight group-hover:text-orange-500 transition-colors">{rev.title}</h3>
                    <div className="flex gap-2 md:gap-4 items-center mt-0.5 md:mt-1">
                      <p className="text-[8px] md:text-[10px] text-gray-600 font-bold uppercase truncate leading-none">{rev.artist}</p>
                      <span className="text-[7px] md:text-[8px] bg-gray-900 text-gray-500 px-1.5 py-0.5 rounded italic font-black flex-none leading-none">{rev.release_year}</span>
                    </div>
                  </div>
                  <div className="text-right flex-none relative">
                    <div className="text-xl md:text-4xl font-black text-orange-500 italic leading-none">{rev.score.toFixed(1)}</div>
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