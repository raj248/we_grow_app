import { Order } from '~/types/entities';

export const fetchVideoDetails = async (url: string) => {
  try {
    if (!url?.includes('youtube.com') && !url?.includes('youtu.be')) {
      return {
        videoTitle: 'Invalid YouTube URL',
        videoThumbnail: 'https://via.placeholder.com/320x180?text=Invalid+URL',
      };
    }
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
      );
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      return { videoTitle: data.title, videoThumbnail: data.thumbnail_url };
    } catch {
      return {
        videoTitle: 'Failed to fetch title',
        videoThumbnail: 'https://via.placeholder.com/320x180?text=Error',
      };
    }
  } catch (e) {
    console.error(e);
    return {
      videoTitle: 'Error',
      videoThumbnail: 'https://via.placeholder.com/320x180?text=Error',
    };
  }
};

export const fetchMultipleVideoDetails = async (orders: Order[]) => {
  if (!orders || orders.length === 0) return [];
  try {
    return await Promise.all(
      orders.map(async (order) => {
        const url = order.url;
        if (!url?.includes('youtube.com') && !url?.includes('youtu.be')) {
          return {
            ...order,
            videoTitle: 'Invalid YouTube URL',
            videoThumbnail: 'https://via.placeholder.com/320x180?text=Invalid+URL',
          };
        }
        try {
          const res = await fetch(
            `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
          );
          if (!res.ok) throw new Error('Failed to fetch');
          const data = await res.json();
          return { ...order, videoTitle: data.title, videoThumbnail: data.thumbnail_url };
        } catch {
          return {
            ...order,
            videoTitle: 'Failed to fetch title',
            videoThumbnail: 'https://via.placeholder.com/320x180?text=Error',
          };
        }
      })
    );
  } catch (e) {
    console.error(e);
    return orders;
  }
};

// Requires setting YOUTUBE_API_KEY in environment
const API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;
export const fetchVideoDetailsYoutube = async (url: string) => {
  console.log('API_KEY: ', API_KEY);
  if (!url?.includes('youtube.com') && !url?.includes('youtu.be')) {
    return {
      videoTitle: 'Invalid YouTube URL',
      videoThumbnail: 'https://via.placeholder.com/320x180?text=Invalid+URL',
      viewCount: null,
      likeCount: null,
    };
  }

  try {
    // First, fetch oEmbed for title and thumbnail
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    );
    if (!oembedRes.ok) throw new Error('oEmbed fetch failed');
    const oembed = await oembedRes.json();

    // Extract video ID from URL
    const videoIdMatch = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    const videoId = videoIdMatch?.[1];
    if (!videoId) throw new Error('Can’t parse video ID');

    // Fetch statistics
    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${API_KEY}`
    );
    if (!statsRes.ok) throw new Error('Stats fetch failed');
    const statsJson = await statsRes.json();
    const stats = statsJson.items?.[0]?.statistics;

    return {
      videoTitle: oembed.title,
      videoThumbnail: oembed.thumbnail_url,
      viewCount: stats?.viewCount ?? null,
      likeCount: stats?.likeCount ?? null,
    };
  } catch (error) {
    console.error(error);
    return {
      videoTitle: 'Error fetching video',
      videoThumbnail: 'https://via.placeholder.com/320x180?text=Error',
      viewCount: null,
      likeCount: null,
    };
  }
};
