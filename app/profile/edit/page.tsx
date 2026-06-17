"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const AVAILABLE_GENRES = [
  "BOOM BAP", "JAZZ RAP", "TRAP", "PHONK", 
  "AMBIENT", "R&B", "SOUL", "ELECTRONIC", 
  "J-HIP HOP", "ROCK"
];

export default function ProfileEditPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // フォーム状態
  const [accountName, setAccountName] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [artists, setArtists] = useState<string[]>([]);
  const [trinity, setTrinity] = useState<(any | null)>([null, null, null]);
  
  // --- アイコン画像用の状態 ---
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // DBに保存されているURL
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // 選択されたファイル
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null); // 画面表示用のプレビュー

  const [artistQuery, setArtistQuery] = useState("");
  const [artistResults, setArtistResults] = useState<any[]>([]);
  const [isSearchingArtist, setIsSearchingArtist] = useState(false);

  const [albumQuery, setAlbumQuery] = useState("");
  const [albumResults, setAlbumResults] = useState<any[]>([]);
  const [isSearchingAlbum, setIsSearchingAlbum] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsFetching(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setAccountName(data.username || "");
          setSelectedGenres(data.genres || []);
          setArtists(data.artists || []);
          setTrinity(data.trinity || [null, null, null]);
          setAvatarUrl(data.avatar_url || null); // アイコンURLを取得
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchProfile();
  }, [router]);

  // --- 画像選択時の処理 ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setAvatarFile(file);
    // 選択した画像をその場でプレビュー表示
    setAvatarPreview(URL.createObjectURL(file));
  };

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSearchArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistQuery) return;
    setIsSearchingArtist(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artistQuery)}&entity=musicArtist&limit=5&country=JP&lang=en_us`);
      const data = await res.json();
      setArtistResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingArtist(false);
    }
  };

  const addArtist = (artistName: string) => {
    const cleanName = artistName.toUpperCase();
    if (!artists.includes(cleanName)) {
      setArtists([...artists, cleanName]);
    }
    setArtistQuery("");
    setArtistResults([]);
  };

  const removeArtist = (artistName: string) => {
    setArtists(artists.filter(a => a !== artistName));
  };

  const handleSearchAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumQuery) return;
    setIsSearchingAlbum(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(albumQuery)}&entity=album&limit=6&country=JP&lang=en_us`);
      const data = await res.json();
      const formatted = data.results.map((item: any) => ({
        id: item.collectionId,
        title: item.collectionName,
        artist: item.artistName,
        cover: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : ''
      }));
      setAlbumResults(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingAlbum(false);
    }
  };

  const selectTrinityAlbum = (album: any) => {
    if (activeSlot === null) return;
    const newTrinity = [...trinity];
    newTrinity[activeSlot] = album;
    setTrinity(newTrinity);
    setAlbumQuery("");
    setAlbumResults([]);
    setActiveSlot(null);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let finalAvatarUrl = avatarUrl;

    // 画像が新しく選択されていたら、Storageへアップロード
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      // ファイル名はユーザーIDにして上書き保存されるようにする
      const filePath = `${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        console.error("Avatar upload failed:", uploadError);
        alert("画像のアップロードに失敗しました。");
        setIsLoading(false);
        return;
      }

      // アップロードした画像の公開URLを取得
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // キャッシュ対策としてタイムスタンプを付与
      finalAvatarUrl = `${publicUrlData.publicUrl}?t=${new Date().getTime()}`;
    }

    const profileData = {
      id: user.id,
      username: accountName.toUpperCase(),
      genres: selectedGenres,
      artists: artists,
      trinity: trinity,
      avatar_url: finalAvatarUrl, // 画像URLを保存
      updated_at: new Date(),
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(profileData);

    setIsLoading(false);
    if (!error) {
      router.push('/profile');
    } else {
      console.error("Save failed:", error);
      alert("保存に失敗しました。");
    }
  };

  if (isFetching) {
    return <div className="min-h-screen bg-[#000000] flex items-center justify-center text-[#ff6b00] font-black italic animate-pulse">LOADING IDENTITY...</div>;
  }

  // 表示する画像を決定（プレビュー優先、なければDBのURL）
  const displayImage = avatarPreview || avatarUrl;

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-[#ff6b00]">
      <div className="max-w-3xl mx-auto pt-16 px-6 pb-24">
        <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase mb-12 border-b border-[#1a1a1a] pb-4 text-[#888888]">
          Edit Identity <span className="text-[#ff6b00]">//</span>
        </h1>

        <div className="space-y-12">
          
          {/* 1. Avatar / Icon Image */}
          <div>
            <label className="block text-[#444444] text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
              Icon Image
            </label>
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 bg-[#121212] border border-[#1a1a1a] rounded-full flex items-center justify-center overflow-hidden">
                {displayImage ? (
                  <img src={displayImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[9px] text-[#444444] uppercase tracking-widest">Select</span>
                )}
              </div>
              
              {/* input type="file" はスマホで開くと自動でカメラかアルバムの選択肢が出る */}
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="text-xs text-[#888888] file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-medium file:bg-[#121212] file:text-[#ff6b00] hover:file:bg-[#1a1a1a] cursor-pointer transition-colors"
              />
            </div>
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-[#444444] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
              Account Name
            </label>
            <input 
              type="text" 
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="NAME"
              className="w-full bg-[#121212] border border-[#1a1a1a] px-4 py-3 text-white placeholder-[#444444] text-sm tracking-widest uppercase focus:outline-none focus:border-[#ff6b00] transition-colors"
            />
          </div>

          {/* Favorite Genres */}
          <div>
            <label className="block text-[#444444] text-[10px] font-bold tracking-[0.2em] uppercase mb-3">
              Favorite Genres <span className="text-[#888888]">(Tap to select)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_GENRES.map((genre) => {
                const isSelected = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`text-xs font-medium tracking-widest px-3 py-2 border transition-all ${
                      isSelected 
                        ? 'bg-[#ff6b00] border-[#ff6b00] text-black font-bold' 
                        : 'bg-[#121212] border-[#1a1a1a] text-[#888888] hover:border-[#444444]'
                    }`}
                  >
                    {genre} {isSelected ? '✓' : '+'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Artists */}
          <div>
            <label className="block text-[#444444] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
              Core Artists <span className="text-[#888888]">(Search & Add)</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {artists.map((artist) => (
                <span key={artist} className="bg-[#121212] border border-[#ff6b00] text-white text-xs px-3 py-1 flex items-center gap-2">
                  {artist}
                  <button onClick={() => removeArtist(artist)} className="text-[#ff6b00] hover:text-white font-bold">×</button>
                </span>
              ))}
            </div>
            <form onSubmit={handleSearchArtist} className="flex gap-2">
              <input 
                type="text" 
                value={artistQuery}
                onChange={(e) => setArtistQuery(e.target.value)}
                placeholder="SEARCH ARTIST..."
                className="flex-grow bg-[#121212] border border-[#1a1a1a] px-4 py-3 text-white placeholder-[#444444] text-xs tracking-widest uppercase focus:outline-none focus:border-[#ff6b00] transition-colors"
              />
              <button type="submit" className="bg-[#1a1a1a] hover:bg-[#ff6b00] hover:text-black text-[#888888] px-6 text-xs font-bold tracking-widest uppercase transition-colors">
                {isSearchingArtist ? '...' : 'FIND'}
              </button>
            </form>
            {artistResults.length > 0 && (
              <div className="mt-2 border border-[#1a1a1a] bg-[#121212] divide-y divide-[#1a1a1a]">
                {artistResults.map((item) => (
                  <div key={item.artistId} className="p-3 flex justify-between items-center hover:bg-[#1a1a1a] transition-colors">
                    <span className="text-xs text-white tracking-wider uppercase">{item.artistName}</span>
                    <button 
                      type="button" 
                      onClick={() => addArtist(item.artistName)}
                      className="text-[10px] bg-[#ff6b00] text-black font-bold px-3 py-1 uppercase tracking-widest"
                    >
                      + ADD
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* The Trinity Selection */}
          <div>
            <label className="block text-[#ff6b00] text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
              The Holy Trinity <span className="text-[#888888]">(Tap slot to assign)</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[0, 1, 2].map((index) => {
                const album = trinity[index];
                const isActive = activeSlot === index;
                return (
                  <div 
                    key={index}
                    onClick={() => setActiveSlot(isActive ? null : index)}
                    className={`bg-[#121212] border p-4 flex flex-col justify-between aspect-square group cursor-pointer transition-all ${
                      isActive ? 'border-[#ff6b00] ring-1 ring-[#ff6b00]' : 'border-[#1a1a1a] hover:border-[#444444]'
                    }`}
                  >
                    <span className="text-[9px] text-[#444444] tracking-widest font-bold block">
                      SLOT 0{index + 1} {isActive && <span className="text-[#ff6b00]">// ACTIVE</span>}
                    </span>
                    {album ? (
                      <div className="text-center my-auto">
                        <img src={album.cover} alt="" className="w-20 h-20 mx-auto object-cover mb-2 border border-[#333]" />
                        <span className="text-[10px] font-black text-white tracking-widest uppercase block truncate">{album.title}</span>
                        <span className="text-[8px] text-[#888888] tracking-widest uppercase block truncate">{album.artist}</span>
                      </div>
                    ) : (
                      <div className="text-center my-auto">
                        <span className="text-xs text-[#888888] tracking-widest uppercase block group-hover:text-white transition-colors">
                          + Empty Slot
                        </span>
                      </div>
                    )}
                    <span className="text-[9px] text-[#444444] tracking-widest text-right block group-hover:text-[#ff6b00] transition-colors">
                      {album ? 'CHANGE ↗' : 'ASSIGN ↗'}
                    </span>
                  </div>
                );
              })}
            </div>
            {activeSlot !== null && (
              <div className="p-4 bg-[#121212] border border-[#ff6b00]">
                <span className="text-[9px] text-[#ff6b00] font-bold tracking-widest block mb-2 uppercase">
                  Searching for Slot 0{activeSlot + 1}...
                </span>
                <form onSubmit={handleSearchAlbum} className="flex gap-2">
                  <input 
                    type="text" 
                    value={albumQuery}
                    onChange={(e) => setAlbumQuery(e.target.value)}
                    placeholder="ALBUM TITLE..."
                    className="flex-grow bg-[#0a0a0a] border border-[#1a1a1a] px-4 py-2 text-white placeholder-[#444444] text-xs tracking-widest uppercase focus:outline-none focus:border-[#ff6b00]"
                  />
                  <button type="submit" className="bg-[#ff6b00] text-black px-5 text-xs font-bold tracking-widest uppercase">
                    {isSearchingAlbum ? '...' : 'SEARCH'}
                  </button>
                </form>
                {albumResults.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1">
                    {albumResults.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => selectTrinityAlbum(item)}
                        className="p-2 bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#ff6b00] cursor-pointer transition-colors text-left"
                      >
                        <img src={item.cover} alt="" className="w-full aspect-square object-cover mb-1" />
                        <div className="text-[9px] font-bold text-white uppercase truncate">{item.title}</div>
                        <div className="text-[7px] text-[#888888] uppercase truncate">{item.artist}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-8 border-t border-[#1a1a1a]">
            <button 
              type="button" 
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="w-full md:w-auto bg-[#ff6b00] text-black font-black text-xs tracking-[0.3em] uppercase px-12 py-4 hover:bg-white transition-colors disabled:opacity-50"
            >
              {isLoading ? 'SAVING...' : 'UPDATE IDENTITY'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}