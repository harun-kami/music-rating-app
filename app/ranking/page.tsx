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
  const [selectedFormat, setSelectedFormat] = useState<string>("ALL"); // ALL, LP, EP

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

        <div className="flex flex-col md:flex-row gap-12 items-start">
          
          {/* LEFT SIDEBAR: ACCORDION FILTERS */}
          <aside className="w-full md:w-56 space-y-4 flex-none sticky top-12">
            
            {/* YEAR FILTER */}
            <div className="border-b border-gray-900 pb-2">
              <button 
                onClick={() => toggleDropdown('year')}
                className="w-full flex justify-between items-center text-[10px] font-black text-orange-500 uppercase tracking-widest italic py-2"
              >
                <span>Release Year: {selectedYear}</span>
                <span className={`transition-transform duration-300 ${openFilter === 'year' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 flex flex-col gap-1 ${openFilter === 'year' ? 'max-h-60 py-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                {years.map(year => (
                  <button key={year} onClick={() => { setSelectedYear(year); setOpenFilter(null); }} className={`text-left text-[11px] font-black uppercase italic ${selectedYear === year ? 'text-white' : 'text-gray-700 hover:text-gray-400'}`}>{year}</button>
                ))}
              </div>
            </div>

            {/* GENRE FILTER */}
            <div className="border-b border-gray-900 pb-2">
              <button 
                onClick={() => toggleDropdown('genre')}
                className="w-full flex justify-between items-center text-[10px] font-black text-orange-500 uppercase tracking-widest italic py-2"
              >
                <span>Genre: {selectedGenre}</span>
                <span className={`transition-transform duration-300 ${openFilter === 'genre' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 flex flex-col gap-1 ${openFilter === 'genre' ? 'max-h-60 py-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                {genres.map(genre => (
                  <button key={genre} onClick={() => { setSelectedGenre(genre); setOpenFilter(null); }} className={`text-left text-[11px] font-black uppercase italic ${selectedGenre === genre ? 'text-white' : 'text-gray-700 hover:text-gray-400'}`}>{genre}</button>
                ))}
              </div>
            </div>

            {/* FORMAT FILTER (LP/EP) */}
            <div className="border-b border-gray-900 pb-2">
              <button 
                onClick={() => toggleDropdown('format')}
                className="w-full flex justify-between items-center text-[10px] font-black text-orange-500 uppercase tracking-widest italic py-2"
              >
                <span>Format: {selectedFormat}</span>
                <span className={`transition-transform duration-300 ${openFilter === 'format' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 flex flex-col gap-1 ${openFilter === 'format' ? 'max-h-60 py-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                {formats.map(format => (
                  <button key={format} onClick={() => { setSelectedFormat(format); setOpenFilter(null); }} className={`text-left text-[11px] font-black uppercase italic ${selectedFormat === format ? 'text-white' : 'text-gray-700 hover:text-gray-400'}`}>{format}</button>
                ))}
              </div>
            </div>

            {/* RESET BUTTON */}
            {(selectedYear !== "ALL" || selectedGenre !== "ALL" || selectedFormat !== "ALL") && (
              <button 
                onClick={() => { setSelectedYear("ALL"); setSelectedGenre("ALL"); setSelectedFormat("ALL"); }}
                className="w-full mt-4 text-[8px] font-black text-gray-500 hover:text-orange-500 uppercase tracking-widest transition-colors text-left"
              >
                × Reset Filters
              </button>
            )}
          </aside>

          {/* RIGHT CONTENT: RANKING LIST */}
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
                  <div className="text-3xl md:text-5xl font-black italic text-gray-800 group-hover:text-orange-500 transition-colors w-12 md:w-20 flex-none text-center">
                    #{index + 1}
                  </div>
                  <img src={rev.image} className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover shadow-xl flex-none border border-white/5" alt="" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-sm md:text-xl uppercase italic truncate leading-tight group-hover:text-orange-500 transition-colors">{rev.title}</h3>
                    <div className="flex gap-4 items-center mt-1">
                      <p className="text-[10px] text-gray-600 font-bold uppercase truncate">{rev.artist}</p>
                      <span className="text-[8px] bg-gray-900 text-gray-500 px-2 py-0.5 rounded italic font-black">{rev.release_year}</span>
                    </div>
                  </div>
                  <div className="text-right flex-none">
                    <div className="text-2xl md:text-4xl font-black text-orange-500 italic leading-none">{rev.score.toFixed(1)}</div>
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