import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Text } from '~/components/nativewindui/Text';
import { fetchRandomVideo, watchAndEarn } from '~/lib/api/earn';
import { useUserStore } from '~/stores/useUserStore';
import { Order, randomVideo } from '~/types/entities';
import { getStoredUserId } from '~/utils/device-info';
import { Alert, Image, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '~/components/Button';
import { Divider } from 'react-native-paper';
import { router, Stack, useFocusEffect } from 'expo-router';
import { fetchVideoDetails } from '~/lib/fetchVideoDetail';
import displayOverApp from '~/modules/display-over-app';

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

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const hasAcc = await displayOverApp.hasAccessibilityPermission();
          if (!hasAcc) {
            Alert.alert(
              'Permission Required',
              'Accessibility Permission is required to detect YouTube activity and earn coins.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Grant Permission',
                  onPress: () => displayOverApp.requestAccessibilityPermission(),
                },
              ],
              { cancelable: false }
            );
          }
        } catch (err) {
          console.error(err);
        }
      })();
    }, [])
  );

  // 2️⃣ Overlay Permission
  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const hasOverlay = await displayOverApp.hasOverlayPermission();
          if (!hasOverlay) {
            Alert.alert(
              'Permission Required',
              'Display Over Other Apps Permission is required to detect YouTube activity and earn coins.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Grant Permission',
                  onPress: () => displayOverApp.requestOverlayPermission(),
                },
              ],
              { cancelable: false }
            );
          }
        } catch (err) {
          console.error(err);
        }
      })();
    }, [])
  );
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView className="flex-1 " edges={['left', 'right', 'bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          contentStyle: {
            paddingTop: insets.top,
          },
        }}
      />
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
          router.dismissAll();
        }}>
        <View>
          <Image
            source={{ uri: enrichedOrder?.videoThumbnail }}
            style={{ width: '100%', height: 280 }}
            resizeMode="cover"
          />
          <View
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: [{ translateX: -34 }, { translateY: -34 }],
            }}>
            <Ionicons name="play-circle" size={68} color="red" />
          </View>
        </View>
      </TouchableOpacity>

      {/* Video Info */}
      {/* <View style={{ padding: 12 }}>
        <Text className="text-center" style={{ fontSize: 16, fontWeight: '600' }}>
          {enrichedOrder?.videoTitle ?? 'Untitled Video'}
        </Text>
        <Text variant={'callout'} className="text-center" style={{ fontSize: 14, marginTop: 4 }}>
          Earn {enrichedOrder?.reward ?? 'NA'} Coins 🪙 in {enrichedOrder?.duration ?? 'NA'} seconds
        </Text>
      </View> */}

      {/* Refresh Button */}
      <View className="mt-4 flex-row justify-evenly ">
        <Button
          style={{
            backgroundColor: '#27A84A',
            width: '45%',
            alignSelf: 'center',
          }}
          title={refreshing ? 'Loading...' : 'Watch Now'}
          disabled={refreshing}
          onPress={() => {
            enrichedOrder && watchAndEarn(enrichedOrder);
            router.dismissAll();
          }}
        />
        <Button
          style={{
            backgroundColor: '#FE0000',
            width: '45%',
            alignSelf: 'center',
          }}
          title={refreshing ? 'Loading...' : 'Next Video'}
          disabled={refreshing}
          onPress={loadVideo}
        />
      </View>

      {/* <Divider horizontalInset bold className="mb-4 mt-4" />
      <Text variant={'heading'} className="text-center">
        Don't Want to Watch? Top-up Coins NOW!
      </Text>
      <Button
        style={{ backgroundColor: 'green', width: '80%', alignSelf: 'center' }}
        title="Get 10000+ COINS 🪙 !!"
        onPress={() => {
          router.replace('/top-up');
        }}
      /> */}
    </SafeAreaView>
  );
}
