"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function NewReviewPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [album, setAlbum] = useState<any>(null);
  const [ratings, setRatings] = useState<{ [key: number]: string }>({});
  const [favoriteTrack, setFavoriteTrack] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const searchAlbum = async () => {
    if (!query) return;
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Search API Error:", err);
    }
  };

  const selectAlbum = async (item: any) => {
    try {
      const res = await fetch(`/api/tracks?id=${item.collectionId}`);
      const data = await res.json();
      setAlbum({ ...item, tracks: data.tracks || [] });
      setResults([]);
    } catch (err) {
      console.error("Tracks API Error:", err);
    }
  };

  const calculateScoreDisplay = () => {
    const rankMap: { [key: string]: number } = { "S": 5, "A": 4, "B": 3, "C": 2, "D": 1 };
    let pts = 0, count = 0;
    Object.values(ratings).forEach(r => {
      if (r !== "-" && rankMap[r]) { pts += rankMap[r]; count++; }
    });
    return count === 0 ? "0.0" : ((pts / (count * 5)) * 10).toFixed(1);
  };

  const handleSave = async () => {
    if (!album) return;
    setIsSaving(true);

    const newReview = {
      id: String(album.collectionId),
      artist_id: String(album.artistId),
      title: album.collectionName,
      artist: album.artistName,
      image: album.artworkUrl100.replace('100x100bb', '600x600bb'),
      tracks: album.tracks,
      ratings: ratings,
      favorite_track: favoriteTrack,
      score: parseFloat(calculateScoreDisplay())
    };

    const { error } = await supabase.from('reviews').upsert([newReview]);

    if (error) {
      console.error("Supabase Error:", error);
      alert("Save failed...");
      setIsSaving(false);
    } else {
      router.push('/');
    }
  };

  return (
    <main className="min-h-screen bg-[#121212] text-white p-6 md:p-12 font-sans text-left">
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <Link href="/" className="text-gray-500 hover:text-orange-500 text-xs font-bold uppercase transition-colors">← Back</Link>
          <h1 className="text-xl font-black italic text-orange-500 uppercase tracking-tighter leading-none">NEW DIG.</h1>
        </header>

        {/* 検索入力 */}
        <div className="relative mb-8">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchAlbum()}
            placeholder="Search Album..."
            className="w-full bg-[#1e1e1e] border border-gray-800 focus:border-orange-500 rounded-2xl px-6 py-4 outline-none font-bold transition-all"
          />
          <button onClick={searchAlbum} className="absolute right-2 top-2 bg-orange-500 text-black px-6 py-2 rounded-xl font-black text-xs hover:bg-white transition-all">SEARCH</button>
        </div>

        {/* 横スクロール検索結果 */}
        {results.length > 0 && (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-10">
            {results.map((item) => (
              <div key={item.collectionId} onClick={() => selectAlbum(item)} className="flex-none w-32 cursor-pointer group text-left">
                {/* --- 修正点1: 画像を高画質（300x300）に --- */}
                <img 
                  src={item.artworkUrl100.replace('100x100bb', '300x300bb')} 
                  className="w-32 h-32 rounded-xl mb-2 group-hover:scale-105 transition-transform border border-gray-800 object-cover" 
                  alt="" 
                />
                <p className="text-[10px] font-black uppercase italic truncate">{item.collectionName}</p>
                {/* --- 修正点2: アーティストリンク復活 + イベント伝播停止 --- */}
                <Link href={`/artist/${item.artistId}`} onClick={(e) => e.stopPropagation()}>
                  <p className="text-[8px] text-gray-500 hover:text-orange-500 font-bold uppercase truncate transition-colors cursor-pointer">
                    {item.artistName}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        )}

        {album && (
          <div className="animate-in fade-in duration-500">
            {/* ヘッダーカード */}
            <div className="bg-[#1e1e1e] p-8 rounded-3xl mb-12 flex flex-col md:flex-row justify-between items-center border border-gray-800 shadow-xl gap-8">
              <div className="flex gap-6 items-center min-w-0">
                <img src={album.artworkUrl100.replace('100x100bb', '600x600bb')} className="w-24 h-24 md:w-32 md:h-32 rounded-xl shadow-2xl object-cover" alt="" />
                <div className="min-w-0 text-left">
                  <h2 className="text-2xl md:text-4xl font-black text-orange-500 uppercase italic leading-tight truncate tracking-tighter mb-2">
                    {album.collectionName}
                  </h2>
                  <div className="flex items-center gap-3">
                    <Link href={`/artist/${album.artistId}`}>
                      <p className="text-xs text-gray-500 hover:text-orange-500 font-bold uppercase truncate transition-colors cursor-pointer">
                        {album.artistName}
                      </p>
                    </Link>
                    <div className="bg-orange-500 text-black px-2 py-0.5 rounded-full text-[8px] font-black italic">
                      SCORE: {calculateScoreDisplay()}
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="w-full md:w-auto px-10 py-5 bg-orange-500 text-black rounded-2xl font-black transition-all active:scale-95 shadow-xl hover:scale-105 disabled:opacity-50"
              >
                {isSaving ? "SAVING..." : "SAVE TO ARCHIVE"}
              </button>
            </div>

            {/* トラックリスト */}
            <div className="space-y-4 pb-20">
              {album.tracks?.map((track: string, i: number) => (
                <div key={i} className="flex justify-between items-center bg-[#1e1e1e]/50 p-5 rounded-2xl border border-gray-800 group">
                  <div className="flex items-center gap-4 truncate">
                    <button 
                      onClick={() => setFavoriteTrack(i === favoriteTrack ? null : i)}
                      className={`transition-all ${favoriteTrack === i ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500/50'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" />
                      </svg>
                    </button>
                    <span className="font-bold text-sm truncate uppercase tracking-tight leading-none text-left">
                      <span className="text-orange-500/50 mr-3 italic font-black">{(i+1).toString().padStart(2, '0')}</span>{track}
                    </span>
                  </div>
                  <div className="flex gap-1.5 flex-none">
                    {["S", "A", "B", "C", "D", "-"].map(r => (
                      <button 
                        key={r} 
                        onClick={() => setRatings({...ratings, [i]: r})} 
                        className={`w-9 h-9 md:w-10 md:h-10 rounded-xl font-black border-2 transition-all text-[10px] ${ratings[i] === r ? 'bg-orange-500 text-black border-orange-500 scale-105' : 'border-gray-800 text-gray-500 hover:border-orange-500'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}