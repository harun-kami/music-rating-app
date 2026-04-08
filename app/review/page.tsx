"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // useRouterを追加

function ReviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter(); // URLを操作するために追加
  const autoAlbumId = searchParams.get('id');
  
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ratings, setRatings] = useState<{ [key: string]: string }>({});

  // 1. 自動読み込みロジック
  useEffect(() => {
    const fetchAlbumDetails = async () => {
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
          // 初期評価を "-" でセット
          const initialRatings: any = {};
          data.tracks.forEach((track: string) => { initialRatings[track] = "-"; });
          setRatings(initialRatings);
        }
      } catch (e) { console.error("Load error:", e); }
      setIsLoading(false);
    };
    fetchAlbumDetails();
  }, [autoAlbumId, selectedAlbum]);

  // Backボタンの処理（URLのIDを消して検索に戻る）
  const handleBack = () => {
    setSelectedAlbum(null);
    router.push('/review'); // これで ?id=... が消えて確実に検索画面に戻れる
  };

  const handleRate = (track: string, rank: string) => {
    setRatings(prev => ({ ...prev, [track]: rank }));
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center text-orange-500 font-black animate-pulse">
      DIGGING TRACKS...
    </div>
  );

  return (
    <main className="min-h-screen bg-[#121212] text-white p-6">
      {!selectedAlbum ? (
        <div className="max-w-4xl mx-auto pt-20 text-center">
           <h1 className="text-gray-800 text-6xl font-black italic mb-8">SEARCH ALBUM</h1>
           {/* ここにあなたの元の検索バーのコードがあれば入れてください */}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {/* BACK ボタンの復活 */}
          <button 
            onClick={handleBack}
            className="text-[10px] font-black text-gray-500 hover:text-orange-500 mb-12 flex items-center gap-2 transition-colors uppercase tracking-widest"
          >
            ← BACK TO SEARCH
          </button>
          
          {/* アルバムヘッダー */}
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end mb-16">
            <img src={selectedAlbum.image} className="w-48 h-48 md:w-64 md:h-64 rounded-[2rem] shadow-2xl border border-gray-800" alt="" />
            <div className="text-left">
              <h1 className="text-4xl md:text-6xl font-black italic uppercase leading-[0.9] mb-4 tracking-tighter">
                {selectedAlbum.title}
              </h1>
              <p className="text-orange-500 font-black uppercase tracking-[0.3em] italic">
                {selectedAlbum.artist}
              </p>
            </div>
          </div>
          
          {/* トラックリスト評価エリア */}
          <div className="space-y-4 mb-20">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] mb-8 pb-4 border-b border-gray-900">Tracklist Rating</h2>
            {selectedAlbum.tracks.map((track: string, index: number) => (
              <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl bg-[#1a1a1a] border border-gray-900 hover:border-gray-800 transition-colors">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <span className="text-gray-700 font-black italic w-6">{String(index + 1).padStart(2, '0')}</span>
                  <span className="font-bold uppercase text-sm tracking-tight truncate max-w-[250px]">{track}</span>
                </div>
                
                <div className="flex gap-2">
                  {['S', 'A', 'B', 'C', 'D'].map((rank) => (
                    <button
                      key={rank}
                      onClick={() => handleRate(track, rank)}
                      className={`w-10 h-10 rounded-full font-black text-xs transition-all ${
                        ratings[track] === rank 
                        ? 'bg-orange-500 text-black scale-110 shadow-[0_0_15px_rgba(249,115,22,0.5)]' 
                        : 'bg-gray-900 text-gray-600 hover:text-white'
                      }`}
                    >
                      {rank}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 保存ボタン */}
          <button className="w-full bg-orange-500 text-black py-6 rounded-3xl font-black italic text-xl hover:bg-white transition-all shadow-2xl mb-20">
            SAVE THIS DIG.
          </button>
        </div>
      )}
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