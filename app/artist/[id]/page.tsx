// useEffectの部分を以下に差し替え
useEffect(() => {
  const fetchArtistData = async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      // 1. iTunesからアーティスト情報を取得
      const res = await fetch(`/api/artist-details?id=${id}`);
      const data = await res.json();
      
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to load artist");
      } else {
        setArtist(data.artist);
        setAlbums(data.albums);

        // 2. 【ここが修正ポイント】localStorage ではなく Supabase から自分のディグを読み込む
        const { data: cloudReviews, error: dbError } = await supabase
          .from('reviews')
          .select('*')
          .eq('artist_id', String(id))
          .order('score', { ascending: false }); // スコア順に並べる

        if (cloudReviews) {
          setMyRankings(cloudReviews);
        } else if (dbError) {
          console.error("DB読み込み失敗:", dbError);
        }
      }
    } catch (e) {
      setErrorMsg("Network Error. Please try again.");
    }
    setIsLoading(false);
  };
  fetchArtistData();
}, [id]);