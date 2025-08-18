import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Text } from '~/components/nativewindui/Text';
import { fetchRandomVideo } from '~/lib/api/earn';
import { useUserStore } from '~/stores/useUserStore';
import { Order } from '~/types/entities';
import { getStoredUserId } from '~/utils/device-info';
import { Image, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const fetchVideoDetails = async (url: string) => {
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

export default function Modal() {
  const [refreshing, setRefreshing] = useState(false);
  const [enrichedOrder, setEnrichedOrder] = useState<Order>();
  useEffect(() => {
    const loadVideo = async () => {
      setRefreshing(true);
      const userId = await getStoredUserId();
      if (!userId || userId === '' || !useUserStore.getState().userId) return;
      const order = await fetchRandomVideo(useUserStore.getState().userId || userId);
      if (!order.success || !order.data) {
        Toast.show({ text1: 'Failed to fetch random video', text2: order.error, type: 'error' });
        setRefreshing(false);
        return;
      }
      const videoDetails = await fetchVideoDetails(order.data.url);
      setEnrichedOrder({ ...order.data, ...videoDetails } as Order);
      setRefreshing(false);
    };
    loadVideo();
  }, []);

  return (
    <SafeAreaView>
      <Text>{enrichedOrder?.token}</Text>
      <Text>{enrichedOrder?.videoTitle}</Text>
      <TouchableOpacity
        style={{
          borderRadius: 10,
          marginVertical: 8,
          marginHorizontal: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          overflow: 'hidden',
        }}
        // onPress={() => router.push({ pathname: '../_(test)/videoplayer', params: { url: video.url, title: video.title ?? '' } })}
      >
        {enrichedOrder?.videoThumbnail && (
          <View>
            <Image
              source={{ uri: enrichedOrder?.videoThumbnail }}
              style={{ width: '100%', height: 180 }}
              resizeMode="cover"
            />
            {/* Play Icon Overlay */}
            <View
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: [{ translateX: -20 }, { translateY: -20 }],
              }}>
              <Ionicons name="play-circle" size={48} color="white" />
            </View>
          </View>
        )}
        <View style={{ padding: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>
            {enrichedOrder?.videoTitle ?? 'Untitled Video'}
          </Text>
          <Text style={{ fontSize: 12, marginTop: 4 }}>Tap to play on embedded player</Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
