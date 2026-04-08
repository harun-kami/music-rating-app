"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

function ReviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const autoAlbumId = searchParams.get('id');
  
  const ranks = ["S", "A", "B", "C", "D", "-"];
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [ratings, setRatings] = useState<{ [key: number]: string }>({});
  const [favoriteTrack, setFavoriteTrack] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  // 1. アーティストページからのIDを検知してiTunesから情報を抜く
  useEffect(() => {
    const fetchNewAlbum = async () => {
      if (!autoAlbumId || selectedAlbum) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/album-details?id=${autoAlbumId}`);
        const data = await res.json();
        if (res.ok) {
          setSelectedAlbum({
            id: data.id,
            title: data.name,
            artist: data.artistName,
            image: data.image,
            tracks: data.tracks,
            artistId: data.artistId
          });
          // 初期化
          const init: any = {};
          data.tracks.forEach((_: any, i: number) => { init[i] = "-"; });
          setRatings(init);
        }
      } catch (e) {
        console.error("Fetch Error:", e);
      }
      setIsLoading(false);
    };
    fetchNewAlbum();
  }, [autoAlbumId]);

  const calculateScoreDisplay = () => {
    if (!ratings || !selectedAlbum?.tracks) return "0.0";
    const rankMap: { [key: string]: number } = { "S": 5, "A": 4, "B": 3, "C": 2, "D": 1 };
    let pts = 0, count = 0;
    Object.values(ratings).forEach(r => { 
      if (r !== "-" && rankMap[r]) { pts += rankMap[r]; count++; } 
    });
    return count === 0 ? "0.0" : ((pts / (count * 5)) * 10).toFixed(1);
  };

  const handleSave = async () => {
    setSaveStatus("SAVING...");
    const cleanData = {
      id: String(selectedAlbum.id),
      artist_id: String(selectedAlbum.artistId),
      title: selectedAlbum.title,
      artist: selectedAlbum.artist,
      image: selectedAlbum.image,
      tracks: selectedAlbum.tracks,
      ratings: ratings,
      favorite_track: favoriteTrack,
      score: parseFloat(calculateScoreDisplay())
    };

    const { error } = await supabase.from('reviews').upsert(cleanData);
    if (error) {
      setSaveStatus("ERROR! ❌");
    } else {
      setSaveStatus("SAVED! 🔥");
      setTimeout(() => router.push('/'), 1500); // 保存したらライブラリへ
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-orange-500 font-black tracking-widest animate-pulse italic">DIGGING...</div>;

  return (
    <main className="min-h-screen bg-[#121212] text-white p-6 md:p-12 font-sans overflow-x-hidden text-left">
      <div className="max-w-3xl mx-auto">
        {!selectedAlbum ? (
          /* --- 検索画面 (デザインに合わせて実装) --- */
          <div className="pt-20">
            <header className="flex justify-between items-center mb-10">
              <Link href="/" className="text-gray-500 hover:text-orange-500 text-xs font-bold uppercase">← Library</Link>
              <h1 className="text-xl font-black italic text-orange-500 uppercase leading-none">MY DIGS.</h1>
            </header>
            <div className="text-center py-20">
                <h2 className="text-gray-800 text-6xl font-black italic mb-4">SEARCH ALBUM</h2>
                <p className="text-gray-600 font-bold uppercase text-[10px] tracking-[0.3em]">Select from artist page to start digging.</p>
            </div>
          </div>
        ) : (
          /* --- 評価画面 (ReviewDetailPageのレイアウトを完全再現) --- */
          <>
            <header className="flex justify-between items-center mb-10">
              <button onClick={() => router.push('/review')} className="text-gray-500 hover:text-orange-500 text-xs font-bold uppercase transition-colors">← Back to Search</button>
              <h1 className="text-xl font-black italic text-orange-500 uppercase tracking-tighter leading-none">MY DIGS.</h1>
            </header>

            <div className="bg-[#1e1e1e] p-8 rounded-3xl mb-12 flex flex-col md:flex-row justify-between items-center border border-gray-800 shadow-xl gap-8">
              <div className="flex gap-6 items-center min-w-0">
                <img src={selectedAlbum.image} className="w-24 h-24 md:w-32 md:h-32 rounded-xl shadow-2xl object-cover border border-white/5" alt="" />
                <div className="min-w-0 text-left">
                  <h2 className="text-2xl md:text-4xl font-black text-orange-500 uppercase italic leading-tight truncate tracking-tighter mb-2">
                    {selectedAlbum.title}
                  </h2>
                  <div className="flex items-center gap-4">
                    <p className="text-xs text-gray-500 font-bold uppercase truncate leading-none">
                      {selectedAlbum.artist}
                    </p>
                    <div className="bg-orange-500 text-black px-2 py-0.5 rounded-full text-[8px] font-black italic shadow-lg">
                      SCORE: {calculateScoreDisplay()}
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleSave} 
                className="w-full md:w-auto px-10 py-5 bg-orange-500 text-black rounded-2xl font-black transition-all active:scale-95 shadow-xl hover:scale-105"
              >
                {saveStatus || "SAVE DIG"}
              </button>
            </div>

            <div className="space-y-4 pb-20">
              {selectedAlbum.tracks.map((track: string, i: number) => (
                <div key={i} className="flex justify-between items-center bg-[#1e1e1e]/50 p-5 rounded-2xl border border-gray-800">
                  <div className="flex items-center gap-4 truncate text-left">
                    <button 
                      onClick={() => setFavoriteTrack(i === favoriteTrack ? null : i)}
                      className={`transition-all active:scale-125 ${favoriteTrack === i ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500/50'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" />
                      </svg>
                    </button>
                    <span className="font-bold text-sm truncate uppercase tracking-tight leading-none text-left">
                      <span className="text-orange-500/50 mr-3 italic font-black">{(i+1).toString().padStart(2, '0')}</span>{track}
                    </span>
                  </div>
                  <div className="flex gap-1.5 flex-none">
                    {ranks.map(r => (
                      <button 
                        key={r} 
                        onClick={() => setRatings({...ratings, [i]: r})} 
                        className={`w-9 h-9 md:w-10 md:h-10 rounded-xl font-black border-2 transition-all text-[10px] ${ratings[i] === r ? 'bg-orange-500 text-black border-orange-500 scale-105 shadow-orange-500/30 shadow-lg' : 'border-gray-800 text-gray-500 hover:border-orange-500'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="bg-[#121212] min-h-screen" />}>
      <ReviewContent />
    </Suspense>
  );
}