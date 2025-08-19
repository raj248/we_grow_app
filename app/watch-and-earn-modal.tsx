import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Text } from '~/components/nativewindui/Text';
import { fetchRandomVideo, watchAndEarn } from '~/lib/api/earn';
import { useUserStore } from '~/stores/useUserStore';
import { Order, randomVideo } from '~/types/entities';
import { getStoredUserId } from '~/utils/device-info';
import { Image, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '~/components/Button';
import { Divider } from 'react-native-paper';
import { router } from 'expo-router';

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
  const [enrichedOrder, setEnrichedOrder] = useState<randomVideo>({
    url: '',
    reward: 0,
    duration: 0,
    videoTitle: '',
    videoThumbnail: 'https://placehold.co/320x180?text=Play+Video+Here',
    token: '',
  });

  const loadVideo = async () => {
    setRefreshing(true);
    try {
      const userId = await getStoredUserId();
      if (!userId || !useUserStore.getState().userId) return;

      const order = await fetchRandomVideo(useUserStore.getState().userId || userId);
      if (!order.success || !order.data) {
        Toast.show({ text1: 'Failed to fetch random video', text2: order.error, type: 'error' });
        setRefreshing(false);
        return;
      }

      const videoDetails = await fetchVideoDetails(order.data.url);
      setEnrichedOrder({ ...order.data, ...videoDetails });
    } catch (err) {
      console.error(err);
      Toast.show({ text1: 'Error', text2: 'Unable to load video', type: 'error' });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadVideo();
  }, []);

  return (
    <SafeAreaView>
      {/* Video Card */}
      <TouchableOpacity
        style={{
          borderRadius: 10,
          marginVertical: 8,
          marginHorizontal: 16,
          elevation: 5,
          overflow: 'hidden',
        }}
        onPress={() => {
          enrichedOrder && watchAndEarn(enrichedOrder);
          router.back();
        }}>
        <View>
          <Image
            source={{ uri: enrichedOrder?.videoThumbnail }}
            style={{ width: '100%', height: 180 }}
            resizeMode="cover"
          />
          <View
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: [{ translateX: -24 }, { translateY: -24 }],
            }}>
            <Ionicons name="play-circle" size={48} color="white" />
          </View>
        </View>
      </TouchableOpacity>

      {/* Video Info */}
      <View style={{ padding: 12 }}>
        <Text className="text-center" style={{ fontSize: 16, fontWeight: '600' }}>
          {enrichedOrder?.videoTitle ?? 'Untitled Video'}
        </Text>
        <Text variant={'callout'} className="text-center" style={{ fontSize: 14, marginTop: 4 }}>
          Earn {enrichedOrder?.reward ?? 'NA'} Coins 🪙 in {enrichedOrder?.duration ?? 'NA'} seconds
        </Text>
      </View>

      {/* Refresh Button */}
      <Button
        style={{
          backgroundColor: '#007bff',
          width: '60%',
          alignSelf: 'center',
          marginVertical: 16,
        }}
        title={refreshing ? 'Loading...' : 'Reload Video'}
        disabled={refreshing}
        onPress={loadVideo}
      />

      <Divider horizontalInset bold className="mb-4 mt-4" />
      <Text variant={'heading'} className="text-center">
        Don't Want to Watch? Top-up Coins NOW!
      </Text>
      <Button
        style={{ backgroundColor: 'green', width: '80%', alignSelf: 'center' }}
        title="Get 10000+ COINS 🪙 !!"
        onPress={() => {
          router.replace('/top-up');
        }}
      />
    </SafeAreaView>
  );
}
