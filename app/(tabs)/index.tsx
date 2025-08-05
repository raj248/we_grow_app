import { View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import React, { useEffect, useState, useCallback } from 'react';
import { getOrCreateUserId } from '~/utils/device-info';
import { ProgressBar } from 'react-native-paper';
import { useTrackActiveUser } from '~/lib/useTrackActiveUser';
import { fetchWalletBalance } from '~/lib/api';
import { useFocusEffect } from '@react-navigation/native';
import { useUserStore } from '~/stores/useUserStore';

const features = [
  { id: '1', title: 'Boost Views', description: 'Increase views on your videos using coins.' },
  { id: '2', title: 'Get Subscribers', description: 'Gain real engagement via smart distribution.' },
  { id: '3', title: 'Promote Shorts', description: 'Targeted exposure for YouTube Shorts.' },
];

export default function Home() {
  useTrackActiveUser();
  const [id, setId] = useState('Loading...');
  const [progress, setProgress] = useState(0.4);
  const [coins, setCoins] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
          </>
        }
        data={features}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View className="shadow-md bg-white rounded-xl p-4 mb-3">
            <Text className="font-bold text-base">{item.title}</Text>
            <Text className="text-sm text-gray-600">{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
}
