import React from 'react';

const ProfileEditPage = () => {
  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-[#ff6b00]">
      <div className="max-w-3xl mx-auto pt-16 px-6 pb-24">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase mb-12 border-b border-[#1a1a1a] pb-4 text-[#888888]">
          Edit Identity <span className="text-[#ff6b00]">//</span>
        </h1>

        <form className="space-y-12">
          {/* 1. Avatar / Icon Image */}
          <div>
            <label className="block text-[#444444] text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
              Icon Image
            </label>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-[#121212] border border-[#1a1a1a] rounded-full flex items-center justify-center text-[#444444]">
                <span className="text-[9px] uppercase tracking-widest">Select</span>
              </div>
              <input 
                type="file" 
                accept="image/*"
                className="text-xs text-[#888888] file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-medium file:bg-[#121212] file:text-[#ff6b00] hover:file:bg-[#1a1a1a] cursor-pointer transition-colors"
              />
            </div>
          </div>

          {/* 2. Account Name */}
          <div>
            <label className="block text-[#444444] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
              Account Name
            </label>
            <input 
              type="text" 
              placeholder="EVENSTILLDIGGIN"
              className="w-full bg-[#121212] border border-[#1a1a1a] px-4 py-3 text-white placeholder-[#444444] text-sm tracking-widest uppercase focus:outline-none focus:border-[#ff6b00] transition-colors"
            />
          </div>

          {/* 3. Favorite Genres */}
          <div>
            <label className="block text-[#444444] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
              Favorite Genres <span className="text-[#888888]">(Comma separated)</span>
            </label>
            <input 
              type="text" 
              placeholder="BOOM BAP, JAZZ RAP, PHONK, AMBIENT"
              className="w-full bg-[#121212] border border-[#1a1a1a] px-4 py-3 text-white placeholder-[#444444] text-sm tracking-widest uppercase focus:outline-none focus:border-[#ff6b00] transition-colors"
            />
          </div>

          {/* 4. Core Artists */}
          <div>
            <label className="block text-[#444444] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
              Core Artists <span className="text-[#888888]">(Comma separated)</span>
            </label>
            <input 
              type="text" 
              placeholder="KANYE WEST, KENDRICK LAMAR, SABA, MADLIB"
              className="w-full bg-[#121212] border border-[#1a1a1a] px-4 py-3 text-white placeholder-[#444444] text-sm tracking-widest uppercase focus:outline-none focus:border-[#ff6b00] transition-colors"
            />
          </div>

          {/* 5. The Trinity Selection */}
          <div>
            <label className="block text-[#ff6b00] text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
              The Holy Trinity <span className="text-[#888888]">(All-Time Top 3)</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((num) => (
                <div 
                  key={num} 
                  className="bg-[#121212] border border-[#1a1a1a] p-4 flex flex-col justify-between aspect-square group hover:border-[#ff6b00] transition-colors cursor-pointer"
                >
                  <span className="text-[9px] text-[#444444] tracking-widest font-bold block">
                    SLOT 0{num}
                  </span>
                  <div className="text-center my-auto">
                    <span className="text-xs text-[#888888] tracking-widest uppercase block group-hover:text-white transition-colors">
                      + Select Dig
                    </span>
                  </div>
                  <span className="text-[9px] text-[#444444] tracking-widest text-right block group-hover:text-[#ff6b00] transition-colors">
                    SEARCH ↗
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-[#444444] tracking-widest mt-3 uppercase">
              * アーカイブ済みのDIG（レビュー）から検索して固定します
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-8 border-t border-[#1a1a1a]">
            <button 
              type="submit" 
              className="w-full md:w-auto bg-[#ff6b00] text-black font-black text-xs tracking-[0.3em] uppercase px-12 py-4 hover:bg-white transition-colors"
            >
              UPDATE IDENTITY
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditPage;