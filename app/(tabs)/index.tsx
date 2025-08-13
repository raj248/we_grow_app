import { View, FlatList, ActivityIndicator, RefreshControl, Pressable } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import React, { useEffect, useState, useCallback } from 'react';
import { getOrCreateUserId } from '~/utils/device-info';
import { ProgressBar } from 'react-native-paper';
import { useTrackActiveUser } from '~/lib/useTrackActiveUser';
import { fetchWalletBalance } from '~/lib/api/api';
import { useFocusEffect } from '@react-navigation/native';
import { useUserStore } from '~/stores/useUserStore';
import BoostViewBottomSheet from '~/components/BottomSheets/BoostViewBottomSheet';
import PromoteShortsBottomSheet from '~/components/BottomSheets/PromoteShortsBottomSheet';
import GetSubscribersBottomSheet from '~/components/BottomSheets/GetSubscribersBottomSheet';

const features = [
  { id: '1', title: 'Boost Views', description: 'Increase views on your videos using coins.', time: 150, count: 300 },
  { id: '2', title: 'Get Subscribers', description: 'Gain real engagement via smart distribution.', time: 150, count: 300 },
  { id: '3', title: 'Promote Shorts', description: 'Targeted exposure for YouTube Shorts.', time: 150, count: 300 },
];

export default function Home() {
  useTrackActiveUser();
  const [id, setId] = useState('Loading...');
  const [progress, setProgress] = useState(0.4);
  const [coins, setCoins] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [openBoostViewSheet, setOpenBoostViewSheet] = useState(() => () => { });
  const [openGetSubscribersSheet, setOpenGetSubscribersSheet] = useState(() => () => { });
  const [openPromotShortsSheet, setOpenPromotShortsSheet] = useState(() => () => { });
  const [openEarnSheet, setOpenEarnSheet] = useState(() => () => { });

  const loadData = useCallback(async () => {
    try {
      const userId = useUserStore.getState().userId || await getOrCreateUserId();
      setId(userId);
      const res = await fetchWalletBalance(userId);
      if (res.success && res.data) {
        setCoins(res.data.balance);
      }
    } catch (err) {
      setId(String(err));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  return (
    <View className="flex-1 p-4">
      <FlatList
        ListHeaderComponent={
          <>
            <Text variant="title1" className="text-center mb-2">Welcome to BoostHub</Text>

            <View className="bg-gray-100 p-4 rounded-xl mb-4">
              <Text className="text-sm font-semibold text-gray-700">Your User ID:</Text>
              <Text className="text-lg font-mono text-primary">{id}</Text>
            </View>

            <View className="bg-green-100 border border-green-300 rounded-xl p-4 mb-4">
              <Text className="font-semibold text-green-900">Your Coins</Text>
              {coins === null ? (
                <ActivityIndicator color="#10b981" />
              ) : (
                <Text className="text-xl font-bold text-green-800">{coins} Coins</Text>
              )}
            </View>

            <View className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 mb-4">
              <Text className="font-semibold text-yellow-900 mb-2">Pending Order</Text>
              <Text className="text-sm text-yellow-800 mb-1">Boosting "My Summer Vlog"... (Views)</Text>
              <ProgressBar
                progress={progress}
                color="#fbbf24"
                className="h-2 rounded-full"
              />
              <Text className="text-right text-xs text-yellow-700 mt-1">{Math.floor(progress * 100)}%</Text>
            </View>

            <Text className="text-lg font-semibold mb-2">What you can do:</Text>

            <Pressable
              className="shadow-md bg-white rounded-xl p-4 mb-3"
              onPress={() => {
                console.log(`Earning Money`)
              }}
            >
              <Text className="font-bold text-base">Watch And Earn</Text>
              <Text className="text-sm text-gray-600">Watch videos, reels and subscribe to channels to earn coins.</Text>
            </Pressable>
          </>
        }
        data={features}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => {
          const openSheetMap: Record<string, () => void> = {
            '1': openBoostViewSheet,
            '2': openGetSubscribersSheet,
            '3': openPromotShortsSheet,
            '4': openEarnSheet,
          };

          return (
            <Pressable
              className="shadow-md bg-white rounded-xl p-4 mb-3"
              onPress={() => {
                const openSheet = openSheetMap[item.id];
                console.log('Opening sheet:', openSheet)
                if (openSheet) openSheet();
              }}
            >
              <Text className="font-bold text-base">{item.title}</Text>
              <Text className="text-sm text-gray-600">{item.description}</Text>
            </Pressable>
          );
        }}
      />
      <BoostViewBottomSheet setOpenSheet={setOpenBoostViewSheet} />
      <GetSubscribersBottomSheet setOpenSheet={setOpenGetSubscribersSheet} />
      <PromoteShortsBottomSheet setOpenSheet={setOpenPromotShortsSheet} />
    </View>
  );
}
