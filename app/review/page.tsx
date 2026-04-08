// ReviewContent 内の useEffect をこれに差し替え
useEffect(() => {
  const fetchAlbumDetails = async () => {
    if (!autoAlbumId || selectedAlbum) return;
    
    setIsLoading(true);
    try {
      // さっき作った iTunes 用の API を叩く
      const res = await fetch(`/api/album-details?id=${autoAlbumId}`);
      const data = await res.json();
      
      if (res.ok) {
        // 評価画面に必要なデータをセット
        setSelectedAlbum({
          id: data.id,
          title: data.name,
          artist: data.artistName,
          image: data.image,
          tracks: data.tracks,
          artistId: data.artistId
        });
      }
    } catch (e) {
      console.error("自動読み込み失敗:", e);
    }
    setIsLoading(false);
  };

  fetchAlbumDetails();
}, [autoAlbumId]);