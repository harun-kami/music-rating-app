import React from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Link を追加

// ダミーデータ
const userData = {
  name: "EVENSTILLDIGGIN",
  image: "/profile-placeholder.png",
  genres: ["BOOM BAP", "JAZZ RAP", "PHONK", "AMBIENT"],
  artists: ["KANYE WEST", "KENDRICK LAMAR", "SABA", "MADLIB"],
  trinity: [
    { id: 1, title: "MBDTF", artist: "KANYE WEST", cover: "/covers/mbdtf.jpg" },
    { id: 2, title: "TPAB", artist: "KENDRICK LAMAR", cover: "/covers/tpab.jpg" },
    { id: 3, title: "CARE FOR ME", artist: "SABA", cover: "/covers/saba.jpg" },
  ]
};

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-[#ff6b00]">
      {/* 1. Header Area */}
      <div className="max-w-4xl mx-auto pt-16 px-6">
        <div className="flex flex-col items-center md:items-start md:flex-row gap-8 mb-16">
          
          {/* Avatar */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 border border-[#1a1a1a] rounded-full overflow-hidden bg-[#121212]">
            <div className="w-full h-full flex items-center justify-center text-[#444444]">
              <span className="text-xs uppercase tracking-widest">No Image</span>
            </div>
          </div>

          {/* Username & Edit Link */}
          <div className="flex flex-col justify-center text-center md:text-left flex-grow">
            <div className="flex items-baseline justify-center md:justify-start gap-4">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2">
                {userData.name}.
              </h1>
              
              {/* --- 追加: 編集画面へのステルスなリンク --- */}
              <Link 
                href="/profile/edit" 
                className="text-[9px] font-bold tracking-[0.2em] text-[#444444] border border-[#1a1a1a] px-2 py-1 hover:text-[#ff6b00] hover:border-[#ff6b00] transition-all uppercase mb-2"
              >
                Edit
              </Link>
            </div>
            
            <p className="text-[#ff6b00] text-sm md:text-base font-bold tracking-[0.3em] uppercase">
              Collector // Digger
            </p>
          </div>
        </div>

        {/* 2. Genetic Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <section>
            <h3 className="text-[#444444] text-[10px] font-bold tracking-[0.2em] uppercase mb-4 border-b border-[#1a1a1a] pb-2">
              Favorite Genres
            </h3>
            <div className="flex flex-wrap gap-2">
              {userData.genres.map((genre) => (
                <span key={genre} className="text-xs font-medium tracking-widest text-[#888888] bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-1">
                  {genre}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[#444444] text-[10px] font-bold tracking-[0.2em] uppercase mb-4 border-b border-[#1a1a1a] pb-2">
              Core Artists
            </h3>
            <div className="flex flex-wrap gap-2">
              {userData.artists.map((artist) => (
                <span key={artist} className="text-xs font-medium tracking-widest text-[#888888] bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-1">
                  {artist}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* 3. The Trinity */}
        <section className="mb-24">
          <h3 className="text-[#ff6b00] text-[10px] font-bold tracking-[0.4em] uppercase mb-8 text-center">
            — THE HOLY TRINITY —
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userData.trinity.map((album) => (
              <div key={album.id} className="group relative">
                <div className="aspect-square w-full relative bg-[#121212] border border-[#1a1a1a] overflow-hidden group-hover:border-[#ff6b00] transition-all duration-500">
                  <div className="w-full h-full flex items-center justify-center text-[#222222]">
                     <span className="text-[10px] tracking-[0.5em] uppercase font-bold">Artwork</span>
                  </div>
                </div>
                <div className="mt-4 opacity-60">
                  <h4 className="text-[11px] font-black tracking-widest uppercase truncate">{album.title}</h4>
                  <p className="text-[9px] text-[#888888] tracking-widest uppercase">{album.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-12 pb-24 border-t border-[#1a1a1a] text-center">
          <p className="text-[#222222] text-[10px] font-bold tracking-[0.5em] uppercase italic">
            MY DIGS. // Micro Archive Identity System
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;