"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openGenre, setOpenGenre] = useState<string | null>(null);
  const router = useRouter();
  
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const trendRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchPersonalizedReleases = async () => {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const { data: reviews, error } = await supabase
          .from('reviews')
          .select('*') 
          .eq('user_id', user.id);

        // --- 修正箇所: iTunesのデータを、君のUIが読める形（id, name, image）に変換する関数 ---
        const formatAlbumData = (results: any[]) => {
          return results.map(item => ({
            id: item.collectionId,
            name: item.collectionName,
            artist: item.artistName,
            // 画質を美しくするために、100x100の画像を600x600に書き換えて取得
            image: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : ''
          }));
        };

        if (error || !reviews || reviews.length === 0) {
          const fallbackRes = await fetch(`https://itunes.apple.com/search?term=Hip+Hop&entity=album&limit=10&country=JP&lang=en_us`);
          const fallbackData = await fallbackRes.json();
          // フォーマット関数を通す
          setTrends(formatAlbumData(fallbackData.results || []));
          setReviews([]);
          setIsLoading(false);
          return;
        }

        setReviews(reviews);

        // 一番聴いているジャンル（トップジャンル）を計算
        const genreCounts: { [key: string]: number } = {};
        reviews.forEach(r => {
          const g = r.genre || "Hip Hop";
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
        const topGenre = Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b);

        // 一番高得点を付けたアーティスト（お気に入り）を計算
        let topArtist = reviews[0].artist;
        let maxScore = -1;
        reviews.forEach(r => {
          if (r.score > maxScore) {
            maxScore = r.score;
            topArtist = r.artist;
          }
        });

        // iTunes APIに「8:2」の割合でデータを要求
        const genreRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(topGenre)}&entity=album&limit=8&country=JP&lang=en_us`);
        const genreData = await genreRes.json();
        // フォーマット関数を通す
        const genreAlbums = formatAlbumData(genreData.results || []);

        const artistRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(topArtist)}&entity=album&limit=2&country=JP&lang=en_us`);
        const artistData = await artistRes.json();
        // フォーマット関数を通す
        const artistAlbums = formatAlbumData(artistData.results || []);

        // 合体させてシャッフル
        const combinedReleases = [...genreAlbums, ...artistAlbums];
        const shuffled = combinedReleases.sort(() => 0.5 - Math.random());

        setTrends(shuffled);

      } catch (error) {
        console.error("Personalized fetch failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonalizedReleases();
  }, [router]);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      ref.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  const isEP = (title: string) => {
    const t = title.toLowerCase();
    return t.endsWith('-ep') || t.endsWith(' - ep');
  };

  const sortedByScore = [...reviews].sort((a, b) => b.score - a.score);
  const recentDigs = [...reviews].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  const topEPs = sortedByScore.filter(rev => isEP(rev.title)).slice(0, 10);
  const topLPs = sortedByScore.filter(rev => !isEP(rev.title)).slice(0, 10);

  const genres = [
    { title: "The Scene / Hip-Hop", id: "hiphop", data: sortedByScore.filter(r => !isEP(r.title) && (r.genre?.includes('Hip Hop') || r.genre?.includes('Rap')) && !r.genre?.includes('J-')).slice(0, 5) },
    { title: "The Scene / Rock", id: "rock", data: sortedByScore.filter(r => !isEP(r.title) && r.genre?.includes('Rock') && !r.genre?.includes('J-')).slice(0, 5) },
    { title: "The Scene / R&B & Soul", id: "rb", data: sortedByScore.filter(r => !isEP(r.title) && (r.genre?.includes('R&B') || r.genre?.includes('Soul'))).slice(0, 5) },
    { title: "The Scene / Electronic", id: "elec", data: sortedByScore.filter(r => !isEP(r.title) && (r.genre?.includes('Electronic') || r.genre?.includes('Dance'))).slice(0, 5) },
    { title: "The Scene / J-Hip Hop", id: "jhiphop", data: sortedByScore.filter(r => !isEP(r.title) && r.genre === 'J-Hip Hop').slice(0, 5) },
    { title: "The Scene / J-Rock", id: "jrock", data: sortedByScore.filter(r => !isEP(r.title) && r.genre === 'J-Rock').slice(0, 5) },
    { title: "The Scene / J-Pop", id: "jpop", data: sortedByScore.filter(r => !isEP(r.title) && r.genre === 'J-Pop').slice(0, 5) }
  ];

  if (isLoading) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-orange-500 font-black italic animate-pulse">SYNCING ARCHIVE...</div>;

  return (
    <main className="min-h-screen bg-[#121212] text-white p-4 md:p-8 font-sans overflow-x-hidden text-left pt-12 md:pt-8">
      <div className="max-w-6xl mx-auto space-y-20 md:space-y-32">
        
        <header className="flex justify-between items-center mb-8">
          <div className="text-left">
            <h1 className="text-xl md:text-2xl font-black italic tracking-tighter text-orange-500 uppercase leading-none">MY DIGS.</h1>
            <p className="text-[7px] text-gray-600 font-bold uppercase tracking-[0.3em] mt-1">Micro Archive // 2026</p>
          </div>
          <div className="flex gap-2">
            <Link href="/ranking" className="flex border border-gray-800 hover:border-orange-500 text-gray-500 px-3 py-2 rounded-xl font-black text-[8px] md:text-[9px] transition-all items-center italic uppercase">Global Ranking</Link>
            <Link href="/review" className="bg-orange-500 text-black px-3 py-2 rounded-xl font-black text-[8px] md:text-[10px] transition-all">+ NEW DIG</Link>
          </div>
        </header>

        <section className="relative">
          <h2 className="text-[10px] font-black border-l-2 border-orange-500 pl-3 uppercase tracking-[0.2em] text-gray-500 mb-6">Recent Collection</h2>
          <div ref={carouselRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
            {recentDigs.map((rev) => (
              <div key={rev.id} className="flex-none w-[130px] md:w-[140px] group text-left">
                <Link href={`/review/${rev.id}`} className="block aspect-square rounded-lg overflow-hidden mb-3 bg-gray-900 border border-white/5 transition-all group-hover:border-orange-500/50">
                  <img src={rev.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                </Link>
                <h3 className="font-bold text-[9px] uppercase italic truncate mb-0.5">{rev.title}</h3>
                <Link href={`/artist/${rev.artist_id}`} className="text-[8px] text-gray-600 font-bold uppercase truncate block hover:text-orange-500 transition-colors">{rev.artist}</Link>
                <span className="text-lg font-black text-orange-500 italic">{rev.score.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </section>

        <RankingSection title="The Grails / LPs" data={topLPs} />
        <RankingSection title="Short Archive / EPs" data={topEPs} />

        <section className="relative">
          <h2 className="text-[10px] font-black border-l-2 border-orange-500 pl-3 uppercase tracking-[0.2em] text-gray-500 mb-6">New Release</h2>
          <div ref={trendRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
            {trends.map((album) => (
              <Link href={`/review?id=${album.id}`} key={album.id} className="flex-none w-[160px] md:w-[180px] group">
                <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-900 border border-gray-800 relative shadow-2xl group-hover:border-orange-500 transition-all">
                  <img src={album.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-[7px] text-orange-500 font-black italic uppercase mb-1">New Entry</p>
                    <h3 className="font-black text-[9px] uppercase italic truncate">{album.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="space-y-12 md:space-y-32">
          {genres.map((g, idx) => (
            <div key={idx} className="space-y-8">
              <button 
                onClick={() => setOpenGenre(openGenre === g.id ? null : g.id)}
                className="w-full flex md:hidden justify-between items-center text-[10px] font-black border-l-2 border-orange-500 pl-3 uppercase tracking-[0.2em] text-gray-500 py-2"
              >
                <span>{g.title}</span>
                <span className={`text-[8px] transition-transform ${openGenre === g.id ? 'rotate-180' : ''}`}>▼</span>
              </button>
              <div className={`${openGenre === g.id ? 'block' : 'hidden'} md:block transition-all`}>
                <RankingSection title={g.title} data={g.data} hideTitleOnMobile={true} />
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-20 border-t border-gray-900 pt-10 flex gap-12 opacity-50">
          <div><div className="text-2xl md:text-3xl font-black text-white">{reviews.length}</div><div className="text-[7px] text-gray-600 uppercase font-bold tracking-[0.2em]">Total Archive</div></div>
          <div><div className="text-2xl md:text-3xl font-black text-white">{reviews.reduce((acc, curr) => acc + (curr.tracks?.length || 0), 0)}</div><div className="text-[7px] text-gray-600 uppercase font-bold tracking-[0.2em]">Tracks Logged</div></div>
        </footer>
      </div>
    </main>
  );
}

function RankingSection({ title, data, hideTitleOnMobile = false }: { title: string, data: any[], hideTitleOnMobile?: boolean }) {
  if (data.length === 0) return null;
  return (
    <section>
      <h2 className={`text-[10px] font-black border-l-2 border-orange-500 pl-3 uppercase tracking-[0.2em] text-gray-500 mb-8 ${hideTitleOnMobile ? 'hidden md:block' : 'block'}`}>{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
        {data.map((review, index) => {
          // --- 修正箇所: スコアに基づいた同率順位を計算 ---
          const displayRank = data.findIndex(r => r.score === review.score) + 1;
          
          return (
            <div key={review.id} className="group relative">
              <Link href={`/review/${review.id}`}>
                <div className="relative aspect-square mb-3 rounded-[1.2rem] overflow-hidden bg-gray-900 border border-gray-800 shadow-xl group-hover:border-orange-500 transition-all">
                  <img src={review.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                  {/* index + 1 ではなく displayRank を表示 */}
                  <div className="absolute top-2 left-2 bg-black/80 text-white w-6 h-6 flex items-center justify-center rounded-full font-black italic text-[8px] border border-white/10">#{displayRank}</div>
                  <div className="absolute bottom-2 right-2 bg-orange-500 text-black font-black italic px-1.5 py-0.5 rounded-lg text-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-2xl">
                    {review.score.toFixed(1)}
                  </div>
                </div>
                <h3 className="px-1 font-black text-[9px] md:text-[10px] uppercase italic truncate mb-0.5 group-hover:text-orange-500 transition-colors">{review.title}</h3>
              </Link>
              <Link href={`/artist/${review.artist_id || review.artistId}`} className="px-1 text-[7px] text-gray-600 font-bold uppercase truncate block hover:text-orange-500 transition-colors">{review.artist}</Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}