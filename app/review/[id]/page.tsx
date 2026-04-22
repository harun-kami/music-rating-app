"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ReviewDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const ranks = ["S", "A", "B", "C", "D", "-"];
  const [review, setReview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ratings, setRatings] = useState<{ [key: number]: string }>({});
  const [favoriteTrack, setFavoriteTrack] = useState<number | null>(null);
  const [expandedTrack, setExpandedTrack] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- 追加箇所: 説明文用のステート ---
  const [albumNote, setAlbumNote] = useState("");
  const [trackNotes, setTrackNotes] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const fetchReview = async () => {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        console.error("Review not found or access denied");
        setErrorMsg("Review not found.");
      } else {
        setReview(data);
        setRatings(data.ratings || {});
        setFavoriteTrack(data.favorite_track);
        // --- 追加箇所: 保存されている説明文を読み込む ---
        setAlbumNote(data.album_note || "");
        setTrackNotes(data.track_notes || {});
      }
      setIsLoading(false);
    };

    if (id) fetchReview();
  }, [id, router]);

  const calculateScoreDisplay = () => {
    if (!ratings || !review?.tracks) return "0.0";
    const rankMap: { [key: string]: number } = { "S": 5, "A": 4, "B": 3, "C": 2, "D": 1 };
    let pts = 0, count = 0;
    Object.values(ratings).forEach(r => { if (r !== "-" && rankMap[r]) { pts += rankMap[r]; count++; } });
    return count === 0 ? "0.0" : ((pts / (count * 5)) * 10).toFixed(1);
  };

  const handleUpdate = async () => {
    setSaveStatus("SAVING...");
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaveStatus("LOGIN REQUIRED");
      return;
    }

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
      genre: review.genre?.toUpperCase() === "HIP-HOP/RAP" ? "Hip Hop" : (review.genre || "Unknown"),
      release_year: review.release_year || "Unknown",
      user_id: user.id,
      // --- 追加箇所: 説明文を保存データに含める ---
      album_note: albumNote,
      track_notes: trackNotes
    };

    const { error } = await supabase
      .from('reviews')
      .upsert(cleanData, { onConflict: 'id,user_id' });

    if (error) { 
      console.error(error);
      setSaveStatus("ERROR! ❌"); 
    } 
    else { 
      setSaveStatus("UPDATED! 🔥"); 
    }
    setTimeout(() => setSaveStatus(""), 2000);
  };

  const toggleExpand = (i: number) => setExpandedTrack(expandedTrack === i ? null : i);

  if (isLoading) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-orange-500 font-black italic animate-pulse">SYNCING DATA...</div>;
  if (errorMsg || !review) return <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-6 text-orange-500 font-black italic uppercase"><p className="mb-4">Digging Failed: {errorMsg || "Review not found"}</p><Link href="/" className="bg-orange-500 text-black px-8 py-3 rounded-2xl font-black text-[10px]">Back</Link></div>;

  return (
    <main className="min-h-screen bg-[#121212] text-white p-4 md:p-12 font-sans overflow-x-hidden text-left">
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-8 md:mb-10">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-orange-500 text-[10px] md:text-xs font-bold uppercase transition-colors">← Back</button>
          <h1 className="text-lg md:text-xl font-black italic text-orange-500 uppercase leading-none">MY DIGS.</h1>
        </header>

        <div className="bg-[#1e1e1e] p-6 md:p-8 rounded-[2rem] md:rounded-3xl mb-12 flex flex-col md:flex-row justify-between items-center border border-gray-800 shadow-xl gap-6 md:gap-8">
          <div className="flex gap-4 md:gap-6 items-center min-w-0 w-full md:w-auto">
            <img src={review.image} className="w-20 h-20 md:w-32 md:h-32 rounded-xl shadow-2xl object-cover border border-white/5 flex-none" alt="" />
            <div className="min-w-0 w-full">
              <h2 className="text-xl md:text-4xl font-black text-orange-500 uppercase italic leading-tight truncate tracking-tighter mb-1 md:mb-2">{review.title}</h2>
              <div className="flex items-center gap-3 md:gap-4 mb-3">
                <Link href={`/artist/${review.artist_id || review.artistId}`} className="text-[10px] md:text-xs text-gray-500 hover:text-orange-500 font-bold uppercase truncate transition-colors block">{review.artist}</Link>
                <div className="bg-orange-500 text-black px-2 py-0.5 rounded-full text-[7px] md:text-[8px] font-black italic flex-none shadow-lg">SCORE: {calculateScoreDisplay()}</div>
              </div>
              {/* --- 追加箇所: アルバム全体の説明文（既存レイアウトを崩さないよう配置） --- */}
              <textarea 
                value={albumNote}
                onChange={(e) => setAlbumNote(e.target.value)}
                placeholder="Add your archive notes here..."
                className="w-full bg-black/20 border border-gray-800/80 rounded-xl p-3 text-[10px] md:text-xs text-gray-300 focus:outline-none focus:border-orange-500/50 transition-all resize-none placeholder:text-gray-700 italic font-bold"
                rows={2}
              />
            </div>
          </div>
          <button onClick={handleUpdate} className="w-full md:w-auto px-10 py-4 md:py-5 bg-orange-500 text-black rounded-2xl font-black transition-all active:scale-95 shadow-xl text-xs md:text-base">{saveStatus || "UPDATE DIG"}</button>
        </div>

        <div className="space-y-4 pb-20">
          {review.tracks.map((track: string, i: number) => (
            <div key={i} className="flex flex-col bg-[#1e1e1e]/50 rounded-2xl border border-gray-800 overflow-hidden transition-all">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 md:p-5 gap-4">
                <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1 cursor-pointer group/item" onClick={() => toggleExpand(i)}>
                  <button onClick={(e) => { e.stopPropagation(); setFavoriteTrack(i === favoriteTrack ? null : i); }} className={`flex-none transition-all active:scale-125 ${favoriteTrack === i ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500/50'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6"><path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" /></svg>
                  </button>
                  <span className="font-bold text-xs md:text-sm truncate uppercase tracking-tight leading-none min-w-0">
                    <span className="text-orange-500/50 mr-2 md:mr-3 italic font-black">{(i+1).toString().padStart(2, '0')}</span>
                    <span className="group-hover/item:text-orange-500 transition-colors">{track}</span>
                  </span>
                  <span className={`text-[7px] md:text-[8px] text-gray-700 transition-transform duration-300 ${expandedTrack === i ? 'rotate-180' : ''}`}>▼</span>
                </div>
                <div className="flex gap-1 md:gap-1.5 flex-none w-full sm:w-auto justify-between sm:justify-end">
                  {ranks.map(r => (
                    <button key={r} onClick={() => setRatings({...ratings, [i]: r})} className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl font-black border-2 transition-all text-[9px] md:text-[10px] ${ratings[i] === r ? 'bg-orange-500 text-black border-orange-500 scale-105 shadow-orange-500/30 shadow-lg' : 'border-gray-800 text-gray-500 hover:border-orange-500'}`}>{r}</button>
                  ))}
                </div>
              </div>
              {/* --- 修正箇所: max-h-40をmax-h-96に広げ、曲用メモ欄を追加 --- */}
              <div className={`px-6 sm:px-14 transition-all duration-300 ease-in-out bg-black/20 ${expandedTrack === i ? 'max-h-96 pb-5 pt-2 opacity-100 border-t border-gray-800/50' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="space-y-4 pt-3">
                  <div className="space-y-2">
                    <div className="flex gap-2 text-[8px] md:text-[9px] uppercase tracking-[0.2em]"><span className="text-orange-500/40 font-black italic">Producers</span><span className="text-gray-500 font-bold">Data syncing...</span></div>
                    <div className="flex gap-2 text-[8px] md:text-[9px] uppercase tracking-[0.2em]"><span className="text-orange-500/40 font-black italic">Writers</span><span className="text-gray-500 font-bold">Data syncing...</span></div>
                  </div>
                  {/* --- 追加箇所: 各曲の説明文 --- */}
                  <textarea 
                    value={trackNotes[i] || ""}
                    onChange={(e) => setTrackNotes({...trackNotes, [i]: e.target.value})}
                    placeholder="Track review or lyrics translation..."
                    className="w-full bg-black/40 border border-gray-800/50 rounded-lg p-3 text-[10px] md:text-xs text-gray-400 focus:outline-none focus:border-orange-500/50 transition-all resize-none placeholder:text-gray-800 italic font-bold"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}