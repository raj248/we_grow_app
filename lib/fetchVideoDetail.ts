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
