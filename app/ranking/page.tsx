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

  if (isLoading) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-orange-500 font-black italic">SYNCING RANKING...</div>;

  return (
    <main className="min-h-screen bg-[#121212] text-white p-4 md:p-12 font-sans text-left">
      <div className="max-w-6xl mx-auto space-y-12">
        
        <header className="flex justify-between items-center mb-10">
          <Link href="/" className="text-gray-500 text-[10px] font-bold uppercase transition-colors">← Back</Link>
          <div className="text-right"><h1 className="text-xl md:text-3xl font-black italic text-orange-500 uppercase leading-none">DETAIL RANKING.</h1><p className="text-[6px] text-gray-600 font-bold uppercase mt-1">Sorted by score // {filteredReviews.length} items</p></div>
        </header>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* フィルター: スマホでは上に、PCでは横に固定 */}
          <aside className="w-full md:w-48 space-y-4 flex-none md:sticky md:top-12">
            {[ {label: "Year", state: selectedYear, key: 'year', items: years, set: setSelectedYear},
               {label: "Genre", state: selectedGenre, key: 'genre', items: genres, set: setSelectedGenre},
               {label: "Format", state: selectedFormat, key: 'format', items: formats, set: setSelectedFormat}
            ].map(f => (
              <div key={f.key} className="border-b border-gray-900 pb-2">
                <button onClick={() => toggleDropdown(f.key)} className="w-full flex justify-between items-center text-[10px] font-black text-orange-500 uppercase italic py-2">
                  <span>{f.label}: {f.state}</span><span>▼</span>
                </button>
                <div className={`overflow-y-auto transition-all flex flex-col gap-1 ${openFilter === f.key ? 'max-h-60 py-2 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                  {f.items.map(item => (
                    <button key={item} onClick={() => { f.set(item); setOpenFilter(null); }} className={`text-left text-[11px] font-black uppercase italic py-1 ${f.state === item ? 'text-white border-l-2 border-orange-500 pl-3' : 'text-gray-700 pl-0'}`}>{item}</button>
                  ))}
                </div>
              </div>
            ))}
            {(selectedYear !== "ALL" || selectedGenre !== "ALL" || selectedFormat !== "ALL") && (
              <button onClick={resetAllFilters} className="w-full text-orange-500 font-black uppercase text-[10px] italic py-2 text-center border border-orange-500/20 rounded-xl">× Clear</button>
            )}
          </aside>

          {/* ランキングリスト: #順位の幅を詰め、情報を整理 */}
          <div className="flex-1 w-full space-y-3">
            {filteredReviews.map((rev, index) => (
              <Link href={`/review/${rev.id}`} key={rev.id} className="group flex items-center bg-[#1a1a1a] rounded-2xl p-3 border border-gray-800 gap-3 md:gap-6 shadow-xl">
                {/* 順位を縮小 (#1の幅を w-8 に制限) */}
                <div className="text-xl md:text-4xl font-black italic text-gray-800 w-8 md:w-16 flex-none text-center leading-none">#{index + 1}</div>
                <img src={rev.image} className="w-12 h-12 md:w-20 md:h-20 rounded-lg object-cover flex-none border border-white/5" alt="" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-xs md:text-xl uppercase italic truncate leading-tight group-hover:text-orange-500">{rev.title}</h3>
                  <div className="flex gap-2 items-center mt-1">
                    <p className="text-[8px] md:text-[10px] text-gray-600 font-bold uppercase truncate">{rev.artist}</p>
                    <span className="text-[7px] text-gray-500 font-black">{rev.release_year}</span>
                  </div>
                </div>
                <div className="text-right flex-none"><div className="text-xl md:text-4xl font-black text-orange-500 italic leading-none">{rev.score.toFixed(1)}</div></div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}