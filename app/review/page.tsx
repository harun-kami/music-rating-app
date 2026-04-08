"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ReviewContent() {
  const searchParams = useSearchParams();
  const autoAlbumId = searchParams.get('id');
  
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // URLにIDがある場合に自動読み込みするロジック
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
        }
      } catch (e) {
        console.error("Auto-load failed:", e);
      }
      setIsLoading(false);
    };

    fetchAlbumDetails();
  }, [autoAlbumId, selectedAlbum]);

  if (isLoading) return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center text-orange-500 font-black animate-pulse">
      LOADING ALBUM DATA...
    </div>
  );

  return (
    <main className="min-h-screen bg-[#121212] text-white p-6">
      {!selectedAlbum ? (
        <div className="max-w-4xl mx-auto pt-20 text-center">
           <h1 className="text-gray-800 text-6xl font-black italic mb-8">SEARCH ALBUM</h1>
           <p className="text-gray-500">アーティストページからアルバムを選択するか、ここで検索してください。</p>
           {/* ここに検索バーのコンポーネントがあれば追加 */}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setSelectedAlbum(null)}
            className="text-xs font-bold text-gray-500 hover:text-white mb-8"
          >
            ← BACK TO SEARCH
          </button>
          
          <div className="flex gap-8 items-end mb-12">
            <img src={selectedAlbum.image} className="w-48 h-48 rounded-2xl shadow-2xl border border-gray-800" alt="" />
            <div className="text-left">
              <h1 className="text-4xl font-black italic uppercase leading-none mb-2">{selectedAlbum.title}</h1>
              <p className="text-orange-500 font-bold uppercase tracking-widest">{selectedAlbum.artist}</p>
            </div>
          </div>
          
          {/* 評価UI（S/A/B/C/Dなど）をここに実装 */}
          <div className="bg-gray-900/50 p-8 rounded-[2rem] border border-gray-800">
             <p className="text-gray-400 italic">ここにトラックごとの評価UIが表示されます</p>
          </div>
        </div>
      )}
    </main>
  );
}

// これが一番大事！Next.jsはこの default export を探しています
export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="bg-[#121212] min-h-screen" />}>
      <ReviewContent />
    </Suspense>
  );
}