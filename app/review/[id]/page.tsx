"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // useRouter を追加
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ReviewDetailPage() {
  const { id } = useParams();
  const router = useRouter(); // 初期化
  const ranks = ["S", "A", "B", "C", "D", "-"];
  const [review, setReview] = useState<any>(null);
  const [ratings, setRatings] = useState<{ [key: number]: string }>({});
  const [favoriteTrack, setFavoriteTrack] = useState<number | null>(null);
  const [expandedTrack, setExpandedTrack] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchReview = async () => {
      const { data, error } = await supabase.from('reviews').select('*').eq('id', id).single();
      if (data) {
        setReview(data);
        setRatings(data.ratings || {});
        setFavoriteTrack(data.favorite_track ?? null);
      } else {
        setErrorMsg("Review not found.");
      }
    };
    if (id) fetchReview();
  }, [id]);

  const calculateScoreDisplay = () => {
    if (!ratings || !review?.tracks) return "0.0";
    const rankMap: { [key: string]: number } = { "S": 5, "A": 4, "B": 3, "C": 2, "D": 1 };
    let pts = 0, count = 0;
    Object.values(ratings).forEach(r => { if (r !== "-" && rankMap[r]) { pts += rankMap[r]; count++; } });
    return count === 0 ? "0.0" : ((pts / (count * 5)) * 10).toFixed(1);
  };

  const handleUpdate = async () => {
    setSaveStatus("SAVING...");
    const cleanData = {
      id: String(review.id),
      artist_id: String(review.artist_id || review.artistId),
      title: review.title,
      artist: review.artist,
      image: review.image,
      tracks: review.tracks,
      ratings: ratings,
      favorite_track: favoriteTrack,
      score: parseFloat(calculateScoreDisplay()),
      genre: review.genre || "Unknown",
      release_year: review.release_year || "Unknown"
    };

    const { error } = await supabase.from('reviews').upsert(cleanData);
    if (error) { setSaveStatus("ERROR! ❌"); } 
    else { setSaveStatus("UPDATED! 🔥"); }
    setTimeout(() => setSaveStatus(""), 2000);
  };

  const toggleExpand = (i: number) => setExpandedTrack(expandedTrack === i ? null : i);

  if (errorMsg) return <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-6 text-orange-500 font-black"><p className="mb-4 uppercase italic">Digging Failed: {errorMsg}</p><Link href="/" className="bg-orange-500 text-black px-8 py-3 rounded-2xl font-black uppercase text-[10px]">Back to Library</Link></div>;
  if (!review) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-orange-500 font-black tracking-widest animate-pulse italic">DIGGING...</div>;

  return (
    <main className="min-h-screen bg-[#121212] text-white p-6 md:p-12 font-sans overflow-x-hidden text-left">
      <div className="max-w-3xl mx-auto">
        
        {/* --- HEADER (ここを router.back に変更) --- */}
        <header className="flex justify-between items-center mb-10">
          <button 
            onClick={() => router.back()} 
            className="text-gray-500 hover:text-orange-500 text-xs font-bold uppercase transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-xl font-black italic text-orange-500 uppercase tracking-tighter leading-none">MY DIGS.</h1>
        </header>

        <div className="bg-[#1e1e1e] p-8 rounded-3xl mb-12 flex flex-col md:flex-row justify-between items-center border border-gray-800 shadow-xl gap-8">
          <div className="flex gap-6 items-center min-w-0">
            <img src={review.image} className="w-24 h-24 md:w-32 md:h-32 rounded-xl shadow-2xl object-cover border border-white/5" alt="" />
            <div className="min-w-0 text-left">
              <h2 className="text-2xl md:text-4xl font-black text-orange-500 uppercase italic leading-tight truncate tracking-tighter mb-2">{review.title}</h2>
              <div className="flex items-center gap-4">
                <Link href={`/artist/${review.artist_id || review.artistId}`}><p className="text-xs text-gray-500 hover:text-orange-500 font-bold uppercase truncate transition-colors cursor-pointer leading-none">{review.artist}</p></Link>
                <div className="bg-orange-500 text-black px-2 py-0.5 rounded-full text-[8px] font-black italic shadow-lg">SCORE: {calculateScoreDisplay()}</div>
              </div>
            </div>
          </div>
          <button onClick={handleUpdate} className="w-full md:w-auto px-10 py-5 bg-orange-500 text-black rounded-2xl font-black transition-all active:scale-95 shadow-xl hover:scale-105">{saveStatus || "UPDATE DIG"}</button>
        </div>

        <div className="space-y-4 pb-20">
          {review.tracks.map((track: string, i: number) => (
            <div key={i} className="flex flex-col bg-[#1e1e1e]/50 rounded-2xl border border-gray-800 overflow-hidden transition-all">
              <div className="flex justify-between items-center p-5">
                <div className="flex items-center gap-4 truncate text-left cursor-pointer flex-1 group/item" onClick={() => toggleExpand(i)}>
                  <button onClick={(e) => { e.stopPropagation(); setFavoriteTrack(i === favoriteTrack ? null : i); }} className={`transition-all active:scale-125 ${favoriteTrack === i ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500/50'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" /></svg>
                  </button>
                  <span className="font-bold text-sm truncate uppercase tracking-tight leading-none">
                    <span className="text-orange-500/50 mr-3 italic font-black">{(i+1).toString().padStart(2, '0')}</span>
                    <span className="group-hover/item:text-orange-500 transition-colors">{track}</span>
                  </span>
                  <span className={`text-[8px] text-gray-700 transition-transform duration-300 ${expandedTrack === i ? 'rotate-180' : ''}`}>▼</span>
                </div>
                <div className="flex gap-1.5 flex-none ml-4">
                  {ranks.map(r => (
                    <button key={r} onClick={() => setRatings({...ratings, [i]: r})} className={`w-9 h-9 md:w-10 md:h-10 rounded-xl font-black border-2 transition-all text-[10px] ${ratings[i] === r ? 'bg-orange-500 text-black border-orange-500 scale-105 shadow-orange-500/30 shadow-lg' : 'border-gray-800 text-gray-500 hover:border-orange-500'}`}>{r}</button>
                  ))}
                </div>
              </div>
              <div className={`px-14 transition-all duration-300 ease-in-out bg-black/20 ${expandedTrack === i ? 'max-h-40 pb-5 pt-2 opacity-100 border-t border-gray-800/50' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="space-y-2 pt-3">
                  <div className="flex gap-2 text-[9px] uppercase tracking-[0.2em]"><span className="text-orange-500/40 font-black italic">Producers</span><span className="text-gray-500 font-bold">Data syncing from archive...</span></div>
                  <div className="flex gap-2 text-[9px] uppercase tracking-[0.2em]"><span className="text-orange-500/40 font-black italic">Writers</span><span className="text-gray-500 font-bold">Data syncing from archive...</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}