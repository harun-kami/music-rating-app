import React from 'react';
import Image from 'next/image';

// ダミーデータ（後にSupabaseから取得する想定）
const userData = {
  name: "EVENSTILLDIGGIN",
  image: "/profile-placeholder.png", // プロフィール画像パス
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
    <div className="min-height-screen bg-[#000000] text-white font-sans selection:bg-[#ff6b00]">
      {/* 1. Header Area (Authentication // Secure Archive の下に来る想定) */}
      <div className="max-w-4xl mx-auto pt-16 px-6">
        <div className="flex flex-col items-center md:items-start md:flex-row gap-8 mb-16">
          {/* Profile Image */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 border border-[#1a1a1a] rounded-full overflow-hidden bg-[#121212]">
            {/* 実際は Next/Image を使用 */}
            <div className="w-full h-full flex items-center justify-center text-[#444444]">
              <span className="text-xs uppercase tracking-widest">No Image</span>
            </div>
          </div>

          {/* Username & ID */}
          <div className="flex flex-col justify-center text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2">
              {userData.name}.
            </h1>
            <p className="text-[#ff6b00] text-sm md:text-base font-bold tracking-[0.3em] uppercase">
              Collector // Digger
            </p>
          </div>
        </div>

        {/* 2. Genetic Tags (Attributes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <section>
            <h3 className="text-[#444444] text-[10px] font-bold tracking-[0.2em] uppercase mb-4 border-b border-[#1a1a1a] pb-2">
              Favorite Genres
            </h3>
            <div className="flex flex-wrap gap-2">
              {userData.genres.map((genre) => (
                <span key={genre} className="text-xs font-medium tracking-widest text-[#888888] bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-1 hover:border-[#ff6b00] hover:text-white transition-colors">
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
                <span key={artist} className="text-xs font-medium tracking-widest text-[#888888] bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-1 hover:border-[#ff6b00] hover:text-white transition-colors">
                  {artist}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* 3. The Trinity (Top 3 Albums) */}
        <section className="mb-24">
          <h3 className="text-[#ff6b00] text-[10px] font-bold tracking-[0.4em] uppercase mb-8 text-center">
            — THE HOLY TRINITY —
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userData.trinity.map((album) => (
              <div key={album.id} className="group relative">
                <div className="aspect-square w-full relative bg-[#121212] border border-[#1a1a1a] overflow-hidden transition-all duration-500 group-hover:border-[#ff6b00]">
                  {/* Album Cover Placeholder */}
                  <div className="w-full h-full flex items-center justify-center text-[#222222] group-hover:text-[#444444] transition-colors">
                     <span className="text-[10px] tracking-[0.5em] uppercase font-bold rotate-90 md:rotate-0">Artwork</span>
                  </div>
                </div>
                <div className="mt-4 opacity-60 group-hover:opacity-100 transition-opacity">
                  <h4 className="text-[11px] font-black tracking-widest uppercase truncate">{album.title}</h4>
                  <p className="text-[9px] text-[#888888] tracking-widest uppercase">{album.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer / Branding */}
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