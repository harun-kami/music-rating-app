"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// --- searchParams を使うために Suspense で囲む必要があります ---
function ReviewContent() {
  const searchParams = useSearchParams();
  const autoAlbumId = searchParams.get('id'); // アーティストページからの ID をキャッチ
  
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- 【重要】URLにIDがあったら自動でアルバム情報を取得するロジック ---
  useEffect(() => {
    const fetchAlbumDetails = async () => {
      if (!autoAlbumId || selectedAlbum) return;
      
      setIsLoading(true);
      try {
        // あなたのAPI構成に合わせて取得先を調整してください
        // 例: Spotify API を叩くプロキシAPIなど
        const res = await fetch(`/api/album-details?id=${autoAlbumId}`);
        const data = await res.json();
        
        if (res.ok) {
          // 取得したデータを評価用ステートにセット
          setSelectedAlbum({
            id: data.id,
            title: data.name,
            artist: data.artists[0].name,
            image: data.images[0].url,
            tracks: data.tracks.items.map((t: any) => t.name),
            artistId: data.artists[0].id
          });
        }
      } catch (e) {
        console.error("Failed to auto-load album", e);
      }
      setIsLoading(false);
    };

    fetchAlbumDetails();
  }, [autoAlbumId]);

  if (isLoading) return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center text-orange-500 font-black animate-pulse">
      LOADING ALBUM DATA...
    </div>
  );

  return (
    <main className="min-h-screen bg-[#121212] text-white p-6">
      {/* 1. アルバムが未選択なら、いつもの検索バーを出す */}
      {!selectedAlbum ? (
        <div className="max-w-4xl mx-auto pt-20">
           {/* ここに元の検索バーのコードを入れてください */}
           <h1 className="text-gray-800 text-6xl font-black italic mb-8">SEARCH ALBUM</h1>
           {/* ... 検索入力欄など ... */}
        </div>
      ) : (
        /* 2. アルバムが選択済み（自動読み込み含む）なら、評価画面を出す */
        <div className="max-w-4xl mx-auto">
          {/* ここに元の「評価・スコアリング」のUIコードを入れてください */}
          <button 
            onClick={() => setSelectedAlbum(null)}
            className="text-xs font-bold text-gray-500 hover:text-white mb-8"
          >
            ← BACK TO SEARCH
          </button>
          
          <div className="flex gap-8 items-end mb-12">
            <img src={selectedAlbum.image} className="w-48 h-48 rounded-2xl shadow-2xl" alt="" />
            <div className="text-left">
              <h1 className="text-4xl font-black italic uppercase leading-none mb-2">{selectedAlbum.title}</h1>
              <p className="text-orange-500 font-bold uppercase tracking-widest">{selectedAlbum.artist}</p>
            </div>
          </div>

          {/* --- ここにトラックごとの S/A/B/C/D 評価UIが続く --- */}
        </div>
      )}
    </main>
  );
}

// Next.jsのルールで、useSearchParams を使う場合は全体を Suspense で囲む必要があります
export default function ReviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewContent />
    </Suspense>
  );
}