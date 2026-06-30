"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SidebarMenu from '@/components/SidebarMenu';

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  const [profile, setProfile] = useState<any>({
    username: "UNNAMED",
    genres: [],
    artists: [],
    trinity: [null, null, null],
    avatar_url: null 
  });

  // --- 追加: フォロー機能のためのState ---
  const [followers, setFollowers] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [targetProfileId, setTargetProfileId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      setCurrentUserId(user.id);

      // URLに ?id=xxx があればその人のプロフィールを表示、なければ自分のプロフィール
      const searchParams = new URLSearchParams(window.location.search);
      const urlId = searchParams.get('id');
      const viewId = urlId || user.id;
      setTargetProfileId(viewId);

      try {
        // プロフィールデータの取得
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', viewId)
          .single();

        if (data) {
          setProfile({
            username: data.username || "UNNAMED",
            genres: data.genres || [],
            artists: data.artists || [],
            trinity: data.trinity && data.trinity.length === 3 ? data.trinity : [null, null, null],
            avatar_url: data.avatar_url || null
          });
        }

        // フォロワー数の取得
        const { count: fCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', viewId);
        setFollowers(fCount || 0);

        // フォロー数の取得
        const { count: fwCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', viewId);
        setFollowingCount(fwCount || 0);

        // 他人のプロフィールの場合は、自分がフォローしているか確認
        if (viewId !== user.id) {
          const { data: followData } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', user.id)
            .eq('following_id', viewId)
            .single();
          if (followData) setIsFollowing(true);
        }

      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // フォロー / アンフォローの切り替え処理
  const handleToggleFollow = async () => {
    if (!currentUserId || !targetProfileId) return;

    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetProfileId);
      setIsFollowing(false);
      setFollowers(prev => prev - 1);
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, following_id: targetProfileId });
      setIsFollowing(true);
      setFollowers(prev => prev + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center text-[#ff6b00] font-black italic animate-pulse tracking-widest text-xs uppercase">
        SYNCING IDENTITY...
      </div>
    );
  }

  // 今見ているのが「自分のプロフィール」かどうかを判定
  const isMyProfile = currentUserId === targetProfileId;

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-[#ff6b00]">
      <div className="max-w-4xl mx-auto pt-16 px-6">
        <Link href="/" className="inline-block text-[#444444] hover:text-[#ff6b00] text-[10px] font-bold tracking-widest uppercase mb-12 transition-colors">
          ← BACK TO HOME
        </Link>
        <div className="flex flex-col items-center md:items-start md:flex-row gap-8 mb-16">
          
          <div className="relative w-32 h-32 md:w-40 md:h-40 border border-[#1a1a1a] rounded-full overflow-hidden bg-[#121212]">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#444444]">
                <span className="text-xs uppercase tracking-widest">No Image</span>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center text-center md:text-left flex-grow w-full overflow-hidden">
            <div className="flex items-baseline justify-center md:justify-start gap-4">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2 uppercase truncate max-w-full">
                {profile.username}.
              </h1>
              
              {/* 自分のページなら「Edit」、他人のページなら「Follow」を表示 */}
              {isMyProfile ? (
                <Link 
                  href="/profile/edit" 
                  className="text-[9px] font-bold tracking-[0.2em] text-[#444444] border border-[#1a1a1a] px-2 py-1 hover:text-[#ff6b00] hover:border-[#ff6b00] transition-all uppercase mb-2 flex-shrink-0"
                >
                  Edit
                </Link>
              ) : (
                <button 
                  onClick={handleToggleFollow}
                  className={`text-[9px] font-bold tracking-[0.2em] border px-2 py-1 transition-all uppercase mb-2 flex-shrink-0 ${
                    isFollowing 
                      ? 'text-black bg-[#ff6b00] border-[#ff6b00]' 
                      : 'text-[#ff6b00] border-[#ff6b00] hover:bg-[#ff6b00] hover:text-black'
                  }`}
                >
                  {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
                </button>
              )}
            </div>
            
            <p className="text-[#ff6b00] text-sm md:text-base font-bold tracking-[0.3em] uppercase">
              Collector // Digger
            </p>

            {/* --- 追加: フォロワー・フォロー数の表示エリア --- */}
            <div className="flex items-center justify-center md:justify-start gap-6 mt-4">
              <div className="flex flex-col items-center md:items-start">
                <span className="text-xl md:text-2xl font-black text-white leading-none">{followers}</span>
                <span className="text-[8px] text-[#444444] font-bold tracking-[0.2em] uppercase mt-1">Followers</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span className="text-xl md:text-2xl font-black text-white leading-none">{followingCount}</span>
                <span className="text-[8px] text-[#444444] font-bold tracking-[0.2em] uppercase mt-1">Following</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <section>
            <h3 className="text-[#444444] text-[10px] font-bold tracking-[0.2em] uppercase mb-4 border-b border-[#1a1a1a] pb-2">
              Favorite Genres
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.genres.length > 0 ? (
                profile.genres.map((genre: string) => (
                  <span key={genre} className="text-xs font-medium tracking-widest text-[#888888] bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-1">
                    {genre}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#444444] tracking-widest uppercase italic">No genres assigned</span>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-[#444444] text-[10px] font-bold tracking-[0.2em] uppercase mb-4 border-b border-[#1a1a1a] pb-2">
              Core Artists
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.artists.length > 0 ? (
                profile.artists.map((artist: string) => (
                  <span key={artist} className="text-xs font-medium tracking-widest text-[#888888] bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-1">
                    {artist}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#444444] tracking-widest uppercase italic">No artists assigned</span>
              )}
            </div>
          </section>
        </div>

        <section className="mb-24">
          <h3 className="text-[#ff6b00] text-[10px] font-bold tracking-[0.4em] uppercase mb-8 text-center">
            — THE HOLY TRINITY —
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map((index) => {
              const album = profile.trinity[index];
              return (
                <div key={index} className="group relative text-left">
                  <div className="aspect-square w-full relative bg-[#121212] border border-[#1a1a1a] overflow-hidden group-hover:border-[#ff6b00] transition-all duration-500">
                    {album && album.cover ? (
                      <img src={album.cover} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#222222]">
                        <span className="text-[10px] tracking-[0.5em] uppercase font-bold">Empty Slot</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 opacity-80">
                    <h4 className="text-[11px] font-black tracking-widest uppercase truncate text-white">
                      {album ? album.title : `SLOT 0${index + 1}`}
                    </h4>
                    <p className="text-[9px] text-[#888888] tracking-widest uppercase truncate">
                      {album ? album.artist : "UNASSIGNED"}
                    </p>
                  </div>
                </div>
              );
            })}
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
}