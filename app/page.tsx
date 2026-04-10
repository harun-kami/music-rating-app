"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Home() {
  // ...既存のfetch処理などはそのまま

  // --- 追加ロジック: カテゴリ分け ---
  
  // 1. スコア順にソートした全データ
  const sortedAll = [...reviews].sort((a, b) => b.score - a.score);

  // 2. EP (タイトルに " - EP" または "- EP" が含まれる)
  const topEPs = sortedAll
    .filter(rev => rev.title.toLowerCase().includes('ep'))
    .slice(0, 10);

  // 3. LP (EP以外)
  const topLPs = sortedAll
    .filter(rev => !rev.title.toLowerCase().includes('ep'))
    .slice(0, 10);

  // 4. ジャンル別 (Supabaseにgenreカラムがある前提)
  const topHiphop = sortedAll
    .filter(rev => rev.genre?.includes('Hip Hop') || rev.genre?.includes('Rap'))
    .slice(0, 10);
    
  const topRock = sortedAll
    .filter(rev => rev.genre?.includes('Rock'))
    .slice(0, 10);

  // 5. 日本のヒップホップ (アーティスト名やジャンル名で判定)
  // iTunesでは「J-Pop」の中にヒップホップが含まれることが多いので、
  // genre が "J-Pop" かつ、Hip Hop系のキーワードを含むものを抽出
  const topJiphop = sortedAll
    .filter(rev => rev.genre?.includes('J-Pop') || rev.genre?.includes('World'))
    .filter(rev => rev.title.includes('ヒップホップ') || /* 手動タグ付けができるとより正確です */ true)
    .slice(0, 10);

  // ... 既存の return (
  // <main> ... </header>
  // {reviews.length === 0 ? (...) : (
  // <div className="space-y-20">
  //   {/* --- SECTION 1: RECENT --- */}
  //   ...
  
  return (
    <main className="...">
      <div className="max-w-6xl mx-auto">
        {/* --- HEADER --- */}
        {/* 既存のコード */}

        {reviews.length === 0 ? (
          /* 既存の空表示 */
        ) : (
          <div className="space-y-32"> {/* セクション間の余白を広げて視認性を確保 */}

            {/* 1. RECENT (既存) */}
            <section className="..."> {/* 既存のRecent Collection */}</section>

            {/* 2. THE GRAILS / LPs (フルアルバム) */}
            <RankingSection title="The Grails / LPs" data={topLPs} />

            {/* 3. THE SHORT FILMS / EPs (EP作品) */}
            <RankingSection title="Short Archive / EPs" data={topEPs} />

            {/* 4. THE SCENE / HIP-HOP */}
            <RankingSection title="The Scene / Hip-Hop" data={topHiphop} />

            {/* 5. THE SCENE / ROCK */}
            <RankingSection title="The Scene / Rock" data={topRock} />

          </div>
        )}
        {/* --- FOOTER --- */}
      </div>
    </main>
  );
}

// 既存のグリッドレイアウトを再利用するためのサブコンポーネント（既存コードのコピペで作成）
function RankingSection({ title, data }: { title: string, data: any[] }) {
  if (data.length === 0) return null;
  return (
    <section>
      <h2 className="text-[10px] font-black border-l-2 border-orange-500 pl-3 uppercase tracking-[0.2em] text-gray-500 mb-8 text-left">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {data.map((review, index) => (
          <Link href={`/review/${review.id}`} key={review.id} className="group relative">
            <div className="relative aspect-square mb-4 rounded-[1.5rem] overflow-hidden bg-gray-900 border border-gray-800 transition-all group-hover:border-orange-500">
              <img src={review.image} className="w-full h-h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white w-8 h-8 flex items-center justify-center rounded-full font-black italic text-[10px] border border-white/10">
                #{index + 1}
              </div>
              <div className="absolute bottom-3 right-3 bg-orange-500 text-black font-black italic px-2 py-1 rounded-lg text-[9px] shadow-2xl">
                {review.score.toFixed(1)}
              </div>
            </div>
            <div className="px-2 text-left">
              <h3 className="font-black text-[10px] md:text-xs uppercase italic truncate mb-1 group-hover:text-orange-500 transition-colors">{review.title}</h3>
              <p className="text-[9px] text-gray-600 font-bold uppercase truncate">{review.artist}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

        {/* --- ORIGINAL FOOTER --- */}
        <footer className="mt-20 border-t border-gray-900 pt-10 flex gap-12 text-left">
          <div>
            <div className="text-3xl font-black text-white">{reviews.length}</div>
            <div className="text-[8px] text-gray-600 uppercase font-bold tracking-[0.2em] mt-1">Total Archive</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">
              {reviews.reduce((acc, curr) => acc + (curr.tracks?.length || 0), 0)}
            </div>
            <div className="text-[8px] text-gray-600 uppercase font-bold tracking-[0.2em] mt-1">Tracks Logged</div>
          </div>
        </footer>

      </div>
    </main>
  );
}