"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ArtistPage() {
  const { id } = useParams();
  const [artist, setArtist] = useState<any>(null);
  const [albums, setAlbums] = useState<any[]>([]);
  const [myRankings, setMyRankings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // ホーム画面と共通の10点満点計算ロジック
  const calculateScore = (ratings: any, tracks: any[]) => {
    if (!ratings || !tracks || tracks.length === 0) return "0.0";
    const rankMap: { [key: string]: number } = { "S": 5, "A": 4, "B": 3, "C": 2, "D": 1 };
    let totalPoints = 0, validTrackCount = 0;
    Object.values(ratings).forEach((rank: any) => {
      if (rank !== "-" && rankMap[rank]) {
        totalPoints += rankMap[rank];
        validTrackCount++;
      }
    });
    if (validTrackCount === 0) return "0.0";
    return ((totalPoints / (validTrackCount * 5)) * 10).toFixed(1);
  };

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!id) return;
      setIsLoading(true);
      setErrorMsg("");
      try {
        const res = await fetch(`/api/artist-details?id=${id}`);
        const data = await res.json();
        
        if (!res.ok) {
          setErrorMsg(data.error || "Failed to load artist");
        } else {
          setArtist(data.artist);
          setAlbums(data.albums);

          const savedReviews = JSON.parse(localStorage.getItem('my-digs-reviews') || '[]');
          const filtered = savedReviews
            .filter((rev: any) => String(rev.artistId) === String(id))
            .sort((a: any, b: any) => b.score - a.score);
          setMyRankings(filtered);
        }
      } catch (e) {
        setErrorMsg("Network Error. Please try again.");
      }
      setIsLoading(false);
    };
    fetchArtistData();
  }, [id]);

  if (isLoading) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-orange-500 font-black tracking-widest animate-pulse">DIGGING...</div>;

  if (errorMsg) return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-6">
      <h2 className="text-orange-500 font-black text-2xl mb-4">ERROR: {errorMsg}</h2>
      <Link href="/review" className="text-gray-500 underline uppercase text-xs font-bold transition-colors hover:text-orange-500">Back to Search</Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#121212] text-white p-6 md:p-12 font-sans overflow-x-hidden text-left">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <Link href="/" className="text-gray-500 hover:text-orange-500 text-xs font-bold uppercase transition-colors">← Library</Link>
          <h1 className="text-xl font-black italic text-orange-500 uppercase leading-none">MY DIGS.</h1>
        </header>

        {/* アーティストヘッダー */}
        <div className="relative h-64 md:h-80 w-full mb-16 overflow-hidden rounded-[2rem] border border-gray-800 shadow-2xl bg-gray-900">
          {artist?.images[0]?.url && (
            <img src={artist.images[0].url} className="w-full h-full object-cover opacity-20 blur-xl scale-110" alt="" />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white uppercase text-center px-4 leading-none">
              {artist?.name || "Unknown Artist"}
            </h1>
          </div>
        </div>

        {/* --- MY RANKINGS --- */}
        {myRankings.length > 0 && (
          <section className="mb-20">
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
              My Rankings <div className="flex-1 h-px bg-orange-500/20"></div>
            </h2>
            <div className="grid gap-4">
              {myRankings.map((rev, i) => (
                <Link key={rev.id} href={`/review/${rev.id}`} className="group flex items-center bg-[#1a1a1a] p-4 rounded-3xl border border-gray-800 hover:border-orange-500/50 transition-all">
                  
                  {/* --- 【修正ポイント】順位の数字を大きくして左にずらす --- */}
                  <div className="flex-none w-14 text-4xl font-black italic text-orange-500/20 group-hover:text-orange-500 transition-colors -ml-4 mr-2 flex items-center justify-center">
                    #{i + 1}
                  </div>
                  
                  <img src={rev.image} className="w-16 h-16 rounded-xl object-cover mr-6 shadow-xl flex-none" alt="" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg uppercase italic truncate group-hover:text-orange-500 transition-colors">{rev.title}</h3>
                  </div>
                  <div className="text-right ml-4 flex-none">
                    <div className="text-3xl font-black text-orange-500 italic">
                      {calculateScore(rev.ratings, rev.tracks)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ディスコグラフィー */}
        <section>
          <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8 pb-4 border-b border-gray-900">Discography</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {albums.map((album) => {
              const isRated = myRankings.some(r => String(r.id) === String(album.id));
              return (
                <div key={album.id} className="group relative">
                  <Link href={`/review?id=${album.id}`}>
                    <div className={`aspect-square mb-4 overflow-hidden rounded-2xl border transition-all duration-500 shadow-xl 
                      ${isRated ? 'border-orange-500 shadow-orange-500/20' : 'border-gray-800 group-hover:border-gray-500'}`}>
                      <img 
                        src={album.images[0]?.url} 
                        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 
                          ${isRated ? '' : 'grayscale hover:grayscale-0'}`} 
                        alt="" 
                      />
                      {isRated && (
                        <div className="absolute top-3 right-3 bg-orange-500 text-black text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg">
                          DIGGED
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-[11px] line-clamp-2 leading-tight group-hover:text-orange-500 transition-colors">
                      {album.name}
                    </h3>
                    <p className="text-[10px] text-gray-600 font-bold mt-2">
                      {new Date(album.release_date).getFullYear()}
                    </p>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}